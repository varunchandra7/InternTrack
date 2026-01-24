const mongoose = require('mongoose');

/**
 * Roadmap Schema - Stores user's generated learning roadmap
 */
const roadmapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One roadmap per user
  },
  subjects: [{
    type: String,
    enum: ['DSA', 'OS', 'DBMS', 'CN', 'SD'], // Data Structures & Algorithms, Operating Systems, Database Management Systems, Computer Networks, System Design
    required: true
  }],
  totalDays: {
    type: Number,
    required: true,
    min: 1,
    max: 365
  },
  dailyTasks: [{
    day: {
      type: Number,
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    topic: {
      type: String,
      required: true
    },
    subtopics: [{
      type: String
    }],
    estimatedTime: {
      type: String, // e.g., "2-3 hours"
      default: "2-3 hours"
    },
    resources: [{
      title: String,
      link: String
    }],
    isCompleted: {
      type: Boolean,
      default: false
    }
  }],
  progress: {
    completedTasks: {
      type: Number,
      default: 0
    },
    totalTasks: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

/**
 * Update progress percentage whenever tasks are marked complete/incomplete
 */
roadmapSchema.methods.updateProgress = function() {
  const totalTasks = this.dailyTasks.length;
  const completedTasks = this.dailyTasks.filter(task => task.isCompleted).length;
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  this.progress = {
    completedTasks,
    totalTasks,
    percentage
  };
  
  this.lastUpdated = Date.now();
};

module.exports = mongoose.model('Roadmap', roadmapSchema);
