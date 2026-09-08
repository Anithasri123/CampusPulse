import express from 'express';
import {
  registerForEvent,
  cancelRegistration,
  getEventRegistrations,
} from '../controllers/registrationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router({ mergeParams: true });

// Mounted under /api/events
router.post('/:id/register', protect, registerForEvent);
router.delete('/:id/register', protect, cancelRegistration);
router.get('/:id/registrations', protect, authorizeRoles('admin'), getEventRegistrations);

export default router;

