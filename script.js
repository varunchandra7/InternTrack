// Toggle between Sign In and Sign Up forms
const showSignupBtn = document.getElementById('showSignup');
const showSigninBtn = document.getElementById('showSignin');
const signinSection = document.getElementById('signinSection');
const signupSection = document.getElementById('signupSection');

showSignupBtn.addEventListener('click', (e) => {
    e.preventDefault();
    signinSection.style.display = 'none';
    signupSection.style.display = 'block';
});

showSigninBtn.addEventListener('click', (e) => {
    e.preventDefault();
    signupSection.style.display = 'none';
    signinSection.style.display = 'block';
});

// API Base URL
const API_URL = window.API_CONFIG?.BASE_URL || 'http://localhost:5000/api';

/**
 * Display message to user (success or error)
 * @param {string} elementId - ID of message container
 * @param {string} message - Message to display
 * @param {string} type - 'success' or 'error'
 */
function showMessage(elementId, message, type) {
    const messageEl = document.getElementById(elementId);
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';
    
    // Hide message after 5 seconds
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 5000);
}

/**
 * Reset signup form fields
 */
function resetSignupForm() {
    document.getElementById('signup-name').value = '';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-password').value = '';
    document.getElementById('signup-reenter-password').value = '';
    document.getElementById('terms-checkbox').checked = false;
}

/**
 * Handle Sign Up form submission
 */
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nameRaw = document.getElementById('signup-name').value;
    const name = nameRaw.trim();
    const email = document.getElementById('signup-email').value.trim();
    const genderElement = document.getElementById('signup-gender');
    const gender = genderElement ? genderElement.value : 'Not specified';
    const password = document.getElementById('signup-password').value;
    const reenterPassword = document.getElementById('signup-reenter-password').value;
    const termsCheckbox = document.getElementById('terms-checkbox');
    const submitBtn = document.getElementById('signup-btn');
    
    // Basic validation
    if (!name || !email || !password || !reenterPassword) {
        showMessage('signup-message', 'Please fill in all fields', 'error');
        resetSignupForm();
        return;
    }

    // Check for spaces before the starting letter
    if (nameRaw !== nameRaw.trimStart()) {
        showMessage('signup-message', 'Name cannot start with spaces', 'error');
        resetSignupForm();
        return;
    }

    // Check for consecutive spaces (only one space allowed between names)
    if (/\s{2,}/.test(name)) {
        showMessage('signup-message', 'Only one space allowed between names', 'error');
        resetSignupForm();
        return;
    }

    // Validate name contains only letters and spaces
    const namePattern = /^[A-Za-z\s]+$/;
    if (!namePattern.test(name)) {
        showMessage('signup-message', 'Full name should contain only letters and spaces', 'error');
        resetSignupForm();
        return;
    }

    // Check if name is only whitespace
    if (name.replace(/\s/g, '') === '') {
        showMessage('signup-message', 'Name cannot contain only blank spaces', 'error');
        resetSignupForm();
        return;
    }

    // Validate Gmail address - must be in format: letters/numbers@gmail.com
    const gmailPattern = /^[A-Za-z0-9]+@gmail\.com$/;
    if (!gmailPattern.test(email)) {
        showMessage('signup-message', 'Email must be in format: letters/numbers@gmail.com only', 'error');
        resetSignupForm();
        return;
    }

    // Check terms and conditions
    if (!termsCheckbox.checked) {
        showMessage('signup-message', 'Please accept the Terms & Conditions', 'error');
        resetSignupForm();
        return;
    }
    
    // Validate password is not empty or just whitespace
    if (!password || password.trim() === '') {
        showMessage('signup-message', 'Password cannot be empty or contain only spaces', 'error');
        resetSignupForm();
        return;
    }
    
    // Validate password length
    if (password.length <= 6) {
        showMessage('signup-message', 'Password must be more than 6 characters', 'error');
        resetSignupForm();
        return;
    }

    // Validate password special characters (only @ and ! allowed)
    const invalidChars = /[^a-zA-Z0-9@!]/;
    if (invalidChars.test(password)) {
        showMessage('signup-message', 'Password can only contain letters, numbers, @ and ! symbols', 'error');
        resetSignupForm();
        return;
    }

    // Check if passwords match
    if (password !== reenterPassword) {
        showMessage('signup-message', 'Passwords do not match. Please try again.', 'error');
        resetSignupForm();
        return;
    }
    
    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';
    
    try {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, gender, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Add spinner to button
            submitBtn.innerHTML = '<span class="button-spinner"></span> Redirecting...';
            
            // Redirect to dashboard directly
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 800);
        } else {
            showMessage('signup-message', data.message || 'Signup failed', 'error');
        }
    } catch (error) {
        console.error('Signup Error:', error);
        showMessage('signup-message', 'Server error. Please try again later.', 'error');
    } finally {
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign Up';
    }
});

/**
 * Handle Sign In form submission
 */
document.getElementById('signinForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('signin-email').value.trim();
    const password = document.getElementById('signin-password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    const submitBtn = document.getElementById('signin-btn');
    
    // Basic validation
    if (!email || !password) {
        showMessage('signin-message', 'Please fill in all fields', 'error');
        return;
    }
    
    // Validate password is not empty or just whitespace
    if (password.trim() === '') {
        showMessage('signin-message', 'Password cannot be empty or contain only spaces', 'error');
        document.getElementById('signin-email').value = '';
        document.getElementById('signin-password').value = '';
        document.getElementById('remember-me').checked = false;
        return;
    }
    
    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing In...';
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store token and user info based on Remember Me checkbox
            if (rememberMe) {
                // Persistent storage - stays until manual logout
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
            } else {
                // Session storage - clears when browser closes
                sessionStorage.setItem('token', data.token);
                sessionStorage.setItem('user', JSON.stringify(data.user));
            }
            
            // Add spinner to button
            submitBtn.innerHTML = '<span class="button-spinner"></span> Redirecting...';
            
            // Redirect to dashboard after brief delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 800);
        } else {
            showMessage('signin-message', data.message || 'Login failed', 'error');
            // Reset form on login failure
            document.getElementById('signin-email').value = '';
            document.getElementById('signin-password').value = '';
            document.getElementById('remember-me').checked = false;
        }
    } catch (error) {
        console.error('Login Error:', error);
        showMessage('signin-message', 'Server error. Please try again later.', 'error');
        // Reset form on server error
        document.getElementById('signin-email').value = '';
        document.getElementById('signin-password').value = '';
        document.getElementById('remember-me').checked = false;
    } finally {
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
    }
});