import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, adType, productUrl } = await req.json();

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Create auth client for user verification
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get brand profile
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (brandError || !brand) {
      return new Response(JSON.stringify({ error: 'Brand not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are an expert TV advertising strategist. Generate a complete broadcast-ready advertising strategy based on the user's concept and brand profile.

Brand Context:
- Brand Name: ${brand.name}
- Brand Voice: ${brand.brand_voice || 'Professional and trustworthy'}
- Brand Colors: ${JSON.stringify(brand.colors || [])}

Create a comprehensive TV ad strategy that will resonate with broadcast audiences.`;

    const userPrompt = `Create a complete TV advertising strategy for the following concept:

Concept: ${prompt}
Ad Type: ${adType}
${productUrl ? `Product URL: ${productUrl}` : ''}

Generate a strategy that includes:
1. Campaign objective (awareness, consideration, promotion, or brand_launch)
2. Core message with primary message, supporting message, and emotional angle
3. Target audience with primary/secondary profiles and viewing context
4. Storytelling framework recommendation
5. Ad length and pacing recommendations
6. CTA strategy
7. Visual and audio direction`;

    console.log('Calling Lovable AI for strategy generation...');

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
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_tv_strategy",
              description: "Generate a complete TV advertising strategy",
              parameters: {
                type: "object",
                properties: {
                  objective: { 
                    type: "string", 
                    enum: ["awareness", "consideration", "promotion", "brand_launch"],
                    description: "Primary campaign objective"
                  },
                  coreMessage: {
                    type: "object",
                    properties: {
                      primary: { type: "string", description: "Primary message, max 100 chars" },
                      supporting: { type: "string", description: "Supporting message" },
                      emotionalAngle: { 
                        type: "string", 
                        enum: ["trust", "aspiration", "urgency", "authority"],
                        description: "Emotional angle of the message"
                      }
                    },
                    required: ["primary", "supporting", "emotionalAngle"],
                    additionalProperties: false
                  },
                  audience: {
                    type: "object",
                    properties: {
                      primary: { type: "string", description: "Primary audience description" },
                      secondary: { type: "string", description: "Secondary audience" },
                      viewingContext: { type: "string", description: "When/where they watch TV" },
                      ageRange: { type: "string", description: "Target age range" },
                      householdType: { type: "string", description: "Household composition" },
                      psychographicIntent: { type: "string", description: "Psychographic profile" }
                    },
                    required: ["primary", "secondary", "viewingContext", "ageRange", "householdType", "psychographicIntent"],
                    additionalProperties: false
                  },
                  storytellingFramework: { 
                    type: "string", 
                    enum: ["problem_solution", "emotional_build", "authority_proof", "offer_driven"],
                    description: "Narrative framework for the ad"
                  },
                  adLength: { 
                    type: "string", 
                    enum: ["15s", "30s", "45s"],
                    description: "Recommended ad duration"
                  },
                  pacing: { 
                    type: "string", 
                    enum: ["fast", "balanced", "cinematic"],
                    description: "Scene pacing style"
                  },
                  hookTiming: { 
                    type: "number", 
                    description: "Seconds before hook moment (1-10)"
                  },
                  logoRevealTiming: { 
                    type: "number", 
                    description: "Seconds into ad for logo reveal"
                  },
                  cta: {
                    type: "object",
                    properties: {
                      text: { type: "string", description: "CTA text" },
                      strength: { type: "string", enum: ["soft", "direct"] },
                      placement: { type: "string", enum: ["early", "mid", "end"] }
                    },
                    required: ["text", "strength", "placement"],
                    additionalProperties: false
                  },
                  visualDirection: {
                    type: "object",
                    properties: {
                      tone: { type: "string", enum: ["cinematic", "lifestyle", "premium", "energetic"] },
                      cameraMovement: { type: "string", enum: ["static", "subtle", "dynamic"] },
                      musicMood: { type: "string", description: "Music style/mood" },
                      voiceoverStyle: { type: "string", enum: ["warm", "authoritative", "energetic", "conversational"] }
                    },
                    required: ["tone", "cameraMovement", "musicMood", "voiceoverStyle"],
                    additionalProperties: false
                  }
                },
                required: ["objective", "coreMessage", "audience", "storytellingFramework", "adLength", "pacing", "hookTiming", "logoRevealTiming", "cta", "visualDirection"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_tv_strategy" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const aiResponse = await response.json();
    console.log('AI Response received');
    
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error('Invalid AI response structure');
    }
    
    const strategy = JSON.parse(toolCall.function.arguments);

    console.log('Strategy generated successfully:', strategy.objective);

    return new Response(JSON.stringify({ 
      strategy,
      brandId: brand.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-tv-strategy:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
