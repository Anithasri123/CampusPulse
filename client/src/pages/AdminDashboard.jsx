import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Edit,
  AlertOctagon,
  Search,
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  Check,
  X,
  Users,
  Eye,
} from 'lucide-react';
import { eventService } from '../services/eventService.js';
import { registrationService } from '../services/registrationService.js';

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Cancel Event Confirmation Modal state
  const [cancelModalEvent, setCancelModalEvent] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  // View Participants Roster Modal state
  const [participantsModalEvent, setParticipantsModalEvent] = useState(null);
  const [participantsList, setParticipantsList] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  const fetchAdminEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventService.getEvents();
      setEvents(data.data || []);
    } catch (err) {
      console.error('Error loading admin events:', err);
      setError(err.message || 'Failed to load events list');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminEvents();
  }, [fetchAdminEvents]);

  // Derived Metrics
  const totalEvents = events.length;
  const openEvents = events.filter((e) => e.status === 'OPEN').length;
  const cancelledEvents = events.filter((e) => e.status === 'CANCELLED').length;
  const completedEvents = events.filter((e) => e.status === 'COMPLETED').length;

  // Filtered Events Table List
  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle Event Cancellation
  const handleConfirmCancel = async () => {
    if (!cancelModalEvent) return;
    try {
      setCancelling(true);
      await eventService.cancelEvent(cancelModalEvent._id || cancelModalEvent.id);

      setActionFeedback({
        type: 'success',
        message: `Event "${cancelModalEvent.title}" has been marked as CANCELLED.`,
      });

      setCancelModalEvent(null);
      fetchAdminEvents();
    } catch (err) {
      console.error('Failed to cancel event:', err);
      setActionFeedback({
        type: 'error',
        message: err.message || 'Could not cancel event',
      });
    } finally {
      setCancelling(false);
    }
  };

  // Open Participants Roster Modal
  const handleViewParticipants = async (eventObj) => {
    setParticipantsModalEvent(eventObj);
    setParticipantsList([]);
    try {
      setLoadingParticipants(true);
      const eventId = eventObj._id || eventObj.id;
      const res = await registrationService.getEventRegistrations(eventId);
      setParticipantsList(res.data || []);
    } catch (err) {
      console.error('Error fetching event participants:', err);
    } finally {
      setLoadingParticipants(false);
    }
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header Banner */}
      <div className="glass-card p-8 rounded-3xl border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Layers className="w-4 h-4" />
            <span>Admin Event Management</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Admin Dashboard
          </h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Create, update, cancel, and inspect participant rosters for campus events.
          </p>
        </div>

        <div>
          <Link
            to="/admin/events/new"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Create New Event</span>
          </Link>
        </div>
      </div>

      {/* Alert Feedback Banner */}
      {actionFeedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm font-medium ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === 'success' ? (
              <Check className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{actionFeedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800/80">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Events</div>
          <div className="text-3xl font-extrabold text-white mt-2">{totalEvents}</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-emerald-500/20">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Open Events
          </div>
          <div className="text-3xl font-extrabold text-emerald-300 mt-2">{openEvents}</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-rose-500/20">
          <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
            <XCircle className="w-4 h-4" />
            Cancelled Events
          </div>
          <div className="text-3xl font-extrabold text-rose-300 mt-2">{cancelledEvents}</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-indigo-500/20">
          <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            Completed
          </div>
          <div className="text-3xl font-extrabold text-indigo-300 mt-2">{completedEvents}</div>
        </div>
      </div>

      {/* Table & Controls Section */}
      <div className="glass-card rounded-3xl border border-slate-800/80 overflow-hidden space-y-4">
        {/* Table Filter Controls */}
        <div className="p-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search table by title or organizer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="OPEN">OPEN</option>
              <option value="CLOSED">CLOSED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <span className="text-sm">Loading event database...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-400 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto" />
            <div>{error}</div>
            <button
              type="button"
              onClick={fetchAdminEvents}
              className="px-4 py-2 bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No events match the selected search or status criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-6">Event Title</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Attendees</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredEvents.map((evt) => {
                  const evtId = evt._id || evt.id;
                  const evtDate = evt.date
                    ? new Date(evt.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'TBD';

                  return (
                    <tr key={evtId} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-100">
                        <Link to={`/events/${evtId}`} className="hover:text-indigo-400 transition-colors block">
                          {evt.title}
                        </Link>
                        <div className="text-[11px] text-slate-500 font-normal">{evtDate} • {evt.venue}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-medium">
                          {evt.category}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          type="button"
                          onClick={() => handleViewParticipants(evt)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 font-semibold text-xs transition-colors"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>{evt.participantCount || 0}</span>
                        </button>
                      </td>
                      <td className="py-4 px-4">
                        {evt.status === 'OPEN' && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                            OPEN
                          </span>
                        )}
                        {evt.status === 'CANCELLED' && (
                          <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                            CANCELLED
                          </span>
                        )}
                        {evt.status === 'CLOSED' && (
                          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-semibold">
                            CLOSED
                          </span>
                        )}
                        {evt.status === 'COMPLETED' && (
                          <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                            COMPLETED
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleViewParticipants(evt)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="View Participants Roster"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <Link
                            to={`/admin/events/${evtId}/edit`}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors"
                            title="Edit Event"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {evt.status !== 'CANCELLED' && (
                            <button
                              type="button"
                              onClick={() => setCancelModalEvent(evt)}
                              className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 transition-colors"
                              title="Cancel Event"
                            >
                              <AlertOctagon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Participants Roster Modal */}
      {participantsModalEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  Participant Roster
                </div>
                <h3 className="text-xl font-bold text-white truncate max-w-[340px]">
                  {participantsModalEvent.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setParticipantsModalEvent(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {loadingParticipants ? (
                <div className="py-8 text-center text-slate-400 flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                  <span className="text-xs">Loading attendee list...</span>
                </div>
              ) : participantsList.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">
                  No active student registrations for this event yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {participantsList.map((reg, idx) => {
                    const student = reg.user;
                    const registeredDate = reg.registeredAt
                      ? new Date(reg.registeredAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'TBD';

                    return (
                      <div
                        key={reg._id || reg.id}
                        className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center text-xs border border-indigo-500/30">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-100">{student?.name || 'Student'}</div>
                            <div className="text-[11px] text-slate-400">{student?.email || 'N/A'}</div>
                          </div>
                        </div>
                        <div className="text-right text-[11px] text-slate-500">
                          <div>{registeredDate}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setParticipantsModalEvent(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Soft Cancellation Confirmation Modal */}
      {cancelModalEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertOctagon className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Cancel this event?</h3>
              <p className="text-slate-300 text-sm">
                Are you sure you want to mark <strong className="text-white">"{cancelModalEvent.title}"</strong> as CANCELLED?
              </p>
              <p className="text-xs text-slate-400">
                This will update the event status to CANCELLED in the database while preserving records for students and administrators.
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
                  <span>Cancel Event</span>
                )}
              </button>

              <button
                type="button"
                disabled={cancelling}
                onClick={() => setCancelModalEvent(null)}
                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-xl border border-slate-700 transition-colors"
              >
                Keep Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
