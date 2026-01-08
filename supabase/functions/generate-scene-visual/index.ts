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
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Extract JWT token from header
    const token = authHeader.replace('Bearer ', '');

    // Create auth client for user verification
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Create service role client for database operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user with explicit token
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Unauthorized');
    }

    const { campaignId, sceneNumber, customPrompt } = await req.json();
    console.log('Generating visual for campaign:', campaignId, 'scene:', sceneNumber);

    // Fetch the campaign with storyboard
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

    if (!scene) {
      throw new Error('Scene not found');
    }

    // Use the provided Google API Key for Imagen 3
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY') || "AIzaSyAJnTBxSqSmsi839Uk44GFiEY0BkdiJlBw";

    // Build prompt purely from user inputs and scene description
    const basePrompt = customPrompt || scene.visualDescription;
    const enhancedPrompt = `${basePrompt}. ${scene.suggestedVisuals}. Style: ${campaign.creative_style || 'professional'}. High quality, professional ${campaign.ad_type} advertisement visual. Ultra high resolution, photorealistic, cinematic lighting.`;

    console.log('Generating image with prompt:', enhancedPrompt);

    // Call Google Imagen 3 API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generateImages-001:generateImages?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        number_of_images: 1,
        aspect_ratio: "16:9", // Default for video scenes
        safety_settings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google AI API error:', response.status, errorText);
      throw new Error(`Google AI API error: ${response.status} - ${errorText}`);
    }

    const aiResponse = await response.json();
    console.log('AI image generation response received');

    // Handle Google's response format: { images: [ { image64: "base64string..." } ] }
    const imageBase64 = aiResponse.images?.[0]?.image64;

    if (!imageBase64) {
      console.error('Unexpected response structure:', JSON.stringify(aiResponse).substring(0, 200));
      throw new Error('No image generated from Google API');
    }

    // Convert base64 to blob and upload to storage
    const byteCharacters = atob(imageBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    const fileName = `${user.id}/${campaignId}/scene-${sceneNumber}-${Date.now()}.png`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('ad-visuals')
      .upload(fileName, byteArray, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Failed to upload image');
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('ad-visuals')
      .getPublicUrl(fileName);

    // Update the scene in storyboard with the visual URL
    const updatedScenes = storyboard.scenes.map((s: any) => {
      if (s.sceneNumber === sceneNumber) {
        return { ...s, visualUrl: publicUrl, generatedAt: new Date().toISOString() };
      }
      return s;
    });

    const updatedStoryboard = {
      ...storyboard,
      scenes: updatedScenes
    };

    // Update campaign with new storyboard
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({
        storyboard: updatedStoryboard,
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId)
      .eq('user_id', user.id);

    if (updateError) {
      throw updateError;
    }

    console.log('Scene visual generated and saved successfully');

    return new Response(
      JSON.stringify({
        visualUrl: publicUrl,
        sceneNumber,
        storyboard: updatedStoryboard
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in generate-scene-visual:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
