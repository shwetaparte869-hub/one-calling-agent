# Voice Calling Agent with ElevenLabs Integration

A Node.js backend service that integrates Exotel calling system with ElevenLabs Text-to-Speech for automated voice greetings.

## 🚀 Features

- ✅ **Exotel Call Integration** - Make and receive calls using Exotel API
- ✅ **ElevenLabs TTS** - Generate natural-sounding voice greetings
- ✅ **Multi-language Support** - Supports English, Hindi, and other languages
- ✅ **WebSocket Streaming** - Real-time audio streaming support
- ✅ **Greeting Management** - Create, store, and manage voice greetings
- ✅ **RESTful API** - Easy-to-use REST endpoints

## 📋 Prerequisites

- Node.js 22 or higher
- Exotel account with API credentials
- ElevenLabs account with API key

## 🛠️ Installation

1. **Clone the repository**
```bash
cd /vercel/sandbox
```

2. **Install dependencies**
```bash
cd backend
npm install
```

3. **Configure environment variables**

Edit `backend/.env` file:
```bash
# Server Configuration
PORT=5000

# Exotel Configuration
EXOTEL_SID=your_exotel_sid
EXOTEL_TOKEN=your_exotel_token
EXOTEL_SUBDOMAIN=api
EXOTEL_FROM=your_exotel_number

# ElevenLabs Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

4. **Start the server**
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Health Check
```bash
GET /
```

### Greeting Endpoints

#### Generate Greeting
```bash
POST /greeting/generate
Content-Type: application/json

{
  "text": "Hello! Welcome to our service.",
  "name": "Welcome Greeting",
  "voiceId": "21m00Tcm4TlvDq8ikWAM"
}
```

#### List All Greetings
```bash
GET /greeting/list
```

#### Get Greeting Audio
```bash
GET /greeting/audio/:filename
```

#### Send Greeting via Call
```bash
POST /greeting/send
Content-Type: application/json

{
  "to": "+919876543210",
  "greetingId": "1699876543210"
}
```

### Exotel Endpoints

#### Make Call
```bash
POST /exotel/call
Content-Type: application/json

{
  "to": "+919876543210",
  "from": "07948516111"
}
```

#### Webhook (Incoming Calls)
```bash
POST /exotel/incoming
```

## 🧪 Testing

### Run Test Script
```bash
cd backend
node test-greeting.js
```

### Run Examples
```bash
# Run all examples
node example-usage.js

# Run specific example
node example-usage.js 1
```

## 📖 Documentation

- **[ElevenLabs Setup Guide](ELEVENLABS_SETUP.md)** - Complete setup and usage guide
- **[Hindi Guide](ELEVENLABS_HINDI_GUIDE.md)** - हिंदी में गाइड

## 🎙️ Available Voices

| Voice Name | Gender | Voice ID |
|------------|--------|----------|
| Rachel | Female | `21m00Tcm4TlvDq8ikWAM` (Default) |
| Adam | Male | `pNInz6obpgDQGcFmaJgB` |
| Antoni | Male | `ErXwobaYiN019PkySvjV` |
| Bella | Female | `EXAVITQu4vr4xnSDxMaL` |
| Josh | Male | `TxGEqnHWrfWFTfGW9XjX` |

## 📁 Project Structure

```
/vercel/sandbox/
├── backend/
│   ├── index.js              # Main server file
│   ├── package.json          # Dependencies
│   ├── .env                  # Environment variables
│   ├── test-greeting.js      # Test script
│   └── example-usage.js      # Usage examples
├── uploads/
│   └── greetings/            # Generated greeting audio files
├── README.md                 # This file
├── ELEVENLABS_SETUP.md       # Detailed setup guide
└── ELEVENLABS_HINDI_GUIDE.md # Hindi guide
```

## 🔧 Configuration

### ElevenLabs Voice Settings

The default voice settings are:
- **Model**: `eleven_multilingual_v2`
- **Stability**: 0.5
- **Similarity Boost**: 0.75
- **Style**: 0.0
- **Speaker Boost**: Enabled

You can customize these in the code if needed.

## 🌐 WebSocket Support

WebSocket endpoint for real-time audio streaming:
```
wss://your-domain.com/voice-stream
```

## 📝 Usage Examples

### Example 1: Generate English Greeting
```javascript
const axios = require('axios');

const response = await axios.post('http://localhost:5000/greeting/generate', {
  text: 'Hello! Welcome to our service.',
  name: 'English Welcome'
});

console.log('Greeting URL:', response.data.greeting.url);
```

### Example 2: Generate Hindi Greeting
```javascript
const response = await axios.post('http://localhost:5000/greeting/generate', {
  text: 'नमस्ते! हमारी सेवा में आपका स्वागत है।',
  name: 'Hindi Welcome'
});

console.log('Greeting URL:', response.data.greeting.url);
```

### Example 3: Send Greeting via Call
```javascript
// First, generate the greeting
const greeting = await axios.post('http://localhost:5000/greeting/generate', {
  text: 'Hello! This is an automated greeting.'
});

// Then, send it via call
await axios.post('http://localhost:5000/greeting/send', {
  to: '+919876543210',
  greetingId: greeting.data.greeting.id
});
```

## 🐛 Troubleshooting

### Server won't start
- Check if port 5000 is available
- Verify all dependencies are installed: `npm install`
- Check environment variables in `.env`

### ElevenLabs API errors
- Verify your API key is correct
- Check if you have sufficient credits
- Ensure the API key is set in `.env` file

### Exotel call errors
- Verify Exotel credentials
- Check phone number format (+91XXXXXXXXXX)
- Ensure Exotel account is active

## 📞 Support

For issues or questions:
1. Check the documentation files
2. Review the example scripts
3. Check server logs for error messages

## 🔐 Security Notes

- Never commit `.env` file to version control
- Keep API keys secure
- Use environment variables for sensitive data
- Implement rate limiting for production use

## 📄 License

This project is for demonstration purposes.

## 🙏 Acknowledgments

- [ElevenLabs](https://elevenlabs.io/) - Text-to-Speech API
- [Exotel](https://exotel.com/) - Cloud telephony platform
- [Express.js](https://expressjs.com/) - Web framework
- [WebSocket](https://www.npmjs.com/package/ws) - Real-time communication

---

**Made with ❤️ for voice automation**
