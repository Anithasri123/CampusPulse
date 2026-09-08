import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  ArrowLeft,
  Info,
  MapPin,
  Clock,
  Users,
  User,
  AlertCircle,
  Loader2,
  AlertOctagon,
  Award,
  CheckCircle2,
  XCircle,
  X,
  Radio,
  Bell,
  Shield,
} from 'lucide-react';

import { eventService } from '../services/eventService.js';
import { registrationService } from '../services/registrationService.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  joinEventRoom,
  leaveEventRoom,
  onParticipantCountUpdated,
  offParticipantCountUpdated,
  onEventUpdated,
  offEventUpdated,
  onEventCancelled,
  offEventCancelled,
} from '../services/socket.js';

export default function EventDetails() {
  const { id } = useParams();
  const { user, isAuthenticated, isAdmin, isStudent } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Registration & User states
  const [isRegistered, setIsRegistered] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Real-time toast state
  const [liveToast, setLiveToast] = useState(null);

  const isPerformingActionRef = useRef(false);

  const loadEventData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch Event details via REST
      const eventRes = await eventService.getEventById(id);
      setEvent(eventRes.data);

      // Check if current student user is registered for this event
      if (isAuthenticated && isStudent) {
        try {
          const userRegs = await registrationService.getUserRegistrations('me');
          const registered = (userRegs.data || []).some(
            (reg) => (reg.event._id || reg.event.id || reg.event) === id
          );
          setIsRegistered(registered);
        } catch (regErr) {
          console.warn('Could not check user registration status:', regErr);
        }
      } else {
        setIsRegistered(false);
      }
    } catch (err) {
      console.error('Error loading event details:', err);
      setError(err.message || 'Event not found or failed to load');
    } finally {
      setLoading(false);
    }
  }, [id, isAuthenticated, isStudent]);


  // Initial REST fetch
  useEffect(() => {
    if (id) {
      loadEventData();
    }
  }, [id, loadEventData]);

  // Socket.IO Room Lifecycle & Real-Time Listeners
  useEffect(() => {
    if (!id) return;

    // Join Socket.IO room for this event
    joinEventRoom(id);

    // 1. Participant count updated in real-time
    const handleParticipantCountUpdated = (data) => {
      if (!data || (data.eventId && data.eventId !== id)) return;

      setEvent((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          participantCount: data.participantCount,
        };
      });

      // Display non-distracting toast notification for external user actions
      if (!isPerformingActionRef.current) {
        setLiveToast(`Live update: Participant count is now ${data.participantCount}`);
        setTimeout(() => setLiveToast(null), 4000);
      }
    };

    // 2. Event details updated by Admin in real-time
    const handleEventUpdated = (data) => {
      if (!data || (data.eventId && data.eventId !== id)) return;

      if (data.event) {
        setEvent(data.event);
        setLiveToast('Live update: Event details have been updated by admin.');
        setTimeout(() => setLiveToast(null), 4000);
      }
    };

    // 3. Event cancelled by Admin in real-time
    const handleEventCancelled = (data) => {
      if (!data || (data.eventId && data.eventId !== id)) return;

      setEvent((prev) => (prev ? { ...prev, status: 'CANCELLED' } : prev));
      setLiveToast('Live update: This event has been CANCELLED by administrators.');
      setTimeout(() => setLiveToast(null), 5000);
    };

    // Subscribe to Socket.IO events
    onParticipantCountUpdated(handleParticipantCountUpdated);
    onEventUpdated(handleEventUpdated);
    onEventCancelled(handleEventCancelled);

    // Cleanup: leave room and remove event listeners on unmount or ID change
    return () => {
      leaveEventRoom(id);
      offParticipantCountUpdated(handleParticipantCountUpdated);
      offEventUpdated(handleEventUpdated);
      offEventCancelled(handleEventCancelled);
    };
  }, [id]);

  // Handle Event Registration via REST (Socket.IO will broadcast resulting count to all room subscribers)
  const handleRegister = async () => {
    try {
      setActionLoading(true);
      isPerformingActionRef.current = true;
      setFeedback(null);

      const res = await registrationService.registerForEvent(id);
      setIsRegistered(true);

      if (res.data && res.data.updatedParticipantCount !== undefined) {
        setEvent((prev) => ({
          ...prev,
          participantCount: res.data.updatedParticipantCount,
        }));
      }

      setFeedback({
        type: 'success',
        message: 'Successfully registered for this event!',
      });
    } catch (err) {
      console.error('Registration failed:', err);
      setFeedback({
        type: 'error',
        message: err.message || 'Registration failed.',
      });
    } finally {
      setActionLoading(false);
      setTimeout(() => {
        isPerformingActionRef.current = false;
      }, 500);
    }
  };

  // Handle Event Registration Cancellation via REST
  const handleConfirmCancelRegistration = async () => {
    try {
      setActionLoading(true);
      isPerformingActionRef.current = true;
      setFeedback(null);

      const res = await registrationService.cancelRegistration(id);

      setIsRegistered(false);
      setShowCancelModal(false);

      if (res.data && res.data.updatedParticipantCount !== undefined) {
        setEvent((prev) => ({
          ...prev,
          participantCount: res.data.updatedParticipantCount,
        }));
      }

      setFeedback({
        type: 'success',
        message: 'Your registration has been cancelled.',
      });
    } catch (err) {
      console.error('Cancellation failed:', err);
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to cancel registration.',
      });
    } finally {
      setActionLoading(false);
      setTimeout(() => {
        isPerformingActionRef.current = false;
      }, 500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        <span className="text-sm text-slate-400 font-medium">Loading event details...</span>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-2xl mx-auto py-12 space-y-6 text-center">
        <div className="glass-card p-10 rounded-3xl border border-rose-500/20 bg-rose-950/20 space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-2xl font-bold text-white">Event Not Found</h2>
          <p className="text-slate-300 text-sm">{error || "The event you're looking for doesn't exist."}</p>
          <div className="pt-2">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Events</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const {
    title,
    category,
    description,
    date,
    time,
    venue,
    organizer,
    registrationDeadline,
    capacity,
    participantCount = 0,
    banner,
    status = 'OPEN',
  } = event;

  const isDeadlinePassed = registrationDeadline && new Date() > new Date(registrationDeadline);
  const isFull = capacity && participantCount >= capacity;
  const isEventOpen = status === 'OPEN' && !isDeadlinePassed;

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'TBD';

  const formattedDeadline = registrationDeadline
    ? new Date(registrationDeadline).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Back Button & Live Badge */}
      <div className="flex items-center justify-between">
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events</span>
        </Link>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Live Updates Enabled</span>
        </div>
      </div>

      {/* Real-time Toast Notification */}
      {liveToast && (
        <div className="p-3.5 rounded-xl bg-indigo-950/90 border border-indigo-500/40 text-indigo-200 text-xs font-semibold flex items-center justify-between shadow-xl animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-400 animate-bounce" />
            <span>{liveToast}</span>
          </div>
          <button type="button" onClick={() => setLiveToast(null)} className="p-1 text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-800/80">
        {/* Banner Image */}
        {banner && (
          <div className="relative h-64 sm:h-80 w-full bg-slate-900 overflow-hidden">
            <img
              src={banner}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </div>
        )}

        <div className="p-8 sm:p-10 space-y-8">
          {/* Header row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {category}
              </span>

              {status === 'CANCELLED' && (
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                  <AlertOctagon className="w-3.5 h-3.5" />
                  CANCELLED
                </span>
              )}

              {status === 'CLOSED' && (
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  REGISTRATION CLOSED
                </span>
              )}
            </div>

            {isRegistered && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                You are registered!
              </span>
            )}
          </div>

          {/* Title & Description */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              {title}
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </div>

          {/* User REST Action Feedback Banner */}
          {feedback && (
            <div
              className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-sm font-medium ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
            <div className="flex items-start gap-3.5 text-slate-200">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mt-0.5">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Date & Time</div>
                <div className="font-semibold text-sm text-white">{formattedDate}</div>
                {time && <div className="text-xs text-slate-400 mt-0.5">{time}</div>}
              </div>
            </div>

            <div className="flex items-start gap-3.5 text-slate-200">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mt-0.5">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Venue</div>
                <div className="font-semibold text-sm text-white">{venue}</div>
              </div>
            </div>

            <div className="flex items-start gap-3.5 text-slate-200">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mt-0.5">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Organizer</div>
                <div className="font-semibold text-sm text-white">{organizer}</div>
              </div>
            </div>

            <div className="flex items-start gap-3.5 text-slate-200">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mt-0.5">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Attendance</span>
                  <span className="text-[10px] text-emerald-400 font-bold">● Live Sync</span>
                </div>
                <div className="font-semibold text-sm text-white">
                  {participantCount} {capacity ? `/ ${capacity}` : ''} registered
                </div>
                {capacity && (
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (participantCount / capacity) * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            {formattedDeadline && (
              <div className="flex items-start gap-3.5 text-slate-200 sm:col-span-2 pt-2 border-t border-slate-800/80">
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Registration Deadline</div>
                  <div className="font-semibold text-sm text-white">{formattedDeadline}</div>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Registration Card */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-base">
                <Award className="w-5 h-5" />
                <span>Student Registration</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {isAuthenticated ? (isAdmin ? 'Admin View Mode' : `Logged in as ${user?.name}`) : 'Guest Mode'}
              </span>
            </div>

            {status === 'CANCELLED' ? (
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-2">
                <XCircle className="w-5 h-5 shrink-0 text-rose-400" />
                <span>This event has been cancelled by administrators. Registration is disabled.</span>
              </div>
            ) : !isAuthenticated ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  Please log in with a student account to register for this campus event.
                </p>
                <Link
                  to="/login"
                  className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all text-center block"
                >
                  Login to Register
                </Link>
              </div>
            ) : isAdmin ? (
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 text-purple-300 text-sm flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400 shrink-0" />
                <span>You are logged in as an Administrator. Student registration controls are hidden.</span>
              </div>
            ) : isRegistered ? (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>You are officially registered for this event.</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  disabled={actionLoading}
                  className="w-full py-3 px-4 rounded-xl bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white font-semibold text-sm border border-rose-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Cancel Registration</span>
                </button>
              </div>
            ) : isFull ? (
              <div className="space-y-2">
                <button
                  type="button"
                  disabled
                  className="w-full py-3.5 px-6 rounded-xl bg-slate-800 text-slate-500 font-semibold text-sm cursor-not-allowed border border-slate-700/50"
                >
                  Event Full (Maximum Capacity Reached)
                </button>
              </div>
            ) : !isEventOpen ? (
              <div className="space-y-2">
                <button
                  type="button"
                  disabled
                  className="w-full py-3.5 px-6 rounded-xl bg-slate-800 text-slate-500 font-semibold text-sm cursor-not-allowed border border-slate-700/50"
                >
                  Registration Closed
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleRegister}
                disabled={actionLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <span>Register Now</span>
                )}
              </button>
            )}

          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <XCircle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Cancel your registration?</h3>
              <p className="text-slate-300 text-sm">
                Are you sure you want to cancel your registration for <strong className="text-white">"{title}"</strong>?
              </p>
              <p className="text-xs text-slate-400">
                Your spot will be freed up for other students in real time.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmCancelRegistration}
                className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Cancel Registration</span>
                )}
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-xl border border-slate-700 transition-colors"
              >
                Keep Registration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
