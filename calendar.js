const token = localStorage.getItem('token') || sessionStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

if (!token) {
    window.location.href = 'index.html';
}

const eventData = [
    {
        id: 1, title: 'Google SWE Internship', type: 'internship',
        startDate: '2025-05-01', endDate: '2025-07-31',
        deadline: '2024-10-15', organizer: 'Google',
        description: 'Software Engineering internship at Google. Work on real products used by billions. Competitive stipend, mentorship, and return offer opportunities for top performers.',
        skillsRequired: ['DSA', 'System Design', 'Problem Solving', 'Java or C++ or Python'],
        registrationLink: 'https://careers.google.com/students/',
        time: 'Full Day'
    },
    {
        id: 2, title: 'Microsoft SWE Internship', type: 'internship',
        startDate: '2025-05-01', endDate: '2025-07-31',
        deadline: '2024-10-01', organizer: 'Microsoft',
        description: '12-week internship at Microsoft working on Azure, Office, or Xbox teams. Strong return offer rate. Includes housing stipend and relocation support.',
        skillsRequired: ['DSA', 'OOP', 'System Design', 'C# or Java or Python'],
        registrationLink: 'https://careers.microsoft.com/students/',
        time: 'Full Day'
    },
    {
        id: 3, title: 'Amazon SDE Internship', type: 'internship',
        startDate: '2025-05-15', endDate: '2025-07-31',
        deadline: '2024-09-15', organizer: 'Amazon',
        description: 'SDE internship at Amazon working on large scale distributed systems. Leadership principles are heavily evaluated. Project-based with a final presentation to senior engineers.',
        skillsRequired: ['DSA', 'System Design', 'Leadership Principles', 'Java or Python'],
        registrationLink: 'https://www.amazon.jobs/en/teams/internships/',
        time: 'Full Day'
    },
    {
        id: 4, title: 'Goldman Sachs Engineering Internship', type: 'internship',
        startDate: '2025-06-01', endDate: '2025-07-31',
        deadline: '2024-08-15', organizer: 'Goldman Sachs',
        description: '10-week engineering program at Goldman Sachs. Work on trading platforms, risk systems, or data engineering. High stipend and strong full-time conversion rate.',
        skillsRequired: ['DSA', 'Java', 'Python', 'SQL', 'Financial Basics'],
        registrationLink: 'https://www.goldmansachs.com/careers/students/',
        time: 'Full Day'
    },
    {
        id: 5, title: 'JPMorgan Chase Tech Internship', type: 'internship',
        startDate: '2025-06-01', endDate: '2025-07-31',
        deadline: '2024-08-01', organizer: 'JPMorgan Chase',
        description: 'Software engineering internship in the Corporate and Investment Banking tech division. Work on fintech products with global impact.',
        skillsRequired: ['DSA', 'Java', 'Spring Boot', 'SQL'],
        registrationLink: 'https://careers.jpmorgan.com/global/en/students/',
        time: 'Full Day'
    },
    {
        id: 6, title: 'Adobe Research Internship', type: 'internship',
        startDate: '2025-05-01', endDate: '2025-07-31',
        deadline: '2024-10-01', organizer: 'Adobe',
        description: 'Work on cutting edge AI and creative tools at Adobe Research. Projects involve computer vision, NLP, and generative AI for creative applications.',
        skillsRequired: ['Machine Learning', 'Python', 'Deep Learning', 'Computer Vision'],
        registrationLink: 'https://adobe.com/careers/university/',
        time: 'Full Day'
    },
    {
        id: 7, title: 'Flipkart SDE Internship', type: 'internship',
        startDate: '2025-05-01', endDate: '2025-06-30',
        deadline: '2025-01-15', organizer: 'Flipkart',
        description: 'Software engineering internship at India\'s largest e-commerce company. Work on supply chain, payments, or platform teams. Strong PPO culture.',
        skillsRequired: ['DSA', 'Java', 'System Design', 'SQL'],
        registrationLink: 'https://www.flipkartcareers.com/',
        time: 'Full Day'
    },
    {
        id: 8, title: 'Walmart Global Tech Internship', type: 'internship',
        startDate: '2025-06-01', endDate: '2025-07-31',
        deadline: '2025-02-01', organizer: 'Walmart',
        description: 'Tech internship at Walmart Global Tech India in Bengaluru. Work on retail tech, data platforms, or mobile applications serving millions of customers.',
        skillsRequired: ['DSA', 'Java or Python', 'SQL', 'Cloud'],
        registrationLink: 'https://careers.walmart.com/students/',
        time: 'Full Day'
    },
    {
        id: 9, title: 'Cisco Software Internship', type: 'internship',
        startDate: '2025-05-01', endDate: '2025-07-31',
        deadline: '2024-10-15', organizer: 'Cisco',
        description: 'Networking and software engineering internship at Cisco. Projects in network automation, cybersecurity, cloud infrastructure, and IoT.',
        skillsRequired: ['Networking', 'Python', 'Linux', 'Cloud'],
        registrationLink: 'https://jobs.cisco.com/jobs/StudentPrograms/',
        time: 'Full Day'
    },
    {
        id: 10, title: 'IBM India Internship', type: 'internship',
        startDate: '2025-06-01', endDate: '2025-07-31',
        deadline: '2025-02-01', organizer: 'IBM',
        description: 'Technology internship at IBM India. Projects span AI, cloud computing, blockchain, and enterprise software. IBM provides strong mentorship and certification.',
        skillsRequired: ['Python', 'Cloud', 'AI Basics', 'Java'],
        registrationLink: 'https://www.ibm.com/careers/in-en/students/',
        time: 'Full Day'
    },
    {
        id: 11, title: 'Zoho Developer Internship', type: 'internship',
        startDate: '2025-05-01', endDate: '2025-06-30',
        deadline: '2025-02-01', organizer: 'Zoho',
        description: 'Hands-on development internship at Zoho. Work on Zoho\'s SaaS product suite. Known for strong technical culture and high PPO conversion rate in India.',
        skillsRequired: ['Java', 'JavaScript', 'SQL', 'OOP'],
        registrationLink: 'https://careers.zohocorp.com/',
        time: 'Full Day'
    },
    {
        id: 12, title: 'Razorpay SDE Internship', type: 'internship',
        startDate: '2025-06-01', endDate: '2025-07-31',
        deadline: '2025-02-15', organizer: 'Razorpay',
        description: 'Internship at India\'s leading fintech startup. Work on payment gateway, banking infrastructure, or developer tools. Fast-paced startup culture.',
        skillsRequired: ['DSA', 'Go or Java', 'System Design', 'SQL'],
        registrationLink: 'https://razorpay.com/jobs/',
        time: 'Full Day'
    },
    {
        id: 13, title: 'Swiggy SDE Internship', type: 'internship',
        startDate: '2025-06-01', endDate: '2025-07-31',
        deadline: '2025-03-01', organizer: 'Swiggy',
        description: 'Software engineering internship at Swiggy. Work on logistics optimization, real-time tracking, or consumer app features serving 10M+ daily orders.',
        skillsRequired: ['DSA', 'Java or Python', 'System Design'],
        registrationLink: 'https://careers.swiggy.com/',
        time: 'Full Day'
    },
    {
        id: 14, title: 'PhonePe Tech Internship', type: 'internship',
        startDate: '2025-05-01', endDate: '2025-06-30',
        deadline: '2025-02-01', organizer: 'PhonePe',
        description: 'Internship at PhonePe working on UPI payments, financial services, or platform engineering. One of India\'s fastest growing fintech companies.',
        skillsRequired: ['DSA', 'Java', 'Microservices', 'SQL'],
        registrationLink: 'https://phonepe.com/en/careers.html',
        time: 'Full Day'
    },
    {
        id: 101, title: 'Smart India Hackathon 2025', type: 'hackathon',
        startDate: '2025-12-01', endDate: '2025-12-31',
        deadline: '2025-10-31', organizer: 'Ministry of Education',
        description: 'India\'s largest national hackathon organized by the Government of India. Teams of 6 solve real problems from government ministries. Grand prize includes cash awards and implementation opportunities.',
        skillsRequired: ['Problem Solving', 'Web Dev or App Dev', 'AI/ML', 'Presentation Skills', 'Teamwork'],
        registrationLink: 'https://sih.gov.in',
        time: 'Full Day'
    },
    {
        id: 102, title: 'Goldman Sachs Hackathon 2025', type: 'hackathon',
        startDate: '2025-05-01', endDate: '2025-05-31',
        deadline: '2025-04-15', organizer: 'Goldman Sachs',
        description: 'Competitive hackathon for engineering students focusing on fintech innovation. Winners receive fast-track internship interviews at Goldman Sachs.',
        skillsRequired: ['DSA', 'Python or Java', 'Finance Basics', 'Problem Solving'],
        registrationLink: 'https://www.goldmansachs.com/careers/',
        time: 'Full Day'
    },
    {
        id: 103, title: 'Hack the Future - IIT Gandhinagar', type: 'hackathon',
        startDate: '2025-03-15', endDate: '2025-03-16',
        deadline: '2025-03-05', organizer: 'IIT Gandhinagar',
        description: '36-hour hackathon at IIT Gandhinagar. Problem statements span healthcare, education, and sustainability. Open to all engineering students.',
        skillsRequired: ['Web Dev', 'App Dev', 'AI/ML', 'IoT'],
        registrationLink: 'https://iitgn.ac.in/',
        time: 'Full Day'
    },
    {
        id: 104, title: 'PSB FinTech Hackathon', type: 'hackathon',
        startDate: '2025-05-20', endDate: '2025-06-10',
        deadline: '2025-05-10', organizer: 'IIT Hyderabad',
        description: 'FinTech focused hackathon in association with public sector banks. Build solutions for financial inclusion, digital banking, and fraud detection.',
        skillsRequired: ['Python', 'ML', 'Finance', 'Web Dev'],
        registrationLink: 'https://iith.ac.in/',
        time: 'Full Day'
    },
    {
        id: 105, title: 'TCS HackQuest 2025', type: 'hackathon',
        startDate: '2025-09-01', endDate: '2025-09-30',
        deadline: '2025-08-20', organizer: 'TCS',
        description: 'National level coding and innovation challenge by Tata Consultancy Services. Multiple rounds including online coding, ideathon, and final hackathon.',
        skillsRequired: ['DSA', 'Coding', 'Problem Solving', 'Innovation'],
        registrationLink: 'https://www.tcs.com/careers/tcs-hackquest',
        time: 'Full Day'
    },
    {
        id: 106, title: 'Sparkathon 2025', type: 'hackathon',
        startDate: '2025-07-01', endDate: '2025-07-31',
        deadline: '2025-06-20', organizer: 'Walmart',
        description: 'Retail tech hackathon by Walmart. Build solutions for supply chain, customer experience, or sustainability in retail. Winners get fast-track Walmart interviews.',
        skillsRequired: ['Web Dev', 'Data Science', 'AI', 'Cloud'],
        registrationLink: 'https://sparkathon.walmart.com/',
        time: 'Full Day'
    },
    {
        id: 107, title: 'InnovateX Hackathon', type: 'hackathon',
        startDate: '2025-09-15', endDate: '2025-09-16',
        deadline: '2025-08-31', organizer: 'InnovateX',
        description: '48-hour innovation hackathon with problem statements in smart cities, healthcare, and education. Cash prizes and startup incubation opportunities.',
        skillsRequired: ['Web Dev', 'App Dev', 'AI/ML', 'IoT', 'Design Thinking'],
        registrationLink: 'https://innovatex.in/',
        time: 'Full Day'
    },
    {
        id: 108, title: 'Viksit Bharat Buildathon', type: 'hackathon',
        startDate: '2025-09-20', endDate: '2025-09-21',
        deadline: '2025-09-10', organizer: 'Govt of India',
        description: 'Government-backed buildathon for students to build solutions aligned with India\'s 2047 vision. Categories include agriculture, healthcare, education, and infrastructure.',
        skillsRequired: ['Problem Solving', 'Web Dev', 'AI', 'Social Impact Thinking'],
        registrationLink: 'https://viksitvbharat.gov.in/',
        time: 'Full Day'
    },
    {
        id: 201, title: 'Techfest IIT Bombay 2025', type: 'fest',
        startDate: '2025-12-22', endDate: '2025-12-24',
        deadline: '2025-12-01', organizer: 'IIT Bombay',
        description: 'Asia\'s largest science and technology festival. Competitions in robotics, AI, coding, and design. Workshops by industry leaders and international participants from 50+ countries.',
        skillsRequired: ['Robotics', 'AI', 'Coding', 'Design', 'Problem Solving'],
        registrationLink: 'https://techfest.org/',
        time: 'Full Day'
    },
    {
        id: 202, title: 'Shaastra IIT Madras 2025', type: 'fest',
        startDate: '2025-01-03', endDate: '2025-01-07',
        deadline: '2024-12-20', organizer: 'IIT Madras',
        description: 'Annual tech fest of IIT Madras with 100+ events across robotics, coding, science, and business. ISO-certified student-run festival with international participation.',
        skillsRequired: ['Coding', 'Robotics', 'Science', 'Quizzing'],
        registrationLink: 'https://shaastra.org/',
        time: 'Full Day'
    },
    {
        id: 203, title: 'Kshitij IIT Kharagpur 2025', type: 'fest',
        startDate: '2025-01-17', endDate: '2025-01-19',
        deadline: '2025-01-10', organizer: 'IIT Kharagpur',
        description: 'One of Asia\'s largest techno-management fests. Events in AI, web development, business, and entrepreneurship. Strong industry tie-ups and guest lectures.',
        skillsRequired: ['Tech Skills', 'Management', 'Innovation', 'Business Acumen'],
        registrationLink: 'https://ktj.in/',
        time: 'Full Day'
    },
    {
        id: 204, title: 'Cognizance IIT Roorkee 2025', type: 'fest',
        startDate: '2025-03-21', endDate: '2025-03-23',
        deadline: '2025-03-10', organizer: 'IIT Roorkee',
        description: 'IIT Roorkee\'s annual tech fest featuring competitive programming, hardware events, and workshops. Great networking opportunity with IIT alumni.',
        skillsRequired: ['Competitive Programming', 'Hardware', 'Electronics', 'Coding'],
        registrationLink: 'https://cognizance.org.in/',
        time: 'Full Day'
    },
    {
        id: 205, title: 'Techkriti IIT Kanpur 2025', type: 'fest',
        startDate: '2025-03-27', endDate: '2025-03-30',
        deadline: '2025-03-15', organizer: 'IIT Kanpur',
        description: 'North India\'s largest annual technical and entrepreneurship fest. Competitions include coding marathons, robotics, data science, and startup pitches.',
        skillsRequired: ['Coding', 'Robotics', 'Data Science', 'Entrepreneurship'],
        registrationLink: 'https://techkriti.org/',
        time: 'Full Day'
    },
    {
        id: 206, title: 'Pragyan NIT Trichy 2025', type: 'fest',
        startDate: '2025-02-14', endDate: '2025-02-16',
        deadline: '2025-02-05', organizer: 'NIT Trichy',
        description: 'South India\'s largest tech management fest. ISO 20121 certified event with strong industry presence. Competitions in coding, robotics, and design.',
        skillsRequired: ['Coding', 'Design', 'Robotics', 'Management'],
        registrationLink: 'https://pragyan.org/',
        time: 'Full Day'
    },
    {
        id: 207, title: 'Tathva NIT Calicut 2025', type: 'fest',
        startDate: '2025-09-20', endDate: '2025-09-22',
        deadline: '2025-09-10', organizer: 'NIT Calicut',
        description: 'Premier tech fest of NIT Calicut. Known for strong technical competitions in AI, web dev, and robotics. Industry workshops and paper presentations.',
        skillsRequired: ['AI', 'Web Dev', 'Robotics', 'Research'],
        registrationLink: 'https://tathva.org/',
        time: 'Full Day'
    },
    {
        id: 208, title: 'MindSpark COEP 2025', type: 'fest',
        startDate: '2025-09-26', endDate: '2025-09-28',
        deadline: '2025-09-15', organizer: 'COEP Pune',
        description: 'Annual tech fest of College of Engineering Pune. Competitions in competitive programming, hardware hacking, and digital design. Strong local industry participation.',
        skillsRequired: ['Programming', 'Hardware', 'Digital Design'],
        registrationLink: 'https://mindspark.in/',
        time: 'Full Day'
    }
];

