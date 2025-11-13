# ElevenLabs Voice Greeting Integration - हिंदी गाइड

## सेटअप कैसे करें

### 1. ElevenLabs API Key प्राप्त करें
1. [ElevenLabs](https://elevenlabs.io/) पर जाएं
2. अपने अकाउंट में साइन अप या लॉगिन करें
3. प्रोफाइल सेटिंग्स में जाएं
4. अपनी API key कॉपी करें

### 2. Environment Variables सेट करें
`.env` फाइल में अपनी ElevenLabs API key जोड़ें:

```bash
ELEVENLABS_API_KEY=your_actual_api_key_here
```

### 3. सर्वर को रीस्टार्ट करें
```bash
cd backend
npm start
```

## मुख्य Endpoints

### 1. Greeting बनाएं
**Endpoint:** `POST /greeting/generate`

**उदाहरण:**
```bash
curl -X POST http://localhost:5000/greeting/generate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "नमस्ते! हमारी सेवा में आपका स्वागत है।",
    "name": "स्वागत संदेश"
  }'
```

### 2. सभी Greetings की लिस्ट देखें
**Endpoint:** `GET /greeting/list`

```bash
curl -X GET http://localhost:5000/greeting/list
```

### 3. Greeting को कॉल के माध्यम से भेजें
**Endpoint:** `POST /greeting/send`

```bash
curl -X POST http://localhost:5000/greeting/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+919876543210",
    "greetingId": "1699876543210"
  }'
```

## उपयोग के उदाहरण

### उदाहरण 1: हिंदी में स्वागत संदेश
```javascript
const response = await axios.post('http://localhost:5000/greeting/generate', {
  text: 'नमस्ते! आपका स्वागत है। मैं आपकी कैसे मदद कर सकता हूं?',
  name: 'हिंदी स्वागत'
});
```

### उदाहरण 2: अंग्रेजी में स्वागत संदेश
```javascript
const response = await axios.post('http://localhost:5000/greeting/generate', {
  text: 'Hello! Welcome to our service. How can I help you today?',
  name: 'English Welcome'
});
```

### उदाहरण 3: विशेष आवाज़ के साथ
```javascript
const response = await axios.post('http://localhost:5000/greeting/generate', {
  text: 'यह एक परीक्षण संदेश है।',
  name: 'टेस्ट मैसेज',
  voiceId: 'pNInz6obpgDQGcFmaJgB' // पुरुष आवाज़
});
```

## उपलब्ध आवाज़ें (Voices)

- **Rachel** (महिला): `21m00Tcm4TlvDq8ikWAM` (डिफ़ॉल्ट)
- **Adam** (पुरुष): `pNInz6obpgDQGcFmaJgB`
- **Antoni** (पुरुष): `ErXwobaYiN019PkySvjV`
- **Bella** (महिला): `EXAVITQu4vr4xnSDxMaL`
- **Josh** (पुरुष): `TxGEqnHWrfWFTfGW9XjX`

## टेस्टिंग

टेस्ट स्क्रिप्ट चलाएं:

```bash
cd backend
node test-greeting.js
```

या उदाहरण देखें:

```bash
node example-usage.js
```

## विशेषताएं

✅ टेक्स्ट से आवाज़ में बदलें  
✅ हिंदी और अंग्रेजी दोनों भाषाओं का समर्थन  
✅ कई आवाज़ों के विकल्प  
✅ Greetings को स्टोर और मैनेज करें  
✅ Exotel कॉल के साथ इंटीग्रेशन  
✅ WebSocket सपोर्ट  

## समस्या निवारण

### Error: "ElevenLabs API key not configured"
- सुनिश्चित करें कि आपने `.env` फाइल में `ELEVENLABS_API_KEY` जोड़ा है
- Key जोड़ने के बाद सर्वर को रीस्टार्ट करें

### Error: "Failed to generate greeting"
- जांचें कि आपकी ElevenLabs API key सही है
- सुनिश्चित करें कि आपके ElevenLabs अकाउंट में पर्याप्त क्रेडिट हैं

## महत्वपूर्ण नोट्स

- सभी greetings `/uploads/greetings/` डायरेक्टरी में सेव होती हैं
- ऑडियो फाइलें MP3 फॉर्मेट में होती हैं
- डिफ़ॉल्ट voice model `eleven_multilingual_v2` है जो कई भाषाओं को सपोर्ट करता है
- Greetings तब तक स्टोर रहती हैं जब तक आप उन्हें मैन्युअली डिलीट नहीं करते

## अगले कदम

1. अपनी ElevenLabs API key को `.env` में जोड़ें
2. सर्वर को रीस्टार्ट करें
3. `node example-usage.js` चलाकर टेस्ट करें
4. अपनी पहली greeting बनाएं!

## सहायता के लिए

पूरी जानकारी के लिए `ELEVENLABS_SETUP.md` फाइल देखें।
