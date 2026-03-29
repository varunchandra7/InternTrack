/**
 * Dashboard JavaScript
 * Last updated: 2026-01-20 19:51:26
 * Fixed: Events now show only on start date, not spanning multiple days
 */

// Sidebar collapse state
let sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true' || false;

// Check authentication - check both localStorage (Remember Me) and sessionStorage
const token = localStorage.getItem('token') || sessionStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

if (!token) {
    window.location.href = 'index.html';
}

// Check if user is admin
const isAdmin = user.role === 'admin';

// Show/hide admin-only elements
document.addEventListener('DOMContentLoaded', () => {
    if (isAdmin) {
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = '';
        });
    }

    // Initialize sidebar toggle
    initializeSidebarToggle();
});

/**
 * Initialize sidebar toggle functionality
 */
function initializeSidebarToggle() {
    const sidebar = document.getElementById('mainSidebar');
    const mainArea = document.querySelector('.main-area');
    const toggleBtn = document.getElementById('sidebarToggle');

    if (!sidebar || !mainArea || !toggleBtn) return;

    // Apply saved state on page load
    if (sidebarCollapsed) {
        sidebar.classList.add('collapsed');
        mainArea.classList.add('sidebar-collapsed');
        toggleBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    }

    // Toggle button click handler
    toggleBtn.addEventListener('click', () => {
        sidebarCollapsed = !sidebarCollapsed;
        localStorage.setItem('sidebarCollapsed', sidebarCollapsed);

        if (sidebarCollapsed) {
            sidebar.classList.add('collapsed');
            mainArea.classList.add('sidebar-collapsed');
            toggleBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
            toggleBtn.title = 'Expand sidebar';
        } else {
            sidebar.classList.remove('collapsed');
            mainArea.classList.remove('sidebar-collapsed');
            toggleBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
            toggleBtn.title = 'Collapse sidebar';
        }

        // Update calendar size if visible
        if (calendar) {
            setTimeout(() => {
                calendar.updateSize();
            }, 300);
        }
    });
}

// Display user information
document.addEventListener('DOMContentLoaded', () => {
    const userName = user.name || 'User';
    const userEmail = user.email || 'user@example.com';
    
    // Update user avatar with first letter
    const userAvatarTop = document.getElementById('userAvatarTop');
    if (userAvatarTop) {
        userAvatarTop.textContent = userName.charAt(0).toUpperCase();
    }
    
    // Update user name in top bar
    const userNameTop = document.getElementById('userNameTop');
    if (userNameTop) {
        userNameTop.textContent = userName;
    }
    
    // Update dropdown header
    const dropdownUserName = document.getElementById('dropdownUserName');
    const dropdownUserEmail = document.getElementById('dropdownUserEmail');
    if (dropdownUserName) dropdownUserName.textContent = userName;
    if (dropdownUserEmail) dropdownUserEmail.textContent = userEmail;
});

// User profile dropdown toggle
const userProfileBtn = document.getElementById('userProfileBtn');
const userDropdown = document.getElementById('userDropdown');

if (userProfileBtn && userDropdown) {
    userProfileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userProfileBtn.classList.toggle('active');
        userDropdown.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        userProfileBtn.classList.remove('active');
        userDropdown.classList.remove('active');
    });
    
    // Prevent dropdown from closing when clicking inside
    userDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// Logout functionality
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Clear both localStorage and sessionStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('selectedEvents');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        window.location.href = 'index.html';
    });
}

// Navigation between sections - will be initialized in DOMContentLoaded
let navItems;
let contentSections;

function showSection(sectionName) {
    if (!sectionName) return;

    if (!contentSections) {
        contentSections = document.querySelectorAll('.content-section');
    }

    const targetSection = document.getElementById(`${sectionName}-section`);
    if (!targetSection) return;

    contentSections.forEach(section => section.classList.remove('active'));
    targetSection.classList.add('active');

    if (sectionName === 'calendar' && calendar) {
        setTimeout(() => {
            calendar.updateSize();
        }, 100);
    }

    if (sectionName === 'home') {
        setTimeout(() => {
            loadRoadmapProgress();
        }, 100);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Consolidated DOMContentLoaded initialization
document.addEventListener('DOMContentLoaded', () => {
    // Query navigation elements after DOM is ready
    navItems = document.querySelectorAll('.nav-item');
    contentSections = document.querySelectorAll('.content-section');
    
    // Restore active section on page load
    const savedSection = localStorage.getItem('activeSection') || 'home';
    
    // Activate saved section
    navItems.forEach(nav => {
        if (nav.getAttribute('data-section') === savedSection) {
            nav.classList.add('active');
        } else {
            nav.classList.remove('active');
        }
    });
    
    contentSections.forEach(section => {
        if (section.id === `${savedSection}-section`) {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });
    
    // Add navigation click handlers
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const sectionName = item.getAttribute('data-section');

            // Allow normal navigation for links like roadmap.html
            if (!sectionName) {
                return;
            }
            e.preventDefault();
            
            // Save active section to localStorage
            localStorage.setItem('activeSection', sectionName);
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            showSection(sectionName);
        });
    });
    
    // Initialize calendar
    initializeCalendar();
    
    // Render selected events on home page
    renderSelectedEvents();
    
    // Load roadmap progress for home page
    loadRoadmapProgress();
});

// API Base URL
const API_URL = window.API_CONFIG?.BASE_URL || 'http://localhost:5000/api';

// Sample selected events (stored in localStorage)
let selectedEvents = JSON.parse(localStorage.getItem('selectedEvents') || '[]');

// Store all events from backend
let allEvents = [];

/**
 * Fetch events from backend
 */
