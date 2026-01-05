# Deployment Guide - Voice Scheduling Agent

Complete step-by-step guide to deploy your Voice Scheduling Agent to production.

---

## Pre-Deployment Checklist

Before deploying, ensure you have:

* [ ] Local development working (tested with `npm test`)
* [ ] Google Calendar API configured
* [ ] Refresh token obtained
* [ ] GitHub repository created
* [ ] All environment variables documented
* [ ] Code committed to GitHub

---

## Deployment Option 1: Railway.app (Recommended)

### Why Railway?

* Free tier available
* Automatic deployments from GitHub
* Easy environment variable management
* Built-in domain with HTTPS
* Simple logging and monitoring

### Step-by-Step Deployment:

#### 1. Prepare Your Code

```bash
# Ensure all changes are committed
git status
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 2. Sign Up for Railway

1. Go to [Railway.app](https://railway.app/)
2. Click "Start a New Project"
3. Sign up with GitHub (recommended)

#### 3. Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Authorize Railway to access your GitHub
4. Select your repository: `voice-scheduling-agent`

#### 4. Configure Build Settings

Railway should auto-detect Node.js, but verify:

* **Build Command** : (leave default, uses `npm install`)
* **Start Command** : `npm start`
* **Root Directory** : `/backend` (if your backend is in a subfolder)

#### 5. Add Environment Variables

In Railway dashboard:

1. Go to your project
2. Click "Variables" tab
3. Add each variable:

```env
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=https://your-app.railway.app/oauth/callback
GOOGLE_REFRESH_TOKEN=your_refresh_token_here
TIMEZONE=Asia/Kolkata
NODE_ENV=production
```

 **Important Notes:**

* Railway automatically sets `PORT` - don't override it
* Update `GOOGLE_REDIRECT_URI` after deployment
* Never commit these to Git!

#### 6. Deploy

1. Railway will automatically deploy on push
2. Wait for build to complete (2-3 minutes)
3. Check logs for any errors

#### 7. Get Your Deployment URL

1. In Railway dashboard, find your app
2. Click "Settings" → "Domains"
3. Copy the generated URL (e.g., `https://your-app.railway.app`)

#### 8. Update Google OAuth Redirect URI

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your project
3. Go to "Credentials"
4. Edit your OAuth 2.0 Client ID
5. Add authorized redirect URI:
   ```
   https://your-app.railway.app/oauth/callback
   ```
6. Save

#### 9. Test Deployment

```bash
# Health check
curl https://your-app.railway.app/health

# Should return:
# {"status":"healthy","uptime":...}
```

#### 10. View Logs

In Railway dashboard:

* Click "Deployments"
* Click on latest deployment
* View real-time logs

---

## Deployment Option 2: Render.com

### Step-by-Step:

#### 1. Sign Up

