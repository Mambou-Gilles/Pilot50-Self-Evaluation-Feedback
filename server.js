require('dotenv').config();

const express = require('express');
const cors = require('cors');

// ⚠️ This is the critical change for node-fetch ⚠️
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
app.use(cors());

// Serve static files from the 'public' directory
app.use(express.static('public'));

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

if (!GOOGLE_SCRIPT_URL) {
  console.error('GOOGLE_SCRIPT_URL is not set in environment variables!');
  process.exit(1);
}

app.get('/api/feedback', async (req, res) => {
  try {
    const cohort = req.query.cohort;
    const studentIdentifier = req.query.studentIdentifier;
    const week = req.query.week;

    if (!cohort || !studentIdentifier || !week) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }
    
    const url = `${GOOGLE_SCRIPT_URL}?cohort=${encodeURIComponent(cohort)}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    // The front-end will handle the filtering, as per your original script.
    // The backend simply serves the data.
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch data from the source.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  const serverUrl = `http://localhost:${PORT}`;
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access your application at: ${serverUrl}`);
});