/**
 * Mini Calendar Functionality
 * Creates and manages a mini calendar in the sidebar
 */

let miniCalendarCurrentDate = new Date();

/**
 * Initialize mini calendar on DOM ready
 */
document.addEventListener('DOMContentLoaded', () => {
    initMiniCalendar();
    updateLocalTime();
    setInterval(updateLocalTime, 1000);
});

/**
 * Initialize the mini calendar
 */
function initMiniCalendar() {
    const grid = document.getElementById('miniCalendarGrid');
    if (!grid) return;
    
    renderMiniCalendar();
    
    // Add month navigation listeners
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            miniCalendarCurrentDate.setMonth(miniCalendarCurrentDate.getMonth() - 1);
            renderMiniCalendar();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            miniCalendarCurrentDate.setMonth(miniCalendarCurrentDate.getMonth() + 1);
            renderMiniCalendar();
        });
    }
}

/**
 * Render the mini calendar grid
 */
function renderMiniCalendar() {
    const grid = document.getElementById('miniCalendarGrid');
    const monthDisplay = document.getElementById('miniCalendarMonth');
    
    if (!grid) return;
    
    const year = miniCalendarCurrentDate.getFullYear();
    const month = miniCalendarCurrentDate.getMonth();
    
    // Update month display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    if (monthDisplay) {
        monthDisplay.textContent = `${monthNames[month]} ${year}`;
    }
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    // Create calendar grid HTML
    let html = '';
    
    // Day labels
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayLabels.forEach(label => {
        html += `<div class="day-label">${label}</div>`;
    });
    
    // Previous month's days
    for (let i = firstDay - 1; i >= 0; i--) {
        html += `<div class="mini-calendar-day other-month">${daysInPrevMonth - i}</div>`;
    }
    
    // Current month's days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === today.getDate() && 
                       month === today.getMonth() && 
                       year === today.getFullYear();
        
        const classList = isToday ? 'mini-calendar-day today' : 'mini-calendar-day';
        html += `<div class="${classList}" data-date="${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}">${day}</div>`;
    }
    
    // Next month's days
    const totalCells = grid.children.length > 0 ? 
                       Math.ceil((firstDay + daysInMonth) / 7) * 7 : 
                       42; // Standard calendar grid is 6 rows × 7 days
    const remainingCells = totalCells - firstDay - daysInMonth;
    for (let day = 1; day <= remainingCells; day++) {
        html += `<div class="mini-calendar-day other-month">${day}</div>`;
    }
    
    grid.innerHTML = html;
    
    // Add click handlers to current month days
    grid.querySelectorAll('.mini-calendar-day:not(.other-month)').forEach(day => {
        day.addEventListener('click', () => {
            // Remove previous selection
            grid.querySelectorAll('.mini-calendar-day').forEach(d => d.classList.remove('selected'));
            day.classList.add('selected');
            
            // Navigate calendar to this date if FullCalendar is initialized
            if (calendar) {
                const dateStr = day.getAttribute('data-date');
                calendar.gotoDate(dateStr);
            }
        });
    });
}

/**
 * Update local time display
 */
function updateLocalTime() {
    const timeEl = document.getElementById('localTime');
    const dateEl = document.getElementById('localDate');
    
    if (!timeEl && !dateEl) return;
    
    const now = new Date();
    
    if (timeEl) {
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeEl.textContent = `${hours}:${minutes}`;
    }
    
    if (dateEl) {
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        dateEl.textContent = now.toLocaleDateString('en-US', options);
    }
}
