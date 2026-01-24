const express = require('express');
const router = express.Router();
const Roadmap = require('../models/Roadmap');
const { generateAIRoadmap } = require('../services/aiRoadmapGenerator');

/**
 * @route   POST /api/roadmap/generate
 * @desc    Generate a new AI-powered roadmap for user
 * @access  Private
 */
router.post('/generate', async (req, res) => {
  try {
    const { userId, subjects, totalDays } = req.body;
    
    // Validation
    if (!userId || !subjects || !totalDays) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide userId, subjects, and totalDays' 
      });
    }
    
    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please select at least one subject' 
      });
    }
    
    if (totalDays < 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Total days must be at least 1' 
      });
    }
    
    const validSubjects = ['DSA', 'OS', 'DBMS', 'CN', 'SD'];
    const invalidSubjects = subjects.filter(s => !validSubjects.includes(s));
    if (invalidSubjects.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid subjects: ${invalidSubjects.join(', ')}` 
      });
    }
    
    // Generate AI-powered roadmap tasks
    console.log(`🤖 Generating AI roadmap for ${subjects.join(', ')} - ${totalDays} days`);
    const dailyTasks = await generateAIRoadmap(subjects, totalDays);
    
    // Check if user already has a roadmap
    let roadmap = await Roadmap.findOne({ userId });
    
    if (roadmap) {
      // Update existing roadmap
      roadmap.subjects = subjects;
      roadmap.totalDays = totalDays;
      roadmap.dailyTasks = dailyTasks;
      roadmap.updateProgress();
      await roadmap.save();
    } else {
      // Create new roadmap
      roadmap = new Roadmap({
        userId,
        subjects,
        totalDays,
        dailyTasks,
        progress: {
          completedTasks: 0,
          totalTasks: dailyTasks.length,
          percentage: 0
        }
      });
      await roadmap.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Roadmap generated successfully!',
      roadmap
    });
    
  } catch (error) {
    console.error('Error generating roadmap:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while generating roadmap',
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/roadmap/:userId
 * @desc    Get user's roadmap
 * @access  Private
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const roadmap = await Roadmap.findOne({ userId });
    
    if (!roadmap) {
      return res.status(404).json({ 
        success: false, 
        message: 'No roadmap found. Please generate a roadmap first.' 
      });
    }
    
    res.status(200).json({
      success: true,
      roadmap
    });
    
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching roadmap',
      error: error.message 
    });
  }
});

/**
 * @route   PUT /api/roadmap/progress
 * @desc    Update task completion status
 * @access  Private
 */
router.put('/progress', async (req, res) => {
  try {
    const { userId, day, isCompleted } = req.body;
    
    // Validation
    if (!userId || day === undefined || isCompleted === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide userId, day, and isCompleted status' 
      });
    }
    
    const roadmap = await Roadmap.findOne({ userId });
    
    if (!roadmap) {
      return res.status(404).json({ 
        success: false, 
        message: 'No roadmap found' 
      });
    }
    
    // Find and update the specific task
    const taskIndex = roadmap.dailyTasks.findIndex(task => task.day === day);
    
    if (taskIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: `Task for day ${day} not found` 
      });
    }
    
    roadmap.dailyTasks[taskIndex].isCompleted = isCompleted;
    
    // Update progress
    roadmap.updateProgress();
    
    await roadmap.save();
    
    res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      progress: roadmap.progress
    });
    
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating progress',
      error: error.message 
    });
  }
});

/**
 * @route   DELETE /api/roadmap/:userId
 * @desc    Delete user's roadmap
 * @access  Private
 */
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const roadmap = await Roadmap.findOneAndDelete({ userId });
    
    if (!roadmap) {
      return res.status(404).json({ 
        success: false, 
        message: 'No roadmap found' 
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Roadmap deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting roadmap:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting roadmap',
      error: error.message 
    });
  }
});

module.exports = router;
