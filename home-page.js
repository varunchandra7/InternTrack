/**
 * Home Page Functions
 */

let eventRefreshInterval;
let currentUpcomingEventsById = {};
let weeklyActivityChartInstance = null;
let monthlyStreakChartInstance = null;
let completedRoadmapTasks = []; // Store completed tasks for activity tracking
let hasCompletedTasks = false; // Track if user has any completed roadmap tasks

// Get user ID for data isolation (use global user from dashboard.js)
const currentUserIdHome = (typeof user !== 'undefined' && user) 
    ? (user._id || user.id || 'unknown')
    : 'unknown';
const getUserStorageKeyHome = (key) => `${key}_${currentUserIdHome}`;

/**
 * Initialize home page with activity graphs and upcoming events
 */
function initializeHomePage() {
    // Load activity graphs from roadmap
    loadActivityGraphsFromRoadmap();
    
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
    console.log('🏠 Home page DOMContentLoaded triggered');
    
    // Listen for roadmap task updates
    document.addEventListener('roadmapTaskUpdated', () => {
        console.log('📚 Roadmap task updated, refreshing activity charts...');
        loadActivityGraphsFromRoadmap();
    });
    
    // Wait for Chart.js to be available
    const waitForChart = setInterval(() => {
        if (typeof Chart !== 'undefined') {
            clearInterval(waitForChart);
            console.log('📊 Chart.js available, initializing...');
            
            setTimeout(() => {
                if (typeof initializeHomePage === 'function') {
                    initializeHomePage();
                }
                loadActivityGraphsFromRoadmap();
            }, 100);
        }
    }, 50);
    
    // Fallback: try after 2 seconds anyway
    setTimeout(() => {
        console.log('⏱️ Fallback initialization started');
        loadActivityGraphsFromRoadmap();
    }, 2000);
});

/**
 * Load and render activity graphs (Weekly and Monthly)
 * NOW: Only called from loadActivityGraphsFromRoadmap - no dummy data
 */
