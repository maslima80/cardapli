import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as crypto from "https://deno.land/std@0.170.0/node/crypto.ts";

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

    // Get user from auth
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

    // Parse request body (may be empty)
    let productId = null;
    try {
      const body = await req.json();
      productId = body?.productId;
    } catch {
      // No body or invalid JSON, continue without productId
    }

    // Verify user owns this product if productId provided
    if (productId) {
      const { data: product, error: productError } = await supabaseClient
        .from('products')
        .select('user_id')
        .eq('id', productId)
        .single();

      if (productError || !product || product.user_id !== user.id) {
        throw new Error('Unauthorized - product not owned by user');
      }
    }

    // Generate signature for ImageKit
    const privateKey = Deno.env.get('IMAGEKIT_PRIVATE_KEY');
    const publicKey = Deno.env.get('IMAGEKIT_PUBLIC_KEY');

    if (!privateKey || !publicKey) {
      throw new Error('ImageKit credentials not configured');
    }

    const token = crypto.randomUUID();
    const expire = Math.floor(Date.now() / 1000) + 60; // 60 seconds from now
    
    const signatureString = token + expire;
    const signature = crypto
      .createHmac('sha1', privateKey)
      .update(signatureString)
      .digest('hex');

    // Build folder path
    const folder = `/users/${user.id}/${productId ? `products/${productId}` : 'catalogs'}`;
    const uploadEndpoint = 'https://upload.imagekit.io/api/v1/files/upload';

    console.log('Generated ImageKit signature for user:', user.id);

    return new Response(
      JSON.stringify({
        token,
        expire,
        signature,
        publicKey,
        folder,
        uploadEndpoint,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in imagekit-signature:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: error.message === 'Unauthorized' ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
