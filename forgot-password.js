/**
 * Forgot Password JavaScript
 */

const API_URL = window.API_CONFIG?.BASE_URL || 'http://localhost:5000/api';

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
 * Handle forgot password form submission
 */
document.getElementById('forgotPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const submitBtn = document.getElementById('submitBtn');

    // Validate Gmail address
    if (!email.toLowerCase().endsWith('@gmail.com')) {
        showMessage('Only Gmail accounts (@gmail.com) are allowed', 'error');
        return;
    }

    // Validate email format
    const emailPattern = /^[A-Za-z0-9.]+@gmail\.com$/;
    if (!emailPattern.test(email)) {
        showMessage('Please enter a valid Gmail address', 'error');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending OTP...';

    try {
        const response = await fetch(`${API_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (data.success) {
            // Add spinner to button
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redirecting...';

            // Redirect to reset password page
            setTimeout(() => {
                window.location.href = `reset-password.html?email=${encodeURIComponent(email)}`;
            }, 800);
        } else {
            showMessage(data.message || 'Failed to send OTP', 'error');
        }
    } catch (error) {
        console.error('Forgot Password Error:', error);
        showMessage('Server error. Please try again later.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send OTP';
    }
});
