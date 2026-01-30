import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Scene {
    sceneNumber: number;
    duration: string;
    visualDescription: string;
    voiceover: string;
    suggestedVisuals?: string;
    cameraMovement?: string;
}

interface SceneResult {
    sceneNumber: number;
    videoUrl: string;
    thumbnailUrl?: string;
    duration: string;
    status: 'completed' | 'failed';
    error?: string;
}

// Language code to full name mapping for audio prompt
const LANGUAGE_NAMES: Record<string, string> = {
    en: 'English',
    es: 'Spanish',
    ja: 'Japanese',
    ko: 'Korean',
    zh: 'Mandarin Chinese',
    pt: 'Portuguese',
    id: 'Indonesian'
};

// Camera movement prompt modifiers
const CAMERA_PROMPTS: Record<string, string> = {
    auto: '',
    static: 'Static camera, no movement.',
    pan: 'Smooth horizontal panning camera movement.',
    zoom: 'Gradual zoom in camera movement.',
    dolly: 'Dolly push-in camera movement.',
    orbit: 'Orbiting camera movement around subject.',
    tracking: 'Tracking shot following the action.'
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) throw new Error('No authorization header');

        const token = authHeader.replace('Bearer ', '');
        const supabaseAuth = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? ''
        );

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token);
        if (userError || !user) throw new Error('Unauthorized');

        const { 
            campaignId, 
            script, 
            duration = "5", 
            aspectRatio = "16:9",
            language = "en",
            cameraMovement = "auto"
        } = await req.json();

        console.log(`Starting batch scene generation for ${script.scenes?.length || 0} scenes`);

        if (!campaignId || !script?.scenes?.length) {
            throw new Error('Campaign ID and script with scenes required');
        }

        // Fetch campaign to verify ownership
        const { data: campaign, error: campaignError } = await supabase
            .from('campaigns')
            .select('*')
            .eq('id', campaignId)
            .eq('user_id', user.id)
            .single();

        if (campaignError || !campaign) {
            throw new Error('Campaign not found or access denied');
        }

        const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN');
        if (!REPLICATE_API_TOKEN) throw new Error('REPLICATE_API_TOKEN not configured');

        const scenes: Scene[] = script.scenes;
        const results: SceneResult[] = [];
        const languageName = LANGUAGE_NAMES[language] || 'English';
        const cameraPromptSuffix = CAMERA_PROMPTS[cameraMovement] || '';

        // Initialize progress tracking in database
        const initialProgress = {
            current: 0,
            total: scenes.length,
            completed: [] as number[],
            failed: [] as number[],
            status: 'processing',
            startedAt: new Date().toISOString()
        };
        
        await supabase
            .from('campaigns')
            .update({ generation_progress: initialProgress })
            .eq('id', campaignId);

        console.log('Initialized generation progress tracking');

        // Process scenes sequentially to avoid rate limits
        for (let i = 0; i < scenes.length; i++) {
            const scene = scenes[i];
            console.log(`Processing scene ${scene.sceneNumber} (${i + 1}/${scenes.length})`);
            
            // Update progress in database
            await supabase
                .from('campaigns')
                .update({ 
                    generation_progress: {
                        ...initialProgress,
                        current: i + 1,
                        currentSceneName: scene.visualDescription?.substring(0, 50) || `Scene ${scene.sceneNumber}`,
                        completed: results.filter(r => r.status === 'completed').map(r => r.sceneNumber),
                        failed: results.filter(r => r.status === 'failed').map(r => r.sceneNumber)
                    }
                })
                .eq('id', campaignId);

            try {
                // Build visual prompt with camera movement
                const visualPrompt = `${scene.visualDescription}. ${scene.suggestedVisuals || ''}. ${cameraPromptSuffix} Style: ${campaign.creative_style || 'professional'}. High quality cinematic motion.`.trim();

                // Build audio prompt with language context
                const audioPrompt = scene.voiceover 
                    ? `[${languageName}] ${scene.voiceover}`
                    : '';

                console.log(`Scene ${scene.sceneNumber} - Visual: ${visualPrompt.substring(0, 100)}...`);
                console.log(`Scene ${scene.sceneNumber} - Audio: ${audioPrompt.substring(0, 100)}...`);

                // Generate video using Seedance 1.5 Pro
                const createResponse = await fetch('https://api.replicate.com/v1/models/bytedance/seedance-1.5-pro/predictions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'wait'
                    },
                    body: JSON.stringify({
                        input: {
                            prompt: visualPrompt,
                            audio_prompt: audioPrompt,
                            duration: parseInt(duration) || 5,
                            aspect_ratio: aspectRatio
                        }
                    })
                });

                if (!createResponse.ok) {
                    const error = await createResponse.text();
                    console.error(`Scene ${scene.sceneNumber} API error:`, error);
                    throw new Error(`API error: ${error}`);
                }

                let prediction = await createResponse.json();
                console.log(`Scene ${scene.sceneNumber} prediction started:`, prediction.id);

                // Poll for completion
                while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
                        headers: { 'Authorization': `Bearer ${REPLICATE_API_TOKEN}` }
                    });
                    prediction = await pollResponse.json();
                    console.log(`Scene ${scene.sceneNumber} status:`, prediction.status);
                }

                if (prediction.status === 'failed') {
                    throw new Error(prediction.error || 'Video generation failed');
                }

                const videoUrl = prediction.output;
                if (!videoUrl) {
                    throw new Error('No video URL returned');
                }

                // Download and upload to Supabase Storage
                const videoResponse = await fetch(videoUrl);
                const videoBlob = await videoResponse.blob();
                const videoArrayBuffer = await videoBlob.arrayBuffer();

                const fileName = `${user.id}/${campaignId}/scene-${scene.sceneNumber}-${Date.now()}.mp4`;
                const { error: uploadError } = await supabase.storage
                    .from('ad-visuals')
                    .upload(fileName, videoArrayBuffer, {
                        contentType: 'video/mp4',
                        upsert: false
                    });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('ad-visuals')
                    .getPublicUrl(fileName);

                results.push({
                    sceneNumber: scene.sceneNumber,
                    videoUrl: publicUrl,
                    duration: scene.duration || `${duration}s`,
                    status: 'completed'
                });

                console.log(`Scene ${scene.sceneNumber} completed: ${publicUrl}`);

                // Brief delay between scenes to avoid rate limiting
                if (i < scenes.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }

            } catch (sceneError: any) {
                console.error(`Scene ${scene.sceneNumber} failed:`, sceneError);
                results.push({
                    sceneNumber: scene.sceneNumber,
                    videoUrl: '',
                    duration: scene.duration || `${duration}s`,
                    status: 'failed',
                    error: sceneError.message
                });
            }
        }

        // Update campaign storyboard with scene videos
        const currentStoryboard = campaign.storyboard as any || {};
        const updatedScenes = (currentStoryboard.scenes || script.scenes).map((s: any) => {
            const result = results.find(r => r.sceneNumber === s.sceneNumber);
            if (result && result.status === 'completed') {
                return {
                    ...s,
                    videoUrl: result.videoUrl,
                    generatedAt: new Date().toISOString()
                };
            }
            return s;
        });

        const updatedStoryboard = {
            ...currentStoryboard,
            scenes: updatedScenes,
            generationMode: 'scene-by-scene',
            lastBatchGeneration: new Date().toISOString()
        };

        // Clear progress and update storyboard with campaign title from script
        await supabase
            .from('campaigns')
            .update({ 
                storyboard: updatedStoryboard,
                title: script.title || 'Untitled Campaign',
                updated_at: new Date().toISOString(),
                generation_progress: {
                    current: scenes.length,
                    total: scenes.length,
                    completed: results.filter(r => r.status === 'completed').map(r => r.sceneNumber),
                    failed: results.filter(r => r.status === 'failed').map(r => r.sceneNumber),
                    status: 'completed',
                    completedAt: new Date().toISOString()
                }
            })
            .eq('id', campaignId);

        const completedCount = results.filter(r => r.status === 'completed').length;
        const failedCount = results.filter(r => r.status === 'failed').length;

        console.log(`Batch generation complete: ${completedCount} succeeded, ${failedCount} failed`);

        return new Response(
            JSON.stringify({
                success: true,
                sceneVideos: results,
                completedCount,
                failedCount,
                storyboard: updatedStoryboard
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );

    } catch (error: any) {
        console.error('Error in generate-scenes-batch:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
