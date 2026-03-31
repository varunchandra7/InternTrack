/**
 * Home Page Functions
 */

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
            backgroundColor: 'rgba(124, 58, 237, 0.1)',
            borderColor: '#7C3AED',
            borderWidth: 2,
            borderRadius: 4,
            tension: 0.3,
            fill: true
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
                        grid: {\n                            color: 'rgba(0, 0, 0, 0.05)'\n                        }\n                    },\n                    x: {\n                        grid: {\n                            display: false\n                        }\n                    }\n                }\n            }\n        });\n    }\n    \n    // Generate monthly streak data\n    const monthlyData = {\n        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],\n        datasets: [{\n            label: 'Days Active',\n            data: [6, 5, 7, 4],\n            backgroundColor: '#7C3AED',\n            borderColor: '#6D28D9',\n            borderWidth: 2,\n            borderRadius: 4\n        }]\n    };\n    \n    // Monthly Streak Chart\n    const monthlyCtx = document.getElementById('monthlyStreakChart');\n    if (monthlyCtx) {\n        new Chart(monthlyCtx, {\n            type: 'line',\n            data: monthlyData,\n            options: {\n                responsive: true,\n                maintainAspectRatio: true,\n                plugins: {\n                    legend: {\n                        display: false\n                    }\n                },\n                scales: {\n                    y: {\n                        beginAtZero: true,\n                        max: 7,\n                        grid: {\n                            color: 'rgba(0, 0, 0, 0.05)'\n                        }\n                    },\n                    x: {\n                        grid: {\n                            display: false\n                        }\n                    }\n                }\n            }\n        });\n    }\n}\n\n/**\n * Load upcoming events for the next month\n */\nasync function loadUpcomingEvents() {\n    try {\n        const container = document.getElementById('upcomingEventsList');\n        if (!container) return;\n        \n        const userId = user._id || user.id;\n        const response = await fetch(`/api/events?userId=${userId}`);\n        \n        if (!response.ok) {\n            throw new Error('Failed to fetch events');\n        }\n        \n        const events = await response.json();\n        const today = new Date();\n        today.setHours(0, 0, 0, 0);\n        \n        // Calculate date 1 month from now\n        const oneMonthLater = new Date(today);\n        oneMonthLater.setMonth(today.getMonth() + 1);\n        \n        // Filter events: start date is between today and 1 month from now\n        const upcomingEvents = events\n            .filter(event => {\n                const eventStartDate = new Date(event.startDate);\n                eventStartDate.setHours(0, 0, 0, 0);\n                return eventStartDate >= today && eventStartDate <= oneMonthLater;\n            })\n            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))\n            .slice(0, 10); // Limit to 10 events\n        \n        if (upcomingEvents.length === 0) {\n            container.innerHTML = `\n                <div class=\"empty-state-small\">\n                    <i class=\"fas fa-calendar-check\"></i>\n                    <p>No events in the next month</p>\n                </div>\n            `;\n            return;\n        }\n        \n        container.innerHTML = upcomingEvents.map(event => {\n            const eventDate = new Date(event.startDate);\n            const dateStr = eventDate.toLocaleDateString('en-US', { \n                month: 'short', \n                day: 'numeric',\n                year: 'numeric'\n            });\n            \n            // Get platform info\n            const { platformName } = getPlatformInfo(event);\n            const platformClass = `platform-${event.platform || event.type}`;\n            \n            return `\n                <div class=\"event-item-home\" onclick=\"window.location.href='event-details.html?id=${event._id}'\">\n                    <div class=\"event-header-home\">\n                        <span class=\"event-platform-badge-home ${platformClass}\">${event.platform || event.type}</span>\n                    </div>\n                    <h4 class=\"event-title-home\">${event.title}</h4>\n                    <div class=\"event-date-home\">\n                        <i class=\"fas fa-calendar\"></i>\n                        ${dateStr}\n                    </div>\n                </div>\n            `;\n        }).join('');\n        \n    } catch (error) {\n        console.error('Error loading upcoming events:', error);\n    }\n}\n\n/**\n * Load and display selected goals\n */\nfunction loadSelectedGoals() {\n    try {\n        const container = document.getElementById('goalsList');\n        if (!container) return;\n        \n        // Get selected events from localStorage\n        const selectedEventsJson = localStorage.getItem('selectedEvents') || '[]';\n        const selectedEvents = JSON.parse(selectedEventsJson);\n        \n        if (selectedEvents.length === 0) {\n            container.innerHTML = `\n                <div class=\"empty-state-small\">\n                    <i class=\"fas fa-bullseye\"></i>\n                    <p>No goals selected yet. <a href=\"#\" onclick=\"showSection('calendar')\">Browse events</a></p>\n                </div>\n            `;\n            return;\n        }\n        \n        container.innerHTML = selectedEvents.map(goal => {\n            const goalDate = new Date(goal.startDate);\n            const dateStr = goalDate.toLocaleDateString('en-US', { \n                month: 'short', \n                day: 'numeric'\n            });\n            \n            return `\n                <div class=\"goal-item\">\n                    <div class=\"goal-checkbox\" onclick=\"toggleGoal(this, '${goal._id || goal.title}')\">\n                        <i class=\"fas fa-check\"></i>\n                    </div>\n                    <div class=\"goal-info\">\n                        <p class=\"goal-title\">${goal.title}</p>\n                        <p class=\"goal-date\">Due: ${dateStr}</p>\n                    </div>\n                </div>\n            `;\n        }).join('');\n        \n    } catch (error) {\n        console.error('Error loading selected goals:', error);\n    }\n}\n\n/**\n * Toggle goal completion\n */\nfunction toggleGoal(element, goalId) {\n    element.classList.toggle('checked');\n}\n\n/**\n * Get platform info for styling\n */\nfunction getPlatformInfo(event) {\n    const platforms = {\n        'codeforces': { name: 'CodeForces', logo: '<strong style=\"color: #1F8ACB;\">CF</strong>' },\n        'leetcode': { name: 'LeetCode', logo: '<strong style=\"color: #FFA116;\">LC</strong>' },\n        'codechef': { name: 'CodeChef', logo: '<strong style=\"color: #5B4638;\">CC</strong>' },\n        'atcoder': { name: 'AtCoder', logo: '<strong style=\"color: #FF6B35;\">AC</strong>' },\n        'hackerrank': { name: 'HackerRank', logo: '<strong style=\"color: #00C89B;\">HR</strong>' },\n        'hackerearth': { name: 'HackerEarth', logo: '<strong style=\"color: #5037FF;\">HE</strong>' }\n    };\n    \n    const platform = event.platform ? event.platform.toLowerCase() : event.type;\n    const info = platforms[platform] || { name: event.type, logo: '<i class=\"fas fa-code\"></i>' };\n    \n    return {\n        platformName: info.name,\n        logo: info.logo\n    };\n}\n\n/**\n * Show specific sections\n */\nfunction showSection(sectionName) {\n    const sections = document.querySelectorAll('.content-section');\n    const navItems = document.querySelectorAll('.nav-item');\n    \n    sections.forEach(section => {\n        section.classList.remove('active');\n        if (section.id === `${sectionName}-section`) {\n            section.classList.add('active');\n        }\n    });\n    \n    navItems.forEach(item => {\n        item.classList.remove('active');\n        if (item.getAttribute('data-section') === sectionName) {\n            item.classList.add('active');\n        }\n    });\n}\n