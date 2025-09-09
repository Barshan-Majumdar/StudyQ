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
    const { to, subject, message, pdfUrl, fileName } = await req.json()
    
    // Validate required fields
    if (!to || !subject || !message) {
      throw new Error('Missing required fields: to, subject, message')
    }
    
    // Get SendGrid credentials from environment variables
    const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY')
    const fromEmail = Deno.env.get('FROM_EMAIL')
    
    if (!sendGridApiKey || !fromEmail) {
      throw new Error('Missing SendGrid credentials in environment variables')
    }
    
    console.log(`Sending email to: ${to}`)
    
    // Prepare email data
    const emailData = {
      personalizations: [{
        to: [{ email: to }],
        subject: subject
      }],
      from: { 
        email: fromEmail, 
        name: 'StudyQ Library' 
      },
      content: [{
        type: 'text/html',
        value: message
      }]
    }
    
    // Add PDF attachment if URL provided
    if (pdfUrl) {
      try {
        console.log(`Downloading PDF from: ${pdfUrl}`)
        
        // Download PDF file
        const pdfResponse = await fetch(pdfUrl)
        if (!pdfResponse.ok) {
          throw new Error(`Failed to download PDF: ${pdfResponse.statusText}`)
        }
        
        const pdfBuffer = await pdfResponse.arrayBuffer()
        const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)))
        
        // Add attachment to email
        emailData.attachments = [{
          content: pdfBase64,
          filename: fileName || 'document.pdf',
          type: 'application/pdf',
          disposition: 'attachment'
        }]
        
        console.log(`PDF attachment prepared: ${fileName || 'document.pdf'}`)
      } catch (pdfError) {
        console.warn(`Failed to attach PDF: ${pdfError.message}`)
        // Continue without attachment rather than failing completely
      }
    }
    
    // Send email via SendGrid API
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendGridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })
    
    if (response.ok) {
      console.log(`Email sent successfully to: ${to}`)
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Email sent successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } else {
      const errorText = await response.text()
      console.error('SendGrid API error:', errorText)
      throw new Error(`SendGrid error: ${errorText}`)
    }
    
  } catch (error) {
    console.error('Email function error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})