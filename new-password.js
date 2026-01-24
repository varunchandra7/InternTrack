/**
 * New Password JavaScript
 */

const API_URL = 'http://localhost:5000/api';

// Get email and OTP from sessionStorage
const userEmail = sessionStorage.getItem('resetEmail');
const verifiedOTP = sessionStorage.getItem('resetOTP');

// Check if email and OTP exist
if (!userEmail || !verifiedOTP) {
    window.location.href = 'forgot-password.html';
}

// Detect page reload (if navigation type is reload, redirect to home)
if (performance.navigation.type === 1) {
    // Page was reloaded - redirect to home without back option
    alert('This page has expired. You will be redirected to the home page.');
    window.location.replace('index.html');
}

// Display email
document.getElementById('userEmail').textContent = userEmail;

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
 * Toggle password visibility
 */
function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

/**
 * Handle password reset form submission
 */
document.getElementById('newPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const submitBtn = document.getElementById('submitBtn');

    // Validate password
    if (newPassword.length <= 6) {
        showMessage('Password must be more than 6 characters', 'error');
        return;
    }

    // Validate password special characters
    const invalidChars = /[^a-zA-Z0-9@!]/;
    if (invalidChars.test(newPassword)) {
        showMessage('Password can only contain letters, numbers, @ and ! symbols', 'error');
        return;
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resetting Password...';

    try {
        const response = await fetch(`${API_URL}/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: userEmail,
                otp: verifiedOTP,
                newPassword: newPassword
            })
        });

        const data = await response.json();

        if (data.success) {
            // Clear session storage
            sessionStorage.removeItem('resetEmail');
            sessionStorage.removeItem('resetOTP');
            
            // Add spinner to button
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redirecting...';

            // Redirect to login page
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 800);
        } else {
            showMessage(data.message || 'Failed to reset password', 'error');
        }
    } catch (error) {
        console.error('Reset Password Error:', error);
        showMessage('Server error. Please try again later.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Reset Password';
    }
});
