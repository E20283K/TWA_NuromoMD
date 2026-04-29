import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const BOT_TOKEN = Deno.env.get("BOT_TOKEN") || ""
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || ""
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    const { initData } = await req.json()
    
    // 1. Validate HMAC
    const encoder = new TextEncoder()
    const checkString = Object.entries(
      Object.fromEntries(new URLSearchParams(initData))
    )
      .filter(([key]) => key !== 'hash')
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')

    const secretKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode('WebAppData'),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const secret = await crypto.subtle.sign('HMAC', secretKey, encoder.encode(BOT_TOKEN))
    
    const signatureKey = await crypto.subtle.importKey(
      'raw',
      secret,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const signature = await crypto.subtle.sign('HMAC', signatureKey, encoder.encode(checkString))
    
    const hexHash = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    const hash = new URLSearchParams(initData).get('hash')
    if (hexHash !== hash) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 403 })
    }

    // 2. Parse User Data
    const params = new URLSearchParams(initData)
    const tgUser = JSON.parse(params.get('user') || '{}')

    // 3. Upsert User in Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    const { data: user, error } = await supabase
      .from('users')
      .upsert({
        telegram_id: tgUser.id,
        telegram_username: tgUser.username,
        full_name: `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim(),
      }, { onConflict: 'telegram_id' })
      .select()
      .single()

    if (error) throw error

    return new Response(JSON.stringify({ user }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})
