// API Configuration
const API_CONFIG = {
  // Update this URL after deploying backend to Render
  BASE_URL: (window.location.hostname === 'localhost' || window.location.hostname === '' || window.location.protocol === 'file:')
    ? 'http://localhost:5000/api'
    : 'https://interntrack-knsz.onrender.com/api'
};

// Export for use in other files
window.API_CONFIG = API_CONFIG;