async function fetchEvents(type = 'all') {
    try {
        const url = type === 'all' 
            ? `${API_URL}/events` 
            : `${API_URL}/events?type=${type}`;
            
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
            allEvents = result.data;
            updateCalendarEvents();
        } else {
            console.error('Failed to fetch events:', result.message);
        }
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

/**
 * Update calendar with fetched events
 */
function updateCalendarEvents() {
    if (!calendar) return;
    
    // Remove all existing events
    calendar.removeAllEvents();
    
    // Add new events - show only on start date
    const calendarEvents = allEvents.map(event => ({
        id: event._id,
        title: event.title,
        start: event.startDate,
        // No end date - show event only on start date
        backgroundColor: event.color,
        borderColor: event.color,
        extendedProps: {
            ...event,
            id: event._id,
            start: event.startDate
        }
    }));
    
    calendar.addEventSource(calendarEvents);
}

// Initialize FullCalendar
let calendar;
let currentEventData = null;

async function fetchEvents() {
    try {
        const response = await fetch(`${API_URL}/events`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }
        
        const result = await response.json();
        const events = result.data || result; // Handle both response formats
        
        // Filter out past events (before today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const futureEvents = events.filter(event => {
            const eventDate = new Date(event.startDate);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate >= today;
        });
        
        allEvents = futureEvents;
        
        // Format events for FullCalendar - show only on start date
        const calendarEvents = futureEvents.map(event => ({
            id: event._id,
            title: event.title,
            start: event.startDate,
            // No end date - show event only on start date
            backgroundColor: event.color,
            borderColor: event.color,
            className: `event-${event.type}`,
            extendedProps: {
                ...event,
                id: event._id
            }
        }));
        
        if (calendar) {
            calendar.removeAllEvents();
            calendar.addEventSource(calendarEvents);
        }
        
        // Render upcoming events in sidebar
        renderUpcomingEvents(futureEvents);
        renderMobileGoalsOptions(futureEvents);
        
        // Apply current filter if not 'all'
        if (currentFilter !== 'all') {
            setTimeout(() => filterCalendarEvents(), 100);
        }
        
        return calendarEvents;
    } catch (error) {
        console.error('Error fetching events:', error);
        return [];
    }
}

/**
 * Render upcoming events (next 1.5 months) in calendar sidebar
 */
