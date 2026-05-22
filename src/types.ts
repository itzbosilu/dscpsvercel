/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RoleName =
  | 'President'
  | 'Secretary'
  | 'Treasurer'
  | 'Asst. President'
  | 'Asst. Secretary'
  | 'Asst. Treasurer'
  | 'Coordinator'
  | 'Exec. Member'
  | 'Committee Member'
  | 'Photographer'
  | 'Senior Photographer'
  | 'Editor'
  | 'Chief Editor'
  | 'Senior Editor'
  | 'Member'
  | 'Senior Member'
  | 'Student';

// Allowed privileges
export type PrivilegeKey =
  | 'manage_members'      // Assign roles to users
  | 'manage_privileges'   // Modify what roles give which privileges
  | 'customize_site'      // Update logos, descriptions, announcements
  | 'editors_corner'      // Access and posts to editor's corner
  | 'photographers_corner'// Access and submit photos to photographer's corner
  | 'view_corners_all'   // View both corners even if not editor/photographer
  | 'view_student_performance'; // Admin-assigned separate permission to inspect student history

export interface RolePrivilegeConfig {
  roleName: RoleName;
  grantedPrivileges: PrivilegeKey[];
}

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  admissionNo: string;
  joinedYear: string;
  avatarUrl: string;
  bio: string;
  roles: RoleName[];
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  customBannerUrl?: string;
  instagramUrl?: string;
  behanceUrl?: string;
  points?: number; // Accumulated points for editing/attending
  photographerPoints?: number;
  editorPoints?: number;
}

export interface Workload {
  id: string;
  title: string;
  description: string;
  assignedToId: string;
  assignedToName: string;
  assignedById: string;
  assignedByName: string;
  deadline: string; // YYYY-MM-DD
  pts: number;
  status: 'pending' | 'submitted' | 'completed' | 'abandoned';
  submissionUrl?: string;
  submissionNotes?: string;
  submittedAt?: string;
  type?: 'photography' | 'editing';
}

export interface BoardMember {
  id: string;
  fullName: string;
  roles: RoleName[];
  bio: string;
  imageUrl: string;
  order: number; // For rendering order
  specialAchievement?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
}

export interface GalleryPhoto {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  photographerName: string;
  photographerId: string;
  uploadedAt: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorId: string;
  createdAt: string;
}

export interface SiteConfig {
  domain: string;
  schoolName: string;
  societyName: string;
  tagline: string;
  aboutText: string;
  schoolLogo: string; // Base64 or standard asset/placeholder svg URL
  clubLogo: string;   // Base64 or standard asset/placeholder svg URL
  heroImageUrl: string;
  noticeBoardEnabled: boolean;
}
