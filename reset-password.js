/**
 * Reset Password JavaScript
 * This page handles OTP verification for password reset
 */

const API_URL = 'http://localhost:5000/api';

// Get email from URL parameter
const urlParams = new URLSearchParams(window.location.search);
const userEmail = urlParams.get('email');

// Check if email exists
if (!userEmail) {
    window.location.href = 'forgot-password.html';
}

// Display email
document.getElementById('userEmail').textContent = userEmail;

// OTP Input Management
const otpInputs = document.querySelectorAll('.otp-input');

// Auto-focus next input
otpInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
        if (e.target.value.length === 1 && index < otpInputs.length - 1) {
            otpInputs[index + 1].focus();
        }
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            otpInputs[index - 1].focus();
        }
    });

    // Only allow numbers
    input.addEventListener('keypress', (e) => {
        if (!/[0-9]/.test(e.key)) {
            e.preventDefault();
        }
    });
});

// Focus first input on load
otpInputs[0].focus();

/**
 * Display message to user
 */
function showMessage(message, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';

    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 5000);
}

/**
 * Get OTP value from inputs
 */
function getOTP() {
    return Array.from(otpInputs).map(input => input.value).join('');
}

/**
 * Handle OTP verification
 */
document.getElementById('otpVerifyForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const otp = getOTP();
    const verifyBtn = document.getElementById('verifyOtpBtn');

    // Validate OTP
    if (otp.length !== 6) {
        showMessage('Please enter complete 6-digit OTP', 'error');
        return;
    }

    verifyBtn.disabled = true;
    verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';

    try {
        const response = await fetch(`${API_URL}/auth/verify-reset-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: userEmail,
                otp: otp
            })
        });

        const data = await response.json();

        if (data.success) {
            // Store email and OTP in sessionStorage for the next page
            sessionStorage.setItem('resetEmail', userEmail);
            sessionStorage.setItem('resetOTP', otp);
            
            // Add spinner to button
            verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redirecting...';

            // Redirect to new password page
            setTimeout(() => {
                window.location.href = 'new-password.html';
            }, 800);
        } else {
            showMessage(data.message || 'Invalid OTP', 'error');
            // Clear inputs
            otpInputs.forEach(input => input.value = '');
            otpInputs[0].focus();
        }
    } catch (error) {
        console.error('OTP Verification Error:', error);
        showMessage('Server error. Please try again later.', 'error');
    } finally {
        verifyBtn.disabled = false;
        verifyBtn.innerHTML = '<i class="fas fa-check-circle"></i> Verify OTP';
    }
});

/**
 * Resend OTP
 */
async function resendOTP() {
    const resendBtn = document.getElementById('resendBtn');

    resendBtn.disabled = true;
    resendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    try {
        const response = await fetch(`${API_URL}/auth/resend-forgot-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: userEmail })
        });

        const data = await response.json();

        if (data.success) {
            showMessage('New OTP sent to your email!', 'success');
            // Clear OTP inputs
            otpInputs.forEach(input => input.value = '');
            otpInputs[0].focus();
        } else {
            showMessage(data.message || 'Failed to resend OTP', 'error');
        }
    } catch (error) {
        console.error('Resend OTP Error:', error);
        showMessage('Server error. Please try again later.', 'error');
    } finally {
        resendBtn.disabled = false;
        resendBtn.innerHTML = '<i class="fas fa-redo"></i> Resend OTP';
    }
}
