// Tiny backend for GitHub OAuth exchange
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Set these in a .env file or environment variables
const CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'YOUR_CLIENT_ID';
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || 'YOUR_CLIENT_SECRET';

// Step 1: Redirect user to GitHub OAuth (handled by frontend)
// Step 2: GitHub redirects back with ?code=...
// Step 3: Frontend POSTs code to /auth/github/callback
app.post('/auth/github/callback', async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Missing code' });
  try {
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      },
      { headers: { Accept: 'application/json' } }
    );
    if (tokenRes.data.error) {
      return res.status(400).json({ error: tokenRes.data.error_description });
    }
    res.json({ access_token: tokenRes.data.access_token });
  } catch (err) {
    res.status(500).json({ error: 'OAuth exchange failed', details: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`OAuth backend listening on port ${PORT}`);
});
