/**
 * Roadmap Page JavaScript
 * Handles roadmap generation, display, and progress tracking
 */

const API_URL = window.API_CONFIG?.BASE_URL || 'http://localhost:5000/api';
let currentUserId = null;
let currentRoadmap = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initializePage();
  initializeMobileSidebar();
});

/**
 * Initialize mobile sidebar toggle for roadmap page
 */
function initializeMobileSidebar() {
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const sidebar = document.querySelector('.sidebar');
  const mainArea = document.querySelector('.main-area');
  const mobileSidebarBackdrop = document.getElementById('mobileSidebarBackdrop');

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

  if (mobileSidebarBackdrop) {
    mobileSidebarBackdrop.addEventListener('click', closeMobileSidebar);
  }

  document.querySelectorAll('.sidebar .nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        closeMobileSidebar();
      }
    });
  });

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
}

/**
 * Initialize the roadmap page
 */
async function initializePage() {
  // Get user from localStorage or sessionStorage (same as dashboard)
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
  
  console.log('Token exists:', !!token);
  console.log('User data exists:', !!userStr);
  console.log('Token value:', token);
  console.log('User value:', userStr);
  
  if (!token || !userStr) {
    console.error('No token or user data found');
    alert('Session expired. Please login again.');
    window.location.href = 'index.html';
    return;
  }
  
  let user;
  try {
    user = JSON.parse(userStr);
    console.log('Parsed user:', user);
  } catch (e) {
    console.error('Error parsing user:', e);
    alert('Invalid session data. Please login again.');
    window.location.href = 'index.html';
    return;
  }
  
  if (!user || (!user._id && !user.id)) {
    console.error('User object missing id field');
    alert('Invalid user data. Please login again.');
    window.location.href = 'index.html';
    return;
  }
  
  console.log('User ID:', user._id || user.id);
  currentUserId = user._id || user.id;
  
  // Try to load existing roadmap
  await loadExistingRoadmap();
  
  // Setup form submission
  document.getElementById('roadmapForm').addEventListener('submit', handleGenerateRoadmap);
}

/**
 * Load existing roadmap if it exists
 */
async function loadExistingRoadmap() {
  try {
    const response = await fetch(`${API_URL}/roadmap/${currentUserId}`);
    const data = await response.json();
    
    if (data.success && data.roadmap) {
      currentRoadmap = data.roadmap;
      displayRoadmap(data.roadmap);
      updateProgressDisplay(data.roadmap.progress);
      
      // Hide empty state
      document.getElementById('emptyState').style.display = 'none';
    } else {
      // Show empty state
      document.getElementById('emptyState').style.display = 'block';
      document.getElementById('progressOverview').classList.remove('show');
      document.getElementById('roadmapSection').classList.remove('show');
    }
  } catch (error) {
    console.error('Error loading roadmap:', error);
    // Show empty state on error
    document.getElementById('emptyState').style.display = 'block';
  }
}

/**
 * Handle roadmap generation form submission
 */
