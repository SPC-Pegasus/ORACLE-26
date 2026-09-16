const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Team = require('./models/Team');
const Registration = require('./models/Registration');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// GET /api/scores Endpoint
app.get('/api/scores', async (req, res) => {
  try {
    // Fetch all teams and sort by totalPoints in descending order
    const teams = await Team.find().sort({ totalPoints: -1 });
    res.status(200).json({ data: teams });
  } catch (error) {
    console.error('Error fetching scores:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard data' });
  }
});

// POST /api/scores Endpoint (Create/Update Team Score)
app.post('/api/scores', async (req, res) => {
  const { teamName, eventName, score } = req.body;

  if (!teamName || !eventName || score === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check if team exists
    let team = await Team.findOne({ teamName });
    
    if (!team) {
      // Create new team if they don't exist
      team = new Team({ teamName });
    }
    
    // Update the specific event score
    team.scores[eventName] = Number(score);
    
    // Save to trigger the pre-save hook for totalPoints
    await team.save();

    res.status(200).json({ message: 'Score updated successfully', data: team });
  } catch (error) {
    console.error('Error updating score:', error);
    res.status(500).json({ error: 'Failed to update score' });
  }
});

// POST /api/registrations Endpoint
app.post('/api/registrations', async (req, res) => {
  const { teamName, eventName, participants } = req.body;
  
  if (!teamName || !eventName || !participants) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const newReg = new Registration({ teamName, eventName, participants });
    await newReg.save();
    res.status(201).json({ message: 'Registration successful', data: newReg });
  } catch (error) {
    console.error('Error saving registration:', error);
    res.status(500).json({ error: 'Failed to register' });
  }
});

// GET /api/registrations Endpoint
app.get('/api/registrations', async (req, res) => {
  const { eventName } = req.query;
  
  try {
    const filter = eventName ? { eventName } : {};
    const registrations = await Registration.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ data: registrations });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
