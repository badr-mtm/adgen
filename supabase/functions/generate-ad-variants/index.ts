import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VariantRequest {
  campaignId: string;
  imageUrl: string;
  variantCount?: number;
}

interface Variant {
  id: string;
  imageUrl: string;
  label: string;
  style: string;
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

    const { campaignId, imageUrl, variantCount = 3 }: VariantRequest = await req.json();
    console.log(`Generating ${variantCount} variants for campaign: ${campaignId}`);

    // Fetch campaign data for context
    const { data: campaign, error: campaignError } = await supabaseClient
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('user_id', user.id)
      .single();

    if (campaignError || !campaign) {
      throw new Error('Campaign not found');
    }

    const variants: Variant[] = [
      { id: 'original', imageUrl, label: 'Original', style: 'original' }
    ];

    // Define variant styles with different prompts
    const variantStyles = [
      {
        id: 'vibrant',
        label: 'Vibrant Colors',
        prompt: `Transform this ad with vibrant, eye-catching colors. Increase color saturation, add dynamic color accents, and make the overall palette more energetic and attention-grabbing. Keep all text and main elements intact but make them pop with enhanced color treatment.`
      },
      {
        id: 'minimal',
        label: 'Minimal Clean',
        prompt: `Create a minimalist version of this ad. Simplify the visual elements, increase white space, use a cleaner more refined color palette, and ensure the core message stands out with elegant simplicity. Maintain the CTA prominence.`
      },
      {
        id: 'bold',
        label: 'Bold Impact',
        prompt: `Make this ad more impactful and bold. Increase contrast dramatically, use bolder typography treatment, add subtle gradient overlays for depth, and create a more premium, high-impact visual. The CTA should be impossible to miss.`
      },
      {
        id: 'warm',
        label: 'Warm Tones',
        prompt: `Apply a warm, inviting color treatment to this ad. Use golden, amber, and warm earth tones. Create a friendly, approachable feel while maintaining professional quality. Keep all content and CTA clearly visible.`
      },
      {
        id: 'cool',
        label: 'Cool Modern',
        prompt: `Give this ad a cool, modern aesthetic. Use blue, teal, and cool gray tones. Add subtle tech-inspired elements or gradients. Create a contemporary, trustworthy feel while keeping the message clear.`
      }
    ];

    // Generate variants (limit to requested count)
    const stylesToGenerate = variantStyles.slice(0, variantCount);
    
    for (const style of stylesToGenerate) {
      console.log(`Generating variant: ${style.label}`);
      
      try {
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
                  { type: 'text', text: style.prompt },
                  { type: 'image_url', image_url: { url: imageUrl } }
                ]
              }
            ],
            modalities: ['image', 'text']
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Variant ${style.id} generation failed:`, response.status, errorText);
          
          if (response.status === 429) {
            // Rate limited, add original as fallback for remaining
            console.log('Rate limited, using original for remaining variants');
            break;
          }
          if (response.status === 402) {
            return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add more credits.' }), {
              status: 402,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          continue;
        }

        const data = await response.json();
        const variantImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (variantImageUrl) {
          variants.push({
            id: style.id,
            imageUrl: variantImageUrl,
            label: style.label,
            style: style.id
          });
          console.log(`Successfully generated variant: ${style.label}`);
        }
      } catch (variantError) {
        console.error(`Error generating variant ${style.id}:`, variantError);
        continue;
      }
    }

    // Store variants in campaign storyboard
    const storyboard = (campaign.storyboard as Record<string, any>) || {};
    storyboard.variants = variants;
    storyboard.variantsGeneratedAt = new Date().toISOString();

    await supabaseClient
      .from('campaigns')
      .update({ storyboard })
      .eq('id', campaignId);

    console.log(`Successfully generated ${variants.length} variants`);

    return new Response(JSON.stringify({ 
      success: true, 
      variants,
      count: variants.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-ad-variants:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
