import mongoose from 'mongoose';
import { Event } from '../models/Event.js';
import { emitToEventRoom } from '../sockets/socketHandler.js';

/**
 * @desc    Get all events with optional search, category, and status filtering
 * @route   GET /api/events
 * @access  Public
 */
export const getEvents = async (req, res, next) => {
  try {
    const { search, category, status } = req.query;
    const filter = {};

    // Category filter
    if (category && category !== 'All') {
      filter.category = category;
    }

    // Status filter
    if (status && status !== 'All') {
      filter.status = status;
    }

    // Search filter
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { organizer: searchRegex },
        { category: searchRegex },
        { description: searchRegex },
      ];
    }

    const events = await Event.find(filter).sort({ date: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single event by ID
 * @route   GET /api/events/:id
 * @access  Public
 */
export const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Event ID format',
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new event
 * @route   POST /api/events
 * @access  Public (unsecured in Phase 2)
 */
export const createEvent = async (req, res, next) => {
  try {
    const { title, description, category, date, time, venue, organizer } = req.body;

    if (!title || !description || !category || !date || !time || !venue || !organizer) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, category, date, time, venue, organizer.',
      });
    }

    const eventData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const newEvent = await Event.create(eventData);

    return res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: newEvent,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    next(error);
  }
};

/**
 * @desc    Update an existing event
 * @route   PUT /api/events/:id
 * @access  Public (unsecured in Phase 2)
 */
export const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Event ID format',
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Real-Time Socket.IO Broadcast
    emitToEventRoom(id, 'event-updated', {
      eventId: id,
      event: updatedEvent,
    });

    return res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    next(error);
  }
};

/**
 * @desc    Cancel or delete an event
 * @route   DELETE /api/events/:id or PATCH /api/events/:id/cancel
 * @access  Public (unsecured in Phase 2)
 */
export const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { hard } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Event ID format',
      });
    }

    if (hard === 'true') {
      const deletedEvent = await Event.findByIdAndDelete(id);
      if (!deletedEvent) {
        return res.status(404).json({
          success: false,
          message: 'Event not found',
        });
      }

      emitToEventRoom(id, 'event-cancelled', {
        eventId: id,
        status: 'CANCELLED',
      });

      return res.status(200).json({
        success: true,
        message: 'Event permanently deleted',
        data: deletedEvent,
      });
    }

    // Default: Soft cancellation
    const cancelledEvent = await Event.findByIdAndUpdate(
      id,
      { status: 'CANCELLED' },
      { new: true }
    );

    if (!cancelledEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Real-Time Socket.IO Broadcast for Cancellation
    emitToEventRoom(id, 'event-cancelled', {
      eventId: id,
      status: 'CANCELLED',
      event: cancelledEvent,
    });

    return res.status(200).json({
      success: true,
      message: 'Event status marked as CANCELLED',
      data: cancelledEvent,
    });
  } catch (error) {
    next(error);
  }
};
