const nodemailer = require('nodemailer');

/**
 * Email Service - Handles sending emails via Gmail SMTP
 */

// Create reusable transporter using Gmail
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send OTP email to user
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} name - User's name
 */
const sendOTPEmail = async (email, otp, name) => {
  try {
    const mailOptions = {
      from: `"InternTrack Team" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: '🔐 Email Verification - InternTrack',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Segoe UI', 'Poppins', Arial, sans-serif;
              background-color: #f5f5f5;
              margin: 0;
              padding: 0;
              line-height: 1.6;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 8px 24px rgba(0,0,0,0.12);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: #ffffff;
              padding: 40px 30px;
              text-align: center;
            }
            .header-icon {
              font-size: 48px;
              margin-bottom: 10px;
            }
            .header h1 {
              margin: 0;
              font-size: 32px;
              font-weight: 600;
            }
            .header p {
              margin: 8px 0 0 0;
              font-size: 14px;
              opacity: 0.9;
            }
            .content {
              padding: 40px 35px;
            }
            .greeting {
              font-size: 20px;
              color: #333;
              margin-bottom: 15px;
            }
            .message {
              color: #555;
              font-size: 15px;
              margin-bottom: 25px;
            }
            .otp-box {
              background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
              border: 2px solid #667eea;
              border-radius: 12px;
              padding: 30px;
              margin: 30px 0;
              text-align: center;
            }
            .otp-label {
              font-size: 13px;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 10px;
            }
            .otp-code {
              font-size: 42px;
              font-weight: 700;
              color: #667eea;
              letter-spacing: 12px;
              margin: 15px 0;
              font-family: 'Courier New', monospace;
            }
            .otp-validity {
              font-size: 13px;
              color: #888;
              margin-top: 10px;
            }
            .warning-box {
              background-color: #fff3e0;
              border-left: 4px solid #ff9800;
              padding: 15px 20px;
              margin: 25px 0;
              border-radius: 4px;
            }
            .warning-box p {
              margin: 0;
              color: #e65100;
              font-size: 14px;
            }
            .info-text {
              color: #666;
              font-size: 14px;
              line-height: 1.8;
              margin: 20px 0;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 25px;
              text-align: center;
              border-top: 1px solid #e0e0e0;
            }
            .footer p {
              margin: 5px 0;
              font-size: 13px;
              color: #888;
            }
            .footer-links {
              margin-top: 15px;
            }
            .footer-links a {
              color: #667eea;
              text-decoration: none;
              margin: 0 10px;
              font-size: 12px;
            }
            @media only screen and (max-width: 600px) {
              .container {
                margin: 20px 10px;
              }
              .header {
                padding: 30px 20px;
              }
              .content {
                padding: 30px 20px;
              }
              .otp-code {
                font-size: 36px;
                letter-spacing: 8px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="header-icon">🎓</div>
              <h1>InternTrack</h1>
              <p>Internship & Hackathon Management System</p>
            </div>
            <div class="content">
              <div class="greeting">Hello ${name}! 👋</div>
              <p class="message">
                Thank you for joining InternTrack! We're excited to help you manage your internships and hackathons.
              </p>
              <p class="message">
                To complete your registration and verify your email address, please use the One-Time Password (OTP) below:
              </p>
              
              <div class="otp-box">
                <div class="otp-label">Your Verification Code</div>
                <div class="otp-code">${otp}</div>
                <div class="otp-validity">⏱️ Valid for 10 minutes</div>
              </div>
              
              <div class="info-text">
                Simply enter this code on the verification page to activate your account and start exploring InternTrack's features.
              </div>
              
              <div class="warning-box">
                <p>🔒 <strong>Security Notice:</strong> Never share this OTP with anyone. InternTrack will never ask you for this code via email, phone, or any other method.</p>
              </div>
              
              <div class="info-text" style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <strong>Need help?</strong> If you have any questions or didn't request this verification, please contact our support team.
              </div>
            </div>
            <div class="footer">
              <p><strong>InternTrack Team</strong></p>
              <p>Empowering students to track their career journey</p>
              <p style="margin-top: 15px; color: #aaa;">
                If you didn't create an account with InternTrack, please ignore this email.
              </p>
              <p style="margin-top: 15px; font-size: 12px; color: #999;">
                &copy; 2026 InternTrack. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw new Error('Failed to send OTP email');
  }
};

/**
 * Send Password Reset OTP email to user
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} name - User's name
 */
const sendPasswordResetEmail = async (email, otp, name) => {
  try {
    const mailOptions = {
      from: `"InternTrack Team" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: '🔐 Password Reset Request - InternTrack',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Segoe UI', 'Poppins', Arial, sans-serif;
              background-color: #f5f5f5;
              margin: 0;
              padding: 0;
              line-height: 1.6;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 8px 24px rgba(0,0,0,0.12);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: #ffffff;
              padding: 40px 30px;
              text-align: center;
            }
            .header-icon {
              font-size: 48px;
              margin-bottom: 10px;
            }
            .header h1 {
              margin: 0;
              font-size: 32px;
              font-weight: 600;
            }
            .header p {
              margin: 8px 0 0 0;
              font-size: 14px;
              opacity: 0.9;
            }
            .content {
              padding: 40px 35px;
            }
            .greeting {
              font-size: 20px;
              color: #333;
              margin-bottom: 15px;
            }
            .message {
              color: #555;
              font-size: 15px;
              margin-bottom: 25px;
            }
            .otp-box {
              background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
              border: 2px solid #ff9800;
              border-radius: 12px;
              padding: 30px;
              margin: 30px 0;
              text-align: center;
            }
            .otp-label {
              font-size: 13px;
              color: #e65100;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 10px;
              font-weight: 600;
            }
            .otp-code {
              font-size: 42px;
              font-weight: 700;
              color: #e65100;
              letter-spacing: 12px;
              margin: 15px 0;
              font-family: 'Courier New', monospace;
            }
            .otp-validity {
              font-size: 13px;
              color: #f57c00;
              margin-top: 10px;
            }
            .warning-box {
              background-color: #ffebee;
              border-left: 4px solid #d32f2f;
              padding: 15px 20px;
              margin: 25px 0;
              border-radius: 4px;
            }
            .warning-box p {
              margin: 0;
              color: #c62828;
              font-size: 14px;
            }
            .info-text {
              color: #666;
              font-size: 14px;
              line-height: 1.8;
              margin: 20px 0;
            }
            .alert-box {
              background-color: #e3f2fd;
              border-left: 4px solid #2196f3;
              padding: 15px 20px;
              margin: 25px 0;
              border-radius: 4px;
            }
            .alert-box p {
              margin: 0;
              color: #1565c0;
              font-size: 14px;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 25px;
              text-align: center;
              border-top: 1px solid #e0e0e0;
            }
            .footer p {
              margin: 5px 0;
              font-size: 13px;
              color: #888;
            }
            @media only screen and (max-width: 600px) {
              .container {
                margin: 20px 10px;
              }
              .header {
                padding: 30px 20px;
              }
              .content {
                padding: 30px 20px;
              }
              .otp-code {
                font-size: 36px;
                letter-spacing: 8px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="header-icon">🔒</div>
              <h1>Password Reset</h1>
              <p>InternTrack Security</p>
            </div>
            <div class="content">
              <div class="greeting">Hello ${name}! 👋</div>
              <p class="message">
                We received a request to reset the password for your InternTrack account.
              </p>
              <p class="message">
                Use the One-Time Password (OTP) below to reset your password:
              </p>
              
              <div class="otp-box">
                <div class="otp-label">⚡ Password Reset Code</div>
                <div class="otp-code">${otp}</div>
                <div class="otp-validity">⏱️ Expires in 10 minutes</div>
              </div>
              
              <div class="info-text">
                Enter this code on the password reset page to create a new password for your account.
              </div>
              
              <div class="warning-box">
                <p>⚠️ <strong>Important:</strong> If you didn't request a password reset, please ignore this email and ensure your account is secure. Consider changing your password if you suspect unauthorized access.</p>
              </div>
              
              <div class="alert-box">
                <p>💡 <strong>Security Tip:</strong> Never share your OTP with anyone. InternTrack support will never ask for this code.</p>
              </div>
              
              <div class="info-text" style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <strong>Need help?</strong> If you're having trouble resetting your password or have security concerns, please contact our support team immediately.
              </div>
            </div>
            <div class="footer">
              <p><strong>InternTrack Team</strong></p>
              <p>Empowering students to track their career journey</p>
              <p style="margin-top: 15px; color: #aaa;">
                This is an automated security email. Please do not reply to this message.
              </p>
              <p style="margin-top: 15px; font-size: 12px; color: #999;">
                &copy; 2026 InternTrack. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password Reset Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw new Error('Failed to send password reset email');
  }
};

module.exports = { sendOTPEmail, sendPasswordResetEmail };
