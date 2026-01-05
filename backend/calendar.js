const { google } = require('googleapis');
require('dotenv').config();

// Initialize OAuth2 client with credentials from environment variables
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth/callback'
);

// Set refresh token for authentication
if (process.env.GOOGLE_REFRESH_TOKEN) {
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  });
  console.log('✓ Google Calendar credentials loaded');
} else {
  console.warn('⚠️  GOOGLE_REFRESH_TOKEN not found in environment variables');
}

// Initialize Calendar API
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

/**
 * Create a calendar event in Google Calendar
 * @param {Object} eventDetails - Event details
 * @param {string} eventDetails.summary - Event title/summary
 * @param {string} eventDetails.startDateTime - ISO format date-time string
 * @param {string} eventDetails.endDateTime - ISO format date-time string (optional)
 * @param {string} eventDetails.attendeeName - Name of the person scheduling
 * @param {string} eventDetails.description - Event description (optional)
 * @param {string} eventDetails.location - Event location (optional)
 * @returns {Promise<Object>} Created event details or error
 */
async function createCalendarEvent(eventDetails) {
  try {
    const { 
      summary, 
      startDateTime, 
      endDateTime, 
      attendeeName,
      description,
      location 
    } = eventDetails;

    console.log('\n📅 Creating Calendar Event:');
    console.log('   Name:', attendeeName);
    console.log('   Title:', summary || `Meeting with ${attendeeName}`);
    console.log('   Start:', startDateTime);

    // Validate required fields
    if (!startDateTime) {
      throw new Error('startDateTime is required');
    }

    if (!attendeeName) {
      throw new Error('attendeeName is required');
    }

    // Parse and validate date
    const start = new Date(startDateTime);
    if (isNaN(start.getTime())) {
      throw new Error('Invalid startDateTime format. Use ISO 8601 format.');
    }

    // Calculate end time (1 hour after start if not provided)
    const end = endDateTime 
      ? new Date(endDateTime) 
      : new Date(start.getTime() + 60 * 60 * 1000); // +1 hour

    if (isNaN(end.getTime())) {
      throw new Error('Invalid endDateTime format. Use ISO 8601 format.');
    }

    // Prepare event object
    const event = {
      summary: summary || `Meeting with ${attendeeName}`,
      description: description || `Scheduled via Voice Scheduling Agent for ${attendeeName}`,
      location: location || '',
      start: {
        dateTime: start.toISOString(),
        timeZone: process.env.TIMEZONE || 'Asia/Kolkata',
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: process.env.TIMEZONE || 'Asia/Kolkata',
      },
      attendees: [
        // You can add attendee emails here if needed
        // { email: 'attendee@example.com' }
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 30 },      // 30 minutes before
        ],
      },
      // Color: 1-11 (optional)
      colorId: '9', // Blue
    };

    console.log('\n   Sending to Google Calendar API...');

    // Create the event
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      sendUpdates: 'none', // Don't send email invitations
    });

    console.log('✓ Event created successfully!');
    console.log('   Event ID:', response.data.id);
    console.log('   Event Link:', response.data.htmlLink);

    // Return success response
    return {
      success: true,
      eventId: response.data.id,
      eventLink: response.data.htmlLink,
      summary: response.data.summary,
      startTime: response.data.start.dateTime,
      endTime: response.data.end.dateTime,
      attendeeName: attendeeName,
      message: `Successfully created event: ${response.data.summary}`,
    };

  } catch (error) {
    console.error('\n❌ Error creating calendar event:');
    console.error('   Error:', error.message);
    
    // Handle specific Google API errors
    if (error.code === 401) {
      console.error('   → Authentication failed. Check your refresh token.');
    } else if (error.code === 403) {
      console.error('   → Permission denied. Ensure Calendar API is enabled.');
    } else if (error.code === 404) {
      console.error('   → Calendar not found.');
    }

    return {
      success: false,
      error: error.message,
      errorCode: error.code,
      message: 'Failed to create calendar event',
    };
  }
}

/**
 * Check if a time slot is available (no conflicting events)
 * @param {string} startDateTime - ISO format date-time string
 * @param {string} endDateTime - ISO format date-time string
 * @returns {Promise<boolean>} True if slot is available, false if busy
 */
async function checkAvailability(startDateTime, endDateTime) {
  try {
    console.log('\n🔍 Checking Calendar Availability:');
    console.log('   Start:', startDateTime);
    console.log('   End:', endDateTime);

    const response = await calendar.freebusy.query({
      resource: {
        timeMin: startDateTime,
        timeMax: endDateTime,
        timeZone: process.env.TIMEZONE || 'Asia/Kolkata',
        items: [{ id: 'primary' }],
      },
    });

    const busy = response.data.calendars.primary.busy || [];
    const isAvailable = busy.length === 0;

    console.log(`   Result: ${isAvailable ? 'Available ✓' : 'Busy ✗'}`);
    
    if (!isAvailable) {
      console.log('   Busy periods:', busy);
    }

    return isAvailable;

  } catch (error) {
    console.error('\n❌ Error checking availability:');
    console.error('   Error:', error.message);
    
    // Assume available on error (fail open)
    console.warn('   Assuming available due to error');
    return true;
  }
}

/**
 * List upcoming events from calendar
 * @param {number} maxResults - Maximum number of events to return (default: 10)
 * @returns {Promise<Array>} Array of upcoming events
 */
async function listUpcomingEvents(maxResults = 10) {
  try {
    console.log(`\n📋 Fetching upcoming ${maxResults} events...`);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];
    
    console.log(`   Found ${events.length} upcoming events`);

    return events.map(event => ({
      id: event.id,
      summary: event.summary,
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      link: event.htmlLink,
    }));

  } catch (error) {
    console.error('\n❌ Error listing events:');
    console.error('   Error:', error.message);
    return [];
  }
}

/**
 * Delete a calendar event
 * @param {string} eventId - The event ID to delete
 * @returns {Promise<Object>} Deletion result
 */
async function deleteCalendarEvent(eventId) {
  try {
    console.log(`\n🗑️  Deleting event: ${eventId}`);

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
    });

    console.log('✓ Event deleted successfully');

    return {
      success: true,
      message: 'Event deleted successfully',
      eventId: eventId,
    };

  } catch (error) {
    console.error('\n❌ Error deleting event:');
    console.error('   Error:', error.message);

    return {
      success: false,
      error: error.message,
      eventId: eventId,
    };
  }
}

// Export functions
module.exports = {
  createCalendarEvent,
  checkAvailability,
  listUpcomingEvents,
  deleteCalendarEvent,
};