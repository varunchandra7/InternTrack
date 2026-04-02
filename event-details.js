const token = localStorage.getItem('token') || sessionStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

if (!token) {
    window.location.href = 'index.html';
}

const urlParams = new URLSearchParams(window.location.search);
const source = urlParams.get('source') || '';
const payloadParam = urlParams.get('payload');
const cacheKey = urlParams.get('key');
const eventId = urlParams.get('id');
const fallbackTitle = urlParams.get('event') || urlParams.get('title') || '';
const API_URL = window.API_CONFIG?.BASE_URL || 'http://localhost:5000/api';

let currentEvent = null;
let currentRoadmap = [];

const TYPE_META = {
    internship: { label: 'Internship', badgeClass: 'badge-internship', accent: '#6366f1' },
    hackathon: { label: 'Hackathon', badgeClass: 'badge-hackathon', accent: '#ec4899' },
    fest: { label: 'College Fest', badgeClass: 'badge-workshop', accent: '#3b82f6' },
    workshop: { label: 'Workshop', badgeClass: 'badge-workshop', accent: '#3b82f6' },
    exam: { label: 'Exam', badgeClass: 'badge-workshop', accent: '#f59e0b' }
};

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatDate(dateString) {
    if (!dateString) return 'To be announced';
    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
}

function formatDateRange(event) {
    if (!event.startDate && !event.endDate) return 'Check official page';
    if (event.startDate && event.endDate) {
        return `${formatDate(event.startDate)} to ${formatDate(event.endDate)}`;
    }
    return formatDate(event.startDate || event.endDate);
}

function getTypeMeta(type) {
    return TYPE_META[type] || TYPE_META.workshop;
}

function normalizeEvent(raw) {
    const event = raw?.event || raw || {};
    return {
        id: event.id || event._id || fallbackTitle || 'event',
        title: event.title || fallbackTitle || 'Event Details',
        organizer: event.organizer || event.company || event.college || event.name || 'InternTrack',
        type: event.type || 'workshop',
        description: event.description || 'Detailed information will appear here.',
        startDate: event.startDate || event.start || '',
        endDate: event.endDate || event.end || event.startDate || '',
        deadline: event.deadline || event.registrationDeadline || event.endDate || event.startDate || '',
        skillsRequired: event.skillsRequired || event.skills || [],
        registrationLink: event.registrationLink || event.link || '#',
        time: event.time || 'Full day',
        rounds: event.rounds || [],
        imageUrl: event.imageUrl || event.bannerUrl || '',
        roadmapSeed: event.roadmapSeed || ''
    };
}

function cleanupCachedEvents() {
    const prefix = 'interntrack-event-detail-';
    const maxAge = 6 * 60 * 60 * 1000;
    const now = Date.now();

    for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        if (!key || !key.startsWith(prefix)) {
            continue;
        }

        try {
            const payload = JSON.parse(localStorage.getItem(key) || '{}');
            const createdAt = payload.createdAt || 0;
            if (!createdAt || now - createdAt > maxAge) {
                localStorage.removeItem(key);
            }
        } catch {
            localStorage.removeItem(key);
        }
    }
}

function readCachedCalendarEvent() {
    if (!cacheKey) return null;

    try {
        const raw = localStorage.getItem(cacheKey);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return normalizeEvent(parsed);
    } catch {
        return null;
    }
}

function readPayloadEvent() {
    if (!payloadParam) return null;

    try {
        const parsed = JSON.parse(payloadParam);
        return normalizeEvent(parsed);
    } catch {
        return null;
    }
}

function getBannerColors(type) {
    switch (type) {
        case 'internship':
            return ['#1d4ed8', '#60a5fa'];
        case 'hackathon':
            return ['#be185d', '#f472b6'];
        case 'fest':
            return ['#0f766e', '#2dd4bf'];
        case 'exam':
            return ['#b45309', '#f59e0b'];
        default:
            return ['#4338ca', '#818cf8'];
    }
}

