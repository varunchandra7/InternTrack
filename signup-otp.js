/**
 * Signup OTP Verification JavaScript
 * This page handles OTP verification for new account creation
 */

const API_URL = window.API_CONFIG?.BASE_URL || 'http://localhost:5000/api';

// Get email from URL parameter
const urlParams = new URLSearchParams(window.location.search);
const userEmail = urlParams.get('email');

// Check if email exists
if (!userEmail) {
    window.location.href = 'index.html';
}

// Detect page reload (if navigation type is reload, redirect to home)
if (performance.navigation.type === 1) {
    // Page was reloaded
    if (confirm('This page has expired. Click OK to return to the home page or Cancel to go back.')) {
        window.location.href = 'index.html';
    } else {
        window.history.back();
    }
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
 * Handle OTP verification for signup
 */
document.getElementById('otpForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const otp = getOTP();
    const verifyBtn = document.getElementById('verifyBtn');

    if (otp.length !== 6) {
        showMessage('Please enter complete 6-digit OTP', 'error');
        return;
    }

    verifyBtn.disabled = true;
    verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';

    try {
        const response = await fetch(`${API_URL}/auth/verify-signup-otp`, {
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
            // Store token and user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Add spinner to button
            verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redirecting...';

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 800);
        } else {
            showMessage(data.message || 'Invalid OTP', 'error');
            // Clear inputs
            otpInputs.forEach(input => input.value = '');
            otpInputs[0].focus();
        }
    } catch (error) {
        console.error('Verification Error:', error);
        showMessage('Server error. Please try again.', 'error');
    } finally {
        verifyBtn.disabled = false;
        verifyBtn.innerHTML = '<i class="fas fa-check-circle"></i> Verify Email';
    }
});

/**
 * Handle Resend OTP
 */
document.getElementById('resendBtn').addEventListener('click', async () => {
    const resendBtn = document.getElementById('resendBtn');

    resendBtn.disabled = true;
    resendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    try {
        const response = await fetch(`${API_URL}/auth/resend-signup-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: userEmail
            })
        });

        const data = await response.json();

        if (data.success) {
            showMessage('New OTP sent to your email!', 'success');
            // Reset timer
            startTimer();
            // Clear inputs
            otpInputs.forEach(input => input.value = '');
            otpInputs[0].focus();
        } else {
            showMessage(data.message || 'Failed to resend OTP', 'error');
        }
    } catch (error) {
        console.error('Resend Error:', error);
        showMessage('Server error. Please try again.', 'error');
    } finally {
        resendBtn.disabled = false;
        resendBtn.innerHTML = '<i class="fas fa-redo"></i> Resend OTP';
    }
});

/**
 * Countdown Timer (10 minutes)
 */
let timeLeft = 600; // 10 minutes in seconds
let timerInterval = null;

function startTimer() {
    // Clear existing timer if any
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    timeLeft = 600; // Reset to 10 minutes
    const timerEl = document.getElementById('timer');

    timerInterval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;

        timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerEl.textContent = '0:00';
            showMessage('OTP expired. Please request a new one.', 'error');
            document.getElementById('verifyBtn').disabled = true;
            return;
        }

        timeLeft--;
    }, 1000);
}

// Start timer on page load
startTimer();
