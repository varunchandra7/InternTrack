/**
 * Seed Events into Database
 * Run this script to populate the database with sample events
 * 
 * Usage: node seedEvents.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');

// Sample events data based on provided information
const events = [
    {
        title: 'CoachIn 2026',
        company: 'LinkedIn',
        type: 'internship',
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-06-30'),
        deadline: new Date('2025-12-31'),
        description: 'LinkedIn CoachIn program connects students with experienced professionals for mentorship and career guidance.',
        skills: ['Networking', 'Professional Development', 'Career Planning'],
        location: 'Remote',
        registrationLink: 'https://linkedin.com/coachin',
        color: '#0077B5'
    },
    {
        title: 'Google Summer of Code 2025',
        company: 'Google',
        type: 'internship',
        startDate: new Date('2025-03-24'),
        endDate: new Date('2025-04-08'),
        deadline: new Date('2025-04-08'),
        description: 'GSoC is a global program focused on bringing student developers into open source software development.',
        skills: ['Open Source', 'Programming', 'Software Development'],
        rounds: ['Proposal Submission', 'Community Bonding', 'Coding Period', 'Final Evaluation'],
        location: 'Remote',
        eligibility: 'Students 18+ years old',
        registrationLink: 'https://summerofcode.withgoogle.com',
        color: '#4285F4'
    },
    {
        title: 'STEP Intern 2026',
        company: 'Google',
        type: 'internship',
        startDate: new Date('2025-10-01'),
        endDate: new Date('2025-11-30'),
        deadline: new Date('2025-11-30'),
        description: 'STEP (Student Training in Engineering Program) is a development opportunity for first and second-year undergraduate students.',
        skills: ['Data Structures', 'Algorithms', 'Software Engineering'],
        location: 'Bangalore, India',
        eligibility: 'First or second-year CS students',
        registrationLink: 'https://careers.google.com/students',
        color: '#EA4335'
    },
    {
        title: 'SWE Explore Intern',
        company: 'Microsoft',
        type: 'internship',
        startDate: new Date('2025-08-01'),
        endDate: new Date('2025-10-31'),
        deadline: new Date('2025-10-31'),
        description: 'Explore Microsoft internship program for first and second-year students interested in software engineering.',
        skills: ['Programming', 'Problem Solving', 'Teamwork'],
        location: 'Hyderabad, India',
        eligibility: 'First/Second year students',
        registrationLink: 'https://careers.microsoft.com/students',
        color: '#00A4EF'
    },
    {
        title: 'HackTag',
        company: 'Uber',
        type: 'hackathon',
        startDate: new Date('2026-01-14'),
        endDate: new Date('2026-01-15'),
        deadline: new Date('2026-01-13'),
        description: 'Uber\'s flagship hackathon bringing together developers to solve real-world transportation challenges.',
        skills: ['Web Development', 'Mobile Development', 'API Integration'],
        rounds: ['Registration', 'Problem Statement', '24-hour Hack', 'Judging'],
        prize: 'Cash prizes and internship opportunities',
        registrationLink: 'https://uber.com/hacktag',
        color: '#000000'
    },
    {
        title: 'Summer Analyst 2026',
        company: 'Goldman Sachs',
        type: 'internship',
        startDate: new Date('2025-12-01'),
        endDate: new Date('2026-01-31'),
        deadline: new Date('2026-01-31'),
        description: 'Summer Analyst program offering hands-on experience in technology and finance.',
        skills: ['Java', 'Python', 'Financial Knowledge', 'Problem Solving'],
        location: 'Bangalore, India',
        eligibility: 'Pre-final year students',
        registrationLink: 'https://goldmansachs.com/careers',
        color: '#0D47A1'
    },
    {
        title: 'Girls Wanna Code 6.0',
        company: 'Flipkart',
        type: 'contest',
        startDate: new Date('2025-01-27'),
        endDate: new Date('2025-01-28'),
        deadline: new Date('2025-01-26'),
        description: 'Coding competition exclusively for female students to promote diversity in tech.',
        skills: ['Data Structures', 'Algorithms', 'Competitive Programming'],
        rounds: ['Online Assessment', 'Final Round'],
        eligibility: 'Female students only',
        prize: 'Internship opportunities and cash prizes',
        registrationLink: 'https://flipkart.com/girlswannacode',
        color: '#F06C00'
    },
    {
        title: 'Runway Season 5',
        company: 'Flipkart',
        type: 'hackathon',
        startDate: new Date('2025-03-20'),
        endDate: new Date('2025-03-21'),
        deadline: new Date('2025-03-19'),
        description: 'Flipkart\'s product development hackathon focused on e-commerce innovations.',
        skills: ['Full Stack Development', 'Product Thinking', 'Innovation'],
        rounds: ['Registration', 'Ideation', 'Prototyping', 'Presentation'],
        prize: 'Pre-placement offers and cash prizes',
        registrationLink: 'https://flipkart.com/runway',
        color: '#2874F0'
    },
    {
        title: 'CodeStreet Campus',
        company: 'American Express',
        type: 'internship',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-07-31'),
        deadline: new Date('2025-07-31'),
        description: 'Campus recruitment program for technology internships at American Express.',
        skills: ['Java', 'Python', 'Cloud Technologies', 'Microservices'],
        location: 'Gurgaon, India',
        eligibility: '2026 graduates',
        registrationLink: 'https://americanexpress.com/careers',
        color: '#006FCF'
    },
    {
        title: 'HackwithInfy',
        company: 'Infosys',
        type: 'hackathon',
        startDate: new Date('2025-02-06'),
        endDate: new Date('2025-02-07'),
        deadline: new Date('2025-02-05'),
        description: 'National level hackathon by Infosys for engineering students across India.',
        skills: ['Programming', 'Problem Solving', 'Innovation'],
        rounds: ['Registration', 'Online Round', 'Grand Finale'],
        prize: 'PPO, Internships, Cash prizes up to ₹5 lakhs',
        eligibility: 'BE/B.Tech students (2025/2026 batch)',
        registrationLink: 'https://infosys.com/hackwithinfy',
        color: '#007CC3'
    },
    {
        title: 'Techathon 6.0',
        company: 'EY',
        type: 'contest',
        startDate: new Date('2025-09-01'),
        endDate: new Date('2026-02-28'),
        deadline: new Date('2026-02-28'),
        description: 'EY\'s technology challenge focusing on emerging tech solutions for business problems.',
        skills: ['AI/ML', 'Blockchain', 'Data Analytics', 'Cloud'],
        rounds: ['Registration', 'Online Test', 'Case Study', 'Interview'],
        location: 'Hybrid',
        registrationLink: 'https://ey.com/techathon',
        color: '#FFE600'
    },
    {
        title: 'MLH Fellowship',
        company: 'Major League Hacking',
        type: 'internship',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-08-31'),
        deadline: new Date('2025-05-31'),
        description: 'Remote software engineering internship program with open source contributions.',
        skills: ['Open Source', 'Web Development', 'Collaboration'],
        location: 'Remote',
        eligibility: 'Students worldwide',
        registrationLink: 'https://fellowship.mlh.io',
        color: '#FF6B35'
    },
    {
        title: 'Hackerramp',
        company: 'Myntra',
        type: 'hackathon',
        startDate: new Date('2025-08-27'),
        endDate: new Date('2025-08-28'),
        deadline: new Date('2025-08-26'),
        description: 'Myntra\'s fashion-tech hackathon for innovative solutions in e-commerce and fashion.',
        skills: ['Full Stack', 'UI/UX', 'Mobile Development'],
        rounds: ['Screening', 'Hackathon', 'Final Presentation'],
        prize: 'Internship opportunities and prizes',
        registrationLink: 'https://myntra.com/hackerramp',
        color: '#FF3F6C'
    },
    {
        title: 'Hacker Cup',
        company: 'Meta',
        type: 'contest',
        startDate: new Date('2025-09-01'),
        endDate: new Date('2025-10-31'),
        deadline: new Date('2025-10-31'),
        description: 'Meta\'s annual algorithmic programming competition with rounds from qualification to world finals.',
        skills: ['Algorithms', 'Competitive Programming', 'Problem Solving'],
        rounds: ['Qualification Round', 'Round 1', 'Round 2', 'Round 3', 'World Finals'],
        prize: 'Cash prizes and recruitment opportunities',
        eligibility: 'Open to all',
        registrationLink: 'https://facebook.com/hackercup',
        color: '#1877F2'
    }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        return seedEvents();
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

async function seedEvents() {
    try {
        // Clear existing events (optional - comment out if you want to keep existing)
        await Event.deleteMany({});
        console.log('🗑️  Cleared existing events');

        // Insert new events
        const insertedEvents = await Event.insertMany(events);
        console.log(`✅ Successfully added ${insertedEvents.length} events to database`);

        // Display summary
        console.log('\n📊 Events Summary:');
        console.log(`   Internships: ${events.filter(e => e.type === 'internship').length}`);
        console.log(`   Hackathons: ${events.filter(e => e.type === 'hackathon').length}`);
        console.log(`   Contests: ${events.filter(e => e.type === 'contest').length}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding events:', error);
        process.exit(1);
    }
}
