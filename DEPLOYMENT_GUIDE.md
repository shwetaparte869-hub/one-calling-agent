# 📞 Exotel AI Calling Agent - Complete Setup Guide

## 🎯 Overview
This guide will help you build a complete AI calling agent using Exotel that can:
- ✅ Send outbound calls
- ✅ Play custom greetings
- ✅ Record calls automatically
- ✅ Transcribe conversations
- ✅ Handle incoming calls

## 🛠️ Free Tools Used
1. **Exotel** - Cloud telephony platform (Free tier available)
2. **Render** - Free hosting for backend
3. **GitHub** - Code repository (Free)
4. **Exotel TTS** - Built-in text-to-speech (Free)
5. **Exotel Recording** - Built-in call recording (Free)

---

## 📋 Prerequisites
- Exotel account (Sign up at https://my.exotel.com)
- GitHub account
- Render account (Sign up at https://render.com)

---

## 🚀 Step 1: Exotel Account Setup

### 1.1 Create Exotel Account
1. Go to https://my.exotel.com
2. Sign up for a free account
3. Complete verification

### 1.2 Get API Credentials
1. Login to Exotel Dashboard
2. Go to **Settings → API Credentials**
3. Note down:
   - **Account SID**: `troikaplus1` (or your account SID)
   - **Subdomain**: `api` (from `api.exotel.com`)
   - **API KEY (Username)**: Copy from "Default API key"
   - **API TOKEN (Password)**: Click eye icon to reveal and copy

### 1.3 Get Virtual Number
1. Go to **Numbers → Buy Number**
2. Select a number (or use existing)
3. Note the number (e.g., `07948516111`)

---

## 🎨 Step 2: Frontend Setup

### 2.1 Frontend Structure
```
frontend/
  └── index.html  (Already created)
```

### 2.2 Features
- ✅ Modern, responsive UI
- ✅ Make calls with custom greeting
- ✅ View call history
- ✅ Real-time status updates

---

## ⚙️ Step 3: Backend Configuration

### 3.1 Environment Variables (Render)
Go to Render Dashboard → Your Service → Environment → Add:

```
EXOTEL_ACCOUNT_SID=troikaplus1
EXOTEL_SUBDOMAIN=api
EXOTEL_SID=<your-api-key-username>
EXOTEL_TOKEN=<your-api-token-password>
EXOTEL_APP_ID=1117620
EXOTEL_FROM=07948516111
PORT=10000
```

### 3.2 Backend Endpoints
- `POST /exotel/call` - Make outbound call
- `POST /exotel/incoming` - Receive call webhooks
- `POST /exotel/voice-flow` - Voice flow handler (greeting + recording)
- `POST /exotel/recording-callback` - Recording completion
- `POST /exotel/recording-status` - Recording status updates
- `POST /exotel/transcription-callback` - Transcription updates
- `GET /` - Frontend UI

---

## 📞 Step 4: Exotel Voice Flow Configuration

### 4.1 Create Voice Flow in Exotel Dashboard

1. **Login to Exotel Dashboard**
   - Go to https://my.exotel.com
   - Navigate to **Flows → Create Flow**

2. **Configure Voice Flow**
   - **Flow Name**: "AI Calling Agent"
   - **Flow Type**: Voice

3. **Add Voicebot Applet**
   - Drag "Voicebot" applet to flow
   - **Webhook URL**: `https://one-calling-agent.onrender.com/exotel/voice-flow`
   - **Record this?**: ✅ Checked
   - **Recording Channels**: Dual
   - **Save** the flow

4. **Get Flow ID**
   - Note the Flow ID (e.g., `1117620`)
   - This is your `EXOTEL_APP_ID`

### 4.2 Configure Number
1. Go to **Numbers → Your Number**
2. Set **Incoming Call Flow** to your created flow
3. Save changes

---

## 🚀 Step 5: Deploy to Render

### 5.1 Connect GitHub Repository
1. Go to https://render.com
2. Click **New → Web Service**
3. Connect your GitHub repository
4. Select repository: `one-calling-agent`

### 5.2 Configure Service
- **Name**: `one-calling-agent`
- **Environment**: Node
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`
- **Root Directory**: Leave empty

### 5.3 Add Environment Variables
Add all variables from Step 3.1

### 5.4 Deploy
1. Click **Create Web Service**
2. Wait for deployment (2-3 minutes)
3. Note your URL: `https://one-calling-agent.onrender.com`

---

## 🧪 Step 6: Testing

### 6.1 Test Outbound Call
1. Open your deployed URL
2. Enter phone number: `9324606985`
3. Enter greeting (optional)
4. Click **Make Call**
5. You should receive the call!

### 6.2 Test Incoming Call
1. Call your Exotel number: `07948516111`
2. You should hear the greeting
3. Speak something (it will be recorded)
4. Call ends automatically

### 6.3 Check Logs
- Render Dashboard → Logs
- You should see:
  - Call initiation logs
  - Voice flow triggers
  - Recording callbacks
  - Transcription updates

---

## 📝 Step 7: How It Works

### 7.1 Outbound Call Flow
```
User → Frontend → Backend API → Exotel API → Phone Call
```

### 7.2 Incoming Call Flow
```
Phone Call → Exotel → Voice Flow → Backend Webhook → 
  → TwiML Response (Greeting) → 
  → Recording Starts → 
  → Transcription → 
  → Call Ends
```

### 7.3 Components
1. **Frontend**: User interface for making calls
2. **Backend API**: Handles Exotel API calls
3. **Voice Flow Webhook**: Returns TwiML for greeting/recording
4. **Recording Callbacks**: Stores recording URLs
5. **Transcription**: Converts speech to text

---

## 🎯 Step 8: Customization

### 8.1 Change Greeting
Edit `backend/index.js` → `voice-flow` endpoint:
```javascript
const greetingText = req.body.greeting || 'Your custom greeting here';
```

### 8.2 Add AI Integration
In `voice-flow` endpoint, you can:
- Call AI API (OpenAI, etc.)
- Process user speech
- Generate dynamic responses
- Use WebSocket for real-time AI

### 8.3 Store Recordings
In `recording-callback` endpoint:
```javascript
// Save to database
await saveRecording({
  callSid: CallSid,
  recordingUrl: RecordingUrl,
  duration: RecordingDuration
});
```

---

## 🔧 Troubleshooting

### Issue: 401 Unauthorized
**Solution**: 
- Check API KEY and TOKEN in Render environment variables
- Ensure no extra spaces
- Regenerate token in Exotel dashboard

### Issue: Call not connecting
**Solution**:
- Verify Exotel number is active
- Check number format (+91 prefix)
- Verify App ID is correct

### Issue: Greeting not playing
**Solution**:
- Check voice flow webhook URL in Exotel dashboard
- Verify TwiML format
- Check Render logs for errors

### Issue: Recording not working
**Solution**:
- Enable recording in voice flow
- Check recording callback URL
- Verify Exotel account has recording enabled

---

## 📊 Monitoring

### Render Logs
- Real-time logs in Render Dashboard
- Check for errors and call status

### Exotel Dashboard
- View call logs
- Check call quality
- View recordings

### Frontend
- Call history stored in browser localStorage
- View recent calls and status

---

## 🎉 Success Checklist

- [ ] Exotel account created
- [ ] API credentials configured
- [ ] Virtual number obtained
- [ ] Voice flow created in Exotel
- [ ] Backend deployed to Render
- [ ] Environment variables set
- [ ] Frontend accessible
- [ ] Outbound call tested
- [ ] Incoming call tested
- [ ] Recording working
- [ ] Greeting playing

---

## 📚 Additional Resources

- **Exotel API Docs**: https://developer.exotel.com
- **TwiML Reference**: https://www.twilio.com/docs/voice/twiml
- **Render Docs**: https://render.com/docs

---

## 🆘 Support

If you face any issues:
1. Check Render logs
2. Check Exotel dashboard
3. Verify environment variables
4. Test API endpoints manually

---

## 🚀 Next Steps

1. **Add AI Integration**: Connect OpenAI/Claude for intelligent responses
2. **Database**: Store calls, recordings, transcriptions
3. **Analytics**: Track call metrics
4. **Multi-language**: Support multiple languages
5. **SMS Integration**: Send SMS after calls

---

**Happy Calling! 📞✨**

