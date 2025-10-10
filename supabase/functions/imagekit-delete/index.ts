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

    const { fileId, productId } = await req.json();

    // Verify user owns this product
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

    const privateKey = Deno.env.get('IMAGEKIT_PRIVATE_KEY');
    const urlEndpoint = Deno.env.get('IMAGEKIT_URL_ENDPOINT');

    if (!privateKey || !urlEndpoint) {
      throw new Error('ImageKit credentials not configured');
    }

    // Delete file from ImageKit
    const deleteUrl = `https://api.imagekit.io/v1/files/${fileId}`;
    const authString = btoa(`${privateKey}:`);

    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${authString}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete file');
    }

    console.log(`Deleted ImageKit file ${fileId} for user ${user.id}`);

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in imagekit-delete:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: error.message === 'Unauthorized' ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
