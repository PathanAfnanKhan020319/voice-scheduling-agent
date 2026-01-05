const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log(`\n${colors.bright}${colors.blue}${'='.repeat(50)}`);
  console.log(`  ${title}`);
  console.log(`${'='.repeat(50)}${colors.reset}\n`);
}

// Test 1: Health Check
async function testHealthCheck() {
  logSection('Test 1: Health Check');
  try {
    log('cyan', `GET ${BASE_URL}/`);
    const response = await axios.get(`${BASE_URL}/`);
    
    log('green', '✓ Health check passed');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    log('red', '✗ Health check failed');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    return false;
  }
}

// Test 2: Create Calendar Event with valid data
async function testCreateEvent() {
  logSection('Test 2: Create Calendar Event (Valid Data)');
  
  // Create event for tomorrow at 2 PM
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);

  const eventData = {
    attendeeName: 'Test User',
    startDateTime: tomorrow.toISOString(),
    summary: 'Test Meeting via API - ' + new Date().toLocaleString(),
  };

  try {
    log('cyan', `POST ${BASE_URL}/api/create-event`);
    log('yellow', 'Request Body:');
    console.log(JSON.stringify(eventData, null, 2));
    
    const response = await axios.post(`${BASE_URL}/api/create-event`, eventData);
    
    if (response.data.success) {
      log('green', '✓ Event created successfully!');
      console.log('\nEvent Details:');
      console.log(`  Event ID: ${response.data.eventId}`);
      console.log(`  Summary: ${response.data.summary}`);
      console.log(`  Start: ${response.data.startTime}`);
      console.log(`  Link: ${response.data.eventLink}`);
      log('magenta', '\n📅 Check your Google Calendar to see the event!');
      return true;
    } else {
      log('red', '✗ Event creation failed');
      console.error('Response:', response.data);
      return false;
    }
  } catch (error) {
    log('red', '✗ Event creation failed');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    return false;
  }
}

// Test 3: Create Event with missing data (should fail)
async function testCreateEventInvalid() {
  logSection('Test 3: Create Event (Invalid Data - Should Fail)');
  
  const invalidData = {
    // Missing required fields
    summary: 'Invalid Test Meeting',
  };

  try {
    log('cyan', `POST ${BASE_URL}/api/create-event`);
    log('yellow', 'Request Body (intentionally invalid):');
    console.log(JSON.stringify(invalidData, null, 2));
    
    const response = await axios.post(`${BASE_URL}/api/create-event`, invalidData);
    
    if (!response.data.success) {
      log('green', '✓ Validation working correctly (request rejected as expected)');
      console.log('Error message:', response.data.error);
      return true;
    } else {
      log('red', '✗ Validation failed (should have rejected invalid data)');
      return false;
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log('green', '✓ Validation working correctly (400 Bad Request)');
      console.log('Error message:', error.response.data.error);
      return true;
    } else {
      log('red', '✗ Unexpected error');
      console.error('Error:', error.message);
      return false;
    }
  }
}

// Test 4: Check Availability
async function testCheckAvailability() {
  logSection('Test 4: Check Availability');
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(15, 0, 0, 0);
  
  const endTime = new Date(tomorrow);
  endTime.setHours(16, 0, 0, 0);

  const availabilityData = {
    startDateTime: tomorrow.toISOString(),
    endDateTime: endTime.toISOString(),
  };

  try {
    log('cyan', `POST ${BASE_URL}/api/check-availability`);
    log('yellow', 'Checking availability for:');
    console.log(`  Start: ${tomorrow.toLocaleString()}`);
    console.log(`  End: ${endTime.toLocaleString()}`);
    
    const response = await axios.post(
      `${BASE_URL}/api/check-availability`,
      availabilityData
    );
    
    if (response.data.available !== undefined) {
      log('green', '✓ Availability check successful');
      console.log(`\nResult: ${response.data.available ? '✓ Available' : '✗ Busy'}`);
      return true;
    } else {
      log('red', '✗ Invalid response format');
      console.error('Response:', response.data);
      return false;
    }
  } catch (error) {
    log('red', '✗ Availability check failed');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    return false;
  }
}

