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

        const { campaignId, sceneNumber, model = "wan-fast", customPrompt, duration = "5", aspectRatio = "16:9" } = await req.json();
        console.log(`Generating video for scene ${sceneNumber} using model ${model}`);

        const { data: campaign, error: campaignError } = await supabase
            .from('campaigns')
            .select('*')
            .eq('id', campaignId)
            .eq('user_id', user.id)
            .single();

        if (campaignError || !campaign || !campaign.storyboard) {
            throw new Error('Campaign or storyboard not found');
        }

        const storyboard = campaign.storyboard as any;
        const scene = storyboard.scenes.find((s: any) => s.sceneNumber === sceneNumber);
        if (!scene) throw new Error('Scene not found');

        const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN');
        if (!REPLICATE_API_TOKEN) throw new Error('REPLICATE_API_TOKEN not configured');

        const visualPrompt = customPrompt || `${scene.visualDescription}. ${scene.suggestedVisuals}. Style: ${campaign.creative_style || 'professional'}. High quality cinematic motion.`;
        
        // Get voiceover from scene
        const voiceoverScript = scene.voiceover || '';

        console.log(`Generating scene video with Replicate bytedance/seedance-1.5-pro`);

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
                    audio_prompt: voiceoverScript,
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

        if (!videoUrl) {
            throw new Error('No video URL returned from Replicate');
        }

        // Download video and upload to Supabase Storage
        const videoResponse = await fetch(videoUrl);
        const videoBlob = await videoResponse.blob();
        const videoArrayBuffer = await videoBlob.arrayBuffer();

        const fileName = `${user.id}/${campaignId}/scene-${sceneNumber}-${Date.now()}.mp4`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('ad-visuals')
            .upload(fileName, videoArrayBuffer, {
                contentType: 'video/mp4',
                upsert: false
            });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('ad-visuals')
            .getPublicUrl(fileName);

        // Update storyboard
        const updatedScenes = storyboard.scenes.map((s: any) => {
            if (s.sceneNumber === sceneNumber) {
                return { ...s, videoUrl: publicUrl, generatedAt: new Date().toISOString() };
            }
            return s;
        });

        const updatedStoryboard = { ...storyboard, scenes: updatedScenes };

        const { error: updateError } = await supabase
            .from('campaigns')
            .update({ storyboard: updatedStoryboard, updated_at: new Date().toISOString() })
            .eq('id', campaignId);

        if (updateError) throw updateError;

        return new Response(
            JSON.stringify({
                videoUrl: publicUrl,
                sceneNumber,
                storyboard: updatedStoryboard
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );

    } catch (error: any) {
        console.error('Error in generate-video-scene:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
