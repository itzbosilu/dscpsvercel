/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Camera, ClipboardList, Award } from 'lucide-react';
import { UserProfile } from '../types';
import { getUserAvatar } from '../lib/state';

interface LeaderboardViewProps {
  users: UserProfile[];
  currentUser: UserProfile | null;
  onNavigateToProfile: (uid: string) => void;
}

export default function LeaderboardView({ users, currentUser, onNavigateToProfile }: LeaderboardViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in text-left" id="leaderboard-workspace-panel">
      {/* Column 1: Photographer Corner Leaderboard */}
      <div className="bg-neutral-950 border border-neutral-900 p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-xl">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
        <div>
          <h4 className="font-display font-bold text-base uppercase tracking-wider text-cyan-400 flex items-center space-x-2.5 mb-4 border-b border-neutral-900 pb-3">
            <Camera size={16} />
            <span>Photographers</span>
          </h4>
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {[...users]
              .sort((a, b) => (b.photographerPoints || 0) - (a.photographerPoints || 0))
              .map((u, i) => (
                <div key={u.uid} className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  currentUser?.uid === u.uid ? 'bg-cyan-500/5 border-cyan-500/30' : 'bg-neutral-900/40 border-neutral-900/60 hover:bg-neutral-900/70'
                }`}>
                  <div className="flex items-center space-x-3.5 min-w-0" onClick={() => onNavigateToProfile(u.uid)}>
                    <div className="relative cursor-pointer shrink-0">
                      <img src={getUserAvatar(u.avatarUrl, u.gender)} alt={u.fullName} className="w-9 h-9 rounded-full object-cover border border-neutral-800" />
                      <span className="absolute -top-1 -left-1 w-5 h-5 bg-neutral-950 text-neutral-400 text-[10px] rounded-full border border-neutral-800 flex items-center justify-center font-mono font-bold shadow-md">{i + 1}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate max-w-[140px] hover:text-cyan-400 cursor-pointer">{u.fullName}</p>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">{u.roles.join(', ')}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold font-mono text-cyan-400 bg-cyan-400/10 px-2.5 py-1 rounded-full border border-cyan-400/10 shrink-0">
                    {u.photographerPoints || 0} XP
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Column 2: Editors Corner Leaderboard */}
      <div className="bg-neutral-950 border border-neutral-900 p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-xl">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        <div>
          <h4 className="font-display font-bold text-base uppercase tracking-wider text-emerald-400 flex items-center space-x-2.5 mb-4 border-b border-neutral-900 pb-3">
            <ClipboardList size={16} />
            <span>Editors</span>
          </h4>
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {[...users]
              .sort((a, b) => (b.editorPoints || 0) - (a.editorPoints || 0))
              .map((u, i) => (
                <div key={u.uid} className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  currentUser?.uid === u.uid ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-neutral-900/40 border-neutral-900/60 hover:bg-neutral-900/70'
                }`}>
                  <div className="flex items-center space-x-3.5 min-w-0" onClick={() => onNavigateToProfile(u.uid)}>
                    <div className="relative cursor-pointer shrink-0">
                      <img src={getUserAvatar(u.avatarUrl, u.gender)} alt={u.fullName} className="w-9 h-9 rounded-full object-cover border border-neutral-800" />
                      <span className="absolute -top-1 -left-1 w-5 h-5 bg-neutral-950 text-neutral-400 text-[10px] rounded-full border border-neutral-800 flex items-center justify-center font-mono font-bold shadow-md">{i + 1}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate max-w-[140px] hover:text-emerald-400 cursor-pointer">{u.fullName}</p>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">{u.roles.join(', ')}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/10 shrink-0">
                    {u.editorPoints || 0} XP
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Column 3: Combined Leaderboard */}
      <div className="bg-neutral-950 border border-neutral-900 p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-xl">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        <div>
          <h4 className="font-display font-bold text-base uppercase tracking-wider text-amber-500 flex items-center space-x-2.5 mb-4 border-b border-neutral-900 pb-3">
            <Award size={16} />
            <span>Combined</span>
          </h4>
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {[...users]
              .sort((a, b) => (b.points || 0) - (a.points || 0))
              .map((u, i) => (
                <div key={u.uid} className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  currentUser?.uid === u.uid ? 'bg-amber-500/5 border-amber-500/30' : 'bg-neutral-900/40 border-neutral-900/60 hover:bg-neutral-900/70'
                }`}>
                  <div className="flex items-center space-x-3.5 min-w-0" onClick={() => onNavigateToProfile(u.uid)}>
                    <div className="relative cursor-pointer shrink-0">
                      <img src={getUserAvatar(u.avatarUrl, u.gender)} alt={u.fullName} className="w-9 h-9 rounded-full object-cover border border-neutral-800" />
                      <span className="absolute -top-1 -left-1 w-5 h-5 bg-neutral-950 text-neutral-400 text-[10px] rounded-full border border-neutral-800 flex items-center justify-center font-mono font-bold shadow-md">{i + 1}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate max-w-[140px] hover:text-amber-400 cursor-pointer">{u.fullName}</p>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">{u.roles.join(', ')}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold font-mono text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/10 shrink-0">
                    {u.points || 0} XP
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
