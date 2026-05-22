/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SiteConfig, RolePrivilegeConfig, UserProfile, BoardMember, Announcement, GalleryPhoto, Article } from '../types';

// Sleek School Logo SVG (Crest format)
export const DEFAULT_SCHOOL_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-12 h-12 text-amber-500">
  <path d="M50 5 L15 25 V60 C15 80 50 95 50 95 C50 95 85 80 85 60 V25 L50 5 Z" fill="currentColor" fill-opacity="0.1"/>
  <path d="M50 20 V80" stroke-dasharray="4 4"/>
  <path d="M30 45l15 15 25-25" />
  <circle cx="50" cy="5" r="1.5" fill="currentColor"/>
</svg>`;

// Crisp Club Logo SVG (Camera/Aperture format)
export const DEFAULT_CLUB_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2" className="w-12 h-12 text-emerald-500">
  <rect x="15" y="25" width="70" height="55" rx="10" fill="currentColor" fill-opacity="0.1" stroke-width="2.5"/>
  <circle cx="50" cy="52" r="18" stroke-width="2.5"/>
  <ellipse cx="50" cy="52" rx="8" ry="8" fill="currentColor" fill-opacity="0.2"/>
  <path d="M35 25 L42 15 H58 L65 25" stroke-width="2" stroke-linejoin="round"/>
  <circle cx="73" cy="37" r="4" fill="currentColor"/>
  <path d="M32 52h8M60 52h8M50 34v8M50 62v8" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;

export const INITIAL_SITE_CONFIG: SiteConfig = {
  domain: 'dscps.online',
  schoolName: 'Defence Service College',
  societyName: 'Defence Service College Photographic Society',
  tagline: 'Capturing Moments, Preserving Memories',
  aboutText: 'The Defence Service College Photographic Society (DSCPS) provides an inspiring ecosystem for budding student photographers, videographers, and editors. Founded to encourage visual storytelling, DSCPS conducts annual exhibitions, workshops with industry veterans, and actively documents all national and school level summits, sports milestones, and artistic showcases.',
  schoolLogo: DEFAULT_SCHOOL_LOGO_SVG,
  clubLogo: DEFAULT_CLUB_LOGO_SVG,
  heroImageUrl: 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d84a?q=80&w=1600&auto=format&fit=crop',
  noticeBoardEnabled: true,
};

export const INITIAL_ROLE_PRIVILEGES: RolePrivilegeConfig[] = [
  {
    roleName: 'President',
    grantedPrivileges: ['manage_members', 'manage_privileges', 'customize_site', 'editors_corner', 'photographers_corner', 'view_corners_all'],
  },
  {
    roleName: 'Secretary',
    grantedPrivileges: ['manage_members', 'manage_privileges', 'customize_site', 'editors_corner', 'photographers_corner', 'view_corners_all'],
  },
  {
    roleName: 'Treasurer',
    grantedPrivileges: ['view_corners_all', 'photographers_corner'],
  },
  {
    roleName: 'Asst. President',
    grantedPrivileges: ['manage_members', 'customize_site', 'editors_corner', 'photographers_corner', 'view_corners_all'],
  },
  {
    roleName: 'Asst. Secretary',
    grantedPrivileges: ['manage_members', 'customize_site', 'editors_corner', 'photographers_corner', 'view_corners_all'],
  },
  {
    roleName: 'Asst. Treasurer',
    grantedPrivileges: ['view_corners_all', 'photographers_corner'],
  },
  {
    roleName: 'Coordinator',
    grantedPrivileges: ['view_corners_all', 'photographers_corner', 'editors_corner'],
  },
  {
    roleName: 'Exec. Member',
    grantedPrivileges: ['view_corners_all', 'photographers_corner', 'editors_corner'],
  },
  {
    roleName: 'Committee Member',
    grantedPrivileges: ['view_corners_all', 'photographers_corner', 'editors_corner'],
  },
  {
    roleName: 'Photographer',
    grantedPrivileges: ['photographers_corner', 'view_corners_all'],
  },
  {
    roleName: 'Senior Photographer',
    grantedPrivileges: ['photographers_corner', 'view_corners_all'],
  },
  {
    roleName: 'Editor',
    grantedPrivileges: ['editors_corner', 'view_corners_all'],
  },
  {
    roleName: 'Chief Editor',
    grantedPrivileges: ['editors_corner', 'view_corners_all'],
  },
  {
    roleName: 'Senior Editor',
    grantedPrivileges: ['editors_corner', 'view_corners_all'],
  },
  {
    roleName: 'Member',
    grantedPrivileges: ['view_corners_all'],
  },
  {
    roleName: 'Senior Member',
    grantedPrivileges: ['view_corners_all', 'photographers_corner', 'editors_corner'],
  },
  {
    roleName: 'Student',
    grantedPrivileges: [],
  },
];

export const INITIAL_USERS: UserProfile[] = [
  {
    uid: 'admin-1',
    email: 'dhananjaya@gmail.com',
    fullName: 'Dhananjaya Damsith',
    admissionNo: 'DSC-2022-7741',
    joinedYear: '2022',
    avatarUrl: '', // Explicitly blank to verify the fallback anonymous avatar works
    bio: 'DSCPS Society President. Leading creative vision, scheduling exhibitions, and organizing student photo masterclasses.',
    roles: ['President', 'Senior Photographer'],
    gender: 'Male',
    instagramUrl: 'https://instagram.com/dhananjaya_dams',
    customBannerUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1200&auto=format&fit=crop',
  },
  {
    uid: 'admin-2',
    email: 'bosiluniduwara@gmail.com',
    fullName: 'Bosilu Niduwara',
    admissionNo: 'DSC-2022-8921',
    joinedYear: '2022',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop',
    bio: 'DSCPS Secretary. Managing student rosters, privilege logs, workshop agendas, and society frameworks.',
    roles: ['Secretary', 'Senior Photographer'],
    gender: 'Male',
    instagramUrl: 'https://instagram.com/bosiluniduwara',
    behanceUrl: 'https://behance.net/bosiluniduwara',
    customBannerUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1200&auto=format&fit=crop',
  },
  {
    uid: 'user-2',
    email: 'student.aravinda@dsc.edu.lk',
    fullName: 'Aravinda Jayasundara',
    admissionNo: 'DSC-2023-1104',
    joinedYear: '2023',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    bio: 'Senior editor passionate about capturing sports and school-level action. Focused on clean cinematic alignments.',
    roles: ['Chief Editor', 'Senior Editor', 'Exec. Member'],
    gender: 'Male',
    instagramUrl: 'https://instagram.com/aravinda_j',
    customBannerUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1200&auto=format&fit=crop',
  },
  {
    uid: 'user-3',
    email: 'methmi.silva@dsc.edu.lk',
    fullName: 'Methmi Silva',
    admissionNo: 'DSC-2023-4519',
    joinedYear: '2023',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop',
    bio: 'Photographer and designer interested in macro photography, high-contrast black-and-white portraits, and wildlife capturing.',
    roles: ['Senior Photographer', 'Committee Member'],
    gender: 'Female',
    instagramUrl: 'https://instagram.com/methmi_clicks',
    behanceUrl: 'https://behance.net/methmisilva',
    customBannerUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop',
  }
];

export const INITIAL_BOARD: BoardMember[] = [
  {
    id: 'board-1',
    fullName: 'Dhananjaya Damsith',
    roles: ['President', 'Senior Photographer'],
    bio: 'Oversees the entire creative vision, coordinates school photo rosters, sets display exhibition parameters, and hosts workshops.',
    imageUrl: '', // Blank image to showcase the no face default avatar
    order: 1,
    specialAchievement: 'Curator of Annual General Showcase 2026',
    gender: 'Male',
  },
  {
    id: 'board-2',
    fullName: 'Bosilu Niduwara',
    roles: ['Secretary', 'Senior Photographer'],
    bio: 'Maintains administrative operations, logs point sheets, drafts invitations, and coordinates external workshop panels.',
    imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop',
    order: 2,
    specialAchievement: 'Winner of national youth lens showcase 2025',
    gender: 'Male',
  },
  {
    id: 'board-3',
    fullName: 'Chamath Fernando',
    roles: ['Treasurer', 'Senior Photographer'],
    bio: 'Manages the physical logistics, handles camera lens inventories, oversees annual exhibit sponsorships, and runs budgetary allocations.',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
    order: 3,
    specialAchievement: 'Archived 100+ school portfolio moments',
    gender: 'Male',
  },
  {
    id: 'board-4',
    fullName: 'Aravinda Jayasundara',
    roles: ['Chief Editor'],
    bio: 'Controls content curation for the official magazine "Focus", handles post-processing workflows, and administers Photoshop tutorials.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    order: 4,
    specialAchievement: 'Curated 14 full-length photographic logs',
    gender: 'Male',
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'DSCPS Annual Photography Showcase 2026',
    content: 'We are thrilled to announce that standard registrations are now open for the annual photographic showcase. Students can submit up to 3 photographs across landscape, street, security lens, and abstract categories. Submit your entries directly via the photographers corner! Deadline: June 30th.',
    date: '2026-05-18',
    author: 'Bosilu Niduwara (President)',
  },
  {
    id: 'ann-2',
    title: 'DSLR & Manual Exposure Masterclass',
    content: 'A practical, field-based exposure masterclass is scheduled for this Friday at 3:30 PM (Main Auditorium). We will cover absolute aperture controls, shutter speed balancing, and ISO grain optimization. Highly recommended for members and students who wish to get junior photgrapher roles.',
    date: '2026-05-15',
    author: 'Methmi Silva (Senior Photographer)',
  }
];

export const INITIAL_GALLERY: GalleryPhoto[] = [
  {
    id: 'photo-1',
    title: 'Golden Sanctuary',
    description: 'A beautiful morning ray cutting through the Defence Service College central corridors, highlighting early student assemblies in high contrast.',
    imageUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=600&auto=format&fit=crop',
    photographerName: 'Bosilu Niduwara',
    photographerId: 'admin-1',
    uploadedAt: '2026-05-20',
  },
  {
    id: 'photo-2',
    title: 'The Silent Watcher',
    description: 'Breathtaking high-shutter capture of a black eagle surveying the college canopy. Capturing avian precision over the assembly yards.',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop',
    photographerName: 'Methmi Silva',
    photographerId: 'user-3',
    uploadedAt: '2026-05-19',
  },
  {
    id: 'photo-3',
    title: 'Perspective Alignment',
    description: 'A structural study of standard glass reflections, showcasing modern architecture juxtaposing heritage pillars of the Defense grounds.',
    imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=600&auto=format&fit=crop',
    photographerName: 'Aravinda Jayasundara',
    photographerId: 'user-2',
    uploadedAt: '2026-05-17',
  }
];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'art-1',
    title: 'The Science of the Golden Ratio',
    content: `When we look at a photograph, we are unconsciously searching for geometric patterns. The Golden Ratio, or 1:1.618, has been used since antiquity to frame natural landmarks, portraiture alignments, and sculpture highlights.

