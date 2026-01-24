// API Configuration
const API_CONFIG = {
  // Update this URL after deploying backend to Render
  BASE_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api'
    : 'https://interntrack-backend-3cjd.onrender.com/api'
};

// Export for use in other files
window.API_CONFIG = API_CONFIG;
