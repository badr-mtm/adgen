import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { landingPageUrl } = await req.json();

    if (!landingPageUrl) {
      return new Response(
        JSON.stringify({ 
          colors: ["#000000"], 
          fonts: { heading: "Inter", body: "Inter" },
          message: "No URL provided"
        }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Try to fetch the landing page
    let response;
    try {
      response = await fetch(landingPageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BrandIngest/1.0)',
        },
      });
    } catch (fetchError) {
      console.log("Could not fetch landing page (DNS/network error):", fetchError);
      // Return default values if fetch fails (DNS errors, network issues, etc.)
      return new Response(
        JSON.stringify({ 
          colors: ["#000000"], 
          fonts: { heading: "Inter", body: "Inter" },
          message: "Could not fetch landing page, using defaults"
        }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!response.ok) {
      console.log("Landing page returned error:", response.status);
      return new Response(
        JSON.stringify({ 
          colors: ["#000000"], 
          fonts: { heading: "Inter", body: "Inter" },
          message: "Landing page not accessible"
        }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const html = await response.text();

    // Extract colors from CSS and inline styles
    const colorRegex = /#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b/g;
    const rgbRegex = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g;
    
    const hexColors = [...html.matchAll(colorRegex)].map(match => `#${match[1]}`);
    const rgbMatches = [...html.matchAll(rgbRegex)];
    const rgbColors = rgbMatches.map(match => {
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    });

    let colors = [...new Set([...hexColors, ...rgbColors])];
    
    // Filter out common background colors and keep only primary colors
    colors = colors.filter(color => {
      const hex = color.toLowerCase();
      return hex !== '#ffffff' && hex !== '#fff' && hex !== '#000000' && hex !== '#000';
    }).slice(0, 5);

    // Extract fonts
    const fontRegex = /font-family:\s*([^;}"']+)/gi;
    const fontMatches = [...html.matchAll(fontRegex)];
    const fonts = [...new Set(fontMatches.map(match => 
      match[1].trim().split(',')[0].replace(/["']/g, '')
    ))];

    const headingFont = fonts[0] || "Inter";
    const bodyFont = fonts[1] || fonts[0] || "Inter";

    console.log("Extracted brand data:", {
      colors: colors.length > 0 ? colors : ["#000000"],
      fonts: { heading: headingFont, body: bodyFont },
    });

    return new Response(
      JSON.stringify({
        colors: colors.length > 0 ? colors : ["#000000"],
        fonts: { heading: headingFont, body: bodyFont },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error("Error in brand-ingest:", error);
    // Always return success with defaults instead of failing the whole flow
    return new Response(
      JSON.stringify({ 
        colors: ["#000000"], 
        fonts: { heading: "Inter", body: "Inter" },
        message: "Error processing landing page, using defaults"
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
