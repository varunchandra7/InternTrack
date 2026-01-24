/**
 * Contest Fetching Service
 * Automatically fetches contests from CodeForces, LeetCode, CodeChef, and AtCoder
 */

const axios = require('axios');

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
        
        const allContests = [...codeforces, ...leetcode, ...codechef, ...atcoder];
        
        // Sort by start date
        allContests.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        
        console.log(`\n✅ Total contests fetched: ${allContests.length}`);
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
