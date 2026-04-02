/**
 * Home Page Functions
 */

let eventRefreshInterval;
let currentUpcomingEventsById = {};
let weeklyActivityChartInstance = null;
let monthlyStreakChartInstance = null;

// Get user ID for data isolation
const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
const currentUserIdHome = user._id || user.id || 'unknown';
const getUserStorageKeyHome = (key) => `${key}_${currentUserIdHome}`;

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

// Initialize home page when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeHomePage, 100); // Small delay to ensure dashboard.js has loaded
});

/**
 * Load and render activity graphs (Weekly and Monthly)
 */
function loadActivityGraphs() {
    const selectedEvents = JSON.parse(localStorage.getItem(getUserStorageKeyHome('selectedEvents')) || '[]');
    const sourceEvents = selectedEvents.length > 0
        ? selectedEvents
        : (Array.isArray(window.dashboardEvents) ? window.dashboardEvents : []);

    const weeklySeries = buildWeeklyActivitySeries(sourceEvents);
    const monthlySummary = buildMonthlyActivitySummary(sourceEvents);

    const weeklyCtx = document.getElementById('weeklyActivityChart');
    if (weeklyCtx) {
        if (weeklyActivityChartInstance) {
            weeklyActivityChartInstance.destroy();
        }

        weeklyActivityChartInstance = new Chart(weeklyCtx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Planned Activities',
                    data: weeklySeries,
                    backgroundColor: '#7C3AED',
                    borderColor: '#7C3AED',
                    borderWidth: 0,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { precision: 0 },
                        suggestedMax: Math.max(3, ...weeklySeries) + 1,
                        grid: { color: 'rgba(0, 0, 0, 0.08)' }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    }

    const monthlyCtx = document.getElementById('monthlyStreakChart');
    if (monthlyCtx) {
        if (monthlyStreakChartInstance) {
            monthlyStreakChartInstance.destroy();
        }

        monthlyStreakChartInstance = new Chart(monthlyCtx, {
            type: 'doughnut',
            data: {
                labels: ['Active Days', 'Remaining Days'],
                datasets: [{
                    data: [monthlySummary.activeDays, monthlySummary.inactiveDays],
                    backgroundColor: ['#7C3AED', '#E5E7EB'],
                    borderColor: ['#7C3AED', '#E5E7EB'],
                    borderWidth: 0
                }]
            },
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

    updateActivityInsightText(monthlySummary.activeDays);
}

function buildWeeklyActivitySeries(events) {
    const series = [0, 0, 0, 0, 0, 0, 0];
    const now = new Date();
    const day = now.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    events.forEach((event) => {
        const rawDate = event.startDate || event.start;
        if (!rawDate) return;
        const eventDate = new Date(rawDate);
        if (Number.isNaN(eventDate.getTime())) return;
        if (eventDate < weekStart || eventDate > weekEnd) return;

        const jsDay = eventDate.getDay();
        const mondayIndex = jsDay === 0 ? 6 : jsDay - 1;
        series[mondayIndex] += 1;
    });

    return series;
}

function buildMonthlyActivitySummary(events) {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const activeDaysSet = new Set();

    events.forEach((event) => {
        const rawDate = event.startDate || event.start;
        if (!rawDate) return;
        const eventDate = new Date(rawDate);
        if (Number.isNaN(eventDate.getTime())) return;
        if (eventDate.getMonth() !== month || eventDate.getFullYear() !== year) return;

        activeDaysSet.add(eventDate.getDate());
    });

    const activeDays = activeDaysSet.size;
    return {
        activeDays,
        inactiveDays: Math.max(0, daysInMonth - activeDays)
    };
}

function updateActivityInsightText(activeDaysThisMonth) {
    const insight = document.querySelector('.insight-note');
    if (!insight) return;

    const thisWeekSeries = buildWeeklyActivitySeries(
        JSON.parse(localStorage.getItem(getUserStorageKeyHome('selectedEvents')) || '[]')
    );
    const activeDaysThisWeek = thisWeekSeries.filter(count => count > 0).length;

    insight.textContent = `You've been active ${activeDaysThisWeek} out of 7 days this week, and ${activeDaysThisMonth} days this month.`;
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
        
        // Prefer the already-loaded calendar feed for immediate sync with dashboard calendar.
        let events = Array.isArray(window.dashboardEvents) ? window.dashboardEvents : [];

        // Fallback to API only when dashboard state is not available yet.
        if (!events || events.length === 0) {
            try {
                const authToken = localStorage.getItem('token') || sessionStorage.getItem('token');
                const response = await fetch(`${apiBase}/events?userId=${userId}`, {
                    headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
                });
                if (response.ok) {
                    const payload = await response.json();
                    events = Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []);
                }
            } catch (e) {
                console.log('API fetch failed, falling back to in-memory dashboard events');
            }
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Calculate date 1 month from now
        const oneMonthLater = new Date(today);
        oneMonthLater.setMonth(today.getMonth() + 1);
        
        const pinnedEventIds = JSON.parse(localStorage.getItem(getUserStorageKeyHome('pinnedUpcomingEventIds')) || '[]');

        // Filter events: start date is between today and 1 month from now
        const upcomingEvents = events
            .filter(event => {
                if (!event.startDate) return false;
                const eventStartDate = new Date(event.startDate);
                eventStartDate.setHours(0, 0, 0, 0);
                return eventStartDate >= today && eventStartDate <= oneMonthLater;
            })
            .sort((a, b) => {
                const aId = getUpcomingEventId(a);
                const bId = getUpcomingEventId(b);
                const aPinned = pinnedEventIds.includes(aId) ? 1 : 0;
                const bPinned = pinnedEventIds.includes(bId) ? 1 : 0;
                if (aPinned !== bPinned) {
                    return bPinned - aPinned;
                }
                return new Date(a.startDate) - new Date(b.startDate);
            })
            .slice(0, 10); // Limit to 10 events

        loadActivityGraphs();

        currentUpcomingEventsById = {};
        upcomingEvents.forEach(event => {
            currentUpcomingEventsById[getUpcomingEventId(event)] = event;
        });
        
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
            const eventId = getUpcomingEventId(event);
            const safeEventId = eventId.replace(/'/g, "\\'");
            const eventDate = new Date(event.startDate);
            const dateStr = eventDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
            });

            const selectedEvents = JSON.parse(localStorage.getItem(getUserStorageKeyHome('selectedEvents')) || '[]');
            const pinnedIds = JSON.parse(localStorage.getItem(getUserStorageKeyHome('pinnedUpcomingEventIds')) || '[]');
            const isGoal = selectedEvents.some(item => getUpcomingEventId(item) === eventId);
            const isPinned = pinnedIds.includes(eventId);
            
            // Get platform info
            const platformClass = `platform-${event.platform || event.type}`;
            
            return `
                <div class="event-item-home" onclick="openUpcomingEvent('${safeEventId}')">
                    <div class="event-header-home">
                        <span class="event-platform-badge-home ${platformClass}">${event.platform || event.type}</span>
                    </div>
                    <h4 class="event-title-home">${event.title}</h4>
                    <div class="event-date-home">
                        <i class="fas fa-calendar"></i>
                        ${dateStr}
                    </div>
                    <div class="event-actions-home">
                        <button class="event-action-btn ${isGoal ? 'active' : ''}" onclick="event.stopPropagation(); toggleUpcomingGoal('${safeEventId}')">${isGoal ? 'Goal Added' : 'Add as Goal'}</button>
                        <button class="event-action-btn ${isPinned ? 'active' : ''}" onclick="event.stopPropagation(); toggleUpcomingPin('${safeEventId}')">${isPinned ? 'Pinned' : 'Pin to Top'}</button>
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
        const selectedEventsJson = localStorage.getItem(getUserStorageKeyHome('selectedEvents')) || '[]';
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

function getUpcomingEventId(event) {
    return String(event._id || event.id || `${event.title || 'event'}-${event.startDate || event.start || ''}`);
}

function toggleUpcomingGoal(eventId) {
    const event = currentUpcomingEventsById[eventId];
    if (!event) return;

    const selectedEvents = JSON.parse(localStorage.getItem(getUserStorageKeyHome('selectedEvents')) || '[]');
    const existingIndex = selectedEvents.findIndex(item => getUpcomingEventId(item) === eventId);

    if (existingIndex >= 0) {
        selectedEvents.splice(existingIndex, 1);
    } else {
        selectedEvents.push({
            ...event,
            id: event.id || event._id || eventId,
            startDate: event.startDate || event.start
        });
    }

    localStorage.setItem(getUserStorageKeyHome('selectedEvents'), JSON.stringify(selectedEvents));
    loadSelectedGoals();
    loadUpcomingEvents();
    loadActivityGraphs();
}

function toggleUpcomingPin(eventId) {
    const pinnedIds = JSON.parse(localStorage.getItem(getUserStorageKeyHome('pinnedUpcomingEventIds')) || '[]');
    const existingIndex = pinnedIds.indexOf(eventId);

    if (existingIndex >= 0) {
        pinnedIds.splice(existingIndex, 1);
    } else {
        pinnedIds.push(eventId);
    }

    localStorage.setItem(getUserStorageKeyHome('pinnedUpcomingEventIds'), JSON.stringify(pinnedIds));
    loadUpcomingEvents();
}

function openUpcomingEvent(eventId) {
    const event = currentUpcomingEventsById[eventId];
    if (!event) return;

    const contestUrl = event.registrationLink || event.url || event.link;
    if (event.external && contestUrl) {
        window.open(contestUrl, '_blank');
        return;
    }

    if (event._id) {
        window.location.href = `event-details.html?id=${event._id}`;
        return;
    }

    if (contestUrl) {
        window.open(contestUrl, '_blank');
    }
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

window.addEventListener('dashboardEventsUpdated', () => {
    loadUpcomingEvents();
    loadActivityGraphs();
});

/**
 * Trigger refresh when visibility changes (page comes back into focus)
 */
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        loadUpcomingEvents();
    }
});
