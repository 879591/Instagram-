/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'user' | 'moderator' | 'admin';
export type VisibilityType = 'public' | 'followers' | 'private';
export type MediaType = 'image' | 'video' | 'text' | 'shared_post';
export type AspectRatio = '1:1' | '4:5' | '16:9';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  bio: string;
  website: string;
  location: string;
  avatarUrl: string;
  bannerUrl?: string;
  isVerified: boolean;
  isPrivate: boolean;
  isSuspended: boolean;
  role: UserRole;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  reelsCount: number;
  createdAt: string;
}

export interface UserSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  allowStoryReplies: 'everyone' | 'following' | 'off';
  allowMentions: 'everyone' | 'following' | 'off';
  activityStatus: boolean;
  readReceipts: boolean;
  twoFactorEnabled: boolean;
  theme: 'dark' | 'light';
  language: string;
}

export interface PostMedia {
  id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  thumbnailUrl?: string;
  aspectRatio: AspectRatio;
}

export interface Post {
  id: string;
  userId: string;
  author: UserProfile;
  caption: string;
  location?: string;
  visibility: VisibilityType;
  media: PostMedia[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  createdAt: string;
  tags: string[];
  mentions: string[];
}

export interface CommentReply {
  id: string;
  commentId: string;
  userId: string;
  author: UserProfile;
  content: string;
  likesCount: number;
  isLiked?: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  author: UserProfile;
  content: string;
  likesCount: number;
  repliesCount: number;
  replies: CommentReply[];
  isLiked?: boolean;
  createdAt: string;
}

export interface StoryViewerInfo {
  userId: string;
  user: UserProfile;
  viewedAt: string;
}

export interface Story {
  id: string;
  userId: string;
  author: UserProfile;
  mediaUrl?: string;
  mediaType: 'image' | 'video' | 'text';
  textContent?: string;
  backgroundStyle?: string;
  fontStyle?: string;
  durationSeconds: number;
  viewsCount: number;
  viewers: StoryViewerInfo[];
  expiresAt: string;
  createdAt: string;
}

export interface Reel {
  id: string;
  userId: string;
  author: UserProfile;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  soundTitle: string;
  soundArtist: string;
  durationSeconds: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  createdAt: string;
  tags: string[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: UserProfile;
  content: string;
  mediaUrl?: string;
  mediaType?: 'text' | 'image' | 'video' | 'shared_post';
  sharedPost?: Post;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: UserProfile[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

export type NotificationType =
  | 'like_post'
  | 'like_comment'
  | 'comment_post'
  | 'reply_comment'
  | 'new_follower'
  | 'follow_request'
  | 'mention_post'
  | 'mention_comment'
  | 'story_reaction'
  | 'direct_message';

export interface NotificationItem {
  id: string;
  recipientId: string;
  actor: UserProfile;
  type: NotificationType;
  entityId?: string;
  previewText?: string;
  previewMediaUrl?: string;
  isRead: boolean;
  createdAt: string;
  followRequestStatus?: 'pending' | 'accepted' | 'rejected';
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  isPrivate: boolean;
  coverImageUrl?: string;
  postIds: string[];
  createdAt: string;
}

export type ReportCategory =
  | 'spam'
  | 'harassment'
  | 'inappropriate_content'
  | 'inappropriate'
  | 'hate_speech'
  | 'violence'
  | 'misinformation'
  | 'copyright_infringement'
  | 'copyright'
  | 'impersonation'
  | 'other';

export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export interface ReportItem {
  id: string;
  reporterId: string;
  reporter: UserProfile;
  targetType: 'profile' | 'post' | 'reel' | 'comment' | 'message';
  targetId: string;
  category: ReportCategory;
  reason: string;
  status: ReportStatus;
  moderationNotes?: string;
  createdAt: string;
  previewInfo?: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  actionType: string;
  targetType: string;
  targetId: string;
  notes: string;
  timestamp: string;
}

export interface HashtagInfo {
  tag: string;
  postsCount: number;
  trending?: boolean;
}
