import mongoose from 'mongoose';

const ALLOWED_CATEGORIES = [
  'Technology',
  'Hackathon',
  'Workshop',
  'Seminar',
  'Cultural',
  'Sports',
  'Competition',
  'Club',
  'Other',
];

const ALLOWED_STATUSES = ['OPEN', 'CLOSED', 'CANCELLED', 'COMPLETED'];

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Event category is required'],
      enum: {
        values: ALLOWED_CATEGORIES,
        message: '{VALUE} is not a valid category',
      },
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    time: {
      type: String,
      required: [true, 'Event time is required'],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, 'Event venue is required'],
      trim: true,
    },
    organizer: {
      type: String,
      required: [true, 'Event organizer is required'],
      trim: true,
    },
    registrationDeadline: {
      type: Date,
    },
    capacity: {
      type: Number,
      min: [1, 'Capacity must be at least 1'],
    },
    banner: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ALLOWED_STATUSES,
        message: '{VALUE} is not a valid status',
      },
      default: 'OPEN',
    },
    createdBy: {
      type: String,
      trim: true,
    },
    participantCount: {
      type: Number,
      default: 0,
      min: [0, 'Participant count cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound Index for fast category, date, and status queries
eventSchema.index({ category: 1, date: 1, status: 1 });

// Text Index for basic search functionality
eventSchema.index({ title: 'text', description: 'text', organizer: 'text' });

export const Event = mongoose.model('Event', eventSchema);
export { ALLOWED_CATEGORIES, ALLOWED_STATUSES };