function createBannerDataUrl(event) {
    const [fromColor, toColor] = getBannerColors(event.type);
    const typeLabel = getTypeMeta(event.type).label;
    const title = escapeHtml(event.title).slice(0, 64);
    const organizer = escapeHtml(event.organizer).slice(0, 40);
    const subtitle = escapeHtml((event.skillsRequired || []).slice(0, 4).join(' • ') || 'Preparation roadmap included');

    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 420" role="img" aria-label="${title}">
            <defs>
                <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="${fromColor}" />
                    <stop offset="100%" stop-color="${toColor}" />
                </linearGradient>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#0f172a" flood-opacity="0.24" />
                </filter>
            </defs>
            <rect width="1400" height="420" rx="36" fill="url(#bg)" />
            <circle cx="1220" cy="86" r="112" fill="rgba(255,255,255,0.15)" />
            <circle cx="112" cy="330" r="90" fill="rgba(255,255,255,0.12)" />
            <circle cx="1160" cy="300" r="180" fill="rgba(255,255,255,0.08)" />
            <rect x="70" y="66" width="1260" height="288" rx="28" fill="rgba(255,255,255,0.11)" stroke="rgba(255,255,255,0.22)" filter="url(#shadow)" />
            <text x="122" y="146" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" letter-spacing="2">${typeLabel.toUpperCase()}</text>
            <text x="122" y="228" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="66" font-weight="800">${title}</text>
            <text x="122" y="286" fill="rgba(255,255,255,0.92)" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="600">${organizer}</text>
            <text x="122" y="332" fill="rgba(255,255,255,0.86)" font-family="Arial, Helvetica, sans-serif" font-size="22">${subtitle}</text>
            <rect x="1040" y="128" width="156" height="60" rx="30" fill="rgba(255,255,255,0.18)" />
            <text x="1118" y="166" fill="#ffffff" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700">InternTrack</text>
        </svg>`;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function buildRoundDetails(event) {
    if (Array.isArray(event.rounds) && event.rounds.length) {
        return event.rounds.map((round, index) => ({
            number: index + 1,
            title: round.title || `Round ${index + 1}`,
            ask: round.ask || round.description || round,
            skills: round.skills || event.skillsRequired || [],
            outcome: round.outcome || round.result || 'Shortlisted candidates move ahead.'
        }));
    }

    const sharedSkills = (event.skillsRequired || []).join(', ') || 'core preparation skills';

    if (event.type === 'internship') {
        return [
            {
                number: 1,
                title: 'Resume Screening',
                ask: `Recruiters check whether your profile matches ${event.organizer} and whether your projects prove strong fundamentals.`,
                skills: ['resume clarity', 'projects', 'branch relevance', 'CGPA'],
                outcome: 'Only candidates with clear fit move forward.'
            },
            {
                number: 2,
                title: 'Online Assessment',
                ask: 'Expect coding questions, aptitude, and a quick CS fundamentals check covering data structures, algorithms, and sometimes OS or DBMS.',
                skills: ['DSA', 'problem solving', 'aptitude', 'time management'],
                outcome: 'High scorers are invited to technical interviews.'
            },
            {
                number: 3,
                title: 'Technical Interview',
                ask: 'Interviewers usually dig into one or two coding problems plus your projects, design choices, and the trade-offs you made.',
                skills: ['coding', 'projects', 'system thinking', 'communication'],
                outcome: 'Strong technical depth is required to clear this round.'
            },
            {
                number: 4,
                title: 'HR / Hiring Discussion',
                ask: 'They ask why you want this role, how you work in teams, and whether your timeline and expectations match the company.',
                skills: ['confidence', 'clarity', 'teamwork', 'motivation'],
                outcome: 'Final shortlist and offer decisions are made here.'
            }
        ];
    }

    if (event.type === 'hackathon') {
        return [
            {
                number: 1,
                title: 'Idea Submission',
                ask: 'Teams submit the problem statement, why it matters, the target users, and a feasible solution plan.',
                skills: ['problem framing', 'product thinking', 'team planning'],
                outcome: 'Only practical and high-impact ideas are shortlisted.'
            },
            {
                number: 2,
                title: 'Technical Screening',
                ask: 'Judges check whether the solution is buildable, whether the stack is realistic, and whether the team can deliver in time.',
                skills: ['system design basics', 'stack selection', 'feasibility'],
                outcome: 'Selected teams are allowed into the build phase.'
            },
            {
                number: 3,
                title: 'Prototype Build',
                ask: 'Teams must produce a working prototype, live demo, or polished walkthrough with clear feature coverage.',
                skills: ['frontend', 'backend', 'debugging', 'deployment'],
                outcome: 'Working demos move to the final judging stage.'
            },
            {
                number: 4,
                title: 'Final Presentation',
                ask: 'Judges ask about innovation, impact, scalability, edge cases, and how your solution differs from existing tools.',
                skills: ['presentation', 'storytelling', 'demo skills', 'Q&A'],
                outcome: 'Winners are picked based on impact and execution.'
            }
        ];
    }

    if (event.type === 'fest') {
        return [
            {
                number: 1,
                title: 'Registration and Eligibility Check',
                ask: 'The organiser verifies team details, college ID, event category, and eligibility rules before allowing participation.',
                skills: ['registration accuracy', 'team coordination'],
                outcome: 'Valid entries are entered into the event bracket.'
            },
            {
                number: 2,
                title: 'Prelims / Shortlist',
                ask: 'Participants are usually tested on domain basics such as coding, robotics, quiz knowledge, or project relevance.',
                skills: ['subject fundamentals', 'speed', 'accuracy'],
                outcome: 'Top entries move to the live event.'
            },
            {
                number: 3,
                title: 'Final Event',
                ask: 'Finalists present, perform, or compete live depending on the event format and the theme of the fest.',
                skills: ['confidence', 'performance', 'technical execution'],
                outcome: 'Judges announce winners and special mentions.'
            }
        ];
    }

    return [
        {
            number: 1,
            title: 'Registration and Prerequisites',
            ask: 'Organisers check if you completed the required setup or basic prerequisites before the session starts.',
            skills: ['setup', 'basics', 'attention to detail'],
            outcome: 'Only prepared participants continue.'
        },
        {
            number: 2,
            title: 'Hands-on Exercise',
            ask: 'Expect practical questions and step-by-step tasks that test whether you can apply the concept live.',
            skills: sharedSkills,
            outcome: 'Hands-on understanding matters more than memorisation.'
        },
        {
            number: 3,
            title: 'Q&A / Assessment',
            ask: 'The instructor may ask you to explain the process, troubleshoot an issue, or show the output you built.',
            skills: ['communication', 'troubleshooting', 'concept clarity'],
            outcome: 'Successful participants receive certificates or further invites.'
        }
    ];
}

function buildRoadmapSteps(event) {
    const sharedSkills = (event.skillsRequired || []).slice(0, 5);

    if (event.type === 'internship') {
        return [
            {
                title: 'Refresh the core subjects',
                window: 'Week 1',
                focus: 'Revise DSA, OS, DBMS, and CN so you can move quickly in the OA and technical rounds.',
                skills: ['DSA', 'OS', 'DBMS', 'CN']
            },
            {
                title: 'Polish projects and resume',
                window: 'Week 2',
                focus: 'Rewrite project bullets with impact, stack, and results. Be ready to explain each project in one minute.',
                skills: ['resume writing', 'project explanation', 'impact writing']
            },
            {
                title: 'Practice timed interviews',
                window: 'Week 3',
                focus: 'Solve mock coding questions, rehearse system design basics, and prepare for behavioral questions.',
                skills: ['mock interviews', 'coding under pressure', 'communication']
            },
            {
                title: 'Apply early and track responses',
                window: 'Week 4',
                focus: 'Submit applications, keep a response sheet, and prepare a short note for each company you apply to.',
                skills: ['application tracking', 'follow-up', 'timing']
            }
        ];
    }

    if (event.type === 'hackathon') {
        return [
            {
                title: 'Understand the problem statement',
                window: 'Before registration closes',
                focus: 'Read the theme, shortlist a feasible problem, and decide how the solution will help real users.',
                skills: ['problem framing', 'idea selection']
            },
            {
                title: 'Choose a stack and divide roles',
                window: 'Planning day',
                focus: 'Keep the stack familiar, assign frontend, backend, design, and pitch responsibilities, and set milestones.',
                skills: ['team planning', 'stack choice', 'ownership']
            },
            {
                title: 'Build the minimum viable prototype',
                window: 'Build sprint',
                focus: 'Focus on a working demo, a clean UI, and one clear feature set rather than many unfinished ideas.',
                skills: ['MVP building', 'debugging', 'deployment']
            },
            {
                title: 'Prepare the demo and pitch',
                window: 'Final review',
                focus: 'Create a crisp presentation that explains the problem, the solution, the impact, and what comes next.',
                skills: ['storytelling', 'demo', 'presentation']
            }
        ];
    }

    if (event.type === 'fest') {
        return [
            {
                title: 'Register the team and verify rules',
                window: 'Before the fest',
                focus: 'Check category requirements, team size, venue details, and any qualification rules listed by the organisers.',
                skills: ['registration', 'event rules']
            },
            {
                title: 'Prepare for prelims or qualifiers',
                window: 'Practice week',
                focus: 'Revise the core topic, practice sample questions, and work on speed, accuracy, and coordination.',
                skills: sharedSkills.length ? sharedSkills : ['basics', 'accuracy']
            },
            {
                title: 'Rehearse the final event',
                window: 'Final round',
                focus: 'Dry-run the live presentation or competition flow so you can perform confidently under pressure.',
                skills: ['confidence', 'stage presence', 'timing']
            }
        ];
    }

    return [
        {
            title: 'Set up the environment',
            window: 'Day 1',
            focus: 'Install the required tools, read the schedule carefully, and confirm that your laptop or setup is ready.',
            skills: ['setup', 'tools']
        },
        {
            title: 'Work through the hands-on tasks',
            window: 'Day 2',
            focus: 'Practice the exact workflow the session will use so you can follow along without getting stuck.',
            skills: sharedSkills.length ? sharedSkills : ['practice', 'execution']
        },
        {
            title: 'Review notes and keep the outcome ready',
            window: 'Day 3',
            focus: 'Summarise the lesson, keep screenshots or notes, and be ready for any quiz, submission, or follow-up.',
            skills: ['revision', 'notes', 'follow-up']
        }
    ];
}

function buildRoadmapText(event, steps) {
    const header = `${event.title} - Preparation Roadmap`;
    const lines = [header, `Organizer: ${event.organizer}`, `Type: ${getTypeMeta(event.type).label}`, ''];

    steps.forEach((step, index) => {
        lines.push(`${index + 1}. ${step.title} (${step.window})`);
        lines.push(`   Focus: ${step.focus}`);
        lines.push(`   Skills: ${Array.isArray(step.skills) ? step.skills.join(', ') : step.skills}`);
    });

    return lines.join('\n');
}

function getSavedEvents() {
    try {
        return JSON.parse(localStorage.getItem('selectedEvents') || '[]');
    } catch {
        return [];
    }
}

function getEventStorageKey(event) {
    return String(event.id || event._id || event.title).toLowerCase();
}

function isEventSaved(event) {
    const key = getEventStorageKey(event);
    return getSavedEvents().some((item) => getEventStorageKey(item) === key);
}

function toggleEventSave(event) {
    const key = getEventStorageKey(event);
    const savedEvents = getSavedEvents();
    const existingIndex = savedEvents.findIndex((item) => getEventStorageKey(item) === key);

    if (existingIndex >= 0) {
        savedEvents.splice(existingIndex, 1);
    } else {
        savedEvents.push({
            id: event.id,
            title: event.title,
            organizer: event.organizer,
            type: event.type,
            start: event.startDate || event.deadline || '',
            deadline: event.deadline || '',
            registrationLink: event.registrationLink || ''
        });
    }

    localStorage.setItem('selectedEvents', JSON.stringify(savedEvents));
}

function renderEventCardList(items, className, useRoadmap = false) {
    return items.map((item) => `
        <div class="${className}">
            <h4>${escapeHtml(item.title || `Round ${item.number || ''}`)}</h4>
            ${item.window ? `<p class="card-kicker">${escapeHtml(item.window)}</p>` : ''}
            ${item.ask ? `<p><strong>What they ask:</strong> ${escapeHtml(item.ask)}</p>` : ''}
            ${item.focus ? `<p>${escapeHtml(item.focus)}</p>` : ''}
            ${item.skills ? `<div class="chips">${[].concat(item.skills).map((skill) => `<span class="chip">${escapeHtml(skill)}</span>`).join('')}</div>` : ''}
            ${item.outcome ? `<p class="card-outcome"><strong>Outcome:</strong> ${escapeHtml(item.outcome)}</p>` : ''}
            ${useRoadmap && item.step ? `<p class="card-outcome"><strong>Step:</strong> ${escapeHtml(item.step)}</p>` : ''}
        </div>
    `).join('');
}

function renderEventDetails(event) {
    currentEvent = normalizeEvent(event);
    currentRoadmap = buildRoadmapSteps(currentEvent);

    const bannerUrl = currentEvent.imageUrl || createBannerDataUrl(currentEvent);
    const typeMeta = getTypeMeta(currentEvent.type);
    const rounds = buildRoundDetails(currentEvent);
    const skills = [...new Set(currentEvent.skillsRequired || [])];
    const backLink = source === 'calendar' ? 'calendar.html' : 'dashboard.html';

    const backButton = document.querySelector('.back-button');
    if (backButton) {
        backButton.href = backLink;
        backButton.innerHTML = source === 'calendar'
            ? '<i class="fas fa-arrow-left"></i> Back to Calendar'
            : '<i class="fas fa-arrow-left"></i> Back to Dashboard';
    }

    const container = document.getElementById('eventDetailsContainer');
    const roadmapText = buildRoadmapText(currentEvent, currentRoadmap);
    const roundCount = rounds.length;
    const headline = currentEvent.description || `Detailed guidance for ${currentEvent.title}.`;
    const applyLabel = currentEvent.registrationLink && currentEvent.registrationLink !== '#'
        ? 'Open Official Page'
        : 'No Official Link Available';

    container.innerHTML = `
        <div class="event-details-card">
            <div class="detail-hero">
                <div class="detail-banner">
                    <img src="${escapeHtml(bannerUrl)}" alt="${escapeHtml(currentEvent.organizer)} banner" class="banner-image">
                </div>
                <div class="detail-hero-copy">
                    <div class="badges detail-badges">
                        <span class="badge ${typeMeta.badgeClass}">${typeMeta.label}</span>
                        <span class="badge badge-soft">${roundCount} rounds</span>
                    </div>
                    <h1 class="event-title">${escapeHtml(currentEvent.title)}</h1>
                    <p class="event-company">${escapeHtml(currentEvent.organizer)}</p>
                    <p class="hero-summary">${escapeHtml(headline)}</p>
                </div>
            </div>

            <div class="event-info-grid detail-grid">
                <div class="info-item">
                    <i class="fas fa-calendar-alt"></i>
                    <div class="info-content">
                        <h4>Date Range</h4>
                        <p>${escapeHtml(formatDateRange(currentEvent))}</p>
                    </div>
                </div>
                <div class="info-item">
                    <i class="fas fa-clock"></i>
                    <div class="info-content">
                        <h4>Deadline / Status</h4>
                        <p>${escapeHtml(currentEvent.deadline ? formatDate(currentEvent.deadline) : 'Check official page')}</p>
                    </div>
                </div>
                <div class="info-item">
                    <i class="fas fa-layer-group"></i>
                    <div class="info-content">
                        <h4>Selection Stages</h4>
                        <p>${roundCount} round${roundCount === 1 ? '' : 's'}</p>
                    </div>
                </div>
                <div class="info-item">
                    <i class="fas fa-bolt"></i>
                    <div class="info-content">
                        <h4>Prep Focus</h4>
                        <p>${escapeHtml((skills.slice(0, 3).join(' • ') || 'General preparation'))}</p>
                    </div>
                </div>
            </div>

            <div class="section">
                <h3 class="section-title"><i class="fas fa-info-circle"></i> About This ${escapeHtml(typeMeta.label)}</h3>
                <div class="description">
                    <p>${escapeHtml(headline)}</p>
                    <p><strong>How it works:</strong> This page is generated from the calendar event itself, so the rounds and roadmap below are matched to this event type and the skills listed on the card.</p>
                </div>
            </div>

            <div class="section">
                <h3 class="section-title"><i class="fas fa-list-check"></i> What Each Round Asks</h3>
                <div class="rounds-grid">
                    ${renderEventCardList(rounds, 'round-card')}
                </div>
            </div>

            <div class="section">
                <h3 class="section-title"><i class="fas fa-route"></i> Generated Roadmap</h3>
                <div class="roadmap-grid">
                    ${renderEventCardList(currentRoadmap.map((step, index) => ({ ...step, step: `Step ${index + 1}` })), 'roadmap-card', true)}
                </div>
            </div>

            <div class="section">
                <h3 class="section-title"><i class="fas fa-code"></i> Required Skills</h3>
                <div class="skills-list">
                    ${skills.map((skill) => `<span class="skill-tag">${escapeHtml(skill)}</span>`).join('')}
                </div>
            </div>

            <div class="section">
                <h3 class="section-title"><i class="fas fa-lightbulb"></i> Fast Prep Notes</h3>
                <div class="description">
                    <p><strong>Round count:</strong> ${roundCount}</p>
                    <p><strong>Best strategy:</strong> Focus on the first three skills above, then rehearse one real example per round so you can explain your thinking clearly.</p>
                    <p><strong>Roadmap copy:</strong> Use the button below to copy a clean prep plan for this event.</p>
                </div>
            </div>

            <div class="action-buttons">
                <button class="btn btn-primary" id="saveGoalsBtn" type="button">
                    <i class="fas ${isEventSaved(currentEvent) ? 'fa-check' : 'fa-plus'}"></i>
                    <span>${isEventSaved(currentEvent) ? 'Saved to Goals' : 'Add to Goals'}</span>
                </button>
                <a href="${escapeHtml(currentEvent.registrationLink || '#')}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary ${currentEvent.registrationLink && currentEvent.registrationLink !== '#' ? '' : 'btn-disabled'}" id="officialLinkBtn">
                    <i class="fas fa-external-link-alt"></i>
                    <span>${applyLabel}</span>
                </a>
                <button class="btn btn-secondary" id="copyRoadmapBtn" type="button">
                    <i class="fas fa-copy"></i>
                    <span>Copy Roadmap</span>
                </button>
            </div>
        </div>
    `;

    const saveGoalsBtn = document.getElementById('saveGoalsBtn');
    saveGoalsBtn.addEventListener('click', () => {
        toggleEventSave(currentEvent);
        const saved = isEventSaved(currentEvent);
        saveGoalsBtn.innerHTML = `<i class="fas ${saved ? 'fa-check' : 'fa-plus'}"></i><span>${saved ? 'Saved to Goals' : 'Add to Goals'}</span>`;
    });

    const copyRoadmapBtn = document.getElementById('copyRoadmapBtn');
    copyRoadmapBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(roadmapText);
            copyRoadmapBtn.innerHTML = '<i class="fas fa-check"></i><span>Roadmap Copied</span>';
            setTimeout(() => {
                copyRoadmapBtn.innerHTML = '<i class="fas fa-copy"></i><span>Copy Roadmap</span>';
            }, 1500);
        } catch {
            alert('Copy failed. Please try again.');
        }
    });
}

function showError(message) {
    const container = document.getElementById('eventDetailsContainer');
    container.innerHTML = `
        <div class="error">
            <i class="fas fa-exclamation-circle"></i>
            <h2>Error</h2>
            <p>${escapeHtml(message)}</p>
        </div>
    `;
}

async function fetchBackendEventDetails() {
    try {
        const response = await fetch(`${API_URL}/events`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }

        const result = await response.json();
        const events = result.data || result;
        const event = events.find((item) => String(item._id) === String(eventId));

        if (!event) {
            showError('Event not found');
            return;
        }

        renderEventDetails(normalizeEvent(event));
    } catch (error) {
        console.error('Error fetching event details:', error);
        showError('Failed to load event details. Please try again.');
    }
}

function loadEventDetails() {
    cleanupCachedEvents();

    const payloadEvent = readPayloadEvent();
    if (payloadEvent) {
        renderEventDetails(payloadEvent);
        return;
    }

    const cachedEvent = readCachedCalendarEvent();
    if (cachedEvent) {
        renderEventDetails(cachedEvent);
        return;
    }

    if (eventId) {
        fetchBackendEventDetails();
        return;
    }

    if (fallbackTitle) {
        showError('This event view needs the calendar payload to open correctly. Please reopen it from the calendar.');
        return;
    }

    showError('No event specified');
}

document.addEventListener('DOMContentLoaded', () => {
    loadEventDetails();
});