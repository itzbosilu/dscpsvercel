/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { useDSCPS, getUserAvatar } from '../lib/state';
import { UserProfile, RoleName } from '../types';
import { Camera, Edit2, ShieldAlert, Award, Instagram, Globe, Save, Info, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import ImageUploadField from './ImageUploadField';

interface ProfilePageProps {
  viewingUserId: string | null; // If null, defaults to currentUser
  onBackToHome?: () => void;
}

export default function ProfilePage({ viewingUserId, onBackToHome }: ProfilePageProps) {
  const { currentUser, users, gallery, updateUserRoles } = useDSCPS();
  
  // Find the exact profile we are currently inspecting
  const profileId = viewingUserId || currentUser?.uid;
  const targetUser = users.find(u => u.uid === profileId);

  const [isEditing, setIsEditing] = useState(false);
  
  // Form Edit elements
  const [editedBio, setEditedBio] = useState(targetUser?.bio || '');
  const [editedAvatar, setEditedAvatar] = useState(targetUser?.avatarUrl || '');
  const [editedBanner, setEditedBanner] = useState(targetUser?.customBannerUrl || '');
  const [editedInstagram, setEditedInstagram] = useState(targetUser?.instagramUrl || '');
  const [editedBehance, setEditedBehance] = useState(targetUser?.behanceUrl || '');
  const [editedGender, setEditedGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>(targetUser?.gender || 'Prefer not to say');

  if (!targetUser) {
    return (
      <div className="w-full max-w-xl mx-auto p-12 text-center font-sans" id="profile-not-found">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="font-display font-semibold text-lg text-white">Student Profile Not Found</h3>
        <p className="text-xs text-neutral-400 mt-1">The requested membership registry could not be located or has been archived.</p>
        {onBackToHome && (
          <button 
            onClick={onBackToHome}
            className="mt-4 px-4 py-2 bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-semibold rounded-lg hover:text-white cursor-pointer select-none"
          >
            Return to Homepage
          </button>
        )}
      </div>
    );
  }

  const isSelf = currentUser?.uid === targetUser.uid;
  const filteredExposures = gallery.filter(p => p.photographerId === targetUser.uid);

  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault();
    if (!isSelf) return;

    // Direct synchronization using local modification mutators
    targetUser.bio = editedBio;
    targetUser.avatarUrl = editedAvatar.trim();
    targetUser.customBannerUrl = editedBanner;
    targetUser.instagramUrl = editedInstagram;
    targetUser.behanceUrl = editedBehance;
    targetUser.gender = editedGender;
    
    // Save to trigger user context update (via updateUserRoles dummy or direct reference mutation that triggers sync in lib/state thanks to our user listener!)
    updateUserRoles(targetUser.uid, [...targetUser.roles]);
    setIsEditing(false);
  };

  return (
    <div id="student-profile-view" className="w-full max-w-7xl mx-auto px-4 py-6 md:py-10 text-left font-sans">
      
      {/* Back button */}
      {onBackToHome && (
        <button
          onClick={onBackToHome}
          className="flex items-center space-x-1.5 text-xs text-neutral-400 hover:text-white mb-6 uppercase font-mono cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to DSCPS Lounge</span>
        </button>
      )}

      {/* Banner Area */}
      <div className="relative h-48 md:h-72 rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-900">
        <img
          src={targetUser.customBannerUrl || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop'}
          alt="Profile Banner"
          className="w-full h-full object-cover opacity-75 animate-fade-in"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />
      </div>

      {/* User Info Details Summary block */}
      <div className="relative px-4 sm:px-6 md:px-10 -mt-16 md:-mt-24 mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
            
            {/* Avatar Frame with Fallback Silhouette */}
            <div className="relative group">
              <img
                src={getUserAvatar(targetUser.avatarUrl, targetUser.gender)}
                alt={targetUser.fullName}
                className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover border-4 border-neutral-950 shadow-2xl relative bg-neutral-950"
              />
            </div>

            {/* Core credentials info */}
            <div className="mb-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h3 className="font-display font-semibold text-2xl md:text-3xl text-white tracking-tight">{targetUser.fullName}</h3>
                <span className="text-xs font-mono bg-neutral-900 border border-neutral-800 text-neutral-400 px-2 py-0.5 rounded">
                  joined {targetUser.joinedYear}
                </span>
                <span className="text-xs font-bold font-mono bg-amber-500/15 text-amber-400 border border-amber-500/35 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-inner">
                  ✨ {targetUser.points || 0} Pts
                </span>
              </div>
              
              <p className="text-xs text-amber-500 font-mono mt-1 select-all font-semibold">Admission: {targetUser.admissionNo}</p>
              
              {/* Profile assigned roles list */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 mt-3">
                {targetUser.roles.map((role, idx) => {
                  const isAdminRole = role === 'President' || role === 'Secretary';
                  return (
                    <span 
                      key={idx} 
                      className={`text-xs font-bold font-mono uppercase tracking-wider px-2 py-0.5 rounded ${
                        isAdminRole 
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' 
                          : 'bg-neutral-900 border border-neutral-850 text-neutral-300'
                      }`}
                    >
                      {role}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action triggers */}
          {isSelf && (
            <button
              onClick={() => {
                if (!isEditing) {
                  // Pre populate
                  setEditedBio(targetUser.bio);
                  setEditedAvatar(targetUser.avatarUrl);
                  setEditedBanner(targetUser.customBannerUrl || '');
                  setEditedInstagram(targetUser.instagramUrl || '');
                  setEditedBehance(targetUser.behanceUrl || '');
                  setEditedGender(targetUser.gender || 'Prefer not to say');
                }
                setIsEditing(!isEditing);
              }}
              id="btn-edit-profile-trigger"
              className="px-4 py-2 bg-neutral-900 border border-neutral-800 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-all flex items-center space-x-1.5 self-center md:self-end cursor-pointer"
            >
              <Edit2 size={13} />
              <span>{isEditing ? 'Cancel Edits' : 'Edit Member Profile'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid: Editor forms on left OR bio, gallery showcase below */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start font-sans">
        
        {/* Left column info/links card */}
        <div className="space-y-6 lg:col-span-1">
          {/* Member Bio Card */}
          <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6">
            <h4 className="font-display font-semibold text-white text-sm uppercase tracking-wider mb-4 flex items-center space-x-2">
              <Info size={14} className="text-amber-500" />
              <span>Student Bio details</span>
            </h4>
            
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4 font-sans text-left">
                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-neutral-400 mb-1.5 font-semibold">Biography Description</label>
                  <textarea
                    rows={4}
                    value={editedBio}
                    onChange={e => setEditedBio(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-sans"
                    placeholder="Describe your student camera gears, Lightroom goals, or portfolio ambitions..."
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-neutral-400 mb-1.5 font-semibold">Gender</label>
                  <select
                    value={editedGender}
                    onChange={e => setEditedGender(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-sans cursor-pointer focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <ImageUploadField
                  label="Avatar Picture (Leave blank to use no-face placeholder)"
                  value={editedAvatar}
                  onChange={setEditedAvatar}
                  placeholder="Select or drag avatar photo..."
                  id="profile-avatar"
                />

                <ImageUploadField
                  label="Background Banner"
                  value={editedBanner}
                  onChange={setEditedBanner}
                  placeholder="Select or drag backdrop photo..."
                  id="profile-banner-input"
                />

                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-neutral-400 mb-1.5 font-semibold">Instagram Link</label>
                  <input
                    type="url"
                    value={editedInstagram}
                    onChange={e => setEditedInstagram(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-sans"
                    placeholder="https://instagram.com/your-id"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-neutral-400 mb-1.5 font-semibold">Behance Link</label>
                  <input
                    type="url"
                    value={editedBehance}
                    onChange={e => setEditedBehance(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-sans"
                    placeholder="https://behance.net/your-id"
                  />
                </div>

                <button
                  type="submit"
                  id="btn-save-profile-forms"
                  className="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-amber-550 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs cursor-pointer shadow-md transition-all active:scale-95"
                >
                  <Save size={13} />
                  <span>Save Profile Properties</span>
                </button>
              </form>
            ) : (
              <div>
                <p className="text-xs text-neutral-300 leading-relaxed font-sans min-h-12 whitespace-pre-wrap">
                  {targetUser.bio || 'This student has not composed a squad bio yet.'}
                </p>

                {/* Social media connections */}
                <div className="flex flex-col gap-2 mt-6 pt-5 border-t border-neutral-900">
                  <p className="text-xs uppercase font-mono text-neutral-500 tracking-widest font-bold">Connect & Portfolio</p>
                  
                  <div className="flex items-center space-x-2 text-xs text-neutral-400">
                    <span className="text-neutral-500">Gender:</span>
                    <span className="font-semibold text-neutral-200">{targetUser.gender || 'Prefer not to say'}</span>
                  </div>

                  {targetUser.instagramUrl ? (
                    <a
                      href={targetUser.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-xs text-neutral-400 hover:text-amber-500 transition-colors mt-1"
                    >
                      <Instagram size={14} className="text-pink-500" />
                      <span className="truncate max-w-[180px]">{targetUser.instagramUrl.replace('https://instagram.com/', '@')}</span>
                    </a>
                  ) : (
                    <div className="text-xs text-neutral-500 font-mono">No Instagram handle configured.</div>
                  )}

                  {targetUser.behanceUrl ? (
                    <a
                      href={targetUser.behanceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-xs text-neutral-400 hover:text-amber-500 transition-colors mt-1"
                    >
                      <Globe size={14} className="text-cyan-400" />
                      <span className="truncate max-w-[180px]">{targetUser.behanceUrl.replace('https://behance.net/', 'behance.net/')}</span>
                    </a>
                  ) : (
                    <div className="text-xs text-neutral-500 font-mono mt-1">No Portfolio link configured.</div>
                  )}
                  
                  <div className="flex items-center space-x-2 text-xs text-neutral-400 mt-1">
                    <Award size={14} className="text-amber-500" />
                    <span>Representative Email: {targetUser.email}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Member galleries / frames */}
        <div className="lg:col-span-2 space-y-6 font-sans">
          <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 text-left">
            <h4 className="font-display font-semibold text-white text-sm uppercase tracking-wider mb-5 flex items-center space-x-2">
              <Camera size={14} className="text-amber-500" />
              <span>Logged Exhibition Exposures ({filteredExposures.length})</span>
            </h4>

            {filteredExposures.length === 0 ? (
              <div className="text-center py-16 bg-neutral-900/10 border border-dashed border-neutral-900 rounded-2xl">
                <ImageIcon size={28} className="text-neutral-700 mx-auto mb-2" />
                <p className="text-xs text-neutral-400 font-medium">No exhibition pictures posted on DSCPS corners yet.</p>
                {isSelf && (
                  <p className="text-[11px] text-neutral-500 mt-1">Navigate to the Photographers Corner to submit your camera frames!</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5" id="user-profile-gallery-scroller">
                {filteredExposures.map(photo => (
                  <div
                    key={photo.id}
                    className="relative rounded-2xl overflow-hidden aspect-square border border-neutral-900 group"
                  >
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-103 grayscale hover:grayscale-0 duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 p-4">
                      <p className="font-display font-semibold text-white text-xs truncate leading-normal text-left">{photo.title}</p>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5 text-left">Approved framing logged on {photo.uploadedAt}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
