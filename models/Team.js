const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: true,
    unique: true,
  },
  scores: {
    'Cyber Hackathon': { type: Number, default: 0 },
    'Neural UI/UX': { type: Number, default: 0 },
    'AI Odyssey': { type: Number, default: 0 },
    'Data Heist': { type: Number, default: 0 },
    'Robo Wars': { type: Number, default: 0 },
    'Deadshot': { type: Number, default: 0 },
    'Treasure Hunt': { type: Number, default: 0 },
    'Sim-Racing Circuit': { type: Number, default: 0 },
    'Cyber Cosplay': { type: Number, default: 0 },
    'Fashion Show': { type: Number, default: 0 },
    'Synth-Beat Battle': { type: Number, default: 0 },
    'Neon Art Exhibit': { type: Number, default: 0 },
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
