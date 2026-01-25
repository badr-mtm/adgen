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
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    const { adDescription, duration, goal, targetAudience, references, brandId } = body;

    console.log('Generating scripts for:', { adDescription, duration, goal });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Get brand info if available
    let brandInfo = '';
    if (brandId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      const { data: brand } = await supabase
        .from('brands')
        .select('name, brand_voice, colors')
        .eq('id', brandId)
        .single();
      
      if (brand) {
        brandInfo = `Brand: ${brand.name}. Voice: ${brand.brand_voice || 'Professional'}. Colors: ${JSON.stringify(brand.colors) || 'Use appropriate colors'}.`;
      }
    }

    const audienceStr = typeof targetAudience === 'object' 
      ? `Locations: ${targetAudience.locations?.join(', ') || 'USA'}. Interests: ${targetAudience.inMarketInterests?.join(', ') || 'General'}. Age: ${targetAudience.ageRanges?.join(', ') || '25-54'}.`
      : targetAudience || 'General audience';

    const systemPrompt = `You are an elite TV advertising creative director with 20+ years experience. You create compelling, emotionally resonant TV ad scripts that drive real results.

CAMPAIGN BRIEF:
- Ad Description: ${adDescription}
- Duration: ${duration}
- Campaign Goal: ${goal}
- Target Audience: ${audienceStr}
${brandInfo ? `- ${brandInfo}` : ''}
${references && references.length > 0 ? `- Reference assets provided: ${references.join(', ')}` : ''}

REQUIREMENTS:
1. Generate 3 DISTINCT script options, each with a different creative approach
2. Each script must be specifically tailored to the ${duration} duration
3. Scripts must directly address the campaign goal: ${goal}
4. Each script needs a complete storyboard with visual descriptions for each scene
5. Make scripts emotionally compelling and memorable
6. Include specific voiceover text, not placeholders
7. Scene timings must add up exactly to ${duration}

CREATIVE APPROACHES TO USE:
- Script 1: Emotional/Story-driven - Connect through human stories
- Script 2: Problem/Solution - Address pain points directly
- Script 3: Aspirational/Lifestyle - Show the ideal outcome`;

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
          { role: 'user', content: 'Generate 3 unique TV ad scripts with full storyboards now. Be specific and creative.' }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_scripts",
              description: "Generate 3 unique TV ad scripts with storyboards",
              parameters: {
                type: "object",
                properties: {
                  scripts: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string", description: "Unique ID for this script" },
                        title: { type: "string", description: "Creative title for this approach" },
                        approach: { type: "string", enum: ["emotional", "problem_solution", "aspirational"], description: "Creative approach type" },
                        hook: { type: "string", description: "Opening hook text (first 3-5 seconds)" },
                        fullScript: { type: "string", description: "Complete voiceover script" },
                        cta: { type: "string", description: "Call to action text" },
                        tone: { type: "string", description: "Overall tone (e.g., Inspiring, Bold, Warm)" },
                        musicMood: { type: "string", description: "Suggested music style" },
                        scenes: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              sceneNumber: { type: "number" },
                              duration: { type: "string", description: "Duration like '5s'" },
                              visualDescription: { type: "string", description: "Detailed visual description" },
                              cameraMovement: { type: "string", description: "Camera angle/movement" },
                              voiceover: { type: "string", description: "Voiceover for this scene" },
                              onScreenText: { type: "string", description: "Any text overlays" }
                            },
                            required: ["sceneNumber", "duration", "visualDescription", "voiceover"]
                          }
                        }
                      },
                      required: ["id", "title", "approach", "hook", "fullScript", "cta", "tone", "scenes"]
                    },
                    minItems: 3,
                    maxItems: 3
                  }
                },
                required: ["scripts"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_scripts" } }
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
    console.log('Generated', result.scripts?.length, 'scripts');

    return new Response(
      JSON.stringify({ scripts: result.scripts }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in generate-scripts:', error);
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
