const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const http = require('http');
const WebSocket = require('ws');
const url = require('url');
const path = require('path');

dotenv.config();
const app = express();

// CORS middleware
app.use(cors());

// Body parser middleware - MUST be before routes
// Express 5 has built-in body parsing, but we'll use both for compatibility
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies
// Keep body-parser for additional compatibility
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve frontend static files (before other routes)
const frontendPath = path.join(__dirname, '..', 'frontend');
console.log('📁 Frontend path:', frontendPath);
app.use(express.static(frontendPath));

// Exotel configuration from environment variables (trim whitespace)
// Note: EXOTEL_SID should be the API KEY (Username) from Exotel dashboard, not Account SID
// EXOTEL_ACCOUNT_SID is the Account SID (e.g., troikaplus1) used in URL path
const EXOTEL_SUBDOMAIN = process.env.EXOTEL_SUBDOMAIN?.trim() || 'api'; // Subdomain (e.g., 'api' from 'api.exotel.com')
const EXOTEL_ACCOUNT_SID = process.env.EXOTEL_ACCOUNT_SID?.trim() || 'troikaplus1'; // Account SID for URL path
const EXOTEL_SID = process.env.EXOTEL_SID?.trim(); // API KEY (Username) for Basic Auth - REQUIRED
const EXOTEL_TOKEN = process.env.EXOTEL_TOKEN?.trim(); // API TOKEN (Password) for Basic Auth - REQUIRED
const EXOTEL_APP_ID = process.env.EXOTEL_APP_ID?.trim() || '1117620'; // App ID (default: 1117620)
const EXOTEL_FROM = process.env.EXOTEL_FROM?.trim() || '07948516111'; // Exotel virtual number (default: 07948516111)
const EXOTEL_WS_TOKEN = process.env.EXOTEL_WS_TOKEN?.trim(); // Optional: WebSocket authentication token

// Helper function to format Indian phone numbers
function formatPhoneNumber(number) {
  if (!number) return number;
  
  // Remove any spaces, dashes, or special characters
  let cleaned = number.toString().replace(/[\s\-\(\)]/g, '');
  
  // If already has country code, return as is
  if (cleaned.startsWith('+91') || cleaned.startsWith('91')) {
    return cleaned.startsWith('+') ? cleaned : '+' + cleaned;
  }
  
  // If it's a 10-digit number starting with 9, add +91
  if (/^9\d{9}$/.test(cleaned)) {
    return '+91' + cleaned;
  }
  
  // If it's a 10-digit number, add +91
  if (/^\d{10}$/.test(cleaned)) {
    return '+91' + cleaned;
  }
  
  // Return as is if doesn't match patterns
  return cleaned;
}

