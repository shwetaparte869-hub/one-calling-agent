# ElevenLabs Voice Greeting Integration

## Overview
This integration allows you to generate voice greetings using ElevenLabs Text-to-Speech API and send them through Exotel calls.

## Setup Instructions

### 1. Get ElevenLabs API Key
1. Go to [ElevenLabs](https://elevenlabs.io/)
2. Sign up or log in to your account
3. Navigate to your profile settings
4. Copy your API key

### 2. Configure Environment Variables
Add your ElevenLabs API key to the `.env` file:

```bash
ELEVENLABS_API_KEY=your_actual_api_key_here
```

### 3. Restart the Server
After adding the API key, restart your backend server:

```bash
cd backend
npm start
```

## API Endpoints

### 1. Generate Greeting
**Endpoint:** `POST /greeting/generate`

**Request Body:**
```json
{
  "text": "Hello! Welcome to our service.",
  "name": "Welcome Greeting",
  "voiceId": "21m00Tcm4TlvDq8ikWAM"
}
```

**Parameters:**
- `text` (required): The text to convert to speech
- `name` (optional): A name for the greeting
- `voiceId` (optional): ElevenLabs voice ID (defaults to Rachel voice)

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
    "name": "Welcome Greeting",
    "url": "http://localhost:5000/greeting/audio/greeting_1699876543210.mp3",
    "filepath": "/path/to/uploads/greetings/greeting_1699876543210.mp3",
    "createdAt": "2024-11-13T10:30:00.000Z"
  }
}
```

### 2. List All Greetings
**Endpoint:** `GET /greeting/list`

**Response:**
```json
{
  "success": true,
  "count": 2,
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

### 3. Get Greeting Audio
**Endpoint:** `GET /greeting/audio/:filename`

**Example:** `GET /greeting/audio/greeting_1699876543210.mp3`

Returns the audio file (MP3 format).

### 4. Send Greeting via Call
**Endpoint:** `POST /greeting/send`

**Request Body:**
```json
{
  "to": "+919876543210",
  "greetingId": "1699876543210"
}
```

**Parameters:**
- `to` (required): Phone number to call
- `greetingId` (optional): ID of the greeting to send
- `greetingUrl` (optional): Direct URL to the greeting audio

**Response:**
```json
{
  "success": true,
  "message": "Greeting call initiated",
  "audioUrl": "http://localhost:5000/greeting/audio/greeting_1699876543210.mp3",
  "to": "+919876543210"
}
```

## Available Voices

ElevenLabs provides various voices. Here are some popular ones:

- **Rachel** (Female): `21m00Tcm4TlvDq8ikWAM` (Default)
- **Adam** (Male): `pNInz6obpgDQGcFmaJgB`
- **Antoni** (Male): `ErXwobaYiN019PkySvjV`
- **Bella** (Female): `EXAVITQu4vr4xnSDxMaL`
- **Elli** (Female): `MF3mGyEYCl7XYWbV9V6O`
- **Josh** (Male): `TxGEqnHWrfWFTfGW9XjX`

To use a different voice, include the `voiceId` in your request.

## Testing

Run the test script to verify the integration:

```bash
cd backend
node test-greeting.js
```

## Usage Examples

### Example 1: Generate a Hindi Greeting
```bash
curl -X POST http://localhost:5000/greeting/generate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "नमस्ते! हमारी सेवा में आपका स्वागत है।",
    "name": "Hindi Welcome"
  }'
```

### Example 2: Generate an English Greeting
```bash
curl -X POST http://localhost:5000/greeting/generate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello! Thank you for calling. How can I help you today?",
    "name": "English Welcome"
  }'
```

### Example 3: List All Greetings
```bash
curl -X GET http://localhost:5000/greeting/list
```

### Example 4: Send Greeting via Call
```bash
curl -X POST http://localhost:5000/greeting/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+919876543210",
    "greetingId": "1699876543210"
  }'
```

## Integration with Exotel

To play the greeting in an Exotel call, you need to:

1. **Generate the greeting** using `/greeting/generate`
2. **Get the audio URL** from the response
3. **Configure Exotel App/Flow** to play the audio URL
4. **Use the app in your call** by specifying the AppId in the call request

### Exotel App Configuration
In your Exotel dashboard:
1. Create a new App/Flow
2. Add a "Play" action
3. Set the audio URL to your greeting URL
4. Save the App and note the AppId

## Features

✅ Generate voice greetings from text  
✅ Support for multiple languages (including Hindi)  
✅ Multiple voice options  
✅ Store and manage greetings  
✅ Integration with Exotel calls  
✅ WebSocket support for real-time audio streaming  

## Troubleshooting

### Error: "ElevenLabs API key not configured"
- Make sure you've added `ELEVENLABS_API_KEY` to your `.env` file
- Restart the server after adding the key

### Error: "Failed to generate greeting"
- Check if your ElevenLabs API key is valid
- Verify you have sufficient credits in your ElevenLabs account
- Check the server logs for detailed error messages

### Audio file not found
- Ensure the `uploads/greetings` directory exists
- Check file permissions
- Verify the greeting was generated successfully

## Notes

- Generated greetings are stored in `/uploads/greetings/` directory
- Audio files are in MP3 format
- The default voice model is `eleven_multilingual_v2` which supports multiple languages
- Greetings are stored permanently until manually deleted

## Next Steps

1. **Add greeting to Exotel call flow**: Configure your Exotel app to play the greeting URL
2. **Implement greeting management**: Add endpoints to delete or update greetings
3. **Add voice customization**: Allow users to adjust voice parameters (speed, pitch, etc.)
4. **Implement caching**: Cache frequently used greetings to reduce API calls
