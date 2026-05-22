/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { useDSCPS } from '../lib/state';
import ImageUploadField from './ImageUploadField';
import { 
  Camera, 
  Clock, 
  PlusCircle, 
  Trash2, 
  AlertTriangle, 
  Eye, 
  X, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Award, 
  ChevronLeft, 
  ChevronRight, 
  ClipboardList 
} from 'lucide-react';

const SRI_LANKAN_HOLIDAYS_2026: { [dateKey: string]: string[] } = {
  '2026-01-01': ['New Year\'s Day', 'Duruthu Full Moon Poya Day'],
  '2026-01-14': ['Tamil Thai Pongal Day'],
  '2026-02-04': ['National Independence Day of Sri Lanka'],
  '2026-02-17': ['Maha Shivratri Day'],
  '2026-03-03': ['Medin Full Moon Poya Day'],
  '2026-04-02': ['Bak Full Moon Poya Day'],
  '2026-04-13': ['Sinhala & Tamil New Year\'s Eve'],
  '2026-04-14': ['Sinhala and Tamil New Year\'s Day'],
  '2026-04-15': ['Special New Year Holiday'],
  '2026-05-01': ['Labour Day (May Day)', 'Vesak Full Moon Poya Day'],
  '2026-05-02': ['Day after Vesak Full Moon Poya Day'],
  '2026-05-31': ['Poson Full Moon Poya Day'],
  '2026-06-29': ['Esala Full Moon Poya Day'],
  '2026-07-29': ['Nikini Full Moon Poya Day'],
  '2026-08-27': ['Binara Full Moon Poya Day'],
  '2026-09-24': ['Milad-Un-Nabi (Prophet\'s Birthday)'],
  '2026-09-26': ['Madin Full Moon Poya Day'],
  '2026-10-25': ['Vap Full Moon Poya Day'],
  '2026-11-08': ['Deepavali (Diwali Festival)'],
  '2026-11-24': ['Il Full Moon Poya Day'],
  '2026-12-24': ['Unduvap Full Moon Poya Day'],
  '2026-12-25': ['Christmas Day'],
};

interface IntegratedWorkspaceViewProps {
  isAdmin: boolean;
  hasPrivilege: (key: string) => boolean;
  onNavigateToProfile: (uid: string) => void;
}

