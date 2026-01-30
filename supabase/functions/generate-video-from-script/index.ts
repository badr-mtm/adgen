import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

        const { campaignId, script, duration = "5", aspectRatio = "16:9", language = "en", cameraMovement = "auto" } = await req.json();
        
        if (!script) {
            throw new Error('Script is required');
        }

        console.log(`Generating video from script: "${script.title}"`);

        // Mark generation as in-progress so clients can resume polling on refresh
        await supabase
            .from('campaigns')
            .update({
                generation_progress: {
                    status: 'generating',
                    mode: 'full',
                    startedAt: Date.now()
                }
            })
            .eq('id', campaignId);

        const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN');
        if (!REPLICATE_API_TOKEN) throw new Error('REPLICATE_API_TOKEN not configured');
        
        // Log token format (first/last chars only for security)
        const tokenPreview = REPLICATE_API_TOKEN.length > 8 
            ? `${REPLICATE_API_TOKEN.substring(0, 4)}...${REPLICATE_API_TOKEN.substring(REPLICATE_API_TOKEN.length - 4)}`
            : '[too short]';
        console.log(`Token format check: length=${REPLICATE_API_TOKEN.length}, preview=${tokenPreview}`);

        // Map language codes to full names for better prompt understanding
        const languageMap: Record<string, string> = {
            'en': 'English',
            'es': 'Spanish',
            'ja': 'Japanese',
            'ko': 'Korean',
            'zh': 'Mandarin Chinese',
            'pt': 'Portuguese',
            'id': 'Indonesian'
        };
        
        // Map camera movement to prompt instructions
        const cameraInstructions: Record<string, string> = {
            'auto': '',
            'static': 'Static camera, no movement.',
            'pan': 'Slow horizontal pan across the scene.',
            'zoom': 'Gradual zoom in on the subject.',
            'dolly': 'Smooth dolly movement forward.',
            'orbit': 'Cinematic orbit around the subject.',
            'tracking': 'Camera tracking shot following the action.'
        };

        // Build visual prompt from the full script with camera movement
        const cameraInstruction = cameraInstructions[cameraMovement] || '';
        const visualPrompt = `${script.fullScript}. Style: professional TV commercial. High quality cinematic motion. Tone: ${script.tone || 'professional'}. ${cameraInstruction}`.trim();
        
        // Build voiceover script from scenes or use hook + cta
        const voiceoverScript = script.scenes 
            ? script.scenes.map((s: any) => s.voiceover).filter(Boolean).join(' ')
            : `${script.hook} ${script.cta}`;
        
        // Add language instruction to audio prompt
        const languageName = languageMap[language] || 'English';
        const audioPrompt = `[${languageName}] ${voiceoverScript}`;

        console.log(`Using Replicate bytedance/seedance-1.5-pro with prompt: ${visualPrompt.substring(0, 100)}...`);
        console.log(`Voiceover script (${languageName}): ${audioPrompt.substring(0, 100)}...`);
        console.log(`Camera movement: ${cameraMovement}`);

        // Start prediction on Replicate using bytedance/seedance-1.5-pro
        // This model generates video with synchronized audio/voiceover
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
            console.error('Replicate API error:', error);
            throw new Error(`Replicate API error: ${error}`);
        }

        let prediction = await createResponse.json();
        console.log('Prediction started:', prediction.id, 'Status:', prediction.status);

        // Poll for completion if not using Prefer: wait or if still processing
        while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
                headers: { 'Authorization': `Bearer ${REPLICATE_API_TOKEN}` }
            });
            prediction = await pollResponse.json();
            console.log('Polling status:', prediction.status);
        }

        if (prediction.status === 'failed') {
            throw new Error(`Video generation failed: ${prediction.error || 'Unknown error'}`);
        }

        const videoUrl = prediction.output;

        console.log(`Video generated, downloading from: ${videoUrl}`);

        // Download video and upload to Supabase Storage
        const videoResponse = await fetch(videoUrl);
        const videoBlob = await videoResponse.blob();
        const videoArrayBuffer = await videoBlob.arrayBuffer();

        const fileName = `${user.id}/${campaignId}/script-video-${Date.now()}.mp4`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('ad-visuals')
            .upload(fileName, videoArrayBuffer, {
                contentType: 'video/mp4',
                upsert: false
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('ad-visuals')
            .getPublicUrl(fileName);

        console.log(`Video uploaded to: ${publicUrl}`);

        // Update campaign with the generated video
        const storyboardData = {
            selectedScript: script,
            generatedVideoUrl: publicUrl,
            generatedAt: new Date().toISOString()
        };

        const { error: updateError } = await supabase
            .from('campaigns')
            .update({ 
                storyboard: storyboardData,
                title: script.title || 'Untitled Campaign',
                status: 'video_generated',
                updated_at: new Date().toISOString(),
                generation_progress: { status: 'completed', mode: 'full' }
            })
            .eq('id', campaignId);

        if (updateError) {
            console.error('Update error:', updateError);
            throw updateError;
        }

        return new Response(
            JSON.stringify({
                videoUrl: publicUrl,
                script,
                storyboard: storyboardData
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );

    } catch (error: any) {
        console.error('Error in generate-video-from-script:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
