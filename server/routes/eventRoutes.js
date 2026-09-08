import express from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getEvents)
  .post(protect, authorizeRoles('admin'), createEvent);

router.route('/:id')
  .get(getEventById)
  .put(protect, authorizeRoles('admin'), updateEvent)
  .delete(protect, authorizeRoles('admin'), deleteEvent);

router.patch('/:id/cancel', protect, authorizeRoles('admin'), deleteEvent);

export default router;

