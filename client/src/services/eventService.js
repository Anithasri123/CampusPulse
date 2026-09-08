import { api } from './api.js';

export const eventService = {
  /**
   * Fetch events with optional query parameters (search, category, status)
   */
  async getEvents({ search = '', category = '', status = '' } = {}) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category && category !== 'All') params.append('category', category);
    if (status && status !== 'All') params.append('status', status);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await api.get(`/events${queryString}`);
  },

  /**
   * Fetch single event by ID
   */
  async getEventById(id) {
    return await api.get(`/events/${id}`);
  },

  /**
   * Create a new event (Admin only)
   */
  async createEvent(eventData) {
    return await api.post('/events', eventData);
  },

  /**
   * Update an existing event (Admin only)
   */
  async updateEvent(id, eventData) {
    return await api.put(`/events/${id}`, eventData);
  },

  /**
   * Soft cancel or delete an event (Admin only)
   */
  async deleteEvent(id, { hard = false } = {}) {
    const endpoint = hard ? `/events/${id}?hard=true` : `/events/${id}`;
    return await api.delete(endpoint);
  },

  /**
   * Soft cancel event shortcut (Admin only)
   */
  async cancelEvent(id) {
    return await api.patch(`/events/${id}/cancel`);
  },
};
