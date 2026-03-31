const OTP = require('../models/OTP');
const { sendOTPEmail, sendPasswordResetEmail } = require('../utils/emailService');

/**
 * Generate a random 6-digit OTP
 * @returns {string} - 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Create and send OTP for signup
 * @param {string} email - User's email
 * @param {string} name - User's name
 * @param {string} password - User's password
 * @param {string} gender - User's gender
 * @returns {Promise<{success: boolean, message: string}>}
 */
const createSignupOTP = async (email, name, password, gender) => {
  try {
    const otp = generateOTP();

    // Delete any existing OTP for this email
    await OTP.deleteMany({ email });

    // Create new OTP record for signup
    const otpRecord = new OTP({
      email,
      otp,
      purpose: 'signup',
      userData: {
        name,
        password,
        gender
      }
    });

    await otpRecord.save();

    // Send OTP email
    await sendOTPEmail(email, otp, name);

    return {
      success: true,
      message: 'OTP sent to your email'
    };
  } catch (error) {
    console.error('Create Signup OTP Error:', error);
    throw error;
  }
};

/**
 * Create and send OTP for password reset
 * @param {string} email - User's email
 * @param {string} name - User's name
 * @returns {Promise<{success: boolean, message: string}>}
 */
const createPasswordResetOTP = async (email, name) => {
  try {
    const otp = generateOTP();

    // Delete any existing OTP for this email
    await OTP.deleteMany({ email });

    // Create new OTP record for password reset
    const otpRecord = new OTP({
      email,
      otp,
      purpose: 'password-reset',
      userData: {
        name,
        email
      }
    });

    await otpRecord.save();

    // Send Password Reset OTP email
    await sendPasswordResetEmail(email, otp, name);

    return {
      success: true,
      message: 'Password reset OTP sent to your email'
    };
  } catch (error) {
    console.error('Create Password Reset OTP Error:', error);
    throw error;
  }
};

/**
 * Resend OTP for signup
 * @param {string} email - User's email
 * @returns {Promise<{success: boolean, message: string}>}
 */
const resendSignupOTP = async (email) => {
  try {
    // Find existing OTP record for signup
    const otpRecord = await OTP.findOne({ email, purpose: 'signup' });

    if (!otpRecord) {
      return {
        success: false,
        message: 'No pending signup verification found for this email'
      };
    }

    // Generate new OTP
    const newOtp = generateOTP();

    // Update OTP
    otpRecord.otp = newOtp;
    otpRecord.createdAt = Date.now();
    await otpRecord.save();

    // Send OTP email
    await sendOTPEmail(email, newOtp, otpRecord.userData.name);

    return {
      success: true,
      message: 'New OTP sent to your email'
    };
  } catch (error) {
    console.error('Resend Signup OTP Error:', error);
    throw error;
  }
};

/**
 * Resend OTP for password reset
 * @param {string} email - User's email
 * @returns {Promise<{success: boolean, message: string}>}
 */
const resendPasswordResetOTP = async (email) => {
  try {
    // Find existing OTP record for password reset
    const otpRecord = await OTP.findOne({ email, purpose: 'password-reset' });

    if (!otpRecord) {
      return {
        success: false,
        message: 'No pending password reset found for this email'
      };
    }

    // Generate new OTP
    const newOtp = generateOTP();

    // Update OTP
    otpRecord.otp = newOtp;
    otpRecord.createdAt = Date.now();
    await otpRecord.save();

    // Send OTP email
    await sendPasswordResetEmail(email, newOtp, otpRecord.userData.name);

    return {
      success: true,
      message: 'New OTP sent to your email'
    };
  } catch (error) {
    console.error('Resend Password Reset OTP Error:', error);
    throw error;
  }
};

/**
 * Verify OTP for signup
 * @param {string} email - User's email
 * @param {string} otp - OTP to verify
 * @returns {Promise<{success: boolean, message: string, userData?: object}>}
 */
const verifySignupOTP = async (email, otp) => {
  try {
    // Find OTP record
    const otpRecord = await OTP.findOne({ email, otp, purpose: 'signup' });

    if (!otpRecord) {
      return {
        success: false,
        message: 'Invalid or expired OTP'
      };
    }

    // Check if OTP is expired (10 minutes)
    const otpAge = Date.now() - otpRecord.createdAt;
    if (otpAge > 10 * 60 * 1000) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return {
        success: false,
        message: 'OTP has expired. Please request a new one.'
      };
    }

    return {
      success: true,
      message: 'OTP verified successfully',
      userData: otpRecord.userData
    };
  } catch (error) {
    console.error('Verify Signup OTP Error:', error);
    throw error;
  }
};

/**
 * Verify OTP for password reset (only validates, doesn't reset password)
 * @param {string} email - User's email
 * @param {string} otp - OTP to verify
 * @returns {Promise<{success: boolean, message: string}>}
 */
const verifyPasswordResetOTP = async (email, otp) => {
  try {
    // Find OTP record
    const otpRecord = await OTP.findOne({ email, otp, purpose: 'password-reset' });

    if (!otpRecord) {
      return {
        success: false,
        message: 'Invalid or expired OTP'
      };
    }

    // Check if OTP is expired (10 minutes)
    const otpAge = Date.now() - otpRecord.createdAt;
    if (otpAge > 10 * 60 * 1000) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return {
        success: false,
        message: 'OTP has expired. Please request a new one.'
      };
    }

    return {
      success: true,
      message: 'OTP verified successfully'
    };
  } catch (error) {
    console.error('Verify Password Reset OTP Error:', error);
    throw error;
  }
};

/**
 * Delete OTP record
 * @param {string} email - User's email
 * @param {string} purpose - Purpose of OTP (signup or password-reset)
 * @returns {Promise<void>}
 */
const deleteOTP = async (email, purpose) => {
  try {
    await OTP.deleteOne({ email, purpose });
  } catch (error) {
    console.error('Delete OTP Error:', error);
    throw error;
  }
};

module.exports = {
  generateOTP,
  createSignupOTP,
  createPasswordResetOTP,
  resendSignupOTP,
  resendPasswordResetOTP,
  verifySignupOTP,
  verifyPasswordResetOTP,
  deleteOTP
};
