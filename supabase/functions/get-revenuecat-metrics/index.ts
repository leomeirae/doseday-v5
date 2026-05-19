import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const rcApikey = Deno.env.get('RC_API_KEY_V2')
    
    if (!rcApikey) {
      throw new Error('RC_API_KEY_V2 variable is not set')
    }

    const projectId = 'proj521a5bc0' // Passed from previous context
    // V2 API metrics endpoint
    const url = `https://api.revenuecat.com/v2/projects/${projectId}/metrics/overview`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${rcApikey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`RevenueCat API Error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
