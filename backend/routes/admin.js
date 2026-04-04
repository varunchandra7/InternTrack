const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event');
const { adminAuth } = require('../utils/adminMiddleware');

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with their progress
 * @access  Admin Only
 */
router.get('/users', adminAuth, async (req, res) => {
  try {
    // Get all users (excluding admin user's password)
    const users = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 });

    // For each user, get their event participation count
    const usersWithProgress = await Promise.all(
      users.map(async (user) => {
        const eventCount = await Event.countDocuments({ userId: user._id });
        
        return {
          id: user._id,
          name: user.name,
          email: user.email,
          gender: user.gender,
          isVerified: user.isVerified,
          eventCount: eventCount,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      totalUsers: usersWithProgress.length,
      users: usersWithProgress
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/user/:userId
 * @desc    Get specific user details with their events
 * @access  Admin Only
 */
router.get('/user/:userId', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's events
    const userEvents = await Event.find({ userId })
      .sort({ startDate: -1 });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      eventsCount: userEvents.length,
      events: userEvents
    });

  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user details',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/statistics
 * @desc    Get platform statistics
 * @access  Admin Only
 */
router.get('/statistics', adminAuth, async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const verifiedStudents = await User.countDocuments({ 
      role: 'student',
      isVerified: true 
    });
    const totalEvents = await Event.countDocuments();

    // Get events by type
    const eventsByType = await Event.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      statistics: {
        totalStudents,
        verifiedStudents,
        unverifiedStudents: totalStudents - verifiedStudents,
        totalEvents,
        eventsByType: eventsByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

module.exports = router;
