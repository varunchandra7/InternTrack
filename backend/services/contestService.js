/**
 * Contest Fetching Service
 * Automatically fetches contests from CodeForces, LeetCode, CodeChef, and AtCoder
 */

const axios = require('axios');

const EVENT_COLORS = {
    internship: '#60A5FA',
    meeting: '#4ADE80',
    review: '#FCD34D',
    hackathon: '#A78BFA',
    workshop: '#FB923C'
};

const CURATED_DATASET = {
    internships: [
        ['Google Summer Internship', 'Google', '2025-05-01', '2025-03-15'],
        ['Microsoft Internship', 'Microsoft', '2025-06-01', '2025-04-10'],
        ['Amazon SDE Internship', 'Amazon', '2025-05-20', '2025-03-30'],
        ['Goldman Sachs Internship', 'Goldman Sachs', '2025-06-10', '2025-04-25'],
        ['JPMorgan Internship', 'JPMorgan', '2025-06-15', '2025-05-01'],
        ['Adobe Internship', 'Adobe', '2025-05-25', '2025-04-05'],
        ['Flipkart Internship', 'Flipkart', '2025-06-05', '2025-04-20'],
        ['Walmart Global Tech Internship', 'Walmart', '2025-06-12', '2025-04-28'],
        ['Cisco Internship', 'Cisco', '2025-05-28', '2025-04-08'],
        ['IBM Internship', 'IBM', '2025-06-18', '2025-05-05'],
        ['Oracle Internship', 'Oracle', '2025-06-22', '2025-05-10'],
        ['Intel Internship', 'Intel', '2025-06-15', '2025-05-01'],
        ['Qualcomm Internship', 'Qualcomm', '2025-06-20', '2025-05-05'],
        ['Zoho Internship', 'Zoho', '2025-05-15', '2025-04-01'],
        ['Freshworks Internship', 'Freshworks', '2025-05-30', '2025-04-15'],
        ['Razorpay Internship', 'Razorpay', '2025-06-08', '2025-04-22'],
        ['Swiggy Internship', 'Swiggy', '2025-06-12', '2025-04-30'],
        ['Zomato Internship', 'Zomato', '2025-06-10', '2025-04-28'],
        ['Paytm Internship', 'Paytm', '2025-05-25', '2025-04-12'],
        ['PhonePe Internship', 'PhonePe', '2025-06-05', '2025-04-20']
    ],
    hackathons: [
        ['Smart India Hackathon', 'SIH', '2025-12-08', '2025-11-20'],
        ['Goldman Sachs Hackathon', 'Goldman Sachs', '2025-05-17', '2025-05-04'],
        ['Hack the Future (IIT Gandhinagar)', 'IIT Gandhinagar', '2025-03-21', '2025-03-10'],
        ['PSB FinTech Hackathon (IIT Hyderabad)', 'IIT Hyderabad', '2025-06-01', '2025-05-20'],
        ['HERE India Hackathon Women in Tech', 'HERE', '2025-10-10', '2025-10-05'],
        ['AI Hackathon with Meta Llama', 'Meta', '2025-03-22', '2025-03-15'],
        ['TCS HackQuest', 'TCS', '2025-09-15', '2025-08-25'],
        ['MSME Idea Hackathon', 'MSME', '2025-08-20', '2025-08-05'],
        ['KU Hackathon', 'KU', '2025-04-10', '2025-03-25'],
        ['Sparkathon', 'Sparkathon', '2025-07-15', '2025-06-30'],
        ['CodeQuest Hackathon', 'CodeQuest', '2025-11-05', '2025-10-25'],
        ['Neural.Net Hackathon', 'Neural.Net', '2025-11-06', '2025-10-28'],
        ['InnovateX Hackathon', 'InnovateX', '2025-09-10', '2025-08-20'],
        ['Central India Hackathon', 'Central India', '2025-08-25', '2025-08-10'],
        ['Byte Wars Hackathon', 'Byte Wars', '2025-07-20', '2025-07-05'],
        ['HackNext', 'HackNext', '2025-10-24', '2025-10-10'],
        ['Startathon', 'Startathon', '2025-11-17', '2025-11-05'],
        ['IoT GIS Hackathon', 'IoT GIS', '2025-09-05', '2025-08-20'],
        ['Viksit Bharat Buildathon', 'Viksit Bharat', '2025-09-25', '2025-09-10'],
        ['ReFlow Innovation Hackathon', 'ReFlow', '2025-10-15', '2025-10-01']
    ],
    events: [
        ['Techfest IIT Bombay', 'IIT Bombay', '2025-12-21', '2025-12-15'],
        ['Kshitij IIT Kharagpur', 'IIT Kharagpur', '2025-01-20', '2025-01-10'],
        ['Shaastra IIT Madras', 'IIT Madras', '2025-01-05', '2024-12-28'],
        ['Cognizance IIT Roorkee', 'IIT Roorkee', '2025-03-22', '2025-03-10'],
        ['Techkriti IIT Kanpur', 'IIT Kanpur', '2025-03-28', '2025-03-15'],
        ['Technex IIT BHU', 'IIT BHU', '2025-03-10', '2025-03-01'],
        ['Pragyan NIT Trichy', 'NIT Trichy', '2025-02-20', '2025-02-10'],
        ['MindSpark COEP', 'COEP', '2025-09-25', '2025-09-10'],
        ['Engineer NITK', 'NITK', '2025-10-18', '2025-10-10'],
        ['Aarohan NIT Durgapur', 'NIT Durgapur', '2025-02-15', '2025-02-05'],
        ['Tathva NIT Calicut', 'NIT Calicut', '2025-09-20', '2025-09-10'],
        ['Axis VNIT Nagpur', 'VNIT Nagpur', '2025-09-10', '2025-09-01'],
        ['Abhiyanta VNIT', 'VNIT', '2025-02-28', '2025-02-20'],
        ['Advitiya IIIT Allahabad', 'IIIT Allahabad', '2025-03-05', '2025-02-25'],
        ['Anwesha IIT Patna', 'IIT Patna', '2025-01-25', '2025-01-15'],
        ['Infinity IIT Indore', 'IIT Indore', '2025-01-18', '2025-01-10'],
        ['Daksh SSN College', 'SSN College', '2025-02-10', '2025-02-01'],
        ['Kurukshetra Anna University', 'Anna University', '2025-02-22', '2025-02-10'],
        ['INFINITUS SRM AP', 'SRM AP', '2025-03-30', '2025-03-20'],
        ['E-Summit IIT (various)', 'IIT', '2025-08-15', '2025-08-05']
    ]
};

