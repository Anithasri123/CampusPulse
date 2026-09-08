import mongoose from 'mongoose';
import { Registration } from '../models/Registration.js';
import { Event } from '../models/Event.js';
import { User } from '../models/User.js';
import { emitToEventRoom } from '../sockets/socketHandler.js';

/**
 * Helper to resolve user ID from request body, query, or headers
 */
const getUserIdFromReq = (req) => {
  return (
    req.body.userId ||
    req.query.userId ||
    req.headers['x-user-id'] ||
    req.headers['user-id']
  );
};

/**
 * @desc    Register a student for an event
 * @route   POST /api/events/:id/register
 * @access  Private (Student/Authenticated)
 */
export const registerForEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    // Derive user ID exclusively from authenticated identity (fallback to req body for backward compatibility if needed)
    const userId = req.user ? req.user._id : getUserIdFromReq(req);

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid User ID is required for registration.',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Event ID format.',
      });
    }

    // Verify User exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User identity not found in database.',
      });
    }

    // Verify Event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    // Validation 1: Event status must be OPEN
    if (event.status !== 'OPEN') {
      return res.status(400).json({
        success: false,
        message: `Cannot register. Event status is ${event.status}.`,
      });
    }

    // Validation 2: Registration deadline check
    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline for this event has passed.',
      });
    }

    // Validation 3: Duplicate registration check
    const existingReg = await Registration.findOne({ user: userId, event: eventId });

    if (existingReg && existingReg.status === 'REGISTERED') {
      return res.status(409).json({
        success: false,
        message: 'You are already registered for this event.',
      });
    }

    // Validation 4 & Atomic Increment: Capacity Check
    if (event.capacity && event.participantCount >= event.capacity) {
      return res.status(409).json({
        success: false,
        message: 'This event is full. Maximum capacity reached.',
      });
    }

    // Atomically increment participant count only if capacity is not reached
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        $or: [
          { capacity: { $exists: false } },
          { capacity: null },
          { $expr: { $lt: ['$participantCount', '$capacity'] } },
        ],
      },
      { $inc: { participantCount: 1 } },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(409).json({
        success: false,
        message: 'Registration failed. Event capacity reached during request.',
      });
    }

    // Create or reactivate registration document
    let registration;
    if (existingReg) {
      existingReg.status = 'REGISTERED';
      existingReg.registeredAt = new Date();
      registration = await existingReg.save();
    } else {
      registration = await Registration.create({
        user: userId,
        event: eventId,
        status: 'REGISTERED',
      });
    }

    // Real-Time Socket.IO Broadcast AFTER successful database mutation
    emitToEventRoom(eventId, 'participant-count-updated', {
      eventId: eventId,
      participantCount: updatedEvent.participantCount,
      action: 'register',
    });

    return res.status(201).json({
      success: true,
      message: 'Successfully registered for the event.',
      data: {
        registration,
        updatedParticipantCount: updatedEvent.participantCount,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You are already registered for this event.',
      });
    }
    next(error);
  }
};

/**
 * @desc    Cancel a student registration for an event
 * @route   DELETE /api/events/:id/register
 * @access  Private (Student/Authenticated)
 */
export const cancelRegistration = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    // Derive user ID exclusively from authenticated identity
    const userId = req.user ? req.user._id : getUserIdFromReq(req);

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid User ID is required for cancellation.',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Event ID format.',
      });
    }

    // Find active registration
    const registration = await Registration.findOne({
      user: userId,
      event: eventId,
      status: 'REGISTERED',
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'No active registration found for this event.',
      });
    }

    // Mark registration as CANCELLED
    registration.status = 'CANCELLED';
    await registration.save();

    // Atomically decrement participantCount (preventing count < 0)
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: eventId, participantCount: { $gt: 0 } },
      { $inc: { participantCount: -1 } },
      { new: true }
    );

    const newCount = updatedEvent ? updatedEvent.participantCount : 0;

    // Real-Time Socket.IO Broadcast AFTER successful database mutation
    emitToEventRoom(eventId, 'participant-count-updated', {
      eventId: eventId,
      participantCount: newCount,
      action: 'cancel',
    });

    return res.status(200).json({
      success: true,
      message: 'Registration cancelled successfully.',
      data: {
        registration,
        updatedParticipantCount: newCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get registered events for the current user or specific user ID
 * @route   GET /api/users/me/events or GET /api/users/:userId/events
 * @access  Private
 */
export const getUserRegistrations = async (req, res, next) => {
  try {
    let targetUserId;

    if (req.params.userId === 'me') {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required to view your events.',
        });
      }
      targetUserId = req.user._id;
    } else {
      targetUserId = req.params.userId;
      
      // IDOR Protection: Non-admin users cannot access another student's events
      if (req.user && req.user.role !== 'admin' && req.user._id.toString() !== targetUserId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own registered events.',
        });
      }
    }

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid User ID format.',
      });
    }

    const registrations = await Registration.find({
      user: targetUserId,
      status: 'REGISTERED',
    })
      .populate('event')
      .sort({ registeredAt: -1 });

    const activeRegistrations = registrations.filter((reg) => reg.event !== null);

    return res.status(200).json({
      success: true,
      count: activeRegistrations.length,
      data: activeRegistrations,
    });
  } catch (error) {
    next(error);
  }
};


/**
 * @desc    Get participants list for an event
 * @route   GET /api/events/:id/registrations
 * @access  Public
 */
export const getEventRegistrations = async (req, res, next) => {
  try {
    const eventId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Event ID format.',
      });
    }

    const registrations = await Registration.find({
      event: eventId,
      status: 'REGISTERED',
    })
      .populate('user', 'name email role')
      .sort({ registeredAt: 1 });

    return res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    next(error);
  }
};
