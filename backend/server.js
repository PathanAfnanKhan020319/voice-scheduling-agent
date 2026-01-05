const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createCalendarEvent, checkAvailability } = require('./calendar');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'Voice Scheduling Agent API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      webhook: '/webhook/vapi',
      createEvent: '/api/create-event',
      checkAvailability: '/api/check-availability',
      health: '/health'
    }
  });
});

// Dedicated health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// VAPI Webhook endpoint - Main integration point
app.post('/webhook/vapi', async (req, res) => {
  try {
    const { message, call } = req.body;

    console.log('\n=== VAPI Webhook Received ===');
    console.log('Message Type:', message?.type);
    console.log('Call ID:', call?.id);
    console.log('Full Payload:', JSON.stringify(req.body, null, 2));

    // Handle function calls from VAPI
    if (message?.type === 'function-call') {
      const functionName = message.functionCall?.name;
      const parameters = message.functionCall?.parameters;

      console.log(`\n📞 Function Called: ${functionName}`);
      console.log('Parameters:', JSON.stringify(parameters, null, 2));

      // Handle createCalendarEvent function
      if (functionName === 'createCalendarEvent') {
        console.log('\n📅 Creating calendar event...');
        const result = await createCalendarEvent(parameters);
        
        console.log('Calendar Result:', JSON.stringify(result, null, 2));
        
        return res.json({
          results: [{
            name: functionName,
            result: result
          }]
        });
      }

      // Handle checkAvailability function
      if (functionName === 'checkAvailability') {
        console.log('\n🔍 Checking availability...');
        const available = await checkAvailability(
          parameters.startDateTime,
          parameters.endDateTime
        );
        
        console.log('Availability:', available);
        
        return res.json({
          results: [{
            name: functionName,
            result: { available }
          }]
        });
      }

      // Unknown function
      console.warn(`⚠️  Unknown function: ${functionName}`);
      return res.json({
        results: [{
          name: functionName,
          result: { 
            success: false, 
            error: `Unknown function: ${functionName}` 
          }
        }]
      });
    }

    // Handle other webhook events (conversation updates, end of call, etc.)
    if (message?.type === 'conversation-update') {
      console.log('💬 Conversation Update:', message.conversation);
    }

    if (message?.type === 'end-of-call-report') {
      console.log('📊 Call Ended - Report:', message.endedReason);
    }

    // Default response for non-function-call webhooks
    res.json({ 
      received: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('\n❌ Webhook Error:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Direct API endpoint to create events (for testing without VAPI)
app.post('/api/create-event', async (req, res) => {
  try {
    console.log('\n=== Direct Event Creation Request ===');
    const { summary, startDateTime, endDateTime, attendeeName } = req.body;

    // Validation
    if (!startDateTime) {
      return res.status(400).json({ 
        success: false,
        error: 'startDateTime is required',
        receivedData: req.body
      });
    }

    if (!attendeeName) {
      return res.status(400).json({ 
        success: false,
        error: 'attendeeName is required',
        receivedData: req.body
      });
    }

    console.log('Request Data:', {
      summary,
      startDateTime,
      endDateTime,
      attendeeName
    });

    const result = await createCalendarEvent({
      summary,
      startDateTime,
      endDateTime,
      attendeeName
    });

    console.log('Result:', result);

    res.json(result);
  } catch (error) {
    console.error('\n❌ Create Event Error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Check availability endpoint (for testing)
app.post('/api/check-availability', async (req, res) => {
  try {
    console.log('\n=== Availability Check Request ===');
    const { startDateTime, endDateTime } = req.body;

    if (!startDateTime || !endDateTime) {
      return res.status(400).json({ 
        success: false,
        error: 'startDateTime and endDateTime are required',
        receivedData: req.body
      });
    }

    console.log('Checking:', { startDateTime, endDateTime });

    const available = await checkAvailability(startDateTime, endDateTime);
    
    res.json({ 
      available,
      startDateTime,
      endDateTime,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('\n❌ Availability Check Error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'POST /webhook/vapi',
      'POST /api/create-event',
      'POST /api/check-availability'
    ]
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Global Error Handler:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║   Voice Scheduling Agent - Backend Server     ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📅 Calendar integration: ${process.env.GOOGLE_CLIENT_ID ? '✓ Configured' : '✗ Not configured'}`);
  console.log(`🔗 Local URL: http://localhost:${PORT}`);
  console.log(`🔗 Webhook URL: http://localhost:${PORT}/webhook/vapi`);
  console.log('\n📍 Endpoints:');
  console.log('   GET  /              - Health check & info');
  console.log('   GET  /health        - Health status');
  console.log('   POST /webhook/vapi  - VAPI webhook');
  console.log('   POST /api/create-event - Create event (testing)');
  console.log('   POST /api/check-availability - Check availability');
  console.log('\n⏰ Server started at:', new Date().toISOString());
  console.log('════════════════════════════════════════════════\n');
});