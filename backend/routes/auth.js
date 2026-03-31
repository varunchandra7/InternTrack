const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const {
  createSignupOTP,
  resendSignupOTP,
  verifySignupOTP,
  createPasswordResetOTP,
  resendPasswordResetOTP,
  verifyPasswordResetOTP,
  deleteOTP
} = require('../services/otpService');

/**
 * Generate JWT Token
 * @param {string} userId - User's MongoDB ID
 * @returns {string} - JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d' // Token expires in 30 days
  });
};

/**
 * Validate Gmail address
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
const isValidGmailEmail = (email) => {
  return email && email.toLowerCase().endsWith('@gmail.com');
};

/**
 * @route   POST /api/auth/request-signup-otp
 * @desc    Request OTP for signup process
 * @access  Public
 */
router.post('/request-signup-otp', async (req, res) => {
  try {
    const { name, email, gender, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // Validate Gmail email
    if (!isValidGmailEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Only Gmail accounts (@gmail.com) are allowed'
      });
    }

    // Validate password
    if (password.length <= 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be more than 6 characters'
      });
    }

    // Check for invalid special characters (only @ and ! allowed)
    const invalidChars = /[^a-zA-Z0-9@!]/;
    if (invalidChars.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password can only contain letters, numbers, @ and ! symbols'
      });
    }

    // Set default gender if not provided or invalid
    let userGender = gender && ['Male', 'Female', 'Other'].includes(gender) ? gender : 'Other';

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create and send signup OTP
    await createSignupOTP(email, name, password, userGender);

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email. Please verify to complete signup.'
    });

  } catch (error) {
    console.error('Request Signup OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during signup request',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/signup
 * @desc    Create user account directly (kept for backward compatibility)
 * @access  Public
 */
router.post('/signup', async (req, res) => {
  // Redirect users to use request-signup-otp + verify-signup-otp flow
  return res.status(400).json({
    success: false,
    message: 'Please use the OTP verification flow: /request-signup-otp then /verify-signup-otp'
  });
});

/**
 * @route   POST /api/auth/verify-signup-otp
 * @desc    Verify OTP and create user account
 * @access  Public
 */
router.post('/verify-signup-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP'
      });
    }

    // Verify OTP
    const verifyResult = await verifySignupOTP(email, otp);

    if (!verifyResult.success) {
      return res.status(400).json(verifyResult);
    }

    // Create user account
    const user = await User.create({
      name: verifyResult.userData.name,
      email: email,
      gender: verifyResult.userData.gender,
      password: verifyResult.userData.password,
      isVerified: true
    });

    // Delete OTP record
    await deleteOTP(email, 'signup');

    // Generate token
    const token = generateToken(user._id);

    // Send response
    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Signup OTP Verification Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during verification',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and create user account (kept for backward compatibility)
 * @access  Public
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP'
      });
    }

    // Verify OTP
    const verifyResult = await verifySignupOTP(email, otp);

    if (!verifyResult.success) {
      return res.status(400).json(verifyResult);
    }

    // Create user account
    const user = await User.create({
      name: verifyResult.userData.name,
      email: email,
      gender: verifyResult.userData.gender,
      password: verifyResult.userData.password,
      isVerified: true
    });

    // Delete OTP record
    await deleteOTP(email, 'signup');

    // Generate token
    const token = generateToken(user._id);

    // Send response
    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('OTP Verification Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during verification',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/resend-signup-otp
 * @desc    Resend OTP for signup
 * @access  Public
 */
router.post('/resend-signup-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    // Resend signup OTP
    const resendResult = await resendSignupOTP(email);

    if (!resendResult.success) {
      return res.status(400).json(resendResult);
    }

    res.status(200).json(resendResult);

  } catch (error) {
    console.error('Resend Signup OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Resend OTP to email (kept for backward compatibility)
 * @access  Public
 */
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    // Try to resend signup OTP
    const resendResult = await resendSignupOTP(email);

    if (!resendResult.success) {
      return res.status(400).json(resendResult);
    }

    res.status(200).json(resendResult);

  } catch (error) {
    console.error('Resend OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Send response
    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send OTP for password reset
 * @access  Public
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    // Validate Gmail email
    if (!isValidGmailEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Only Gmail accounts (@gmail.com) are allowed'
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email'
      });
    }

    // Create and send password reset OTP
    await createPasswordResetOTP(email, user.name);

    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to your email'
    });

  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/verify-reset-otp
 * @desc    Verify OTP for password reset (without actually resetting)
 * @access  Public
 */
router.post('/verify-reset-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP'
      });
    }

    // Verify OTP
    const verifyResult = await verifyPasswordResetOTP(email, otp);

    if (!verifyResult.success) {
      return res.status(400).json(verifyResult);
    }

    res.status(200).json(verifyResult);

  } catch (error) {
    console.error('Verify Reset OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using OTP
 * @access  Public
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Validate input
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, OTP, and new password'
      });
    }

    // Validate password
    if (newPassword.length <= 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be more than 6 characters'
      });
    }

    // Validate password special characters
    const invalidChars = /[^a-zA-Z0-9@!]/;
    if (invalidChars.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password can only contain letters, numbers, @ and ! symbols'
      });
    }

    // Verify OTP first
    const verifyResult = await verifyPasswordResetOTP(email, otp);

    if (!verifyResult.success) {
      return res.status(400).json(verifyResult);
    }

    // Find user and update password
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    // Delete OTP record
    await deleteOTP(email, 'password-reset');

    res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now login with your new password.'
    });

  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/resend-forgot-otp
 * @desc    Resend OTP for password reset
 * @access  Public
 */
router.post('/resend-forgot-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    // Resend password reset OTP
    const resendResult = await resendPasswordResetOTP(email);

    if (!resendResult.success) {
      return res.status(400).json(resendResult);
    }

    res.status(200).json(resendResult);

  } catch (error) {
    console.error('Resend Forgot OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: error.message
    });
  }
});
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    // Find existing OTP record
    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'No pending password reset found for this email'
      });
    }

    // Generate new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Update OTP
    otpRecord.otp = newOtp;
    otpRecord.createdAt = Date.now();
    await otpRecord.save();

    // Send Password Reset OTP email
    await sendPasswordResetEmail(email, newOtp, otpRecord.userData.name);

    res.status(200).json({
      success: true,
      message: 'New password reset OTP sent to your email'
    });

  } catch (error) {
    console.error('Resend Forgot OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: error.message
    });
  }
});

module.exports = router;