function toNextOccurrence(dateStr) {
    const source = new Date(dateStr);
    const now = new Date();
    let year = now.getFullYear();

    let shifted = new Date(year, source.getMonth(), source.getDate(), 9, 0, 0, 0);
    if (shifted < now) {
        shifted = new Date(year + 1, source.getMonth(), source.getDate(), 9, 0, 0, 0);
    }
    return shifted;
}

function getGeneralEventColor(title) {
    const normalized = String(title || '').toLowerCase();
    if (normalized.includes('workshop') || normalized.includes('bootcamp') || normalized.includes('learn')) {
        return EVENT_COLORS.workshop;
    }
    if (normalized.includes('review') || normalized.includes('outcome') || normalized.includes('result')) {
        return EVENT_COLORS.review;
    }
    return EVENT_COLORS.meeting;
}

function buildCuratedEvents() {
    const internships = CURATED_DATASET.internships.map(([title, company, startDate, deadline]) => ({
        title,
        company,
        platform: 'internship',
        type: 'internship',
        startDate: toNextOccurrence(startDate),
        deadline: toNextOccurrence(deadline),
        description: `${title} recruitment timeline and application tracking event`,
        link: `https://www.google.com/search?q=${encodeURIComponent(title)}`,
        registrationLink: `https://www.google.com/search?q=${encodeURIComponent(title)}`,
        color: EVENT_COLORS.internship,
        external: true,
        skills: ['Aptitude', 'CS Fundamentals', 'Communication'],
        rounds: ['Application', 'Assessment', 'Interview']
    }));

    const hackathons = CURATED_DATASET.hackathons.map(([title, company, startDate, deadline]) => ({
        title,
        company,
        platform: 'hackathon',
        type: 'hackathon',
        startDate: toNextOccurrence(startDate),
        deadline: toNextOccurrence(deadline),
        description: `${title} hackathon event with team participation and submissions`,
        link: `https://www.google.com/search?q=${encodeURIComponent(title)}`,
        registrationLink: `https://www.google.com/search?q=${encodeURIComponent(title)}`,
        color: EVENT_COLORS.hackathon,
        external: true,
        skills: ['Problem Solving', 'Teamwork', 'Rapid Prototyping'],
        rounds: ['Registration', 'Build', 'Submission', 'Finale']
    }));

    const events = CURATED_DATASET.events.map(([title, company, startDate, deadline]) => ({
        title,
        company,
        platform: 'event',
        type: 'contest',
        startDate: toNextOccurrence(startDate),
        deadline: toNextOccurrence(deadline),
        description: `${title} general event for exposure, networking, and outcomes`,
        link: `https://www.google.com/search?q=${encodeURIComponent(title)}`,
        registrationLink: `https://www.google.com/search?q=${encodeURIComponent(title)}`,
        color: getGeneralEventColor(title),
        external: true,
        skills: ['Networking', 'Presentation', 'Event Participation'],
        rounds: ['Registration', 'Participation', 'Outcome']
    }));

    return [...internships, ...hackathons, ...events];
}

