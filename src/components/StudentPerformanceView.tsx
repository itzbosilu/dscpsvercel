/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Award, User, Camera, ClipboardList, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
import { UserProfile, Workload } from '../types';

interface StudentPerformanceViewProps {
  users: UserProfile[];
  workloads: Workload[];
  currentUser: UserProfile | null;
  onNavigateToProfile: (uid: string) => void;
}

export default function StudentPerformanceView({ users, workloads, currentUser, onNavigateToProfile }: StudentPerformanceViewProps) {
  const [selectedStudentUid, setSelectedStudentUid] = useState<string>('');

  // Default to the first student if none selected
  const activeStudentUid = selectedStudentUid || (users.length > 0 ? users[0].uid : '');
  const student = users.find(u => u.uid === activeStudentUid);

  if (!student) {
    return (
      <div className="p-8 text-center bg-neutral-950 border border-neutral-900 rounded-2xl">
        <p className="text-sm text-neutral-400">No student profiles found inside directory logs.</p>
      </div>
    );
  }

  // Calculate workloads stats
  const studentWorkloads = workloads.filter(w => w.assignedToId === student.uid);
  const completedWorkloads = studentWorkloads.filter(w => w.status === 'completed');
  const pendingWorkloads = studentWorkloads.filter(w => w.status === 'pending');
  const submittedWorkloads = studentWorkloads.filter(w => w.status === 'submitted');
  const abandonedWorkloads = studentWorkloads.filter(w => w.status === 'abandoned');

  const completionRate = studentWorkloads.length > 0 
    ? Math.round((completedWorkloads.length / studentWorkloads.length) * 100) 
    : 0;

  return (
    <div className="space-y-6 animate-fade-in text-left" id="student-performance-dashboard-root">
      
      {/* Student Selector Card */}
      <div className="bg-neutral-950 border border-neutral-900 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h4 className="font-display font-semibold text-white text-base flex items-center gap-2">
            <User className="text-emerald-400" size={16} />
            <span>Student Performance & History</span>
          </h4>
          <p className="text-xs text-neutral-400 mt-1">Completion metrics and activity reports</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-mono text-neutral-300 uppercase shrink-0">Member Directory:</label>
          <select
            value={activeStudentUid}
            onChange={e => setSelectedStudentUid(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 min-w-[200px]"
          >
            {users.map(u => (
              <option key={u.uid} value={u.uid}>
                {u.fullName} ({u.roles.join(', ')})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Spotlight & Core KPIs Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Profile Card & XP - 4 Cols */}
        <div className="lg:col-span-4 bg-neutral-950 border border-neutral-900 p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-505 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center space-x-3.5 pb-4 border-b border-neutral-900">
              <img
                src={student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120'}
                alt={student.fullName}
                className="w-14 h-14 rounded-full object-cover border border-neutral-800"
              />
              <div className="min-w-0">
                <h5 className="text-base font-bold text-white hover:text-emerald-400 cursor-pointer truncate" onClick={() => onNavigateToProfile(student.uid)}>
                  {student.fullName}
                </h5>
                <p className="text-xs text-emerald-400 font-mono tracking-wide mt-0.5">{student.roles.join(', ')}</p>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <div className="flex items-center justify-between text-sm text-neutral-300">
                <span>Verification State</span>
                <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded text-xs">Verified Member</span>
              </div>
              <div className="flex items-center justify-between text-sm text-neutral-300">
                <span>Workspace Duties</span>
                <span className="font-mono text-white font-bold">{studentWorkloads.length} total</span>
              </div>
              <div className="flex items-center justify-between text-sm text-neutral-300">
                <span>Access Levels</span>
                <span className="text-xs font-mono text-neutral-300">{student.roles[0] || 'Member'}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-neutral-900 flex justify-end">
            <button
              onClick={() => onNavigateToProfile(student.uid)}
              className="text-xs text-neutral-300 hover:text-white flex items-center gap-1.5 font-medium border border-neutral-850 hover:border-neutral-700 px-3.5 py-2 rounded-xl bg-neutral-900/40 transition-colors"
            >
              <span>View Profile</span>
              <ExternalLink size={11} className="text-neutral-500" />
            </button>
          </div>
        </div>

        {/* Detailed Points & Completion - 8 Cols */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* KPI Card 1: Combined Points */}
            <div className="bg-neutral-950 border border-neutral-900 p-5 rounded-2xl relative overflow-hidden">
              <div className="absolute top-2 right-2 text-amber-555 text-amber-500 bg-amber-500/5 p-1 rounded-lg">
                <Award size={14} />
              </div>
              <p className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold">Combined Experience</p>
              <h4 className="text-3xl font-bold font-mono text-white mt-1">{student.points || 0} XP</h4>
              <p className="text-xs text-neutral-400 mt-2">Sum of all activities</p>
            </div>

            {/* KPI Card 2: Photographer Specific Points */}
            <div className="bg-neutral-950 border border-neutral-900 p-5 rounded-2xl relative overflow-hidden">
              <div className="absolute top-2 right-2 text-cyan-400 bg-cyan-400/5 p-1 rounded-lg">
                <Camera size={14} />
              </div>
              <p className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold">Photographer XP</p>
              <h4 className="text-3xl font-bold font-mono text-cyan-400 mt-1">{student.photographerPoints || 0} XP</h4>
              <p className="text-xs text-neutral-400 mt-2">From gallery submissions</p>
            </div>

            {/* KPI Card 3: Editors Specific Points */}
            <div className="bg-neutral-950 border border-neutral-900 p-5 rounded-2xl relative overflow-hidden">
              <div className="absolute top-2 right-2 text-emerald-400 bg-emerald-400/5 p-1 rounded-lg">
                <ClipboardList size={14} />
              </div>
              <p className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold">Editorial XP</p>
              <h4 className="text-3xl font-bold font-mono text-emerald-400 mt-1">{student.editorPoints || 0} XP</h4>
              <p className="text-xs text-neutral-400 mt-2">From work duties</p>
            </div>

          </div>

          {/* Completion Progress Gauge & Breakdown */}
          <div className="bg-neutral-950 border border-neutral-900 p-5 rounded-2xl text-left">
            <h5 className="font-display font-semibold text-sm text-neutral-300 uppercase tracking-wide mb-3 flex items-center justify-between">
              <span>Task Completion Ratio</span>
              <span className="text-emerald-400 font-mono font-bold text-sm">{completionRate}%</span>
            </h5>

            <div className="w-full bg-neutral-900 h-2.5 rounded-full overflow-hidden border border-neutral-850">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>

            <div className="grid grid-cols-4 gap-3 text-center mt-5 font-mono text-xs">
              <div className="bg-neutral-900/30 p-2.5 rounded-xl border border-neutral-900/60 font-semibold">
                <p className="text-emerald-400 font-bold text-sm">{completedWorkloads.length}</p>
                <p className="text-[10px] uppercase text-neutral-400 mt-1">Completed</p>
              </div>
              <div className="bg-neutral-900/30 p-2.5 rounded-xl border border-neutral-900/60 font-semibold">
                <p className="text-amber-500 font-bold text-sm">{pendingWorkloads.length}</p>
                <p className="text-[10px] uppercase text-neutral-400 mt-1">Pending</p>
              </div>
              <div className="bg-neutral-900/30 p-2.5 rounded-xl border border-neutral-900/60 font-semibold">
                <p className="text-blue-400 font-bold text-sm">{submittedWorkloads.length}</p>
                <p className="text-[10px] uppercase text-neutral-400 mt-1">Submitted</p>
              </div>
              <div className="bg-neutral-900/30 p-2.5 rounded-xl border border-neutral-900/60 font-semibold">
                <p className="text-rose-500 font-bold text-sm">{abandonedWorkloads.length}</p>
                <p className="text-[10px] uppercase text-neutral-400 mt-1">Abandoned</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Detailed Chronological Duty timeline ledger */}
      <div className="bg-neutral-950 border border-neutral-900 p-6 rounded-3xl">
        <h4 className="font-display font-bold text-sm text-white mb-4 flex items-center space-x-2">
          <ClipboardList className="text-emerald-400" size={15} />
          <span>Detailed Workflow Timeline & Submissions History</span>
        </h4>

        {studentWorkloads.length === 0 ? (
          <div className="p-12 text-center bg-neutral-900/20 border border-dashed border-neutral-900 rounded-2xl py-14">
            <ClipboardList size={26} className="text-neutral-700 mx-auto mb-2" />
            <p className="text-xs font-semibold text-neutral-400">No workload records found</p>
            <p className="text-[10px] text-neutral-500 mt-0.5">The student has not been assigned any administrative duties yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {studentWorkloads.map(work => (
              <div key={work.id} className="bg-neutral-900/30 border border-neutral-900 hover:border-neutral-850 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[8.5px] font-bold font-mono uppercase tracking-wider px-2 py-0.5 rounded ${
                      work.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' :
                      work.status === 'abandoned' ? 'bg-rose-500/15 text-rose-450 text-rose-400' :
                      work.status === 'submitted' ? 'bg-blue-500/15 text-blue-400' :
                      'bg-neutral-800 text-neutral-400'
                    }`}>
                      {work.status}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-850 capitalize">
                      {work.type || 'editing'} Corner Duty
                    </span>
                    <span className="text-[9.5px] text-neutral-500 font-mono flex items-center gap-1">
                      <Clock size={11} />
                      <span>Due: {work.deadline}</span>
                    </span>
                  </div>

                  <h5 className="font-display font-bold text-white text-sm md:text-base">{work.title}</h5>
                  <p className="text-xs text-neutral-400 leading-relaxed font-sans">{work.description}</p>

                  {/* Submission details block if submitted/completed */}
                  {(work.submissionUrl || work.submissionNotes) && (
                    <div className="mt-3 p-3 bg-neutral-950/70 rounded-xl border border-neutral-850 text-xs">
                      <p className="text-[9.5px] font-mono text-emerald-400 uppercase tracking-wider font-bold">Submission Log:</p>
                      {work.submissionNotes && (
                        <p className="text-neutral-300 italic font-sans mt-1">"{work.submissionNotes}"</p>
                      )}
                      {work.submissionUrl && (
                        <div className="mt-2">
                          <a 
                            href={work.submissionUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="inline-flex items-center gap-1.5 text-emerald-450 text-emerald-400 hover:underline font-medium text-[11px]"
                          >
                            <span>Open Submission Attachment file</span>
                            <ExternalLink size={10} />
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold font-mono text-amber-500 bg-amber-500/5 border border-amber-500/20 px-3 py-1 rounded-full whitespace-nowrap">
                    ✨ +{work.pts} XP Bounty
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
