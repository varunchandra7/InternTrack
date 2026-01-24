require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');

const events2026 = [
    // Google Summer of Code 2026
    {
        title: "Google Summer of Code 2026",
        company: "Google",
        type: "internship",
        startDate: new Date("2026-05-25"),
        endDate: new Date("2026-08-24"),
        deadline: new Date("2026-03-31"),
        description: "GSoC 2026 focuses on Security and AI/ML in open-source projects. 12-week mentored coding program with stipends based on PPP.",
        skills: ["C", "C++", "Java", "Python", "Go", "TensorFlow", "PyTorch"],
        location: "Remote - Global",
        rounds: ["Application (Jan 19 - Feb 3)", "Contributor Proposals (Mar 16-31)", "Community Bonding (May 1-24)", "Coding (May 25 - Aug 16)"],
        registrationLink: "https://summerofcode.withgoogle.com"
    },

    // MLH Fellowship Spring 2026
    {
        title: "MLH Fellowship Spring 2026",
        company: "Major League Hacking",
        type: "internship",
        startDate: new Date("2026-01-26"),
        endDate: new Date("2026-04-26"),
        deadline: new Date("2026-01-02"),
        description: "12-week remote internship alternative with tracks in Software Engineering, Web3, and Production Engineering. Work in pods of 10-12 fellows.",
        skills: ["Python", "Node.js", "React", "Rust", "Solidity", "Linux", "DevOps"],
        location: "Remote - Global",
        rounds: ["Application Deadline: Jan 2", "Program Start: Jan 26"],
        registrationLink: "https://fellowship.mlh.io"
    },

    // AWS Breaking Barriers Challenge
    {
        title: "AWS Breaking Barriers Challenge 2026",
        company: "Amazon Web Services",
        type: "hackathon",
        startDate: new Date("2026-01-13"),
        endDate: new Date("2026-01-15"),
        deadline: new Date("2026-01-10"),
        description: "Multi-city innovation sprint across London, Manchester, and Dublin. Focus on Healthcare, Sustainability, and Social Impact using AWS AI/ML services.",
        skills: ["AWS", "Amazon Bedrock", "SageMaker", "Lambda", "Generative AI"],
        location: "London, Manchester, Dublin",
        rounds: ["48-hour hackathon: Jan 13-15"],
        registrationLink: "https://aws.amazon.com/events/breaking-barriers"
    },

    // Microsoft Imagine Cup 2026
    {
        title: "Microsoft Imagine Cup 2026",
        company: "Microsoft",
        type: "hackathon",
        startDate: new Date("2026-01-09"),
        endDate: new Date("2026-05-15"),
        deadline: new Date("2026-01-09"),
        description: "Global student technology competition. Build solutions using Microsoft Azure AI and cloud services.",
        skills: ["Azure", "AI", "Cloud Computing", "C#", "Python"],
        location: "Global - Regional Finals",
        rounds: ["Entry Submission: Jan 9", "Regional Finals: Mar-Apr", "World Finals: May"],
        registrationLink: "https://imaginecup.microsoft.com"
    },

    // Flipkart GWC 7.0
    {
        title: "Flipkart Girls Wanna Code 7.0",
        company: "Flipkart",
        type: "internship",
        startDate: new Date("2026-02-01"),
        endDate: new Date("2026-07-31"),
        deadline: new Date("2026-01-15"),
        description: "Her Today, Tech's Tomorrow - Program for women engineers (2028 batch). Includes learning modules, mentorship, and summer internship opportunity.",
        skills: ["Java", "C++", "Golang", "Data Structures", "Algorithms"],
        location: "India - Bangalore",
        rounds: ["Registration: Jan 15", "Coding Assessment: Late Jan", "Learning: Feb-Apr", "Internship: May-Jul"],
        registrationLink: "https://flipkart.com/girlswannacode"
    },

    // EY Techathon 6.0
    {
        title: "EY Techathon 6.0 - Agentic AI",
        company: "Ernst & Young",
        type: "hackathon",
        startDate: new Date("2026-01-15"),
        endDate: new Date("2026-02-28"),
        deadline: new Date("2026-02-15"),
        description: "Focus on Agentic AI systems across Pharma, FMCG, IT/BPM, Auto, Retail, and BFSI domains. Build autonomous agents that reason and use tools.",
        skills: ["AI/ML", "Python", "Autonomous Systems", "Domain Knowledge", "API Integration"],
        location: "Remote - India",
        rounds: ["Registration & Ideation", "Prototype Development", "Grand Finale: Feb 2026"],
        registrationLink: "https://ey.com/techathon"
    },

    // NVIDIA GTC 2026
    {
        title: "NVIDIA GTC 2026",
        company: "NVIDIA",
        type: "hackathon",
        startDate: new Date("2026-03-16"),
        endDate: new Date("2026-03-19"),
        deadline: new Date("2026-03-01"),
        description: "GPU Technology Conference - AI Factories and Physical AI. Hackathons focused on robotics, digital twins, and autonomous systems using CUDA.",
        skills: ["CUDA", "AI", "Robotics", "Omniverse", "Isaac SDK"],
        location: "San Jose, CA + Remote",
        rounds: ["Conference: Mar 16-19", "Developer Days", "AI Hackathons"],
        registrationLink: "https://nvidia.com/gtc"
    },

    // NASA Space Apps Challenge 2026
    {
        title: "NASA International Space Apps Challenge",
        company: "NASA",
        type: "hackathon",
        startDate: new Date("2026-10-03"),
        endDate: new Date("2026-10-04"),
        deadline: new Date("2026-09-30"),
        description: "World's largest global hackathon with 17 space agency partners. Use free NASA data to solve challenges on Earth and in space.",
        skills: ["Data Science", "Visualization", "Blockchain", "Mobile Dev", "Creative Problem Solving"],
        location: "Global - 400+ Cities",
        rounds: ["Local Lead Applications: Feb", "Registration Opens: Jul 18", "Hackathon: Oct 3-4", "Global Winners: Jan 2027"],
        registrationLink: "https://spaceappschallenge.org"
    },

    // NASA App Development Challenge
    {
        title: "NASA App Development Challenge 2026",
        company: "NASA",
        type: "hackathon",
        startDate: new Date("2026-04-13"),
        endDate: new Date("2026-04-16"),
        deadline: new Date("2026-04-10"),
        description: "High school and community college competition. Create visualizations for Artemis Moon missions.",
        skills: ["Mobile Development", "Data Visualization", "iOS", "Android", "React Native"],
        location: "Remote - USA",
        rounds: ["Development: Apr 13-16", "Judging: Apr-May"],
        registrationLink: "https://nasa.gov/appdevelopment"
    },

    // Uber HackTag 2026
    {
        title: "Uber HackTag 2026",
        company: "Uber",
        type: "hackathon",
        startDate: new Date("2026-02-15"),
        endDate: new Date("2026-04-30"),
        deadline: new Date("2026-03-15"),
        description: "Building solutions for the next billion users. Premier engineering competition in India with mentorship from Uber engineers.",
        skills: ["Kotlin", "Swift", "Go", "Java", "Computer Vision", "ML", "AR Core"],
        location: "India",
        rounds: ["Online Quiz", "Coding Challenge", "Prototyping", "Grand Finale"],
        registrationLink: "https://uber.com/hacktag"
    },

    // Flipkart Runway Season 5
    {
        title: "Flipkart Runway Season 5",
        company: "Flipkart",
        type: "internship",
        startDate: new Date("2026-05-01"),
        endDate: new Date("2026-07-31"),
        deadline: new Date("2026-02-15"),
        description: "Fast-track program for 2nd year women engineers (2027 batch) toward SDE-1 roles. Structured learning and mentorship.",
        skills: ["Java", "Python", "System Design", "Algorithms"],
        location: "India - Multiple Cities",
        rounds: ["Registration: Feb", "Assessment: Mar", "Selection: Apr", "Internship: May-Jul"],
        registrationLink: "https://flipkart.com/runway"
    },

    // Infosys InStep 2026
    {
        title: "Infosys InStep 2026",
        company: "Infosys",
        type: "internship",
        startDate: new Date("2026-05-15"),
        endDate: new Date("2026-08-15"),
        deadline: new Date("2026-03-31"),
        description: "Project-driven global internship on live problem statements in AI, ML, and RPA. Rolling application model.",
        skills: ["AI", "Machine Learning", "RPA", "Cloud Computing", "Java", "Python"],
        location: "India + Global",
        rounds: ["Rolling Applications", "Shortlisting", "Internship Period"],
        registrationLink: "https://infosys.com/instep"
    },

    // Infosys Springboard Virtual Internship 7.0
    {
        title: "Infosys Springboard Virtual 7.0",
        company: "Infosys",
        type: "internship",
        startDate: new Date("2026-03-01"),
        endDate: new Date("2026-05-31"),
        deadline: new Date("2026-02-28"),
        description: "Fully virtual internship building job-ready skills. Complete mandatory modules before applying through AICTE portal.",
        skills: ["Business Communication", "Problem Solving", "Programming", "Full Stack"],
        location: "Remote - India",
        rounds: ["Learning Modules", "Application via AICTE", "Virtual Projects"],
        registrationLink: "https://infosysspringboard.onwingspan.com"
    },

    // Smart India Hackathon 2026
    {
        title: "Smart India Hackathon 2026",
        company: "Government of India / AICTE",
        type: "hackathon",
        startDate: new Date("2026-12-10"),
        endDate: new Date("2026-12-12"),
        deadline: new Date("2026-11-30"),
        description: "Digital India initiative. Solve problem statements from government ministries. Focus on cybersecurity, rural development, and sustainable agriculture.",
        skills: ["Cybersecurity", "IoT", "AI", "Web Development", "Mobile Apps"],
        location: "India - Multiple Venues",
        rounds: ["College Round", "Regional Selection", "Grand Finale: Dec"],
        registrationLink: "https://sih.gov.in"
    },

    // Meta DevCon 2026
    {
        title: "Meta DevCon 2026",
        company: "Meta",
        type: "hackathon",
        startDate: new Date("2026-03-20"),
        endDate: new Date("2026-03-22"),
        deadline: new Date("2026-03-15"),
        description: "VR/AI innovation showcases and developer challenges. Explore Metaverse and AR/VR technologies.",
        skills: ["VR", "AR", "Unity", "React", "AI", "Computer Vision"],
        location: "Menlo Park, CA + Virtual",
        rounds: ["Conference Days: Mar 20-22", "Developer Challenges"],
        registrationLink: "https://developers.facebook.com/devcon"
    },

    // Google Solution Challenge 2026
    {
        title: "Google Solution Challenge 2026",
        company: "Google Developer Student Clubs",
        type: "hackathon",
        startDate: new Date("2026-02-01"),
        endDate: new Date("2026-05-31"),
        deadline: new Date("2026-03-31"),
        description: "Build solutions using Google technologies to solve UN Sustainable Development Goals. Focus on scalable cloud deployment.",
        skills: ["Google Cloud", "Firebase", "Flutter", "TensorFlow", "Android"],
        location: "Global",
        rounds: ["Registration: Feb", "Submission: Mar 31", "Evaluation: Apr-May"],
        registrationLink: "https://developers.google.com/community/gdsc-solution-challenge"
    }
];

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('📡 Connected to MongoDB');

        // Clear existing events
        await Event.deleteMany({});
        console.log('🗑️  Cleared existing events');

        // Insert new events
        const result = await Event.insertMany(events2026);
        console.log(`✅ Successfully added ${result.length} events for 2026!`);
        
        console.log('\n📊 Event Breakdown:');
        const hackathons = result.filter(e => e.type === 'hackathon').length;
        const internships = result.filter(e => e.type === 'internship').length;
        console.log(`   🔵 Hackathons: ${hackathons}`);
        console.log(`   🟠 Internships: ${internships}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
