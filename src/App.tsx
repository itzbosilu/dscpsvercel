/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { DSCPSProvider, useDSCPS } from './lib/state';
import Navbar from './components/Navbar';
import AboutUsPage from './components/AboutUsPage';
import Corners from './components/Corners';
import ProfilePage from './components/ProfilePage';
import AdminDashboard from './components/AdminDashboard';
import AuthPages from './components/AuthPages';
import { Camera, BookOpen, Clock, Megaphone, CornerDownRight, ArrowUpRight, Compass, Shield, Image as ImageIcon } from 'lucide-react';

function DSCPSAppContent() {
  const { siteConfig, announcements, gallery, currentUser } = useDSCPS();
  
  const [currentTab, setCurrentTab] = useState<'home' | 'about' | 'photographers' | 'editors' | 'profile' | 'admin' | string>('home');
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  // Helper trigger to browse to a user profile page
  const handleNavigateToProfile = (uid: string) => {
    setViewingUserId(uid);
    setCurrentTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartAuthFlow = () => {
    setAuthOpen(true);
  };

  const handleTabChange = (tabId: string) => {
    // Reset secondary states
    if (tabId !== 'profile') {
      setViewingUserId(null);
    }
    setCurrentTab(tabId);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="relative min-h-screen bg-neutral-950 font-sans text-neutral-200 flex flex-col justify-between" id="applet-viewport">
      
      {/* Dynamic Navbar */}
      <Navbar 
        currentTab={currentTab} 
        setCurrentTab={handleTabChange} 
        onOpenAuth={handleStartAuthFlow} 
      />

      {/* Main Dynamic Workspace Contents */}
      <main className="grow">
        
        {/* HOMEPAGE VIEW CHANNELS */}
        {currentTab === 'home' && (
          <div id="homepage-section" className="animate-fade-in">
            
            {/* Photographic Cinematic Hero */}
            <header className="relative w-full overflow-hidden bg-neutral-900 border-b border-neutral-800/80 pb-16 pt-20 md:py-28 lg:py-36 text-center">
              {/* Backing image with cinematic vignettes */}
              <div className="absolute inset-0 z-0">
                <img
                  src={siteConfig.heroImageUrl}
                  alt="Photography backdrop"
                  className="w-full h-full object-cover opacity-35"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/70 via-neutral-950/90 to-neutral-950" />
              </div>

              {/* Foreground content blocks */}
              <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                <div className="flex justify-center mb-6 space-x-1 items-center">
                  <span className="text-[10px] font-black tracking-widest bg-amber-500/10 text-amber-505 text-amber-500 px-3 py-1 rounded-full uppercase border border-amber-500/20">
                    Est. 2024 • Active Society
                  </span>
                </div>

                <h1 className="font-display font-bold text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-tight">
                  {siteConfig.societyName}
                </h1>
                
                <p className="font-display text-base sm:text-lg md:text-xl text-amber-400 mt-4 font-medium tracking-tight">
                  “ {siteConfig.tagline} ”
                </p>

                <p className="text-xs md:text-sm text-neutral-400 max-w-2xl mx-auto mt-6 leading-relaxed font-sans">
                  The official photographic digital command portal of the {siteConfig.schoolName}. Explore camera frames, connect rosters, read exposure guidelines, and register student credentials.
                </p>

                {/* Hero Trigger Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
                  <button
                    onClick={() => handleTabChange('about')}
                    className="px-5 py-3 bg-amber-500 text-neutral-950 font-bold rounded-xl text-xs transition-all hover:bg-amber-400 active:scale-97 shadow-lg flex items-center space-x-2 cursor-pointer"
                  >
                    <Compass size={14} />
                    <span>Explore Governing Board</span>
                  </button>

                  <button
                    onClick={() => handleTabChange('photographers')}
                    className="px-5 py-3 bg-neutral-900 border border-neutral-800 text-neutral-200 font-semibold rounded-xl text-xs transition-all hover:bg-neutral-800 hover:text-white flex items-center space-x-2 cursor-pointer"
                  >
                    <Camera size={14} className="text-amber-500" />
                    <span>View Lightroom Corner</span>
                  </button>
                  
                  {!currentUser && (
                    <button
                      onClick={handleStartAuthFlow}
                      className="px-4 py-3 bg-transparent text-neutral-400 hover:text-white text-xs font-medium cursor-pointer"
                    >
                      Connect Student Roster →
                    </button>
                  )}
                </div>
              </div>
            </header>

            {/* Split Grid Section: notice board left, showcase galleries right */}
            <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-14">
              
              {/* Left Column: Notice Board Bulletin */}
              <section className="lg:col-span-4 space-y-6" id="notice-board-section">
                <div className="flex items-center space-x-2.5 mb-2">
                  <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                    <Megaphone size={18} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-white">Society Bulletins</h3>
                    <p className="text-[10px] text-neutral-500 font-mono">DSCPS NOTICE DESK</p>
                  </div>
                </div>

                {announcements.length === 0 ? (
                  <div className="p-8 bg-neutral-900/15 border border-dashed border-neutral-800 rounded-2xl text-center">
                    <Clock size={20} className="text-neutral-700 mx-auto mb-2" />
                    <p className="text-xs text-neutral-400">Notice board is clear for the week.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {announcements.map(ann => (
                      <div 
                        key={ann.id} 
                        className="bg-neutral-950 border border-neutral-900/80 p-5 rounded-2xl hover:border-neutral-800 transition-all duration-300 text-left relative overflow-hidden group"
                      >
                        {/* Notice Glow strip */}
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/40" />

                        <div className="flex items-center space-x-2 text-[9px] text-amber-500 font-mono uppercase mb-2">
                          <Clock size={10} />
                          <span>{ann.date}</span>
                        </div>

                        <h4 className="font-display font-semibold text-white text-xs md:text-sm tracking-tight leading-snug">
                          {ann.title}
                        </h4>

                        <p className="text-xs text-neutral-400 font-sans mt-2.5 leading-normal line-clamp-4">
                          {ann.content}
                        </p>

                        <div className="mt-4 pt-3 border-t border-neutral-900/50 flex justify-between items-center text-[9px] font-mono text-neutral-500">
                          <span className="truncate">By {ann.author}</span>
                          <span className="shrink-0 flex items-center space-x-1 text-neutral-400">
                            <span>Admin Verified</span>
                            <Shield size={9} />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Right Column: Dynamic Photographers Exhibition Showcase */}
              <section className="lg:col-span-8 space-y-6" id="photo-expo-showcase">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-amber-500/10 text-amber-550 text-amber-500 rounded-lg">
                      <Camera size={18} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-white">Recent Gallery Exposures</h3>
                      <p className="text-[10px] text-neutral-500 font-mono">LATEST EXHIBITS</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleTabChange('photographers')}
                    className="text-xs font-semibold text-amber-400 hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Lounge Corner</span>
                    <ArrowUpRight size={13} />
                  </button>
                </div>

                {gallery.length === 0 ? (
                  <div className="p-12 bg-neutral-900/10 border border-dashed border-neutral-800 rounded-2xl text-center py-20">
                    <ImageIcon size={32} className="text-neutral-600 mx-auto mb-3" />
                    <p className="text-neutral-400 text-sm font-semibold">No pictures uploaded in the exhibit database yet.</p>
                    <p className="text-neutral-500 text-xs mt-1">First board admin can add frames via Lightroom Corner!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" id="homepage-gallery-grid">
                    {gallery.slice(0, 4).map(photo => (
                      <div 
                        key={photo.id}
                        onClick={() => handleTabChange('photographers')}
                        className="bg-neutral-950 border border-neutral-900 hover:border-neutral-800 rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 flex flex-col justify-between"
                      >
                        <div className="relative aspect-[4/3] bg-neutral-900 overflow-hidden">
                          <img
                            src={photo.imageUrl}
                            alt={photo.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-104 animate-fade-in"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="p-4 text-left">
                          <h4 className="font-display font-medium text-white text-xs sm:text-sm truncate">
                            {photo.title}
                          </h4>
                          <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-2 font-mono">
                            <span className="truncate">By {photo.photographerName}</span>
                            <span className="shrink-0">{photo.uploadedAt}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

            </div>

            {/* Quick Informational board banner */}
            <section className="bg-neutral-900/30 border-t border-neutral-800 py-16" id="curriculum-preview-banner">
              <div className="max-w-4xl mx-auto px-4 text-center">
                <h3 className="font-display font-bold text-2xl text-white">Empowering Student Photographic Ranks</h3>
                <p className="text-xs text-neutral-400 mt-2 max-w-2xl mx-auto leading-relaxed font-sans">
                  At Defence Service College, we recognize that every student holds multiple creative dimensions. Our society structures support simultaneous roles across Senior Photographers, Coordinators, and Chief Editors. Connect your workspace to collaborate with us!
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                  <span className="text-[9.5px] font-mono text-neutral-400 bg-neutral-950 border border-neutral-900 px-3 py-1 rounded">Photographer</span>
                  <span className="text-[9.5px] font-mono text-neutral-400 bg-neutral-950 border border-neutral-900 px-3 py-1 rounded">Senior Photographer</span>
                  <span className="text-[9.5px] font-mono text-neutral-400 bg-neutral-950 border border-neutral-900 px-3 py-1 rounded">Editor</span>
                  <span className="text-[9.5px] font-mono text-neutral-400 bg-neutral-950 border border-neutral-900 px-3 py-1 rounded">Chief Editor</span>
                  <span className="text-[9.5px] font-mono text-neutral-400 bg-neutral-950 border border-neutral-900 px-3 py-1 rounded">Coordinator</span>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* ABOUT US BOARD TAB */}
        {currentTab === 'about' && (
          <AboutUsPage />
        )}

        {/* RESTRICTED PHOTOGRAPHER'S CORNER */}
        {currentTab === 'photographers' && (
          <Corners 
            initialActiveSection="photographers" 
            onNavigateToProfile={handleNavigateToProfile} 
          />
        )}

        {/* RESTRICTED EDITOR'S CORNER */}
        {currentTab === 'editors' && (
          <Corners 
            initialActiveSection="editors" 
            onNavigateToProfile={handleNavigateToProfile} 
          />
        )}

        {/* STUDENT PROFILE PAGE */}
        {currentTab === 'profile' && (
          <ProfilePage 
            viewingUserId={viewingUserId} 
            onBackToHome={() => handleTabChange('home')} 
          />
        )}

        {/* ADMIN WORKSPACE SUB CONTROL PANEL */}
        {currentTab === 'admin' && (
          <AdminDashboard />
        )}

      </main>

      {/* Aesthetic Footer Branding */}
      <footer className="bg-neutral-950 border-t border-neutral-900 py-8 px-4" id="applet-footer">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center space-x-2.5">
            <div 
              className="w-8 h-8 text-amber-500"
              dangerouslySetInnerHTML={{ __html: siteConfig.schoolLogo }}
            />
            <div>
              <p className="font-display font-bold text-xs text-white leading-tight">DSCPS Portal</p>
              <p className="text-[9px] text-neutral-500 font-mono tracking-widest">{siteConfig.domain}</p>
            </div>
          </div>

          <div className="text-[10px] text-neutral-400 font-mono tracking-wide leading-relaxed">
            <p>© 2026 Defence Service College Photographic Society (DSCPS). All rights reserved.</p>
            <p className="text-[9px] text-neutral-600 mt-0.5">Direct deployment sandbox frame v1.0.0. Developed with human-centric alignments.</p>
          </div>

          <div className="flex items-center space-x-3 text-xs text-neutral-405">
            <button onClick={() => handleTabChange('home')} className="text-neutral-400 hover:text-white hover:underline focus:outline-none">Home</button>
            <span>•</span>
            <button onClick={() => handleTabChange('about')} className="text-neutral-400 hover:text-white hover:underline focus:outline-none">Story Board</button>
            {currentUser && (
              <>
                <span>•</span>
                <button onClick={() => handleNavigateToProfile(currentUser.uid)} className="text-neutral-400 hover:text-amber-400 focus:outline-none">My Profile</button>
              </>
            )}
          </div>
        </div>
      </footer>

      {/* Sign In / Registry overlay handler */}
      {authOpen && (
        <AuthPages 
          onClose={() => setAuthOpen(false)} 
          onSuccess={() => {
            setAuthOpen(false);
            // Navigate to personal profile page after login
            if (currentUser) {
              handleNavigateToProfile(currentUser.uid);
            } else {
              handleTabChange('home');
            }
          }}
        />
      )}

    </div>
  );
}

// Global state provider wrapper
export default function App() {
  return (
    <DSCPSProvider>
      <DSCPSAppContent />
    </DSCPSProvider>
  );
}

