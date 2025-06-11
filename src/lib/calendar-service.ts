import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { createEvent } from 'ics';

// =====================================
// TYPES
// =====================================

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  timeZone?: string;
  attendees?: { email: string; name?: string }[];
  location?: string;
  meetingUrl?: string;
}

export interface CalendarIntegration {
  provider: 'google' | 'outlook' | 'ics';
  accessToken?: string;
  refreshToken?: string;
  userId: string;
}

export interface ICSEventData {
  start: [number, number, number, number, number];
  end: [number, number, number, number, number];
  title: string;
  description?: string;
  location?: string;
  url?: string;
  attendees?: { name?: string; email: string }[];
}

// =====================================
// GOOGLE CALENDAR SERVICE
// =====================================

class CalendarService {
  private oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  // =====================================
  // OAUTH AUTHENTICATION
  // =====================================

  getAuthUrl(userId: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: userId, // Pass user ID to associate the tokens
      prompt: 'consent' // Force consent screen to get refresh token
    });
  }

  async exchangeCodeForTokens(code: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiryDate?: number;
  }> {
    try {
      const { tokens } = await this.oauth2Client.getAccessToken(code);
      
      if (!tokens.access_token) {
        throw new Error('No access token received from Google');
      }

      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || undefined,
        expiryDate: tokens.expiry_date || undefined,
      };
    } catch (error) {
      console.error('❌ Failed to exchange code for tokens:', error);
      throw error;
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    expiryDate?: number;
  }> {
    try {
      this.oauth2Client.setCredentials({
        refresh_token: refreshToken
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();

      if (!credentials.access_token) {
        throw new Error('Failed to refresh access token');
      }

      return {
        accessToken: credentials.access_token,
        expiryDate: credentials.expiry_date || undefined,
      };
    } catch (error) {
      console.error('❌ Failed to refresh access token:', error);
      throw error;
    }
  }

  // =====================================
  // CALENDAR OPERATIONS
  // =====================================

  async createCalendarEvent(
    accessToken: string,
    eventData: CalendarEvent
  ): Promise<{ eventId: string; htmlLink: string }> {
    try {
      this.oauth2Client.setCredentials({
        access_token: accessToken
      });

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      const googleEvent = {
        summary: eventData.summary,
        description: this.buildEventDescription(eventData),
        start: {
          dateTime: eventData.startDateTime,
          timeZone: eventData.timeZone || 'UTC',
        },
        end: {
          dateTime: eventData.endDateTime,
          timeZone: eventData.timeZone || 'UTC',
        },
        attendees: eventData.attendees?.map(attendee => ({
          email: attendee.email,
          displayName: attendee.name,
        })),
        location: eventData.location,
        conferenceData: eventData.meetingUrl ? {
          entryPoints: [{
            entryPointType: 'video',
            uri: eventData.meetingUrl,
            label: 'Join Meetopia Meeting'
          }],
          conferenceSolution: {
            key: {
              type: 'hangoutsMeet'
            }
          }
        } : undefined,
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 24 hours
            { method: 'popup', minutes: 10 }, // 10 minutes
          ],
        },
        sendUpdates: 'all', // Send invitations to all attendees
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: googleEvent,
        conferenceDataVersion: 1,
      });

      const event = response.data;
      
      if (!event.id || !event.htmlLink) {
        throw new Error('Failed to create calendar event - missing event data');
      }

      console.log('✅ Google Calendar event created:', event.id);

      return {
        eventId: event.id,
        htmlLink: event.htmlLink,
      };
    } catch (error) {
      console.error('❌ Failed to create Google Calendar event:', error);
      throw error;
    }
  }

  async updateCalendarEvent(
    accessToken: string,
    eventId: string,
    eventData: Partial<CalendarEvent>
  ): Promise<void> {
    try {
      this.oauth2Client.setCredentials({
        access_token: accessToken
      });

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      const updateData: any = {};
      
      if (eventData.summary) updateData.summary = eventData.summary;
      if (eventData.description) updateData.description = this.buildEventDescription(eventData as CalendarEvent);
      if (eventData.startDateTime) {
        updateData.start = {
          dateTime: eventData.startDateTime,
          timeZone: eventData.timeZone || 'UTC',
        };
      }
      if (eventData.endDateTime) {
        updateData.end = {
          dateTime: eventData.endDateTime,
          timeZone: eventData.timeZone || 'UTC',
        };
      }
      if (eventData.attendees) {
        updateData.attendees = eventData.attendees.map(attendee => ({
          email: attendee.email,
          displayName: attendee.name,
        }));
      }

      await calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        requestBody: updateData,
        sendUpdates: 'all',
      });

      console.log('✅ Google Calendar event updated:', eventId);
    } catch (error) {
      console.error('❌ Failed to update Google Calendar event:', error);
      throw error;
    }
  }

  async deleteCalendarEvent(accessToken: string, eventId: string): Promise<void> {
    try {
      this.oauth2Client.setCredentials({
        access_token: accessToken
      });

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      await calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
        sendUpdates: 'all',
      });

      console.log('✅ Google Calendar event deleted:', eventId);
    } catch (error) {
      console.error('❌ Failed to delete Google Calendar event:', error);
      throw error;
    }
  }

  // =====================================
  // ICS FILE GENERATION
  // =====================================

  generateICSFile(eventData: CalendarEvent): { filename: string; content: string } {
    try {
      const startDate = new Date(eventData.startDateTime);
      const endDate = new Date(eventData.endDateTime);

      const icsEventData: ICSEventData = {
        start: [
          startDate.getFullYear(),
          startDate.getMonth() + 1,
          startDate.getDate(),
          startDate.getHours(),
          startDate.getMinutes()
        ],
        end: [
          endDate.getFullYear(),
          endDate.getMonth() + 1,
          endDate.getDate(),
          endDate.getHours(),
          endDate.getMinutes()
        ],
        title: eventData.summary,
        description: this.buildEventDescription(eventData),
        location: eventData.location,
        url: eventData.meetingUrl,
        attendees: eventData.attendees?.map(attendee => ({
          name: attendee.name,
          email: attendee.email,
        })),
      };

      const { error, value } = createEvent(icsEventData);

      if (error) {
        throw new Error(`Failed to generate ICS file: ${error}`);
      }

      const filename = `meetopia-${eventData.summary.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.ics`;

      console.log('✅ ICS file generated:', filename);

      return {
        filename,
        content: value || '',
      };
    } catch (error) {
      console.error('❌ Failed to generate ICS file:', error);
      throw error;
    }
  }

  // =====================================
  // UTILITY METHODS
  // =====================================

  private buildEventDescription(eventData: CalendarEvent): string {
    let description = eventData.description || '';
    
    if (eventData.meetingUrl) {
      description += `\n\n🎥 Join Meetopia Meeting: ${eventData.meetingUrl}`;
    }

    description += '\n\n📅 Powered by Meetopia - Enterprise Meeting Platform';
    
    return description;
  }

  // =====================================
  // USER PROFILE INFORMATION
  // =====================================

  async getUserProfile(accessToken: string): Promise<{
    id: string;
    email: string;
    name: string;
    picture?: string;
  }> {
    try {
      this.oauth2Client.setCredentials({
        access_token: accessToken
      });

      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const response = await oauth2.userinfo.get();

      const profile = response.data;

      if (!profile.id || !profile.email) {
        throw new Error('Failed to get user profile information');
      }

      return {
        id: profile.id,
        email: profile.email,
        name: profile.name || profile.email,
        picture: profile.picture || undefined,
      };
    } catch (error) {
      console.error('❌ Failed to get user profile:', error);
      throw error;
    }
  }

  // =====================================
  // CALENDAR AVAILABILITY CHECK
  // =====================================

  async checkAvailability(
    accessToken: string,
    startDateTime: string,
    endDateTime: string
  ): Promise<{ isAvailable: boolean; conflictingEvents: any[] }> {
    try {
      this.oauth2Client.setCredentials({
        access_token: accessToken
      });

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      const response = await calendar.freebusy.query({
        requestBody: {
          timeMin: startDateTime,
          timeMax: endDateTime,
          items: [{ id: 'primary' }],
        },
      });

      const busy = response.data.calendars?.primary?.busy || [];
      const isAvailable = busy.length === 0;

      console.log(`📅 Availability check: ${isAvailable ? 'Available' : 'Busy'}`);

      return {
        isAvailable,
        conflictingEvents: busy,
      };
    } catch (error) {
      console.error('❌ Failed to check availability:', error);
      throw error;
    }
  }
}

// =====================================
// SINGLETON INSTANCE
// =====================================

export const calendarService = new CalendarService();

// =====================================
// EXPORT
// =====================================

export default CalendarService; 