const typeMeta = {
    internship: { emoji: '💼', className: 'event-internship', badgeClass: 'badge-internship', label: 'Internship' },
    hackathon: { emoji: '🏆', className: 'event-hackathon', badgeClass: 'badge-hackathon', label: 'Hackathon' },
    fest: { emoji: '🎓', className: 'event-fest', badgeClass: 'badge-fest', label: 'College Fest' },
    workshop: { emoji: '💻', className: 'event-workshop', badgeClass: 'badge-workshop', label: 'Workshop' },
    exam: { emoji: '📝', className: 'event-exam', badgeClass: 'badge-exam', label: 'Exam' }
};

let calendar;
let searchText = '';
let miniMonthDate = new Date();
let selectedMiniDate = null;
const activeTypes = new Set(['internship', 'hackathon', 'fest', 'workshop', 'exam']);
const EVENT_REGISTRY_KEY = 'interntrack-calendar-event-registry';

function saveEventRegistry() {
    localStorage.setItem(EVENT_REGISTRY_KEY, JSON.stringify(eventData));
}

function parseDate(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day, 9, 0, 0, 0);
}

function formatDateReadable(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysUntil(dateStr) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(dateStr + 'T00:00:00');
    target.setHours(0, 0, 0, 0);
    return Math.floor((target - now) / (1000 * 60 * 60 * 24));
}

