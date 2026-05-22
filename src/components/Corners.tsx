/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { useDSCPS, getUserAvatar } from '../lib/state';
import ImageUploadField from './ImageUploadField';
import LeaderboardView from './LeaderboardView';
import StudentPerformanceView from './StudentPerformanceView';
import IntegratedWorkspaceView from './IntegratedWorkspaceView';
import { 
  Camera, 
  BookOpen, 
  Clock, 
  User, 
  PlusCircle, 
  Trash2, 
  Tag, 
  AlertTriangle, 
  Eye, 
  Image as ImageIcon, 
  Send, 
  X, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Award, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
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

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

interface CornersProps {
  initialActiveSection: 'photographers' | 'editors';
  onNavigateToProfile: (uid: string) => void;
}

export default function Corners({ initialActiveSection, onNavigateToProfile }: CornersProps) {
  const { 
    currentUser, 
    gallery, 
    rolePrivileges, 
    addPhotoToCorner, 
    deletePhotoFromCorner,
    users,
    workloads,
    assignWorkload,
    submitWorkload,
    completeWorkload,
    abandonWorkload,
    deleteWorkload
  } = useDSCPS();

  const [activeSection, setActiveSection] = useState<'photographers' | 'editors'>(initialActiveSection);
  
  // Editors Corner Navigation states: 'workspace' (Calendar + Workloads combined), 'leaderboard' (Points dashboards), 'performance' (Admin restricted Student insights)
  const [editorsTab, setEditorsTab] = useState<'workspace' | 'leaderboard' | 'performance'>('workspace');
  const [selectedStudentUid, setSelectedStudentUid] = useState<string>('');
  const [assignType, setAssignType] = useState<'photography' | 'editing'>('editing');
  
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

  // Active Workload list filters
  const [workloadsFilter, setWorkloadsFilter] = useState<'all' | 'mine' | 'pending_review'>('all');

  // Workload Submission Dialog state
  const [submittingWorkloadId, setSubmittingWorkloadId] = useState<string | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');

  // Workload Abandon Modal state
  const [abandoningWorkload, setAbandoningWorkload] = useState<any | null>(null);
  const [abandonDeductPoints, setAbandonDeductPoints] = useState(true);
  
  // Photo Submission States
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoDesc, setPhotoDesc] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [showPhotoForm, setShowPhotoForm] = useState(false);

  // Viewer Modals
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);

  // Dummy declarations to satisfy deprecated tab blocks rendering validation
  const articles: any[] = [];
  const showArtForm = false;
  const setShowArtForm = (val: boolean) => {};
  const artTitle = '';
  const setArtTitle = (val: string) => {};
  const artContent = '';
  const setArtContent = (val: string) => {};
  const selectedArticle: any = null;
  const setSelectedArticle = (val: any) => {};
  const deleteArticleFromCorner = (id: string) => {};
  const handlePublishArticle = (e: any) => { e.preventDefault(); };

  // Checks if currentUser holds a privilege key
  const hasPrivilege = (key: string): boolean => {
    if (!currentUser) return false;
    // Admins have full access override
    if (currentUser.roles.includes('President') || currentUser.roles.includes('Secretary')) {
      return true;
    }
    return currentUser.roles.some(role => {
      const config = rolePrivileges.find(p => p.roleName === role);
      return config?.grantedPrivileges.includes(key as any);
    });
  };

  const isSufficientPhotographer = hasPrivilege('photographers_corner');
  const isSufficientEditor = hasPrivilege('editors_corner');
  const canViewAll = hasPrivilege('view_corners_all');
  const isAdmin = currentUser?.roles.some(r => r === 'President' || r === 'Secretary');

  const handleUploadPhoto = (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser || !photoTitle || !photoUrl) return;

    // Fast image validation or fallback preview
    const finalUrl = photoUrl.startsWith('http') 
      ? photoUrl 
      : 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d84a?q=80&w=600';

    addPhotoToCorner(photoTitle, photoDesc, finalUrl, currentUser.fullName, currentUser.uid);
    setPhotoTitle('');
    setPhotoDesc('');
    setPhotoUrl('');
    setShowPhotoForm(false);
  };

  // Workload Helper Handlers
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
    setAbandonDeductPoints(true);
  };

  // Calendar Helpers
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12" id="corners-view-container">
      
      {/* Corner Controls and Header */}
      <div className="flex flex-col md:flex-row items-center justify-between border-b border-neutral-800 pb-5 mb-8">
        <div>
          <h2 className="font-display font-bold text-2xl md:text-4xl text-white tracking-tight flex items-center space-x-3">
            {activeSection === 'photographers' ? (
              <>
                <Camera className="text-amber-500" />
                <span>Photographer's Corner</span>
              </>
            ) : (
              <>
                <BookOpen className="text-emerald-400" />
                <span>Editor's Corner Forum</span>
              </>
            )}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {activeSection === 'photographers' 
              ? 'A curated dark exhibition of frames submitted by verified DSCPS society photographers.'
              : 'Scholarly articles, photographic essays, digital post-processing columns, and tips.'}
          </p>
        </div>

        {/* Section Switcher Custom Tabs */}
        <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-900 mt-4 md:mt-0 font-sans">
          <button
            onClick={() => setActiveSection('photographers')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              activeSection === 'photographers'
                ? 'bg-amber-500 text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Camera size={14} />
            <span>Photographers Corner</span>
          </button>
          
          <button
            onClick={() => setActiveSection('editors')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              activeSection === 'editors'
                ? 'bg-amber-500 text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-white font-sans'
            }`}
          >
            <BookOpen size={14} />
            <span>Editors Corner</span>
          </button>
        </div>
      </div>

      {/* RENDER PHOTOGRAPHER'S CORNER */}
      {activeSection === 'photographers' && (
        <div>
          {/* Privilege checking */}
          {!currentUser ? (
            <div className="text-center p-12 bg-neutral-950 border border-neutral-900 rounded-2xl max-w-md mx-auto">
              <Camera className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <h3 className="font-display font-bold text-lg text-white">Photographers Vault is Restricted</h3>
              <p className="text-xs text-neutral-400 mt-2">You must log in to view or post frames in the photographers showcase.</p>
            </div>
          ) : !isSufficientPhotographer && !canViewAll ? (
            <div className="bg-amber-950/20 border border-amber-500/20 rounded-2xl p-6 text-center max-w-xl mx-auto my-6" id="photographers-blocked-card">
              <AlertTriangle className="w-10 h-10 text-amber-550 text-amber-500 mx-auto mb-3" />
              <h3 className="font-display font-bold text-lg text-white">Role Credentials Required</h3>
              <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                Your currently assigned roles do not grant the <code className="bg-neutral-900 px-1 py-0.5 rounded font-mono font-bold text-amber-400">photographers_corner</code> privilege. Only Student Photographers, Senior Photographers, Coordinators, and Board Admins can log exposures here.
              </p>
              <div className="mt-4 p-3 bg-neutral-900/60 rounded-xl text-left text-[11px] text-neutral-400">
                👉 <span className="font-semibold text-neutral-205">How to get access:</span> Contact the Society President or Secretary ({currentUser.email !== 'bosiluniduwara@gmail.com' && 'e.g. Bosilu'}) and request the "Photographer" or "Senior Photographer" role assignment via the member dashboard directory.
              </div>
            </div>
          ) : (
            <div>
              {/* Toolbar and submission button */}
              <div className="flex justify-between items-center mb-6">
                <p className="text-xs text-neutral-400 font-mono">SHOWCASING {gallery.length} ORIGINAL EXPOSURES</p>
                
                {isSufficientPhotographer && (
                  <button
                    onClick={() => setShowPhotoForm(!showPhotoForm)}
                    id="btn-trigger-photo-form"
                    className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs transition-transform transform hover:scale-103 cursor-pointer"
                  >
                    <PlusCircle size={14} />
                    <span>Post New Frame</span>
                  </button>
                )}
              </div>

              {/* Photo Upload Form Panel */}
              {showPhotoForm && (
                <div id="photo-submit-form-panel" className="bg-neutral-950 border border-neutral-900 rounded-2xl p-5 md:p-6 mb-8 max-w-lg mx-auto animate-fade-in text-left">
                  <h3 className="font-display font-semibold text-white text-base mb-4">Post New Exposure Frame</h3>
                  <form onSubmit={handleUploadPhoto} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5 font-sans">Exhibition Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Coronation of Mist"
                        value={photoTitle}
                        onChange={e => setPhotoTitle(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5 font-sans">Capture Description & EXIF Details</label>
                      <textarea
                        rows={3}
                        placeholder="Detail the creative context, lens zoom, shutter speeds, or school landscape context..."
                        value={photoDesc}
                        onChange={e => setPhotoDesc(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-sans"
                      />
                    </div>

                    <ImageUploadField
                      label="Frame Exposure Photo"
                      value={photoUrl}
                      onChange={setPhotoUrl}
                      placeholder="Select or drag exposure photo..."
                      id="corner-photo"
                    />

                    <div className="flex justify-end space-x-2 pt-2">
                       <button
                        type="button"
                        onClick={() => setShowPhotoForm(false)}
                        className="px-3 py-1.5 text-xs font-semibold text-neutral-400 hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-amber-500 text-neutral-950 font-bold rounded-lg text-xs cursor-pointer"
                      >
                        Upload Exposure
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Gallery Grid */}
              {gallery.length === 0 ? (
                <div className="text-center py-20 bg-neutral-950/20 border border-neutral-900 rounded-3xl" id="gallery-empty-state">
                  <ImageIcon size={32} className="text-neutral-600 mx-auto mb-3" />
                  <p className="text-neutral-400 text-sm font-semibold">No pictures uploaded in the society logs yet.</p>
                  <p className="text-neutral-500 text-xs mt-1">Be the first photographer to log creative exposure posts!</p>
                </div>
              ) : (
                <div id="photography-exhibits-masonry" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {gallery.map(photo => {
                    const isOwner = currentUser?.uid === photo.photographerId;
                    return (
                      <div
                        key={photo.id}
                        id={`exhibit-cell-${photo.id}`}
                        className="bg-neutral-950 border border-neutral-900 rounded-2xl overflow-hidden hover:border-neutral-800 transition-all duration-300 group flex flex-col justify-between"
                      >
                        {/* Photo Box */}
                        <div className="relative aspect-square overflow-hidden bg-neutral-900 cursor-pointer" onClick={() => setSelectedPhoto(photo)}>
                          <img
                            src={photo.imageUrl}
                            alt={photo.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-104"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                            <span className="flex items-center space-x-1 text-xs text-amber-400 font-bold bg-neutral-950/80 px-2 py-1 rounded-lg backdrop-blur-sm">
                              <Eye size={12} />
                              <span>View Exposure</span>
                            </span>
                          </div>
                        </div>

                        {/* Text and Actions details */}
                        <div className="p-4 flex flex-col justify-between grow">
                          <div>
                            <h4 className="font-display font-medium text-white text-base truncate tracking-tight">{photo.title}</h4>
                            <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">{photo.description}</p>
                          </div>
                          
                          {/* Footer information */}
                          <div className="flex items-center justify-between border-t border-neutral-900 pt-3 mt-3">
                            <button
                              onClick={() => onNavigateToProfile(photo.photographerId)}
                              className="flex items-center space-x-1.5 text-left text-xs text-neutral-300 hover:text-amber-400 transition-colors focus:outline-none"
                            >
                              <User size={12} className="text-neutral-400" />
                              <span className="truncate max-w-[120px] font-semibold">{photo.photographerName}</span>
                            </button>

                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] text-neutral-500 font-mono">{photo.uploadedAt}</span>
                              
                              {/* Delete option */}
                              {(isAdmin || isOwner) && (
                                <button
                                  id={`btn-delete-photo-${photo.id}`}
                                  onClick={() => deletePhotoFromCorner(photo.id)}
                                  className="p-1 px-2 rounded hover:bg-rose-955/20 text-rose-450 hover:text-rose-400 transition-colors focus:outline-none cursor-pointer"
                                  title="Delete framing entry"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* RENDER EDITOR'S CORNER */}
      {activeSection === 'editors' && (
        <div>
          {/* Privilege checking */}
          {!currentUser ? (
            <div className="text-center p-12 bg-neutral-950 border border-neutral-900 rounded-2xl max-w-md mx-auto">
              <BookOpen className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <h3 className="font-display font-bold text-lg text-white">Editors Corner is Restricted</h3>
              <p className="text-xs text-neutral-400 mt-2">Log in to view dynamic photographic catalogs and literary columns.</p>
            </div>
          ) : !isSufficientEditor && !canViewAll ? (
            <div className="bg-amber-950/20 border border-amber-500/20 rounded-2xl p-6 text-center max-w-xl mx-auto my-6" id="editors-blocked-card">
              <AlertTriangle className="w-10 h-10 text-amber-550 text-amber-500 mx-auto mb-3" />
              <h3 className="font-display font-bold text-lg text-white">Chief Credentials Required</h3>
              <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                Your currently assigned roles do not possess the <code className="bg-neutral-900 px-1 py-0.5 rounded font-mono font-bold text-amber-400">editors_corner</code> privilege. Only Society Editors, Chief Editors, Coordinators, and default Board Admins can file essays inside this Column.
              </p>
              <div className="mt-4 p-3 bg-neutral-900/60 rounded-xl text-left text-[11px] text-neutral-400">
                👉 <span className="font-semibold text-neutral-200">How to get access:</span> Contact the Board President or Secretary ({currentUser.email !== 'bosiluniduwara@gmail.com' && 'e.g. Bosilu'}) to grant you the "Editor", "Chief Editor", or "Senior Editor" profile role assignment.
              </div>
            </div>
          ) : (
            <div>
              
              {/* Internal Editors Corner Navigation Bar */}
              <div className="flex flex-wrap items-center justify-between border-b border-neutral-900 pb-3 mb-6 gap-4">
                <div className="flex space-x-1.5 bg-neutral-950/60 p-1 rounded-xl border border-neutral-900/80">
                  <button
                    onClick={() => setEditorsTab('workspace')}
                    className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                      editorsTab === 'workspace'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <ClipboardList size={13} />
                    <span>Calendar & Workloads</span>
                  </button>

                  <button
                    onClick={() => setEditorsTab('leaderboard')}
                    className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                      editorsTab === 'leaderboard'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Award size={13} />
                    <span>Points Leaderboards</span>
                  </button>

                  {hasPrivilege('view_student_performance') && (
                    <button
                      onClick={() => setEditorsTab('performance')}
                      className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                        editorsTab === 'performance'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <User size={13} />
                      <span>Student Performance</span>
                    </button>
                  )}
                </div>

                {/* Info summary showing current user points */}
                <div className="flex items-center space-x-2 bg-neutral-900/65 px-3.5 py-1.5 rounded-xl border border-neutral-800">
                  <Award size={14} className="text-amber-500" />
                  <span className="text-xs text-neutral-400 font-sans">
                    Your Score: <strong className="text-white font-bold">{currentUser?.points || 0} Pts</strong>
                  </span>
                </div>
              </div>

              {/* TAB 1: INTEGRATED CALENDAR & WORKLOADS WORKSPACE */}
              {editorsTab === 'workspace' && (
                <IntegratedWorkspaceView 
                  isAdmin={isAdmin}
                  hasPrivilege={hasPrivilege}
                  onNavigateToProfile={onNavigateToProfile}
                />
              )}

              {/* TAB 2: POINTS LEADERBOARDS */}
              {editorsTab === 'leaderboard' && (
                <LeaderboardView 
                  users={users}
                  currentUser={currentUser}
                  onNavigateToProfile={onNavigateToProfile}
                />
              )}

              {/* TAB 3: RESTRICTED STUDENT PERFORMANCE VIEWER */}
              {editorsTab === 'performance' && hasPrivilege('view_student_performance') && (
                <StudentPerformanceView 
                  users={users}
                  workloads={workloads}
                  currentUser={currentUser}
                  onNavigateToProfile={onNavigateToProfile}
                />
              )}

              {/* DEPRECATED WORKLOADS BLOCK */}
              {false && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left animate-fade-in" id="workloads-workspace-panel">
                  
                  {/* Left Column Scoreboard/Leaderboard: 4 cols */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-neutral-950 border border-neutral-900 p-5 rounded-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
                      <h4 className="font-display font-bold text-xs uppercase tracking-wider text-amber-500 flex items-center space-x-2 mb-4">
                        <Award size={14} />
                        <span>Creative Scoreboard</span>
                      </h4>

                      <p className="text-[11px] text-neutral-400 mb-4 leading-normal font-sans">
                        Accumulated Points tracker for all photographers & editors. Complete assigned duties to earn points!
                      </p>

                      <div className="space-y-2.5">
                        {[...users]
                          .sort((a, b) => (b.points || 0) - (a.points || 0))
                          .map((u, i) => (
                            <div 
                              key={u.uid} 
                              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                                currentUser?.uid === u.uid 
                                  ? 'bg-amber-500/5 border-amber-500/20' 
                                  : 'bg-neutral-900/40 border-neutral-900/80 hover:border-neutral-800'
                              }`}
                            >
                              <div className="flex items-center space-x-2.5 min-w-0" onClick={() => onNavigateToProfile(u.uid)}>
                                <div className="relative cursor-pointer">
                                  <img 
                                    src={getUserAvatar(u.avatarUrl, u.gender)} 
                                    alt={u.fullName} 
                                    className="w-7 h-7 rounded-full object-cover border border-neutral-800 grayscale-30" 
                                  />
                                  <span className="absolute -top-1 -left-1 w-4 h-4 bg-neutral-950 text-neutral-400 text-[8.5px] rounded-full border border-neutral-800 flex items-center justify-center font-mono font-black">
                                    {i + 1}
                                  </span>
                                </div>
                                <div className="text-left min-w-0">
                                  <p className="text-xs font-semibold text-white truncate max-w-[120px] hover:text-amber-400 cursor-pointer">{u.fullName}</p>
                                  <p className="text-[9px] text-neutral-500 truncate">{u.roles[0] || 'Member'}</p>
                                </div>
                              </div>
                              <span className="text-[10px] sm:text-xs font-bold font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/10">
                                {u.points || 0} Pts
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Quick Stats Block */}
                    <div className="bg-neutral-950 border border-neutral-900 p-5 rounded-2xl">
                      <h4 className="font-display font-semibold text-xs tracking-wide text-neutral-300 uppercase mb-3">Workload Statistics</h4>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-neutral-900/50 p-3 rounded-xl border border-neutral-900">
                          <p className="text-lg font-bold font-mono text-white mt-1">
                            {workloads.filter(w => w.status === 'completed').length}
                          </p>
                          <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-mono mt-1">Completed</p>
                        </div>
                        <div className="bg-neutral-900/50 p-3 rounded-xl border border-neutral-900">
                          <p className="text-lg font-bold font-mono text-white mt-1">
                            {workloads.filter(w => w.status === 'pending').length}
                          </p>
                          <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-mono mt-1">Active Duties</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column Workloads Listing: 8 cols */}
                  <div className="lg:col-span-8 space-y-6">
                    
                    {/* Toolbar Panel */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-neutral-950 border border-neutral-900 p-4 rounded-2xl">
                      {/* Filter Toggles */}
                      <div className="flex space-x-1">
                        <button
                          onClick={() => setWorkloadsFilter('all')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            workloadsFilter === 'all'
                              ? 'bg-neutral-900 text-white border border-neutral-800'
                              : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          All Workloads
                        </button>
                        <button
                          onClick={() => setWorkloadsFilter('mine')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            workloadsFilter === 'mine'
                              ? 'bg-neutral-900 text-white border border-neutral-800'
                              : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          Assigned to Me
                        </button>
                        <button
                          onClick={() => setWorkloadsFilter('pending_review')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            workloadsFilter === 'pending_review'
                              ? 'bg-neutral-900 text-white border border-neutral-800'
                              : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          Pending Review ({workloads.filter(w => w.status === 'submitted').length})
                        </button>
                      </div>

                      {/* Assign workloads executive trigger */}
                      {isAdmin || currentUser.roles.includes('Exec. Member') ? (
                        <button
                          onClick={() => setShowAssignForm(!showAssignForm)}
                          className="flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl text-xs transition-transform transform active:scale-95 cursor-pointer ml-auto sm:ml-0"
                        >
                          <PlusCircle size={13} />
                          <span>Assign Work</span>
                        </button>
                      ) : null}
                    </div>

                    {/* ASSIGNMENT FORM POPUP (Inline Modal Box) */}
                    {showAssignForm && (
                      <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-5 md:p-6 animate-fade-in relative border-l-4 border-l-emerald-500">
                        <button 
                          onClick={() => setShowAssignForm(false)} 
                          className="absolute top-4 right-4 text-neutral-500 hover:text-white cursor-pointer"
                        >
                          <X size={16} />
                        </button>

                        <h4 className="font-display font-semibold text-white ml-1 text-sm md:text-base mb-4 flex items-center space-x-2">
                          <ClipboardList className="text-emerald-400" size={16} />
                          <span>Delegate New Editorial Workload</span>
                        </h4>

                        <form onSubmit={handleAssignWorkload} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">Duty Title</label>
                              <input
                                type="text"
                                required
                                placeholder="Color grade sports meet snapshots"
                                value={assignTitle}
                                onChange={e => setAssignTitle(e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">Assign Editor / Student</label>
                              <select
                                required
                                value={assignTo}
                                onChange={e => setAssignTo(e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-300 focus:outline-none focus:border-emerald-500"
                              >
                                <option value="">-- Choose member --</option>
                                {users.map(u => (
                                  <option key={u.uid} value={u.uid}>
                                    {u.fullName} ({u.roles.join(', ')})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">Description & Guidelines</label>
                            <textarea
                              rows={3}
                              placeholder="Detail instructions, resolution sizes, moodboard colors, where to export files to..."
                              value={assignDesc}
                              onChange={e => setAssignDesc(e.target.value)}
                              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">Ploy Deadline</label>
                              <input
                                type="date"
                                required
                                value={assignDeadline}
                                onChange={e => setAssignDeadline(e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">Reward Bounty (Points / Pts)</label>
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
                              className="px-3 py-1.5 border border-transparent text-xs font-semibold text-neutral-400 hover:text-white cursor-pointer"
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

                    {/* ABANDONMENT WITH PENALTY POPUP */}
                    {abandoningWorkload && (
                      <div className="bg-neutral-950 border border-red-500/20 rounded-2xl p-6 text-center animate-fade-in relative border-l-4 border-l-rose-500">
                        <button 
                          onClick={() => setAbandoningWorkload(null)} 
                          className="absolute top-4 right-4 text-neutral-500 hover:text-white cursor-pointer"
                        >
                          <X size={16} />
                        </button>

                        <AlertTriangle className="text-rose-500 w-10 h-10 mx-auto mb-3" />
                        <h4 className="font-display font-semibold text-white text-sm md:text-base">Declare Workload Abandoned?</h4>
                        <p className="text-xs text-neutral-400 mt-2 max-w-md mx-auto leading-normal">
                          You are marking <strong className="text-neutral-200">"{abandoningWorkload.title}"</strong> as abandoned. Any executive member can decide whether or not to subtract points as penalty.
                        </p>

                        <div className="mt-4 max-w-sm mx-auto bg-neutral-900/60 p-3.5 rounded-xl border border-neutral-850 text-left">
                          <label className="flex items-center space-x-2.5 cursor-pointer select-none text-xs text-neutral-300">
                            <input 
                              type="checkbox" 
                              checked={abandonDeductPoints} 
                              onChange={e => setAbandonDeductPoints(e.target.checked)}
                              className="w-4 h-4 accent-rose-500 cursor-pointer"
                            />
                            <span>Deduct <strong className="text-rose-400 font-bold font-mono">{abandoningWorkload.pts} Pts</strong> penalty from {abandoningWorkload.assignedToName} (assignee total score)?</span>
                          </label>
                        </div>

                        <div className="flex justify-center space-x-3 mt-6">
                          <button
                            onClick={() => setAbandoningWorkload(null)}
                            className="px-4 py-2 bg-neutral-900 border border-neutral-850 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={confirmAbandonWorkload}
                            className="px-4 py-2 bg-rose-500 hover:bg-rose-455 hover:bg-rose-400 text-neutral-950 font-bold rounded-xl text-xs cursor-pointer"
                          >
                            Confirm Abandon Status
                          </button>
                        </div>
                      </div>
                    )}

                    {/* CORE WORKLOADS LIST */}
                    {(() => {
                      let filtered = workloads;
                      if (workloadsFilter === 'mine') {
                        filtered = workloads.filter(w => w.assignedToId === currentUser?.uid);
                      } else if (workloadsFilter === 'pending_review') {
                        filtered = workloads.filter(w => w.status === 'submitted');
                      }

                      if (filtered.length === 0) {
                        return (
                          <div className="p-12 bg-neutral-950/20 border border-neutral-900 rounded-2xl text-center py-16">
                            <ClipboardList size={28} className="text-neutral-700 mx-auto mb-2" />
                            <p className="text-xs text-neutral-400 font-semibold">No workloads match the selected filter.</p>
                            <p className="text-[10px] text-neutral-500 mt-0.5">Assigned works list will populate dynamically!</p>
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
                                className={`bg-neutral-950 border rounded-2xl p-5 md:p-6 text-left relative overflow-hidden transition-all duration-300 hover:border-neutral-800 ${
                                  work.status === 'completed' ? 'border-emerald-500/10' :
                                  work.status === 'abandoned' ? 'border-rose-500/10' :
                                  isOverdue ? 'border-red-500/20 bg-red-500/[0.01]' : 'border-neutral-900/90'
                                }`}
                              >
                                {/* Background glow accent strip */}
                                <div className={`absolute left-0 top-0 h-full w-1 ${
                                  work.status === 'completed' ? 'bg-emerald-500' :
                                  work.status === 'abandoned' ? 'bg-rose-500' :
                                  work.status === 'submitted' ? 'bg-blue-450 bg-blue-500' :
                                  isOverdue ? 'bg-red-500' : 'bg-neutral-800'
                                }`} />

                                <div className="flex flex-wrap items-start justify-between gap-3 min-w-0">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                      <span className={`text-[9px] font-bold font-mono tracking-wider uppercase px-2 py-0.5 rounded ${
                                        work.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' :
                                        work.status === 'abandoned' ? 'bg-rose-500/15 text-rose-450 text-rose-400' :
                                        work.status === 'submitted' ? 'bg-blue-500/15 text-blue-400' :
                                        'bg-neutral-900 text-neutral-400 border border-neutral-850'
                                      }`}>
                                        {work.status}
                                      </span>
                                      {isOverdue && (
                                        <span className="text-[9px] font-bold font-mono text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/10 animate-pulse">
                                          ⚠️ Overdue
                                        </span>
                                      )}
                                      <span className="text-[10px] text-neutral-400 font-mono flex items-center gap-1">
                                        <Clock size={11} className="text-neutral-500" />
                                        <span>Deadline: {work.deadline}</span>
                                      </span>
                                    </div>

                                    <h5 className="font-display font-semibold text-white text-base md:text-lg tracking-tight">
                                      {work.title}
                                    </h5>
                                    
                                    <p className="text-xs text-neutral-300 font-sans mt-2 leading-relaxed">
                                      {work.description}
                                    </p>
                                  </div>

                                  <div className="text-right">
                                    <span className="text-xs font-bold font-mono bg-amber-500/15 text-amber-500/90 hover:text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full whitespace-nowrap block">
                                      ✨ + {work.pts} Pts
                                    </span>
                                  </div>
                                </div>

                                {/* Assignments roster footer text */}
                                <div className="mt-4 pt-3.5 border-t border-neutral-900/60 flex flex-wrap items-center justify-between text-[11px] text-neutral-400 gap-3 font-sans">
                                  <div>
                                    <span>Assignee: </span>
                                    <strong 
                                      onClick={() => onNavigateToProfile(work.assignedToId)}
                                      className="text-neutral-200 hover:text-amber-455 hover:text-amber-400 cursor-pointer underline decoration-dotted font-medium"
                                    >
                                      {work.assignedToName}
                                    </strong>
                                    {isAssignee && <span className="text-amber-500 font-mono text-[9px] font-black ml-1.5 uppercase bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/10">You</span>}
                                  </div>

                                  <div className="text-neutral-500 font-mono text-[10px]">
                                    Delegate: <span>{work.assignedByName}</span>
                                  </div>
                                </div>

                                {/* Submission proof show area */}
                                {(work.status === 'submitted' || work.status === 'completed') && work.submissionUrl && (
                                  <div className="mt-4 bg-neutral-900/40 p-3.5 rounded-xl border border-neutral-900 text-[11px] leading-relaxed relative">
                                    <p className="font-mono text-neutral-520 text-neutral-500 font-bold uppercase tracking-wider mb-1 text-[9px]">Proof Submission Archive</p>
                                    <p className="text-neutral-300 italic">“ {work.submissionNotes || 'No notes written.'} ”</p>
                                    <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-neutral-850 pt-2 font-sans">
                                      <a 
                                        href={work.submissionUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold truncate"
                                        referrerPolicy="no-referrer"
                                      >
                                        <ImageIcon size={11} />
                                        <span>View submitted work URL</span>
                                      </a>
                                      {work.submittedAt && <span className="text-neutral-500 font-mono text-[9px]">Submitted: {work.submittedAt}</span>}
                                    </div>
                                  </div>
                                )}

                                {/* ACTION ENGINE ROW */}
                                <div className="mt-4 pt-4 border-t border-neutral-900/60 flex flex-wrap items-center justify-end gap-2.5">
                                  
                                  {/* Editor Upload Work Trigger */}
                                  {isAssignee && work.status === 'pending' && submittingWorkloadId !== work.id && (
                                    <button
                                      onClick={() => {
                                        setSubmittingWorkloadId(work.id);
                                        setSubmissionUrl('');
                                        setSubmissionNotes('');
                                      }}
                                      className="px-3.5 py-1.5 bg-amber-500 text-neutral-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                      <Send size={11.5} />
                                      <span>Upload Finished Work</span>
                                    </button>
                                  )}

                                  {/* Editor Submit Inline Form block */}
                                  {isAssignee && submittingWorkloadId === work.id && (
                                    <div className="w-full bg-neutral-900/60 p-4 rounded-xl border border-neutral-850 mt-2 text-left">
                                      <h6 className="font-display font-semibold text-white text-xs mb-3 flex items-center gap-1">
                                        <ImageIcon className="text-amber-500" size={13} />
                                        <span>Submit finished work artifact (points will increase upon approval)</span>
                                      </h6>

                                      <form onSubmit={(e) => handleEditorSubmitWork(e, work.id)} className="space-y-3">
                                        <div>
                                          <label className="block text-[9.5px] font-mono text-neutral-400 uppercase tracking-wider mb-1">Image URL / Finished File Drive link</label>
                                          <input
                                            type="url"
                                            required
                                            placeholder="https://images.unsplash.com/photo-... or Google Drive folder"
                                            value={submissionUrl}
                                            onChange={e => setSubmissionUrl(e.target.value)}
                                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-[9.5px] font-mono text-neutral-400 uppercase tracking-wider mb-1">Submission notes for Executive review</label>
                                          <textarea
                                            rows={2}
                                            placeholder="Introduce the post-processing edits performed, or focus levels..."
                                            value={submissionNotes}
                                            onChange={e => setSubmissionNotes(e.target.value)}
                                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500 font-sans"
                                          />
                                        </div>

                                        <div className="flex justify-end gap-1.5 pt-1">
                                          <button
                                            type="button"
                                            onClick={() => setSubmittingWorkloadId(null)}
                                            className="px-2.5 py-1 text-[11px] text-neutral-400 hover:text-white cursor-pointer"
                                          >
                                            Dismiss
                                          </button>
                                          <button
                                            type="submit"
                                            className="px-3.5 py-1 bg-amber-500 text-neutral-950 font-bold rounded-lg text-[11px] cursor-pointer"
                                          >
                                            Send File proof
                                          </button>
                                        </div>
                                      </form>
                                    </div>
                                  )}

                                  {/* Executive Decision Controllers */}
                                  {(isAdmin || currentUser.roles.includes('Exec. Member')) && (
                                    <div className="flex flex-wrap items-center gap-2">
                                      {/* Quick Mark Completed & Award Pts */}
                                      {work.status !== 'completed' && (
                                        <button
                                          onClick={() => completeWorkload(work.id)}
                                          className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-neutral-950 font-bold rounded-lg text-[10.5px] transition-colors flex items-center gap-1 cursor-pointer"
                                          title="Approve work and increment user points balance!"
                                        >
                                          <CheckCircle size={11} />
                                          <span>Approve & Complete</span>
                                        </button>
                                      )}

                                      {/* Declares abandoned with subtract choice */}
                                      {work.status !== 'abandoned' && work.status !== 'completed' && (
                                        <button
                                          onClick={() => {
                                            setAbandoningWorkload(work);
                                            setAbandonDeductPoints(true);
                                          }}
                                          className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-455 text-rose-400 hover:bg-rose-500 hover:text-neutral-950 font-semibold rounded-lg text-[10.5px] transition-colors flex items-center gap-1 cursor-pointer"
                                          title="Mark workload as abandoned & decide penalty points deletion."
                                        >
                                          <XCircle size={11} />
                                          <span>Mark Abandoned</span>
                                        </button>
                                      )}

                                      {/* Direct Removal / Trash action */}
                                      <button
                                        onClick={() => deleteWorkload(work.id)}
                                        className="p-1.5 rounded-lg text-neutral-500 hover:text-white bg-neutral-900 border border-neutral-850 hover:border-neutral-800 hover:bg-neutral-800 transition-colors cursor-pointer"
                                        title="Delete workload log"
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
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
              )}

              {/* DEPRECATED CALENDAR BLOCK */}
              {false && (
                <div className="bg-neutral-950 border border-neutral-900 p-5 md:p-8 rounded-3xl animate-fade-in text-left" id="sri-lankan-calendar-panel">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-neutral-900 pb-5 mb-6 gap-4">
                    <div>
                      <h4 className="font-display font-bold text-lg md:text-xl text-white flex items-center space-x-2.5">
                        <Calendar className="text-emerald-400" />
                        <span>Interactive Society Calendar (2026)</span>
                      </h4>
                      <p className="text-[11px] text-neutral-400 mt-1">
                        Tracking Sri Lankan traditional holidays, religious moon Poya days, and live workloads due.
                      </p>
                    </div>

                    {/* Month selector navigation */}
                    <div className="flex items-center space-x-2 bg-neutral-900 p-1 rounded-xl border border-neutral-850 self-start md:self-auto font-mono">
                      <button 
                        onClick={handlePrevMonth}
                        className="p-1 px-2 rounded-lg hover:bg-neutral-800 text-neutral-350 hover:text-white transition-colors cursor-pointer"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-xs font-bold text-white px-2 uppercase tracking-wider min-w-[100px] text-center">
                        {MONTH_NAMES[currentMonth]} {currentYear}
                      </span>
                      <button 
                        onClick={handleNextMonth}
                        className="p-1 px-2 rounded-lg hover:bg-neutral-800 text-neutral-350 hover:text-white transition-colors cursor-pointer"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* The Calendar Grid: 8 columns */}
                    <div className="lg:col-span-8 bg-neutral-950 border border-neutral-900 p-4 rounded-2xl">
                      {/* Weekday indicator row headers */}
                      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 text-center text-[10px] font-mono text-neutral-500 uppercase tracking-widest font-black">
                        <div>Sun</div>
                        <div>Mon</div>
                        <div>Tue</div>
                        <div>Wed</div>
                        <div>Thu</div>
                        <div>Fri</div>
                        <div>Sat</div>
                      </div>

                      {/* Calender Grid blocks */}
                      <div className="grid grid-cols-7 gap-1.5 md:gap-2.5">
                        {(() => {
                          const totalDays = getDaysInMonth(currentYear, currentMonth);
                          const firstDayIdx = getFirstDayOfMonth(currentYear, currentMonth);
                          const cells = [];

                          // Pad out empty cells
                          for (let p = 0; p < firstDayIdx; p++) {
                            cells.push(<div key={`pad-${p}`} className="aspect-square bg-transparent rounded-lg" />);
                          }

                          // Render monthly cells
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
                                className={`aspect-square p-1 sm:p-2 rounded-xl flex flex-col justify-between border cursor-pointer select-none transition-all ${
                                  isChosen 
                                    ? 'bg-emerald-500/10 border-emerald-505 border-emerald-550 border-emerald-500' 
                                    : isToday 
                                      ? 'bg-neutral-900 border-amber-500/30' 
                                      : 'bg-neutral-900/40 border-neutral-900 hover:border-neutral-800'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className={`text-xs font-bold font-mono ${
                                    isToday ? 'text-amber-500 font-black' : isChosen ? 'text-emerald-400' : 'text-neutral-300'
                                  }`}>
                                    {d}
                                  </span>
                                  {isToday && (
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" title="Current system time" />
                                  )}
                                </div>

                                {/* Event dot indicators inside minimal grid slots */}
                                <div className="flex items-center space-x-1 justify-center py-0.5">
                                  {holidays.length > 0 && (
                                    <span className="w-2 h-2 text-[8px] bg-emerald-500 text-neutral-950 rounded-full flex items-center justify-center font-black" title={`${holidays.length} Holiday: ${holidays[0]}`}>
                                      🇱🇰
                                    </span>
                                  )}
                                  {activeWork.length > 0 && (
                                    <span className="w-2.5 h-2.5 text-[8px] font-mono bg-amber-500 text-neutral-950 font-black rounded-full flex items-center justify-center" title={`${activeWork.length} Workload(s) due!`}>
                                      {activeWork.length}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          }

                          return cells;
                        })()}
                      </div>
                    </div>

                    {/* Selected Day Agenda Information Panel: 4 columns */}
                    <div className="lg:col-span-4 space-y-4">
                      {selectedCalendarDate ? (
                        <div className="bg-neutral-950 border border-neutral-900 p-5 rounded-2xl relative">
                          <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-neutral-400 border-b border-neutral-950/80 pb-3 mb-4">
                            Agenda for: <strong className="text-white font-mono">{selectedCalendarDate}</strong>
                          </h4>

                          {/* 🇱🇰 Holiday block if matching */}
                          {(() => {
                            const holidays = SRI_LANKAN_HOLIDAYS_2026[selectedCalendarDate] || [];
                            if (holidays.length === 0) return null;

                            return (
                              <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-505/20 border-emerald-500/20 rounded-xl">
                                <p className="text-[10px] font-bold font-mono tracking-wider text-emerald-400 uppercase flex items-center gap-1">
                                  <span>🇱🇰</span>
                                  <span>Official Lankan Holiday / Special Day</span>
                                </p>
                                <div className="space-y-1 mt-2">
                                  {holidays.map((h, i) => (
                                    <h5 key={i} className="text-xs font-display font-bold text-white tracking-tight">
                                      • {h}
                                    </h5>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}

                          {/* Workload assignments list matching this date */}
                          <div>
                            <p className="text-[10px] font-bold font-mono uppercase text-neutral-510 text-neutral-500 tracking-wider mb-3">Workloads Due On This Day</p>

                            {(() => {
                              const matchWork = workloads.filter(w => w.deadline === selectedCalendarDate);
                              if (matchWork.length === 0) {
                                return (
                                  <div className="p-6 bg-neutral-900/30 border border-dashed border-neutral-900 text-center rounded-xl py-10">
                                    <ClipboardList size={22} className="text-neutral-700 mx-auto mb-1.5" />
                                    <p className="text-[11px] text-neutral-400 font-medium">No deadlines scheduled</p>
                                    <p className="text-[9.5px] text-neutral-500 mt-0.5">Perfect day to submit existing backlog!</p>
                                  </div>
                                );
                              }

                              return (
                                <div className="space-y-3">
                                  {matchWork.map(w => (
                                    <div 
                                      key={w.id} 
                                      className="bg-neutral-900 hover:border-neutral-800 p-3.5 rounded-xl border border-neutral-900 text-left relative"
                                    >
                                      <div className="flex justify-between items-start gap-1">
                                        <h5 className="text-xs font-bold text-white font-sans max-w-[130px] truncate leading-snug">{w.title}</h5>
                                        <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                          w.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' :
                                          w.status === 'abandoned' ? 'bg-rose-500/15 text-rose-400' :
                                          'bg-amber-500/10 text-amber-500'
                                        }`}>
                                          {w.status}
                                        </span>
                                      </div>

                                      <p className="text-[10px] text-neutral-400 font-sans mt-2 line-clamp-2 leading-relaxed">
                                        {w.description}
                                      </p>

                                      <div className="mt-3 flex items-center justify-between text-[9px] text-neutral-500 border-t border-neutral-850 pt-2">
                                        <span>For: <strong className="text-neutral-320 text-neutral-300 font-medium">{w.assignedToName}</strong></span>
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
                        <div className="bg-neutral-950 border border-neutral-900 p-8 rounded-2xl text-center py-14">
                          <Calendar size={28} className="text-neutral-700 mx-auto mb-2" />
                          <p className="text-xs text-neutral-400 font-semibold">Select a Calendar cell</p>
                          <p className="text-[10px] text-neutral-500 mt-1">Select any date square to audit Sri Lankan holidays or active deadlines roster!</p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* DEPRECATED ARTICLES BLOCK */}
              {false && (
                <div className="space-y-6 animate-fade-in" id="editorial-articles-panel">
                  
                  {/* Toolbar and submission button */}
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-xs text-neutral-400 font-mono">PUBLISHED {articles.length} CHIEF ESSAY COLUMNS</p>
                    
                    {isSufficientEditor && (
                      <button
                        onClick={() => setShowArtForm(!showArtForm)}
                        id="btn-trigger-art-form"
                        className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs transition-transform transform hover:scale-103 cursor-pointer"
                      >
                        <PlusCircle size={14} />
                        <span>File New Column</span>
                      </button>
                    )}
                  </div>

                  {/* Column Publication Form */}
                  {showArtForm && (
                    <div id="art-submit-form-panel" className="bg-neutral-950 border border-neutral-900 rounded-2xl p-5 md:p-6 mb-8 max-w-xl mx-auto animate-fade-in text-left">
                      <h3 className="font-display font-semibold text-white text-base mb-4">File a Literary society Essay</h3>
                      <form onSubmit={handlePublishArticle} className="space-y-4">
                        <div>
                          <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Essay Headline</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Navigating Chromatic Grain in Low-Light Portraiture"
                            value={artTitle}
                            onChange={e => setArtTitle(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Content / Article Essay Text</label>
                          <textarea
                            rows={10}
                            required
                            placeholder="Write your creative post structure, manual guidelines, Lightroom hacks, or exposure essays here..."
                            value={artContent}
                            onChange={e => setArtContent(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-sans leading-relaxed"
                          />
                          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">📝 Dynamic lines spacing is automatically preserved in client column reading layout.</span>
                        </div>

                        <div className="flex justify-end space-x-2 pt-2">
                           <button
                            type="button"
                            onClick={() => setShowArtForm(false)}
                            className="px-3 py-1.5 text-xs font-semibold text-neutral-400 hover:text-white cursor-pointer"
                          >
                            Discard
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 bg-amber-500 text-neutral-950 font-bold rounded-lg text-xs flex items-center space-x-1.5 cursor-pointer"
                          >
                            <Send size={12} />
                            <span>Publish Column</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Articles lists */}
                  {articles.length === 0 ? (
                    <div className="text-center py-20 bg-neutral-950/20 border border-neutral-900 rounded-3xl" id="articles-empty-state">
                      <BookOpen size={32} className="text-neutral-600 mx-auto mb-3" />
                      <p className="text-neutral-400 text-sm font-semibold">No essays published inside column registry.</p>
                      <p className="text-neutral-505 text-neutral-500 text-xs mt-1">Be the first chief writer to file technical camera articles!</p>
                    </div>
                  ) : (
                    <div id="articles-editorial-ledger" className="space-y-6 max-w-4xl mx-auto text-left">
                      {articles.map(article => {
                        const isOwner = currentUser?.uid === article.authorId;
                        return (
                          <div
                            key={article.id}
                            id={`editorial-row-${article.id}`}
                            className="bg-neutral-950 border border-neutral-900 hover:border-neutral-800 p-6 rounded-2xl transition-all flex flex-col justify-between text-left"
                          >
                            <div>
                              {/* Title and metadata */}
                              <div className="flex items-center space-x-2 text-[10px] text-amber-500 font-mono mb-2">
                                <Clock size={11} />
                                <span>Published on: {article.createdAt}</span>
                                <span>•</span>
                                <span className="truncate">Writer Account verified</span>
                              </div>

                              <h3 
                                onClick={() => setSelectedArticle(article)}
                                className="font-display font-bold text-lg md:text-xl text-white tracking-tight hover:text-amber-400 cursor-pointer transition-colors max-w-3xl"
                              >
                                {article.title}
                              </h3>

                              <p className="text-xs text-neutral-400 mt-2 line-clamp-3 leading-relaxed font-sans">
                                {article.content}
                              </p>
                            </div>

                            {/* Author and Action */}
                            <div className="flex items-center justify-between border-t border-neutral-900/60 pt-4 mt-5">
                              <button
                                onClick={() => onNavigateToProfile(article.authorId)}
                                className="flex items-center space-x-2 text-xs text-neutral-350 hover:text-amber-400 font-medium cursor-pointer bg-transparent border-transparent"
                              >
                                <img
                                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop"
                                  alt={article.authorName}
                                  className="w-5 h-5 rounded-full object-cover"
                                />
                                <span>Column by {article.authorName}</span>
                              </button>

                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={() => setSelectedArticle(article)}
                                  className="text-xs font-semibold text-amber-400 hover:underline cursor-pointer"
                                >
                                  Expand Column →
                                </button>

                                {(isAdmin || isOwner) && (
                                  <button
                                    id={`btn-delete-article-${article.id}`}
                                    onClick={() => deleteArticleFromCorner(article.id)}
                                    className="p-1 px-2 text-rose-500 hover:bg-rose-955/20 hover:text-rose-450 rounded transition-colors cursor-pointer"
                                    title="Delete article column"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* PHOTO EXPLORER MODAL VIEW */}
      {selectedPhoto && (
        <div id="photo-exhibit-viewer-overlay" className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl w-full bg-neutral-950 border border-neutral-900 rounded-3xl overflow-hidden shadow-2xl relative">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-900/80 text-white hover:bg-amber-500 hover:text-neutral-950 transition-colors z-10 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col md:flex-row">
              {/* Photo Area */}
              <div className="md:w-3/5 bg-black flex items-center justify-center">
                <img
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.title}
                  className="max-h-[70vh] md:max-h-[80vh] w-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Data Area */}
              <div className="md:w-2/5 p-6 md:p-8 text-left flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold font-mono tracking-widest text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase">
                    Original Exposure
                  </span>
                  
                  <h3 className="font-display font-bold text-xl md:text-2xl text-white mt-3 leading-tight">
                    {selectedPhoto.title}
                  </h3>
                  
                  <p className="text-[10px] text-neutral-500 font-mono mt-1">Uploaded frame date: {selectedPhoto.uploadedAt}</p>
                  
                  <p className="text-xs md:text-sm text-neutral-300 mt-4 leading-relaxed whitespace-pre-wrap font-sans">
                    {selectedPhoto.description}
                  </p>
                </div>

                <div className="border-t border-neutral-900 pt-5 mt-6">
                  <p className="text-[10px] text-neutral-500 uppercase font-mono tracking-wider mb-2">Photographed By</p>
                  <button
                    onClick={() => {
                      onNavigateToProfile(selectedPhoto.photographerId);
                      setSelectedPhoto(null);
                    }}
                    className="flex items-center space-x-3 text-neutral-250 hover:text-amber-400 group cursor-pointer animate-fade-in"
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-550 text-amber-500 flex items-center justify-center font-bold text-xs group-hover:bg-amber-500 group-hover:text-amber-950 transition-all">
                      {selectedPhoto.photographerName.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-normal">{selectedPhoto.photographerName}</p>
                      <p className="text-[9px] text-neutral-500 font-mono">View Student Profile Page →</p>
                    </div>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ARTICLE EXPLORER MODAL VIEW */}
      {selectedArticle && (
        <div id="article-column-viewer-overlay" className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 font-sans">
          <div className="max-w-2xl w-full bg-neutral-950 border border-neutral-900 rounded-3xl overflow-hidden shadow-2xl p-6 md:p-10 relative text-left">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-900 text-white hover:bg-amber-500 hover:text-neutral-950 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="mb-6 animate-fade-in">
              <span className="text-[10px] font-bold font-mono tracking-widest text-emerald-400 bg-emerald-400/10 px-2.5 py-0.5 rounded-full uppercase">
                Editor's Literary Panel
              </span>
              <h3 className="font-display font-bold text-xl md:text-3xl text-white mt-4 leading-tight tracking-tight">
                {selectedArticle.title}
              </h3>
              <div className="flex items-center space-x-2 text-[10px] text-neutral-500 font-mono mt-2">
                <span>Filed: {selectedArticle.createdAt}</span>
                <span>•</span>
                <span>By verified society editor</span>
              </div>
            </div>

            {/* Scrollable Column Text */}
            <div className="max-h-[50vh] overflow-y-auto pr-2 mb-6">
              <p className="text-xs md:text-sm leading-relaxed font-sans whitespace-pre-wrap text-neutral-300">
                {selectedArticle.content}
              </p>
            </div>

            <div className="border-t border-neutral-900 pt-5 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop"
                  alt={selectedArticle.authorName}
                  className="w-6 h-6 rounded-full object-cover grayscale text-neutral-500"
                />
                <span className="text-neutral-400">Contributor:</span>
                <button
                  onClick={() => {
                    onNavigateToProfile(selectedArticle.authorId);
                    setSelectedArticle(null);
                  }}
                  className="text-amber-405 text-amber-400 font-semibold hover:underline"
                >
                  {selectedArticle.authorName}
                </button>
              </div>

              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Close Column
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