function renderUpcomingEvents(events) {
    const container = document.getElementById('upcomingEventsList');
    
    if (!container) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate date 1.5 months (45 days) from now
    const oneAndHalfMonthsLater = new Date(today);
    oneAndHalfMonthsLater.setDate(today.getDate() + 45);
    
    // Filter events: start date is between today and 1.5 months from now
    const upcomingEvents = events
        .filter(event => {
            const eventStartDate = new Date(event.startDate);
            eventStartDate.setHours(0, 0, 0, 0);
            return eventStartDate >= today && eventStartDate <= oneAndHalfMonthsLater;
        })
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate)) // Sort by date ascending
        .slice(0, 10); // Limit to 10 events for UI purposes
    
    if (upcomingEvents.length === 0) {
        container.innerHTML = `
            <div class="empty-state-small">
                <i class="fas fa-calendar-check"></i>
                <p>No upcoming events in the next 1.5 months</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = upcomingEvents.map(event => {
        const eventDate = new Date(event.startDate);
        const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
        
        // Determine icon based on event type
        let iconClass = 'fas fa-calendar';
        if (event.type === 'hackathon') iconClass = 'fas fa-code';
        else if (event.type === 'internship') iconClass = 'fas fa-briefcase';
        else if (event.type === 'contest') iconClass = 'fas fa-trophy';
        
        // Format date display
        const dateStr = eventDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
        
        const daysText = daysUntil === 0 ? 'Today' : 
                        daysUntil === 1 ? 'Tomorrow' : 
                        `in ${daysUntil} days`;
        
        // Check if external contest
        const isExternal = event.external;
        const platformBadge = isExternal ? `<span class="platform-badge platform-${event.platform}">${event.platform}</span>` : '';
        
        // Check if already in goals
        const eventId = event._id || event.id || event.title; // Use title as fallback for external contests
        const isInGoals = selectedEvents.some(e => {
            const storedId = e._id || e.id || e.title;
            return storedId === eventId;
        });
        
        return `
            <div class="upcoming-event-card" onclick="${isExternal ? `window.open('${event.link}', '_blank')` : `window.location.href='event-details.html?id=${event._id}'`}">
                <div class="upcoming-event-header">
                    <div class="event-icon">
                        <i class="${iconClass}"></i>
                    </div>
                    <div style="flex: 1;">
                        <h4 class="upcoming-event-title">${event.title}</h4>
                        ${platformBadge}
                    </div>
                </div>
                <div class="upcoming-event-time">
                    <i class="fas fa-clock"></i>
                    <span>${dateStr} • ${daysText}</span>
                </div>
                <button class="event-goal-btn ${isInGoals ? 'in-goals' : ''}" 
                        onclick="event.stopPropagation(); toggleEventGoal(${JSON.stringify(event).replace(/"/g, '&quot;')})">
                    <i class="fas ${isInGoals ? 'fa-check-circle' : 'fa-plus'}"></i>
                    ${isInGoals ? 'Added as Goal' : 'Set as Goal'}
                </button>
            </div>
        `;
    }).join('');
}

function initializeCalendar() {
    const calendarEl = document.getElementById('calendar');
    
    if (!calendarEl) {
        console.warn('Calendar element not found');
        return;
    }
    
    try {
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,listWeek'
            },
            events: [],
            height: 'auto',
            editable: false,
            selectable: true,
            dayMaxEvents: true,
            firstDay: 0, // Sunday
            buttonText: {
                today: 'Today',
                month: 'Month',
                week: 'Week',
                list: 'List'
            },
            dateClick: function(info) {
                handleDateClick(info);
            },
            eventClick: function(info) {
                info.jsEvent.preventDefault();
                
                // Check if it's an external contest
                if (info.event.extendedProps.external) {
                    // Open external link in new tab
                    if (info.event.extendedProps.link) {
                        window.open(info.event.extendedProps.link, '_blank');
                    }
                } else {
                    // Navigate to event details page for internal events
                    const eventId = info.event.extendedProps._id || info.event.id;
                    window.location.href = `event-details.html?id=${eventId}`;
                }
            },
            eventClassNames: function(arg) {
                return [`event-${arg.event.extendedProps.type}`];
            }
        });
        
        calendar.render();
        
        // Fetch and load events
        fetchEvents();
        
        // Ensure proper sizing after render
        setTimeout(() => {
            if (calendar) {
                calendar.updateSize();
            }
        }, 100);
    } catch (error) {
        console.error('Error initializing calendar:', error);
    }
}

// Handle date click
function handleDateClick(info) {
    const clickedDate = info.dateStr;
    const events = calendar.getEvents().filter(event => {
        const eventDate = event.startStr.split('T')[0];
        return eventDate === clickedDate;
    });
    
    if (events.length > 0) {
        // Navigate to first event detail if multiple events on same day
        const eventId = events[0].extendedProps._id || events[0].id;
        window.location.href = `event-details.html?id=${eventId}`;
    }
}

// Show event detail modal
function showEventDetail(event) {
    currentEventData = event;
    
    document.getElementById('modalEventTitle').textContent = event.title || 'Event';
    document.getElementById('modalEventCompany').textContent = event.company || '';
    
    // Set badges
    const badgesContainer = document.getElementById('modalEventBadges');
    const typeClass = `badge-${event.type}`;
    const typeName = event.type.charAt(0).toUpperCase() + event.type.slice(1);
    badgesContainer.innerHTML = `<span class="event-modal-badge ${typeClass}">${typeName}</span>`;
    
    // Set details
    const detailsContainer = document.getElementById('modalEventDetails');
    const startDate = event.startDate ? new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA';
    const endDate = event.endDate ? new Date(event.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
    const deadline = event.deadline ? new Date(event.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline';
    
    let detailsHTML = `
        <div class="event-detail-row">
            <i class="fas fa-calendar"></i>
            <span class="event-detail-label">Start Date:</span>
            <span class="event-detail-value">${startDate}</span>
        </div>`;
    
    if (endDate) {
        detailsHTML += `
        <div class="event-detail-row">
            <i class="fas fa-calendar-check"></i>
            <span class="event-detail-label">End Date:</span>
            <span class="event-detail-value">${endDate}</span>
        </div>`;
    }
    
    detailsHTML += `
        <div class="event-detail-row">
            <i class="fas fa-clock"></i>
            <span class="event-detail-label">Deadline:</span>
            <span class="event-detail-value">${deadline}</span>
        </div>`;
    
    if (event.location) {
        detailsHTML += `
        <div class="event-detail-row">
            <i class="fas fa-map-marker-alt"></i>
            <span class="event-detail-label">Location:</span>
            <span class="event-detail-value">${event.location}</span>
        </div>`;
    }
    
    if (event.skills && event.skills.length > 0) {
        const skillsText = event.skills.join(', ');
        detailsHTML += `
        <div class="event-detail-row">
            <i class="fas fa-code"></i>
            <span class="event-detail-label">Skills:</span>
            <span class="event-detail-value">${skillsText}</span>
        </div>`;
    }
    
    detailsContainer.innerHTML = detailsHTML;
    
    // Set description
    document.getElementById('modalEventDescription').textContent = event.description || 'No description available.';
    
    // Show modal
    document.getElementById('eventModal').classList.add('active');
    
    // Close modal on background click
    const modal = document.getElementById('eventModal');
    modal.onclick = function(e) {
        if (e.target === modal) {
            closeEventModal();
        }
    };
}

// Close event modal
function closeEventModal() {
    document.getElementById('eventModal').classList.remove('active');
    currentEventData = null;
}

// Set event as goal (add to home page)
function setEventAsGoal() {
    if (!currentEventData) return;
    
    // Check if already exists
    const exists = selectedEvents.some(e => (e.id || e._id) === (currentEventData.id || currentEventData._id));
    
    if (exists) {
        alert('This event is already in your goals!');
        return;
    }
    
    selectedEvents.push(currentEventData);
    localStorage.setItem('selectedEvents', JSON.stringify(selectedEvents));
    renderSelectedEvents();
    
    closeEventModal();
    alert('Event added to your goals! Check the Home page.');
}

/**
 * Show event details modal
 */
function showEventModal(event) {
    const isSelected = selectedEvents.some(e => e.id === event._id || e.id === event.id);
    const action = isSelected ? 'Remove from' : 'Add to';
    
    const eventId = event._id || event.id;
    const eventDate = new Date(event.startDate || event.start).toLocaleDateString();
    const deadlineText = event.deadline ? `\nDeadline: ${new Date(event.deadline).toLocaleDateString()}` : '';
    const skillsText = event.skills && event.skills.length > 0 ? `\n\nRequired Skills:\n${event.skills.join(', ')}` : '';
    const roundsText = event.rounds && event.rounds.length > 0 ? `\n\nRounds:\n${event.rounds.join('\n')}` : '';
    const locationText = event.location ? `\nLocation: ${event.location}` : '';
    
    const message = `${event.title}\n\nCompany: ${event.company}\nType: ${event.type}\nDate: ${eventDate}${deadlineText}${locationText}\n\nDescription: ${event.description}${skillsText}${roundsText}\n\nWould you like to ${action.toLowerCase()} your selected events?`;
    
    if (confirm(message)) {
        if (isSelected) {
            removeEvent(eventId);
        } else {
            addEvent(event);
        }
    }
}

// Add event to selected
function addEvent(event) {
    selectedEvents.push(event);
    localStorage.setItem('selectedEvents', JSON.stringify(selectedEvents));
    renderSelectedEvents();
    alert('Event added to your Home page!');
}

// Remove event from selected
function removeEvent(eventId) {
    selectedEvents = selectedEvents.filter(e => e.id !== eventId);
    localStorage.setItem('selectedEvents', JSON.stringify(selectedEvents));
    renderSelectedEvents();
    alert('Event removed from your Home page!');
}

// Remove event from home page (called from home page button)
function removeEventFromHome(eventId) {
    if (confirm('Are you sure you want to remove this event from your selected events?')) {
        selectedEvents = selectedEvents.filter(e => {
            const storedId = e.id || e._id || e.title;
            return storedId !== eventId;
        });
        localStorage.setItem('selectedEvents', JSON.stringify(selectedEvents));
        renderSelectedEvents();
        renderUpcomingEvents(allEvents); // Update upcoming events to reflect the change
    }
}

/**
 * Toggle event goal from upcoming events list
 */
function toggleEventGoal(event) {
    const eventId = event._id || event.id || event.title;
    const isInGoals = selectedEvents.some(e => {
        const storedId = e._id || e.id || e.title;
        return storedId === eventId;
    });
    
    if (isInGoals) {
        // Remove from goals
        selectedEvents = selectedEvents.filter(e => {
            const storedId = e._id || e.id || e.title;
            return storedId !== eventId;
        });
        localStorage.setItem('selectedEvents', JSON.stringify(selectedEvents));
    } else {
        // Add to goals
        selectedEvents.push(event);
        localStorage.setItem('selectedEvents', JSON.stringify(selectedEvents));
    }
    
    // Immediately refresh both displays to show the change
    renderSelectedEvents();
    renderUpcomingEvents(allEvents); // Pass the allEvents array to re-render with updated goal status
    renderMobileGoalsOptions(allEvents);
}

function renderMobileGoalsOptions(events) {
    const mobileGoalsList = document.getElementById('mobileGoalsList');
    if (!mobileGoalsList) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingEvents = (events || [])
        .filter((event) => {
            const eventDate = new Date(event.startDate || event.start);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate >= today;
        })
        .sort((a, b) => new Date(a.startDate || a.start) - new Date(b.startDate || b.start))
        .slice(0, 5);

    if (upcomingEvents.length === 0) {
        mobileGoalsList.innerHTML = `
            <div class="empty-state-small">
                <p>No upcoming events available</p>
            </div>
        `;
        return;
    }

    mobileGoalsList.innerHTML = upcomingEvents.map((event) => {
        const eventId = event._id || event.id || event.title;
        const isInGoals = selectedEvents.some((selected) => {
            const selectedId = selected._id || selected.id || selected.title;
            return selectedId === eventId;
        });

        const eventDate = new Date(event.startDate || event.start).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });

        return `
            <div class="mobile-goal-item">
                <h4>${event.title}</h4>
                <p>${eventDate} • ${event.company || event.platform || 'Event'}</p>
                <button class="event-goal-btn ${isInGoals ? 'in-goals' : ''}"
                    onclick="toggleEventGoal(${JSON.stringify(event).replace(/"/g, '&quot;')})">
                    <i class="fas ${isInGoals ? 'fa-check-circle' : 'fa-plus'}"></i>
                    ${isInGoals ? 'Added as Goal' : 'Add to Goals'}
                </button>
            </div>
        `;
    }).join('');
}

// Render selected events on Home page
function renderSelectedEvents() {
    const container = document.getElementById('selectedEvents');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Remove past events from selected events
    const updatedEvents = selectedEvents.filter(event => {
        const eventDate = new Date(event.start || event.startDate);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today;
    });
    
    // Update localStorage if any events were removed
    if (updatedEvents.length !== selectedEvents.length) {
        selectedEvents = updatedEvents;
        localStorage.setItem('selectedEvents', JSON.stringify(selectedEvents));
    }
    
    if (selectedEvents.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-check"></i>
                <h3>No Events Selected Yet</h3>
                <p>Go to Calendar to browse and select internships & hackathons</p>
            </div>
        `;
        syncGoalCounters();
        return;
    }
    
    // Sort events by days until event (ascending order)
    const sortedEvents = [...selectedEvents].sort((a, b) => {
        const dateA = new Date(a.start || a.startDate);
        const dateB = new Date(b.start || b.startDate);
        return dateA - dateB; // Earlier events first
    });
    
    container.innerHTML = sortedEvents.map(event => {
        const eventDate = new Date(event.start || event.startDate);
        const deadlineDate = event.deadline ? new Date(event.deadline) : null;
        const daysUntilEvent = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
        const daysUntilDeadline = deadlineDate ? Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24)) : null;
        
        // Check if external contest
        const isExternal = event.external;
        
        let cardClass = 'event-card';
        let badgeClass = 'event-badge';
        let badgeText = '';
        
        // Set badge text based on type
        if (event.type === 'internship') badgeText = 'Internship';
        else if (event.type === 'hackathon') badgeText = 'Hackathon';
        else if (event.type === 'contest') badgeText = isExternal ? event.platform : 'Contest';
        else badgeText = event.type;
        
        if (daysUntilDeadline !== null && daysUntilDeadline <= 7) {
            cardClass += ' deadline-soon';
            badgeClass += ' deadline';
            badgeText = `Deadline in ${daysUntilDeadline} days`;
        } else if (daysUntilEvent <= 14) {
            cardClass += ' upcoming';
            badgeClass += ' upcoming';
        }
        
        // Get event ID
        const eventId = event.id || event._id || event.title;
        
        // Build the card with conditional fields
        return `
            <div class="${cardClass}" ${isExternal ? `onclick="window.open('${event.link}', '_blank')" style="cursor: pointer;"` : ''}>
                <div class="event-header">
                    <div>
                        <h3 class="event-title">${event.title}</h3>
                        <p class="event-company">${event.company || event.platform || 'Contest'}</p>
                    </div>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        ${isExternal ? `<span class="platform-badge platform-${event.platform.toLowerCase()}">${event.platform}</span>` : `<span class="${badgeClass}">${badgeText}</span>`}
                        <button class="remove-event-btn" onclick="${isExternal ? 'event.stopPropagation(); ' : ''}removeEventFromHome('${eventId}')" title="Remove event">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">${event.description || 'No description available'}</p>
                <div class="event-details">
                    <div class="event-detail">
                        <i class="fas fa-calendar"></i>
                        <span>Event: ${eventDate.toLocaleDateString()}</span>
                    </div>
                    ${event.type === 'contest' ? `
                        <div class="event-detail">
                            <i class="fas fa-hourglass-half"></i>
                            <span>Contest in ${daysUntilEvent === 0 ? 'Today' : daysUntilEvent === 1 ? '1 day' : `${daysUntilEvent} days`}</span>
                        </div>
                    ` : ''}
                    ${event.deadline ? `
                        <div class="event-detail">
                            <i class="fas fa-clock"></i>
                            <span>Deadline: ${deadlineDate.toLocaleDateString()}</span>
                        </div>
                    ` : ''}
                    ${event.rounds && event.rounds.length > 0 ? `
                        <div class="event-detail">
                            <i class="fas fa-tasks"></i>
                            <span>${event.rounds.length} Rounds</span>
                        </div>
                    ` : ''}
                    ${isExternal ? `
                        <div class="event-detail">
                            <i class="fas fa-external-link-alt"></i>
                            <span>External Contest</span>
                        </div>
                    ` : ''}
                </div>
                ${event.registrationLink && !isExternal ? `
                    <a href="${event.registrationLink}" target="_blank" class="event-register-btn" onclick="event.stopPropagation();">
                        <i class="fas fa-external-link-alt"></i>
                        Registration Link
                    </a>
                ` : ''}
            </div>
        `;
    }).join('');

    syncGoalCounters();
}

