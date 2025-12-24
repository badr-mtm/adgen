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
    const { 
      prompt, 
      adType, 
      goal, 
      targetAudience, 
      creativeStyle, 
      aspectRatios 
    } = await req.json();

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get brand profile (using service role, filtering by verified user_id)
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

    // Build prompt purely from user inputs - no brand kit references
    const audienceStr = targetAudience?.demographics || targetAudience?.interests || '';
    
    const systemPrompt = `Generate 4 ${adType} ad concepts. Each needs: title (60 chars), description (200 chars), script (${adType === 'video' ? '30-60s' : '2-3 sentences'}), CTA (20 chars), predicted CTR (%), engagement (low/medium/high). Focus entirely on the user's brief and inputs.`;

    const userPrompt = `Brief: ${prompt}
Goal: ${goal}${audienceStr ? `\nTarget Audience: ${audienceStr}` : ''}
Style: ${creativeStyle}

Create 4 unique, creative concepts that directly address this brief. Be specific and relevant to the user's request.`;

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

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
              name: "generate_campaign_concepts",
              description: "Generate 4 campaign concept suggestions",
              parameters: {
                type: "object",
                properties: {
                  concepts: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        script: { type: "string" },
                        ctaText: { type: "string" },
                        predictedCtr: { type: "number" },
                        predictedEngagement: { type: "string", enum: ["low", "medium", "high"] }
                      },
                      required: ["title", "description", "script", "ctaText", "predictedCtr", "predictedEngagement"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["concepts"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_campaign_concepts" } }
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
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    const concepts = JSON.parse(toolCall?.function?.arguments || '{"concepts":[]}').concepts;

    // Store concepts in database
    const campaignsToInsert = concepts.map((concept: any) => ({
      user_id: user.id,
      brand_id: brand.id,
      title: concept.title,
      description: concept.description,
      script: concept.script,
      cta_text: concept.ctaText,
      predicted_ctr: concept.predictedCtr,
      predicted_engagement: concept.predictedEngagement,
      ad_type: adType,
      goal: goal,
      target_audience: targetAudience,
      creative_style: creativeStyle,
      aspect_ratios: aspectRatios,
      prompt: prompt,
      status: 'concept'
    }));

    const { data: campaigns, error: insertError } = await supabase
      .from('campaigns')
      .insert(campaignsToInsert)
      .select();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error('Failed to save campaigns');
    }

    return new Response(JSON.stringify({ campaigns }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-ideas:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
