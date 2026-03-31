/**
 * Home Page Functions
 */

let eventRefreshInterval;

/**
 * Initialize home page with activity graphs and upcoming events
 */
function initializeHomePage() {
    // Load activity graphs
    loadActivityGraphs();
    
    // Load upcoming events
    loadUpcomingEvents();
    
    // Load selected goals
    loadSelectedGoals();
    
    // Keep card fresh without spamming API
    clearInterval(eventRefreshInterval);
    eventRefreshInterval = setInterval(() => {
        loadUpcomingEvents();
    }, 30000);
}

/**
 * Load and render activity graphs (Weekly and Monthly)
 */
function loadActivityGraphs() {
    // Generate sample activity data for this week
    const weeklyData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Activity (hours)',
            data: [2, 3.5, 2.5, 4, 3, 1.5, 0],
            backgroundColor: '#7C3AED',
            borderColor: '#7C3AED',
            borderWidth: 0,
            borderRadius: 4
        }]
    };

    // Weekly Activity Chart
    const weeklyCtx = document.getElementById('weeklyActivityChart');
    if (weeklyCtx) {
        new Chart(weeklyCtx, {
            type: 'bar',
            data: weeklyData,
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    // Generate monthly streak data - Doughnut chart  
    const monthlyData = {
        labels: ['Days Active', 'Days Inactive'],
        datasets: [{
            data: [20, 10],
            backgroundColor: ['#7C3AED', '#E5E7EB'],
            borderColor: ['#7C3AED', '#E5E7EB'],
            borderWidth: 0
        }]
    };
    
    // Monthly Streak Chart - Doughnut
    const monthlyCtx = document.getElementById('monthlyStreakChart');
    if (monthlyCtx) {
        new Chart(monthlyCtx, {
            type: 'doughnut',
            data: monthlyData,
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

/**
 * Load upcoming events for the next month from calendar
 */
async function loadUpcomingEvents() {
    try {
        const container = document.getElementById('upcomingEventsList');
        if (!container) return;
        
        const userId = user._id || user.id;
        const apiBase = window.API_CONFIG?.BASE_URL || 'http://localhost:5000/api';
        
        // Try to fetch from API with proper error handling
        let events = [];
        try {
            const response = await fetch(`${apiBase}/events?userId=${userId}`);
            if (response.ok) {
                const payload = await response.json();
                events = Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []);
            }
        } catch (e) {
            console.log('API fetch failed, trying alternative method');
        }
        
        // If no events from API, use events already loaded into dashboard calendar state
        if (!events || events.length === 0) {
            if (Array.isArray(window.dashboardEvents)) {
                events = window.dashboardEvents;
            } else {
                events = [];
            }
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Calculate date 1 month from now
        const oneMonthLater = new Date(today);
        oneMonthLater.setMonth(today.getMonth() + 1);
        
        // Filter events: start date is between today and 1 month from now
        const upcomingEvents = events
            .filter(event => {
                if (!event.startDate) return false;
                const eventStartDate = new Date(event.startDate);
                eventStartDate.setHours(0, 0, 0, 0);
                return eventStartDate >= today && eventStartDate <= oneMonthLater;
            })
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
            .slice(0, 10); // Limit to 10 events
        
        if (upcomingEvents.length === 0) {
            container.innerHTML = `
                <div class="empty-state-small">
                    <i class="fas fa-calendar-check"></i>
                    <p>No events in the next month</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = upcomingEvents.map(event => {
            const eventDate = new Date(event.startDate);
            const dateStr = eventDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
            });
            
            // Get platform info
            const { platformName } = getPlatformInfo(event);
            const platformClass = `platform-${event.platform || event.type}`;
            
            return `
                <div class="event-item-home" onclick="window.location.href='event-details.html?id=${event._id}'">
                    <div class="event-header-home">
                        <span class="event-platform-badge-home ${platformClass}">${event.platform || event.type}</span>
                    </div>
                    <h4 class="event-title-home">${event.title}</h4>
                    <div class="event-date-home">
                        <i class="fas fa-calendar"></i>
                        ${dateStr}
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading upcoming events:', error);
    }
}

/**
 * Load and display selected goals
 */
function loadSelectedGoals() {
    try {
        const container = document.getElementById('goalsList');
        if (!container) return;
        
        // Get selected events from localStorage
        const selectedEventsJson = localStorage.getItem('selectedEvents') || '[]';
        const selectedEvents = JSON.parse(selectedEventsJson);
        
        if (selectedEvents.length === 0) {
            container.innerHTML = `
                <div class="empty-state-small">
                    <i class="fas fa-bullseye"></i>
                    <p>No goals selected yet. <a href="#" onclick="showSection('calendar'); return false;">Browse Goals</a></p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = selectedEvents.map(goal => {
            const goalDate = new Date(goal.startDate);
            const dateStr = goalDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric'
            });
            
            return `
                <div class="goal-item">
                    <div class="goal-checkbox" onclick="toggleGoal(this, '${goal._id || goal.title}')">
                        <i class="fas fa-check"></i>
                    </div>
                    <div class="goal-info">
                        <p class="goal-title">${goal.title}</p>
                        <p class="goal-date">Due: ${dateStr}</p>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading selected goals:', error);
    }
}

/**
 * Toggle goal completion
 */
function toggleGoal(element, goalId) {
    element.classList.toggle('checked');
}

/**
 * Get platform info for styling
 */
function getPlatformInfo(event) {
    const platforms = {
        'codeforces': { name: 'CodeForces', logo: '<strong style="color: #1F8ACB;">CF</strong>' },
        'leetcode': { name: 'LeetCode', logo: '<strong style="color: #FFA116;">LC</strong>' },
        'codechef': { name: 'CodeChef', logo: '<strong style="color: #5B4638;">CC</strong>' },
        'atcoder': { name: 'AtCoder', logo: '<strong style="color: #FF6B35;">AC</strong>' },
        'hackerrank': { name: 'HackerRank', logo: '<strong style="color: #00C89B;">HR</strong>' },
        'hackerearth': { name: 'HackerEarth', logo: '<strong style="color: #5037FF;">HE</strong>' }
    };
    
    const platform = event.platform ? event.platform.toLowerCase() : event.type;
    const info = platforms[platform] || { name: event.type, logo: '<i class="fas fa-code"></i>' };
    
    return {
        platformName: info.name,
        logo: info.logo
    };
}

/**
 * Show specific sections
 */
function showSection(sectionName) {
    const sections = document.querySelectorAll('.content-section');
    const navItems = document.querySelectorAll('.nav-item');
    
    sections.forEach(section => {
        section.classList.remove('active');
        if (section.id === `${sectionName}-section`) {
            section.classList.add('active');
        }
    });
    
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === sectionName) {
            item.classList.add('active');
        }
    });
}

/**
 * Refresh upcoming events (to be called after creating events)
 */
function refreshUpcomingEvents() {
    loadUpcomingEvents();
}

/**
 * Trigger refresh when visibility changes (page comes back into focus)
 */
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        loadUpcomingEvents();
    }
});