function syncGoalCounters() {
    const totalEventsCount = document.getElementById('totalEventsCount');
    const upcomingEventsCount = document.getElementById('upcomingEventsCount');

    if (totalEventsCount) {
        totalEventsCount.textContent = selectedEvents.length;
    }

    if (upcomingEventsCount) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcoming = selectedEvents.filter((event) => {
            const eventDate = new Date(event.start || event.startDate);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate >= today;
        });
        upcomingEventsCount.textContent = upcoming.length;
    }
}

// Update calendar theme based on current theme
function updateCalendarTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const calendarEl = document.querySelector('.fc');
    
    if (calendarEl) {
        if (isDark) {
            calendarEl.style.setProperty('--fc-border-color', '#334155');
            calendarEl.style.setProperty('--fc-button-bg-color', '#6366f1');
            calendarEl.style.setProperty('--fc-button-border-color', '#6366f1');
            calendarEl.style.setProperty('--fc-button-hover-bg-color', '#4f46e5');
            calendarEl.style.setProperty('--fc-button-active-bg-color', '#4338ca');
            calendarEl.style.setProperty('--fc-today-bg-color', 'rgba(99, 102, 241, 0.1)');
        } else {
            calendarEl.style.setProperty('--fc-border-color', '#e2e8f0');
            calendarEl.style.setProperty('--fc-button-bg-color', '#6366f1');
            calendarEl.style.setProperty('--fc-button-border-color', '#6366f1');
            calendarEl.style.setProperty('--fc-button-hover-bg-color', '#4f46e5');
            calendarEl.style.setProperty('--fc-button-active-bg-color', '#4338ca');
            calendarEl.style.setProperty('--fc-today-bg-color', 'rgba(99, 102, 241, 0.1)');
        }
    }
}

