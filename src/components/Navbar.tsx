/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useDSCPS } from '../lib/state';
import { Camera, ShieldAlert, User, LogOut, Menu, X, Image as ImageIcon, BookOpen, LayoutDashboard, Compass } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export default function Navbar({ currentTab, setCurrentTab, onOpenAuth }: NavbarProps) {
  const { siteConfig, currentUser, logout, rolePrivileges } = useDSCPS();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Helper helper to check if current user has a privilege key
  const hasPrivilege = (key: string): boolean => {
    if (!currentUser) return false;
    // Admins (President/Secretary) have all privileges by design
    if (currentUser.roles.includes('President') || currentUser.roles.includes('Secretary')) {
      return true;
    }
    // Check other role privileges
    return currentUser.roles.some(role => {
      const config = rolePrivileges.find(p => p.roleName === role);
      return config?.grantedPrivileges.includes(key as any);
    });
  };

  const isAdmin = currentUser?.roles.some(r => r === 'President' || r === 'Secretary');

  const links = [
    { id: 'home', label: 'Home', icon: Compass, requiredPrivilege: null },
    { id: 'about', label: 'Board & About Us', icon: Compass, requiredPrivilege: null },
    { id: 'photographers', label: "Photographer's Corner", icon: ImageIcon, requiredPrivilege: 'photographers_corner' },
    { id: 'editors', label: "Editor's Corner", icon: BookOpen, requiredPrivilege: 'editors_corner' },
  ];

  const handleNav = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-neutral-900/50 backdrop-blur-md border-b border-neutral-800 px-4 py-3" id="main-navigation">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logos & Branding */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNav('home')}>
          {/* Render school logo SVG safely */}
          <div 
            className="w-10 h-10 flex items-center justify-center transition-transform hover:scale-105"
            dangerouslySetInnerHTML={{ __html: siteConfig.schoolLogo }}
          />
          {/* Divider */}
          <div className="h-8 w-px bg-neutral-850" />
          {/* Render club logo SVG safely */}
          <div 
            className="w-10 h-10 flex items-center justify-center transition-transform hover:scale-105"
            dangerouslySetInnerHTML={{ __html: siteConfig.clubLogo }}
          />
          
          <div className="hidden md:block text-left">
            <h1 className="font-display font-bold text-sm tracking-tight text-white leading-tight">DSCPS</h1>
            <p className="text-xs text-neutral-400 font-mono tracking-wider">{siteConfig.domain}</p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center space-x-1">
          {links.map(link => {
            // Check privilege block unless is home or about
            if (link.requiredPrivilege && !hasPrivilege(link.requiredPrivilege) && !hasPrivilege('view_corners_all')) {
              return null;
            }

            const active = currentTab === link.id;
            return (
              <button
                key={link.id}
                id={`nav-link-${link.id}`}
                onClick={() => handleNav(link.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  active 
                    ? 'bg-neutral-900 text-amber-400 shadow-inner border border-neutral-800' 
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900/50'
                }`}
              >
                {link.label}
              </button>
            );
          })}
          
          {/* Admin Dashboard shortcut and notification indicator */}
          {isAdmin && (
            <button
              id="nav-link-admin"
              onClick={() => handleNav('admin')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                currentTab === 'admin'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-amber-500/80 hover:text-amber-400 hover:bg-amber-500/5'
              }`}
            >
              <LayoutDashboard size={15} />
              <span>Admin Panel</span>
            </button>
          )}
        </div>

        {/* Profile / Auth Controls */}
        <div className="flex items-center space-x-4">
          {currentUser ? (
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 p-1 rounded-full hover:bg-neutral-950/80 transition-colors focus:outline-none cursor-pointer"
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  className="w-8 h-8 rounded-full object-cover border border-neutral-800"
                />
                <span className="hidden sm:inline text-sm font-medium text-neutral-200">{currentUser.fullName.split(' ')[0]}</span>
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div 
                  id="profile-dropdown-container"
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-64 bg-neutral-950 border border-neutral-900 rounded-xl shadow-2xl py-2 animate-fade-in z-50 text-left"
                >
                  <div className="px-4 py-3 border-b border-neutral-900">
                    <p className="text-sm font-semibold text-white break-all leading-snug">{currentUser.fullName}</p>
                    <p className="text-xs text-neutral-400 truncate mb-2">{currentUser.email}</p>
                    
                    {/* List of active roles */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {currentUser.roles.map((role, rIdx) => (
                        <span 
                          key={rIdx} 
                          className={`text-xs px-2 py-0.5 rounded font-bold font-mono uppercase tracking-wider ${
                            role === 'President' || role === 'Secretary'
                              ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
                              : 'bg-neutral-900 border border-neutral-800 text-neutral-400'
                          }`}
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    id="dropdown-my-profile"
                    onClick={() => {
                      handleNav('profile');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
                  >
                    <User size={16} />
                    <span>My Profile Page</span>
                  </button>

                  {isAdmin && (
                    <button
                      id="dropdown-admin-panel"
                      onClick={() => {
                        handleNav('admin');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full lg:hidden flex items-center space-x-2 px-4 py-2.5 text-sm text-amber-400 hover:bg-neutral-900 transition-colors cursor-pointer"
                    >
                      <LayoutDashboard size={16} className="text-amber-550" />
                      <span className="text-amber-500">Admin Panel</span>
                    </button>
                  )}

                  <hr className="my-1 border-neutral-900" />

                  <button
                    id="dropdown-logout"
                    onClick={() => {
                      logout();
                      setProfileDropdownOpen(false);
                      handleNav('home');
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-rose-450 hover:bg-rose-950/20 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              id="btn-navbar-signin"
              onClick={onOpenAuth}
              className="px-4 py-2 bg-amber-500 text-neutral-950 font-bold rounded-lg text-sm transition-transform hover:scale-105 hover:bg-amber-400 active:scale-95 shadow-md cursor-pointer"
            >
              Sign In
            </button>
          )}

          {/* Hamburger Menu Mobile */}
          <button
            id="mobile-menu-trigger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-lg cursor-pointer"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div id="mobile-navigation-panel" className="lg:hidden mt-3 pt-3 border-t border-neutral-900 space-y-1 bg-neutral-950 p-4 rounded-xl">
          {links.map(link => {
            if (link.requiredPrivilege && !hasPrivilege(link.requiredPrivilege) && !hasPrivilege('view_corners_all')) {
              return null;
            }
            return (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between ${
                  currentTab === link.id
                    ? 'bg-neutral-900 text-amber-400'
                    : 'text-neutral-350 hover:bg-neutral-900/50 hover:text-white'
                }`}
              >
                <span>{link.label}</span>
              </button>
            );
          })}
          
          {isAdmin && (
            <button
              onClick={() => handleNav('admin')}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold flex items-center space-x-2 ${
                currentTab === 'admin' ? 'bg-amber-500/10 text-amber-400' : 'text-amber-500'
              }`}
            >
              <LayoutDashboard size={15} />
              <span>Admin Panel</span>
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
