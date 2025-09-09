import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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
    // Parse request body
    const { to, message, pdfUrl, fileName } = await req.json()
    
    // Validate required fields
    if (!to || !message) {
      throw new Error('Missing required fields: to, message')
    }
    
    // Get Twilio credentials from environment variables
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const fromNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER')
    
    if (!accountSid || !authToken || !fromNumber) {
      throw new Error('Missing Twilio credentials in environment variables')
    }
    
    console.log(`Sending WhatsApp message to: ${to}`)
    
    // Prepare Twilio API request
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
    
    const body = new URLSearchParams()
    body.append('To', `whatsapp:${to}`)
    body.append('From', fromNumber)
    body.append('Body', message)
    
    // Add media URL if provided
    if (pdfUrl) {
      body.append('MediaUrl', pdfUrl)
      console.log(`Attaching media: ${pdfUrl}`)
    }
    
    // Send WhatsApp message via Twilio API
    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log(`WhatsApp message sent successfully. SID: ${result.sid}`)
      return new Response(JSON.stringify({ 
        success: true, 
        messageSid: result.sid,
        status: result.status 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } else {
      console.error('Twilio API error:', result)
      throw new Error(result.message || 'Failed to send WhatsApp message')
    }
    
  } catch (error) {
    console.error('WhatsApp function error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})