// Listen for theme changes
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
            updateCalendarTheme();
        }
    });
});

observer.observe(document.documentElement, {
    attributes: true
});

// Filter functionality
let currentFilter = 'all';
let unfilteredEvents = [];
let currentSearchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Get filter type
            currentFilter = button.getAttribute('data-filter');
            
            // Apply filter
            filterCalendarEvents();
        });
    });
    
    // Add search functionality
    const searchInput = document.getElementById('calendarSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchQuery = e.target.value.toLowerCase().trim();
            filterCalendarEvents();
        });
    }
});

function filterCalendarEvents() {
    if (!calendar) return;
    
    // Remove all events
    calendar.removeAllEvents();
    
    // Filter events based on current filter
    let eventsToShow = allEvents;
    if (currentFilter !== 'all') {
        eventsToShow = allEvents.filter(event => event.type === currentFilter);
    }
    
    // Apply search filter (only search internships and hackathons)
    if (currentSearchQuery) {
        eventsToShow = eventsToShow.filter(event => {
            // Only search through internships and hackathons
            if (event.type !== 'internship' && event.type !== 'hackathon') {
                // If it's a contest and there's a search query, don't show it
                return false;
            }
            
            // Search in title, company, description, and skills
            const searchableText = [
                event.title,
                event.company,
                event.description,
                ...(event.skills || [])
            ].join(' ').toLowerCase();
            
            return searchableText.includes(currentSearchQuery);
        });
    }
    
    // Add filtered events to calendar
    const calendarEvents = eventsToShow.map(event => ({
        id: event._id || event.platform + '-' + event.title,
        title: event.external ? `[${event.platform.toUpperCase()}] ${event.title}` : event.title,
        start: event.startDate,
        backgroundColor: event.color,
        borderColor: event.color,
        className: `event-${event.type}${event.external ? ' external-contest' : ''}`,
        extendedProps: {
            ...event,
            id: event._id || event.platform + '-' + event.title
        }
    }));
    
    calendar.addEventSource(calendarEvents);
    
    // Update upcoming events list with filtered events
    renderUpcomingEvents(eventsToShow);
    renderMobileGoalsOptions(eventsToShow);
}

// ============================================
// PROFILE, SETTINGS, NOTIFICATIONS FUNCTIONALITY
// ============================================

/**
 * Initialize profile, settings, and notifications sections
 */