function matchesSearch(event) {
    if (!searchText) return true;
    const blob = [
        event.title,
        event.organizer,
        ...(event.skillsRequired || [])
    ].join(' ').toLowerCase();
    return blob.includes(searchText);
}

function getFilteredEvents() {
    return eventData.filter((event) => activeTypes.has(event.type) && matchesSearch(event));
}

function toCalendarEvents(events) {
    return events.map((event) => {
        const start = parseDate(event.deadline);
        const end = new Date(start);
        end.setHours(start.getHours() + 1);
        return {
            id: String(event.id),
            title: event.title,
            start,
            end,
            allDay: false,
            classNames: [typeMeta[event.type]?.className || 'event-workshop'],
            extendedProps: { ...event }
        };
    });
}

function renderCalendarEvents() {
    const filtered = getFilteredEvents();
    calendar.removeAllEvents();
    calendar.addEventSource(toCalendarEvents(filtered));
    document.getElementById('noResults').style.display = filtered.length ? 'none' : 'flex';
    renderMiniCalendar();
    renderUpcomingList(filtered);
}

function getCalendarTitle() {
    const view = calendar.view;
    if (view.type === 'dayGridMonth') {
        return view.currentStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    if (view.type === 'timeGridDay') {
        return view.currentStart.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
    const end = new Date(view.currentEnd);
    end.setDate(end.getDate() - 1);
    return `${view.currentStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

function updateToolbarState() {
    document.getElementById('calendarTitle').textContent = getCalendarTitle();
    const type = calendar.view.type;
    document.getElementById('viewMonth').classList.toggle('active', type === 'dayGridMonth');
    document.getElementById('viewWeek').classList.toggle('active', type === 'timeGridWeek');
    document.getElementById('viewDay').classList.toggle('active', type === 'timeGridDay');
}

function buildEventDetailsUrl(eventObj) {
    const cacheKey = `interntrack-event-detail-${eventObj.id}-${Date.now()}`;
    localStorage.setItem(cacheKey, JSON.stringify({
        createdAt: Date.now(),
        event: eventObj
    }));
    return new URL(`event-details.html?source=calendar&id=${encodeURIComponent(eventObj.id)}&key=${encodeURIComponent(cacheKey)}`, window.location.href).href;
}

function openEventDetailsPage(eventObj) {
    const detailsUrl = buildEventDetailsUrl(eventObj);
    window.open(detailsUrl, '_blank', 'noopener,noreferrer');
}

function openEventModal(eventObj) {
    const meta = typeMeta[eventObj.type] || typeMeta.workshop;
    const modalOverlay = document.getElementById('eventModalOverlay');
    const modal = document.getElementById('eventModal');

    document.getElementById('modalTitle').textContent = eventObj.title;

    const badge = document.getElementById('modalTypeBadge');
    badge.textContent = meta.label;
    badge.className = `type-badge ${meta.badgeClass}`;

    document.getElementById('modalOrganizer').textContent = eventObj.organizer;
    document.getElementById('modalDateRange').textContent = `${formatDateReadable(eventObj.startDate)} to ${formatDateReadable(eventObj.endDate)} | ${eventObj.time}`;

    const deadlineEl = document.getElementById('modalDeadline');
    const deadlineDelta = daysUntil(eventObj.deadline);
    deadlineEl.textContent = formatDateReadable(eventObj.deadline);
    deadlineEl.className = deadlineDelta < 30 ? 'deadline-soon' : '';

    document.getElementById('modalDescription').textContent = eventObj.description;

    const skillsWrap = document.getElementById('modalSkills');
    skillsWrap.innerHTML = (eventObj.skillsRequired || []).map((skill) => `<span class="skill-chip">${skill}</span>`).join('');

    const registerBtn = document.getElementById('modalRegisterBtn');
    registerBtn.href = eventObj.registrationLink;

    const detailsBtn = document.getElementById('modalDetailsBtn');
    detailsBtn.href = buildEventDetailsUrl(eventObj);
    detailsBtn.target = '_blank';
    detailsBtn.rel = 'noopener noreferrer';

    modalOverlay.classList.add('show');
    modal.focus();
}

function closeEventModal() {
    document.getElementById('eventModalOverlay').classList.remove('show');
}

function setupFilters() {
    const allBox = document.getElementById('filter-all');
    const typeBoxes = {
        internship: document.getElementById('filter-internship'),
        hackathon: document.getElementById('filter-hackathon'),
        fest: document.getElementById('filter-fest'),
        workshop: document.getElementById('filter-workshop'),
        exam: document.getElementById('filter-exam')
    };

    allBox.addEventListener('change', () => {
        const checked = allBox.checked;
        Object.keys(typeBoxes).forEach((key) => {
            typeBoxes[key].checked = checked;
            if (checked) activeTypes.add(key);
            else activeTypes.delete(key);
        });
        renderCalendarEvents();
    });

    Object.entries(typeBoxes).forEach(([type, box]) => {
        box.addEventListener('change', () => {
            if (box.checked) activeTypes.add(type);
            else activeTypes.delete(type);

            const allSelected = Object.values(typeBoxes).every((cb) => cb.checked);
            allBox.checked = allSelected;
            renderCalendarEvents();
        });
    });

    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        searchText = String(e.target.value || '').trim().toLowerCase();
        renderCalendarEvents();
    });
}

function renderUpcomingList(events) {
    const wrap = document.getElementById('upcomingList');
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const upcoming = [...events]
        .map((ev) => ({ ...ev, deadlineDate: new Date(ev.deadline + 'T00:00:00') }))
        .filter((ev) => ev.deadlineDate >= now)
        .sort((a, b) => a.deadlineDate - b.deadlineDate)
        .slice(0, 5);

    if (!upcoming.length) {
        wrap.innerHTML = '<div class="upcoming-date">No upcoming events for selected filters</div>';
        return;
    }

    wrap.innerHTML = upcoming.map((ev) => {
        const meta = typeMeta[ev.type] || typeMeta.workshop;
        const dotColor = ev.type === 'internship' ? '#60A5FA'
            : ev.type === 'hackathon' ? '#A78BFA'
            : ev.type === 'fest' ? '#4ADE80'
            : ev.type === 'workshop' ? '#FB923C'
            : '#FCD34D';

        return `
            <div class="upcoming-item">
                <div class="upcoming-title"><span class="upcoming-dot" style="background:${dotColor}"></span>${meta.emoji} ${ev.title}</div>
                <div class="upcoming-date">Deadline: ${formatDateReadable(ev.deadline)}</div>
            </div>
        `;
    }).join('');
}

function renderMiniCalendar() {
    const monthStart = new Date(miniMonthDate.getFullYear(), miniMonthDate.getMonth(), 1);
    const monthEnd = new Date(miniMonthDate.getFullYear(), miniMonthDate.getMonth() + 1, 0);
    const firstDayIndex = monthStart.getDay();
    const daysInMonth = monthEnd.getDate();
    const prevMonthDays = new Date(miniMonthDate.getFullYear(), miniMonthDate.getMonth(), 0).getDate();

    document.getElementById('miniMonthTitle').textContent = monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const filtered = getFilteredEvents();
    const eventDateMap = new Map();
    filtered.forEach((ev) => {
        const key = ev.deadline;
        if (!eventDateMap.has(key)) eventDateMap.set(key, []);
        eventDateMap.get(key).push(ev);
    });

    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const cells = [];
    dayNames.forEach((d) => cells.push(`<div class="mini-day-name">${d}</div>`));

    for (let i = firstDayIndex - 1; i >= 0; i -= 1) {
        const date = prevMonthDays - i;
        cells.push(`<div class="mini-day other-month">${date}</div>`);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day += 1) {
        const dt = new Date(miniMonthDate.getFullYear(), miniMonthDate.getMonth(), day);
        const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = dt.getTime() === today.getTime();
        const isSelected = selectedMiniDate && dt.getTime() === selectedMiniDate.getTime();

        let classNames = 'mini-day';
        if (isToday) classNames += ' today';
        if (isSelected) classNames += ' selected';

        const hasEvents = eventDateMap.has(key);
        cells.push(`<button class="${classNames}" data-date="${key}" type="button">${day}${hasEvents ? '<span class="mini-dot"></span>' : ''}</button>`);
    }

    const totalCells = dayNames.length + firstDayIndex + daysInMonth;
    const trailing = (7 - (totalCells % 7)) % 7;
    for (let t = 1; t <= trailing; t += 1) {
        cells.push(`<div class="mini-day other-month">${t}</div>`);
    }

    const miniGrid = document.getElementById('miniGrid');
    miniGrid.innerHTML = cells.join('');

    miniGrid.querySelectorAll('button[data-date]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const value = btn.getAttribute('data-date');
            const clicked = new Date(value + 'T00:00:00');
            selectedMiniDate = new Date(clicked);
            calendar.gotoDate(clicked);
            calendar.changeView('timeGridWeek');
            updateToolbarState();
            renderMiniCalendar();
        });
    });
}

function initializeCalendar() {
    const calendarEl = document.getElementById('mainCalendar');

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        firstDay: 0,
        allDaySlot: false,
        slotMinTime: '08:00:00',
        slotMaxTime: '22:00:00',
        slotDuration: '01:00:00',
        nowIndicator: true,
        headerToolbar: false,
        dayMaxEventRows: 3,
        height: '100%',
        contentHeight: 'auto',
        dayHeaderContent(arg) {
            const day = arg.date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
            const num = arg.date.getDate();
            return { html: `${day}<span>${num}</span>` };
        },
        dayCellClassNames(arg) {
            const now = new Date();
            const d = new Date(arg.date);
            if (d.toDateString() === now.toDateString()) return ['is-today-column'];
            return [];
        },
        eventContent(arg) {
            const ev = arg.event.extendedProps;
            const meta = typeMeta[ev.type] || typeMeta.workshop;
            const title = ev.title.length > 30 ? `${ev.title.slice(0, 30)}...` : ev.title;
            return {
                html: `
                    <div class="event-card-inner">
                        <div class="event-line-1">${meta.emoji} ${meta.label}</div>
                        <div class="event-line-2">${title}</div>
                    </div>
                `
            };
        },
        eventDidMount(info) {
            const ev = info.event.extendedProps;
            const aria = `${ev.title} - ${ev.type} - deadline ${formatDateReadable(ev.deadline)}`;
            info.el.setAttribute('aria-label', aria);
        },
        eventClick(info) {
            info.jsEvent.preventDefault();
            openEventDetailsPage(info.event.extendedProps);
        },
        dateClick(info) {
            if (calendar.view.type === 'dayGridMonth') {
                calendar.changeView('timeGridWeek', info.dateStr);
                updateToolbarState();
            }
        },
        datesSet() {
            updateToolbarState();
            const d = calendar.getDate();
            miniMonthDate = new Date(d.getFullYear(), d.getMonth(), 1);
            selectedMiniDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            renderMiniCalendar();
        }
    });

    calendar.render();
    renderCalendarEvents();
    updateToolbarState();
}

function setupCalendarControls() {
    document.getElementById('viewMonth').addEventListener('click', () => {
        calendar.changeView('dayGridMonth');
        updateToolbarState();
    });

    document.getElementById('viewWeek').addEventListener('click', () => {
        calendar.changeView('timeGridWeek');
        updateToolbarState();
    });

    document.getElementById('viewDay').addEventListener('click', () => {
        calendar.changeView('timeGridDay');
        updateToolbarState();
    });

    document.getElementById('prevBtn').addEventListener('click', () => {
        calendar.prev();
        updateToolbarState();
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
        calendar.next();
        updateToolbarState();
    });

    document.getElementById('todayBtn').addEventListener('click', () => {
        calendar.today();
        updateToolbarState();
    });

    document.getElementById('miniPrev').addEventListener('click', () => {
        miniMonthDate = new Date(miniMonthDate.getFullYear(), miniMonthDate.getMonth() - 1, 1);
        renderMiniCalendar();
    });

    document.getElementById('miniNext').addEventListener('click', () => {
        miniMonthDate = new Date(miniMonthDate.getFullYear(), miniMonthDate.getMonth() + 1, 1);
        renderMiniCalendar();
    });
}

function setupModalInteractions() {
    const overlay = document.getElementById('eventModalOverlay');
    const closeBtn = document.getElementById('modalCloseBtn');

    closeBtn.addEventListener('click', closeEventModal);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeEventModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeEventModal();
        }
    });
}

function setupUserUi() {
    const userName = user.name || 'User';
    const userEmail = user.email || 'user@example.com';

    const userAvatarTop = document.getElementById('userAvatarTop');
    if (userAvatarTop) userAvatarTop.textContent = userName.charAt(0).toUpperCase();

    const userNameTop = document.getElementById('userNameTop');
    if (userNameTop) userNameTop.textContent = userName;

    const dropdownUserName = document.getElementById('dropdownUserName');
    if (dropdownUserName) dropdownUserName.textContent = userName;

    const dropdownUserEmail = document.getElementById('dropdownUserEmail');
    if (dropdownUserEmail) dropdownUserEmail.textContent = userEmail;

    const userProfileBtn = document.getElementById('userProfileBtn');
    const userDropdown = document.getElementById('userDropdown');

    userProfileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userProfileBtn.classList.toggle('active');
        userDropdown.classList.toggle('active');
    });

    document.addEventListener('click', () => {
        userProfileBtn.classList.remove('active');
        userDropdown.classList.remove('active');
    });

    userDropdown.addEventListener('click', (e) => e.stopPropagation());

    const doLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        window.location.href = 'index.html';
    };

    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) doLogout();
    });

    const logoutSidebarBtn = document.getElementById('logoutSidebarBtn');
    logoutSidebarBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) doLogout();
    });

    const settingsBtn = document.getElementById('settingsBtn');
    settingsBtn.addEventListener('click', () => {
        localStorage.setItem('activeSection', 'settings');
        window.location.href = 'dashboard.html';
    });

    const helpBtn = document.getElementById('helpBtn');
    helpBtn.addEventListener('click', () => {
        alert('Help page is not available yet in this workspace.');
    });
}

function setupMobileSidebar() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('mainSidebar');
    const backdrop = document.getElementById('mobileSidebarBackdrop');

    const closeMenu = () => {
        mobileMenuToggle.classList.remove('active');
        sidebar.classList.remove('active');
        backdrop.classList.remove('active');
    };

    mobileMenuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = !sidebar.classList.contains('active');
        mobileMenuToggle.classList.toggle('active', open);
        sidebar.classList.toggle('active', open);
        backdrop.classList.toggle('active', open);
    });

    backdrop.addEventListener('click', closeMenu);

    document.addEventListener('click', (e) => {
        if (window.innerWidth > 768) return;
        if (!e.target.closest('.sidebar') && !e.target.closest('.mobile-menu-toggle')) {
            closeMenu();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) closeMenu();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    saveEventRegistry();
    setupUserUi();
    setupMobileSidebar();
    setupFilters();
    initializeCalendar();
    setupCalendarControls();
    setupModalInteractions();
});