async function handleGenerateRoadmap(event) {
  event.preventDefault();
  
  // Get selected subjects
  const subjectCheckboxes = document.querySelectorAll('input[name="subject"]:checked');
  const subjects = Array.from(subjectCheckboxes).map(cb => cb.value);
  
  // Get total days
  const totalDays = parseInt(document.getElementById('totalDays').value);
  
  // Validation
  if (subjects.length === 0) {
    alert('Please select at least one subject');
    return;
  }
  
  if (!totalDays || totalDays < 1) {
    alert('Please enter a valid number of days (at least 1)');
    return;
  }
  
  // Disable button and show loading
  const submitBtn = document.querySelector('.generate-btn');
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
  
  try {
    const response = await fetch(`${API_URL}/roadmap/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: currentUserId,
        subjects: subjects,
        totalDays: totalDays
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      currentRoadmap = data.roadmap;
      displayRoadmap(data.roadmap);
      updateProgressDisplay(data.roadmap.progress);
      
      // Hide empty state
      document.getElementById('emptyState').style.display = 'none';
      
      // Show success message
      showNotification('Roadmap generated successfully! 🎉', 'success');
      
      // Scroll to roadmap
      setTimeout(() => {
        document.getElementById('roadmapSection').scrollIntoView({ behavior: 'smooth' });
      }, 500);
    } else {
      alert('Error: ' + data.message);
    }
  } catch (error) {
    console.error('Error generating roadmap:', error);
    alert('Failed to generate roadmap. Please try again.');
  } finally {
    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

/**
 * Display the roadmap timeline
 */
function displayRoadmap(roadmap) {
  const timeline = document.getElementById('roadmapTimeline');
  timeline.innerHTML = '';
  
  // Group tasks by subject and then by topic
  const groupedTasks = groupTasksBySubjectAndTopic(roadmap.dailyTasks);
  
  // Create collapsible sections for each subject
  Object.keys(groupedTasks).forEach(subject => {
    const subjectSection = createSubjectSection(subject, groupedTasks[subject]);
    timeline.appendChild(subjectSection);
  });
  
  // Show sections
  document.getElementById('progressOverview').classList.add('show');
  document.getElementById('roadmapSection').classList.add('show');
}

/**
 * Group tasks by subject and topic
 */
function groupTasksBySubjectAndTopic(tasks) {
  const grouped = {};
  
  tasks.forEach(task => {
    if (!grouped[task.subject]) {
      grouped[task.subject] = {};
    }
    
    if (!grouped[task.subject][task.topic]) {
      grouped[task.subject][task.topic] = [];
    }
    
    grouped[task.subject][task.topic].push(task);
  });
  
  return grouped;
}

/**
 * Create a subject section with topics
 */
function createSubjectSection(subject, topics) {
  const section = document.createElement('div');
  section.className = 'subject-section';
  
  const subjectClass = subject.toLowerCase();
  const subjectName = getSubjectFullName(subject);
  
  // Calculate subject progress
  let totalTasks = 0;
  let completedTasks = 0;
  
  Object.values(topics).forEach(taskArray => {
    totalTasks += taskArray.length;
    completedTasks += taskArray.filter(t => t.isCompleted).length;
  });
  
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Create topics HTML
  const topicsHTML = Object.entries(topics).map(([topicName, tasks]) => 
    createTopicItems(topicName, tasks, subject)
  ).join('');
  
  section.innerHTML = `
    <div class="subject-header" onclick="toggleSubjectSection(this)">
      <div class="subject-title">
        <i class="fas fa-chevron-down expand-icon"></i>
        <span class="subject-badge ${subjectClass}">${subject}</span>
        <span class="subject-name">${subjectName}</span>
      </div>
      <div class="subject-progress-container">
        <div class="progress-bar-small">
          <div class="progress-fill-small" style="width: ${percentage}%"></div>
        </div>
        <span class="task-count">${completedTasks} / ${totalTasks}</span>
      </div>
    </div>
    <div class="topics-container" style="display: block;">
      ${topicsHTML}
    </div>
  `;
  
  return section;
}

/**
 * Create topic items (simplified - showing tasks directly)
 */
function createTopicItems(topicName, tasks, subject) {
  return tasks.map(task => {
    const hasSubtopics = task.subtopics && task.subtopics.length > 0;
    const subtopicsHTML = hasSubtopics 
      ? `<div class="subtopics-list" style="display: none; margin-top: 0.5rem; padding-left: 1.5rem; font-size: 0.8125rem; color: var(--text-secondary);">
          ${task.subtopics.map((subtopic, idx) => `
            <div style="padding: 0.25rem 0; display: flex; align-items: start; gap: 0.5rem;">
              <span style="color: var(--accent-color); margin-top: 0.125rem;">•</span>
              <span>${subtopic}</span>
            </div>
          `).join('')}
        </div>`
      : '';
    
    return `
      <div class="topic-item ${task.isCompleted ? 'completed' : ''}">
        <div class="topic-left">
          <input 
            type="checkbox" 
            id="task-day-${task.day}" 
            class="task-checkbox"
            ${task.isCompleted ? 'checked' : ''}
            onchange="handleTaskToggle(${task.day}, this)"
          >
          <label for="task-day-${task.day}" class="day-label">Day ${task.day}</label>
        </div>
        <div class="topic-right">
          <div class="topic-header-text">
            <div style="display: flex; align-items: center; gap: 0.5rem; flex: 1;">
              <span class="topic-name">${task.topic}</span>
              ${hasSubtopics ? `
                <button onclick="toggleSubtopics(this, event)" style="background: none; border: none; color: var(--accent-color); cursor: pointer; padding: 0.25rem 0.5rem; font-size: 0.75rem; display: flex; align-items: center; gap: 0.25rem; border-radius: 4px; transition: all 0.2s;" title="View subtopics">
                  <i class="fas fa-chevron-down" style="font-size: 0.625rem; transition: transform 0.2s;"></i>
                  <span>Details</span>
                </button>
              ` : ''}
            </div>
            <span class="topic-time"><i class="fas fa-clock"></i> ${task.estimatedTime}</span>
          </div>
          ${subtopicsHTML}
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Toggle subtopics dropdown
 */
function toggleSubtopics(button, event) {
  event.stopPropagation();
  const topicItem = button.closest('.topic-item');
  const subtopicsList = topicItem.querySelector('.subtopics-list');
  const icon = button.querySelector('i');
  
  if (subtopicsList.style.display === 'none') {
    subtopicsList.style.display = 'block';
    icon.style.transform = 'rotate(180deg)';
  } else {
    subtopicsList.style.display = 'none';
    icon.style.transform = 'rotate(0deg)';
  }
}

/**
 * Toggle subject section expand/collapse
 */
function toggleSubjectSection(element) {
  const section = element.parentElement;
  const icon = element.querySelector('.expand-icon');
  const container = section.querySelector('.topics-container');
  
  const isExpanded = container.style.display === 'block';
  
  if (isExpanded) {
    container.style.display = 'none';
    icon.classList.remove('fa-chevron-down');
    icon.classList.add('fa-chevron-right');
  } else {
    container.style.display = 'block';
    icon.classList.remove('fa-chevron-right');
    icon.classList.add('fa-chevron-down');
  }
}

/**
 * Handle task checkbox toggle
 */
async function handleTaskToggle(day, checkbox) {
  const newStatus = checkbox.checked;
  
  try {
    const response = await fetch(`${API_URL}/roadmap/progress`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: currentUserId,
        day: day,
        isCompleted: newStatus
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Update task item styling
      const taskItem = checkbox.closest('.topic-item');
      if (newStatus) {
        taskItem.classList.add('completed');
      } else {
        taskItem.classList.remove('completed');
      }
      
      // Update progress display
      updateProgressDisplay(data.progress);
      
      // Reload to update all progress bars
      await loadExistingRoadmap();
      
      // Show notification
      showNotification(
        newStatus ? 'Task completed! 🎉' : 'Task marked incomplete',
        newStatus ? 'success' : 'info'
      );
    } else {
      alert('Error updating progress: ' + data.message);
      checkbox.checked = !newStatus;
    }
  } catch (error) {
    console.error('Error updating progress:', error);
    alert('Failed to update progress. Please try again.');
    checkbox.checked = !newStatus;
  }
}

/**
 * Toggle task completion status
 */
async function toggleTaskCompletion(day) {
  // This function is now handled by handleTaskToggle
  console.log('toggleTaskCompletion called for day:', day);
}

/**
 * Update progress display
 */
function updateProgressDisplay(progress) {
  document.getElementById('totalDaysCount').textContent = progress.totalTasks;
  document.getElementById('completedCount').textContent = progress.completedTasks;
  document.getElementById('remainingCount').textContent = progress.totalTasks - progress.completedTasks;
  
  const progressFill = document.getElementById('progressFill');
  progressFill.style.width = progress.percentage + '%';
  progressFill.textContent = progress.percentage + '%';
}

/**
 * Toggle subject selection (visual feedback)
 */
function toggleSubject(element) {
  const checkbox = element.querySelector('input[type="checkbox"]');
  checkbox.checked = !checkbox.checked;
  
  if (checkbox.checked) {
    element.classList.add('selected');
  } else {
    element.classList.remove('selected');
  }
}

/**
 * Get full subject name
 */
function getSubjectFullName(code) {
  const names = {
    'DSA': 'Data Structures & Algorithms',
    'OS': 'Operating Systems',
    'DBMS': 'Database Management Systems',
    'CN': 'Computer Networks',
    'SD': 'System Design'
  };
  return names[code] || code;
}

/**
 * Show notification
 */
function showNotification(message, type = 'success') {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: ${type === 'success' ? '#10b981' : '#3b82f6'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/**
 * Reset/Delete the current roadmap
 */
async function resetRoadmap() {
  if (!confirm('Are you sure you want to reset your roadmap? All progress will be lost.')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/roadmap/${currentUserId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Clear current roadmap
      currentRoadmap = null;
      
      // Hide roadmap sections
      document.getElementById('progressOverview').classList.remove('show');
      document.getElementById('roadmapSection').classList.remove('show');
      
      // Clear timeline
      document.getElementById('roadmapTimeline').innerHTML = '';
      
      // Show empty state
      document.getElementById('emptyState').style.display = 'block';
      
      // Reset form
      document.querySelectorAll('input[name="subject"]').forEach(cb => {
        cb.checked = false;
        cb.parentElement.classList.remove('selected');
      });
      document.getElementById('totalDays').value = '';
      
      // Show success message
      showNotification('Roadmap reset successfully! Generate a new one below.', 'success');
      
      // Scroll to generator
      document.getElementById('generatorSection').scrollIntoView({ behavior: 'smooth' });
    } else {
      alert('Error resetting roadmap: ' + data.message);
    }
  } catch (error) {
    console.error('Error resetting roadmap:', error);
    alert('Failed to reset roadmap. Please try again.');
  }
}

/**
 * Handle logout
 */
function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  }
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
