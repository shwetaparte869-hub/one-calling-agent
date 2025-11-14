# 📞 Exotel AI Calling Agent

A complete solution for making automated calls with greeting playback and call recording using Exotel.

## ✨ Features

- 📞 **Outbound Calls**: Make calls from Exotel number
- 🎙️ **Greeting Playback**: Custom text-to-speech greetings
- 🔴 **Call Recording**: Automatic call recording
- 📝 **Transcription**: Automatic speech-to-text conversion
- 🎨 **Modern UI**: Beautiful, responsive frontend
- ☁️ **Cloud Deployed**: Ready for Render deployment

## 🚀 Quick Start

### Prerequisites
- Exotel account
- Render account
- Node.js (for local development)

### Installation

1. **Clone repository**
```bash
git clone https://github.com/your-username/one-calling-agent.git
cd one-calling-agent
```

2. **Install dependencies**
```bash
cd backend
npm install
```

3. **Configure environment variables**
Create `backend/.env`:
```
EXOTEL_ACCOUNT_SID=your-account-sid
EXOTEL_SUBDOMAIN=api
EXOTEL_SID=your-api-key-username
EXOTEL_TOKEN=your-api-token-password
EXOTEL_APP_ID=your-app-id
EXOTEL_FROM=your-exotel-number
PORT=5000
```

4. **Run locally**
```bash
npm start
```

5. **Open frontend**
Open `frontend/index.html` in browser

## 📖 Documentation

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete setup instructions.

## 🏗️ Project Structure

```
one-calling-agent/
├── backend/
│   ├── index.js          # Main backend server
│   ├── package.json      # Dependencies
│   └── .env              # Environment variables (not in git)
├── frontend/
│   └── index.html        # Frontend UI
├── .gitignore
├── README.md
└── DEPLOYMENT_GUIDE.md
```

## 🔧 API Endpoints

- `POST /exotel/call` - Make outbound call
- `POST /exotel/incoming` - Receive call webhooks
- `POST /exotel/voice-flow` - Voice flow handler
- `POST /exotel/recording-callback` - Recording callback
- `POST /exotel/recording-status` - Recording status
- `POST /exotel/transcription-callback` - Transcription callback
- `GET /` - Frontend UI

## 🎯 Usage

### Make a Call
```javascript
POST /exotel/call
Content-Type: application/json

{
  "to": "9324606985",
  "greeting": "Hello! This is a test call."
}
```

### Response
```json
{
  "success": true,
  "message": "Call initiated successfully",
  "callSid": "7e011686a01247c175922b26dca919bc"
}
```

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📧 Support

For issues, check:
1. Render logs
2. Exotel dashboard
3. Environment variables

---

Made with ❤️ using Exotel

