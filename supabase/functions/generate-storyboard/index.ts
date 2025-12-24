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

    const { campaignId } = await req.json();
    console.log('Generating storyboard for campaign:', campaignId);

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

    // Build prompt purely from user inputs - no brand kit references
    const targetAudience = campaign.target_audience;
    const audienceStr = targetAudience?.demographics || targetAudience?.interests || '';
    
    const systemPrompt = `Create a ${campaign.creative_style || 'professional'} video ad storyboard.

Campaign: ${campaign.title}
Brief: ${campaign.prompt || campaign.description}
Script: ${campaign.script || 'Generate based on brief'}
CTA: ${campaign.cta_text || 'Learn More'}
Goal: ${campaign.goal}${audienceStr ? `\nTarget Audience: ${audienceStr}` : ''}

Generate 3 script variants (15s, 30s, 60s), 4-6 scenes with duration, visual description, camera suggestions, voiceover text, and music mood. Focus on the user's brief and goal.`;

    const userPrompt = `Create storyboard now. Be concise but complete.`;

    console.log('Calling Lovable AI for storyboard generation...');

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
              description: "Generate a complete video ad storyboard with script variants and scenes",
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
                        visualDescription: { type: "string", description: "What viewers see" },
                        suggestedVisuals: { type: "string", description: "Camera angles, composition details" },
                        voiceover: { type: "string", description: "Exact voiceover text" }
                      },
                      required: ["sceneNumber", "duration", "visualDescription", "suggestedVisuals", "voiceover"]
                    },
                    minItems: 3
                  },
                  musicMood: {
                    type: "string",
                    description: "Music mood and style suggestions"
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
    console.log('AI response received');

    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error('Invalid AI response format');
    }

    const storyboard = JSON.parse(toolCall.function.arguments);

    // Update campaign with storyboard
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({
        storyboard,
        status: 'storyboard_created',
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId)
      .eq('user_id', user.id);

    if (updateError) {
      throw updateError;
    }

    console.log('Storyboard generated and saved successfully');

    return new Response(
      JSON.stringify({ storyboard, campaignId }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in generate-storyboard:', error);
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
