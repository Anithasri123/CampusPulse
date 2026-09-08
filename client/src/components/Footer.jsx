import React from 'react';
import { Activity, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/80 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-200 text-sm">CampusPulse</span>
          <span className="text-xs text-slate-500">• Phase 1 UI Shell</span>
        </div>

        <div className="text-xs text-slate-500 text-center">
          © {new Date().getFullYear()} CampusPulse. All campus events, one unified hub.
        </div>

        <div className="flex items-center gap-1 text-xs text-slate-400">
          <span>Built for Campus Community</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline ml-1" />
        </div>
      </div>
    </footer>
  );
}
