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

    const { variant, campaignId, variantIndex } = await req.json();
    console.log(`Generating preview video for variant: ${variant.styleName}`);

    const FAL_KEY = Deno.env.get('FAL_KEY');
    if (!FAL_KEY) throw new Error('FAL_KEY not configured');

    // Use the first scene for the preview
    const previewScene = variant.scenes[0];
    if (!previewScene) throw new Error('No scenes in variant');

    // Build a rich prompt combining style and scene
    const prompt = `${previewScene.visualPrompt}. Style: ${variant.styleName} - ${variant.styleDescription}. ${variant.colorPalette || ''}. High quality cinematic motion for TV broadcast.`;

    console.log(`Calling Fal.ai for variant preview: ${variant.styleName}`);

    // Use Wan 2.2 Fast for quick previews
    const response = await fetch("https://fal.run/fal-ai/wan/v2.2-5b/text-to-video/fast-wan", {
      method: "POST",
      headers: {
        "Authorization": `Key ${FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        num_frames: 81,
        frames_per_second: 24,
        resolution: "720p",
        aspect_ratio: "16:9",
        enable_safety_checker: true,
        enable_prompt_expansion: true,
        guidance_scale: 3.5,
        interpolator_model: "film",
        num_interpolated_frames: 0,
        video_quality: "high",
        video_write_mode: "balanced"
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Fal.ai API error: ${error}`);
    }

    const result = await response.json();
    const videoUrl = result.video?.url || result.url;

    if (!videoUrl) {
      throw new Error('No video URL returned from Fal.ai');
    }

    // Download video and upload to Supabase Storage
    const videoResponse = await fetch(videoUrl);
    const videoBlob = await videoResponse.blob();
    const videoArrayBuffer = await videoBlob.arrayBuffer();

    const fileName = `${user.id}/${campaignId}/variant-${variantIndex}-preview-${Date.now()}.mp4`;
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

    console.log(`Preview video uploaded for ${variant.styleName}: ${publicUrl}`);

    return new Response(
      JSON.stringify({
        variantIndex,
        previewUrl: publicUrl,
        styleName: variant.styleName
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Error in generate-variant-previews:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
