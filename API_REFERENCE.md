# 📡 API Reference - Quick Guide

## Base URL
```
http://localhost:5000
```

---

## 🎙️ Greeting Endpoints

### 1. Generate Greeting
**Create a voice greeting from text**

```http
POST /greeting/generate
Content-Type: application/json
```

**Request:**
```json
{
  "text": "Hello! Welcome to our service.",
  "name": "Welcome Message",
  "voiceId": "21m00Tcm4TlvDq8ikWAM"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Greeting generated successfully",
  "greeting": {
    "id": "1699876543210",
    "filename": "greeting_1699876543210.mp3",
    "text": "Hello! Welcome to our service.",
    "voiceId": "21m00Tcm4TlvDq8ikWAM",
    "name": "Welcome Message",
    "url": "http://localhost:5000/greeting/audio/greeting_1699876543210.mp3",
    "filepath": "/path/to/uploads/greetings/greeting_1699876543210.mp3",
    "createdAt": "2024-11-13T10:30:00.000Z"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/greeting/generate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello World", "name": "Test"}'
```

---

### 2. List Greetings
**Get all generated greetings**

```http
GET /greeting/list
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "greetings": [
    {
      "filename": "greeting_1699876543210.mp3",
      "url": "http://localhost:5000/greeting/audio/greeting_1699876543210.mp3",
      "size": 45678,
      "createdAt": "2024-11-13T10:30:00.000Z"
    }
  ]
}
```

**cURL Example:**
```bash
curl http://localhost:5000/greeting/list
```

---

### 3. Get Greeting Audio
**Download or play greeting audio file**

```http
GET /greeting/audio/:filename
```

**Example:**
```
GET /greeting/audio/greeting_1699876543210.mp3
```

**Response:** MP3 audio file

**cURL Example:**
```bash
# Play in browser
open http://localhost:5000/greeting/audio/greeting_1699876543210.mp3

# Download
curl -O http://localhost:5000/greeting/audio/greeting_1699876543210.mp3
```

---

### 4. Send Greeting
**Send greeting via phone call**

```http
POST /greeting/send
Content-Type: application/json
```

**Request:**
```json
{
  "to": "+919876543210",
  "greetingId": "1699876543210"
}
```

**Alternative (with URL):**
```json
{
  "to": "+919876543210",
  "greetingUrl": "http://localhost:5000/greeting/audio/greeting_1699876543210.mp3"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Greeting call initiated",
  "audioUrl": "http://localhost:5000/greeting/audio/greeting_1699876543210.mp3",
  "to": "+919876543210"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/greeting/send \
  -H "Content-Type: application/json" \
  -d '{"to": "+919876543210", "greetingId": "1699876543210"}'
```

---

## 📞 Exotel Endpoints

### 5. Make Call
**Initiate an Exotel call**

```http
POST /exotel/call
Content-Type: application/json
```

**Request:**
```json
{
  "to": "+919876543210",
  "from": "07948516111",
  "callerId": "07948516111"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Call initiated successfully",
  "callSid": "abc123xyz",
  "data": { }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/exotel/call \
  -H "Content-Type: application/json" \
  -d '{"to": "+919876543210"}'
```

---

### 6. Webhook (Incoming)
**Receive Exotel call status updates**

```http
POST /exotel/incoming
```

**Request (from Exotel):**
```json
{
  "From": "+919876543210",
  "To": "07948516111",
  "CallSid": "abc123xyz"
}
```

**Response:**
```
Webhook received
```

---

## 🏥 Health Check

### 7. Server Status
**Check if server is running**

```http
GET /
```

**Response:**
```json
{
  "status": "Server is running",
  "endpoints": {
    "makeCall": "POST /exotel/call",
    "webhook": "POST /exotel/incoming",
    "voiceStream": "WSS http://localhost:5000/voice-stream",
    "generateGreeting": "POST /greeting/generate",
    "listGreetings": "GET /greeting/list",
    "sendGreeting": "POST /greeting/send",
    "getGreeting": "GET /greeting/audio/:filename"
  },
  "webhookUrl": "http://localhost:5000/exotel/incoming",
  "websocketUrl": "wss://localhost:5000/voice-stream",
  "elevenLabsConfigured": true
}
```

**cURL Example:**
```bash
curl http://localhost:5000/
```

---

## 🎨 Voice IDs

| Voice Name | Gender | Voice ID | Description |
|------------|--------|----------|-------------|
| Rachel | Female | `21m00Tcm4TlvDq8ikWAM` | Default, pleasant |
| Adam | Male | `pNInz6obpgDQGcFmaJgB` | Professional |
| Antoni | Male | `ErXwobaYiN019PkySvjV` | Warm, friendly |
| Bella | Female | `EXAVITQu4vr4xnSDxMaL` | Young, energetic |
| Elli | Female | `MF3mGyEYCl7XYWbV9V6O` | Soft, gentle |
| Josh | Male | `TxGEqnHWrfWFTfGW9XjX` | Deep, authoritative |

---

## 📝 Request Parameters

### Generate Greeting

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| text | string | ✅ Yes | Text to convert to speech |
| name | string | ❌ No | Name for the greeting |
| voiceId | string | ❌ No | ElevenLabs voice ID (default: Rachel) |

### Send Greeting

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| to | string | ✅ Yes | Phone number to call |
| greetingId | string | ⚠️ One of | ID of the greeting |
| greetingUrl | string | ⚠️ One of | Direct URL to greeting |

### Make Call

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| to | string | ✅ Yes | Destination phone number |
| from | string | ❌ No | Exotel number (default from env) |
| callerId | string | ❌ No | Caller ID to display |

---

## 🔐 Authentication

### ElevenLabs
Set in environment variable:
```bash
ELEVENLABS_API_KEY=your_api_key_here
```

### Exotel
Set in environment variables:
```bash
EXOTEL_SID=your_sid
EXOTEL_TOKEN=your_token
```

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required parameter: text"
}
```

### 401 Unauthorized
```json
{
  "error": "Exotel authentication failed",
  "message": "Invalid Exotel credentials"
}
```

### 404 Not Found
```json
{
  "error": "Greeting not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to generate greeting",
  "details": "Error message details"
}
```

---

## 🌐 WebSocket

### Voice Stream
**Real-time audio streaming**

```
wss://localhost:5000/voice-stream?callSid=abc123
```

**Events:**
- `start` - Stream started
- `media` - Audio data
- `stop` - Stream stopped

---

## 📊 Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request - Missing/invalid parameters |
| 401 | Unauthorized - Invalid credentials |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Internal error |

---

## 💡 Quick Examples

### Generate English Greeting
```bash
curl -X POST http://localhost:5000/greeting/generate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello! Welcome.", "name": "Welcome"}'
```

### Generate Hindi Greeting
```bash
curl -X POST http://localhost:5000/greeting/generate \
  -H "Content-Type: application/json" \
  -d '{"text": "नमस्ते! स्वागत है।", "name": "Hindi Welcome"}'
```

### Generate with Male Voice
```bash
curl -X POST http://localhost:5000/greeting/generate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello!", "voiceId": "pNInz6obpgDQGcFmaJgB"}'
```

### List All Greetings
```bash
curl http://localhost:5000/greeting/list
```

### Download Greeting
```bash
curl -O http://localhost:5000/greeting/audio/greeting_1699876543210.mp3
```

---

## 📚 More Information

- **Setup Guide**: `ELEVENLABS_SETUP.md`
- **Quick Start**: `QUICK_START.md`
- **Examples**: `backend/example-usage.js`
- **Tests**: `backend/test-greeting.js`

---

**Last Updated:** November 13, 2024
