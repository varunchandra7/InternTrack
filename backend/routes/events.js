const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { getContests } = require('../services/contestService');

/**
 * @route   GET /api/events
 * @desc    Get all events for current user (database + external contests)
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const { type, month, year, userId } = req.query;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId is required'
            });
        }
        
        let query = { userId };
        
        // Filter by event type if provided
        if (type && type !== 'all') {
            query.type = type;
        }
        
        // Filter by month and year if provided
        if (month && year) {
            const startOfMonth = new Date(year, month - 1, 1);
            const endOfMonth = new Date(year, month, 0, 23, 59, 59);
            query.startDate = {
                $gte: startOfMonth,
                $lte: endOfMonth
            };
        }
        
        // Get events from database (user's events only)
        const dbEvents = await Event.find(query).sort({ startDate: 1 });
        
        // Get external contests
        const externalContests = await getContests();
        
        // Filter external contests by type if specified
        let filteredExternal = externalContests;
        if (type && type !== 'all') {
            filteredExternal = externalContests.filter(contest => contest.type === type);
        }
        
        // Filter external contests by month/year if specified
        if (month && year) {
            const startOfMonth = new Date(year, month - 1, 1);
            const endOfMonth = new Date(year, month, 0, 23, 59, 59);
            filteredExternal = filteredExternal.filter(contest => {
                const contestDate = new Date(contest.startDate);
                return contestDate >= startOfMonth && contestDate <= endOfMonth;
            });
        }
        
        // Merge and sort by start date
        const allEvents = [...dbEvents, ...filteredExternal];
        allEvents.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        
        res.json({
            success: true,
            count: allEvents.length,
            data: allEvents,
            sources: {
                database: dbEvents.length,
                external: filteredExternal.length
            }
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching events'
        });
    }
});

/**
 * @route   GET /api/events/:id
 * @desc    Get single event by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        
        res.json({
            success: true,
            data: event
        });
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching event'
        });
    }
});

/**
 * @route   POST /api/events
 * @desc    Create new event for user
 * @access  Private (User/Admin)
 */
router.post('/', async (req, res) => {
    try {
        const {
            userId,
            title,
            company,
            type,
            startDate,
            endDate,
            deadline,
            description,
            skills,
            rounds,
            location,
            eligibility,
            prize,
            registrationLink,
            color
        } = req.body;
        
        // Validation
        if (!userId || !title || !company || !type || !startDate || !description) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields (userId, title, company, type, startDate, description)'
            });
        }
        
        const event = await Event.create({
            userId,
            title,
            company,
            type,
            startDate,
            endDate,
            deadline,
            description,
            skills: skills || [],
            rounds: rounds || [],
            location,
            eligibility,
            prize,
            registrationLink,
            color: color || getColorByType(type)
        });
        
        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: event
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating event'
        });
    }
});

/**
 * @route   PUT /api/events/:id
 * @desc    Update event
 * @access  Private (Admin only)
 */
router.put('/:id', async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Event updated successfully',
            data: event
        });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating event'
        });
    }
});

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete event
 * @access  Private (Admin only)
 */
router.delete('/:id', async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting event'
        });
    }
});

/**
 * Helper function to get color based on event type
 */
function getColorByType(type) {
    const colors = {
        'internship': '#6366f1',
        'hackathon': '#10b981',
        'contest': '#f59e0b',
        'deadline': '#ef4444'
    };
    return colors[type] || '#6366f1';
}

module.exports = router;
