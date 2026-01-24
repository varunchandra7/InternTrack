/**
 * Theme Management
 * Handles dark/light theme toggle and persistence
 */

// Get saved theme or default to light
const currentTheme = localStorage.getItem('theme') || 'light';

// Apply theme on page load
document.documentElement.setAttribute('data-theme', currentTheme);

// Update theme toggle icon
function updateThemeIcon() {
    const themeIcon = document.getElementById('themeIcon');
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    if (themeIcon) {
        if (currentTheme === 'dark') {
            themeIcon.className = 'fas fa-sun';
        } else {
            themeIcon.className = 'fas fa-moon';
        }
    }
}

// Initialize icon on load
updateThemeIcon();

// Toggle theme function
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon();
}

// Add event listener when button is clicked
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
});
