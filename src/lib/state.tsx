/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { signInWithGoogle } from './firebase';
import {
  UserProfile,
  RolePrivilegeConfig,
  BoardMember,
  Announcement,
  GalleryPhoto,
  Article,
  SiteConfig,
  RoleName,
  PrivilegeKey,
  Workload
} from '../types';
import {
  INITIAL_SITE_CONFIG,
  INITIAL_ROLE_PRIVILEGES,
  INITIAL_USERS,
  INITIAL_BOARD,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_GALLERY,
  INITIAL_ARTICLES
} from '../data/defaultData';

export function getUserAvatar(avatarUrl: string | undefined, gender?: string): string {
  if (avatarUrl && avatarUrl.trim() !== '') {
    return avatarUrl;
  }
  
  const g = gender?.toLowerCase();
  if (g === 'male') {
    // Premium custom high-contrast male silhouette SVG (Dark Theme friendly with amber accent highlight)
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="50" fill="%23171717"/><circle cx="50" cy="36" r="16" fill="%23404040"/><path d="M15 85 C15 62 28 56 50 56 C72 56 85 62 85 85" fill="%23404040"/><circle cx="50" cy="36" r="16" stroke="%23f59e0b" stroke-width="2"/></svg>`;
  }
  if (g === 'female') {
    // Premium custom high-contrast female silhouette SVG (Dark Theme friendly with pink accent highlight)
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="50" fill="%23171717"/><circle cx="50" cy="36" r="15" fill="%23404040"/><path d="M15 85 C15 62 28 56 50 56 C72 56 85 62 85 85" fill="%23404040"/><path d="M35 34 C35 24 42 18 50 18 C58 18 65 24 65 34 C65 40 58 42 50 42 C42 42 35 40 35 34 Z" fill="%23404040"/><circle cx="50" cy="36" r="15" stroke="%23ec4899" stroke-width="2"/></svg>`;
  }
  // Generic background silhouette SVG if unspecified or 'other'
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="50" fill="%23171717"/><circle cx="50" cy="36" r="16" fill="%23262626"/><path d="M15 85 C15 62 28 56 50 56 C72 56 85 62 85 85" fill="%23262626"/></svg>`;
}

interface DSCPSContextType {
  siteConfig: SiteConfig;
  rolePrivileges: RolePrivilegeConfig[];
  users: UserProfile[];
  boardMembers: BoardMember[];
  announcements: Announcement[];
  gallery: GalleryPhoto[];
  articles: Article[];
  currentUser: UserProfile | null;
  workloads: Workload[];
  
  // Authentication Actions
  login: (email: string) => Promise<UserProfile>;
  register: (email: string, fullName: string, admissionNo: string, joinedYear: string) => Promise<UserProfile>;
  loginWithGoogleSimulate: (email: string, fullName: string) => Promise<UserProfile>;
  loginWithGoogleFirebase: () => Promise<UserProfile>;
  logout: () => void;
  
  // Admin Customization Actions
  updateSiteConfig: (config: Partial<SiteConfig>) => void;
  updateRolePrivilege: (roleName: RoleName, privileges: PrivilegeKey[]) => void;
  updateUserRoles: (uid: string, roles: RoleName[]) => void;
  deleteUser: (uid: string) => void;
  
  // Board Management Actions
  addBoardMember: (member: Omit<BoardMember, 'id'>) => void;
  updateBoardMember: (id: string, updated: Partial<BoardMember>) => void;
  deleteBoardMember: (id: string) => void;
  
  // Announcement Actions
  addAnnouncement: (title: string, content: string, author: string) => void;
  deleteAnnouncement: (id: string) => void;
  
  // Content Corner Actions
  addPhotoToCorner: (title: string, description: string, url: string, pName: string, pId: string) => void;
  deletePhotoFromCorner: (id: string) => void;
  addArticleToCorner: (title: string, content: string, aName: string, aId: string) => void;
  deleteArticleFromCorner: (id: string) => void;

  // Workload Management Actions
  assignWorkload: (workload: Omit<Workload, 'id' | 'status'>) => void;
  submitWorkload: (workloadId: string, url: string, notes: string) => void;
  completeWorkload: (workloadId: string) => void;
  abandonWorkload: (workloadId: string, subtractPoints: boolean) => void;
  deleteWorkload: (workloadId: string) => void;
}

const INITIAL_WORKLOADS: Workload[] = [
  {
    id: 'work-1',
    title: 'Color Grade 50 Sports Day Highlights',
    description: 'Ensure color balancing, cinematic grain, and light correction for all fast-shutter action logs from last school sports meet.',
    assignedToId: 'user-2',
    assignedToName: 'Aravinda Jayasundara',
    assignedById: 'admin-1',
    assignedByName: 'Bosilu Niduwara',
    deadline: '2026-05-26',
    pts: 120,
    status: 'pending',
    type: 'editing'
  },
  {
    id: 'work-2',
    title: 'Focus Magazine Cover layout composition',
    description: 'Draft the aesthetic cover layout of the society magazine "Focus Issue 4" with elegant typography pairings and high-contrast margins.',
    assignedToId: 'user-2',
    assignedToName: 'Aravinda Jayasundara',
    assignedById: 'admin-1',
    assignedByName: 'Bosilu Niduwara',
    deadline: '2026-05-18',
    pts: 150,
    status: 'completed',
    submissionUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=600',
    submissionNotes: 'Completed the Cover typography layout. Designed with light, crisp serif margins and verified spacing.',
    submittedAt: '2026-05-18',
    type: 'editing'
  },
  {
    id: 'work-3',
    title: 'Background Removal for Staff Portraitures',
    description: 'Conduct clean extraction of staff hair silhouettes and transparent shadows for 12 core administrative board profiles.',
    assignedToId: 'user-2',
    assignedToName: 'Aravinda Jayasundara',
    assignedById: 'admin-1',
    assignedByName: 'Bosilu Niduwara',
    deadline: '2026-05-28',
    pts: 80,
    status: 'submitted',
    submissionUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=600',
    submissionNotes: 'All 12 background assets extracted into high-res PNG layers and archived in the sharing folder.',
    submittedAt: '2026-05-21',
    type: 'editing'
  }
];

const DSCPSContext = createContext<DSCPSContextType | undefined>(undefined);

export function DSCPSProvider({ children }: { children: ReactNode }) {
  // Load initial states from localStorage if available, else seed from defaults
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    const saved = localStorage.getItem('dscps_site_config');
    return saved ? JSON.parse(saved) : INITIAL_SITE_CONFIG;
  });

  const [rolePrivileges, setRolePrivileges] = useState<RolePrivilegeConfig[]>(() => {
    const saved = localStorage.getItem('dscps_role_privileges');
    return saved ? JSON.parse(saved) : INITIAL_ROLE_PRIVILEGES;
  });

  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('dscps_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((u: any) => ({
          ...u,
          photographerPoints: u.photographerPoints ?? (u.roles.some((r: any) => r.includes('Photographer')) ? (u.points || 120) : u.uid === 'admin-1' || u.uid === 'admin-2' ? 250 : 0),
          editorPoints: u.editorPoints ?? (u.roles.some((r: any) => r.includes('Editor')) ? (u.points || 120) : u.uid === 'admin-1' || u.uid === 'admin-2' ? 200 : 0),
          points: u.points ?? 120
        }));
      } catch (e) {
        // Fallback below
      }
    }
    return INITIAL_USERS.map(u => {
      const isDhananjaya = u.uid === 'admin-1';
      const isBosilu = u.uid === 'admin-2';
      const isAravinda = u.uid === 'user-2';
      const isMethmi = u.uid === 'user-3';
      
      const p = isDhananjaya ? 500 : (isBosilu ? 450 : (isAravinda ? 350 : 120));
      const photoPts = isDhananjaya ? 300 : (isBosilu ? 250 : (isAravinda ? 100 : (isMethmi ? 120 : 0)));
      const editPts = isDhananjaya ? 150 : (isBosilu ? 200 : (isAravinda ? 250 : 0));
      
      return {
        ...u,
        points: p,
        photographerPoints: photoPts,
        editorPoints: editPts
      };
    });
  });

  const [boardMembers, setBoardMembers] = useState<BoardMember[]>(() => {
    const saved = localStorage.getItem('dscps_board');
    return saved ? JSON.parse(saved) : INITIAL_BOARD;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('dscps_announcements');
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  const [gallery, setGallery] = useState<GalleryPhoto[]>(() => {
    const saved = localStorage.getItem('dscps_gallery');
    return saved ? JSON.parse(saved) : INITIAL_GALLERY;
  });

  const [articles, setArticles] = useState<Article[]>(() => {
    const saved = localStorage.getItem('dscps_articles');
    return saved ? JSON.parse(saved) : INITIAL_ARTICLES;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('dscps_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [workloads, setWorkloads] = useState<Workload[]>(() => {
    const saved = localStorage.getItem('dscps_workloads');
    return saved ? JSON.parse(saved) : INITIAL_WORKLOADS;
  });

  // Persists state helper
  useEffect(() => {
    localStorage.setItem('dscps_site_config', JSON.stringify(siteConfig));
  }, [siteConfig]);

  useEffect(() => {
    localStorage.setItem('dscps_role_privileges', JSON.stringify(rolePrivileges));
  }, [rolePrivileges]);

  useEffect(() => {
    localStorage.setItem('dscps_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('dscps_board', JSON.stringify(boardMembers));
  }, [boardMembers]);

  useEffect(() => {
    localStorage.setItem('dscps_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('dscps_gallery', JSON.stringify(gallery));
  }, [gallery]);

  useEffect(() => {
    localStorage.setItem('dscps_articles', JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    localStorage.setItem('dscps_workloads', JSON.stringify(workloads));
  }, [workloads]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('dscps_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('dscps_current_user');
    }
  }, [currentUser]);

  // Helper check to sync current user session if user lists are modified
  useEffect(() => {
    if (currentUser) {
      const updatedProfile = users.find(u => u.uid === currentUser.uid);
      if (updatedProfile) {
        // Only update if roles or data actually changed to avoid loop
        if (JSON.stringify(updatedProfile) !== JSON.stringify(currentUser)) {
          setCurrentUser(updatedProfile);
        }
      }
    }
  }, [users]);

  // Auth Methods
  const login = async (email: string): Promise<UserProfile> => {
    const cleanEmail = email.toLowerCase().trim();
    // Default admin hander
    if (cleanEmail === 'bosiluniduwara@gmail.com' || cleanEmail === 'dhananjaya@gmail.com') {
      const existingAdmin = users.find(u => u.email.toLowerCase() === cleanEmail);
      if (existingAdmin) {
        setCurrentUser(existingAdmin);
        return existingAdmin;
      } else {
        // Auto-recreate default admin if deleted
        const isDhananjaya = cleanEmail === 'dhananjaya@gmail.com';
        const newAdmin: UserProfile = isDhananjaya ? {
          uid: 'admin-1',
          email: 'dhananjaya@gmail.com',
          fullName: 'Dhananjaya Damsith',
          admissionNo: 'DSC-2022-7741',
          joinedYear: '2022',
          avatarUrl: '',
          bio: 'DSCPS Society President. Leading creative vision, scheduling exhibitions, and organizing student photo masterclasses.',
          roles: ['President', 'Senior Photographer'],
          gender: 'Male',
        } : {
          uid: 'admin-2',
          email: 'bosiluniduwara@gmail.com',
          fullName: 'Bosilu Niduwara',
          admissionNo: 'DSC-2022-8921',
          joinedYear: '2022',
          avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop',
          bio: 'DSCPS Secretary. Managing student rosters, privilege logs, workshop agendas, and society frameworks.',
          roles: ['Secretary', 'Senior Photographer'],
          gender: 'Male',
        };
        setUsers(prev => [newAdmin, ...prev]);
        setCurrentUser(newAdmin);
        return newAdmin;
      }
    }

    const user = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (user) {
      setCurrentUser(user);
      return user;
    } else {
      throw new Error('Account not found. Please register or sign in with Google directly!');
    }
  };

  const register = async (email: string, fullName: string, admissionNo: string, joinedYear: string): Promise<UserProfile> => {
    const cleanEmail = email.toLowerCase().trim();
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    // Default roles for a new registrant is "Student", unless they are admin
    const isPresident = cleanEmail === 'dhananjaya@gmail.com';
    const isSecretary = cleanEmail === 'bosiluniduwara@gmail.com';
    const defaultRoles: RoleName[] = isPresident 
      ? ['President', 'Senior Photographer'] 
      : isSecretary 
      ? ['Secretary', 'Senior Photographer'] 
      : ['Student', 'Member'];

    const newUser: UserProfile = {
      uid: isPresident ? 'admin-1' : isSecretary ? 'admin-2' : 'dsc-user-' + Math.random().toString(36).substring(2, 9),
      email: cleanEmail,
      fullName: fullName.trim(),
      admissionNo: admissionNo.trim() || 'DSC-' + Math.floor(1000 + Math.random() * 9000),
      joinedYear: joinedYear || new Date().getFullYear().toString(),
      avatarUrl: isSecretary 
        ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop'
        : isPresident
        ? ''
        : `https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop`,
      bio: isPresident 
        ? 'DSCPS Society President. Leading creative vision, scheduling exhibitions, and organizing student photo masterclasses.'
        : isSecretary
        ? 'DSCPS Secretary. Managing student rosters, privilege logs, workshop agendas, and society frameworks.'
        : `Fresh student member of the DSCPS photographic squad. Ready to learn and capture!`,
      roles: defaultRoles,
      gender: isPresident || isSecretary ? 'Male' : undefined,
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return newUser;
  };

  const loginWithGoogleSimulate = async (email: string, fullName: string): Promise<UserProfile> => {
    const cleanEmail = email.toLowerCase().trim();
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      setCurrentUser(existing);
      return existing;
    }

    const isPresident = cleanEmail === 'dhananjaya@gmail.com';
    const isSecretary = cleanEmail === 'bosiluniduwara@gmail.com';
    
    const roles: RoleName[] = isPresident 
      ? ['President', 'Senior Photographer'] 
      : isSecretary 
      ? ['Secretary', 'Senior Photographer']
      : ['Student', 'Member'];

    const studentNo = isPresident ? 'DSC-2022-7741' : isSecretary ? 'DSC-2022-8921' : 'DSC-' + Math.floor(1000 + Math.random() * 9000);

    const newUser: UserProfile = {
      uid: isPresident ? 'admin-1' : isSecretary ? 'admin-2' : 'dsc-user-google-' + Math.random().toString(36).substring(2, 9),
      email: cleanEmail,
      fullName: fullName,
      admissionNo: studentNo,
      joinedYear: new Date().getFullYear().toString(),
      avatarUrl: isSecretary 
        ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop'
        : isPresident
        ? ''
        : `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop`,
      bio: isPresident 
        ? 'DSCPS Society President. Leading creative vision, scheduling exhibitions, and organizing student photo masterclasses.'
        : isSecretary
        ? 'DSCPS Secretary. Managing student rosters, privilege logs, workshop agendas, and society frameworks.'
        : `Student level photographer signed in with Google. Active camera fan!`,
      roles: roles,
      gender: isPresident || isSecretary ? 'Male' : undefined,
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return newUser;
  };

  const loginWithGoogleFirebase = async (): Promise<UserProfile> => {
    const firebaseUser = await signInWithGoogle();
    const email = firebaseUser.email || '';
    const displayName = firebaseUser.displayName || email.split('@')[0] || 'Google Scholar';
    const cleanEmail = email.toLowerCase().trim();
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      setCurrentUser(existing);
      return existing;
    }

    const isPresident = cleanEmail === 'dhananjaya@gmail.com';
    const isSecretary = cleanEmail === 'bosiluniduwara@gmail.com';

    const roles: RoleName[] = isPresident 
      ? ['President', 'Senior Photographer'] 
      : isSecretary 
      ? ['Secretary', 'Senior Photographer']
      : ['Student', 'Member'];

    const studentNo = isPresident ? 'DSC-2022-7741' : isSecretary ? 'DSC-2022-8921' : 'DSC-' + Math.floor(1000 + Math.random() * 9000);

    const newUser: UserProfile = {
      uid: isPresident ? 'admin-1' : isSecretary ? 'admin-2' : (firebaseUser.uid || 'dsc-user-fb-' + Math.random().toString(36).substring(2, 9)),
      email: cleanEmail,
      fullName: displayName,
      admissionNo: studentNo,
      joinedYear: new Date().getFullYear().toString(),
      avatarUrl: firebaseUser.photoURL || (isSecretary 
        ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop'
        : isPresident
        ? ''
        : `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop`),
      bio: isPresident 
        ? 'DSCPS Society President. Leading creative vision, scheduling exhibitions, and organizing student photo masterclasses.'
        : isSecretary
        ? 'DSCPS Secretary. Managing student rosters, privilege logs, workshop agendas, and society frameworks.'
        : `Student level photographer signed in with Google. Active camera fan!`,
      roles: roles,
      gender: isPresident || isSecretary ? 'Male' : undefined,
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return newUser;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Admin Config updates
  const updateSiteConfig = (updated: Partial<SiteConfig>) => {
    setSiteConfig(prev => ({ ...prev, ...updated }));
  };

  const updateRolePrivilege = (roleName: RoleName, privileges: PrivilegeKey[]) => {
    setRolePrivileges(prev => {
      const idx = prev.findIndex(r => r.roleName === roleName);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], grantedPrivileges: privileges };
        return copy;
      }
      return [...prev, { roleName, grantedPrivileges: privileges }];
    });
  };

  const updateUserRoles = (uid: string, roles: RoleName[]) => {
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, roles } : u));
  };

  const deleteUser = (uid: string) => {
    if (uid === 'admin-1' || uid === currentUser?.uid) return; // Prevent self-delete or main-admin delete
    setUsers(prev => prev.filter(u => u.uid !== uid));
  };

  // Board
  const addBoardMember = (member: Omit<BoardMember, 'id'>) => {
    const newMember: BoardMember = {
      ...member,
      id: 'board-member-' + Math.random().toString(36).substring(2, 9)
    };
    setBoardMembers(prev => {
      const list = [...prev, newMember];
      return list.sort((a,b) => (a.order || 0) - (b.order || 0));
    });
  };

  const updateBoardMember = (id: string, updated: Partial<BoardMember>) => {
    setBoardMembers(prev => prev.map(m => m.id === id ? { ...m, ...updated } : m).sort((a,b) => (a.order || 0) - (b.order || 0)));
  };

  const deleteBoardMember = (id: string) => {
    setBoardMembers(prev => prev.filter(m => m.id !== id));
  };

  // Announcements
  const addAnnouncement = (title: string, content: string, author: string) => {
    const newAnn: Announcement = {
      id: 'ann-' + Math.random().toString(36).substring(2, 9),
      title: title.trim(),
      content: content.trim(),
      date: new Date().toISOString().split('T')[0],
      author: author,
    };
    setAnnouncements(prev => [newAnn, ...prev]);
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(ann => ann.id !== id));
  };

  // Galleries/Articles Content Corners
  const addPhotoToCorner = (title: string, description: string, url: string, pName: string, pId: string) => {
    const newPhoto: GalleryPhoto = {
      id: 'photo-' + Math.random().toString(36).substring(2, 9),
      title: title.trim(),
      description: description.trim(),
      imageUrl: url.trim(),
      photographerName: pName,
      photographerId: pId,
      uploadedAt: new Date().toISOString().split('T')[0],
    };
    setGallery(prev => [newPhoto, ...prev]);
  };

  const deletePhotoFromCorner = (id: string) => {
    setGallery(prev => prev.filter(p => p.id !== id));
  };

  const addArticleToCorner = (title: string, content: string, aName: string, aId: string) => {
    const newArt: Article = {
      id: 'article-' + Math.random().toString(36).substring(2, 9),
      title: title.trim(),
      content: content.trim(),
      authorName: aName,
      authorId: aId,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setArticles(prev => [newArt, ...prev]);
  };

  const deleteArticleFromCorner = (id: string) => {
    setArticles(prev => prev.filter(art => art.id !== id));
  };

  // Workload Management Actions
  const assignWorkload = (workload: Omit<Workload, 'id' | 'status'>) => {
    const newWork: Workload = {
      ...workload,
      id: 'work-' + Math.random().toString(36).substring(2, 9),
      status: 'pending',
      type: workload.type || 'editing'
    };
    setWorkloads(prev => [newWork, ...prev]);
  };

  const submitWorkload = (workloadId: string, url: string, notes: string) => {
    setWorkloads(prev => prev.map(w => w.id === workloadId ? {
      ...w,
      status: 'submitted',
      submissionUrl: url.trim(),
      submissionNotes: notes.trim(),
      submittedAt: new Date().toISOString().split('T')[0]
    } : w));
  };

  const completeWorkload = (workloadId: string) => {
    const targetWork = workloads.find(w => w.id === workloadId);
    if (!targetWork) return;

    setWorkloads(prev => prev.map(w => w.id === workloadId ? { ...w, status: 'completed' } : w));

    if (targetWork.status !== 'completed') {
      const type = targetWork.type || 'editing';
      setUsers(prev => prev.map(u => {
        if (u.uid === targetWork.assignedToId) {
          const addedPts = targetWork.pts;
          const currentTotal = u.points || 0;
          const currentPhoto = u.photographerPoints || 0;
          const currentEditor = u.editorPoints || 0;
          
          return {
            ...u,
            points: currentTotal + addedPts,
            photographerPoints: type === 'photography' ? currentPhoto + addedPts : currentPhoto,
            editorPoints: type === 'editing' ? currentEditor + addedPts : currentEditor
          };
        }
        return u;
      }));
    }
  };

  const abandonWorkload = (workloadId: string, subtractPoints: boolean) => {
    const targetWork = workloads.find(w => w.id === workloadId);
    if (!targetWork) return;

    setWorkloads(prev => prev.map(w => w.id === workloadId ? { ...w, status: 'abandoned' } : w));

    if (subtractPoints) {
      const type = targetWork.type || 'editing';
      setUsers(prev => prev.map(u => {
        if (u.uid === targetWork.assignedToId) {
          const subPts = targetWork.pts;
          const currentTotal = u.points || 0;
          const currentPhoto = u.photographerPoints || 0;
          const currentEditor = u.editorPoints || 0;

          return {
            ...u,
            points: Math.max(0, currentTotal - subPts),
            photographerPoints: type === 'photography' ? Math.max(0, currentPhoto - subPts) : currentPhoto,
            editorPoints: type === 'editing' ? Math.max(0, currentEditor - subPts) : currentEditor
          };
        }
        return u;
      }));
    }
  };

  const deleteWorkload = (workloadId: string) => {
    setWorkloads(prev => prev.filter(w => w.id !== workloadId));
  };

  return (
    <DSCPSContext.Provider value={{
      siteConfig,
      rolePrivileges,
      users,
      boardMembers,
      announcements,
      gallery,
      articles,
      currentUser,
      workloads,
      
      login,
      register,
      loginWithGoogleSimulate,
      loginWithGoogleFirebase,
      logout,
      
      updateSiteConfig,
      updateRolePrivilege,
      updateUserRoles,
      deleteUser,
      
      addBoardMember,
      updateBoardMember,
      deleteBoardMember,
      
      addAnnouncement,
      deleteAnnouncement,
      
      addPhotoToCorner,
      deletePhotoFromCorner,
      addArticleToCorner,
      deleteArticleFromCorner,

      assignWorkload,
      submitWorkload,
      completeWorkload,
      abandonWorkload,
      deleteWorkload,
    }}>
      {children}
    </DSCPSContext.Provider>
  );
}

export function useDSCPS() {
  const context = useContext(DSCPSContext);
  if (context === undefined) {
    throw new Error('useDSCPS must be used within a DSCPSProvider');
  }
  return context;
}