function loadActivityGraphs() {
    // This function is deprecated - use loadActivityGraphsFromRoadmap instead
    console.warn('loadActivityGraphs() called but deprecated - using loadActivityGraphsFromRoadmap instead');
    loadActivityGraphsFromRoadmap();
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
 * Fetch completed roadmap tasks from backend
 */
async function fetchCompletedRoadmapTasks() {
    try {
        const apiBase = window.API_CONFIG?.BASE_URL || 'http://localhost:5000/api';
        const authToken = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        const response = await fetch(`${apiBase}/roadmap/${currentUserIdHome}`, {
            headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
        });
        
        if (!response.ok) {
            console.log('No roadmap found for user');
            return [];
        }
        
        const data = await response.json();
        const roadmap = data.roadmap;
        
        if (!roadmap || !roadmap.dailyTasks) {
            return [];
        }
        
        // Extract completed tasks and convert day numbers to dates
        const completedTasks = roadmap.dailyTasks
            .filter(task => task.isCompleted)
            .map(task => ({
                day: task.day,
                topic: task.topic,
                subject: task.subject,
                completedDate: convertDayNumberToDate(task.day, roadmap.totalDays)
            }));
        
        console.log(`📊 Found ${completedTasks.length} completed roadmap tasks`);
        return completedTasks;
    } catch (error) {
        console.error('Error fetching roadmap tasks:', error);
        return [];
    }
}

/**
 * Convert day number (1-indexed) to actual date
 * Uses stored roadmap start date
 */
function convertDayNumberToDate(dayNumber, totalDays) {
    const roadmapStartKey = `roadmapStartDate_${currentUserIdHome}`;
    const roadmapStart = localStorage.getItem(roadmapStartKey);
    
    let startDate;
    if (roadmapStart) {
        startDate = new Date(roadmapStart);
    } else {
        // Fallback: assume roadmap started totalDays ago from today
        startDate = new Date();
        startDate.setDate(startDate.getDate() - (totalDays - 1));
    }
    
    const targetDate = new Date(startDate);
    targetDate.setDate(startDate.getDate() + (dayNumber - 1));
    targetDate.setHours(0, 0, 0, 0);
    
    console.log(`📅 Day ${dayNumber} → ${targetDate.toLocaleDateString()}`);
    return targetDate;
}

/**
 * Load and render activity graphs based on completed roadmap tasks
 */
async function loadActivityGraphsFromRoadmap() {
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js not loaded yet, retrying...');
        setTimeout(loadActivityGraphsFromRoadmap, 500);
        return;
    }
    
    // Fetch completed roadmap tasks
    completedRoadmapTasks = await fetchCompletedRoadmapTasks();
    hasCompletedTasks = completedRoadmapTasks.length > 0;
    
    if (!hasCompletedTasks) {
        console.log('No completed roadmap tasks yet, skipping chart rendering');
        // Hide the activity section if no completed tasks
        const activitySection = document.querySelector('.activity-section');
        if (activitySection) {
            activitySection.style.display = 'none';
        }
        return;
    }
    
    // Show the activity section since we have data
    const activitySection = document.querySelector('.activity-section');
    if (activitySection) {
        activitySection.style.display = 'block';
    }
    
    // Convert completed tasks to event-like objects for reuse of existing functions
    const taskEvents = completedRoadmapTasks.map(task => ({
        startDate: task.completedDate,
        title: task.topic
    }));
    
    let weeklySeries = buildWeeklyActivitySeries(taskEvents);
    let monthlySummary = buildMonthlyActivitySummary(taskEvents);
    
    console.log('📊 Weekly series:', weeklySeries, 'Monthly:', monthlySummary);
    
    try {
        const weeklyCtx = document.getElementById('weeklyActivityChart');
        if (weeklyCtx && weeklyCtx.getContext) {
            if (weeklyActivityChartInstance) {
                weeklyActivityChartInstance.destroy();
                weeklyActivityChartInstance = null;
            }

            weeklyActivityChartInstance = new Chart(weeklyCtx, {
                type: 'bar',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Activities',
                        data: weeklySeries,
                        backgroundColor: '#7C3AED',
                        borderColor: '#6D28D9',
                        borderWidth: 1,
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { 
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.parsed.y + ' tasks completed';
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { 
                                precision: 0,
                                stepSize: 1
                            },
                            suggestedMax: Math.max(5, Math.max(...weeklySeries) + 1),
                            grid: { color: 'rgba(124, 58, 237, 0.1)' }
                        },
                        x: {
                            grid: { display: false }
                        }
                    }
                }
            });
        } else {
            console.warn('Weekly activity canvas not found');
        }
    } catch (error) {
        console.error('Error creating weekly chart:', error);
    }

    try {
        const monthlyCtx = document.getElementById('monthlyStreakChart');
        if (monthlyCtx && monthlyCtx.getContext) {
            if (monthlyStreakChartInstance) {
                monthlyStreakChartInstance.destroy();
                monthlyStreakChartInstance = null;
            }

            const activeDays = monthlySummary.activeDays;
            const inactiveDays = monthlySummary.inactiveDays;
            const total = activeDays + inactiveDays;
            const activePercent = total > 0 ? Math.round((activeDays / total) * 100) : 0;

            monthlyStreakChartInstance = new Chart(monthlyCtx, {
                type: 'doughnut',
                data: {
                    labels: [`Active Days (${activeDays})`, `Remaining Days (${inactiveDays})`],
                    datasets: [{
                        data: [activeDays, inactiveDays],
                        backgroundColor: ['#7C3AED', '#E5E7EB'],
                        borderColor: ['#6D28D9', '#D1D5DB'],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'bottom',
                            labels: {
                                font: { size: 12 },
                                padding: 15
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.label + ': ' + context.parsed.y + ' days';
                                }
                            }
                        }
                    }
                }
            });
        } else {
            console.warn('Monthly streak canvas not found');
        }
    } catch (error) {
        console.error('Error creating monthly chart:', error);
    }

    updateActivityInsightTextFromRoadmap(monthlySummary.activeDays);
}

/**
 * Update activity insight text for roadmap data
 */
function updateActivityInsightTextFromRoadmap(activeDaysThisMonth) {
    const insight = document.querySelector('.insight-note');
    if (!insight) return;

    // Count tasks per day in this week
    const thisWeekSeries = buildWeeklyActivitySeries(completedRoadmapTasks.map(t => ({
        startDate: t.completedDate
    })));
    
    // Count total tasks this week
    const totalTasksThisWeek = thisWeekSeries.reduce((sum, count) => sum + count, 0);
    // Count active days (days with at least 1 task) this week
    const activeDaysThisWeek = thisWeekSeries.filter(count => count > 0).length;

    insight.textContent = `You've completed ${totalTasksThisWeek} tasks across ${activeDaysThisWeek} days this week, and tasks on ${activeDaysThisMonth} days this month.`;
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

        loadActivityGraphsFromRoadmap();

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
    loadActivityGraphsFromRoadmap();
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
    loadActivityGraphsFromRoadmap();
});

/**
 * Trigger refresh when visibility changes (page comes back into focus)
 */
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        loadUpcomingEvents();
    }
});
