import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const BOT_TOKEN = Deno.env.get("BOT_TOKEN") || ""

serve(async (req) => {
  try {
    const { record } = await req.json() // From Supabase Webhook
    
    // In a real scenario, you'd fetch the manufacturer's telegram_id
    // For now, we assume we have it or use a placeholder
    // This function should be triggered by a Database Webhook on 'orders' INSERT
    
    const message = `🆕 New order #${record.order_number}\n💰 Total: $${record.total_amount}\n📍 ${record.delivery_address}\n\nOpen app to review.`

    // We need the recipient's telegram_id. 
    // Usually you'd fetch it from the 'users' table using record.manufacturer_id
    
    return new Response(JSON.stringify({ status: 'Notification logic ready' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})