1. Go to [Render.com](https://render.com/)
2. Sign up with GitHub

#### 2. Create New Web Service

1. Click "New +"
2. Select "Web Service"
3. Connect your GitHub repository

#### 3. Configure Service

* **Name** : `voice-scheduling-agent`
* **Environment** : `Node`
* **Build Command** : `npm install`
* **Start Command** : `npm start`
* **Plan** : Free

#### 4. Add Environment Variables

Click "Environment" → Add variables:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://your-app.onrender.com/oauth/callback
GOOGLE_REFRESH_TOKEN=...
TIMEZONE=Asia/Kolkata
```

#### 5. Deploy

* Click "Create Web Service"
* Wait for deployment (5-10 minutes on free tier)
* Get your URL: `https://your-app.onrender.com`

## Deployment Option 3: Heroku

### Step-by-Step:

#### 1. Install Heroku CLI

```bash
# macOS
brew install heroku/brew/heroku

# Windows
# Download from: https://devcenter.heroku.com/articles/heroku-cli
```

#### 2. Login

```bash
heroku login
```

#### 3. Create App

```bash
cd backend
heroku create voice-scheduling-agent-YOUR-NAME
```

#### 4. Set Environment Variables

```bash
heroku config:set GOOGLE_CLIENT_ID=your_client_id
heroku config:set GOOGLE_CLIENT_SECRET=your_secret
heroku config:set GOOGLE_REFRESH_TOKEN=your_token
heroku config:set TIMEZONE=Asia/Kolkata
```

#### 5. Deploy

```bash
git push heroku main
```

#### 6. Open App

```bash
heroku open
heroku logs --tail
```

---

## VAPI Configuration for Production

Once backend is deployed:

### 1. Update VAPI Webhook URL

1. Login to [VAPI Dashboard](https://dashboard.vapi.ai/)
2. Go to your assistant
3. Click "Edit"
4. Find the `createCalendarEvent` function
5. Update webhook URL:
   ```
   https://your-app.railway.app/webhook/vapi
   ```
6. Save changes

### 2. Test VAPI Assistant

1. In VAPI dashboard, click "Test"
2. Allow microphone access
3. Have a test conversation:
   * Say your name
   * Provide a date/time
   * Confirm details
4. Check if event was created in Google Calendar

### 3. Get Public URL

1. In VAPI dashboard, go to your assistant
2. Find the "Public Link" or "Share" option
3. Copy the URL (e.g., `https://vapi.ai/call/abc123`)
4. This is your deployed agent URL!

---

## Post-Deployment Testing

### Automated Tests

```bash
# Set API_URL to your deployed URL
export API_URL=https://your-app.railway.app
npm test
```

### Manual Testing

#### Test 1: Health Check

```bash
curl https://your-app.railway.app/health
```

Expected: `{"status":"healthy",...}`

#### Test 2: Create Event

```bash
curl -X POST https://your-app.railway.app/api/create-event \
  -H "Content-Type: application/json" \
  -d '{
    "attendeeName": "Test User",
    "startDateTime": "2026-01-10T14:00:00+05:30",
    "summary": "Deployment Test"
  }'
```

Expected: `{"success":true,"eventId":"...","eventLink":"..."}`

#### Test 3: VAPI Integration

1. Call your VAPI public URL
2. Complete a full conversation
3. Verify event in Google Calendar

---

## Monitoring & Logs

### Railway Logs

```bash
# View in dashboard or use CLI
railway logs
```

### Render Logs

```bash
# In dashboard: Logs tab
# Real-time logs available
```

### Heroku Logs

```bash
heroku logs --tail
```

### Set Up Alerts (Optional)

1. **Railway** : Dashboard → Notifications
2. **Render** : Dashboard → Notifications
3. **Heroku** : Add-ons → Papertrail

---

## Security in Production

### Environment Variables

 **Do:**

* Store all secrets in environment variables
* Use strong, unique values
* Rotate tokens periodically
* Never commit `.env` to Git

 **Don't:**

* Hardcode credentials
* Share refresh tokens
* Commit secrets to repository

### HTTPS

All deployment platforms provide HTTPS by default:

* Railway:  Free SSL
* Render:  Free SSL
* Heroku:  Free SSL

### Rate Limiting (Recommended)

Add to `server.js`:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
app.use('/webhook/', limiter);
```

Install:

```bash
npm install express-rate-limit
```

---

## Common Deployment Issues

### Issue: "Application Error" or Crash

**Check logs:**

```bash
railway logs
# or
heroku logs --tail
```

**Common causes:**

* Missing environment variables
* Port binding issues
* Module not found

**Solution:**

```bash
# Verify all env vars are set
railway variables
# or
heroku config
```

### Issue: "Cannot reach webhook"

**Checklist:**

* [ ] Backend is deployed and running
* [ ] Health check returns 200 OK
* [ ] VAPI webhook URL is correct
* [ ] No trailing slashes in URL
* [ ] HTTPS (not HTTP)

**Test webhook:**

```bash
curl -X POST https://your-app.railway.app/webhook/vapi \
  -H "Content-Type: application/json" \
  -d '{"message":{"type":"test"}}'
```

### Issue: "Google Calendar API errors"

**Possible causes:**

1. Invalid refresh token
2. API not enabled
3. Wrong credentials

**Solution:**

1. Re-run `npm run auth` locally
2. Copy new refresh token
3. Update in deployment env vars
4. Redeploy

---

## Scaling Considerations

### Free Tier Limitations:

**Railway:**

* 500 hours/month
* Sleeps after 30 min inactivity
* 100 GB bandwidth

**Render:**

* Sleeps after 15 min inactivity
* Slow cold starts
* 750 hours/month

**Heroku:**

* Sleeps after 30 min inactivity
* 550 hours/month (free dyno)

### To Prevent Sleep:

Add a keep-alive ping:

```javascript
// In server.js
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    axios.get(`${process.env.BASE_URL}/health`)
      .catch(err => console.log('Ping failed:', err.message));
  }, 14 * 60 * 1000); // Every 14 minutes
}
```

---

## Deployment Complete!

### Final Checklist:

* [ ] Backend deployed successfully
* [ ] Health check returns 200 OK
* [ ] Environment variables set correctly
* [ ] Google Calendar events creating successfully
* [ ] VAPI webhook configured
* [ ] VAPI assistant tested end-to-end
* [ ] Public VAPI URL working
* [ ] Logs show no errors
* [ ] Demo video recorded
* [ ] README updated with URLs

### Next Steps:

1. **Record demo video** showing full conversation
2. **Update README** with deployed URLs
3. **Take screenshots** of:
   * VAPI conversation
   * Created calendar event
   * Backend logs
4. **Submit assignment** with:
   * GitHub repository URL
   * Deployed VAPI agent URL
   * Demo video link

---

## Need Help?

Common resources:

* Railway Docs: https://docs.railway.app/
* Render Docs: https://render.com/docs
* VAPI Docs: https://docs.vapi.ai/
* Google Calendar API: https://developers.google.com/calendar

---

Created by Pathan Afnan Khanf
