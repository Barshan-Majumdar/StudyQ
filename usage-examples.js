// Import the delivery service functions
import { 
  sendWhatsApp, 
  sendEmail, 
  deliverToDefaults, 
  sendToMultipleRecipients,
  isValidPhoneNumber,
  isValidEmail,
  formatPhoneNumber 
} from './delivery-service.js'

// Example 1: Send WhatsApp message with PDF
async function exampleWhatsApp() {
  try {
    console.log('🚀 Example 1: Sending WhatsApp with PDF')
    
    const result = await sendWhatsApp(
      '+918653028954', // Phone number with country code
      'Hello! Here is your requested study material from StudyQ Library. Please check the attached PDF.',
      'https://example.com/study-material.pdf', // Replace with actual PDF URL
      'Advanced-Mathematics-Notes.pdf'
    )
    
    console.log('✅ WhatsApp sent successfully:', result)
  } catch (error) {
    console.error('❌ WhatsApp failed:', error.message)
  }
}

// Example 2: Send email with PDF attachment
async function exampleEmail() {
  try {
    console.log('🚀 Example 2: Sending Email with PDF')
    
    const result = await sendEmail(
      'student@example.com',
      'Your StudyQ Library Document Request',
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">📚 StudyQ Library</h2>
        <p>Dear Student,</p>
        <p>Your requested document is ready for download. Please find the PDF attached to this email.</p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #495057;">Document Details:</h3>
          <ul>
            <li><strong>Title:</strong> Advanced Mathematics Notes</li>
            <li><strong>Category:</strong> Academic Material</li>
            <li><strong>Format:</strong> PDF</li>
          </ul>
        </div>
        
        <p>If you have any questions, please feel free to contact our library team.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
          <p style="color: #6c757d; font-size: 12px;">
            Best regards,<br>
            StudyQ Library Team<br>
            <a href="mailto:studyq.library@gmail.com">studyq.library@gmail.com</a>
          </p>
        </div>
      </div>
      `,
      'https://example.com/study-material.pdf', // Replace with actual PDF URL
      'Advanced-Mathematics-Notes.pdf'
    )
    
    console.log('✅ Email sent successfully:', result)
  } catch (error) {
    console.error('❌ Email failed:', error.message)
  }
}

// Example 3: Send to default contacts (both email and WhatsApp)
async function exampleDefaults() {
  try {
    console.log('🚀 Example 3: Sending to Default Contacts')
    
    const result = await deliverToDefaults(
      'New student John Doe has registered and requested access to Digital Library resources. Please process the request.',
      'https://example.com/registration-form.pdf', // Replace with actual PDF URL
      'John-Doe-Registration.pdf',
      'New Student Registration - Action Required'
    )
    
    console.log('✅ Default delivery results:')
    console.log('📧 Email:', result.email.status === 'fulfilled' ? '✅ Success' : '❌ Failed')
    console.log('📱 WhatsApp:', result.whatsapp.status === 'fulfilled' ? '✅ Success' : '❌ Failed')
    console.log('📊 Summary:', result.summary)
  } catch (error) {
    console.error('❌ Default delivery failed:', error.message)
  }
}

// Example 4: Send to multiple recipients
async function exampleMultipleRecipients() {
  try {
    console.log('🚀 Example 4: Sending to Multiple Recipients')
    
    const recipients = [
      { type: 'email', address: 'librarian@studyq.edu', name: 'Head Librarian' },
      { type: 'email', address: 'admin@studyq.edu', name: 'Admin Team' },
      { type: 'whatsapp', address: '+918653028954', name: 'Support Team' },
      { type: 'whatsapp', address: '+919876543210', name: 'Manager' }
    ]
    
    const results = await sendToMultipleRecipients(
      recipients,
      'Monthly library report is now available. Please review the attached document.',
      'https://example.com/monthly-report.pdf', // Replace with actual PDF URL
      'StudyQ-Monthly-Report-Sept-2025.pdf',
      'StudyQ Library - Monthly Report September 2025'
    )
    
    console.log('✅ Multiple recipient delivery results:')
    results.forEach((result, index) => {
      const status = result.status === 'fulfilled' ? '✅' : '❌'
      console.log(`${status} ${result.recipient.type}: ${result.recipient.address} (${result.recipient.name})`)
      if (result.error) {
        console.log(`   Error: ${result.error}`)
      }
    })
  } catch (error) {
    console.error('❌ Multiple recipient delivery failed:', error.message)
  }
}

// Example 5: Validation utilities
function exampleValidation() {
  console.log('🚀 Example 5: Input Validation')
  
  // Test phone numbers
  const phoneNumbers = ['+918653028954', '918653028954', '+1234567890', 'invalid-number']
  console.log('📱 Phone Number Validation:')
  phoneNumbers.forEach(phone => {
    const isValid = isValidPhoneNumber(phone)
    const formatted = isValid ? phone : formatPhoneNumber(phone)
    console.log(`  ${phone} → Valid: ${isValid ? '✅' : '❌'} | Formatted: ${formatted}`)
  })
  
  // Test emails
  const emails = ['student@example.com', 'admin@studyq.edu', 'invalid-email', 'test@domain']
  console.log('📧 Email Validation:')
  emails.forEach(email => {
    const isValid = isValidEmail(email)
    console.log(`  ${email} → Valid: ${isValid ? '✅' : '❌'}`)
  })
}

// Example 6: Error handling
async function exampleErrorHandling() {
  try {
    console.log('🚀 Example 6: Error Handling Demo')
    
    // This will fail due to invalid phone number
    await sendWhatsApp(
      'invalid-phone-number',
      'This should fail',
      null,
      null
    )
  } catch (error) {
    console.log('✅ Error caught successfully:', error.message)
  }
}

// Run all examples
async function runAllExamples() {
  console.log('🎯 StudyQ Library Delivery System - Usage Examples')
  console.log('=' .repeat(50))
  
  // Note: Uncomment the examples you want to test
  // Make sure to replace example URLs with real PDF URLs
  
  // await exampleWhatsApp()
  // await exampleEmail()
  // await exampleDefaults()
  // await exampleMultipleRecipients()
  
  exampleValidation()
  await exampleErrorHandling()
  
  console.log('=' .repeat(50))
  console.log('✅ Examples completed!')
  console.log('\n💡 To test with real messages:')
  console.log('1. Copy your environment variables from .env.example to .env.local')
  console.log('2. Replace example URLs with real PDF URLs')
  console.log('3. Update phone numbers and email addresses')
  console.log('4. Uncomment the example functions you want to test')
}

// Run the examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples().catch(console.error)
}

// Export examples for use in other files
export {
  exampleWhatsApp,
  exampleEmail,
  exampleDefaults,
  exampleMultipleRecipients,
  exampleValidation,
  exampleErrorHandling,
  runAllExamples
}