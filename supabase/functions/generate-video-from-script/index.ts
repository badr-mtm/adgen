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

        const { campaignId, script, duration = "5", aspectRatio = "16:9" } = await req.json();
        
        if (!script) {
            throw new Error('Script is required');
        }

        console.log(`Generating video from script: "${script.title}"`);

        const FAL_KEY = Deno.env.get('FAL_KEY');
        if (!FAL_KEY) throw new Error('FAL_KEY not configured');

        // Build prompt from the full script
        const prompt = `${script.fullScript}. Style: professional TV commercial. High quality cinematic motion. Tone: ${script.tone || 'professional'}.`;

        console.log(`Using fal-ai/wan/v2.6/text-to-video with prompt: ${prompt.substring(0, 100)}...`);

        const response = await fetch(`https://fal.run/fal-ai/wan/v2.6/text-to-video`, {
            method: "POST",
            headers: {
                "Authorization": `Key ${FAL_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt,
                negative_prompt: "low resolution, error, worst quality, low quality, defects, blurry, distorted",
                aspect_ratio: aspectRatio,
                duration: duration,
                enable_prompt_expansion: true,
                enable_safety_checker: true
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Fal.ai API error:', error);
            throw new Error(`Fal.ai API error: ${error}`);
        }

        const result = await response.json();
        const videoUrl = result.video?.url || result.url;

        if (!videoUrl) {
            throw new Error('No video URL returned from Fal.ai');
        }

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
                status: 'video_generated',
                updated_at: new Date().toISOString() 
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