/**
 * Fetch contests from CodeForces
 */
async function fetchCodeForcesContests() {
    try {
        const response = await axios.get('https://codeforces.com/api/contest.list');
        
        if (response.data.status !== 'OK') {
            console.log('CodeForces API error');
            return [];
        }
        
        const now = new Date();
        const contests = response.data.result
            .filter(contest => contest.phase === 'BEFORE') // Only upcoming contests
            .map(contest => ({
                title: contest.name,
                platform: 'codeforces',
                type: 'contest',
                startDate: new Date(contest.startTimeSeconds * 1000),
                duration: `${Math.floor(contest.durationSeconds / 3600)} hours`,
                description: `CodeForces ${contest.type} - Competitive programming contest with algorithmic problems`,
                link: `https://codeforces.com/contest/${contest.id}`,
                color: '#1F8ACB',
                external: true,
                skills: ['Algorithms', 'Data Structures', 'Problem Solving'],
                rounds: ['Registration', 'Contest', 'System Testing', 'Final Standings']
            }))
            .filter(contest => contest.startDate > now) // Only future contests
            .slice(0, 10); // Limit to next 10 contests
        
        console.log(`✓ Fetched ${contests.length} CodeForces contests`);
        return contests;
    } catch (error) {
        console.error('Error fetching CodeForces contests:', error.message);
        return [];
    }
}

/**
 * Fetch contests from LeetCode
 */