document.addEventListener('DOMContentLoaded', () => {
    // Add click handlers for dropdown menu items
    document.querySelectorAll('.dropdown-item[data-section]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionName = item.getAttribute('data-section');
            
            // Close dropdown
            if (userProfileBtn) userProfileBtn.classList.remove('active');
            if (userDropdown) userDropdown.classList.remove('active');
            
            // Navigate to section
            navigateToSection(sectionName);
        });
    });
    
    // Load profile data
    setTimeout(() => loadProfileData(), 500);
    
    // Load settings
    setTimeout(() => loadSettings(), 500);
    
    // Load notifications
    setTimeout(() => loadNotifications(), 500);
    
    // Setup profile form submission
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
});

/**
 * Navigate to a specific section
 */
function navigateToSection(sectionName) {
    if (!sectionName) return;

    // Save active section
    localStorage.setItem('activeSection', sectionName);
    
    // Update nav items
    navItems.forEach(nav => nav.classList.remove('active'));

    // Highlight sidebar item when matching section exists in sidebar nav
    const matchingNav = document.querySelector(`.sidebar .nav-item[data-section="${sectionName}"]`);
    if (matchingNav) {
        matchingNav.classList.add('active');
    }

    showSection(sectionName);
}

/**
 * Load user profile data
 */
function loadProfileData() {
    const profileData = JSON.parse(localStorage.getItem('profileData') || '{}');
    
    // Update profile header
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileAvatarLarge = document.getElementById('profileAvatarLarge');
    
    if (profileName) profileName.textContent = user.name || 'User Name';
    if (profileEmail) profileEmail.textContent = user.email || 'user@example.com';
    if (profileAvatarLarge) profileAvatarLarge.textContent = (user.name || 'U').charAt(0).toUpperCase();
    
    // Update stats
    const memberSince = document.getElementById('memberSince');

    syncGoalCounters();
    if (memberSince) {
        const createdDate = user.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear();
        memberSince.textContent = createdDate;
    }
    
    // Populate form fields
    const fullnameInput = document.getElementById('profile-fullname');
    const emailInput = document.getElementById('profile-email-display');
    const phoneInput = document.getElementById('profile-phone');
    const collegeInput = document.getElementById('profile-college');
    const departmentInput = document.getElementById('profile-department');
    const yearInput = document.getElementById('profile-year');
    const linkedinInput = document.getElementById('profile-linkedin');
    const githubInput = document.getElementById('profile-github');
    const portfolioInput = document.getElementById('profile-portfolio');
    const skillsInput = document.getElementById('profile-skills');
    
    if (fullnameInput) fullnameInput.value = profileData.fullname || user.name || '';
    if (emailInput) emailInput.value = user.email || '';
    if (phoneInput) phoneInput.value = profileData.phone || '';
    if (collegeInput) collegeInput.value = profileData.college || '';
    if (departmentInput) departmentInput.value = profileData.department || '';
    if (yearInput) yearInput.value = profileData.year || '';
    if (linkedinInput) linkedinInput.value = profileData.linkedin || '';
    if (githubInput) githubInput.value = profileData.github || '';
    if (portfolioInput) portfolioInput.value = profileData.portfolio || '';
    if (skillsInput) skillsInput.value = profileData.skills || '';
}

/**
 * Handle profile form submission
 */
async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const profileData = {
        fullname: document.getElementById('profile-fullname').value,
        phone: document.getElementById('profile-phone').value,
        college: document.getElementById('profile-college').value,
        department: document.getElementById('profile-department').value,
        year: document.getElementById('profile-year').value,
        linkedin: document.getElementById('profile-linkedin').value,
        github: document.getElementById('profile-github').value,
        portfolio: document.getElementById('profile-portfolio').value,
        skills: document.getElementById('profile-skills').value
    };
    
    // Save to localStorage
    localStorage.setItem('profileData', JSON.stringify(profileData));
    
    // Update user name if changed
    if (profileData.fullname && profileData.fullname !== user.name) {
        user.name = profileData.fullname;
        localStorage.setItem('user', JSON.stringify(user));
        sessionStorage.setItem('user', JSON.stringify(user));
        
        // Update UI
        const userNameTop = document.getElementById('userNameTop');
        const dropdownUserName = document.getElementById('dropdownUserName');
        const userAvatarTop = document.getElementById('userAvatarTop');
        const profileName = document.getElementById('profileName');
        const profileAvatarLarge = document.getElementById('profileAvatarLarge');
        
        if (userNameTop) userNameTop.textContent = profileData.fullname;
        if (dropdownUserName) dropdownUserName.textContent = profileData.fullname;
        if (userAvatarTop) userAvatarTop.textContent = profileData.fullname.charAt(0).toUpperCase();
        if (profileName) profileName.textContent = profileData.fullname;
        if (profileAvatarLarge) profileAvatarLarge.textContent = profileData.fullname.charAt(0).toUpperCase();
    }
    
    // Show success message
    alert('Profile updated successfully!');
}

/**
 * Load user settings
 */
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
    
    // Set default settings if not exists
    if (!settings.eventReminders) {
        settings.eventReminders = true;
        settings.newOpportunities = true;
        settings.deadlineAlerts = true;
        settings.emailPreferences = false;
        settings.compactView = false;
        settings.dataCollection = true;
        settings.profileVisibility = 'students';
        localStorage.setItem('userSettings', JSON.stringify(settings));
    }
    
    // Apply settings to toggles
    const toggleMap = {
        'emailPrefToggle': settings.emailPreferences,
        'eventRemindersToggle': settings.eventReminders,
        'newOpportunitiesToggle': settings.newOpportunities,
        'deadlineAlertsToggle': settings.deadlineAlerts,
        'compactViewToggle': settings.compactView,
        'dataCollectionToggle': settings.dataCollection
    };
    
    Object.keys(toggleMap).forEach(id => {
        const toggle = document.getElementById(id);
        if (toggle && toggleMap[id]) {
            toggle.classList.add('active');
        } else if (toggle) {
            toggle.classList.remove('active');
        }
    });
    
    // Set dark mode toggle based on current theme
    const isDarkMode = document.body.classList.contains('dark-mode');
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle && isDarkMode) {
        darkModeToggle.classList.add('active');
    } else if (darkModeToggle) {
        darkModeToggle.classList.remove('active');
    }
}

