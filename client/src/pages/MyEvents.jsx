import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Loader2,
  AlertCircle,
  XCircle,
  CheckCircle2,
  Sparkles,
  Compass,
} from 'lucide-react';
import { registrationService } from '../services/registrationService.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function MyEvents() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cancellation modal state
  const [cancelModalItem, setCancelModalItem] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchMyEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await registrationService.getUserRegistrations('me');
      setRegistrations(res.data || []);
    } catch (err) {
      console.error('Error fetching student registrations:', err);
      setError(err.message || 'Failed to load your registered events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyEvents();
  }, [fetchMyEvents]);

  const handleConfirmCancel = async () => {
    if (!cancelModalItem) return;
    try {
      setCancelling(true);
      const eventId = cancelModalItem.event._id || cancelModalItem.event.id;
      await registrationService.cancelRegistration(eventId);

      setCancelModalItem(null);
      fetchMyEvents();
    } catch (err) {
      console.error('Failed to cancel registration:', err);
      setError(err.message || 'Failed to cancel registration');
    } finally {
      setCancelling(false);
    }
  };


  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="glass-card p-8 rounded-3xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold">
            <Bookmark className="w-4 h-4" />
            <span>Student Dashboard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            My Registered Events
          </h1>
          <p className="text-slate-300 text-sm">
            Logged in as <strong className="text-white">{user?.name}</strong> ({user?.email})
          </p>

        </div>

        <Link
          to="/events"
          className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-md transition-colors shrink-0"
        >
          <Compass className="w-4 h-4" />
          <span>Explore Events</span>
        </Link>
      </div>

      {/* Main Registrations List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="glass-card rounded-2xl p-6 h-36 animate-pulse bg-slate-900/50" />
          ))}
        </div>
      ) : error ? (
        <div className="glass-card p-8 rounded-3xl text-center space-y-3 border border-rose-500/20 bg-rose-950/20">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <div className="text-slate-200 font-semibold">{error}</div>
          <button
            type="button"
            onClick={fetchMyEvents}
            className="px-4 py-2 bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700"
          >
            Retry
          </button>
        </div>
      ) : registrations.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center space-y-5 max-w-lg mx-auto border border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <Bookmark className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">No registrations yet</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              You haven't registered for any campus events. Discover hackathons, workshops, and sports meets happening soon!
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all"
            >
              <span>Explore Available Events</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Passes ({registrations.length})
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {registrations.map((reg) => {
              const event = reg.event;
              if (!event) return null;

              const eventId = event._id || event.id;
              const formattedDate = event.date
                ? new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'TBD';

              const registeredDate = reg.registeredAt
                ? new Date(reg.registeredAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : null;

              return (
                <div
                  key={reg._id || reg.id}
                  className="glass-card rounded-2xl p-6 border border-slate-800/80 hover:border-indigo-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {event.category}
                      </span>
                      <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        REGISTERED
                      </span>
                      {registeredDate && (
                        <span className="text-[11px] text-slate-500">
                          Registered on {registeredDate}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-white hover:text-indigo-400 transition-colors">
                      <Link to={`/events/${eventId}`}>{event.title}</Link>
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-indigo-400" />
                        <span>{formattedDate}</span>
                        {event.time && <span>• {event.time}</span>}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-rose-400" />
                        <span>{event.venue}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                    <Link
                      to={`/events/${eventId}`}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
                    >
                      View Details
                    </Link>

                    <button
                      type="button"
                      onClick={() => setCancelModalItem(reg)}
                      className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white font-semibold text-xs border border-rose-500/20 transition-all flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <XCircle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Cancel Registration?</h3>
              <p className="text-slate-300 text-sm">
                Are you sure you want to cancel your pass for <strong className="text-white">"{cancelModalItem.event.title}"</strong>?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={cancelling}
                onClick={handleConfirmCancel}
                className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Confirm Cancel</span>
                )}
              </button>

              <button
                type="button"
                disabled={cancelling}
                onClick={() => setCancelModalItem(null)}
                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-xl border border-slate-700 transition-colors"
              >
                Keep Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
