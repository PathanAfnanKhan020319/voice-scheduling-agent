const { google } = require('googleapis');
const express = require('express');
require('dotenv').config();

const app = express();
const PORT = 3000;

// ===============================
// ENV CHECK
// ===============================
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('\n❌ Error: Missing required environment variables');
  console.error('Add these to backend/.env:\n');
  console.error('GOOGLE_CLIENT_ID=your_client_id_here');
  console.error('GOOGLE_CLIENT_SECRET=your_client_secret_here\n');
  process.exit(1);
}

// ===============================
// OAUTH CLIENT
// ===============================
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/oauth/callback'
);

// Scopes
const scopes = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];

// ===============================
// HOME PAGE
// ===============================
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Google Calendar OAuth Setup</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
        }
        .container {
          background: #f5f5f5;
          padding: 30px;
          border-radius: 10px;
        }
        .button {
          display: inline-block;
          padding: 15px 30px;
          background: #4285f4;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔐 Google Calendar OAuth Setup</h1>
        <ol>
          <li>Click authorize</li>
          <li>Login with Google</li>
          <li>Allow calendar access</li>
          <li>Copy refresh token</li>
        </ol>
        <a href="/auth" class="button">🚀 Start Authorization</a>
        <p><b>Client ID:</b> ${process.env.GOOGLE_CLIENT_ID.substring(0, 20)}...</p>
      </div>
    </body>
    </html>
  `);
});

// ===============================
// AUTH ROUTE
// ===============================
app.get('/auth', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
  });

  console.log('\n🔗 Redirecting to Google OAuth...');
  res.redirect(url);
});

// ===============================
// CALLBACK
// ===============================
app.get('/oauth/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.send(`<h2>❌ Authorization failed</h2><p>${error}</p>`);
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    console.log('\n✅ OAuth Success');
    console.log('Refresh Token:', tokens.refresh_token ? '✔ Present' : '✖ Missing');

    if (!tokens.refresh_token) {
      return res.send(`
        <h2>⚠️ No Refresh Token Received</h2>
        <p>Fix:</p>
        <ol>
          <li>Go to <a href="https://myaccount.google.com/permissions" target="_blank">Google Permissions</a></li>
          <li>Remove this app</li>
          <li>Run script again</li>
        </ol>
      `);
    }

    res.send(`
      <h2>✅ Authorization Successful</h2>
      <p><b>Copy this refresh token:</b></p>
      <pre style="background:#eee;padding:15px;">${tokens.refresh_token}</pre>
      <p>Add this to <code>.env</code>:</p>
      <pre>GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}</pre>
      <p>You can now stop this server (Ctrl + C).</p>
    `);

  } catch (err) {
    console.error(err);
    res.send('<h2>❌ Error exchanging code</h2>');
  }
});

// ===============================
// START SERVER
// ===============================
app.listen(PORT, () => {
  console.log('\n=========================================');
  console.log(' Google Calendar OAuth Setup Server');
  console.log('=========================================');
  console.log(`➡ Open browser manually: http://localhost:${PORT}`);
  console.log('=========================================\n');
});
