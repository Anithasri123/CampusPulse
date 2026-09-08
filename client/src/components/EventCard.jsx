import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, ArrowRight, User, AlertOctagon } from 'lucide-react';

export default function EventCard({ event }) {
  if (!event) return null;

  const id = event._id || event.id;
  const {
    title = 'Untitled Event',
    category = 'General',
    description = 'No description available.',
    date,
    time,
    venue = 'Campus Ground',
    organizer,
    participantCount,
    banner,
    status = 'OPEN',
  } = event;

  // Format MongoDB date string/timestamp into readable display string
  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'TBD';

  const getCategoryBadgeClass = (catName) => {
    switch ((catName || '').toLowerCase()) {
      case 'hackathon':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'workshop':
      case 'workshops':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'sports':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'cultural':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'seminar':
      case 'seminars':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'competition':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  const getStatusBadge = (st) => {
    if (st === 'CANCELLED') {
      return (
        <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
          <AlertOctagon className="w-3 h-3" />
          CANCELLED
        </span>
      );
    }
    if (st === 'CLOSED') {
      return (
        <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-slate-800 text-slate-400 border border-slate-700">
          CLOSED
        </span>
      );
    }
    if (st === 'COMPLETED') {
      return (
        <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          COMPLETED
        </span>
      );
    }
    return null;
  };

  return (
    <div className={`group glass-card rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 border ${status === 'CANCELLED' ? 'border-rose-900/40 opacity-80' : 'border-slate-800/80 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5'} flex flex-col justify-between`}>
      {/* Optional Banner Image */}
      {banner && (
        <div className="relative h-44 w-full overflow-hidden bg-slate-900">
          <img
            src={banner}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
          {status !== 'OPEN' && (
            <div className="absolute top-3 right-3">
              {getStatusBadge(status)}
            </div>
          )}
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Badges row if no banner or if banner is present */}
          {!banner && (
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getCategoryBadgeClass(category)}`}>
                {category}
              </span>
              {status !== 'OPEN' ? (
                getStatusBadge(status)
              ) : organizer ? (
                <span className="flex items-center gap-1 text-xs text-slate-400 truncate max-w-[140px]">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{organizer}</span>
                </span>
              ) : null}
            </div>
          )}

          {banner && (
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getCategoryBadgeClass(category)}`}>
                {category}
              </span>
              {organizer && (
                <span className="flex items-center gap-1 text-xs text-slate-400 truncate max-w-[140px]">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{organizer}</span>
                </span>
              )}
            </div>
          )}

          {/* Title */}
          <h3 className="text-xl font-bold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1 mb-2">
            {title}
          </h3>

          {/* Description */}
          <p className="text-slate-400 text-sm line-clamp-2 mb-5 leading-relaxed">
            {description}
          </p>

          {/* Metadata */}
          <div className="space-y-2.5 text-xs text-slate-300 mb-6 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{formattedDate}</span>
              {time && (
                <>
                  <span className="text-slate-600">•</span>
                  <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0 ml-0.5" />
                  <span>{time}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="truncate">{venue}</span>
            </div>

            {participantCount !== undefined && participantCount !== null && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{participantCount} participants</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-slate-800/60">
          <Link
            to={`/events/${id}`}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-indigo-600 text-slate-200 hover:text-white font-medium text-sm transition-all duration-200 group-hover:shadow-md"
          >
            <span>View Details</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
