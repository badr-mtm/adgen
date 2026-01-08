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

    const { campaignId, customPrompt } = await req.json();
    console.log('Generating image ad for campaign:', campaignId);

    // Fetch the campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('user_id', user.id)
      .single();

    if (campaignError || !campaign) {
      throw new Error('Campaign not found');
    }

    // Use the provided Google API Key for Imagen 3
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY') || "AIzaSyAJnTBxSqSmsi839Uk44GFiEY0BkdiJlBw";

    // Build prompt purely from user inputs - no brand kit references
    const aspectRatio = campaign.aspect_ratios?.[0] || '1:1';
    const userPrompt = campaign.prompt || campaign.description;
    const targetAudience = campaign.target_audience;
    const audienceContext = targetAudience?.demographics || targetAudience?.interests || '';

    // Concise prompt focused on user's actual inputs
    const enhancedPrompt = `${campaign.creative_style || 'professional'} style advertisement image. ${userPrompt}. Goal: ${campaign.goal}.${audienceContext ? ` Target audience: ${audienceContext}.` : ''} ${aspectRatio} aspect ratio. No text in image, clean design. Ultra high resolution.`;

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
        // Map common aspect ratios to Imagen supported stats if needed, or rely on prompt instruction + cropping
        // Imagen 3 supports specific ratios: "1:1", "3:4", "4:3", "16:9", "9:16"
        aspect_ratio: aspectRatio === "1:1" ? "1:1" : "16:9",
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

    const fileName = `${user.id}/${campaignId}/ad-image-${Date.now()}.png`;

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

    // Update campaign with generated image
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({
        storyboard: {
          type: 'image_ad',
          generatedImageUrl: publicUrl,
          generatedAt: new Date().toISOString()
        },
        status: 'image_generated',
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId)
      .eq('user_id', user.id);

    if (updateError) {
      throw updateError;
    }

    console.log('Image ad generated and saved successfully');

    return new Response(
      JSON.stringify({
        imageUrl: publicUrl,
        campaignId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in generate-image-ad:', error);
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
