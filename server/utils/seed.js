import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Event } from '../models/Event.js';
import { User } from '../models/User.js';
import { Registration } from '../models/Registration.js';

dotenv.config();

const sampleEvents = [
  {
    title: 'Campus Hackathon 2026',
    description: 'Build innovative solutions with your campus community in an intense 24-hour coding sprint. Food, swags & top prize pool included!',
    category: 'Hackathon',
    date: new Date('2026-09-20T10:00:00Z'),
    time: '10:00 AM',
    venue: 'Main Auditorium & Innovation Lab',
    organizer: 'Computer Science Club',
    registrationDeadline: new Date('2026-09-18T23:59:59Z'),
    capacity: 200,
    banner: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80',
    status: 'OPEN',
    participantCount: 83,
  },
  {
    title: 'Generative AI Masterclass',
    description: 'Hands-on masterclass on building modern LLM applications, prompt engineering techniques, and RAG pipelines.',
    category: 'Workshop',
    date: new Date('2026-09-24T14:00:00Z'),
    time: '02:00 PM',
    venue: 'Innovation Hub Lab 3',
    organizer: 'AI & ML Society',
    registrationDeadline: new Date('2026-09-23T18:00:00Z'),
    capacity: 80,
    banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
    status: 'OPEN',
    participantCount: 45,
  },
  {
    title: 'Annual Campus Sports Meet',
    description: 'Compete in track & field, basketball, badminton, and soccer. Represent your department and win trophies!',
    category: 'Sports',
    date: new Date('2026-10-02T08:00:00Z'),
    time: '08:00 AM',
    venue: 'Central Athletic Ground',
    organizer: 'Sports Board',
    registrationDeadline: new Date('2026-09-30T20:00:00Z'),
    capacity: 500,
    banner: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1000&q=80',
    status: 'OPEN',
    participantCount: 156,
  },
  {
    title: 'Autumn Cultural Festival',
    description: 'A celebration of music, dance, theater, and art featuring student bands, dance troupes, and local food stalls.',
    category: 'Cultural',
    date: new Date('2026-10-10T17:00:00Z'),
    time: '05:00 PM',
    venue: 'Open Air Theater',
    organizer: 'Cultural Committee',
    registrationDeadline: new Date('2026-10-09T23:59:59Z'),
    capacity: 1000,
    banner: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80',
    status: 'OPEN',
    participantCount: 240,
  },
  {
    title: 'Robotics & Hardware Showcase',
    description: 'Showcase your robotics models, IoT prototypes, and automation devices to industry judges and peers.',
    category: 'Competition',
    date: new Date('2026-10-15T11:00:00Z'),
    time: '11:00 AM',
    venue: 'Robotics Center Hall B',
    organizer: 'Robotics Club',
    registrationDeadline: new Date('2026-10-13T17:00:00Z'),
    capacity: 120,
    banner: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80',
    status: 'OPEN',
    participantCount: 62,
  },
  {
    title: 'Tech Career & Internship Symposium',
    description: 'Network with top hiring partners, attend resume reviews, and discover winter internship opportunities.',
    category: 'Seminar',
    date: new Date('2026-10-22T09:30:00Z'),
    time: '09:30 AM',
    venue: 'Placement Center Complex',
    organizer: 'Training & Placement Cell',
    capacity: 300,
    banner: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1000&q=80',
    status: 'OPEN',
    participantCount: 110,
  },
  {
    title: 'Cyber Security & Ethical Hacking Bootcamp',
    description: 'Learn capture-the-flag tactics, network penetration testing basics, and web security fundamentals.',
    category: 'Technology',
    date: new Date('2026-11-05T13:00:00Z'),
    time: '01:00 PM',
    venue: 'CS Department Lab 1',
    organizer: 'CyberSec Club',
    capacity: 60,
    status: 'OPEN',
    participantCount: 38,
  },
  {
    title: 'Entrepreneurship Pitch Summit',
    description: 'Pitch your startup idea to seed investors and campus mentors for equity-free grant funding.',
    category: 'Club',
    date: new Date('2026-11-12T10:00:00Z'),
    time: '10:00 AM',
    venue: 'Incubation Center Auditorium',
    organizer: 'E-Cell Campus',
    capacity: 150,
    status: 'OPEN',
    participantCount: 52,
  },
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/campuspulse';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB for seeding.');

    await Event.deleteMany({});
    await User.deleteMany({});
    await Registration.deleteMany({});
    console.log('🧹 Existing event, user, and registration records cleared.');

    // Seed Admin User
    const adminUser = await User.create({
      name: 'Campus Admin',
      email: 'admin@campuspulse.local',
      password: 'admin123',
      role: 'admin',
    });
    console.log(`👑 Seeded Admin User: ${adminUser.name} (${adminUser.email})`);

    // Seed Demo Student User
    const demoStudent = await User.create({
      name: 'Demo Student',
      email: 'student@campuspulse.local',
      password: 'student123',
      role: 'student',
    });
    console.log(`👤 Seeded Demo Student: ${demoStudent.name} (${demoStudent.email})`);

    // Attach createdBy to sample events
    const eventsToSeed = sampleEvents.map((evt) => ({
      ...evt,
      createdBy: adminUser._id,
    }));

    // Seed Events
    const createdEvents = await Event.insertMany(eventsToSeed);
    console.log(`🌱 Successfully seeded ${createdEvents.length} events into database.`);

    // Seed 1 initial registration for testing
    const firstEvent = createdEvents[0];
    await Registration.create({
      user: demoStudent._id,
      event: firstEvent._id,
      status: 'REGISTERED',
    });
    console.log(`🎟️ Seeded initial registration for Demo Student on event "${firstEvent.title}".`);

    console.log('\n🔑 Development Seed Credentials:');
    console.log('---------------------------------');
    console.log('Admin Email:   admin@campuspulse.local');
    console.log('Admin Pass:    admin123');
    console.log('Student Email: student@campuspulse.local');
    console.log('Student Pass:  student123');
    console.log('---------------------------------\n');

    await mongoose.connection.close();
    console.log('👋 Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();

