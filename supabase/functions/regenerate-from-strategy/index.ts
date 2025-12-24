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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Unauthorized');
    }

    const { campaignId, strategy } = await req.json();
    console.log('Regenerating storyboard from strategy for campaign:', campaignId);

    if (!strategy) {
      throw new Error('Strategy is required');
    }

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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build a detailed prompt from the strategy
    const storytellingDescriptions: Record<string, string> = {
      problem_solution: "Open with a relatable problem, then reveal your product/service as the solution",
      emotional_build: "Build an emotional connection through storytelling, culminating in a powerful brand moment",
      authority_proof: "Establish credibility and authority through testimonials, statistics, or expert endorsements",
      offer_driven: "Lead with a compelling offer or value proposition with urgency"
    };

    const pacingDescriptions: Record<string, string> = {
      fast: "Quick cuts, high energy, dynamic movement",
      balanced: "Mix of pacing, conversational rhythm",
      cinematic: "Slow, deliberate, premium feel"
    };

    const systemPrompt = `You are an expert TV commercial storyboard creator. Regenerate a complete storyboard based on the updated strategy.

CAMPAIGN INFO:
- Title: ${campaign.title}
- Description: ${campaign.description}
- Original Brief: ${campaign.prompt || campaign.description}
- Goal: ${campaign.goal}
- Creative Style: ${campaign.creative_style}

UPDATED STRATEGY:
- Objective: ${strategy.objective}
- Core Message: "${strategy.coreMessage?.primary}"
- Supporting Message: "${strategy.coreMessage?.supporting}"
- Emotional Angle: ${strategy.coreMessage?.emotionalAngle}
- Target Audience: ${strategy.audience?.primary} (${strategy.audience?.ageRange}, ${strategy.audience?.householdType})
- Viewing Context: ${strategy.audience?.viewingContext}
- Storytelling Framework: ${storytellingDescriptions[strategy.storytellingFramework] || strategy.storytellingFramework}
- Ad Length: ${strategy.adLength}
- Pacing: ${pacingDescriptions[strategy.pacing] || strategy.pacing}
- Hook Timing: ${strategy.hookTiming} seconds
- Logo Reveal: ${strategy.logoRevealTiming} seconds
- CTA: "${strategy.cta?.text}" (${strategy.cta?.strength}, placed ${strategy.cta?.placement})
- Visual Tone: ${strategy.visualDirection?.tone}
- Camera Movement: ${strategy.visualDirection?.cameraMovement}
- Music Mood: ${strategy.visualDirection?.musicMood}
- Voiceover Style: ${strategy.visualDirection?.voiceoverStyle}

Generate a storyboard that:
1. Follows the ${strategy.storytellingFramework} narrative structure
2. Places the hook within the first ${strategy.hookTiming} seconds
3. Reveals the logo/brand at the ${strategy.logoRevealTiming}-second mark
4. Matches the ${strategy.pacing} pacing style
5. Incorporates the ${strategy.coreMessage?.emotionalAngle} emotional angle throughout
6. Uses ${strategy.visualDirection?.tone} visuals with ${strategy.visualDirection?.cameraMovement} camera work
7. Ends with the CTA "${strategy.cta?.text}" placed ${strategy.cta?.placement}

Create script variants for 15s, 30s, and 60s durations, but optimize for the ${strategy.adLength} version.`;

    const userPrompt = `Generate a complete storyboard now. Ensure each scene aligns with the strategy, especially:
- Hook placement in the first ${strategy.hookTiming}s
- Emotional ${strategy.coreMessage?.emotionalAngle} angle
- ${strategy.pacing} pacing throughout
- CTA "${strategy.cta?.text}" at ${strategy.cta?.placement}`;

    console.log('Calling Lovable AI for storyboard regeneration...');

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
              name: "generate_storyboard",
              description: "Generate a complete video ad storyboard with script variants and scenes aligned to strategy",
              parameters: {
                type: "object",
                properties: {
                  scriptVariants: {
                    type: "object",
                    properties: {
                      "15s": { type: "string", description: "15-second script version" },
                      "30s": { type: "string", description: "30-second script version" },
                      "60s": { type: "string", description: "60-second script version" }
                    },
                    required: ["15s", "30s", "60s"]
                  },
                  scenes: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        sceneNumber: { type: "number" },
                        duration: { type: "string", description: "Duration like '3s' or '5s'" },
                        visualDescription: { type: "string", description: "What viewers see - aligned with visual tone" },
                        suggestedVisuals: { type: "string", description: "Camera angles and composition matching strategy" },
                        voiceover: { type: "string", description: "Exact voiceover text in the specified style" },
                        strategyAlignment: { type: "string", description: "Which strategy elements this scene addresses (hook, emotional build, CTA, etc.)" }
                      },
                      required: ["sceneNumber", "duration", "visualDescription", "suggestedVisuals", "voiceover"]
                    },
                    minItems: 3
                  },
                  musicMood: {
                    type: "string",
                    description: "Music mood matching the strategy's visual direction"
                  }
                },
                required: ["scriptVariants", "scenes", "musicMood"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_storyboard" } }
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
    console.log('AI response received for regeneration');

    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error('Invalid AI response format');
    }

    const newStoryboard = JSON.parse(toolCall.function.arguments);

    // Merge strategy into storyboard
    const updatedStoryboard = {
      ...newStoryboard,
      strategy,
      regeneratedAt: new Date().toISOString()
    };

    // Update campaign with new storyboard
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({
        storyboard: updatedStoryboard,
        status: 'storyboard_regenerated',
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId)
      .eq('user_id', user.id);

    if (updateError) {
      throw updateError;
    }

    console.log('Storyboard regenerated and saved successfully');

    return new Response(
      JSON.stringify({ storyboard: updatedStoryboard, campaignId }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in regenerate-from-strategy:', error);
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
