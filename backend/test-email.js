import nodemailer from 'nodemailer';

// Test the new email configuration
async function testEmailService() {
  console.log('[Email Test] Testing SMTP configuration...');
  
  // Check if environment variables are set
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('[Email Test] Missing SMTP credentials');
    console.log('Required environment variables:');
    console.log('- SMTP_USER (your email address)');
    console.log('- SMTP_PASS (your app password)');
    return;
  }
  
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  
  try {
    // Test connection
    await transporter.verify();
    console.log('[Email Test] ✅ SMTP connection successful');
    
    // Test sending email (optional - uncomment to test)
    /*
    const testMail = {
      from: `"Test" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to yourself for testing
      subject: 'Test Email from Abu Kartona',
      html: '<h1>Test Successful!</h1><p>Your email service is working correctly.</p>'
    };
    
    const info = await transporter.sendMail(testMail);
    console.log('[Email Test] ✅ Test email sent:', info.messageId);
    */
    
  } catch (error) {
    console.error('[Email Test] ❌ Email test failed:', error.message);
    console.log('\nTroubleshooting tips:');
    console.log('1. Make sure 2-Step Verification is enabled on your Google account');
    console.log('2. Generate an App Password: https://myaccount.google.com/apppasswords');
    console.log('3. Use the App Password (16 characters) as SMTP_PASS');
    console.log('4. Make sure SMTP_USER matches your Gmail address');
  }
}

// Run the test
testEmailService().catch(console.error);
