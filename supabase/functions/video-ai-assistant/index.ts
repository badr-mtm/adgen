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
      throw new Error('Unauthorized');
    }

    const { campaignId, message, action, currentSceneIndex, storyboard } = await req.json();
    console.log('AI Assistant request:', { campaignId, message, action, currentSceneIndex });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build context-aware system prompt
    const currentScene = storyboard?.scenes?.[currentSceneIndex];
    const systemPrompt = `You are an AI video editing assistant. You help users edit their video ads by:
- Modifying scene descriptions and visuals
- Improving headlines and copy
- Adjusting timing and pacing
- Suggesting music and voiceover improvements

Current video context:
- Total scenes: ${storyboard?.scenes?.length || 0}
- Current scene: ${currentSceneIndex + 1}
${currentScene ? `
Current scene details:
- Duration: ${currentScene.duration}
- Visual description: ${currentScene.visualDescription}
- Voiceover: ${currentScene.voiceover}
` : ''}

Available script variants:
- 15s: ${storyboard?.scriptVariants?.['15s']?.substring(0, 100)}...
- 30s: ${storyboard?.scriptVariants?.['30s']?.substring(0, 100)}...
- 60s: ${storyboard?.scriptVariants?.['60s']?.substring(0, 100)}...

Music mood: ${storyboard?.musicMood || 'Not set'}

When the user asks to make changes:
1. Describe what you'll do
2. Provide the specific changes
3. Be conversational and helpful

For visual regeneration requests, suggest creative improvements.
For copy improvements, provide 2-3 alternatives.
For timing adjustments, explain the impact on pacing.`;

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
          { role: 'user', content: message }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "update_scene",
              description: "Update a specific scene's properties",
              parameters: {
                type: "object",
                properties: {
                  sceneIndex: { type: "number", description: "Scene index to update (0-based)" },
                  updates: {
                    type: "object",
                    properties: {
                      duration: { type: "string" },
                      visualDescription: { type: "string" },
                      voiceover: { type: "string" },
                      suggestedVisuals: { type: "string" }
                    }
                  }
                },
                required: ["sceneIndex", "updates"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "suggest_changes",
              description: "Suggest changes without applying them",
              parameters: {
                type: "object",
                properties: {
                  suggestions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string" },
                        description: { type: "string" },
                        value: { type: "string" }
                      }
                    }
                  }
                },
                required: ["suggestions"]
              }
            }
          }
        ],
        tool_choice: "auto"
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      if (response.status === 402) {
        throw new Error('AI usage limit reached.');
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const assistantMessage = aiResponse.choices?.[0]?.message;
    
    let responseText = assistantMessage?.content || "I can help you with that!";
    let updatedStoryboard = null;
    let actionType = null;

    // Handle tool calls
    if (assistantMessage?.tool_calls?.length > 0) {
      const toolCall = assistantMessage.tool_calls[0];
      const toolArgs = JSON.parse(toolCall.function.arguments);

      if (toolCall.function.name === "update_scene" && toolArgs.sceneIndex !== undefined) {
        const { sceneIndex, updates } = toolArgs;
        
        // Update the storyboard
        const newStoryboard = { ...storyboard };
        if (newStoryboard.scenes?.[sceneIndex]) {
          newStoryboard.scenes[sceneIndex] = {
            ...newStoryboard.scenes[sceneIndex],
            ...updates
          };
          
          // Save to database
          await supabase
            .from('campaigns')
            .update({ 
              storyboard: newStoryboard,
              updated_at: new Date().toISOString()
            })
            .eq('id', campaignId)
            .eq('user_id', user.id);
          
          updatedStoryboard = newStoryboard;
          actionType = "scene_updated";
          responseText = `I've updated scene ${sceneIndex + 1}. ${responseText}`;
        }
      }
    }

    console.log('AI response generated successfully');

    return new Response(
      JSON.stringify({ 
        response: responseText,
        updatedStoryboard,
        action: actionType
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in video-ai-assistant:', error);
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
