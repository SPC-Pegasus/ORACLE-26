const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: true,
  },
  eventName: {
    type: String,
    required: true,
  },
  participants: {
    type: String,
    required: true,
  },
  theme: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Registration', registrationSchema);
