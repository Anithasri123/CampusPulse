import { api } from './api.js';

export const registrationService = {
  /**
   * Register active student for an event using authenticated identity
   */
  async registerForEvent(eventId) {
    return await api.post(`/events/${eventId}/register`);
  },

  /**
   * Cancel active student registration for an event
   */
  async cancelRegistration(eventId) {
    return await api.delete(`/events/${eventId}/register`);
  },

  /**
   * Get all active registered events for current authenticated student (or specific user ID for admins)
   */
  async getUserRegistrations(userId = 'me') {
    return await api.get(`/users/${userId}/events`);
  },

  /**
   * Get participants list for a specific event (Admin only)
   */
  async getEventRegistrations(eventId) {
    return await api.get(`/events/${eventId}/registrations`);
  },
};
