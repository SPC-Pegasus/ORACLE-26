# The Oracle (Protocol 3000)

A comprehensive cyberpunk-themed Full-Stack web application built for managing and presenting the Protocol 3000 events. The platform features an automated ranking system, dynamic PDF exports, and an immersive neon aesthetic.

## Features
- **Immersive Cyberpunk UI**: Built with HTML, CSS, and interactive JavaScript canvases.
- **Dynamic Leaderboard**: Teams are ranked automatically based on total points.
- **Data Entry Portal**: Admin interface for updating team scores directly to MongoDB.
- **PDF Generation**: Generates master score sheets and event-specific reports natively in the browser.
- **Full-Stack Architecture**: An Express.js backend serving both the REST API and the static frontend.

## Tech Stack
- **Frontend**: HTML5, Vanilla CSS, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **PDF Generation**: jsPDF, jsPDF-AutoTable

## Project Structure
```text
├── public/                 # All frontend static assets
│   ├── css/                # Stylesheets
│   ├── js/                 # Client-side scripts
│   ├── assets/             # Images and fonts
│   └── *.html              # Webpages
├── models/                 # Mongoose schemas (e.g., Team.js)
├── server.js               # Express application entry point
├── package.json            # Node dependencies
└── .env                    # Environment variables (Ignored in Git)
```

## Local Development

### 1. Install Dependencies
Make sure you have [Node.js](https://nodejs.org/) installed, then run:
```bash
npm install
```

### 2. Set up Environment Variables
Create a `.env` file in the root directory and add your MongoDB connection URI:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
```

### 3. Run the Server
```bash
node server.js
```
The server will start on port 5000, and the entire app will be served. Simply navigate to:
**http://localhost:5000**
