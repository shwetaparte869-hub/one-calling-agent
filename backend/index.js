const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

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
  res.json({ 
    status: 'Server is running',
    endpoints: {
      makeCall: 'POST /exotel/call',
      webhook: 'POST /exotel/incoming'
    },
    webhookUrl: `${req.protocol}://${req.get('host')}/exotel/incoming`
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
