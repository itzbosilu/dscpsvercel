/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { useDSCPS } from '../lib/state';
import { Mail, User, BookOpen, Calendar, Key, AlertCircle, X } from 'lucide-react';

interface AuthPagesProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthPages({ onClose, onSuccess }: AuthPagesProps) {
  const { login, register, loginWithGoogleSimulate, loginWithGoogleFirebase } = useDSCPS();
  
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  
  // Standard Form States
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [admissionNo, setAdmissionNo] = useState('');
  const [joinedYear, setJoinedYear] = useState('2026');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Google Custom Mail input
  const [googleCustomEmail, setGoogleCustomEmail] = useState('');
  const [googleCustomName, setGoogleCustomName] = useState('');

  const handleStandardAuth = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    try {
      if (isRegisterMode) {
        if (!fullName) {
          setErrorMsg('Full name is required for registration.');
          return;
        }
        await register(email, fullName, admissionNo, joinedYear);
        setSuccessMsg('Account registered successfully! Welcome.');
      } else {
        await login(email);
        setSuccessMsg('Logged in successfully!');
      }
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleGoogleSelect = async (gEmail: string, gName: string) => {
    setErrorMsg('');
    try {
      await loginWithGoogleSimulate(gEmail, gName);
      setSuccessMsg(`Logged in using Google account: ${gEmail}`);
      setShowGoogleModal(false);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Auth simulation failed.');
    }
  };

  const handleRealGoogleLogin = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const userProfile = await loginWithGoogleFirebase();
      setSuccessMsg(`Google Auth Success! Signed in as ${userProfile.fullName}`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Firebase Google Sign-In failed or was cancelled.');
    }
  };

