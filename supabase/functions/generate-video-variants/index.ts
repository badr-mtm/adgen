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

    const token = authHeader.replace('Bearer ', '');

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Unauthorized');
    }

    const body = await req.json();
    const { script, campaignId, duration, adDescription } = body;

    console.log('Generating video variants for script:', script?.title);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Generate 3 visual style variants for the selected script
    const systemPrompt = `You are a video production AI that creates detailed specifications for 3 different visual style variants of a TV ad.

SCRIPT TO VISUALIZE:
Title: ${script?.title || 'TV Ad'}
Full Script: ${script?.fullScript || adDescription}
Tone: ${script?.tone || 'Professional'}
Duration: ${duration}
Scenes: ${JSON.stringify(script?.scenes || [])}

Generate 3 distinct visual variants:
1. CINEMATIC: Film-quality, dramatic lighting, slow motion moments
2. MODERN: Clean, fast-paced, bold graphics, motion design
3. AUTHENTIC: Documentary-style, real people, natural lighting

Each variant should have the same script but different visual treatments.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate 3 visual variants for this script.' }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_variants",
              description: "Generate 3 visual style variants for the TV ad",
              parameters: {
                type: "object",
                properties: {
                  variants: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        styleName: { type: "string", description: "e.g., Cinematic, Modern, Authentic" },
                        styleDescription: { type: "string", description: "Brief description of the visual style" },
                        colorPalette: { type: "string", description: "Color scheme" },
                        cameraStyle: { type: "string", description: "Camera work description" },
                        editingPace: { type: "string", description: "Fast, Medium, Slow" },
                        musicStyle: { type: "string", description: "Music genre/mood" },
                        thumbnailPrompt: { type: "string", description: "Prompt to generate a thumbnail image representing this variant" },
                        scenes: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              sceneNumber: { type: "number" },
                              duration: { type: "string" },
                              visualPrompt: { type: "string", description: "Detailed image generation prompt for this scene" },
                              transitionType: { type: "string" },
                              voiceover: { type: "string" }
                            },
                            required: ["sceneNumber", "duration", "visualPrompt", "voiceover"]
                          }
                        }
                      },
                      required: ["id", "styleName", "styleDescription", "scenes", "thumbnailPrompt"]
                    },
                    minItems: 3,
                    maxItems: 3
                  }
                },
                required: ["variants"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_variants" } }
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
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error('Invalid AI response format');
    }

    const result = JSON.parse(toolCall.function.arguments);
    console.log('Generated', result.variants?.length, 'video variants');

    // Save to campaign if ID provided
    if (campaignId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await supabase
        .from('campaigns')
        .update({
          storyboard: {
            selectedScript: script,
            videoVariants: result.variants,
            generatedAt: new Date().toISOString()
          },
          status: 'variants_generated',
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId)
        .eq('user_id', user.id);
    }

    return new Response(
      JSON.stringify({ variants: result.variants }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in generate-video-variants:', error);
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
