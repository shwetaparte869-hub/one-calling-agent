const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const http = require('http');
const WebSocket = require('ws');
const url = require('url');

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Exotel configuration from environment variables (trim whitespace)
const EXOTEL_SUBDOMAIN = process.env.EXOTEL_SUBDOMAIN?.trim();
const EXOTEL_SID = process.env.EXOTEL_SID?.trim();
const EXOTEL_TOKEN = process.env.EXOTEL_TOKEN?.trim();
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
    const { to, from, callerId } = req.body;

    // Validation
    if (!to) {
      return res.status(400).json({ error: 'Missing required parameter: to' });
    }

    // Check if Exotel credentials are configured
    if (!EXOTEL_SUBDOMAIN || !EXOTEL_SID || !EXOTEL_TOKEN) {
      const missing = [];
      if (!EXOTEL_SUBDOMAIN) missing.push('EXOTEL_SUBDOMAIN');
      if (!EXOTEL_SID) missing.push('EXOTEL_SID');
      if (!EXOTEL_TOKEN) missing.push('EXOTEL_TOKEN');
      
      return res.status(500).json({ 
        error: 'Exotel credentials not configured',
        missing: missing,
        message: `Please set the following environment variables in Render: ${missing.join(', ')}`
      });
    }
    
    // Validate credentials are not empty after trimming
    if (EXOTEL_SID.length === 0 || EXOTEL_TOKEN.length === 0) {
      return res.status(500).json({ 
        error: 'Exotel credentials are empty. Please check EXOTEL_SID and EXOTEL_TOKEN in Render environment variables' 
      });
    }

    // Format phone numbers
    const callTo = formatPhoneNumber(to);
    // Use Exotel number as From (required for Exotel calls)
    const fromNumber = from ? formatPhoneNumber(from) : formatPhoneNumber(EXOTEL_FROM);
    const callerIdNumber = callerId ? formatPhoneNumber(callerId) : fromNumber;
    
    // Validate that we have a From number
    if (!fromNumber) {
      return res.status(400).json({ 
        error: 'From number is required. Please set EXOTEL_FROM in environment variables or provide "from" in request body.' 
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
    const exotelUrl = `https://${subdomain}.exotel.com/v1/Accounts/${EXOTEL_SID}/Calls/connect.json`;

    // Prepare request data
    const requestData = new URLSearchParams({
      From: fromNumber,
      To: callTo,
      CallerId: callerIdNumber,
      TimeLimit: req.body.timeLimit || '30', // Optional: max call duration in seconds
      StatusCallback: statusCallbackUrl, // Webhook URL for call status updates
    });
    
    // Add App ID if provided (optional, some Exotel accounts require it)
    if (EXOTEL_APP_ID || req.body.appId) {
      requestData.append('AppId', EXOTEL_APP_ID || req.body.appId);
    }

    // Make API call to Exotel with Basic Auth
    // Ensure no extra whitespace in credentials
    const cleanSid = EXOTEL_SID.trim();
    const cleanToken = EXOTEL_TOKEN.trim();
    const auth = Buffer.from(`${cleanSid}:${cleanToken}`).toString('base64');
    
    console.log(`📞 Making Exotel call:`);
    console.log(`   From (Exotel): ${fromNumber}`);
    console.log(`   To: ${callTo}`);
    console.log(`   Caller ID: ${callerIdNumber}`);
    console.log(`   Exotel URL: ${exotelUrl}`);
    console.log(`   Subdomain: ${subdomain}`);
    console.log(`   SID: ${cleanSid ? cleanSid.substring(0, 4) + '...' : 'Not configured'}`);
    console.log(`   Token: ${cleanToken ? cleanToken.substring(0, 4) + '...' : 'Not configured'}`);

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
          '1. EXOTEL_SID is correct (from Exotel dashboard)',
          '2. EXOTEL_TOKEN is correct (from Exotel dashboard)',
          '3. No extra spaces or characters in credentials',
          '4. Credentials are set in Render Environment Variables',
          '5. Service has been redeployed after adding credentials'
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

    const { From, To, CallSid } = req.body;

    // You can store or trigger something here
    console.log(`Incoming call from ${From} to ${To} | Call SID: ${CallSid}`);

    // Respond OK to Exotel
    res.status(200).send('Webhook received');
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send('Error handling webhook');
  }
});

// Health check endpoint
app.get('/', (req, res) => {
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
