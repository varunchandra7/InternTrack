const mongoose = require('mongoose');

/**
 * Event Schema
 * Stores recruitment events (Hackathons, Internships, Contests)
 */
const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['hackathon', 'internship', 'contest', 'deadline'],
        lowercase: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date
    },
    deadline: {
        type: Date
    },
    description: {
        type: String,
        required: true
    },
    skills: [{
        type: String,
        trim: true
    }],
    rounds: [{
        type: String,
        trim: true
    }],
    location: {
        type: String,
        default: 'Remote'
    },
    eligibility: {
        type: String
    },
    prize: {
        type: String
    },
    registrationLink: {
        type: String
    },
    color: {
        type: String,
        default: '#6366f1'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
