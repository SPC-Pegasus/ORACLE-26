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

let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
  }
};

const router = express.Router();

// GET /scores Endpoint
router.get('/scores', async (req, res) => {
  await connectDB();
  try {
    const teams = await Team.find().sort({ totalPoints: -1 });
    res.status(200).json({ data: teams });
  } catch (error) {
    console.error('Error fetching scores:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard data' });
  }
});

// POST /scores Endpoint
router.post('/scores', async (req, res) => {
  await connectDB();
  const { teamName, eventName, score } = req.body;

  if (!teamName || !eventName || score === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    let team = await Team.findOne({ teamName });
    
    if (!team) {
      team = new Team({ teamName });
    }
    
    team.scores[eventName] = Number(score);
    await team.save();

    res.status(200).json({ message: 'Score updated successfully', data: team });
  } catch (error) {
    console.error('Error updating score:', error);
    res.status(500).json({ error: 'Failed to update score' });
  }
});

// POST /registrations Endpoint
router.post('/registrations', async (req, res) => {
  await connectDB();
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

// GET /registrations Endpoint
router.get('/registrations', async (req, res) => {
  await connectDB();
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

// Mount the router
app.use('/api', router);
app.use('/.netlify/functions/api', router);

module.exports = app;

if (require.main === module) {
  connectDB().then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
}