/**
 * Toggle setting switch
 */
function toggleSetting(element, settingName) {
    element.classList.toggle('active');
    const isActive = element.classList.contains('active');
    
    // Save to localStorage
    const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
    settings[settingName] = isActive;
    localStorage.setItem('userSettings', JSON.stringify(settings));
}

/**
 * Toggle dark mode from settings
 */
function toggleDarkModeFromSettings() {
    const toggle = document.getElementById('darkModeToggle');
    const themeToggle = document.getElementById('themeToggle');
    
    // Toggle the actual theme
    if (themeToggle) {
        themeToggle.click();
    }
    
    // Update toggle state
    setTimeout(() => {
        const isDarkMode = document.body.classList.contains('dark-mode');
        if (toggle) {
            if (isDarkMode) {
                toggle.classList.add('active');
            } else {
                toggle.classList.remove('active');
            }
        }
    }, 100);
}

/**
 * Update privacy setting
 */
function updatePrivacySetting(settingName, value) {
    const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
    settings[settingName] = value;
    localStorage.setItem('userSettings', JSON.stringify(settings));
}

/**
 * Show change password dialog
 */
function showChangePassword() {
    const confirmed = confirm('Do you want to change your password? You will be redirected to the password reset page.');
    if (confirmed) {
        window.location.href = 'forgot-password.html';
    }
}

/**
 * Confirm account deletion
 */
function confirmDeleteAccount() {
    const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (confirmed) {
        const doubleCheck = prompt('Type "DELETE" to confirm account deletion:');
        if (doubleCheck === 'DELETE') {
            // In real implementation, make API call to delete account
            alert('Account deletion request submitted. You will be logged out.');
            // Clear all data and logout
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = 'index.html';
        }
    }
}

/**
 * Load notifications
 */
function loadNotifications() {
    let notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    
    // Generate sample notifications if empty
    if (notifications.length === 0) {
        notifications = generateSampleNotifications();
        localStorage.setItem('notifications', JSON.stringify(notifications));
    }
    
    renderNotifications(notifications);
}

/**
 * Generate sample notifications
 */
function generateSampleNotifications() {
    const now = new Date();
    const notifications = [
        {
            id: 1,
            type: 'events',
            title: 'New Hackathon Available',
            message: 'Google HashCode 2026 registration is now open!',
            time: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
            unread: true
        },
        {
            id: 2,
            type: 'deadlines',
            title: 'Deadline Approaching',
            message: 'Microsoft Internship application deadline is in 2 days',
            time: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
            unread: true
        },
        {
            id: 3,
            type: 'announcements',
            title: 'Platform Update',
            message: 'New features added: Profile customization and notifications center',
            time: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
            unread: false
        },
        {
            id: 4,
            type: 'events',
            title: 'Event Reminder',
            message: 'Your selected event "Meta Hackathon" starts tomorrow',
            time: new Date(now - 48 * 60 * 60 * 1000).toISOString(),
            unread: false
        }
    ];
    
    return notifications;
}

/**
 * Render notifications
 */
