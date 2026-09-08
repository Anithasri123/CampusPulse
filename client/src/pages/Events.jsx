import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Compass, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import EventCard from '../components/EventCard.jsx';
import { eventService } from '../services/eventService.js';

const CATEGORIES = [
  'All',
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

const STATUS_OPTIONS = ['All', 'OPEN', 'CLOSED', 'CANCELLED', 'COMPLETED'];

export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'All');

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await eventService.getEvents({
        search: searchTerm,
        category: selectedCategory,
        status: selectedStatus,
      });

      setEvents(data.data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedStatus]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Update URL search parameters when filters change
  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'All') newParams.delete('category');
    else newParams.set('category', cat);
    setSearchParams(newParams);
  };

  const handleStatusSelect = (st) => {
    setSelectedStatus(st);
    const newParams = new URLSearchParams(searchParams);
    if (st === 'All') newParams.delete('status');
    else newParams.set('status', st);
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header Banner */}
      <div className="glass-card p-8 rounded-3xl border border-slate-800/80 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <Compass className="w-4 h-4" />
          <span>Campus Event Discovery</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Discover Campus Events
        </h1>
        <p className="text-slate-300 max-w-2xl text-base leading-relaxed">
          Browse upcoming hackathons, tech workshops, sports competitions, and cultural festivals happening around your campus.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800/80 space-y-5">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search events by title, organizer, or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-colors shadow-md shadow-indigo-600/20"
          >
            Search
          </button>
        </form>

        {/* Filter Pills */}
        <div className="space-y-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              Category
            </span>
            <span className="text-xs text-slate-500">
              Showing {events.length} event{events.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-900/70 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mr-2">
            <Layers className="w-3.5 h-3.5" />
            Status:
          </span>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((st) => {
              const active = selectedStatus === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleStatusSelect(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-slate-700 text-slate-100 border border-slate-600'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {st}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Events Grid / Loading / Error States */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="glass-card rounded-2xl p-6 h-72 animate-pulse bg-slate-900/50 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-4 bg-slate-800 rounded w-1/3" />
                <div className="h-6 bg-slate-800 rounded w-3/4" />
                <div className="h-4 bg-slate-800 rounded w-full" />
                <div className="h-4 bg-slate-800 rounded w-2/3" />
              </div>
              <div className="h-10 bg-slate-800 rounded w-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="glass-card rounded-3xl p-10 text-center space-y-4 max-w-xl mx-auto border border-rose-500/20 bg-rose-950/20">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Could not load events</h3>
          <p className="text-sm text-slate-300">{error}</p>
          <button
            type="button"
            onClick={fetchEvents}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      ) : events.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white">No events found</h3>
          <p className="text-slate-400 text-sm">
            Try changing your search keywords or resetting your category filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
              setSelectedStatus('All');
              setSearchParams({});
            }}
            className="px-4 py-2 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 text-xs font-semibold rounded-xl border border-indigo-500/30 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event._id || event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