async function fetchLeetCodeContests() {
    try {
        // LeetCode GraphQL API
        const query = `
            query {
                allContests {
                    title
                    titleSlug
                    startTime
                    duration
                }
            }
        `;
        
        const response = await axios.post('https://leetcode.com/graphql', {
            query: query
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const now = new Date();
        const contests = response.data.data.allContests
            .filter(contest => new Date(contest.startTime * 1000) > now)
            .map(contest => ({
                title: contest.title,
                platform: 'leetcode',
                type: 'contest',
                startDate: new Date(contest.startTime * 1000),
                duration: `${Math.floor(contest.duration / 60)} minutes`,
                description: `LeetCode Weekly/Biweekly Contest - Solve algorithmic problems to improve your coding skills and compete globally`,
                link: `https://leetcode.com/contest/${contest.titleSlug}`,
                color: '#FFA116',
                external: true,
                skills: ['Algorithms', 'Dynamic Programming', 'Arrays', 'Trees'],
                rounds: ['Contest Phase', 'Virtual Participation']
            }))
            .slice(0, 5);
        
        console.log(`✓ Fetched ${contests.length} LeetCode contests`);
        return contests;
    } catch (error) {
        console.error('Error fetching LeetCode contests:', error.message);
        return [];
    }
}

/**
 * Fetch contests from CodeChef
 */
async function fetchCodeChefContests() {
    try {
        const response = await axios.get('https://www.codechef.com/api/list/contests/all', {
            params: {
                sort_by: 'START',
                sorting_order: 'asc'
            }
        });
        
        const now = new Date();
        const upcomingContests = response.data.future_contests || [];
        
        const contests = upcomingContests
            .map(contest => ({
                title: contest.contest_name,
                platform: 'codechef',
                type: 'contest',
                startDate: new Date(contest.contest_start_date_iso),
                duration: `${Math.floor((new Date(contest.contest_end_date_iso) - new Date(contest.contest_start_date_iso)) / (1000 * 60 * 60))} hours`,
                description: `CodeChef ${contest.contest_code} - Practice problems and compete in Long Challenge, Lunchtime, or Starters`,
                link: `https://www.codechef.com/${contest.contest_code}`,
                color: '#5B4638',
                external: true,
                skills: ['Competitive Programming', 'Algorithms', 'Mathematics'],
                rounds: ['Contest Phase', 'Editorial Release', 'Plagiarism Check']
            }))
            .filter(contest => contest.startDate > now)
            .slice(0, 10);
        
        console.log(`✓ Fetched ${contests.length} CodeChef contests`);
        return contests;
    } catch (error) {
        console.error('Error fetching CodeChef contests:', error.message);
        return [];
    }
}

/**
 * Fetch contests from AtCoder
 */
async function fetchAtCoderContests() {
    try {
        // AtCoder doesn't have official API, using their contest page
        // We'll use a simplified approach - you can enhance with web scraping if needed
        const response = await axios.get('https://atcoder.jp/contests/', {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });
        
        // For now, returning a basic structure
        // In production, you'd parse the HTML or use AtCoder API alternatives
        console.log('✓ AtCoder contests (manual parsing needed)');
        return [];
        
        // TODO: Implement HTML parsing or use third-party AtCoder API
    } catch (error) {
        console.error('Error fetching AtCoder contests:', error.message);
        return [];
    }
}

/**
 * Fetch all contests from all platforms
 */
async function fetchAllContests() {
    console.log('\n🔄 Starting automated contest fetch...');
    console.log('⏰ Timestamp:', new Date().toLocaleString());
    
    try {
        const [codeforces, leetcode, codechef, atcoder] = await Promise.all([
            fetchCodeForcesContests(),
            fetchLeetCodeContests(),
            fetchCodeChefContests(),
            fetchAtCoderContests()
        ]);

        const curated = buildCuratedEvents();
        
        const allContests = [...curated, ...codeforces, ...leetcode, ...codechef, ...atcoder];
        
        // Sort by start date
        allContests.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        
        console.log(`\n✅ Total contests fetched: ${allContests.length}`);
        console.log(`   - Curated Dataset: ${curated.length}`);
        console.log(`   - CodeForces: ${codeforces.length}`);
        console.log(`   - LeetCode: ${leetcode.length}`);
        console.log(`   - CodeChef: ${codechef.length}`);
        console.log(`   - AtCoder: ${atcoder.length}`);
        
        return allContests;
    } catch (error) {
        console.error('❌ Error in fetchAllContests:', error.message);
        return [];
    }
}

// In-memory cache for contests (refreshed every 12 hours)
let contestCache = [];
let lastFetchTime = null;

/**
 * Get contests from cache or fetch if needed
 */
async function getContests(forceRefresh = false) {
    const now = Date.now();
    const TWELVE_HOURS = 12 * 60 * 60 * 1000;
    
    // Fetch if cache is empty, forced, or older than 12 hours
    if (forceRefresh || !lastFetchTime || (now - lastFetchTime) > TWELVE_HOURS) {
        contestCache = await fetchAllContests();
        lastFetchTime = now;
    } else {
        console.log('📦 Using cached contests (last fetched:', new Date(lastFetchTime).toLocaleString() + ')');
    }
    
    // Filter out past contests
    const currentContests = contestCache.filter(contest => new Date(contest.startDate) > new Date());
    
    return currentContests;
}

module.exports = {
    fetchAllContests,
    getContests,
    fetchCodeForcesContests,
    fetchLeetCodeContests,
    fetchCodeChefContests,
    fetchAtCoderContests
};