export default function IntegratedWorkspaceView({ isAdmin, hasPrivilege, onNavigateToProfile }: IntegratedWorkspaceViewProps) {
  const { 
    currentUser, 
    users, 
    workloads, 
    assignWorkload, 
    submitWorkload, 
    completeWorkload, 
    abandonWorkload, 
    deleteWorkload 
  } = useDSCPS();

  // Calendar Navigation State
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(4); // May (0-indexed)
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>('2026-05-21');

  // Workload Assignment Form States
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDesc, setAssignDesc] = useState('');
  const [assignTo, setAssignTo] = useState('');
  const [assignDeadline, setAssignDeadline] = useState('2026-05-25');
  const [assignPts, setAssignPts] = useState(50);
  const [assignType, setAssignType] = useState<'photography' | 'editing'>('editing');

  // Active Workload list filters
  const [workloadsFilter, setWorkloadsFilter] = useState<'all' | 'mine' | 'pending_review'>('all');

  // Workload Submission Dialog state
  const [submittingWorkloadId, setSubmittingWorkloadId] = useState<string | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');

  // Workload Abandon Modal state
  const [abandoningWorkload, setAbandoningWorkload] = useState<any | null>(null);
  const [abandonDeductPoints, setAbandonDeductPoints] = useState(true);

  // Helper Handlers
  const handleAssignWorkload = (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser || !assignTitle || !assignTo || !assignDeadline) return;

    const targetUser = users.find(u => u.uid === assignTo);
    if (!targetUser) return;

    assignWorkload({
      title: assignTitle,
      description: assignDesc,
      assignedToId: assignTo,
      assignedToName: targetUser.fullName,
      assignedById: currentUser.uid,
      assignedByName: currentUser.fullName,
      deadline: assignDeadline,
      pts: Number(assignPts),
      type: assignType
    });

    setAssignTitle('');
    setAssignDesc('');
    setAssignTo('');
    setAssignPts(50);
    setAssignType('editing');
    setShowAssignForm(false);
  };

  const handleEditorSubmitWork = (e: FormEvent, workId: string) => {
    e.preventDefault();
    if (!submissionUrl) return;
    submitWorkload(workId, submissionUrl, submissionNotes);
    setSubmissionUrl('');
    setSubmissionNotes('');
    setSubmittingWorkloadId(null);
  };

  const confirmAbandonWorkload = () => {
    if (!abandoningWorkload) return;
    abandonWorkload(abandoningWorkload.id, abandonDeductPoints);
    setAbandoningWorkload(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left animate-fade-in" id="workspace-combo-panel">
      
      {/* Left Column: Sri Lankan Calendar - takes 5 cols */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-neutral-950 border border-neutral-900 p-5 rounded-2xl relative">
          <div className="flex items-center justify-between border-b border-neutral-900 pb-3 mb-4">
            <div>
              <h5 className="font-display font-bold text-sm uppercase tracking-wider text-emerald-400 flex items-center space-x-2">
                <Calendar size={14} />
                <span>Interactive Calendar (2026)</span>
              </h5>
              <p className="text-xs text-neutral-404 text-neutral-400 font-mono mt-0.5">Sri Lankan Holidays & Deadlines</p>
            </div>
            {/* Month Navigation */}
            <div className="flex items-center space-x-1.5 bg-neutral-900 p-1 rounded border border-neutral-850">
              <button 
                onClick={() => {
                  if (currentMonth === 0) {
                    setCurrentMonth(11);
                    setCurrentYear(currentYear - 1);
                  } else {
                    setCurrentMonth(currentMonth - 1);
                  }
                }} 
                className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-bold text-white uppercase tracking-wider min-w-[75px] text-center font-mono">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][currentMonth]} {currentYear}
              </span>
              <button 
                onClick={() => {
                  if (currentMonth === 11) {
                    setCurrentMonth(0);
                    setCurrentYear(currentYear + 1);
                  } else {
                    setCurrentMonth(currentMonth + 1);
                  }
                }} 
                className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Weekday indicators */}
          <div className="grid grid-cols-7 gap-1 mb-2.5 text-center text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest">
            <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {(() => {
              const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
              const firstDayIdx = new Date(currentYear, currentMonth, 1).getDay();
              const cells = [];

              for (let p = 0; p < firstDayIdx; p++) {
                cells.push(<div key={`pad-${p}`} className="aspect-square bg-transparent" />);
              }

              for (let d = 1; d <= totalDays; d++) {
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const holidays = SRI_LANKAN_HOLIDAYS_2026[dateStr] || [];
                const activeWork = workloads.filter(w => w.deadline === dateStr);
                const isToday = dateStr === '2026-05-21';
                const isChosen = dateStr === selectedCalendarDate;

                cells.push(
                  <div
                    key={`day-${d}`}
                    onClick={() => setSelectedCalendarDate(dateStr)}
                    className={`aspect-square p-1 rounded-xl flex flex-col justify-between border cursor-pointer select-none transition-all ${
                      isChosen 
                        ? 'bg-emerald-500/10 border-emerald-500/80 shadow-lg shadow-emerald-500/5' 
                        : isToday 
                          ? 'bg-neutral-900 border-amber-500/40' 
                          : 'bg-neutral-900/40 border-neutral-900/80 hover:border-neutral-800'
                    }`}
                  >
                    <span className={`text-xs font-bold font-mono ${
                      isToday ? 'text-amber-500 font-black' : isChosen ? 'text-emerald-400' : 'text-neutral-300'
                    }`}>
                      {d}
                    </span>

                    <div className="flex items-center space-x-0.5 justify-center mt-auto">
                      {holidays.length > 0 && (
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" title={holidays[0]} />
                      )}
                      {activeWork.length > 0 && (
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" title={`${activeWork.length} deadlines`} />
                      )}
                    </div>
                  </div>
                );
              }
              return cells;
            })()}
          </div>
        </div>

        {/* Selected date agenda details box */}
        {selectedCalendarDate ? (
          <div className="bg-neutral-950 border border-neutral-900 p-4.5 rounded-2xl relative text-left">
            <h4 className="font-display font-semibold text-xs uppercase tracking-widest text-neutral-400 border-b border-neutral-900 pb-2 mb-3">
              Agenda for: <strong className="text-white font-mono">{selectedCalendarDate}</strong>
            </h4>

            {/* Sri Lankan Holiday */}
            {(() => {
              const holidays = SRI_LANKAN_HOLIDAYS_2026[selectedCalendarDate] || [];
              if (holidays.length === 0) return null;
              return (
                <div className="mb-3.5 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <p className="text-xs font-bold font-mono text-emerald-400 uppercase flex items-center gap-1.5">
                    <span>🇱🇰</span>
                    <span>Official Lankan Holiday</span>
                  </p>
                  <p className="text-xs font-bold text-white mt-1.5 leading-normal">{holidays.join(' & ')}</p>
                </div>
              );
            })()}

            {/* Selected date workloads list */}
            <div>
              <p className="text-xs font-mono uppercase text-neutral-400 tracking-wider mb-2.5">Workloads due on this day:</p>
              {(() => {
                const matchWork = workloads.filter(w => w.deadline === selectedCalendarDate);
                if (matchWork.length === 0) {
                  return (
                    <p className="text-xs text-neutral-400 text-center py-4 bg-neutral-900/20 border border-dashed border-neutral-900 rounded-xl">
                      No duties scheduled for this day
                    </p>
                  );
                }
                return (
                  <div className="space-y-2">
                    {matchWork.map(w => (
                      <div key={w.id} className="bg-neutral-900/40 p-2.5 rounded-lg border border-neutral-900 text-left">
                        <div className="flex justify-between items-center gap-1.5">
                          <span className="font-bold text-neutral-200 text-sm truncate max-w-[130px]">{w.title}</span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                            w.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                            w.status === 'abandoned' ? 'bg-rose-500/10 text-rose-450 text-rose-400' :
                            'bg-amber-500/10 text-amber-500'
                          }`}>{w.status}</span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">{w.description}</p>
                        <div className="mt-2 text-xs text-neutral-450 text-neutral-400 flex justify-between pt-1 border-t border-neutral-900/20">
                          <span>By: {w.assignedByName}</span>
                          <span className="font-mono text-amber-400 font-bold">+{w.pts} XP</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        ) : (
          <div className="bg-neutral-950 border border-neutral-900 p-6 rounded-2xl text-center py-10">
            <Calendar size={22} className="text-neutral-700 mx-auto mb-1.5" />
            <p className="text-sm text-neutral-400">Select any date square to view Lankan holidays or due assignments roster</p>
          </div>
        )}
      </div>

      {/* Right Column: Workloads Hub list, Toolbar, Filters & Duty creation form - takes 7 cols */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Filters Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-950 border border-neutral-900 p-4 rounded-xl">
          <div className="flex space-x-1.5">
            <button
              onClick={() => setWorkloadsFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                workloadsFilter === 'all' ? 'bg-neutral-900 text-white border border-neutral-800' : 'text-neutral-400 hover:text-white'
              }`}
            >
              All Workloads
            </button>
            <button
              onClick={() => setWorkloadsFilter('mine')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                workloadsFilter === 'mine' ? 'bg-neutral-900 text-white border border-neutral-800' : 'text-neutral-400 hover:text-white'
              }`}
            >
              My Duties
            </button>
            <button
              onClick={() => setWorkloadsFilter('pending_review')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                workloadsFilter === 'pending_review' ? 'bg-neutral-900 text-white border border-neutral-800' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Pending Review ({workloads.filter(w => w.status === 'submitted').length})
            </button>
          </div>

          {/* Delegate Duty button */}
          {(isAdmin || (currentUser && currentUser.roles.includes('Exec. Member'))) && (
            <button
              onClick={() => setShowAssignForm(!showAssignForm)}
              className="flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl text-xs cursor-pointer ml-auto sm:ml-0 transition-transform active:scale-95"
            >
              <PlusCircle size={13} />
              <span>Assign Duty</span>
            </button>
          )}
        </div>

        {/* ASSIGN DUTY FORM MODAL PANEL */}
        {showAssignForm && (
          <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-5 md:p-6 animate-fade-in relative border-l-4 border-l-emerald-500 text-left">
            <button 
              onClick={() => setShowAssignForm(false)} 
              className="absolute top-4 right-4 text-neutral-500 hover:text-white cursor-pointer"
            >
              <X size={16} />
            </button>

            <h4 className="font-display font-semibold text-white ml-1 text-sm md:text-base mb-4 flex items-center space-x-2">
              <ClipboardList className="text-emerald-400" size={16} />
              <span>Delegate New Workload Task</span>
            </h4>

            <form onSubmit={handleAssignWorkload} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1.5 font-semibold">Duty Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Color grade sports meet pictures"
                    value={assignTitle}
                    onChange={e => setAssignTitle(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1.5 font-semibold">Assign Member</label>
                  <select
                    required
                    value={assignTo}
                    onChange={e => setAssignTo(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-400 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Select Member --</option>
                    {users.map(u => (
                      <option key={u.uid} value={u.uid}>
                        {u.fullName} ({u.roles.join(', ')})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1.5 font-semibold">Corner Category</label>
                  <select
                    required
                    value={assignType}
                    onChange={e => setAssignType(e.target.value as 'photography' | 'editing')}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-400 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="editing">Editor's Corner Duty</option>
                    <option value="photography">Photographer's Corner Duty</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1.5 font-semibold">Instructions & Description</label>
                <textarea
                  rows={3}
                  placeholder="Tell the student what they need to upload and configure..."
                  value={assignDesc}
                  onChange={e => setAssignDesc(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1.5 font-semibold">Deadline Date</label>
                  <input
                    type="date"
                    required
                    value={assignDeadline}
                    onChange={e => setAssignDeadline(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-neutral-400 uppercase tracking-wider mb-1.5 font-semibold">Reward Bounty (XP Points)</label>
                  <input
                    type="number"
                    required
                    min={5}
                    max={500}
                    value={assignPts}
                    onChange={e => setAssignPts(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignForm(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-neutral-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-500 text-neutral-950 font-bold rounded-xl text-xs cursor-pointer hover:bg-emerald-400 transition-colors"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ABANDON CONFIRMATION OVERLAY */}
        {abandoningWorkload && (
          <div className="bg-neutral-950 border border-red-500/20 rounded-2xl p-6 text-center animate-fade-in relative border-l-4 border-l-rose-500">
            <button onClick={() => setAbandoningWorkload(null)} className="absolute top-4 right-4 text-neutral-500 hover:text-white cursor-pointer">
              <X size={16} />
            </button>
            <AlertTriangle className="text-rose-500 w-10 h-10 mx-auto mb-3" />
            <h4 className="font-display font-semibold text-white text-sm md:text-base">Declare Workload Abandoned?</h4>
            <p className="text-xs text-neutral-400 mt-2 max-w-md mx-auto leading-normal">
              You are marking <strong className="text-neutral-200">"{abandoningWorkload.title}"</strong> as abandoned.
            </p>
            <div className="mt-4 max-w-sm mx-auto bg-neutral-900/60 p-3.5 rounded-xl border border-neutral-850 text-left">
              <label className="flex items-center space-x-2.5 cursor-pointer text-xs text-neutral-300">
                <input type="checkbox" checked={abandonDeductPoints} onChange={e => setAbandonDeductPoints(e.target.checked)} className="w-4 h-4 accent-rose-500 cursor-pointer" />
                <span>Deduct <strong className="text-rose-400 font-bold font-mono">{abandoningWorkload.pts} Pts</strong> penalty?</span>
              </label>
            </div>
            <div className="flex justify-center space-x-3 mt-6">
              <button onClick={() => setAbandoningWorkload(null)} className="px-4 py-2 bg-neutral-900 border border-neutral-850 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white cursor-pointer">Cancel</button>
              <button onClick={confirmAbandonWorkload} className="px-4 py-2 bg-rose-500 hover:bg-rose-450 text-neutral-950 font-bold rounded-xl text-xs cursor-pointer">Confirm Abandon Status</button>
            </div>
          </div>
        )}

        {/* WORKLOADS CARDS TIMELINE */}
        {(() => {
          let filtered = workloads;
          if (workloadsFilter === 'mine') {
            filtered = workloads.filter(w => w.assignedToId === currentUser?.uid);
          } else if (workloadsFilter === 'pending_review') {
            filtered = workloads.filter(w => w.status === 'submitted');
          }

          if (filtered.length === 0) {
            return (
              <div className="p-12 bg-neutral-950/25 border border-neutral-900 rounded-2xl text-center py-16">
                <ClipboardList size={28} className="text-neutral-750 text-neutral-700 mx-auto mb-2" />
                <p className="text-xs text-neutral-405 text-neutral-405 text-neutral-405 text-neutral-400 font-semibold">No workloads match the active filter criteria.</p>
              </div>
            );
          }

          return (
            <div className="space-y-4">
              {filtered.map(work => {
                const isAssignee = currentUser?.uid === work.assignedToId;
                const isReviewPending = work.status === 'submitted';
                const isOverdue = work.status === 'pending' && new Date(work.deadline) < new Date('2026-05-21');

                return (
                  <div 
                    key={work.id} 
                    className={`bg-neutral-950 border rounded-2xl p-5 text-left relative overflow-hidden transition-all duration-300 hover:border-neutral-800 ${
                      work.status === 'completed' ? 'border-emerald-500/10' :
                      work.status === 'abandoned' ? 'border-rose-500/10' :
                      isOverdue ? 'border-red-500/20 bg-red-500/[0.01]' : 'border-neutral-900/90'
                    }`}
                  >
                    <div className={`absolute left-0 top-0 h-full w-1 ${
                      work.status === 'completed' ? 'bg-emerald-500' :
                      work.status === 'abandoned' ? 'bg-rose-500' :
                      work.status === 'submitted' ? 'bg-blue-500' :
                      isOverdue ? 'bg-red-500' : 'bg-neutral-850'
                    }`} />

                    <div className="flex flex-wrap items-start justify-between gap-3 min-w-0">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                          <span className={`text-xs font-bold font-mono tracking-wider uppercase px-2.5 py-0.5 rounded ${
                            work.status === 'completed' ? 'bg-emerald-500/15 text-emerald-450 text-emerald-450 text-emerald-400' :
                            work.status === 'abandoned' ? 'bg-rose-500/15 text-rose-455 text-rose-400' :
                            work.status === 'submitted' ? 'bg-blue-500/15 text-blue-400' :
                            'bg-neutral-900 border border-neutral-850 text-neutral-400'
                          }`}>{work.status}</span>
                          
                          <span className="text-xs font-mono text-neutral-400 bg-neutral-900 px-2.5 py-0.5 rounded border border-neutral-850 uppercase shrink-0">
                            {work.type || 'editing'} Corner
                          </span>

                          {isOverdue && (
                            <span className="text-xs font-bold font-mono text-red-500 bg-red-500/15 px-2.5 py-0.5 rounded animate-pulse">⚠️ Overdue</span>
                          )}

                          <span className="text-xs text-neutral-400 font-mono flex items-center gap-1">
                            <Clock size={11} className="text-neutral-500" />
                            <span>Deadline: {work.deadline}</span>
                          </span>
                        </div>

                        <h5 className="font-display font-bold text-white text-base tracking-normal">{work.title}</h5>
                        <p className="text-xs text-neutral-350 mt-1.5 leading-relaxed font-sans">{work.description}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold font-mono bg-amber-500/10 text-amber-500 border border-amber-500/25 px-3 py-1 rounded-full block text-center">
                          ✨ +{work.pts} XP
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-neutral-900/40 flex flex-wrap items-center justify-between text-xs text-neutral-400 gap-3">
                      <span>Recipient: <strong className="text-neutral-200">{work.assignedToName}</strong></span>
                      <span>Delegator: <strong className="text-neutral-300">{work.assignedByName}</strong></span>
                    </div>

                    {/* Actions Block */}
                    <div className="mt-3.5 pt-3 border-t border-neutral-900/40 flex flex-wrap gap-2 justify-end">
                      
                      {work.status === 'pending' && isAssignee && (
                        <button
                          onClick={() => setSubmittingWorkloadId(work.id)}
                          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs cursor-pointer transition-colors"
                        >
                          Submit Work File
                        </button>
                      )}

                      {submittingWorkloadId === work.id && (
                        <div className="w-full mt-3 p-4 bg-neutral-900 border border-amber-500/25 rounded-xl text-left relative">
                          <button onClick={() => setSubmittingWorkloadId(null)} className="absolute top-3 right-3 text-neutral-500 hover:text-white cursor-pointer"><X size={14} /></button>
                          <p className="text-xs font-bold text-white mb-2">Deliver Workload upload</p>
                          <form onSubmit={(e) => handleEditorSubmitWork(e, work.id)} className="space-y-3">
                            <ImageUploadField
                              label="Deliverable File / Image Link"
                              value={submissionUrl}
                              onChange={setSubmissionUrl}
                              placeholder="Select or drag deliverable file..."
                              id="work-deliverable"
                            />
                            <div>
                              <label className="block text-xs font-mono text-neutral-400 uppercase mb-1.5 font-semibold">Workload Deliverable Notes</label>
                              <textarea rows={2} placeholder="Detail notes, grades, or comments..." value={submissionNotes} onChange={e => setSubmissionNotes(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white" />
                            </div>
                            <div className="flex justify-end gap-2 text-xs">
                              <button type="button" onClick={() => setSubmittingWorkloadId(null)} className="px-3 py-1 text-neutral-450">Cancel</button>
                              <button type="submit" className="px-3.5 py-1 bg-amber-500 text-neutral-950 font-bold rounded-lg hover:bg-amber-400">Complete Deliverable</button>
                            </div>
                          </form>
                        </div>
                      )}

                      {/* Exec review action buttons */}
                      {isReviewPending && (isAdmin || (currentUser && currentUser.roles.includes('Exec. Member'))) && (
                        <div className="flex items-center space-x-1.5 w-full sm:w-auto justify-end">
                          {work.submissionUrl && (
                            <a href={work.submissionUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 border border-neutral-805 text-neutral-400 hover:text-white text-xs rounded-xl flex items-center space-x-1 font-medium mr-2">
                              <span>Examine Hand-in</span>
                              <Eye size={11} />
                            </a>
                          )}
                          
                          <button
                            onClick={() => completeWorkload(work.id)}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl text-xs flex items-center space-x-1 cursor-pointer"
                          >
                            <CheckCircle size={10} />
                            <span>Approve Work</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              setAbandoningWorkload(work);
                              setAbandonDeductPoints(true);
                            }}
                            className="px-3 py-1.5 bg-rose-500 hover:bg-rose-455 text-neutral-950 font-bold rounded-xl text-xs flex items-center space-x-1 cursor-pointer"
                          >
                            <XCircle size={10} />
                            <span>Abandon</span>
                          </button>
                        </div>
                      )}

                      {/* Declaration option */}
                      {work.status === 'pending' && (isAdmin || (currentUser && currentUser.roles.includes('Exec. Member'))) && (
                        <button
                          onClick={() => {
                            setAbandoningWorkload(work);
                            setAbandonDeductPoints(true);
                          }}
                          className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 hover:bg-rose-500/10 hover:border-rose-500/35 hover:text-rose-400 text-neutral-400 text-xs rounded-xl flex items-center space-x-1 ml-auto shrink-0 cursor-pointer"
                        >
                          <AlertTriangle size={11} />
                          <span>Abandon Duty</span>
                        </button>
                      )}

                      {/* Admin delete */}
                      {isAdmin && (
                        <button
                          onClick={() => deleteWorkload(work.id)}
                          className="p-1 px-1.5 text-neutral-500 hover:text-red-500 hover:bg-neutral-900 border border-transparent rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

    </div>
  );
}