Implementing the Golden Ratio in Photographic Society Frames:
1. **The Phi Grid**: Similar to the Rule of Thirds, but the lines are much closer to the center, representing a tighter focal lock.
2. **The Fibonacci Spiral**: Ideal for tracking motion—such as sports events or dramatic hallway lines—directing the viewer's gaze from broad surrounds directly into the focal micro-point.

When you pack your camera next, study the intersections of your viewfinder, locate curves, and compose with natural spiral paths!`,
    authorName: 'Aravinda Jayasundara',
    authorId: 'user-2',
    createdAt: '2026-05-18',
  },
  {
    id: 'art-2',
    title: 'Understanding ISO Grain and Sensor Noise',
    content: `High sensitivity is a photographer's secret weapon, but a double-edged sword. In night-time events or inside dim assembly corridors, bumping ISO to 6400 is often necessary, but it introduces heavy chromatic and luminance noise.

How to combat noise while preserving key sharpness in high-contrast prints:
- **Expose to the Right (ETTR)**: Gather as much light as possible in the histogram without clipping highlights. This keeps details above the sensor's noise floor.
- **Prime Lenses**: Utilize fast primes with large maximum apertures (e.g., f/1.8 or f/1.4) instead of pumping sensor electronic gains.

Remember, a little grain is organic and has a timeless cinematic texture, but digital compression noise should be handled with care inside Photoshop and Lightroom.`,
    authorName: 'Aravinda Jayasundara',
    authorId: 'user-2',
    createdAt: '2026-05-14',
  }
];
