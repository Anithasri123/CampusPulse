import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Code,
  Zap,
  Wrench,
  BookOpen,
  Music,
  Trophy,
  Target,
  Users,
  Calendar,
  Compass,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import EventCard from '../components/EventCard.jsx';
import { eventService } from '../services/eventService.js';
import { mockCategories } from '../utils/mockEvents.js';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadFeaturedEvents() {
      try {
        setLoading(true);
        setError(null);
        const response = await eventService.getEvents({ status: 'OPEN' });
        setEvents(response.data.slice(0, 6)); // Display top 6 upcoming open events
      } catch (err) {
        console.error('Failed to load events on Home page:', err);
        setError(err.message || 'Could not connect to event service');
      } finally {
        setLoading(false);
      }
    }
    loadFeaturedEvents();
  }, []);

  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'Code':
        return <Code className="w-5 h-5 text-indigo-400" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-purple-400" />;
      case 'Wrench':
        return <Wrench className="w-5 h-5 text-blue-400" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5 text-cyan-400" />;
      case 'Music':
        return <Music className="w-5 h-5 text-amber-400" />;
      case 'Trophy':
        return <Trophy className="w-5 h-5 text-emerald-400" />;
      case 'Target':
        return <Target className="w-5 h-5 text-rose-400" />;
      default:
        return <Users className="w-5 h-5 text-violet-400" />;
    }
  };

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden glass-card p-8 sm:p-12 lg:p-16 border border-slate-800/80">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>The Central Campus Event Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            Discover What's Happening{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              On Your Campus
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed font-normal">
            Find hackathons, workshops, seminars, cultural events, competitions,
            sports events and more — all in one place. Never miss a landmark moment on campus.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all duration-200"
            >
              <span>Explore Events</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/my-events"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold border border-slate-700/60 hover:border-slate-600 transition-all duration-200"
            >
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>My Registrations</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Event Categories
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Filter by your interest and discover upcoming campus opportunities
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {mockCategories.map((category) => (
            <Link
              key={category.name}
              to={`/events?category=${encodeURIComponent(category.name)}`}
              className="group glass-card p-5 rounded-2xl border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-900/80 transition-all duration-200 flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                {getCategoryIcon(category.icon)}
              </div>
              <div>
                <h3 className="font-bold text-slate-200 group-hover:text-indigo-400 transition-colors text-base">
                  {category.name}
                </h3>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  {category.count}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured / Upcoming Events Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Upcoming Events
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Real-time campus events loaded from database
            </p>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>View all events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="glass-card rounded-2xl p-6 h-64 animate-pulse bg-slate-900/50 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-4 bg-slate-800 rounded w-1/3" />
                  <div className="h-6 bg-slate-800 rounded w-3/4" />
                  <div className="h-4 bg-slate-800 rounded w-full" />
                </div>
                <div className="h-10 bg-slate-800 rounded w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-500/20 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <div className="text-slate-200 font-semibold">Failed to connect to backend</div>
            <div className="text-xs text-slate-400">{error}</div>
          </div>
        ) : events.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center text-slate-400">
            No upcoming events found in database.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event._id || event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Campus Statistics Banner */}
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800/80 p-8 sm:p-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
          <div className="space-y-1">
            <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              120+
            </div>
            <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">
              Annual Events
            </div>
          </div>

          <div className="space-y-1 pt-6 sm:pt-0">
            <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              2,400+
            </div>
            <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">
              Active Students
            </div>
          </div>

          <div className="space-y-1 pt-6 sm:pt-0">
            <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              35+
            </div>
            <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">
              Campus Clubs
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative glass-card rounded-3xl p-8 sm:p-12 text-center border border-indigo-500/20 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-600/10 blur-3xl pointer-events-none rounded-full" />
        
        <div className="relative max-w-2xl mx-auto space-y-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mx-auto mb-2">
            <Compass className="w-6 h-6" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to explore your next campus experience?
          </h2>

          <p className="text-slate-300 text-base">
            Browse through hundreds of student events, hackathons, and social gatherings happening right on your campus.
          </p>

          <div className="pt-2">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition-all duration-200"
            >
              <span>Browse All Events</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
