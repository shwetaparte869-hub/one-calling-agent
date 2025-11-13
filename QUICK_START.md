# 🚀 Quick Start Guide - ElevenLabs Integration

## Step 1: Get Your ElevenLabs API Key

1. Visit [ElevenLabs](https://elevenlabs.io/)
2. Sign up or log in
3. Go to Profile → API Keys
4. Copy your API key

## Step 2: Configure the API Key

Open `backend/.env` and add your key:

```bash
ELEVENLABS_API_KEY=your_actual_api_key_here
```

## Step 3: Start the Server

```bash
cd backend
npm start
```

You should see:
```
🚀 Server running on port 5000
📡 WebSocket endpoint: wss://one-calling-agent.onrender.com/voice-stream
```

## Step 4: Test the Integration

### Option A: Using the Test Script
```bash
cd backend
node test-greeting.js
```

### Option B: Using cURL

**Generate a greeting:**
```bash
curl -X POST http://localhost:5000/greeting/generate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello! Welcome to our service.",
    "name": "Test Greeting"
  }'
```

**List all greetings:**
```bash
curl http://localhost:5000/greeting/list
```

### Option C: Using the Example Script
```bash
cd backend
node example-usage.js
```

## Step 5: Generate Your First Greeting

### English Greeting
```bash
curl -X POST http://localhost:5000/greeting/generate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello! Thank you for calling. How can I help you today?",
    "name": "English Welcome"
  }'
```

### Hindi Greeting
```bash
curl -X POST http://localhost:5000/greeting/generate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "नमस्ते! हमारी सेवा में आपका स्वागत है। मैं आपकी कैसे मदद कर सकता हूं?",
    "name": "Hindi Welcome"
  }'
```

## Step 6: Access Your Greeting

After generating, you'll get a response like:
```json
{
  "success": true,
  "greeting": {
    "id": "1699876543210",
    "url": "http://localhost:5000/greeting/audio/greeting_1699876543210.mp3",
    "filename": "greeting_1699876543210.mp3"
  }
}
```

**Play the greeting:**
- Open the URL in your browser
- Or download it: `curl -O http://localhost:5000/greeting/audio/greeting_1699876543210.mp3`

## 🎯 Common Use Cases

### 1. Welcome Message
```javascript
{
  "text": "Welcome to our company. Please hold while we connect you to an agent.",
  "name": "Welcome Message"
}
```

### 2. After Hours Message
```javascript
{
  "text": "Thank you for calling. Our office is currently closed. Please call back during business hours.",
  "name": "After Hours"
}
```

### 3. IVR Menu
```javascript
{
  "text": "Press 1 for sales, Press 2 for support, Press 3 for billing.",
  "name": "IVR Menu"
}
```

### 4. Appointment Reminder
```javascript
{
  "text": "This is a reminder about your appointment tomorrow at 10 AM. Please call to confirm.",
  "name": "Appointment Reminder"
}
```

## 🎙️ Voice Options

Change the voice by adding `voiceId`:

**Female Voice (Rachel - Default):**
```json
{
  "text": "Hello!",
  "voiceId": "21m00Tcm4TlvDq8ikWAM"
}
```

**Male Voice (Adam):**
```json
{
  "text": "Hello!",
  "voiceId": "pNInz6obpgDQGcFmaJgB"
}
```

## 📱 Integration with Exotel

To use the greeting in an Exotel call:

1. Generate the greeting and get the URL
2. In Exotel Dashboard, create an App/Flow
3. Add a "Play" action with your greeting URL
4. Use the App in your call flow

## ✅ Verification Checklist

- [ ] ElevenLabs API key added to `.env`
- [ ] Server started successfully
- [ ] Test greeting generated
- [ ] Audio file accessible via URL
- [ ] Greeting plays correctly

## 🆘 Quick Troubleshooting

**Problem:** "ElevenLabs API key not configured"
- **Solution:** Add `ELEVENLABS_API_KEY` to `.env` and restart server

**Problem:** "Failed to generate greeting"
- **Solution:** Check API key validity and account credits

**Problem:** Can't access greeting URL
- **Solution:** Ensure server is running and check the URL format

## 📚 Next Steps

1. ✅ Generate test greetings
2. ✅ Test different voices
3. ✅ Try Hindi/multilingual greetings
4. ✅ Integrate with Exotel calls
5. ✅ Set up production deployment

## 📖 More Information

- **Full Documentation:** See `ELEVENLABS_SETUP.md`
- **Hindi Guide:** See `ELEVENLABS_HINDI_GUIDE.md`
- **Examples:** Run `node example-usage.js`

---

**That's it! You're ready to use ElevenLabs voice greetings! 🎉**
