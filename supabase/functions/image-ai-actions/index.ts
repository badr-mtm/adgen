import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ActionRequest {
  action: string;
  imageUrl: string;
  params?: Record<string, any>;
  campaignId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { action, imageUrl, params, campaignId }: ActionRequest = await req.json();
    console.log(`Processing AI action: ${action} for campaign: ${campaignId}`);

    let prompt = '';
    let shouldEditImage = true;

    switch (action) {
      case 'increase_contrast':
        prompt = 'Increase the contrast of this image significantly. Make the dark areas darker and the bright areas brighter while preserving the overall composition. Maintain all text and visual elements.';
        break;
      case 'shorten_headline':
        prompt = 'Edit this ad image to shorten any headline text to be more concise and mobile-friendly. Keep it punchy with 3-5 words max while maintaining the core message. Keep all other elements intact.';
        break;
      case 'emphasize_cta':
        prompt = 'Make the call-to-action button or text more prominent in this ad. Increase its size slightly, add a subtle glow or shadow effect, and ensure it stands out from the background. Keep all other elements intact.';
        break;
      case 'enhance_colors':
        prompt = 'Enhance the colors in this image to make them more vibrant and appealing. Increase saturation slightly and improve color balance while keeping it natural looking. Maintain all text and visual elements.';
        break;
      case 'improve_composition':
        prompt = 'Improve the visual composition and balance of this ad. Adjust element placement for better visual flow and hierarchy. Ensure the main subject and CTA are prominently positioned. Keep all content intact.';
        break;
      case 'add_urgency':
        prompt = 'Add visual urgency elements to this ad - such as subtle countdown aesthetics, bold accent colors, or dynamic motion blur effects. Make it feel time-sensitive while maintaining brand consistency.';
        break;
      case 'enhance_image':
        prompt = 'Enhance this image with AI improvements: sharpen details, improve lighting, balance colors, and add professional polish while maintaining the original composition and brand elements.';
        break;
      case 'apply_color':
        const brightness = params?.brightness || 100;
        const contrast = params?.contrast || 100;
        const saturation = params?.saturation || 100;
        prompt = `Adjust this image with: brightness ${brightness}%, contrast ${contrast}%, saturation ${saturation}%. Apply these adjustments professionally while maintaining all visual elements and text.`;
        break;
      case 'apply_layout':
        const textPosition = params?.textPosition || 'center';
        const textAlignment = params?.textAlignment || 'center';
        prompt = `Reposition all text elements to the ${textPosition} of the image with ${textAlignment} alignment. Maintain readable contrast and visual hierarchy. Keep all content intact.`;
        break;
      case 'apply_text':
        const headlineText = params?.headlineText;
        const subheadlineText = params?.subheadlineText;
        const ctaText = params?.ctaText;
        const fontSize = params?.fontSize || 24;
        let textPrompt = 'Update the text elements in this ad image:';
        if (headlineText) textPrompt += ` Set headline to "${headlineText}".`;
        if (subheadlineText) textPrompt += ` Set subheadline to "${subheadlineText}".`;
        if (ctaText) textPrompt += ` Set CTA button text to "${ctaText}".`;
        textPrompt += ` Use approximately ${fontSize}px font size for the headline. Maintain visual hierarchy and brand consistency.`;
        prompt = textPrompt;
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log(`Calling Lovable AI with prompt for action: ${action}`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add more credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    const editedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textResponse = data.choices?.[0]?.message?.content || '';

    if (!editedImageUrl) {
      console.log('No image returned, action may be text-only');
      return new Response(JSON.stringify({ 
        success: true, 
        action,
        message: textResponse || 'Action processed successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update campaign storyboard with new image
    const { data: campaign } = await supabaseClient
      .from('campaigns')
      .select('storyboard')
      .eq('id', campaignId)
      .single();

    const storyboard = (campaign?.storyboard as Record<string, any>) || {};
    storyboard.generatedImageUrl = editedImageUrl;
    storyboard.lastEditedAt = new Date().toISOString();
    storyboard.lastAction = action;

    await supabaseClient
      .from('campaigns')
      .update({ storyboard })
      .eq('id', campaignId);

    console.log(`Successfully processed action: ${action}`);

    return new Response(JSON.stringify({ 
      success: true, 
      action,
      imageUrl: editedImageUrl,
      message: textResponse
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in image-ai-actions:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