// Endpoint to make Exotel call (POST)
app.post('/exotel/call', async (req, res) => {
  try {
    // Debug: Log request body
    console.log('📥 Request received:', {
      body: req.body,
      contentType: req.get('content-type'),
      method: req.method
    });
    
    // Check if body exists
    if (!req.body) {
      return res.status(400).json({ 
        error: 'Request body is missing',
        message: 'Please send JSON data with Content-Type: application/json'
      });
    }
    
    const { to, from, callerId } = req.body || {};
    
    // Validation - 'from' field contains destination number, 'to' is optional
    // If 'from' is provided, use it as destination, otherwise use 'to'
    const destinationNumber = from || to;
    
    if (!destinationNumber) {
      return res.status(400).json({ 
        error: 'Missing required parameter: destination number',
        message: 'Please provide the phone number where you want to call in the "Call To Number" field'
      });
    }

    // Check if Exotel credentials are configured
    // EXOTEL_SID = API KEY (Username) from Exotel dashboard
    // EXOTEL_TOKEN = API TOKEN (Password) from Exotel dashboard
    if (!EXOTEL_SID || !EXOTEL_TOKEN) {
      const missing = [];
      if (!EXOTEL_SID) missing.push('EXOTEL_SID (API KEY Username)');
      if (!EXOTEL_TOKEN) missing.push('EXOTEL_TOKEN (API TOKEN Password)');
      
      return res.status(500).json({ 
        error: 'Exotel credentials not configured',
        missing: missing,
        message: `Please set the following environment variables in Render: ${missing.join(', ')}`,
        help: 'Get these from Exotel Dashboard → API Credentials → Default API key'
      });
    }
    
    // Validate credentials are not empty after trimming
    if (EXOTEL_SID.length === 0 || EXOTEL_TOKEN.length === 0) {
      return res.status(500).json({ 
        error: 'Exotel credentials are empty. Please check EXOTEL_SID and EXOTEL_TOKEN in Render environment variables' 
      });
    }

    // Format phone numbers
    // IMPORTANT: For Exotel outbound calls:
    // From: Exotel virtual number (caller ID - fixed)
    // To: User's destination number (where call should go)
    const fromNumber = formatPhoneNumber(EXOTEL_FROM); // Always use Exotel number as caller
    const callTo = formatPhoneNumber(destinationNumber); // User's destination number
    const callerIdNumber = callerId ? formatPhoneNumber(callerId) : fromNumber;
    
    // Validate that we have a destination number (user's number)
    if (!callTo) {
      return res.status(400).json({ 
        error: 'Destination number is required. Please provide the phone number where you want to call in the "from" field.' 
      });
    }
    
    // Validate that we have Exotel number as caller
    if (!fromNumber) {
      return res.status(400).json({ 
        error: 'Exotel number not configured. Please set EXOTEL_FROM in environment variables.' 
      });
    }
    
    // Get base URL for status callback (from request or use Render URL)
    const baseUrl = req.protocol + '://' + req.get('host');
    const statusCallbackUrl = req.body.statusCallback || `${baseUrl}/exotel/incoming`;

    // Exotel API endpoint - handle subdomain format
    let subdomain = EXOTEL_SUBDOMAIN.trim();
    
    // Remove any protocol (http:// or https://)
    subdomain = subdomain.replace(/^https?:\/\//, '');
    
    // Remove .exotel.com if already included (handle multiple cases)
    subdomain = subdomain.replace(/\.exotel\.com.*$/, '');
    subdomain = subdomain.replace(/exotel\.com.*$/, '');
    
    // Remove trailing slashes
    subdomain = subdomain.replace(/\/.*$/, '');
    
    // Validate subdomain
    if (!subdomain || subdomain.length === 0) {
      return res.status(500).json({ 
        error: 'Invalid EXOTEL_SUBDOMAIN. It should be just the subdomain (e.g., "api" or "api1"), not a full URL.' 
      });
    }
    
    // Now construct the URL properly
    // Use Account SID in URL path, API KEY (EXOTEL_SID) for authentication
    const accountSid = EXOTEL_ACCOUNT_SID || 'troikaplus1';
    const exotelUrl = `https://${subdomain}.exotel.com/v1/Accounts/${accountSid}/Calls/connect.json`;

    // Get greeting text if provided
    const greetingText = req.body.greeting || 'Hello! This is an automated call from Exotel. How can I help you today?';
    
    // Voice flow webhook URL (for greeting and recording)
    const voiceFlowUrl = `${baseUrl}/exotel/voice-flow`;
    
    // Prepare request data
    const requestData = new URLSearchParams({
      From: fromNumber,
      To: callTo,
      CallerId: callerIdNumber,
      TimeLimit: req.body.timeLimit || '300', // Max call duration (5 minutes)
      StatusCallback: statusCallbackUrl, // Webhook URL for call status updates
      Record: 'true', // Enable call recording
      RecordingStatusCallback: `${baseUrl}/exotel/recording-status`, // Recording status webhook
      RecordingStatusCallbackMethod: 'POST',
    });
    
    // Add App ID if provided (optional, some Exotel accounts require it)
    if (EXOTEL_APP_ID || req.body.appId) {
      requestData.append('AppId', EXOTEL_APP_ID || req.body.appId);
    }
    
    // Add voice flow URL if using Exotel Flow API
    // Note: For basic calls, you might need to configure this in Exotel dashboard
    // requestData.append('Url', voiceFlowUrl);

    // Make API call to Exotel with Basic Auth
    // Use API KEY (Username) and API TOKEN (Password) for authentication
    // Ensure no extra whitespace in credentials
    const cleanApiKey = EXOTEL_SID.trim(); // API KEY (Username)
    const cleanToken = EXOTEL_TOKEN.trim(); // API TOKEN (Password)
    const auth = Buffer.from(`${cleanApiKey}:${cleanToken}`).toString('base64');
    
    console.log(`📞 Making Exotel call:`);
    console.log(`   From (Exotel Caller): ${fromNumber}`);
    console.log(`   To (Destination): ${callTo}`);
    console.log(`   Caller ID: ${callerIdNumber}`);
    console.log(`   Exotel URL: ${exotelUrl}`);
    console.log(`   ⚠️ VERIFY: Call will go FROM ${fromNumber} TO ${callTo}`);
    console.log(`   Account SID (URL): ${accountSid}`);
    console.log(`   Subdomain: ${subdomain}`);
    console.log(`   API KEY: ${cleanApiKey ? cleanApiKey.substring(0, 8) + '...' : 'Not configured'}`);
    console.log(`   API TOKEN: ${cleanToken ? cleanToken.substring(0, 4) + '...' : 'Not configured'}`);

    const response = await axios.post(exotelUrl, requestData.toString(), {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    console.log('Exotel API Response:', response.data);

    res.status(200).json({
      success: true,
      message: 'Call initiated successfully',
      callSid: response.data.Call?.Sid || response.data.CallSid,
      data: response.data,
    });

  } catch (error) {
    console.error('Exotel call error:', error.response?.data || error.message);
    
    // Handle 401 Unauthorized specifically
    if (error.response?.status === 401 || error.response?.data?.RestException?.Status === 401) {
      return res.status(401).json({
        error: 'Exotel authentication failed',
        message: 'Invalid Exotel credentials. Please check:',
        checks: [
          '1. EXOTEL_SID = API KEY (Username) from Exotel Dashboard → API Credentials → Default API key',
          '2. EXOTEL_TOKEN = API TOKEN (Password) - Click eye icon to reveal, then copy',
          '3. No extra spaces or characters in credentials',
          '4. Credentials are set in Render Environment Variables',
          '5. Service has been redeployed after adding credentials',
          '6. If token is masked, regenerate it or reveal it using the eye icon'
        ],
        details: error.response?.data || error.message,
      });
    }
    
    res.status(500).json({
      error: 'Failed to initiate call',
      details: error.response?.data || error.message,
    });
  }
});

// Exotel webhook (POST) - receives callbacks from Exotel
app.post('/exotel/incoming', async (req, res) => {
  try {
    console.log("Incoming Call Data:", req.body);

    const { From, To, CallSid, CallStatus } = req.body;

    // Store call information
    console.log(`Incoming call from ${From} to ${To} | Call SID: ${CallSid} | Status: ${CallStatus}`);

    // Respond OK to Exotel
    res.status(200).send('Webhook received');
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send('Error handling webhook');
  }
});

// Exotel Voice Flow Webhook - Returns TwiML for greeting and recording
app.post('/exotel/voice-flow', (req, res) => {
  try {
    const { From, To, CallSid } = req.body;
    const greetingText = req.body.greeting || 'Hello! This is an automated call from Exotel. How can I help you today?';
    
    console.log(`📞 Voice flow triggered for Call SID: ${CallSid}`);
    console.log(`   From: ${From}, To: ${To}`);
    console.log(`   Greeting: ${greetingText}`);

    // Generate TwiML response for Exotel
    // Exotel uses TwiML format for voice instructions
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <!-- Play greeting using TTS -->
    <Say voice="alice" language="en-IN">${greetingText}</Say>
    
    <!-- Record the call -->
    <Record 
        action="${req.protocol}://${req.get('host')}/exotel/recording-callback"
        method="POST"
        maxLength="300"
        finishOnKey="#"
        recordingStatusCallback="${req.protocol}://${req.get('host')}/exotel/recording-status"
        recordingStatusCallbackMethod="POST"
        transcribe="true"
        transcribeCallback="${req.protocol}://${req.get('host')}/exotel/transcription-callback"
    />
    
    <!-- Thank you message after recording -->
    <Say voice="alice" language="en-IN">Thank you for your message. Have a great day!</Say>
    
    <!-- Hangup -->
    <Hangup/>
</Response>`;

    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    console.error("Voice flow error:", error);
    res.status(500).send('Error in voice flow');
  }
});

// Recording callback - when recording is complete
app.post('/exotel/recording-callback', (req, res) => {
  try {
    const { CallSid, RecordingUrl, RecordingDuration, RecordingSid } = req.body;
    
    console.log(`🎙️ Recording completed for Call SID: ${CallSid}`);
    console.log(`   Recording URL: ${RecordingUrl}`);
    console.log(`   Duration: ${RecordingDuration} seconds`);
    console.log(`   Recording SID: ${RecordingSid}`);

    // Store recording information (you can save to database here)
    // For now, just log it

    res.status(200).send('Recording callback received');
  } catch (error) {
    console.error("Recording callback error:", error);
    res.status(500).send('Error handling recording callback');
  }
});

// Recording status callback
app.post('/exotel/recording-status', (req, res) => {
  try {
    const { CallSid, RecordingStatus, RecordingUrl } = req.body;
    
    console.log(`📊 Recording status update: ${RecordingStatus} for Call SID: ${CallSid}`);
    if (RecordingUrl) {
      console.log(`   Recording URL: ${RecordingUrl}`);
    }

    res.status(200).send('Recording status received');
  } catch (error) {
    console.error("Recording status error:", error);
    res.status(500).send('Error handling recording status');
  }
});

// Transcription callback
app.post('/exotel/transcription-callback', (req, res) => {
  try {
    const { CallSid, TranscriptionText, TranscriptionStatus, TranscriptionUrl } = req.body;
    
    console.log(`📝 Transcription ${TranscriptionStatus} for Call SID: ${CallSid}`);
    if (TranscriptionText) {
      console.log(`   Text: ${TranscriptionText}`);
    }
    if (TranscriptionUrl) {
      console.log(`   Transcription URL: ${TranscriptionUrl}`);
    }

    res.status(200).send('Transcription callback received');
  } catch (error) {
    console.error("Transcription callback error:", error);
    res.status(500).send('Error handling transcription callback');
  }
});

// Health check endpoint (API info)
app.get('/api/health', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.json({ 
    status: 'Server is running',
    endpoints: {
      makeCall: 'POST /exotel/call',
      webhook: 'POST /exotel/incoming',
      voiceStream: `WSS ${baseUrl}/voice-stream`
    },
    webhookUrl: `${baseUrl}/exotel/incoming`,
    websocketUrl: `wss://${req.get('host')}/voice-stream`
  });
});

// Serve frontend for root route
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, '..', 'frontend', 'index.html');
  console.log('📄 Serving frontend from:', indexPath);
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('❌ Error sending frontend file:', err);
      console.error('   File path:', indexPath);
      console.error('   __dirname:', __dirname);
      // Fallback: send simple HTML
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Exotel AI Calling Agent</title></head>
        <body>
          <h1>Exotel AI Calling Agent</h1>
          <p>Frontend loading... If this persists, check server logs.</p>
          <p>API Health: <a href="/api/health">/api/health</a></p>
        </body>
        </html>
      `);
    }
  });
});

// Create HTTP server from Express app
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// WebSocket server for Exotel voice streaming
const wss = new WebSocket.Server({ 
  server,
  path: '/voice-stream',
  verifyClient: (info) => {
    // Verify authentication token if configured
    if (EXOTEL_WS_TOKEN) {
      const authHeader = info.req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('❌ WebSocket connection rejected: Missing or invalid Authorization header');
        return false;
      }
      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      if (token !== EXOTEL_WS_TOKEN) {
        console.log('❌ WebSocket connection rejected: Invalid token');
        return false;
      }
    }
    return true;
  }
});

// Store active WebSocket sessions
const activeSessions = new Map();

wss.on('connection', (ws, req) => {
  // Parse query parameters from URL
  const parsedUrl = url.parse(req.url, true);
  const query = parsedUrl.query;
  const callSid = query.callSid || query.callLogId || 'unknown';
  
  console.log(`🔌 WebSocket connection established`);
  console.log(`   Call SID: ${callSid}`);
  console.log(`   Query params:`, query);
  
  // Create session entry
  const sessionId = callSid;
  const session = {
    callSid: callSid,
    ws: ws,
    connectedAt: new Date(),
    sequenceNumber: 0,
    streamSid: null
  };
  
  activeSessions.set(sessionId, session);
  console.log(`✅ Session created: ${sessionId}`);
  
  // Handle incoming messages from Exotel
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log(`📨 Received message:`, message.event || 'unknown');
      
      switch (message.event) {
        case 'start':
          handleStartEvent(session, message);
          break;
          
        case 'media':
          handleMediaEvent(session, message);
          break;
          
        case 'stop':
          handleStopEvent(session, message);
          break;
          
        default:
          console.log(`⚠️ Unknown event type: ${message.event}`);
      }
    } catch (error) {
      console.error('❌ Error parsing WebSocket message:', error);
      console.error('Raw data:', data.toString());
    }
  });
  
  // Handle connection close
  ws.on('close', (code, reason) => {
    console.log(`🔌 WebSocket connection closed`);
    console.log(`   Call SID: ${callSid}`);
    console.log(`   Code: ${code}, Reason: ${reason.toString()}`);
    
    // Clean up session
    if (activeSessions.has(sessionId)) {
      activeSessions.delete(sessionId);
      console.log(`🗑️ Session removed: ${sessionId}`);
    }
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error(`❌ WebSocket error for ${callSid}:`, error);
  });
});

// Handle 'start' event
function handleStartEvent(session, message) {
  console.log(`🎬 Start event received`);
  console.log(`   Stream SID: ${message.stream_sid}`);
  console.log(`   Account SID: ${message.account_sid}`);
  console.log(`   Call SID: ${message.call_sid}`);
  
  session.streamSid = message.stream_sid;
  session.accountSid = message.account_sid;
  session.callSid = message.call_sid || session.callSid;
  
  // Update session
  activeSessions.set(session.callSid, session);
  
  // You can send a response here if needed
  // For now, we'll just log it
}

// Handle 'media' event (incoming audio)
function handleMediaEvent(session, message) {
  if (!session.streamSid) {
    console.log('⚠️ Media event received but stream_sid not set');
    return;
  }
  
  // Decode base64 audio payload
  if (message.media && message.media.payload) {
    try {
      const audioBuffer = Buffer.from(message.media.payload, 'base64');
      // Process audio here (save, transcribe, etc.)
      // For now, we'll just log the size
      console.log(`🎵 Media received: ${audioBuffer.length} bytes`);
      
      // Example: Echo back the audio (you can modify this)
      // sendMediaToExotel(session, audioBuffer);
      
    } catch (error) {
      console.error('❌ Error decoding media payload:', error);
    }
  }
}

// Handle 'stop' event
function handleStopEvent(session, message) {
  console.log(`🛑 Stop event received`);
  console.log(`   Call SID: ${session.callSid}`);
  console.log(`   Stream SID: ${session.streamSid}`);
  
  // Clean up resources
  if (activeSessions.has(session.callSid)) {
    activeSessions.delete(session.callSid);
    console.log(`🗑️ Session cleaned up: ${session.callSid}`);
  }
  
  // Close WebSocket connection
  if (session.ws.readyState === WebSocket.OPEN) {
    session.ws.close();
  }
}

// Function to send media back to Exotel
function sendMediaToExotel(session, audioBuffer) {
  if (!session.ws || session.ws.readyState !== WebSocket.OPEN) {
    console.log('⚠️ Cannot send media: WebSocket not open');
    return;
  }
  
  if (!session.streamSid) {
    console.log('⚠️ Cannot send media: stream_sid not set');
    return;
  }
  
  // Exotel expects 16-bit, 8 kHz mono PCM
  // Break into 3200-byte chunks
  const chunkSize = 3200;
  
  for (let i = 0; i < audioBuffer.length; i += chunkSize) {
    const chunk = audioBuffer.slice(i, i + chunkSize);
    const base64Chunk = chunk.toString('base64');
    
    const mediaMessage = {
      event: 'media',
      stream_sid: session.streamSid,
      sequence_number: session.sequenceNumber.toString(),
      media: {
        payload: base64Chunk
      }
    };
    
    try {
      session.ws.send(JSON.stringify(mediaMessage));
      session.sequenceNumber++;
      console.log(`📤 Sent media chunk: sequence ${session.sequenceNumber - 1}, size ${chunk.length} bytes`);
    } catch (error) {
      console.error('❌ Error sending media:', error);
      break;
    }
  }
}

// Start HTTP server (WebSocket server is attached)
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket endpoint: wss://one-calling-agent.onrender.com/voice-stream`);
  console.log(`🔐 WebSocket auth: ${EXOTEL_WS_TOKEN ? 'Enabled' : 'Disabled'}`);
  console.log(`📊 Active sessions: ${activeSessions.size}`);
});