// Test 5: VAPI Webhook Simulation
async function testVAPIWebhook() {
  logSection('Test 5: VAPI Webhook Simulation');
  
  const webhookPayload = {
    message: {
      type: 'function-call',
      functionCall: {
        name: 'createCalendarEvent',
        parameters: {
          attendeeName: 'VAPI Test User',
          startDateTime: new Date(Date.now() + 86400000).toISOString(),
          summary: 'Webhook Test Meeting - ' + new Date().toLocaleString(),
        },
      },
    },
    call: {
      id: 'test-call-' + Date.now(),
      status: 'in-progress',
    },
  };

  try {
    log('cyan', `POST ${BASE_URL}/webhook/vapi`);
    log('yellow', 'Simulating VAPI webhook call...');
    console.log('Payload:', JSON.stringify(webhookPayload, null, 2));
    
    const response = await axios.post(`${BASE_URL}/webhook/vapi`, webhookPayload);
    
    if (response.data.results && response.data.results[0].result.success) {
      log('green', '✓ Webhook handled successfully');
      console.log('\nWebhook Response:');
      console.log(JSON.stringify(response.data, null, 2));
      return true;
    } else if (response.data.results) {
      log('yellow', '⚠ Webhook returned unsuccessful result');
      console.log('Response:', response.data);
      return false;
    } else {
      log('red', '✗ Unexpected webhook response');
      console.error('Response:', response.data);
      return false;
    }
  } catch (error) {
    log('red', '✗ Webhook test failed');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    return false;
  }
}

// Test 6: 404 Error Handling
async function test404Handler() {
  logSection('Test 6: 404 Error Handling');
  
  try {
    log('cyan', `GET ${BASE_URL}/nonexistent-endpoint`);
    await axios.get(`${BASE_URL}/nonexistent-endpoint`);
    
    log('red', '✗ Should have returned 404');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      log('green', '✓ 404 handler working correctly');
      console.log('Response:', error.response.data);
      return true;
    } else {
      log('red', '✗ Unexpected error');
      console.error('Error:', error.message);
      return false;
    }
  }
}

// Run all tests
async function runAllTests() {
  console.log(`\n${colors.bright}${colors.magenta}`);
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║                                                        ║');
  console.log('║     Voice Scheduling Agent - API Test Suite          ║');
  console.log('║                                                        ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(colors.reset);
  
  log('yellow', `\n🔗 Testing against: ${BASE_URL}`);
  log('yellow', `⏰ Test started at: ${new Date().toLocaleString()}\n`);

  const results = {
    healthCheck: await testHealthCheck(),
    createEvent: await testCreateEvent(),
    createEventInvalid: await testCreateEventInvalid(),
    checkAvailability: await testCheckAvailability(),
    vapiWebhook: await testVAPIWebhook(),
    handler404: await test404Handler(),
  };

  // Wait a moment before showing summary
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Summary
  logSection('Test Summary');
  
  const testNames = {
    healthCheck: 'Health Check',
    createEvent: 'Create Event (Valid)',
    createEventInvalid: 'Create Event (Invalid)',
    checkAvailability: 'Check Availability',
    vapiWebhook: 'VAPI Webhook',
    handler404: '404 Handler',
  };

  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✓' : '✗';
    const color = passed ? 'green' : 'red';
    log(color, `${status} ${testNames[test]}`);
  });

  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  const percentage = ((passed / total) * 100).toFixed(0);

  console.log('\n' + '─'.repeat(50));
  log('bright', `\nTotal: ${passed}/${total} tests passed (${percentage}%)`);
  
  if (passed === total) {
    log('green', '\n🎉 All tests passed! Your API is ready for deployment.');
    log('cyan', '\n📝 Next steps:');
    console.log('   1. Deploy to Railway/Render');
    console.log('   2. Configure VAPI webhook');
    console.log('   3. Test the voice assistant');
    console.log('   4. Record demo video\n');
  } else if (passed >= total * 0.7) {
    log('yellow', '\n⚠️  Most tests passed, but some issues detected.');
    log('cyan', '\n📝 Review the failed tests above and fix the issues.\n');
  } else {
    log('red', '\n❌ Multiple tests failed. Please review the errors above.');
    log('cyan', '\n📝 Common issues:');
    console.log('   • Server not running (run `npm start`)');
    console.log('   • Google Calendar not configured');
    console.log('   • Missing environment variables\n');
  }

  log('yellow', `⏰ Test completed at: ${new Date().toLocaleString()}\n`);
}

// Execute tests
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('\n❌ Test suite crashed:');
    console.error(error);
    process.exit(1);
  });
}

module.exports = { runAllTests };