function renderNotifications(notifications, filter = 'all') {
    const container = document.getElementById('notificationsList');
    if (!container) return;
    
    // Filter notifications
    let filtered = notifications;
    if (filter !== 'all') {
        filtered = notifications.filter(n => n.type === filter);
    }
    
    // Sort by time (newest first)
    filtered.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bell-slash"></i>
                <h3>No Notifications</h3>
                <p>You're all caught up!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filtered.map(notif => {
        const timeAgo = getTimeAgo(new Date(notif.time));
        const iconMap = {
            events: 'fa-calendar',
            deadlines: 'fa-clock',
            announcements: 'fa-bullhorn'
        };
        
        return `
            <div class="notification-item ${notif.unread ? 'unread' : ''}" data-id="${notif.id}">
                <div class="notification-icon">
                    <i class="fas ${iconMap[notif.type] || 'fa-bell'}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notif.title}</div>
                    <div class="notification-message">${notif.message}</div>
                    <div class="notification-time"><i class="fas fa-clock"></i> ${timeAgo}</div>
                </div>
                <div class="notification-actions">
                    ${notif.unread ? `<button class="mark-read-btn" onclick="markAsRead(${notif.id})">Mark Read</button>` : ''}
                    <button class="delete-notif-btn" onclick="deleteNotification(${notif.id})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Get time ago string
 */
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
}

/**
 * Filter notifications by type
 */
function filterNotifications(filter, buttonElement) {
    // Update active button
    document.querySelectorAll('.notif-filter-btn').forEach(btn => btn.classList.remove('active'));
    buttonElement.classList.add('active');
    
    // Reload notifications with filter
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    renderNotifications(notifications, filter);
}

/**
 * Mark notification as read
 */
function markAsRead(notifId) {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const notif = notifications.find(n => n.id === notifId);
    if (notif) {
        notif.unread = false;
        localStorage.setItem('notifications', JSON.stringify(notifications));
        
        // Get current filter
        const activeFilter = document.querySelector('.notif-filter-btn.active');
        const filter = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';
        renderNotifications(notifications, filter);
    }
}

/**
 * Mark all notifications as read
 */
function markAllAsRead() {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.forEach(n => n.unread = false);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    const activeFilter = document.querySelector('.notif-filter-btn.active');
    const filter = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';
    renderNotifications(notifications, filter);
}

/**
 * Delete notification
 */
function deleteNotification(notifId) {
    let notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications = notifications.filter(n => n.id !== notifId);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    const activeFilter = document.querySelector('.notif-filter-btn.active');
    const filter = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';
    renderNotifications(notifications, filter);
}

// ============================================
// ROADMAP PROGRESS FUNCTIONALITY
// ============================================

/**
 * Load and display roadmap progress on home page
 */
async function loadRoadmapProgress() {
    try {
        const userId = user._id || user.id;
        if (!userId) {
            console.error('No user ID found');
            return;
        }
        
        const response = await fetch(`${API_URL}/roadmap/${userId}`);
        const data = await response.json();
        
        if (data.success && data.roadmap) {
            // Display progress chart
            displayProgressChart(data.roadmap.progress);
            
            // Display progress tracks by subject
            displayProgressTracks(data.roadmap);
        } else {
            // Show empty state for progress sections
            showEmptyProgressState();
        }
    } catch (error) {
        console.error('Error loading roadmap progress:', error);
        showEmptyProgressState();
    }
}

/**
 * Display overall progress chart
 */
function displayProgressChart(progress) {
    const canvas = document.getElementById('progressChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const percentage = progress.percentage || 0;
    
    // Update percentage text
    const percentageEl = document.getElementById('overallPercentage');
    if (percentageEl) {
        percentageEl.textContent = `${percentage}%`;
    }
    
    // Draw donut chart
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 70;
    const lineWidth = 15;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() || '#e2e8f0';
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    
    // Progress arc
    if (percentage > 0) {
        const endAngle = (percentage / 100) * 2 * Math.PI - Math.PI / 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, endAngle);
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.stroke();
    }
}

/**
 * Display progress tracks by subject
 */
function displayProgressTracks(roadmap) {
    const container = document.getElementById('progressTracks');
    if (!container) return;
    
    // Calculate progress per subject
    const subjectProgress = {};
    
    roadmap.subjects.forEach(subject => {
        subjectProgress[subject] = {
            total: 0,
            completed: 0
        };
    });
    
    // Count tasks per subject
    roadmap.dailyTasks.forEach(task => {
        const subject = task.subject;
        if (subjectProgress[subject]) {
            subjectProgress[subject].total++;
            if (task.isCompleted) {
                subjectProgress[subject].completed++;
            }
        }
    });
    
    // Get subject full names
    const subjectNames = {
        'DSA': 'Data Structures & Algorithms',
        'OS': 'Operating Systems',
        'DBMS': 'Database Management',
        'CN': 'Computer Networks',
        'SD': 'System Design'
    };
    
    // Get subject emojis
    const subjectEmojis = {
        'DSA': '💻',
        'OS': '⚙️',
        'DBMS': '🗄️',
        'CN': '🌐',
        'SD': '🏗️'
    };
    
    // Generate HTML for each subject
    const html = roadmap.subjects.map(subject => {
        const progress = subjectProgress[subject];
        const percentage = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
        const emoji = subjectEmojis[subject] || '📚';
        const name = subjectNames[subject] || subject;
        
        return `
            <div class="progress-track-item">
                <div class="track-header">
                    <span class="track-emoji">${emoji}</span>
                    <div class="track-info">
                        <h4 class="track-title">${name}</h4>
                        <span class="track-stats">${progress.completed}/${progress.total} tasks</span>
                    </div>
                    <span class="track-percentage">${percentage}%</span>
                </div>
                <div class="track-progress-bar">
                    <div class="track-progress-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

/**
 * Show empty state when no roadmap exists
 */
function showEmptyProgressState() {
    // Reset progress chart
    const percentageEl = document.getElementById('overallPercentage');
    if (percentageEl) {
        percentageEl.textContent = '0%';
    }
    
    const canvas = document.getElementById('progressChart');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw empty circle
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 70;
        const lineWidth = 15;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() || '#e2e8f0';
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    }
    
    // Show empty state in progress tracks
    const container = document.getElementById('progressTracks');
    if (container) {
        container.innerHTML = `
            <div class="no-roadmap-state">
                <i class="fas fa-map-marked-alt"></i>
                <h3>No Active Roadmap</h3>
                <p>Create a learning roadmap to start tracking your progress</p>
                <a href="roadmap.html" class="create-roadmap-btn">
                    <i class="fas fa-plus"></i>
                    Create Roadmap
                </a>
            </div>
        `;
    }
}

// Mobile sidebar toggle (single source of truth)
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.querySelector('.sidebar');
    const mainArea = document.querySelector('.main-area');
    const mobileSidebarBackdrop = document.getElementById('mobileSidebarBackdrop');
    const navigationItems = document.querySelectorAll('.nav-item');

    if (!mobileMenuToggle || !sidebar) return;

    const closeMobileSidebar = () => {
        mobileMenuToggle.classList.remove('active');
        sidebar.classList.remove('active');
        if (mainArea) {
            mainArea.classList.remove('sidebar-open');
        }
        if (mobileSidebarBackdrop) {
            mobileSidebarBackdrop.classList.remove('active');
        }
    };

    mobileMenuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpening = !sidebar.classList.contains('active');

        mobileMenuToggle.classList.toggle('active', isOpening);
        sidebar.classList.toggle('active', isOpening);

        if (mainArea) {
            mainArea.classList.toggle('sidebar-open', isOpening);
        }

        if (mobileSidebarBackdrop) {
            mobileSidebarBackdrop.classList.toggle('active', isOpening);
        }
    });

    navigationItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                closeMobileSidebar();
            }
        });
    });

    if (mobileSidebarBackdrop) {
        mobileSidebarBackdrop.addEventListener('click', closeMobileSidebar);
    }

    document.addEventListener('click', (e) => {
        if (window.innerWidth > 768) return;

        if (!e.target.closest('.sidebar') && !e.target.closest('.mobile-menu-toggle')) {
            closeMobileSidebar();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMobileSidebar();
        }
    });
});
