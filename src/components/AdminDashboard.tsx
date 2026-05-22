/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { useDSCPS, getUserAvatar } from '../lib/state';
import ImageUploadField from './ImageUploadField';
import { RoleName, PrivilegeKey, BoardMember, UserProfile } from '../types';
import { DEFAULT_SCHOOL_LOGO_SVG, DEFAULT_CLUB_LOGO_SVG } from '../data/defaultData';
import { 
  ShieldCheck, 
  Users, 
  Settings, 
  Award, 
  Megaphone, 
  Trash2, 
  Plus, 
  Check, 
  RotateCcw, 
  Search, 
  Info, 
  CheckSquare, 
  Square 
} from 'lucide-react';

export default function AdminDashboard() {
  const {
    siteConfig,
    rolePrivileges,
    users,
    boardMembers,
    announcements,
    currentUser,
    updateSiteConfig,
    updateRolePrivilege,
    updateUserRoles,
    deleteUser,
    addBoardMember,
    updateBoardMember,
    deleteBoardMember,
    addAnnouncement,
    deleteAnnouncement,
    adminCreateUserProfile,
    adminUpdateUserProfile,
  } = useDSCPS();

  // Active dashboard view control
  const [activeSubTab, setActiveSubTab] = useState<'members' | 'privileges' | 'branding' | 'board' | 'announcements'>('members');

  // Status Alerts
  const [successBanner, setSuccessBanner] = useState('');

  const triggerSuccess = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(''), 4000);
  };

  // 1. ALL AVAILABLE SOCIETY ROLES DEFINITIONS (17 Roles)
  const AVAILABLE_ROLES: RoleName[] = [
    'President',
    'Secretary',
    'Treasurer',
    'Asst. President',
    'Asst. Secretary',
    'Asst. Treasurer',
    'Coordinator',
    'Exec. Member',
    'Committee Member',
    'Photographer',
    'Senior Photographer',
    'Editor',
    'Chief Editor',
    'Senior Editor',
    'Member',
    'Senior Member',
    'Student'
  ];

  // PRIVILEGE SLOTS (7 privileges)
  const PRIVILEGE_SLOTS: { key: PrivilegeKey; label: string; desc: string }[] = [
    { key: 'manage_members', label: 'Assign Roles', desc: 'Can alter student roles and grant administrative access.' },
    { key: 'manage_privileges', label: 'Assign Privileges', desc: 'Can visual edit what roles grant which privilege keys.' },
    { key: 'customize_site', label: 'Customize Site Info', desc: 'Can edit logos, taglines, notices, and board bios.' },
    { key: 'photographers_corner', label: 'Photographer Corner Vault', desc: 'Can post custom photography exposures & logs.' },
    { key: 'editors_corner', label: 'Editor Column Post', desc: 'Can submit essays, post-processing columns, and reviews.' },
    { key: 'view_corners_all', label: 'View Restricted Corners', desc: 'Can view both corners even if matching role is absent.' },
    { key: 'view_student_performance', label: 'Inspect Student History', desc: 'Read-only access to view each student’s performance history and active duty analytics.' }
  ];

  // MEMBERS MANAGEMENT TAB STATES
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Custom Create/Edit Student States
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userFullName, setUserFullName] = useState('');
  const [userAdmissionNo, setUserAdmissionNo] = useState('');
  const [userJoinedYear, setUserJoinedYear] = useState('2026');
  const [userGender, setUserGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>('Prefer not to say');
  const [userBio, setUserBio] = useState('');
  const [userAvatarUrl, setUserAvatarUrl] = useState('');
  const [selectedUserRoles, setSelectedUserRoles] = useState<RoleName[]>([]);
  const [userEditTab, setUserEditTab] = useState<'roles' | 'details'>('roles');

  // PRIVILEGES TAB STATES
  const [hoveredRole, setHoveredRole] = useState<RoleName | null>(null);

  // BRANDING TAB STATES (Logos & Customization)
  const [schoolLogoInput, setSchoolLogoInput] = useState(siteConfig.schoolLogo);
  const [clubLogoInput, setClubLogoInput] = useState(siteConfig.clubLogo);
  const [societyNameInput, setSocietyNameInput] = useState(siteConfig.societyName);
  const [schoolNameInput, setSchoolNameInput] = useState(siteConfig.schoolName);
  const [taglineInput, setTaglineInput] = useState(siteConfig.tagline);
  const [heroImageInput, setHeroImageInput] = useState(siteConfig.heroImageUrl);
  const [aboutStoryInput, setAboutStoryInput] = useState(siteConfig.aboutText);

  // NOTICE BOARD TAB STATES
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeContent, setNewNoticeContent] = useState('');

  // BOARD MEMBERS TAB STATES
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [boardName, setBoardName] = useState('');
  const [boardBio, setBoardBio] = useState('');
  const [boardRolesSelected, setBoardRolesSelected] = useState<RoleName[]>([]);
  const [boardImage, setBoardImage] = useState('');
  const [boardOrder, setBoardOrder] = useState(1);
  const [boardAchievement, setBoardAchievement] = useState('');
  const [boardGender, setBoardGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>('Prefer not to say');

  // SESSIONS FOR BOARD toggle handler
  const handleToggleBoardRoleSel = (role: RoleName) => {
    setBoardRolesSelected(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleCreateOrUpdateBoard = (e: FormEvent) => {
    e.preventDefault();
    if (!boardName) return;

    const memberData = {
      fullName: boardName.trim(),
      bio: boardBio.trim(),
      roles: boardRolesSelected.length > 0 ? boardRolesSelected : ['Committee Member' as RoleName],
      imageUrl: boardImage.trim() || '', // Explicitly blank if empty to activate our no face placeholder logic!
      order: Number(boardOrder) || 1,
      specialAchievement: boardAchievement.trim() || undefined,
      gender: boardGender,
    };

    if (editingBoardId) {
      updateBoardMember(editingBoardId, memberData);
      triggerSuccess('Board Member Profile modified successfully!');
    } else {
      addBoardMember(memberData);
      triggerSuccess('New Board Member Profile added successfully!');
    }

    // Reset Form
    setEditingBoardId(null);
    setBoardName('');
    setBoardBio('');
    setBoardRolesSelected([]);
    setBoardImage('');
    setBoardOrder(1);
    setBoardAchievement('');
    setBoardGender('Prefer not to say');
  };

  const handleEditBoardStart = (m: BoardMember) => {
    setEditingBoardId(m.id);
    setBoardName(m.fullName);
    setBoardBio(m.bio);
    setBoardRolesSelected(m.roles);
    setBoardImage(m.imageUrl);
    setBoardOrder(m.order);
    setBoardAchievement(m.specialAchievement || '');
    setBoardGender(m.gender || 'Prefer not to say');
  };

  // Site Configurations save
  const handleSaveBranding = (e: FormEvent) => {
    e.preventDefault();
    updateSiteConfig({
      societyName: societyNameInput,
      schoolName: schoolNameInput,
      tagline: taglineInput,
      heroImageUrl: heroImageInput,
      aboutText: aboutStoryInput,
      schoolLogo: schoolLogoInput,
      clubLogo: clubLogoInput,
    });
    triggerSuccess('Site config properties and dynamic SVGs saved successfully!');
  };

  // Reset Logos back to default beautiful presets
  const handleResetSchoolLogo = () => {
    setSchoolLogoInput(DEFAULT_SCHOOL_LOGO_SVG);
    updateSiteConfig({ schoolLogo: DEFAULT_SCHOOL_LOGO_SVG });
    triggerSuccess('School Logo reset to dynamic SVG vector!');
  };

  const handleResetClubLogo = () => {
    setClubLogoInput(DEFAULT_CLUB_LOGO_SVG);
    updateSiteConfig({ clubLogo: DEFAULT_CLUB_LOGO_SVG });
    triggerSuccess('Club Logo reset to dynamic camera SVG vector!');
  };

  // Member Search filtered set
  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(memberSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(memberSearch.toLowerCase()) ||
    u.admissionNo.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const handleSelectUser = (u: UserProfile) => {
    setIsCreatingUser(false);
    setSelectedUser(u);
    setUserFullName(u.fullName);
    setUserEmail(u.email);
    setUserAdmissionNo(u.admissionNo);
    setUserJoinedYear(u.joinedYear || '2026');
    setUserGender(u.gender || 'Prefer not to say');
    setUserBio(u.bio || '');
    setUserAvatarUrl(u.avatarUrl || '');
    setSelectedUserRoles(u.roles || []);
    setUserEditTab('roles');
  };

  const handleStartCreateUser = () => {
    setIsCreatingUser(true);
    setSelectedUser(null);
    setUserFullName('');
    setUserEmail('');
    setUserAdmissionNo('');
    setUserJoinedYear('2026');
    setUserGender('Prefer not to say');
    setUserBio('');
    setUserAvatarUrl('');
    setSelectedUserRoles(['Student', 'Member']);
    setUserEditTab('details');
  };

  const handleSaveUser = () => {
    if (!userFullName.trim() || !userEmail.trim()) {
      alert('Full Name and Email are required.');
      return;
    }

    if (isCreatingUser) {
      const cleanEmail = userEmail.toLowerCase().trim();
      if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
        alert('An account with this email already exists.');
        return;
      }
      const newUid = 'dsc-user-man-' + Math.random().toString(36).substring(2, 9);
      adminCreateUserProfile({
        uid: newUid,
        email: cleanEmail,
        fullName: userFullName.trim(),
        admissionNo: userAdmissionNo.trim() || 'DSC-' + Math.floor(1000 + Math.random() * 9000),
        joinedYear: userJoinedYear.trim() || '2026',
        gender: userGender,
        bio: userBio.trim() || `Fresh student member of the DSCPS photographic squad. Ready to learn and capture!`,
        avatarUrl: userAvatarUrl.trim(),
        roles: selectedUserRoles.length > 0 ? selectedUserRoles : ['Student', 'Member'],
      });
      triggerSuccess(`Registered new student account: ${userFullName}`);
      setIsCreatingUser(false);
    } else if (selectedUser) {
      const cleanEmail = userEmail.toLowerCase().trim();
      if (cleanEmail !== selectedUser.email.toLowerCase() && users.some(u => u.email.toLowerCase() === cleanEmail)) {
        alert('An account with this email already exists.');
        return;
      }
      adminUpdateUserProfile(selectedUser.uid, {
        email: cleanEmail,
        fullName: userFullName.trim(),
        admissionNo: userAdmissionNo.trim(),
        joinedYear: userJoinedYear.trim(),
        gender: userGender,
        bio: userBio.trim(),
        avatarUrl: userAvatarUrl.trim(),
        roles: selectedUserRoles.length > 0 ? selectedUserRoles : ['Student', 'Member'],
      });
      triggerSuccess(`Updated details for: ${userFullName}`);
      
      setSelectedUser({
        ...selectedUser,
        email: cleanEmail,
        fullName: userFullName.trim(),
        admissionNo: userAdmissionNo.trim(),
        joinedYear: userJoinedYear.trim(),
        gender: userGender,
        bio: userBio.trim(),
        avatarUrl: userAvatarUrl.trim(),
        roles: selectedUserRoles.length > 0 ? selectedUserRoles : ['Student', 'Member'],
      });
    }
  };

  const handleToggleMemberRole = (role: RoleName) => {
    const isCreating = isCreatingUser;
    const activeUser = selectedUser;
    if (isCreating || activeUser) {
      const hasRole = selectedUserRoles.includes(role);
      const newRoles = hasRole 
        ? selectedUserRoles.filter(r => r !== role)
        : [...selectedUserRoles, role];
      setSelectedUserRoles(newRoles);
      
      if (activeUser) {
        activeUser.roles = newRoles;
        updateUserRoles(activeUser.uid, newRoles);
        triggerSuccess(`Roles updated for student: ${activeUser.fullName}`);
      }
    }
  };

  const handleToggleRolePrivilegeCheckbox = (role: RoleName, privKey: PrivilegeKey) => {
    const config = rolePrivileges.find(p => p.roleName === role);
    const currentlyGranted = config ? config.grantedPrivileges : [];
    
    const isGranted = currentlyGranted.includes(privKey);
    const newPrivs = isGranted
      ? currentlyGranted.filter(k => k !== privKey)
      : [...currentlyGranted, privKey];

    updateRolePrivilege(role, newPrivs);
    triggerSuccess(`Updated permissions mapped to: ${role}`);
  };

  const handleNoticePost = (e: FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle || !newNoticeContent) return;
    const authorString = `Verified Admin (${currentUser?.fullName || 'President'})`;
    addAnnouncement(newNoticeTitle, newNoticeContent, authorString);
    setNewNoticeTitle('');
    setNewNoticeContent('');
    triggerSuccess('Notice board announcement filed successfully!');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 text-left" id="admin-dashboard-root">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-neutral-800 pb-5 mb-8">
        <div>
          <span className="text-[10px] font-bold font-mono tracking-widest bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full uppercase border border-amber-500/20">
            Administrative Space
          </span>
          <h2 className="font-display font-bold text-3xl text-white mt-3 leading-tight tracking-tight">
            Society Command Panel
          </h2>
          <p className="text-xs text-neutral-400 mt-1 pb-1">
            President & Secretary clearance logs. Custom mapping of privileges, rosters, board portfolios, and visuals.
          </p>
        </div>

        {/* Global Action feedback banner */}
        {successBanner && (
          <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs px-4 py-2.5 rounded-xl animate-fade-in font-mono shadow-inner" id="toast-admin">
            <Check size={14} />
            <span>{successBanner}</span>
          </div>
        )}
      </div>

      {/* Grid: 2 columns - left navigation list, right command forms */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side Panel Navigation */}
        <div className="lg:col-span-3 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-3 lg:pb-0 scrollbar-none font-sans">
          <button
            onClick={() => setActiveSubTab('members')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center space-x-2.5 shrink-0 select-none cursor-pointer ${
              activeSubTab === 'members'
                ? 'bg-neutral-900 text-amber-400 border border-neutral-800'
                : 'text-neutral-455 text-neutral-400 hover:text-white hover:bg-neutral-900/50'
            }`}
          >
            <Users size={15} />
            <span>Student Role Registry</span>
          </button>

          <button
            onClick={() => setActiveSubTab('privileges')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center space-x-2.5 shrink-0 select-none cursor-pointer ${
              activeSubTab === 'privileges'
                ? 'bg-neutral-900 text-amber-400 border border-neutral-800'
                : 'text-neutral-455 text-neutral-400 hover:text-white hover:bg-neutral-900/50'
            }`}
          >
            <ShieldCheck size={15} />
            <span>Customize Privilege Matrix</span>
          </button>

          <button
            onClick={() => setActiveSubTab('branding')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center space-x-2.5 shrink-0 select-none cursor-pointer ${
              activeSubTab === 'branding'
                ? 'bg-neutral-900 text-amber-400 border border-neutral-800'
                : 'text-neutral-455 text-neutral-400 hover:text-white hover:bg-neutral-900/50'
            }`}
          >
            <Settings size={15} />
            <span>Custom Logo & Copy</span>
          </button>

          <button
            onClick={() => setActiveSubTab('board')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center space-x-2.5 shrink-0 select-none cursor-pointer ${
              activeSubTab === 'board'
                ? 'bg-neutral-900 text-amber-400 border border-neutral-800'
                : 'text-neutral-455 text-neutral-400 hover:text-white hover:bg-neutral-900/50'
            }`}
          >
            <Award size={15} />
            <span>Board Profiles Index</span>
          </button>

          <button
            onClick={() => setActiveSubTab('announcements')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold flex items-center space-x-2.5 shrink-0 select-none cursor-pointer ${
              activeSubTab === 'announcements'
                ? 'bg-neutral-900 text-amber-400 border border-neutral-800'
                : 'text-neutral-455 text-neutral-400 hover:text-white hover:bg-neutral-900/50 font-sans'
            }`}
          >
            <Megaphone size={15} />
            <span>Notice Desk desk</span>
          </button>
        </div>

        {/* Right Command Form Section */}
        <div className="lg:col-span-9 bg-neutral-950 border border-neutral-900 rounded-3xl p-6 md:p-8 min-h-128" id="admin-workspace-pane">
          
          {/* TAB 1: MEMBERS ASSIGNMENTS ROLE PANEL */}
          {activeSubTab === 'members' && (
            <div id="subtab-members-workspace" className="animate-fade-in font-sans">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
                <div>
                  <h3 className="font-display font-bold text-lg text-white">Student Roster Configuration</h3>
                  <p className="text-xs text-neutral-400 mt-1">Decide which student profile holds one or multiple society roles. Admins have immediate clearance overrides.</p>
                </div>
                <div className="shrink-0">
                  <button
                    id="btn-create-student-account"
                    onClick={handleStartCreateUser}
                    className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isCreatingUser
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 hover:scale-[1.02]'
                    }`}
                  >
                    <Plus size={14} />
                    <span>Create Student Account</span>
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative mb-6 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="text"
                  placeholder="Filter student rosters by registration name, email, or admission..."
                  value={memberSearch}
                  onChange={e => setMemberSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Split layout: roster on left, toggler panel on right */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* User List scroll container */}
                <div className="md:col-span-6 space-y-2 max-h-[460px] overflow-y-auto pr-1 text-left font-sans">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-6 text-xs text-neutral-500 font-mono">No matching student registros found.</div>
                  ) : (
                    filteredUsers.map(u => {
                      const isTargetSelected = !isCreatingUser && selectedUser?.uid === u.uid;
                      const isMainAdmin = u.uid === 'admin-1' || u.email === 'bosiluniduwara@gmail.com';
                      return (
                        <button
                          key={u.uid}
                          onClick={() => handleSelectUser(u)}
                          className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                            isTargetSelected 
                              ? 'bg-neutral-900 border-amber-500/40 text-white' 
                              : 'bg-neutral-900/40 border-neutral-900 text-neutral-300 hover:bg-neutral-900'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={getUserAvatar(u.avatarUrl, u.gender)}
                              alt={u.fullName}
                              className="w-8 h-8 rounded-full object-cover grayscale"
                            />
                            <div className="truncate shrink">
                              <p className="text-xs font-semibold truncate flex items-center gap-1.5">
                                <span>{u.fullName}</span>
                                {isMainAdmin && <span className="text-[7.5px] bg-amber-500 text-slate-950 font-bold px-1 rounded uppercase">Root Admin</span>}
                              </p>
                              <p className="text-[10px] text-slate-500 truncate font-mono">{u.email}</p>
                            </div>
                          </div>
                          
                          {/* Selected Roles mini tags */}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {u.roles.map((role, idx) => (
                              <span key={idx} className="text-[8px] bg-slate-950 text-slate-400 font-mono font-bold px-1 rounded uppercase">
                                {role}
                              </span>
                            ))}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>                {/* Role Toggling & User Details Editing Area */}
                <div className="md:col-span-6 p-4 md:p-5 bg-neutral-900/30 border border-neutral-900 rounded-2xl relative">
                  {isCreatingUser ? (
                    <div className="animate-fade-in text-left">
                      <div className="border-b border-neutral-800 pb-3 mb-4 flex justify-between items-center">
                        <div>
                          <p className="text-[10px] uppercase font-mono text-amber-500 font-bold mb-1">Academy Register</p>
                          <h4 className="font-display font-bold text-sm text-white">Create Student Account</h4>
                        </div>
                        <button 
                          onClick={() => setIsCreatingUser(false)}
                          className="text-[10px] uppercase font-mono text-neutral-500 hover:text-white px-2 py-1 rounded border border-neutral-800 hover:bg-neutral-900 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="space-y-3 font-sans text-xs">
                        <div>
                          <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Full Name *</label>
                          <input
                            type="text"
                            value={userFullName}
                            onChange={e => setUserFullName(e.target.value)}
                            placeholder="e.g. Randika Perera"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Email *</label>
                          <input
                            type="email"
                            value={userEmail}
                            onChange={e => setUserEmail(e.target.value)}
                            placeholder="e.g. randika@email.com"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Admission No</label>
                            <input
                              type="text"
                              value={userAdmissionNo}
                              onChange={e => setUserAdmissionNo(e.target.value)}
                              placeholder="e.g. DSC-8874"
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Joined Year</label>
                            <input
                              type="text"
                              value={userJoinedYear}
                              onChange={e => setUserJoinedYear(e.target.value)}
                              placeholder="e.g. 2026"
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Gender</label>
                            <select
                              value={userGender}
                              onChange={e => setUserGender(e.target.value as any)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                              <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Avatar Image URL</label>
                            <input
                              type="text"
                              value={userAvatarUrl}
                              onChange={e => setUserAvatarUrl(e.target.value)}
                              placeholder="Optional image url..."
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Biography / About</label>
                          <textarea
                            value={userBio}
                            onChange={e => setUserBio(e.target.value)}
                            placeholder="Write a tiny introductory line..."
                            rows={2}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        {/* Assigning Initial Roles checklists */}
                        <div>
                          <label className="block text-[10px] uppercase font-mono text-amber-500 mb-2">Configure Initial Roles</label>
                          <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto bg-slate-950 p-2 rounded-lg border border-neutral-900">
                            {AVAILABLE_ROLES.map(role => {
                              const hasRole = selectedUserRoles.includes(role);
                              return (
                                <button
                                  key={role}
                                  type="button"
                                  onClick={() => {
                                    setSelectedUserRoles(prev => 
                                      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
                                    );
                                  }}
                                  className="flex items-center space-x-1.5 p-1 hover:bg-neutral-900 rounded text-left truncate text-[10px] cursor-pointer"
                                >
                                  {hasRole ? (
                                    <CheckSquare className="text-amber-500 w-3 h-3" />
                                  ) : (
                                    <Square className="w-3 h-3 text-slate-600" />
                                  )}
                                  <span className={hasRole ? 'text-white' : 'text-neutral-550'}>{role}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            onClick={handleSaveUser}
                            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 rounded-xl text-xs transition-all cursor-pointer"
                          >
                            Register Student Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : selectedUser ? (
                    <div>
                      {/* Sub Tabs for selected user: Roles vs Details */}
                      <div className="flex border-b border-neutral-800 mb-4 pb-2 justify-between items-center">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => setUserEditTab('roles')}
                            className={`px-3 py-1 rounded-lg text-[10px] uppercase font-mono font-bold transition-all cursor-pointer ${
                              userEditTab === 'roles'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'text-neutral-400 hover:text-white'
                            }`}
                          >
                            Set Roles
                          </button>
                          <button
                            onClick={() => setUserEditTab('details')}
                            className={`px-3 py-1 rounded-lg text-[10px] uppercase font-mono font-bold transition-all cursor-pointer ${
                              userEditTab === 'details'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'text-neutral-400 hover:text-white'
                            }`}
                          >
                            Edit Details
                          </button>
                        </div>
                        <div className="text-right truncate max-w-[150px]">
                          <span className="text-[10px] text-neutral-500 font-mono italic break-all block">{selectedUser.fullName}</span>
                        </div>
                      </div>

                      {userEditTab === 'roles' ? (
                        <div className="animate-fade-in text-left">
                          <p className="text-[10px] text-neutral-400 leading-relaxed font-sans mb-3">
                            Check or uncheck the checkboxes below to edit assigned duties. Multiple roles are allowed. Role updates synchronize instantly.
                          </p>

                          {/* Checklist grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 h-60 overflow-y-auto pr-1">
                            {AVAILABLE_ROLES.map(role => {
                              const hasRole = selectedUserRoles.includes(role);
                              const isProtectedRoot = false;
                              
                              return (
                                <button
                                  key={role}
                                  disabled={isProtectedRoot}
                                  onClick={() => handleToggleMemberRole(role)}
                                  className={`flex items-center space-x-2.5 p-2 rounded-lg text-left transition-all text-xs ${
                                    isProtectedRoot 
                                      ? 'opacity-60 cursor-not-allowed text-neutral-500' 
                                      : 'hover:bg-neutral-900 cursor-pointer text-neutral-400 hover:text-white font-sans'
                                  }`}
                                >
                                  <div className="text-neutral-500 shrink-0">
                                    {hasRole ? (
                                      <CheckSquare className="text-amber-500 w-4 h-4" />
                                    ) : (
                                      <Square className="w-4 h-4" />
                                    )}
                                  </div>
                                  <span className={`truncate font-medium ${hasRole ? 'text-white' : 'text-neutral-400'}`}>
                                    {role}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="animate-fade-in text-left space-y-3 font-sans text-xs">
                          <div>
                            <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Full Name</label>
                            <input
                              type="text"
                              value={userFullName}
                              onChange={e => setUserFullName(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500 font-sans"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Email Address</label>
                            <input
                              type="email"
                              value={userEmail}
                              onChange={e => setUserEmail(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Admission No</label>
                              <input
                                type="text"
                                value={userAdmissionNo}
                                onChange={e => setUserAdmissionNo(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Joined Year</label>
                              <input
                                type="text"
                                value={userJoinedYear}
                                onChange={e => setUserJoinedYear(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Gender</label>
                              <select
                                value={userGender}
                                onChange={e => setUserGender(e.target.value as any)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                              >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Avatar Image URL</label>
                              <input
                                type="text"
                                value={userAvatarUrl}
                                onChange={e => setUserAvatarUrl(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Biography / Contributions</label>
                            <textarea
                              rows={3}
                              value={userBio}
                              onChange={e => setUserBio(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div className="pt-2 flex space-x-2">
                            <button
                              onClick={handleSaveUser}
                              className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
                            >
                              Save Details
                            </button>
                            <button
                              onClick={() => {
                                setUserFullName(selectedUser.fullName);
                                setUserEmail(selectedUser.email);
                                setUserAdmissionNo(selectedUser.admissionNo);
                                setUserJoinedYear(selectedUser.joinedYear || '2026');
                                setUserGender(selectedUser.gender || 'Prefer not to say');
                                setUserBio(selectedUser.bio || '');
                                setUserAvatarUrl(selectedUser.avatarUrl || '');
                              }}
                              className="px-4 py-2 border border-neutral-800 text-neutral-400 hover:text-white rounded-xl text-xs hover:bg-neutral-900 transition-all cursor-pointer"
                            >
                              Reset
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Delete student safety hatch */}
                      {selectedUser.uid !== 'admin-1' && selectedUser.uid !== currentUser?.uid && (
                        <div className="mt-5 border-t border-neutral-800 pt-4 flex justify-end font-sans">
                          <button
                            id="btn-delete-student-archive"
                            onClick={() => {
                              if (confirm(`Archive ${selectedUser.fullName} out of the society ledger?`)) {
                                deleteUser(selectedUser.uid);
                                setSelectedUser(null);
                                triggerSuccess('Student registration archived successfully.');
                              }
                            }}
                            className="flex items-center space-x-1 py-1.5 px-3 rounded-lg bg-rose-955/20 text-rose-400 hover:bg-rose-900/40 text-[10px] uppercase font-mono tracking-wider transition-colors cursor-pointer"
                          >
                            <Trash2 size={12} />
                            <span>Archive Profile Ledger</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                      <Users className="w-8 h-8 text-neutral-700 mb-2" />
                      <p className="text-xs text-neutral-500 font-medium font-sans max-w-[240px] leading-relaxed">
                        Select a student profile from roster directory, or click <strong className="text-amber-500">Create Student Account</strong> to register a new student.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: PRIVILEGE CONFIG MATRIX */}
          {activeSubTab === 'privileges' && (
            <div id="subtab-privileges-workspace" className="animate-fade-in text-left">
              <div className="mb-6">
                <h3 className="font-display font-bold text-lg text-white">Privileges & Permissions Matrix</h3>
                <p className="text-xs text-neutral-400 mt-1">Fully dynamic authorization setup. Toggle checkboxes inside the intersection grid to redefine role constraints instantly.</p>
              </div>

              {/* Informative Help tip */}
              <div className="flex items-start space-x-2.5 p-3.5 bg-neutral-900/40 border border-neutral-900 rounded-2xl mb-6 text-xs text-neutral-300">
                <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p>
                  <span className="font-semibold text-white font-sans">Default overrides:</span> President and Secretary profiles hold hardcoded absolute commands across the board, bypassing individual matrix toggles. Standard student role defaults have no privileges till authorized below.
                </p>
              </div>

              {/* Grid Scroll container */}
              <div className="overflow-x-auto border border-neutral-900 rounded-xl bg-neutral-950 max-h-128 scrollbar-thin">
                <table className="w-full text-xs text-neutral-300 border-collapse table-auto min-w-[700px] font-mono">
                  <thead>
                    <tr className="bg-neutral-900/60 border-b border-neutral-900 font-mono uppercase text-[9px] tracking-wider text-neutral-400">
                      <th className="p-4 text-left font-semibold sticky left-0 bg-neutral-900 z-10 w-44 text-white">Role Position Profile</th>
                      {PRIVILEGE_SLOTS.map(slot => (
                        <th key={slot.key} className="p-4 text-center font-semibold max-w-[120px] leading-snug" title={slot.desc}>
                          {slot.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {AVAILABLE_ROLES.map((role) => {
                      const rules = rolePrivileges.find(p => p.roleName === role);
                      const activeKeys = rules ? rules.grantedPrivileges : [];
                      
                      const isHardcodedAdmin = role === 'President' || role === 'Secretary';

                      return (
                        <tr 
                          key={role}
                          className={`border-b border-neutral-900 transition-colors ${
                            hoveredRole === role ? 'bg-neutral-900/30' : ''
                          }`}
                          onMouseEnter={() => setHoveredRole(role)}
                          onMouseLeave={() => setHoveredRole(null)}
                        >
                          {/* Role cell */}
                          <td className="p-4 font-bold text-white sticky left-0 bg-neutral-950 border-r border-neutral-900/40 font-mono tracking-tight shrink-0">
                            {role}
                            {isHardcodedAdmin && (
                              <span className="text-[7px] block font-mono font-black tracking-widest text-amber-500 uppercase mt-0.5">Admin Level</span>
                            )}
                          </td>
                          
                          {/* Checkbox columns */}
                          {PRIVILEGE_SLOTS.map(slot => {
                            const isChecked = activeKeys.includes(slot.key);
                            
                            return (
                              <td key={slot.key} className="p-4 text-center">
                                <button
                                  onClick={() => handleToggleRolePrivilegeCheckbox(role, slot.key)}
                                  className="mx-auto flex items-center justify-center p-1 rounded transition-all focus:outline-none hover:bg-neutral-900 cursor-pointer text-neutral-455 text-neutral-400 hover:text-white"
                                >
                                  {isChecked ? (
                                    <CheckSquare className="w-4.5 h-4.5 text-amber-500" />
                                  ) : (
                                    <Square className="w-4.5 h-4.5" />
                                  )}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM BRANDING & LOGOS */}
          {activeSubTab === 'branding' && (
            <div id="subtab-branding-workspace" className="animate-fade-in text-left">
              <div className="mb-6">
                <h3 className="font-display font-bold text-lg text-white">Dynamic Visual customizer & Logo Studio</h3>
                <p className="text-xs text-neutral-400 mt-1">Alter organizational tagline details, long narrative about us descriptions, hero photo backdrops, and paste school/club SVG scripts to fix design layouts.</p>
              </div>

              <form onSubmit={handleSaveBranding} className="space-y-6 font-sans text-xs text-neutral-300">
                
                {/* Logo Editor Rows (Solves messed-up logos!) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* School Logo */}
                  <div className="p-5 bg-neutral-900/30 border border-neutral-900 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest">School Crest Logo Markup (SVG)</label>
                        <button
                          type="button"
                          onClick={handleResetSchoolLogo}
                          className="text-[9px] font-bold font-mono tracking-wider text-amber-550 text-amber-500 hover:underline flex items-center space-x-1 focus:outline-none cursor-pointer"
                        >
                          <RotateCcw size={10} />
                          <span>Reset Vectors</span>
                        </button>
                      </div>
                      
                      <textarea
                        rows={6}
                        value={schoolLogoInput}
                        onChange={e => setSchoolLogoInput(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 font-mono text-[10px] text-emerald-400 leading-normal focus:outline-none focus:border-amber-500"
                        placeholder="Paste school custom SVG tags `<svg ...>`"
                      />
                    </div>

                    <div className="mt-3 flex items-center space-x-4">
                      <span className="text-[10px] font-mono text-neutral-500 uppercase">Live Preview:</span>
                      <div 
                        className="w-10 h-10 border border-neutral-900 p-1 rounded-lg bg-neutral-950 flex items-center justify-center text-amber-500"
                        dangerouslySetInnerHTML={{ __html: schoolLogoInput }}
                      />
                    </div>
                  </div>

                  {/* Club Logo */}
                  <div className="p-5 bg-neutral-900/30 border border-neutral-900 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Club Lens Logo Markup (SVG)</label>
                        <button
                          type="button"
                          onClick={handleResetClubLogo}
                          className="text-[9px] font-bold font-mono tracking-wider text-amber-550 text-amber-500 hover:underline flex items-center space-x-1 focus:outline-none cursor-pointer"
                        >
                          <RotateCcw size={10} />
                          <span>Reset Vectors</span>
                        </button>
                      </div>

                      <textarea
                        rows={6}
                        value={clubLogoInput}
                        onChange={e => setClubLogoInput(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 font-mono text-[10px] text-emerald-400 leading-normal focus:outline-none focus:border-amber-500"
                        placeholder="Paste club custom SVG tags `<svg ...>`"
                      />
                    </div>

                    <div className="mt-3 flex items-center space-x-4">
                      <span className="text-[10px] font-mono text-neutral-500 uppercase">Live Preview:</span>
                      <div 
                        className="w-10 h-10 border border-neutral-900 p-1 rounded-lg bg-neutral-950 flex items-center justify-center text-amber-500"
                        dangerouslySetInnerHTML={{ __html: clubLogoInput }}
                      />
                    </div>
                  </div>

                </div>

                {/* Typography and Descriptions fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wider text-neutral-400 mb-1.5">Society Visual Designation Name</label>
                    <input
                      type="text"
                      required
                      value={societyNameInput}
                      onChange={e => setSocietyNameInput(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wider text-neutral-400 mb-1.5">Governing Academy Name</label>
                    <input
                      type="text"
                      required
                      value={schoolNameInput}
                      onChange={e => setSchoolNameInput(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-neutral-400 mb-1.5">Dynamic Visual Tagline</label>
                  <input
                    type="text"
                    required
                    value={taglineInput}
                    onChange={e => setTaglineInput(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <ImageUploadField
                  label="Lading Hero Backdrop Image"
                  value={heroImageInput}
                  onChange={setHeroImageInput}
                  placeholder="Select or drag hero design..."
                  id="branding-hero"
                />

                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-wider text-neutral-400 mb-1.5">Core Academy Long Narrative Story (About Us Text)</label>
                  <textarea
                    rows={6}
                    required
                    value={aboutStoryInput}
                    onChange={e => setAboutStoryInput(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none font-sans leading-relaxed"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    id="btn-save-branding-configs"
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs transition-transform transform active:scale-95 shadow-md cursor-pointer"
                  >
                    Commit Custom Style Configs
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* TAB 4: BOARD PORTFOLIOS MANAGEMENT */}
          {activeSubTab === 'board' && (
            <div id="subtab-board-workspace" className="animate-fade-in text-left">
              <div className="mb-6">
                <h3 className="font-display font-bold text-lg text-white">Board Portfolios Curator</h3>
                <p className="text-xs text-slate-400 mt-1">Configure profile cards displayed directly on the About Us page, complete with order sequences and achievement summaries.</p>
              </div>

              {/* Grid split: form left, list right */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Board member upload form */}
                <form onSubmit={handleCreateOrUpdateBoard} className="md:col-span-5 bg-slate-900/30 border border-slate-900 p-4 rounded-2xl space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-900 pb-2 mb-3">
                    {editingBoardId ? 'Edit Board Entry' : 'Add Board Profile'}
                  </h4>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-405 text-slate-400 mb-1">Board Holder Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bosilu Niduwara"
                      value={boardName}
                      onChange={e => setBoardName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <ImageUploadField
                    label="Board Portrait Photo"
                    value={boardImage}
                    onChange={setBoardImage}
                    placeholder="Select or drag portrait picture..."
                    id="board-member-avatar"
                  />

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1.5">Roles mapped on Board (Select multiple)</label>
                    <div className="h-28 overflow-y-auto border border-slate-900/80 p-2 bg-slate-950 rounded-lg space-y-1">
                      {AVAILABLE_ROLES.map(role => {
                        const isSel = boardRolesSelected.includes(role);
                        return (
                          <button
                            type="button"
                            key={role}
                            onClick={() => handleToggleBoardRoleSel(role)}
                            className="w-full text-left px-2 py-0.5 rounded text-[10px] flex items-center justify-between hover:bg-slate-900 cursor-pointer text-slate-350"
                          >
                            <span>{role}</span>
                            {isSel && <Check size={10} className="text-amber-500" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Render Order</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={boardOrder}
                        onChange={e => setBoardOrder(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Crest Prize Achievement</label>
                      <input
                        type="text"
                        placeholder="e.g. Exhibitor of year 2025"
                        value={boardAchievement}
                        onChange={e => setBoardAchievement(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Gender (For Silhouette Fallback)</label>
                    <select
                      value={boardGender}
                      onChange={e => setBoardGender(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-450 text-slate-400 mb-1">Board Biography / Contribution</label>
                    <textarea
                      rows={3}
                      placeholder="Summarize governing credentials inside DSCPS..."
                      value={boardBio}
                      onChange={e => setBoardBio(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2 border-t border-slate-900">
                    {editingBoardId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBoardId(null);
                          setBoardName('');
                          setBoardBio('');
                          setBoardRolesSelected([]);
                          setBoardImage('');
                          setBoardOrder(1);
                          setBoardAchievement('');
                        }}
                        className="px-2 py-1.5 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs cursor-pointer"
                    >
                      {editingBoardId ? 'Update Board Profile' : 'Publish to Board'}
                    </button>
                  </div>
                </form>

                {/* Board member current lists */}
                <div className="md:col-span-7 space-y-2 max-h-128 overflow-y-auto pr-1">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Live Profiles listed: ({boardMembers.length})</h4>
                  
                  {boardMembers.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-500 font-mono">No board portfolios currently configured.</div>
                  ) : (
                    boardMembers.map(m => (
                      <div
                        key={m.id}
                        className="bg-slate-900/40 border border-slate-900 p-3 rounded-xl flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3 truncate">
                          <img
                            src={getUserAvatar(m.imageUrl, m.gender)}
                            alt={m.fullName}
                            className="w-10 h-10 rounded-lg object-cover grayscale"
                          />
                          <div className="truncate shrink text-xs">
                            <p className="font-bold text-white truncate">{m.fullName}</p>
                            <p className="text-[9.5px] font-mono text-amber-500 uppercase">Seq: {m.order} | {m.roles.join(', ')}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => handleEditBoardStart(m)}
                            className="px-2 py-1 bg-slate-955 text-[10px] font-bold uppercase tracking-wider text-slate-350 hover:text-white hover:bg-slate-800 rounded focus:outline-none cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            id={`btn-delete-board-member-${m.id}`}
                            onClick={() => {
                              if (confirm(`Remove board profile of ${m.fullName}?`)) {
                                deleteBoardMember(m.id);
                                triggerSuccess('Board member profile directory archived successfully.');
                              }
                            }}
                            className="p-1 px-1.5 bg-rose-950/20 text-rose-455 text-rose-500 hover:text-rose-400 rounded focus:outline-none cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: NOTICE DESK ANNOUNCEMENTS */}
          {activeSubTab === 'announcements' && (
            <div id="subtab-announcements-workspace" className="animate-fade-in text-left font-sans">
              <div className="mb-6">
                <h3 className="font-display font-bold text-lg text-white">Notice Desk & Bulletins</h3>
                <p className="text-xs text-neutral-400 mt-1">Post urgent alerts, registration masterclasses, and visual announcements directly onto the landing Notice Board.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start font-sans text-neutral-300">
                
                {/* bulletin posting Form */}
                <form onSubmit={handleNoticePost} className="md:col-span-5 bg-neutral-900/30 border border-neutral-900 p-4 rounded-2xl space-y-4">
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-900 pb-2">File Society Bulletin</h4>
                  
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-neutral-400 mb-1 font-bold">Notice Headline</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Annual DSLR Assembly 2026"
                      value={newNoticeTitle}
                      onChange={e => setNewNoticeTitle(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-neutral-400 mb-1 font-bold">Notice Bulletin Content</label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Detail standard guidelines, agendas, locations, dates, or registration rules..."
                      value={newNoticeContent}
                      onChange={e => setNewNoticeContent(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500 font-sans leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-end pt-2 border-t border-neutral-900 font-sans">
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-amber-505 bg-amber-500 text-neutral-950 font-bold rounded-lg text-xs cursor-pointer"
                    >
                      Publish Bulletin Notice
                    </button>
                  </div>
                </form>

                {/* bulletin list */}
                <div className="md:col-span-7 space-y-3 max-h-128 overflow-y-auto pr-1">
                  <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Live Bulletin notices listed: ({announcements.length})</h4>
                  
                  {announcements.length === 0 ? (
                    <div className="text-center py-6 text-xs text-neutral-500 font-mono">No bulletin notices currently displayed.</div>
                  ) : (
                    announcements.map(ann => (
                      <div
                        key={ann.id}
                        className="bg-neutral-900/40 border border-neutral-900 p-4 rounded-xl text-xs relative flex justify-between gap-4"
                      >
                        <div className="truncate shrink">
                          <p className="font-bold text-white truncate text-left">{ann.title}</p>
                          <p className="text-[9.5px] font-mono text-neutral-505 text-amber-500 mt-1 uppercase text-left">{ann.date} • by {ann.author}</p>
                          <p className="text-xs text-neutral-400 mt-2 line-clamp-3 leading-normal font-sans text-left">{ann.content}</p>
                        </div>

                        <button
                          id={`btn-delete-announcement-${ann.id}`}
                          onClick={() => {
                            if (confirm(`Remove this notification notice?`)) {
                              deleteAnnouncement(ann.id);
                              triggerSuccess('Notice alert deleted successfully.');
                            }
                          }}
                          className="p-1 px-1.5 bg-rose-950/20 text-rose-500 hover:text-rose-450 rounded shrink-0 self-start focus:outline-none cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
