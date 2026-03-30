const { google } = require('googleapis')
const {
  GOOGLE_CLIENT_EMAIL,
  GOOGLE_PRIVATE_KEY,
  GOOGLE_CALENDAR_ID,
  GOOGLE_OWNER_EMAIL,
} = require('../config/env')

function getPrivateKey() {
  // In .env files, newlines are often escaped as \n
  const pk = GOOGLE_PRIVATE_KEY || ''
  return pk.replace(/\\n/g, '\n')
}

async function createMeetEvent({
  summary,
  description,
  startDateTime,
  endDateTime,
  timeZone = 'Asia/Kolkata',
  attendees = [],
}) {
  if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_CALENDAR_ID) {
    throw new Error('Google Calendar env vars missing.')
  }

  const auth = new google.auth.JWT({
    email: GOOGLE_CLIENT_EMAIL,
    key: getPrivateKey(),
    scopes: ['https://www.googleapis.com/auth/calendar.events'],
  })

  const calendar = google.calendar({ version: 'v3', auth })

  const requestId = `meet-${Date.now()}`
  const meetAttendees = [
    ...attendees,
    ...(GOOGLE_OWNER_EMAIL ? [{ email: GOOGLE_OWNER_EMAIL }] : []),
  ]

  const event = await calendar.events.insert({
    calendarId: GOOGLE_CALENDAR_ID,
    conferenceDataVersion: 1,
    requestBody: {
      summary,
      description,
      start: { dateTime: startDateTime, timeZone },
      end: { dateTime: endDateTime, timeZone },
      attendees: meetAttendees,
      conferenceData: {
        createRequest: {
          conferenceSolutionKey: { type: 'hangoutsMeet' },
          requestId,
        },
      },
    },
  })

  const meetLink =
    event?.data?.conferenceData?.entryPoints?.find((x) => x.entryPointType === 'video')?.uri ||
    event?.data?.conferenceData?.entryPoints?.[0]?.uri

  return {
    googleEventId: event.data.id,
    meetLink,
    htmlLink: event.data.htmlLink,
  }
}

module.exports = { createMeetEvent }

