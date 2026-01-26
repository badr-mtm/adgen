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

        const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN');
        if (!REPLICATE_API_TOKEN) throw new Error('REPLICATE_API_TOKEN not configured');
        
        // Log token format (first/last chars only for security)
        const tokenPreview = REPLICATE_API_TOKEN.length > 8 
            ? `${REPLICATE_API_TOKEN.substring(0, 4)}...${REPLICATE_API_TOKEN.substring(REPLICATE_API_TOKEN.length - 4)}`
            : '[too short]';
        console.log(`Token format check: length=${REPLICATE_API_TOKEN.length}, preview=${tokenPreview}`);

        // Build prompt from the full script
        const prompt = `${script.fullScript}. Style: professional TV commercial. High quality cinematic motion. Tone: ${script.tone || 'professional'}.`;

        console.log(`Using Replicate wan-video/wan-2.5-t2v with prompt: ${prompt.substring(0, 100)}...`);

        // Start prediction on Replicate using the models endpoint
        const createResponse = await fetch('https://api.replicate.com/v1/models/wan-video/wan-2.5-t2v/predictions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
                'Content-Type': 'application/json',
                'Prefer': 'wait'
            },
            body: JSON.stringify({
                input: {
                    prompt,
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
