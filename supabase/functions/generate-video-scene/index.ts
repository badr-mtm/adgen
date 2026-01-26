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

        const FAL_KEY = Deno.env.get('FAL_KEY');
        if (!FAL_KEY) throw new Error('FAL_KEY not configured');

        const prompt = customPrompt || `${scene.visualDescription}. ${scene.suggestedVisuals}. Style: ${campaign.creative_style || 'professional'}. High quality cinematic motion.`;

        // Use wan-video/wan-2.5-t2v-fast for all video generation
        const modelEndpoint = "wan-video/wan-2.5-t2v-fast";
        const requestBody = {
            prompt,
            negative_prompt: "low resolution, error, worst quality, low quality, defects, blurry, distorted",
            aspect_ratio: aspectRatio,
            duration: duration,
            enable_prompt_expansion: true,
            enable_safety_checker: true
        };

        console.log(`Using model: ${model} -> endpoint: ${modelEndpoint}`);

        console.log(`Calling Fal.ai: ${modelEndpoint}`);

        const response = await fetch(`https://fal.run/${modelEndpoint}`, {
            method: "POST",
            headers: {
                "Authorization": `Key ${FAL_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Fal.ai API error: ${error}`);
        }

        const result = await response.json();
        const videoUrl = result.video?.url || result.url;

        if (!videoUrl) {
            // Fal.ai might return a request_id for polling in some configurations, 
            // but their standard run endpoint is usually synchronous or wait-for-result.
            throw new Error('No video URL returned from Fal.ai');
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
