// API Configuration
const API_CONFIG = {
  // Update this URL after deploying backend to Render
  BASE_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api'
    : 'https://your-backend-url.onrender.com/api' // Replace after deployment
};

// Export for use in other files
window.API_CONFIG = API_CONFIG;
