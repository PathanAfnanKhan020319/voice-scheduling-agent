# Voice Scheduling Agent

**By Pathan Afnan Khan — AI Engineer | Data Scientist | Agentic AI Engineer**

A real-time AI voice assistant that understands natural-language scheduling requests and creates Google Calendar events through conversational interaction.

[Portfolio](https://pathan-afnan-khan.vercel.app/) · [Projects](https://pathan-afnan-khan.vercel.app/projects) · [GitHub Profile](https://github.com/PathanAfnanKhan020319) · [LinkedIn](https://www.linkedin.com/in/afnan-khan4/)

## What it does

- Handles real-time voice conversations through VAPI.ai.
- Uses an LLM to understand scheduling intent and meeting details.
- Parses natural-language date and time expressions.
- Confirms event details before creation.
- Creates calendar events through the Google Calendar API.
- Supports voice synthesis through ElevenLabs.
- Uses a Node.js / Express backend for webhooks and calendar orchestration.

## Architecture

```text
User Voice
   ↓
VAPI.ai
(STT + LLM + TTS)
   ↓
Express Backend
   ↓
Google Calendar API
```

## Tech stack

`Node.js` · `Express` · `VAPI.ai` · `OpenAI` · `ElevenLabs` · `Google Calendar API` · `OAuth 2.0`

## Typical conversation flow

```text
User asks to schedule a meeting
        ↓
Assistant captures name + date/time
        ↓
LLM resolves scheduling intent
        ↓
Assistant confirms details
        ↓
Backend calls Google Calendar API
        ↓
Calendar event is created
```

## Backend endpoints

- `GET /` — service status
- `POST /api/create-event` — create an event directly
- `POST /api/check-availability` — check calendar availability
- `POST /webhook/vapi` — handle VAPI function calls

## Local setup

```bash
git clone https://github.com/PathanAfnanKhan020319/voice-scheduling-agent.git
cd voice-scheduling-agent/backend
npm install
```

Create environment variables for Google Calendar OAuth and runtime configuration:

```env
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth/callback
GOOGLE_REFRESH_TOKEN=your_refresh_token_here
PORT=3000
TIMEZONE=Asia/Kolkata
```

Run the backend:

```bash
npm start
```

## Calendar integration

The backend authenticates with Google through OAuth 2.0 and creates events only after the assistant has collected and confirmed the required scheduling information.

Example event payload:

```json
{
  "attendeeName": "Jane Smith",
  "startDateTime": "2026-01-16T10:00:00+05:30",
  "summary": "Team Sync"
}
```

## Security notes

- Never commit OAuth credentials or refresh tokens.
- Store all secrets in environment variables.
- Use HTTPS in production.
- Validate webhook payloads and user-provided date/time data.
- Add rate limiting and authentication where appropriate.

## Future improvements

- Reschedule and cancel meetings.
- Multi-participant scheduling.
- Time-zone detection.
- Outlook / iCal integrations.
- Email or SMS confirmations.
- Meeting agendas and notes.

## Portfolio

Explore more Agentic AI, voice AI, LLM, RAG, and production AI work:

**https://pathan-afnan-khan.vercel.app/projects**

---

**Pathan Afnan Khan**  
AI Engineer · Data Scientist · Agentic AI Engineer  
GitHub: https://github.com/PathanAfnanKhan020319  
Portfolio: https://pathan-afnan-khan.vercel.app/
