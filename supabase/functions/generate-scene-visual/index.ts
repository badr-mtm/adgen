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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build prompt purely from user inputs and scene description - no brand kit references
    const basePrompt = customPrompt || scene.visualDescription;
    const enhancedPrompt = `${basePrompt}. ${scene.suggestedVisuals}. Style: ${campaign.creative_style || 'professional'}. High quality, professional ${campaign.ad_type} advertisement visual. Ultra high resolution.`;

    console.log('Generating image with prompt:', enhancedPrompt);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        messages: [
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      if (response.status === 402) {
        throw new Error('AI usage limit reached. Please add credits to continue.');
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('AI image generation response received');

    const imageUrl = aiResponse.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageUrl) {
      throw new Error('No image generated');
    }

    // Convert base64 to blob and upload to storage
    const base64Data = imageUrl.split(',')[1];
    const byteCharacters = atob(base64Data);
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
