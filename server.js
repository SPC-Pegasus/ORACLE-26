const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const Team = require('./models/Team');
const Registration = require('./models/Registration');

const app = express();

// 1. CORS RESTRICTION
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*', 
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.static('public'));

// 2. RATE LIMITING
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true, 
  legacyHeaders: false, 
});
app.use(limiter);

// 3. ADMIN AUTHENTICATION MIDDLEWARE
const verifyAdmin = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({ error: 'Forbidden: Invalid or missing Admin API Key' });
  }
  next();
};

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

// POST /login Endpoint (Public - Admin Verification)
router.post('/login', (req, res) => {
  const { id, pass } = req.body;
  const validId = process.env.ADMIN_ID || 'pegasus';
  if (id === validId && pass && pass === process.env.ADMIN_API_KEY) {
    return res.status(200).json({ success: true, message: 'Authorized' });
  }
  return res.status(401).json({ error: 'Access Denied: Invalid Credentials' });
});

// GET /scores Endpoint (Public)
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

// POST /scores Endpoint (Protected)
router.post('/scores', verifyAdmin, async (req, res) => {
  await connectDB();
  const { teamName, eventName, score } = req.body;

  // 4. BASIC INPUT VALIDATION
  if (!teamName || typeof teamName !== 'string' || teamName.length > 100) {
    return res.status(400).json({ error: 'Invalid or missing teamName' });
  }
  if (!eventName || typeof eventName !== 'string' || eventName.length > 100) {
    return res.status(400).json({ error: 'Invalid or missing eventName' });
  }
  if (score === undefined || typeof score !== 'number' || score < 0 || score > 100000) {
    return res.status(400).json({ error: 'Invalid or missing score' });
  }

  try {
    let team = await Team.findOne({ teamName });
    
    if (!team) {
      team = new Team({ teamName });
    }
    
    team.scores[eventName] = Number(score);
    team.markModified('scores');
    await team.save();

    res.status(200).json({ message: 'Score updated successfully', data: team });
  } catch (error) {
    console.error('Error updating score:', error);
    res.status(500).json({ error: 'Failed to update score' });
  }
});

// POST /registrations Endpoint (Public)
router.post('/registrations', async (req, res) => {
  await connectDB();
  const { teamName, eventName, participants, theme } = req.body;
  
  if (!teamName || typeof teamName !== 'string' || teamName.length > 100) {
    return res.status(400).json({ error: 'Invalid teamName' });
  }
  if (!eventName || typeof eventName !== 'string' || eventName.length > 100) {
    return res.status(400).json({ error: 'Invalid eventName' });
  }
  if (!participants || (typeof participants !== 'string' && !Array.isArray(participants))) {
    return res.status(400).json({ error: 'Invalid participants format' });
  }

  try {
    const newReg = new Registration({ teamName, eventName, participants, theme });
    await newReg.save();
    res.status(201).json({ message: 'Registration successful', data: newReg });
  } catch (error) {
    console.error('Error saving registration:', error);
    res.status(500).json({ error: 'Failed to register' });
  }
});

// GET /registrations/unique Endpoint (Protected)
router.get('/registrations/unique', verifyAdmin, async (req, res) => {
  await connectDB();
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });
    const studentMap = new Map();
    let totalEnrollments = 0;
    const teamStats = {};

    registrations.forEach(reg => {
      const raw = typeof reg.participants === 'string' ? reg.participants : String(reg.participants || '');
      const names = raw.split(/[\r\n,;]+/).map(s => s.trim()).filter(Boolean);
      const team = reg.teamName || 'Unknown Team';

      if (!teamStats[team]) {
        teamStats[team] = { uniqueCount: 0, totalSlots: 0, members: new Set() };
      }

      names.forEach(rawName => {
        const clean = rawName.trim().replace(/\s+/g, ' ');
        const key = clean.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!key) return;

        totalEnrollments++;
        teamStats[team].totalSlots++;
        teamStats[team].members.add(key);

        if (!studentMap.has(key)) {
          studentMap.set(key, {
            name: clean,
            teamName: team,
            events: [reg.eventName]
          });
        } else {
          const item = studentMap.get(key);
          if (!item.events.includes(reg.eventName)) {
            item.events.push(reg.eventName);
          }
        }
      });
    });

    Object.keys(teamStats).forEach(t => {
      teamStats[t].uniqueCount = teamStats[t].members.size;
      delete teamStats[t].members;
    });

    const uniqueList = Array.from(studentMap.values()).sort((a, b) => a.name.localeCompare(b.name));

    res.status(200).json({
      totalUnique: uniqueList.length,
      totalEnrollments,
      teamStats,
      data: uniqueList
    });
  } catch (error) {
    console.error('Error fetching unique registrations:', error);
    res.status(500).json({ error: 'Failed to fetch unique registrations' });
  }
});

// GET /registrations Endpoint (Protected)
router.get('/registrations', verifyAdmin, async (req, res) => {
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

app.use('/api', router);
app.use('/.netlify/functions/api', router);

module.exports = app;

if (require.main === module) {
  connectDB().then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
}
