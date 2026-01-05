# Voice Scheduling Agent

A real-time AI voice assistant that schedules meetings through natural conversation and creates actual Google Calendar events.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://claude.ai/chat/LICENSE)
[![VAPI](https://img.shields.io/badge/Powered%20by-VAPI.ai-purple.svg)](https://vapi.ai/)

---

## Live Demo

  **Deployed Agent URL** : `https://vapi.ai/call/your-assistant-id`

  **Demo Video** : [Watch on Loom](https://claude.ai/chat/your-loom-link-here)

### How to Test:

1. Click the deployed URL above
2. Allow microphone access when prompted
3. Have a natural conversation with the assistant:
   * Tell it your name
   * Specify date/time (e.g., "Tomorrow at 2 PM" or "January 15th at 3pm")
   * Optionally provide a meeting title
4. Confirm the details when asked
5. Check your Google Calendar for the created event!

**Example conversation:**

```
Assistant: "Hi! I'm your scheduling assistant. May I have your name?"
You: "My name is Pathan"
Assistant: "Great to meet you, Pathan! When would you like to schedule the meeting?"
You: "Tomorrow at 3 PM"
Assistant: "Perfect! Would you like to give this meeting a title?"
You: "Yes, call it Project Review"
Assistant: "Excellent! Let me confirm: Meeting with Pathan tomorrow at 3 PM titled 'Project Review'. Is that correct?"
You: "Yes, that's correct"
Assistant: "Perfect! I've created your calendar event. You should receive a confirmation shortly."
```

---

## Features

*  **Real-time voice conversation** using VAPI.ai
* **Natural language understanding** powered by GPT-4
* **Flexible date/time parsing** ("tomorrow", "next Monday", "January 15th at 2pm")
* **Google Calendar integration** - creates actual events
* **Event confirmation** - always confirms before creating
* **Professional voice synthesis** using ElevenLabs
* **Fully deployed** and accessible via web link
* **Error handling** and validation
* **Automatic reminders** set for created events

---

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────────┐
│   User      │ ◄─────► │   VAPI.ai    │ ◄─────► │ Express Backend │
│  (Voice)    │  Voice  │ (STT + LLM   │  HTTPS  │   (Node.js)     │
│             │         │  + TTS)      │         │                 │
└─────────────┘         └──────────────┘         └─────────────────┘
                                                           │
                                                           │ OAuth 2.0
                                                           ▼
                                                  ┌─────────────────┐
                                                  │ Google Calendar │
                                                  │      API        │
                                                  └─────────────────┘
```

### Tech Stack:

* **Voice Platform** : VAPI.ai (handles STT, TTS, and real-time audio)
* **LLM** : OpenAI GPT-4 (conversation management)
* **Voice** : ElevenLabs (natural voice synthesis)
* **Backend** : Node.js + Express (webhook server)
* **Calendar** : Google Calendar API (event creation)
* **Deployment** : Railway.app (backend) + VAPI.ai (voice)

---

## Installation & Local Setup

### Prerequisites:

* Node.js 18+ installed
* Google Cloud account (free tier works)
* VAPI.ai account (free trial available)
* OpenAI API key (for GPT-4)

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/voice-scheduling-agent.git
cd voice-scheduling-agent/backend
npm install
```

### Step 2: Set Up Google Calendar API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: "Voice Scheduling Agent"
3. Enable Google Calendar API:
   * Navigate to "APIs & Services" → "Library"
   * Search for "Google Calendar API"
   * Click "Enable"
4. Create OAuth 2.0 credentials:
   * Go to "APIs & Services" → "Credentials"
   * Click "Create Credentials" → "OAuth 2.0 Client ID"
   * Application type: "Web application"
   * Name: "Voice Scheduling Agent"
   * Authorized redirect URIs: `http://localhost:3000/oauth/callback`
   * Click "Create"
5. Download credentials (client ID and secret)

### Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Edit `.env` with your credentials:

```env
# Google Calendar
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth/callback
GOOGLE_REFRESH_TOKEN=  # Leave empty for now

# Server
PORT=3000
TIMEZONE=Asia/Kolkata
```

### Step 4: Get Google Refresh Token

Run the OAuth authorization flow:

```bash
npm run auth
```

This will:

1. Start a local server on port 3000
2. Open your browser automatically
3. Ask you to sign in with Google
4. Request calendar permissions
5. Display your refresh token

**Copy the refresh token** and add it to your `.env` file:

```env
GOOGLE_REFRESH_TOKEN=your_refresh_token_here
```

### Step 5: Run Backend Locally

```bash
npm start
```

You should see:

```
╔════════════════════════════════════════════════╗
║   Voice Scheduling Agent - Backend Server     ║
╚════════════════════════════════════════════════╝

🚀 Server running on port 3000
📅 Calendar integration: ✓ Configured
🔗 Local URL: http://localhost:3000
🔗 Webhook URL: http://localhost:3000/webhook/vapi
```

### Step 6: Test Backend API

Open a new terminal and run:

```bash
npm test
```

This runs the test suite and verifies:

*  Health check endpoint
* Calendar event creation
* Input validation
* Availability checking
* VAPI webhook handling

### Step 7: Set Up VAPI Assistant

1. Login to [VAPI Dashboard](https://dashboard.vapi.ai/)
2. Click "Create Assistant"
3. Configure the assistant:
   * **Name** : Voice Scheduling Agent
   * **Model** : OpenAI GPT-4
   * **Voice** : ElevenLabs → Rachel (or your preference)
   * **First Message** : "Hi! I'm your scheduling assistant. I'm here to help you book a meeting. To get started, may I have your name?"
4. Add the system prompt (from `config/vapi-assistant-config.json`):
   ```
   You are a friendly and professional scheduling assistant...
   [Copy the full system prompt from the config file]
   ```
5. Add Function:
   * Click "Add Function"
   * **Function Name** : `createCalendarEvent`
   * **Description** : "Creates a Google Calendar event with the provided details"
   * **Parameters** : (Use the JSON schema from config file)
   * **Webhook URL** : `http://localhost:3000/webhook/vapi` (for testing)
6. Save and test in VAPI playground

---

## Deployment

### Deploy Backend to Railway

1. **Push to GitHub** (if not already done):

```bash
git init
git add .
git commit -m "Initial commit: Voice Scheduling Agent"
git branch -M main
git remote add origin https://github.com/yourusername/voice-scheduling-agent.git
git push -u origin main
```

2. **Deploy to Railway** :

* Go to [Railway.app](https://railway.app/)
* Click "New Project"
* Select "Deploy from GitHub repo"
* Choose your repository
* Railway will auto-detect Node.js

2. **Add Environment Variables** :

* In Railway dashboard, go to "Variables"
* Add all variables from your `.env` file:
  * `GOOGLE_CLIENT_ID`
  * `GOOGLE_CLIENT_SECRET`
  * `GOOGLE_REDIRECT_URI` (update to Railway URL)
  * `GOOGLE_REFRESH_TOKEN`
  * `PORT` (Railway sets this automatically)
  * `TIMEZONE`

2. **Deploy** :

* Railway will automatically deploy
* Get your deployment URL (e.g., `https://your-app.railway.app`)

2. **Test Deployment** :

```bash
curl https://your-app.railway.app/health
```

### Update VAPI Configuration

1. Go back to VAPI Dashboard
2. Edit your assistant
3. Update the function webhook URL to your Railway deployment:
   ```
   https://your-app.railway.app/webhook/vapi
   ```
4. Save changes
5. Get your VAPI assistant public URL

---

## How It Works: Calendar Integration

### Flow Diagram:

```
1. User speaks → "I want to schedule a meeting"
         ↓
2. VAPI captures audio → Converts to text (STT)
         ↓
3. GPT-4 processes → Understands intent
         ↓
4. Assistant asks → "What's your name?"
         ↓
5. User responds → "Pathan"
         ↓
6. Assistant asks → "When would you like to meet?"
         ↓
7. User responds → "Tomorrow at 3 PM"
         ↓
8. Assistant confirms → "Meeting tomorrow at 3 PM?"
         ↓
9. User confirms → "Yes"
         ↓
10. VAPI calls function → createCalendarEvent
         ↓
11. Webhook → Express backend receives request
         ↓
12. Backend → Authenticates with Google (OAuth)
         ↓
13. Google Calendar API → Creates event
         ↓
14. Response → Backend sends success/failure
         ↓
15. VAPI → Assistant announces result
         ↓
16. User hears → "Event created successfully!"
```

### Technical Details:

**Date/Time Parsing:**

* GPT-4 converts natural language to ISO 8601 format
* Examples:
  * "tomorrow at 3pm" → `2026-01-06T15:00:00+05:30`
  * "next Monday at 10am" → `2026-01-12T10:00:00+05:30`
  * "January 20th at 2:30pm" → `2026-01-20T14:30:00+05:30`

**Calendar Event Details:**

* **Duration** : 1 hour (default) or custom
* **Timezone** : Asia/Kolkata (configurable in `.env`)
* **Reminders** :
* Email reminder: 24 hours before
* Popup reminder: 30 minutes before
* **Calendar** : Primary Google Calendar
* **Color** : Blue (#9)

**Authentication:**

* Uses OAuth 2.0 with refresh token
* Refresh token stored securely in environment variables
* Access token auto-refreshed by Google API client

---

## Screenshots & Demo

### 1. Conversation in Progress

![Voice Conversation](https://claude.ai/chat/docs/screenshots/conversation.png)
*Natural voice conversation with the assistant*

### 2. Calendar Event Created

![Google Calendar Event](https://claude.ai/chat/docs/screenshots/calendar-event.png)
*Event appears in Google Calendar immediately*

### 3. Backend Logs

![Server Logs](https://claude.ai/chat/docs/screenshots/server-logs.png)
*Real-time webhook processing logs*

### 4. VAPI Dashboard

![VAPI Configuration](https://claude.ai/chat/docs/screenshots/vapi-dashboard.png)
*Assistant configuration in VAPI*

---

## API Documentation

### Endpoints

#### Health Check

```http
GET /
```

Response:

```json
{
  "status": "Voice Scheduling Agent API is running",
  "version": "1.0.0",
  "endpoints": {
    "webhook": "/webhook/vapi",
    "createEvent": "/api/create-event",
    "checkAvailability": "/api/check-availability"
  }
}
```

#### Create Calendar Event (Direct)

```http
POST /api/create-event
Content-Type: application/json

{
  "attendeeName": "John Doe",
  "startDateTime": "2026-01-15T14:00:00+05:30",
  "summary": "Project Meeting"
}
```

Response:

```json
{
  "success": true,
  "eventId": "abc123xyz",
  "eventLink": "https://calendar.google.com/...",
  "summary": "Project Meeting",
  "startTime": "2026-01-15T14:00:00+05:30"
}
```

#### Check Availability

```http
POST /api/check-availability
Content-Type: application/json

{
  "startDateTime": "2026-01-15T14:00:00+05:30",
  "endDateTime": "2026-01-15T15:00:00+05:30"
}
```

Response:

```json
{
  "available": true,
  "startDateTime": "2026-01-15T14:00:00+05:30",
  "endDateTime": "2026-01-15T15:00:00+05:30"
}
```

#### VAPI Webhook

```http
POST /webhook/vapi
Content-Type: application/json

{
  "message": {
    "type": "function-call",
    "functionCall": {
      "name": "createCalendarEvent",
      "parameters": {
        "attendeeName": "Jane Smith",
        "startDateTime": "2026-01-16T10:00:00+05:30",
        "summary": "Team Sync"
      }
    }
  },
  "call": {
    "id": "call_123"
  }
}
```

---

## Troubleshooting

### Issue: "Calendar events not creating"

**Possible causes:**

1. Google Calendar API not enabled
2. Invalid refresh token
3. Incorrect credentials

**Solutions:**

```bash
# Check if server is running
curl http://localhost:3000/health

# Verify credentials are in .env
cat .env | grep GOOGLE

# Re-run OAuth flow
npm run auth

# Test calendar API directly
npm test
```

### Issue: "VAPI webhook not responding"

**Check:**

1. Backend is deployed and accessible
2. Webhook URL in VAPI matches deployment URL
3. Function name matches exactly: `createCalendarEvent`

**Debug:**

```bash
# Check Railway logs
railway logs

# Test webhook locally
curl -X POST http://localhost:3000/webhook/vapi \
  -H "Content-Type: application/json" \
  -d '{"message":{"type":"function-call"}}'
```

### Issue: "Date parsing errors"

**Tips:**

* Be specific: "tomorrow at 2 PM" not just "tomorrow"
* Use clear time format: "3:30 PM" or "15:30"
* Specify date fully if not using relative terms

### Issue: "Authentication failures"

**Solutions:**

1. Revoke access: https://myaccount.google.com/permissions
2. Re-run: `npm run auth`
3. Check token expiry in logs

---

## Security Best Practices

*  Never commit `.env` file to Git
* Use environment variables for all secrets
* Refresh token stored securely
* HTTPS only in production
* Input validation on all endpoints
* Rate limiting recommended for production

---

## Configuration Options

### Change Timezone

Edit `.env`:

```env
TIMEZONE=America/New_York
```

### Change Voice

In VAPI dashboard:

* Voice Provider: ElevenLabs, Play.ai, or Deepgram
* Voice ID: Browse available voices

### Change LLM

In VAPI dashboard:

* Model: GPT-4, GPT-3.5-turbo, Claude, etc.
* Temperature: 0.7 (default)

### Customize Event Duration

Edit `calendar.js` line 55:

```javascript
const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour
// Change to: 30 * 60 * 1000 for 30 minutes
```

---

## Future Enhancements

Potential features to add:

* [ ] Reschedule existing meetings
* [ ] Cancel meetings
* [ ] List upcoming meetings
* [ ] Multi-participant scheduling
* [ ] Time zone detection
* [ ] SMS/Email confirmation
* [ ] Integration with other calendars (Outlook, iCal)
* [ ] Meeting notes/agenda

---

## License

Created for Assignment purpose

---

## Author

**Pathan Afnan Khan**

* GitHub: [@](https://github.com/yourusername)Afnan0145
* Email: afnankhan67445@gmail.com

---

## Acknowledgments

* [VAPI.ai](https://vapi.ai/) for voice infrastructure
* [OpenAI](https://openai.com/) for GPT-4
* [Google Calendar API](https://developers.google.com/calendar)
* [ElevenLabs](https://elevenlabs.io/) for voice synthesis
* [Railway.app](https://railway.app/) for hosting

---

## Support

If you encounter any issues:

1. Check the [Troubleshooting](https://claude.ai/chat/7ac52588-4c70-42c1-a624-98d175fae89a#-troubleshooting) section
2. Review logs: `railway logs` or `npm start`
3. Open an issue on GitHub
4. Contact: afnankhan67445@gmail.com

---

**Built for Vikara.ai AI Engineer - Agentic Systems Assignment**

*Submission Date: January 5, 2026*

---

## Star This Repo

If you found this helpful, please give it a star! ⭐
