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

// Exotel configuration from environment variables
const EXOTEL_SUBDOMAIN = process.env.EXOTEL_SUBDOMAIN;
const EXOTEL_SID = process.env.EXOTEL_SID;
const EXOTEL_TOKEN = process.env.EXOTEL_TOKEN;
const EXOTEL_FROM = process.env.EXOTEL_FROM; // Your Exotel virtual number

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
      return res.status(500).json({ 
        error: 'Exotel credentials not configured. Please set EXOTEL_SUBDOMAIN, EXOTEL_SID, and EXOTEL_TOKEN in .env file' 
      });
    }

    // Use provided 'from' or default from env, or use 'to' as caller ID
    const fromNumber = from || EXOTEL_FROM || to;
    const callTo = to;
    const callerIdNumber = callerId || fromNumber;

    // Exotel API endpoint
    const exotelUrl = `https://${EXOTEL_SUBDOMAIN}.exotel.com/v1/Accounts/${EXOTEL_SID}/Calls/connect.json`;

    // Prepare request data
    const requestData = new URLSearchParams({
      From: fromNumber,
      To: callTo,
      CallerId: callerIdNumber,
      TimeLimit: req.body.timeLimit || '30', // Optional: max call duration in seconds
      StatusCallback: req.body.statusCallback || '', // Optional: webhook URL for call status
    });

    // Make API call to Exotel with Basic Auth
    const auth = Buffer.from(`${EXOTEL_SID}:${EXOTEL_TOKEN}`).toString('base64');
    
    console.log(`Making Exotel call: From ${fromNumber} to ${callTo}`);

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
