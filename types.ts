
export type UserRole = 'user' | 'subscriber' | 'admin' | 'super_admin' | 'developer';

export interface UserProfile {
  name: string;
  age: number;
  weight: number;
  periodStatus: 'منظم' | 'نامنظم' | 'قطع شده (یائسه)';
  dominantSymptoms: string[];
  role: UserRole;
  isBanned?: boolean;
  maintenanceStatus?: 'system' | 'enabled' | 'disabled'; // system=Global, enabled=Force On, disabled=Force Off (Bypass)
  phoneNumber?: string;
  email?: string;
}

export interface SymptomRecord {
  id: number;
  date: string; // ISO date
  scores: Record<number, number>; // questionId: score (0-4)
  note: string;
}

export interface Reply {
  id: string;
  authorAlias: string;
  authorId: string;
  content: string;
  timestamp: string;
}

export interface ForumPost {
  id: number;
  topic: string;
  content: string;
  likes: number;
  likedBy: string[]; // Array of UserIDs
  timestamp: string;
  authorAlias: string; // Anonymous
  authorId?: string; // For admin moderation/ownership
  replies: number;
  repliesList?: Reply[];
}

export interface Report {
  id: string;
  postId: number;
  reporterId: string;
  reportedUserId?: string; // ID of the post author
  reason: string;
  timestamp: string;
  postContentSnippet: string;
  status: 'pending' | 'resolved' | 'dismissed';
}

export interface DailyTip {
  title: string;
  content: string;
  type: 'health' | 'motivational';
}

export interface LibraryItem {
  id: number;
  title: string;
  author: string;
  type: 'podcast' | 'article';
  url: string; // Real URL for audio file or article link
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  target: 'all' | string; // 'all' or specific userId
}

export enum Tab {
  DASHBOARD = 'dashboard',
  TRACKER = 'tracker',
  COMMUNITY = 'community',
  LIBRARY = 'library',
  PROFILE = 'profile',
  ADMIN = 'admin',
}

export interface ChartDataPoint {
  name: string;
  total: number;
  somatic: number;
  psychological: number;
  urogenital: number;
}
