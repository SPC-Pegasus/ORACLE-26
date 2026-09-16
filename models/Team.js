const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: true,
    unique: true,
  },
  scores: {
    'Deadshot': { type: Number, default: 0 },
    'Treasure Hunt': { type: Number, default: 0 },
    'Free Fire': { type: Number, default: 0 },
    'BGMI': { type: Number, default: 0 },
    'IT Manager': { type: Number, default: 0 },
    'IT Quiz': { type: Number, default: 0 },
    'Web AI': { type: Number, default: 0 },
    'Poster Making': { type: Number, default: 0 },
    'Group Dance': { type: Number, default: 0 },
    'Group Singing': { type: Number, default: 0 },
    'Fashion Show': { type: Number, default: 0 },
    'Cosplay': { type: Number, default: 0 },
  },
  totalPoints: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Pre-save hook: Automatically calculate totalPoints before saving to the DB
teamSchema.pre('save', function() {
  let total = 0;
  
  // Safely get the raw data object to avoid iterating over Mongoose internal methods
  const scoreData = this.scores ? this.scores.toJSON() : {};
  
  for (const event in scoreData) {
    if (typeof scoreData[event] === 'number') {
      total += scoreData[event];
    }
  }
  
  this.totalPoints = total;
});

module.exports = mongoose.model('Team', teamSchema);
