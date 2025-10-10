import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { url } = await req.json();

    if (!url) {
      throw new Error('URL is required');
    }

    // Parse provider and videoId from URL
    let provider = '';
    let videoId = '';
    let title = '';
    let thumbnail = '';
    let embedUrl = '';

    // YouTube (including Shorts)
    const youtubeRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      provider = 'youtube';
      videoId = youtubeMatch[1];
      thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
      title = `Video YouTube ${videoId}`;
    }

    // TikTok (full and short links)
    const tiktokRegex = /(?:tiktok\.com\/@[^\/]+\/video\/(\d+)|vm\.tiktok\.com\/([a-zA-Z0-9]+))/;
    const tiktokMatch = url.match(tiktokRegex);
    if (tiktokMatch) {
      provider = 'tiktok';
      videoId = tiktokMatch[1] || tiktokMatch[2];
      thumbnail = '';
      // For short links, we can't embed directly, but we store the original URL
      embedUrl = tiktokMatch[1] ? `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}` : url;
      title = `Video TikTok ${videoId}`;
    }

    // Instagram
    const instagramRegex = /instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/;
    const instagramMatch = url.match(instagramRegex);
    if (instagramMatch) {
      provider = 'instagram';
      videoId = instagramMatch[1];
      thumbnail = '';
      embedUrl = url;
      title = `Post Instagram ${videoId}`;
    }

    if (!provider) {
      throw new Error('URL não suportada. Use YouTube, TikTok ou Instagram');
    }

    console.log(`Resolved external media for user ${user.id}: ${provider}/${videoId}`);

    return new Response(
      JSON.stringify({
        provider,
        videoId,
        url,
        title,
        thumbnail,
        embedUrl,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in resolve-external-media:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: error.message === 'Unauthorized' ? 401 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
