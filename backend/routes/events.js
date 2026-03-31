const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { getContests } = require('../services/contestService');
const mongoose = require('mongoose');

/**
 * @route   GET /api/events
 * @desc    Get all events for current user (database + external contests)
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const { type, month, year, userId } = req.query;
        
        let dbEvents = [];
        let query = {};
        
        // Only try to query database events if userId is valid
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            query.userId = userId;
            
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
            
            try {
                dbEvents = await Event.find(query).sort({ startDate: 1 });
            } catch (error) {
                console.log('Error fetching database events:', error.message);
            }
        }
        
        // Get external contests (always included)
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
            description,
            location,
            skills,
            rounds
        } = req.body;
        
        if (!userId || !title || !company || !type || !startDate) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        const event = new Event({
            userId,
            title,
            company,
            type,
            startDate,
            endDate,
            description,
            location,
            skills,
            rounds
        });
        
        await event.save();
        
        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            event
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating event'
        });
    }
});

module.exports = router;
