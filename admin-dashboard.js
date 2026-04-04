// Admin Dashboard JavaScript

const API_BASE_URL = window.API_CONFIG?.BASE_URL || 'http://localhost:5000/api';
let allUsers = [];
let currentPage = 1;
const usersPerPage = 10;

/**
 * Check if user is admin when page loads
 */
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
    const userRole = user.role || localStorage.getItem('userRole');

    if (!token || userRole !== 'admin') {
        alert('Access denied. Admin privileges required.');
        window.location.href = 'index.html';
        return;
    }

    loadStatistics();
    loadUsers();
});

/**
 * Load platform statistics
 */
async function loadStatistics() {
    try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (!token) {
            showMessage('No authentication token found. Please login again.', 'error');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/admin/statistics`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            document.getElementById('total-students').textContent = data.statistics.totalStudents;
            document.getElementById('verified-students').textContent = data.statistics.verifiedStudents;
            document.getElementById('unverified-students').textContent = data.statistics.unverifiedStudents;
            document.getElementById('total-events').textContent = data.statistics.totalEvents;
        } else {
            showMessage(data.message || 'Failed to load statistics', 'error');
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
        showMessage('Error loading statistics: ' + error.message, 'error');
    }
}

/**
 * Load all users
 */
async function loadUsers() {
    try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (!token) {
            showMessage('No authentication token found. Please login again.', 'error');
            document.getElementById('users-container').innerHTML = 
                '<div class="error-message">Authentication required. Please login again.</div>';
            return;
        }

        document.getElementById('users-container').innerHTML = '<div class="loading">Loading students...</div>';

        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            allUsers = data.users;
            displayUsers(allUsers);
        } else {
            showMessage(data.message || 'Failed to load students', 'error');
            document.getElementById('users-container').innerHTML = 
                `<div class="error-message">${data.message || 'Failed to load students'}</div>`;
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showMessage('Error loading students: ' + error.message, 'error');
        document.getElementById('users-container').innerHTML = 
            `<div class="error-message">Failed to load students. ${error.message}</div>`;
    }
}

/**
 * Display users in table
 */
function displayUsers(users) {
    if (users.length === 0) {
        document.getElementById('users-container').innerHTML = 
            '<div class="no-data">No students found</div>';
        return;
    }

    let html = `
        <table class="users-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Gender</th>
                    <th>Status</th>
                    <th>Events</th>
                    <th>Joined</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
    `;

    users.forEach(user => {
        const joinedDate = new Date(user.createdAt).toLocaleDateString();
        const statusClass = user.isVerified ? 'status-verified' : 'status-unverified';
        const statusText = user.isVerified ? 'Verified' : 'Unverified';

        html += `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.gender}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${user.eventCount}</td>
                <td>${joinedDate}</td>
                <td><button class="view-btn" onclick="viewUserDetails('${user.id}')">View</button></td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    document.getElementById('users-container').innerHTML = html;
}

/**
 * View user details
 */
async function viewUserDetails(userId) {
    try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (!token) {
            showMessage('No authentication token found. Please login again.', 'error');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/admin/user/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            displayUserModal(data.user, data.events);
        } else {
            showMessage(data.message || 'Failed to load user details', 'error');
        }
    } catch (error) {
        console.error('Error loading user details:', error);
        showMessage('Error loading user details: ' + error.message, 'error');
    }
}

/**
 * Display user details modal
 */
function displayUserModal(user, events) {
    let eventsHtml = '';

    if (events && events.length > 0) {
        events.forEach(event => {
            const startDate = new Date(event.startDate).toLocaleDateString();
            eventsHtml += `
                <div class="event-item">
                    <strong>${event.title}</strong> - ${event.company}
                    <br><small>${event.type} | ${startDate}</small>
                </div>
            `;
        });
    } else {
        eventsHtml = '<div class="event-item">No events registered yet</div>';
    }

    const joinedDate = new Date(user.createdAt).toLocaleDateString();
    const lastUpdated = new Date(user.updatedAt).toLocaleDateString();

    const html = `
        <div class="user-details">
            <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span class="detail-value">${user.name}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${user.email}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Gender:</span>
                <span class="detail-value">${user.gender}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">
                    <span class="status-badge ${user.isVerified ? 'status-verified' : 'status-unverified'}">
                        ${user.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                </span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Joined:</span>
                <span class="detail-value">${joinedDate}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Last Updated:</span>
                <span class="detail-value">${lastUpdated}</span>
            </div>
        </div>

        <h3>Events Progress (${events ? events.length : 0} events)</h3>
        <div class="user-events-list">
            ${eventsHtml}
        </div>
    `;

    document.getElementById('modal-body').innerHTML = html;
    document.getElementById('user-modal').style.display = 'block';
}

/**
 * Close user details modal
 */
function closeUserModal() {
    document.getElementById('user-modal').style.display = 'none';
}

/**
 * Search users by name or email
 */
function searchUsers() {
    const searchValue = document.getElementById('search-input').value.toLowerCase().trim();

    if (searchValue === '') {
        displayUsers(allUsers);
        return;
    }

    const filteredUsers = allUsers.filter(user => 
        user.name.toLowerCase().includes(searchValue) || 
        user.email.toLowerCase().includes(searchValue)
    );

    displayUsers(filteredUsers);
}

/**
 * Show message (success/error)
 */
function showMessage(message, type) {
    const container = document.getElementById('message-container');
    const className = type === 'error' ? 'error-message' : 'success-message';
    container.innerHTML = `<div class="${className}">${message}</div>`;
    
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}

/**
 * Logout admin
 */
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        window.location.href = 'index.html';
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('user-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

// Allow search on Enter key
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchUsers();
            }
        });
    }
});
