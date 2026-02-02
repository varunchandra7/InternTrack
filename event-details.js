/**
 * Event Details Page JavaScript
 */

// Check authentication
const token = localStorage.getItem('token') || sessionStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

if (!token) {
    window.location.href = 'index.html';
}

// Get event ID from URL
const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('id');

if (!eventId) {
    showError('No event specified');
}

// API Base URL
const API_URL = window.API_CONFIG?.BASE_URL || 'http://localhost:5000/api';

// Fetch and display event details
async function fetchEventDetails() {
    try {
        const response = await fetch(`${API_URL}/events`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }
        
        const result = await response.json();
        const events = result.data || result;
        
        // Find the specific event
        const event = events.find(e => e._id === eventId);
        
        if (!event) {
            showError('Event not found');
            return;
        }
        
        displayEventDetails(event);
    } catch (error) {
        console.error('Error fetching event details:', error);
        showError('Failed to load event details. Please try again.');
    }
}

function displayEventDetails(event) {
    const container = document.getElementById('eventDetailsContainer');
    
    // Format dates
    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : null;
    const deadline = event.deadline ? new Date(event.deadline) : null;
    
    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };
    
    // Determine badge class
    const badgeClass = `badge-${event.type}`;
    const typeName = event.type.charAt(0).toUpperCase() + event.type.slice(1);
    
    // Check if event is already in selected events
    const selectedEvents = JSON.parse(localStorage.getItem('selectedEvents') || '[]');
    const isSelected = selectedEvents.some(e => (e.id || e._id) === event._id);
    
    container.innerHTML = `
        <div class="event-details-card">
            <div class="event-header">
                <h1 class="event-title">${event.title}</h1>
                <p class="event-company">${event.company}</p>
                <div class="badges">
                    <span class="badge ${badgeClass}">${typeName}</span>
                    ${event.eligibility ? `<span class="badge" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">${event.eligibility}</span>` : ''}
                </div>
            </div>

            <div class="event-info-grid">
                <div class="info-item">
                    <i class="fas fa-calendar-alt"></i>
                    <div class="info-content">
                        <h4>Start Date</h4>
                        <p>${formatDate(startDate)}</p>
                    </div>
                </div>
                ${endDate ? `
                <div class="info-item">
                    <i class="fas fa-calendar-check"></i>
                    <div class="info-content">
                        <h4>End Date</h4>
                        <p>${formatDate(endDate)}</p>
                    </div>
                </div>
                ` : ''}
                ${deadline ? `
                <div class="info-item">
                    <i class="fas fa-clock"></i>
                    <div class="info-content">
                        <h4>Registration Deadline</h4>
                        <p>${formatDate(deadline)}</p>
                    </div>
                </div>
                ` : ''}
                ${event.location ? `
                <div class="info-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <div class="info-content">
                        <h4>Location</h4>
                        <p>${event.location}</p>
                    </div>
                </div>
                ` : ''}
                ${event.duration ? `
                <div class="info-item">
                    <i class="fas fa-hourglass-half"></i>
                    <div class="info-content">
                        <h4>Duration</h4>
                        <p>${event.duration}</p>
                    </div>
                </div>
                ` : ''}
                ${event.stipend ? `
                <div class="info-item">
                    <i class="fas fa-money-bill-wave"></i>
                    <div class="info-content">
                        <h4>Stipend</h4>
                        <p>${event.stipend}</p>
                    </div>
                </div>
                ` : ''}
            </div>

            ${event.description ? `
            <div class="section">
                <h3 class="section-title">
                    <i class="fas fa-info-circle"></i>
                    About This ${typeName}
                </h3>
                <div class="description">
                    ${getEnhancedDescription(event)}
                </div>
            </div>
            ` : ''}

            ${event.skills && event.skills.length > 0 ? `
            <div class="section">
                <h3 class="section-title">
                    <i class="fas fa-code"></i>
                    Required Skills
                </h3>
                <div class="skills-list">
                    ${event.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </div>
            ` : ''}

            ${event.rounds && event.rounds.length > 0 ? `
            <div class="section">
                <h3 class="section-title">
                    <i class="fas fa="tasks"></i>
                    Selection Process
                </h3>
                <div class="rounds-list">
                    ${event.rounds.map((round, index) => `
                        <div class="round-item">
                            <i class="fas fa-check-circle"></i>
                            Round ${index + 1}: ${round}
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            ${getPreparationGuide(event)}

            <div class="action-buttons">
                <button class="btn btn-primary" onclick="toggleEventSelection()">
                    <i class="fas ${isSelected ? 'fa-times' : 'fa-plus'}"></i>
                    ${isSelected ? 'Remove from Goals' : 'Add to Goals'}
                </button>
                ${event.registrationLink ? `
                <a href="${event.registrationLink}" target="_blank" class="btn btn-secondary">
                    <i class="fas fa-external-link-alt"></i>
                    Registration Link
                </a>
                ` : ''}
                ${event.link ? `
                <a href="${event.link}" target="_blank" class="btn btn-secondary">
                    <i class="fas fa-external-link-alt"></i>
                    Visit Official Page
                </a>
                ` : ''}
            </div>
        </div>
    `;
}

function getEnhancedDescription(event) {
    let enhanced = `<div class="enhanced-description">`;
    
    // Original description
    enhanced += `<p class="main-description">${event.description}</p>`;
    
    // Add type-specific context
    if (event.type === 'hackathon') {
        enhanced += `
            <div class="description-section">
                <h4><i class="fas fa-bullseye"></i> What to Expect</h4>
                <p>This hackathon is an intensive innovation challenge where you'll collaborate with talented developers, designers, and innovators to build working prototypes. You'll have ${event.endDate ? 'multiple days' : '24-48 hours'} to transform your ideas into reality, with access to mentors, technical resources, and networking opportunities.</p>
            </div>
            
            <div class="description-section">
                <h4><i class="fas fa-gift"></i> Why Participate?</h4>
                <ul class="benefits-list">
                    <li><i class="fas fa-trophy"></i> <strong>Win Prizes:</strong> Cash rewards, tech gadgets, and exclusive swag from ${event.company}</li>
                    <li><i class="fas fa-handshake"></i> <strong>Direct Recruitment:</strong> Top performers often receive internship/job offers directly</li>
                    <li><i class="fas fa-users"></i> <strong>Networking:</strong> Connect with industry professionals, potential co-founders, and like-minded developers</li>
                    <li><i class="fas fa-chart-line"></i> <strong>Skill Development:</strong> Learn new technologies, improve problem-solving, and build portfolio projects</li>
                    <li><i class="fas fa-certificate"></i> <strong>Recognition:</strong> Certificates of participation and winner announcements on company platforms</li>
                </ul>
            </div>
            
            <div class="description-section">
                <h4><i class="fas fa-users-cog"></i> Who Should Apply?</h4>
                <p>This hackathon is open to ${event.eligibility || 'all students and developers'}. Whether you're a beginner or experienced coder, teams with diverse skills (frontend, backend, design, product management) have the best chances of success. Solo participants can join and find team members during the event.</p>
            </div>
        `;
    } else if (event.type === 'internship') {
        enhanced += `
            <div class="description-section">
                <h4><i class="fas fa-briefcase"></i> About This Internship</h4>
                <p>${event.company} is offering this ${event.duration || '8-12 week'} internship opportunity for talented students to gain hands-on experience in real-world software development. You'll work alongside experienced engineers on impactful projects that affect millions of users.</p>
            </div>
            
            <div class="description-section">
                <h4><i class="fas fa-star"></i> What You'll Gain</h4>
                <ul class="benefits-list">
                    <li><i class="fas fa-laptop-code"></i> <strong>Real Projects:</strong> Work on production code, not just learning exercises</li>
                    <li><i class="fas fa-user-tie"></i> <strong>Mentorship:</strong> 1-on-1 guidance from senior engineers and tech leads</li>
                    <li><i class="fas fa-money-bill-wave"></i> <strong>Competitive Stipend:</strong> ${event.stipend || 'Industry-standard compensation for your work'}</li>
                    <li><i class="fas fa-graduation-cap"></i> <strong>Learning:</strong> Access to internal training, tech talks, and workshops</li>
                    <li><i class="fas fa-door-open"></i> <strong>PPO Potential:</strong> High-performing interns often receive Pre-Placement Offers (full-time roles)</li>
                    <li><i class="fas fa-building"></i> <strong>Company Culture:</strong> Experience working at ${event.company} firsthand</li>
                </ul>
            </div>
            
            <div class="description-section">
                <h4><i class="fas fa-check-circle"></i> Eligibility & Requirements</h4>
                <p><strong>Who can apply:</strong> ${event.eligibility || 'Pre-final and final year students from CS/IT/related branches'}</p>
                <p><strong>Selection process:</strong> The hiring process is rigorous and includes ${event.rounds ? event.rounds.length : '3-4'} rounds of technical and behavioral interviews. Strong data structures, algorithms, and problem-solving skills are essential.</p>
            </div>
            
            <div class="description-section">
                <h4><i class="fas fa-calendar-check"></i> Important Dates</h4>
                <p><strong>Application Deadline:</strong> ${event.deadline ? new Date(event.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Check official page'}</p>
                <p><strong>Internship Duration:</strong> ${event.startDate && event.endDate ? `${new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} to ${new Date(event.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : 'Typically 8-12 weeks during summer/winter break'}</p>
                <p><strong>💡 Tip:</strong> Apply early! Applications are reviewed on a rolling basis, and positions fill quickly.</p>
            </div>
        `;
    } else if (event.type === 'contest') {
        enhanced += `
            <div class="description-section">
                <h4><i class="fas fa-trophy"></i> About This Contest</h4>
                <p>This competitive programming contest by ${event.company} is designed to test your algorithmic thinking, coding speed, and problem-solving abilities. Compete against thousands of talented programmers from around the world to prove your skills and climb the leaderboard.</p>
            </div>
            
            <div class="description-section">
                <h4><i class="fas fa-medal"></i> Why Compete?</h4>
                <ul class="benefits-list">
                    <li><i class="fas fa-brain"></i> <strong>Sharpen Skills:</strong> Improve your algorithmic thinking and coding speed under pressure</li>
                    <li><i class="fas fa-chart-line"></i> <strong>Rating Boost:</strong> Increase your competitive programming rating and rank</li>
                    <li><i class="fas fa-award"></i> <strong>Recognition:</strong> Top performers get certificates, prizes, and bragging rights</li>
                    <li><i class="fas fa-briefcase"></i> <strong>Career Benefits:</strong> Strong contest performance can lead to interview calls from ${event.company}</li>
                    <li><i class="fas fa-users"></i> <strong>Global Competition:</strong> Compete with the best programmers worldwide</li>
                    <li><i class="fas fa-book"></i> <strong>Learn New Techniques:</strong> Upsolve problems after contest to learn advanced algorithms</li>
                </ul>
            </div>
            
            <div class="description-section">
                <h4><i class="fas fa-gamepad"></i> Contest Format</h4>
                <p><strong>Duration:</strong> ${event.endDate ? `${Math.ceil((new Date(event.endDate) - new Date(event.startDate)) / (1000 * 60 * 60))} hours` : '2-3 hours typically'}</p>
                <p><strong>Problems:</strong> Expect ${event.rounds ? event.rounds.length : '5-8'} problems ranging from easy implementation to advanced algorithms</p>
                <p><strong>Scoring:</strong> Points based on problem difficulty and submission time. Penalty for wrong submissions.</p>
                <p><strong>Platform:</strong> Contest will be hosted on ${event.company}'s coding platform with real-time leaderboard</p>
            </div>
            
            <div class="description-section">
                <h4><i class="fas fa-user-graduate"></i> Who Should Participate?</h4>
                <p><strong>All skill levels welcome!</strong> Whether you're a beginner looking to improve or an expert aiming for top ranks, there's something for everyone. ${event.eligibility || 'Open to students and professionals worldwide'}.</p>
                <p><strong>Preparation:</strong> Practice data structures, algorithms, and solve previous year problems. Focus on time management and accuracy.</p>
            </div>
        `;
    }
    
    enhanced += `</div>`;
    return enhanced;
}

function getPreparationGuide(event) {
    if (event.type === 'hackathon') {
        return getHackathonGuide();
    } else if (event.type === 'internship') {
        return getInternshipGuide();
    } else if (event.type === 'contest') {
        return getContestGuide();
    }
    return '';
}

function getHackathonGuide() {
    return `
        <div class="section preparation-guide">
            <h3 class="section-title">
                <i class="fas fa-graduation-cap"></i>
                Complete Hackathon Preparation Guide
            </h3>
            <div class="guide-content">
                <div class="guide-section">
                    <h4><i class="fas fa-info-circle"></i> What is a Hackathon?</h4>
                    <ul>
                        <li>A <strong>hackathon</strong> is an intensive event (usually 24-48 hours) where developers, designers, and innovators collaborate to build working prototypes or solutions to specific problems</li>
                        <li>Companies use hackathons to identify talented developers, promote innovation, and sometimes recruit directly</li>
                        <li>Participants compete in teams (usually 2-4 members) to create functional software, apps, or hardware solutions</li>
                        <li><strong>Prize:</strong> Cash rewards, internship opportunities, mentorship, and recognition</li>
                        <li><strong>Types:</strong> Physical (on-campus), Virtual (online), or Hybrid format</li>
                    </ul>
                </div>

                <div class="guide-section">
                    <h4><i class="fas fa-list-ol"></i> Typical Hackathon Round Structure</h4>
                    <ul>
                        <li><strong>Total Rounds:</strong> Usually 3-4 rounds spanning 1-3 months</li>
                        <li>Each round eliminates teams progressively until the final winners</li>
                        <li>Top companies: Google, Microsoft, Meta, Uber conduct multi-round hackathons</li>
                    </ul>
                </div>

                <div class="guide-section">
                    <h4><i class="fas fa-clipboard-list"></i> Round 1: Registration & Idea Submission (Week 1-2)</h4>
                    <ul>
                        <li><strong>What happens:</strong> Teams register on the company's portal and submit their initial idea or problem statement</li>
                        <li><strong>Deliverables:</strong> Team details, project title, abstract (200-500 words), technology stack, and expected impact</li>
                        <li><strong>Duration:</strong> Typically 1-2 weeks for registration window</li>
                        <li><strong>Selection Criteria:</strong> Innovation, feasibility, alignment with hackathon theme (e.g., FinTech, HealthTech, Sustainability)</li>
                        <li><strong>Example Themes:</strong> "Build for billion users" (Uber), "Social Good" (Microsoft), "Future of Commerce" (Amazon)</li>
                        <li><strong>Outcome:</strong> 40-50% of teams are shortlisted for next round</li>
                        <li><strong>Pro Tip:</strong> Make your abstract compelling - clearly state the problem you're solving and why it matters</li>
                    </ul>
                </div>

                <div class="guide-section">
                    <h4><i class="fas fa-code"></i> Round 2: Online Screening/Quiz (Week 3)</h4>
                    <ul>
                        <li><strong>What happens:</strong> Shortlisted teams take an online technical assessment to prove coding skills</li>
                        <li><strong>Format:</strong> MCQs + Coding Problems (2-3 questions)</li>
                        <li><strong>Topics Tested:</strong> Data Structures, Algorithms, Problem Solving, Domain Knowledge (based on theme)</li>
                        <li><strong>Duration:</strong> 90-120 minutes</li>
                        <li><strong>Difficulty Level:</strong> Easy to Medium (similar to LeetCode Medium)</li>
                        <li><strong>Team Participation:</strong> Either 1 representative per team OR entire team (varies by hackathon)</li>
                        <li><strong>Outcome:</strong> Top 20-30% teams advance to prototyping round</li>
                        <li><strong>Example (Google HackTag):</strong> 2 coding problems + 20 MCQs on data structures in 2 hours</li>
                    </ul>
                </div>

                <div class="guide-section">
                    <h4><i class="fas fa-laptop-code"></i> Round 3: Prototype Development (Week 4-6)</h4>
                    <ul>
                        <li><strong>What happens:</strong> The actual hackathon phase where teams build their product from scratch</li>
                        <li><strong>Duration:</strong> 24-48 hours continuous coding (can be spread over a weekend)</li>
                        <li><strong>Start Time:</strong> Usually Friday evening or Saturday morning</li>
                        <li><strong>Submission Deadline:</strong> Sunday evening with strict cutoff</li>
                        <li><strong>Environment:</strong> Physical venue (college/company office) OR virtual (Discord/Slack channels)</li>
                    </ul>
                </div>

                <div class="guide-section">
                    <h4><i class="fas fa-clock"></i> Hour-by-Hour Hackathon Strategy (24-hour format)</h4>
                    <ul>
                        <li><strong>Hour 0-1 (Opening Ceremony):</strong> Problem statement reveal, mentors introduced, rules explained. Attend carefully!</li>
                        <li><strong>Hour 1-3 (Ideation & Planning):</strong> Brainstorm solutions, finalize ONE idea, sketch wireframes, divide tasks (Frontend/Backend/DB/Design)</li>
                        <li><strong>Hour 3-4 (Setup):</strong> Create GitHub repo, setup development environment, initialize project (React + Node/Flask), configure database</li>
                        <li><strong>Hour 4-12 (Core Development):</strong> Build the MVP - focus on critical features only. Frontend builds UI, Backend creates APIs, Designer polishes mockups</li>
                        <li><strong>Hour 12-14 (Integration Break):</strong> Take short power naps (crucial!), grab food, integrate frontend-backend</li>
                        <li><strong>Hour 14-18 (Feature Completion):</strong> Complete all planned features, connect all components, add error handling</li>
                        <li><strong>Hour 18-20 (Testing & Bug Fixing):</strong> Test every feature thoroughly, fix critical bugs, handle edge cases</li>
                        <li><strong>Hour 20-22 (UI Polish & Deployment):</strong> Improve UI/UX, add animations, deploy on cloud (Vercel/Heroku), test live URL</li>
                        <li><strong>Hour 22-24 (Presentation Prep):</strong> Create PPT (10 slides max), record demo video (3-5 min), prepare pitch script, rehearse demo</li>
                        <li><strong>Submission:</strong> Upload code to GitHub, submit live URL, PPT, and video before deadline (miss deadline = disqualification!)</li>
                    </ul>
                </div>

                <div class="guide-section">
                    <h4><i class="fas fa-presentation"></i> Round 4: Presentation & Demo (Finals)</h4>
                    <ul>
                        <li><strong>What happens:</strong> Top 10-15 teams present their solutions to judges (company engineers, CTOs, VPs)</li>
                        <li><strong>Format:</strong> 5 min presentation + 5 min live demo + 5 min Q&A = 15 min total per team</li>
                        <li><strong>Presentation Structure:</strong> 
                            <br>• Slide 1: Team intro (names, colleges, roles)
                            <br>• Slide 2-3: Problem statement (make judges feel the pain point)
                            <br>• Slide 4-5: Your solution (how it works, uniqueness)
                            <br>• Slide 6-7: Live demo or video walkthrough
                            <br>• Slide 8: Tech stack & architecture diagram
                            <br>• Slide 9: Impact & scalability (how it helps users)
                            <br>• Slide 10: Future scope & thank you
                        </li>
                        <li><strong>Live Demo Tips:</strong> Rehearse 10+ times, use sample data (don't create new data live), have backup video if WiFi fails, test on judges' screen beforehand</li>
                        <li><strong>Common Judge Questions:</strong> "How is this different from existing solutions?", "What if X scenario happens?", "How will you scale this?", "What challenges did you face?"</li>
                        <li><strong>Judging Criteria (typical breakdown):</strong>
                            <br>• Innovation & Creativity: 25%
                            <br>• Technical Complexity: 20%
                            <br>• Usefulness & Impact: 25%
                            <br>• Design & User Experience: 15%
                            <br>• Presentation Quality: 15%
                        </li>
                        <li><strong>Outcome:</strong> Winners announced (1st, 2nd, 3rd prizes + special mentions)</li>
                    </ul>
                </div>

                <div class="guide-section">
                    <h4><i class="fas fa-users"></i> Team Formation Strategy</h4>
                    <ul>
                        <li><strong>Ideal Team Size:</strong> 3-4 members (2 is too risky, 5+ creates coordination issues)</li>
                        <li><strong>Role Distribution:</strong>
                            <br>• <strong>Full Stack Developer (2 people):</strong> One focuses on frontend (React/Vue), other on backend (Node/Django)
                            <br>• <strong>UI/UX Designer (1 person):</strong> Creates mockups in Figma, ensures polished interface
                            <br>• <strong>Presenter/PM (1 person):</strong> Manages timeline, prepares presentation, often overlaps with backend dev
                        </li>
                        <li><strong>Team Chemistry:</strong> Work with people you've collaborated before, shared GitHub repos, or done projects together</li>
                        <li><strong>Where to find teammates:</strong> College coding clubs, GitHub, LinkedIn, hackathon Discord servers, or friends from previous competitions</li>
                    </ul>
                </div>

                <div class="guide-section">
                    <h4><i class="fas fa-tools"></i> Tech Stack Recommendations</h4>
                    <ul>
                        <li><strong>Use what you KNOW:</strong> Hackathons are NOT the time to learn new frameworks - stick to familiar tech</li>
                        <li><strong>Quick Setup Stack:</strong>
                            <br>• Frontend: React + Tailwind CSS (fast UI building)
                            <br>• Backend: Node.js + Express (JavaScript everywhere) OR Python Flask (simple APIs)
                            <br>• Database: Firebase (real-time, zero setup) OR MongoDB Atlas (free cloud database)
                            <br>• Deployment: Vercel (frontend), Render/Railway (backend)
                        </li>
                        <li><strong>Advanced Stack (if experienced):</strong> Next.js (full-stack React), Supabase (Firebase alternative), TypeScript, PostgreSQL</li>
                        <li><strong>Must-Have Tools:</strong> Git/GitHub (version control), Postman (API testing), Figma (design), VS Code Live Share (real-time collaboration)</li>
                    </ul>
                </div>

                <div class="guide-section">
                    <h4><i class="fas fa-trophy"></i> Winning Strategies</h4>
                    <ul>
                        <li><strong>Problem > Technology:</strong> Judges care about the problem you're solving, not fancy tech you used</li>
                        <li><strong>Working Demo is KING:</strong> A simple working solution beats a complex broken one - always!</li>
                        <li><strong>Storytelling Matters:</strong> Start with a relatable story/scenario to hook judges emotionally</li>
                        <li><strong>Quantify Impact:</strong> "Saves 2 hours daily for 10,000 students" > "Makes life easier"</li>
                        <li><strong>Backup Everything:</strong> Record demo video, take screenshots, have GitHub README ready</li>
                        <li><strong>Practice Pitch:</strong> Rehearse in front of friends, time yourself, anticipate questions</li>
                        <li><strong>Mentorship:</strong> Talk to mentors during hackathon - they give valuable feedback and may influence judges</li>
                        <li><strong>Git Commits:</strong> Commit frequently with good messages - judges often check commit history for genuine work</li>
                    </ul>
                </div>

                <div class="guide-section">
                    <h4><i class="fas fa-exclamation-triangle"></i> Common Pitfalls to Avoid</h4>
                    <ul>
                        <li><strong>Scope Creep:</strong> Trying to build 10 features instead of 3 core ones - keep it simple!</li>
                        <li><strong>Poor Time Management:</strong> Spending 15 hours on one feature - timebox tasks!</li>
                        <li><strong>Ignoring UI:</strong> Great backend with ugly UI loses to decent backend with polished UI</li>
                        <li><strong>No Testing:</strong> Demo crashes during presentation - always test before submitting</li>
                        <li><strong>Plagiarism:</strong> Copying existing projects - judges can tell, leads to disqualification</li>
                        <li><strong>Overconfidence:</strong> Not rehearsing presentation - practice makes perfect!</li>
                    </ul>
                </div>

                <div class="guide-section">
                    <h4><i class="fas fa-calendar-alt"></i> Pre-Hackathon Checklist (1 week before)</h4>
                    <ul>
                        <li>☐ Team finalized and registered</li>
                        <li>☐ Roles assigned to each member</li>
                        <li>☐ Tech stack decided and tested locally</li>
                        <li>☐ GitHub organization/repo created</li>
                        <li>☐ Design tools setup (Figma/Canva)</li>
                        <li>☐ Cloud accounts created (Vercel, MongoDB Atlas, Firebase)</li>
                        <li>☐ Boilerplate code ready (React template, Express server template)</li>
                        <li>☐ Communication channel setup (WhatsApp group, Discord server)</li>
                        <li>☐ Laptop charged, stable internet verified</li>
                        <li>☐ Snacks, energy drinks, and backup plan for meals ready!</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

function getInternshipGuide() {
    return `
        <div class="section preparation-guide">
            <h3 class="section-title">
                <i class="fas fa-graduation-cap"></i>
                Complete Internship Preparation Guide
            </h3>
            <div class="guide-content">
                <div class="guide-section">
                    <h4><i class="fas fa-code"></i> Technical Preparation</h4>
                    <ul>
                        <li><strong>Data Structures:</strong> Arrays, Linked Lists, Stacks, Queues, Trees (Binary, BST, AVL), Graphs, Hash Tables, Heaps</li>
                        <li><strong>Algorithms:</strong> Sorting (Quick, Merge, Heap), Searching (Binary, DFS, BFS), Dynamic Programming, Greedy Algorithms, Divide & Conquer</li>
                        <li><strong>Practice Platforms:</strong> LeetCode (focus on Medium problems), HackerRank, CodeForces, InterviewBit</li>
                        <li><strong>Target:</strong> Solve 150-200 problems (Easy: 40%, Medium: 50%, Hard: 10%) over 3-6 months</li>
                        <li><strong>Company-Specific:</strong> Study company interview patterns (Blind 75 for FAANG, Striver's SDE Sheet)</li>
                    </ul>
                </div>

                <div class="guide-section">
                    <h4><i class="fas fa-laptop-code"></i> Development Skills</h4>
                    <ul>
                        <li><strong>Build Projects:</strong> Create 2-3 full-stack projects to showcase on resume (e.g., E-commerce site, Chat app, Task manager)</li>
                        <li><strong>Git & GitHub:</strong> Learn version control - commits, branches, pull requests, merge conflicts</li>
                        <li><strong>REST APIs:</strong> Understand HTTP methods, status codes, authentication (JWT, OAuth)</li>
                        <li><strong>Databases:</strong> SQL (MySQL/PostgreSQL) + NoSQL (MongoDB) - learn CRUD operations, joins, indexing</li>
                        <li><strong>Deployment:</strong> Deploy at least one project live (Vercel, Netlify, Heroku, Railway) - show live URLs on resume</li>
                        <li><strong>Documentation:</strong> Write clean README files with screenshots, setup instructions, and tech stack</li>
                    </ul>
                </div>

                <div class="guide-section">
                    <h4><i class="fas fa-file-alt"></i> Resume Building</h4>
                    <ul>
                        <li><strong>Length:</strong> Keep it to 1 page (2 pages max for experienced developers)</li>
                        <li><strong>Structure:</strong> Name/Contact → Education → Projects → Skills → Achievements → Certifications</li>
                        <li><strong>Projects Section:</strong> 2-3 best projects with tech stack, description, and impact ("Reduced load time by 40%")</li>
                        <li><strong>Action Verbs:</strong> Built, Developed, Optimized, Implemented, Designed, Engineered (avoid "helped", "worked on")</li>
                        <li><strong>Quantify:</strong> Use numbers - "Handled 1000+ concurrent users", "Improved performance by 50%"</li>
                        <li><strong>ATS-Friendly:</strong> Use standard fonts (Arial, Calibri), avoid tables/graphics, include keywords from job description</li>
                        <li><strong>Tailor:</strong> Customize resume for each company - highlight relevant projects and skills</li>
                    </ul>
                </div>

                <div class="guide-section">
                    <h4><i class="fas fa-comments"></i> Interview Rounds Breakdown</h4>
                    <ul>
                        <li><strong>Round 1 - Online Assessment (OA):</strong>
                            <br>• Duration: 90-120 minutes
                            <br>• Format: 2-3 coding problems + 20-30 MCQs
                            <br>• Topics: DSA (Medium difficulty), CS fundamentals (OS, DBMS, Networks)
                            <br>• Tip: Practice timed contests on LeetCode/CodeChef
                        </li>
                        <li><strong>Round 2 - Technical Interview 1:</strong>
                            <br>• Duration: 45-60 minutes
                            <br>• Focus: Data Structures & Algorithms (2 coding problems)
                            <br>• Platform: CoderPad, HackerRank, or shared Google Doc
                            <br>• Tip: Think aloud, explain your approach before coding, test with examples
                        </li>
                        <li><strong>Round 3 - Technical Interview 2:</strong>
                            <br>• Duration: 45-60 minutes
                            <br>• Focus: Project discussion + System design (basic) + DSA (1 problem)
                            <br>• Questions: "Explain your project", "How did you handle X?", "Design a URL shortener"
                            <br>• Tip: Know your projects inside-out, be ready to code any feature live
                        </li>
                        <li><strong>Round 4 - HR/Behavioral:</strong>
                            <br>• Duration: 30-45 minutes
                            <br>• Questions: "Why this company?", "Tell me about yourself", "Strengths/Weaknesses", "Where do you see yourself in 5 years?"
                            <br>• Format: STAR method (Situation, Task, Action, Result)
                            <br>• Tip: Research company culture, prepare 2-3 questions to ask interviewer
                        </li>
                    </ul>
                </div>

                <div class="guide-section">
                    <h4><i class="fas fa-star"></i> Pro Tips for Success</h4>
                    <ul>
                        <li><strong>Start Early:</strong> Begin preparation 3-6 months before placement season (not 1 week before!)</li>
                        <li><strong>Consistency > Intensity:</strong> Practice 1-2 hours daily rather than 10 hours once a week</li>
                        <li><strong>Mock Interviews:</strong> Practice with peers on Pramp, interviewing.io, or with seniors</li>
                        <li><strong>Company Patterns:</strong> Research company-specific interview patterns (GeeksforGeeks company tags, Glassdoor)</li>
                        <li><strong>Networking:</strong> Connect with company employees on LinkedIn, ask about culture and interview tips</li>
                        <li><strong>Follow-up:</strong> Send thank-you emails after interviews (shows professionalism)</li>
                        <li><strong>Rejections are Normal:</strong> Don't get discouraged - even top candidates face 5-10 rejections before getting offers</li>
                    </ul>
                </div>

                <div class="guide-section">
                    <h4><i class="fas fa-brain"></i> CS Fundamentals to Review</h4>
                    <ul>
                        <li><strong>Operating Systems:</strong> Processes, Threads, Deadlocks, Paging, Scheduling algorithms</li>
                        <li><strong>DBMS:</strong> Normalization, ACID properties, Joins, Indexing, Transactions</li>
                        <li><strong>Computer Networks:</strong> OSI Model, TCP/IP, HTTP/HTTPS, DNS, Routing</li>
                        <li><strong>OOP Concepts:</strong> Inheritance, Polymorphism, Encapsulation, Abstraction</li>
                        <li><strong>System Design (Basic):</strong> Scalability, Load Balancing, Caching, Database sharding</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

function getContestGuide() {
    return `
        <div class="section preparation-guide">
            <h3 class="section-title">
                <i class="fas fa-graduation-cap"></i>
                Complete Contest Preparation Guide
            </h3>
            <div class="guide-content">
                <div class="guide-section">
                    <h4><i class="fas fa-book"></i> Core Topics to Master</h4>
                    <ul>
                        <li><strong>Mathematics:</strong> Number Theory (GCD, LCM, Prime numbers, Modular arithmetic), Combinatorics (Permutations, Combinations), Probability</li>
                        <li><strong>Algorithms:</strong> Greedy, Dynamic Programming (Knapsack, LCS, LIS), Graph algorithms (Dijkstra, Bellman-Ford, Floyd-Warshall), String algorithms (KMP, Rabin-Karp)</li>
                        <li><strong>Data Structures:</strong> Segment Trees, Fenwick Trees (BIT), Trie, Disjoint Set Union (DSU), Priority Queues</li>
                        <li><strong>Advanced Topics:</strong> Suffix Arrays, Z-algorithm, Binary Indexed Trees, Sparse Table</li>
                    </ul>
                </div>

                <div class="guide-section">
                    <h4><i class="fas fa-chart-line"></i> Rating Journey (Codeforces scale)</h4>
                    <ul>
                        <li><strong>Newbie (0-1199):</strong> Focus on implementation, basic math, brute force, simple loops</li>
                        <li><strong>Pupil (1200-1399):</strong> Binary search, two pointers, greedy basics, prefix sums</li>
                        <li><strong>Specialist (1400-1599):</strong> DP fundamentals, graph traversal (DFS/BFS), sorting variations</li>
                        <li><strong>Expert (1600-1899):</strong> Advanced DP, segment trees, number theory, shortest paths</li>
                        <li><strong>Candidate Master (1900+):</strong> Complex DS, game theory, advanced graph algorithms</li>
                    </ul>
                </div>

                <div class="guide-section">
                    <h4><i class="fas fa-dumbbell"></i> Training Regimen</h4>
                    <ul>
                        <li><strong>Contests:</strong> Participate in 2-3 contests per week (Codeforces Div 2/3, AtCoder Beginner, LeetCode Weekly/Biweekly)</li>
                        <li><strong>Upsolving:</strong> After each contest, solve problems you couldn't during contest (aim for at least 2-3 problems)</li>
                        <li><strong>Practice:</strong> Solve 3-5 problems daily at your level + 1-2 problems slightly above your rating</li>
                        <li><strong>Learn from Editorials:</strong> Read official editorials and study top-rated solutions for new techniques</li>
                        <li><strong>Topic-wise Practice:</strong> Spend 1-2 weeks mastering one topic (e.g., DP week, Graph week) using CSES or A2OJ ladders</li>
                    </ul>
                </div>

                <div class="guide-section">
                    <h4><i class="fas fa-clock"></i> Contest Strategy</h4>
                    <ul>
                        <li><strong>Reading Phase (5-10 min):</strong> Read ALL problems quickly, identify easy ones, note constraints</li>
                        <li><strong>Solve in Order:</strong> Usually A → B → C (increasing difficulty), but skip if stuck >20 minutes</li>
                        <li><strong>Don't Get Stuck:</strong> If no progress in 15-20 min, move to next problem and return later</li>
                        <li><strong>Test Edge Cases:</strong> Before submitting, test with: small inputs, maximum constraints, zeros, negative numbers</li>
                        <li><strong>Penalty Time Matters:</strong> Fewer wrong submissions = better rank. Double-check before submitting!</li>
                        <li><strong>Time Management:</strong> Don't spend entire contest on one hard problem - secure easier points first</li>
                    </ul>
                </div>

                <div class="guide-section">
                    <h4><i class="fas fa-graduation-cap"></i> Learning Resources</h4>
                    <ul>
                        <li><strong>Books:</strong>
                            <br>• Competitive Programming 4 by Steven & Felix Halim
                            <br>• Guide to Competitive Programming by Antti Laaksonen
                            <br>• Competitive Programmer's Handbook (free PDF)
                        </li>
                        <li><strong>YouTube Channels:</strong>
                            <br>• Errichto (advanced explanations)
                            <br>• William Lin (contest speedruns)
                            <br>• Colin Galen (rating improvement tips)
                            <br>• Luv (beginner-friendly DSA)
                        </li>
                        <li><strong>Practice Platforms:</strong>
                            <br>• Codeforces (best for contests)
                            <br>• AtCoder (clean problems, great editorials)
                            <br>• CSES Problem Set (topic-wise 300 problems)
                            <br>• CodeChef (Long Challenge for beginners)
                        </li>
                        <li><strong>Visualizers:</strong>
                            <br>• VisuAlgo (algorithm animations)
                            <br>• Algorithm Visualizer
                            <br>• CP-Algorithms (theory + implementations)
                        </li>
                    </ul>
                </div>

                <div class="guide-section">
                    <h4><i class="fas fa-trophy"></i> Contest-Specific Tips</h4>
                    <ul>
                        <li><strong>Codeforces:</strong> Focus on Div 2 contests, upsolve A-D problems, join practice rounds</li>
                        <li><strong>AtCoder:</strong> Excellent for DP and math - Beginner Contests are perfect for <1400 rating</li>
                        <li><strong>LeetCode:</strong> Good for interview prep + Weekly contests simulate time pressure</li>
                        <li><strong>Google Competitions:</strong> Kick Start, Code Jam - focus on problem analysis over speed</li>
                        <li><strong>Meta Hacker Cup:</strong> Qualification round is beginner-friendly, Round 1 requires solid practice</li>
                    </ul>
                </div>

                <div class="guide-section">
                    <h4><i class="fas fa-exclamation-triangle"></i> Common Mistakes to Avoid</h4>
                    <ul>
                        <li><strong>Jumping to Hard Problems:</strong> Master basics first - don't attempt 2000-rated problems at 1200 rating</li>
                        <li><strong>Not Upsolving:</strong> Reading editorial without implementing = waste of time. Code it yourself!</li>
                        <li><strong>Ignoring Constraints:</strong> 10^9 needs long long, 10^5 allows O(n log n) but not O(n^2)</li>
                        <li><strong>Copy-Pasting Code:</strong> Understand WHY a solution works, don't just copy templates</li>
                        <li><strong>Contest Addiction:</strong> Balance contests with topic-wise practice - don't just do contests</li>
                        <li><strong>Giving Up Early:</strong> Rating growth is slow - 6-12 months to reach Expert is normal</li>
                    </ul>
                </div>

                <div class="guide-section">
                    <h4><i class="fas fa-calendar-alt"></i> 3-Month Training Plan</h4>
                    <ul>
                        <li><strong>Month 1 - Foundations:</strong> Master basic DS (arrays, strings, stacks, queues), learn binary search, two pointers, prefix sums. Solve 60-80 problems.</li>
                        <li><strong>Month 2 - Intermediate:</strong> Learn DP (5-6 standard patterns), graph basics (DFS, BFS, DSU), number theory. Participate in 8-10 contests.</li>
                        <li><strong>Month 3 - Advanced:</strong> Segment trees, advanced DP, shortest paths, practice past contest problems. Target +100 rating increase.</li>
                        <li><strong>Daily Routine:</strong> 1 hour theory/learning + 2 hours problem solving + 1 contest every 2-3 days</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

function showError(message) {
    const container = document.getElementById('eventDetailsContainer');
    container.innerHTML = `
        <div class="error">
            <i class="fas fa-exclamation-circle"></i>
            <h2>Error</h2>
            <p>${message}</p>
        </div>
    `;
}

function toggleEventSelection() {
    // Get event data from the page
    const eventTitle = document.querySelector('.event-title').textContent;
    
    // Fetch current event data
    fetch(`${API_URL}/events`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(result => {
        const events = result.data || result;
        const event = events.find(e => e._id === eventId);
        
        if (!event) {
            alert('Event not found');
            return;
        }
        
        let selectedEvents = JSON.parse(localStorage.getItem('selectedEvents') || '[]');
        const isSelected = selectedEvents.some(e => (e.id || e._id) === event._id);
        
        if (isSelected) {
            // Remove from selected
            selectedEvents = selectedEvents.filter(e => (e.id || e._id) !== event._id);
            localStorage.setItem('selectedEvents', JSON.stringify(selectedEvents));
            alert('Event removed from your goals!');
        } else {
            // Add to selected
            selectedEvents.push({
                ...event,
                id: event._id,
                start: event.startDate
            });
            localStorage.setItem('selectedEvents', JSON.stringify(selectedEvents));
            alert('Event added to your goals! Check the Home page.');
        }
        
        // Reload to update button
        fetchEventDetails();
    })
    .catch(error => {
        console.error('Error toggling event:', error);
        alert('Failed to update event selection. Please try again.');
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchEventDetails();
});
