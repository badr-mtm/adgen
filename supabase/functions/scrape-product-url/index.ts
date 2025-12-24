import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScrapedProduct {
  title: string;
  description: string;
  images: string[];
  videos: string[];
  brand?: string;
  price?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      console.error('No URL provided');
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Scraping product URL:', formattedUrl);

    // Use Firecrawl to scrape the page with multiple formats
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['markdown', 'html', 'links'],
        onlyMainContent: false,
        waitFor: 2000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || `Request failed with status ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Scrape successful, extracting product data...');

    // Extract product information from the scraped data
    const html = data.data?.html || data.html || '';
    const markdown = data.data?.markdown || data.markdown || '';
    const metadata = data.data?.metadata || data.metadata || {};

    // Extract images from HTML using regex
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    const ogImageRegex = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi;
    const srcsetRegex = /srcset=["']([^"']+)["']/gi;
    
    const images: string[] = [];
    const videos: string[] = [];
    
    // Extract og:image first (usually the main product image)
    let ogMatch;
    while ((ogMatch = ogImageRegex.exec(html)) !== null) {
      const imgUrl = ogMatch[1];
      if (imgUrl && !images.includes(imgUrl) && isValidImageUrl(imgUrl)) {
        images.push(imgUrl);
      }
    }

    // Extract regular images
    let match;
    while ((match = imgRegex.exec(html)) !== null) {
      const imgUrl = match[1];
      if (imgUrl && !images.includes(imgUrl) && isValidImageUrl(imgUrl)) {
        images.push(imgUrl);
      }
    }

    // Extract videos (native video elements)
    const videoRegex = /<video[^>]*>[\s\S]*?<source[^>]+src=["']([^"']+)["'][^>]*>[\s\S]*?<\/video>/gi;
    const videoSrcRegex = /<video[^>]+src=["']([^"']+)["'][^>]*>/gi;
    
    while ((match = videoRegex.exec(html)) !== null) {
      const videoUrl = match[1];
      if (videoUrl && !videos.includes(videoUrl) && isValidVideoUrl(videoUrl)) {
        videos.push(videoUrl);
      }
    }
    
    while ((match = videoSrcRegex.exec(html)) !== null) {
      const videoUrl = match[1];
      if (videoUrl && !videos.includes(videoUrl) && isValidVideoUrl(videoUrl)) {
        videos.push(videoUrl);
      }
    }

    // Extract YouTube embeds
    const youtubeIframeRegex = /(?:<iframe[^>]+src=["'](?:https?:)?\/\/(?:www\.)?youtube(?:-nocookie)?\.com\/embed\/([a-zA-Z0-9_-]{11})[^"']*["'][^>]*>|youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})|youtu\.be\/([a-zA-Z0-9_-]{11}))/gi;
    while ((match = youtubeIframeRegex.exec(html)) !== null) {
      const videoId = match[1] || match[2] || match[3];
      if (videoId) {
        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
        if (!videos.includes(youtubeUrl)) {
          videos.push(youtubeUrl);
        }
      }
    }

    // Also check markdown for YouTube links
    const youtubeMarkdownRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/gi;
    while ((match = youtubeMarkdownRegex.exec(markdown)) !== null) {
      const videoId = match[1];
      if (videoId) {
        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
        if (!videos.includes(youtubeUrl)) {
          videos.push(youtubeUrl);
        }
      }
    }

    // Extract Vimeo embeds
    const vimeoIframeRegex = /(?:<iframe[^>]+src=["'](?:https?:)?\/\/(?:player\.)?vimeo\.com\/(?:video\/)?(\d+)[^"']*["'][^>]*>|vimeo\.com\/(\d+))/gi;
    while ((match = vimeoIframeRegex.exec(html)) !== null) {
      const videoId = match[1] || match[2];
      if (videoId) {
        const vimeoUrl = `https://vimeo.com/${videoId}`;
        if (!videos.includes(vimeoUrl)) {
          videos.push(vimeoUrl);
        }
      }
    }

    // Also check markdown for Vimeo links
    const vimeoMarkdownRegex = /vimeo\.com\/(\d+)/gi;
    while ((match = vimeoMarkdownRegex.exec(markdown)) !== null) {
      const videoId = match[1];
      if (videoId) {
        const vimeoUrl = `https://vimeo.com/${videoId}`;
        if (!videos.includes(vimeoUrl)) {
          videos.push(vimeoUrl);
        }
      }
    }

    // Extract title from metadata or markdown
    const title = metadata.title || extractTitle(markdown) || 'Product';
    
    // Extract description
    const description = metadata.description || extractDescription(markdown) || '';

    const product: ScrapedProduct = {
      title,
      description,
      images: images.slice(0, 10), // Limit to 10 images
      videos: videos.slice(0, 5), // Limit to 5 videos
      brand: metadata.siteName || undefined,
      price: extractPrice(html) || undefined,
    };

    console.log(`Found ${product.images.length} images and ${product.videos.length} videos`);

    return new Response(
      JSON.stringify({ success: true, product }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error scraping product URL:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to scrape product URL';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function isValidImageUrl(url: string): boolean {
  if (!url || url.startsWith('data:')) return false;
  const lowerUrl = url.toLowerCase();
  // Filter out icons, logos, and tiny images
  if (lowerUrl.includes('icon') || lowerUrl.includes('logo') || lowerUrl.includes('favicon')) return false;
  if (lowerUrl.includes('1x1') || lowerUrl.includes('pixel')) return false;
  // Accept common image formats
  return lowerUrl.match(/\.(jpg|jpeg|png|webp|gif|avif)/i) !== null || 
         lowerUrl.includes('/images/') || 
         lowerUrl.includes('/product') ||
         lowerUrl.includes('cdn');
}

function isValidVideoUrl(url: string): boolean {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return lowerUrl.match(/\.(mp4|webm|mov|m3u8)/i) !== null;
}

function extractTitle(markdown: string): string | null {
  const h1Match = markdown.match(/^#\s+(.+)$/m);
  if (h1Match) return h1Match[1].trim();
  return null;
}

function extractDescription(markdown: string): string | null {
  // Get first paragraph that's not a heading
  const paragraphs = markdown.split('\n\n');
  for (const p of paragraphs) {
    const trimmed = p.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.length > 50 && trimmed.length < 500) {
      return trimmed;
    }
  }
  return null;
}

function extractPrice(html: string): string | null {
  // Common price patterns
  const priceRegex = /(?:\$|£|€|USD|GBP|EUR)\s*[\d,]+(?:\.\d{2})?/gi;
  const match = html.match(priceRegex);
  return match ? match[0] : null;
}