  const handleGoogleCustomSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!googleCustomEmail) return;
    const fallName = googleCustomName || googleCustomEmail.split('@')[0].replace('.', ' ');
    handleGoogleSelect(googleCustomEmail, fallName);
  };

  return (
    <div id="auth-overlay-backdrop" className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
      
      {/* Primary Authenication Box */}
      <div id="auth-container-card" className="relative w-full max-w-sm bg-neutral-950 border border-neutral-900 rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8 animate-scale-up font-sans">
        
        {/* Close Button */}
        <button
          id="btn-close-auth-overlay"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center mx-auto mb-3">
            <User size={24} />
          </div>
          <h2 className="font-display font-semibold text-2xl text-white">
            {isRegisterMode ? 'Student Registry' : 'Portal Sign In'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {isRegisterMode ? 'Register to Defence Service College Photographic Society' : 'Log in to access corners, profiles, and dashboard'}
          </p>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="flex items-start space-x-2 bg-rose-950/30 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl mb-4" id="auth-error-alert text-left">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span className="text-left leading-normal">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-start space-x-2 bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-xl mb-4" id="auth-success-alert text-left">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span className="text-left leading-normal">{successMsg}</span>
          </div>
        )}

        {/* Auth form */}
        <form onSubmit={handleStandardAuth} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-mono tracking-wider text-neutral-400 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
              <input
                type="email"
                required
                id="input-auth-email"
                placeholder="eg: bosiluniduwara@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-500 rounded-lg py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          {isRegisterMode && (
            <>
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-neutral-400 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                  <input
                    type="text"
                    required
                    id="input-auth-fullname"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-500 rounded-lg py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none transition-colors font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-neutral-405 text-neutral-400 mb-1.5 font-bold">Admission No</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
                    <input
                      type="text"
                      placeholder="DSC-2024-9121"
                      id="input-auth-admission"
                      value={admissionNo}
                      onChange={e => setAdmissionNo(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-500 rounded-lg py-2.5 pl-9 pr-4 text-[11px] text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-neutral-405 text-neutral-400 mb-1.5 font-bold">Joined Year</label>
                  <div className="relative">
                     <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
                    <input
                      type="number"
                      placeholder="2026"
                      id="input-auth-joined-year"
                      value={joinedYear}
                      onChange={e => setJoinedYear(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-500 rounded-lg py-2.5 pl-9 pr-4 text-[11px] text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Secure indicator hint */}
          <div className="flex items-center space-x-2 text-[10px] text-neutral-450 font-mono py-1">
            <Key size={12} className="text-amber-500" />
            <span>No password required for evaluation sandbox</span>
          </div>

          <button
            type="submit"
            id="btn-auth-submit"
            className="w-full bg-amber-550 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-2.5 rounded-xl text-xs transition-transform transform active:scale-95 shadow-md mt-2 cursor-pointer"
          >
            {isRegisterMode ? 'Complete Student Registry' : 'Log In Securely'}
          </button>
        </form>

        {/* Dynamic trigger details */}
        {!isRegisterMode && (
          <div className="mt-2.5 p-3 bg-neutral-900/40 border border-neutral-900 rounded-xl text-center">
            <p className="text-[10px] text-neutral-405 text-neutral-400 font-sans">
              💡 For instant full access, use first admin account:
            </p>
            <button
              onClick={() => setEmail('bosiluniduwara@gmail.com')}
              className="text-amber-500 font-mono text-xs hover:underline mt-1 focus:outline-none cursor-pointer"
            >
              bosiluniduwara@gmail.com
            </button>
          </div>
        )}

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-900"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-widest text-neutral-500 py-0.5 px-3 bg-neutral-950 mx-auto w-fit">
            <span>Or Connect Using</span>
          </div>
        </div>

        {/* Real Firebase Google Login trigger */}
        <button
          onClick={handleRealGoogleLogin}
          id="btn-google-sign-in"
          className="w-full flex items-center justify-center space-x-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-2.5 rounded-xl text-xs transition-all shadow-md cursor-pointer transform active:scale-95 mb-2.5"
        >
          <img 
            src="https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?q=80&w=120&auto=format&fit=crop" 
            alt="Google" 
            className="w-4 h-4 rounded-full object-cover shrink-0" 
          />
          <span>Sign In with Google (Real Firebase)</span>
        </button>

        {/* Local Sandbox Dev simulator Link */}
        <div className="text-center mb-1">
          <button
            type="button"
            onClick={() => setShowGoogleModal(true)}
            className="text-[10px] font-mono text-neutral-500 hover:text-amber-500 underline uppercase tracking-wider bg-transparent border-none cursor-pointer focus:outline-none"
          >
            Or use Offline Student Sandbox Sim
          </button>
        </div>

        <div className="text-center mt-5 text-xs text-neutral-400">
          {isRegisterMode ? 'Already a registered student member?' : "Don't have a photographic registry yet?"}
          <button
            onClick={() => setIsRegisterMode(!isRegisterMode)}
            id="btn-toggle-auth-mode"
            className="text-amber-500 font-medium hover:underline ml-1 cursor-pointer focus:outline-none"
          >
            {isRegisterMode ? 'Sign In here' : 'Register squad member'}
          </button>
        </div>
      </div>

      {/* Google Simulation Popup Modal */}
      {showGoogleModal && (
        <div id="google-simulation-modal-backdrop" className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-55">
          <div id="google-simulation-card" className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-2xl relative text-left">
            <button
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X size={16} />
            </button>

            <div className="text-center mb-6">
              {/* Google stylized header */}
              <div className="flex justify-center space-x-1 font-bold text-lg mb-1 leading-none font-sans">
                <span className="text-blue-550">G</span>
                <span className="text-red-550">o</span>
                <span className="text-yellow-550">o</span>
                <span className="text-blue-550">g</span>
                <span className="text-green-550">l</span>
                <span className="text-red-550">e</span>
              </div>
              <h3 className="text-neutral-200 text-sm font-semibold">Sign in to your dscps.online channel</h3>
              <p className="text-[11px] text-neutral-450 mt-1">Choose an identity to authenticate instantly in the workspace:</p>
            </div>

            {/* List of default Google accounts presets */}
            <div className="space-y-2 mb-4">
              <button
                onClick={() => handleGoogleSelect('bosiluniduwara@gmail.com', 'Bosilu Niduwara')}
                className="w-full flex items-center space-x-3 p-2 bg-neutral-950/50 hover:bg-neutral-950 border border-neutral-800/45 rounded-lg text-left transition-colors cursor-pointer"
              >
                <img
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=120&auto=format&fit=crop"
                  alt="Bosilu"
                  className="w-8 h-8 rounded-full object-cover border border-neutral-850"
                />
                <div>
                  <p className="text-xs font-semibold text-neutral-100">Bosilu Niduwara</p>
                  <p className="text-[10px] text-neutral-450 font-mono">bosiluniduwara@gmail.com</p>
                  <span className="text-[8px] font-mono text-amber-450 uppercase tracking-widest bg-amber-950/30 px-1 py-0.2 rounded mt-0.5 inline-block text-amber-500 font-bold border border-amber-500/20">Soc. President</span>
                </div>
              </button>

              <button
                onClick={() => handleGoogleSelect('jamestriplett58@gmail.com', 'James Triplett')}
                className="w-full flex items-center space-x-3 p-2 bg-neutral-950/50 hover:bg-neutral-950 border border-neutral-800/45 rounded-lg text-left transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs border border-neutral-850">
                  JT
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-100">James Triplett (User)</p>
                  <p className="text-[10px] text-neutral-450 font-mono">jamestriplett58@gmail.com</p>
                </div>
              </button>
            </div>

            <div className="border-t border-neutral-800 pt-3 my-3">
              <p className="text-[10px] font-mono tracking-widest text-neutral-400 mb-2 uppercase text-center">- Or Use Any Custom Google Mail -</p>
              
              <form onSubmit={handleGoogleCustomSubmit} className="space-y-2">
                <input
                  type="email"
                  required
                  placeholder="Enter Google Mail (e.g., student@gmail.com)"
                  value={googleCustomEmail}
                  onChange={e => setGoogleCustomEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-neutral-200 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Student Holder Full Name (Optional)"
                  value={googleCustomName}
                  onChange={e => setGoogleCustomName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-neutral-200 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-transform transform active:scale-95 cursor-pointer"
                >
                  Authorize Google Sim Session
                </button>
              </form>
            </div>
            
            <p className="text-[9px] text-zinc-550 text-center leading-relaxed">
              *Local Mock Google Session: Fully integrated with context variables for dscps.online and provides direct login validation. No external cookies or tracking data is shared.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
