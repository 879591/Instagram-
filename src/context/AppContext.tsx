/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserSettings,
  Post,
  Comment,
  Story,
  Reel,
  Conversation,
  Message,
  NotificationItem,
  Collection,
  ReportItem,
  AdminAuditLog,
  VisibilityType,
  AspectRatio,
  ReportCategory,
  ReportStatus,
} from '../types';
import {
  CURRENT_USER,
  OTHER_USERS,
  INITIAL_POSTS,
  INITIAL_STORIES,
  INITIAL_REELS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_COLLECTIONS,
  INITIAL_REPORTS,
  INITIAL_AUDIT_LOGS,
} from '../data/seedData';

export type AppTab =
  | 'home'
  | 'explore'
  | 'create'
  | 'reels'
  | 'profile'
  | 'messages'
  | 'notifications'
  | 'settings'
  | 'admin'
  | 'saved';

interface AppContextType {
  // Navigation & UI State
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  viewingProfileUsername: string | null;
  navigateToProfile: (username: string) => void;
  selectedPostForModal: Post | null;
  setSelectedPostForModal: (post: Post | null) => void;
  activeStoryId: string | null;
  openStoryViewer: (storyId: string) => void;
  closeStoryViewer: () => void;
  activeSearchQuery: string;
  setActiveSearchQuery: (query: string) => void;
  reportModalTarget: { targetType: 'profile' | 'post' | 'reel' | 'comment' | 'message'; targetId: string; title?: string } | null;
  openReportModal: (target: { targetType: 'profile' | 'post' | 'reel' | 'comment' | 'message'; targetId: string; title?: string }) => void;
  closeReportModal: () => void;

  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Auth & Current User
  currentUser: UserProfile | null;
  allUsers: UserProfile[];
  isAuthenticated: boolean;
  login: (identifier: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (displayName: string, username: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUser: (user: UserProfile) => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  checkUsernameAvailable: (username: string) => boolean;

  // Social Graph
  followingIds: string[];
  followersIds: string[];
  followUser: (targetId: string) => void;
  unfollowUser: (targetId: string) => void;
  acceptFollowRequest: (senderId: string) => void;
  declineFollowRequest: (senderId: string) => void;
  removeFollower: (followerId: string) => void;
  blockedUserIds: string[];
  blockUser: (targetId: string) => void;
  unblockUser: (targetId: string) => void;

  // Posts & Interactions
  posts: Post[];
  createPost: (data: {
    caption: string;
    location?: string;
    visibility: VisibilityType;
    media: { mediaUrl: string; mediaType: 'image' | 'video'; aspectRatio: AspectRatio }[];
    tags: string[];
    mentions: string[];
  }) => void;
  deletePost: (postId: string) => void;
  editPost: (postId: string, newCaption: string) => void;
  toggleLikePost: (postId: string) => void;
  toggleSavePost: (postId: string, collectionId?: string) => void;
  commentsByPostId: Record<string, Comment[]>;
  addComment: (postId: string, content: string, parentCommentId?: string) => void;
  deleteComment: (postId: string, commentId: string) => void;
  toggleLikeComment: (postId: string, commentId: string) => void;

  // Stories
  stories: Story[];
  createStory: (data: {
    mediaUrl?: string;
    mediaType: 'image' | 'video' | 'text';
    textContent?: string;
    backgroundStyle?: string;
    fontStyle?: string;
  }) => void;
  viewStory: (storyId: string) => void;
  deleteStory: (storyId: string) => void;

  // Reels
  reels: Reel[];
  createReel: (data: {
    videoUrl: string;
    thumbnailUrl?: string;
    caption: string;
    soundTitle?: string;
    soundArtist?: string;
    tags: string[];
  }) => void;
  toggleLikeReel: (reelId: string) => void;
  toggleSaveReel: (reelId: string) => void;
  recordReelView: (reelId: string) => void;

  // Messaging
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  startConversationWith: (userId: string) => string;
  sendMessage: (conversationId: string, content: string, mediaUrl?: string, mediaType?: 'text' | 'image' | 'video') => void;
  deleteMessage: (conversationId: string, messageId: string) => void;

  // Notifications
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  markAllNotificationsAsRead: () => void;
  markNotificationAsRead: (id: string) => void;

  // Collections & Saved
  collections: Collection[];
  savedPostIds: string[];
  createCollection: (name: string, isPrivate?: boolean) => void;
  deleteCollection: (id: string) => void;
  renameCollection: (id: string, name: string) => void;

  // User Settings
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;

  // Admin & Safety
  reports: ReportItem[];
  auditLogs: AdminAuditLog[];
  submitReport: (data: {
    targetType: 'profile' | 'post' | 'reel' | 'comment' | 'message';
    targetId: string;
    category: ReportCategory;
    reason: string;
    previewInfo?: string;
  }) => void;
  updateReportStatus: (reportId: string, status: ReportStatus, moderationNotes?: string) => void;
  suspendUser: (userId: string) => void;
  restoreUser: (userId: string) => void;
  deleteUser: (userId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'supriya_social_app_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [viewingProfileUsername, setViewingProfileUsername] = useState<string | null>(null);
  const [selectedPostForModal, setSelectedPostForModal] = useState<Post | null>(null);
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [activeSearchQuery, setActiveSearchQuery] = useState<string>('');
  const [reportModalTarget, setReportModalTarget] = useState<{
    targetType: 'profile' | 'post' | 'reel' | 'comment' | 'message';
    targetId: string;
    title?: string;
  } | null>(null);

  // Theme
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Core Data loaded from storage or seed
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(CURRENT_USER);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([CURRENT_USER, ...OTHER_USERS]);
  const [followingIds, setFollowingIds] = useState<string[]>(['usr-02', 'usr-03', 'usr-04', 'usr-06']);
  const [followersIds, setFollowersIds] = useState<string[]>(['usr-02', 'usr-03', 'usr-04']);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [stories, setStories] = useState<Story[]>(INITIAL_STORIES);
  const [reels, setReels] = useState<Reel[]>(INITIAL_REELS);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [messages, setMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [collections, setCollections] = useState<Collection[]>(INITIAL_COLLECTIONS);
  const [savedPostIds, setSavedPostIds] = useState<string[]>(['post-02', 'post-05']);
  const [reports, setReports] = useState<ReportItem[]>(INITIAL_REPORTS);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const [settings, setSettings] = useState<UserSettings>({
    emailNotifications: true,
    pushNotifications: true,
    allowStoryReplies: 'everyone',
    allowMentions: 'everyone',
    activityStatus: true,
    readReceipts: true,
    twoFactorEnabled: false,
    theme: 'dark',
    language: 'en',
  });

  const [commentsByPostId, setCommentsByPostId] = useState<Record<string, Comment[]>>({
    'post-01': [
      {
        id: 'c-01',
        postId: 'post-01',
        userId: 'usr-03',
        author: OTHER_USERS[1],
        content: 'Frame 1 has unbelievable depth! The concrete reflection is pure magic 👏',
        likesCount: 14,
        repliesCount: 1,
        replies: [
          {
            id: 'cr-01',
            commentId: 'c-01',
            userId: 'usr-02',
            author: OTHER_USERS[0],
            content: '@maya_creates Thank you Maya! Caught it right before sunrise.',
            likesCount: 5,
            createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
          },
        ],
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
    ],
    'post-05': [
      {
        id: 'c-02',
        postId: 'post-05',
        userId: 'usr-02',
        author: OTHER_USERS[0],
        content: 'That fog gradation is absolute perfection 👏',
        likesCount: 8,
        repliesCount: 0,
        replies: [],
        createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      },
    ],
  });

  // LocalStorage initialization & hydration
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.currentUser) setCurrentUser(parsed.currentUser);
        if (parsed.allUsers) setAllUsers(parsed.allUsers);
        if (parsed.posts) setPosts(parsed.posts);
        if (parsed.stories) setStories(parsed.stories);
        if (parsed.reels) setReels(parsed.reels);
        if (parsed.followingIds) setFollowingIds(parsed.followingIds);
        if (parsed.followersIds) setFollowersIds(parsed.followersIds);
        if (parsed.blockedUserIds) setBlockedUserIds(parsed.blockedUserIds);
        if (parsed.conversations) setConversations(parsed.conversations);
        if (parsed.messages) setMessages(parsed.messages);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (parsed.collections) setCollections(parsed.collections);
        if (parsed.savedPostIds) setSavedPostIds(parsed.savedPostIds);
        if (parsed.commentsByPostId) setCommentsByPostId(parsed.commentsByPostId);
        if (parsed.reports) setReports(parsed.reports);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.theme) setTheme(parsed.theme);
      }
    } catch (e) {
      console.warn('Error reading from localStorage:', e);
    }
  }, []);

  // Save to LocalStorage on changes
  useEffect(() => {
    try {
      const dataToSave = {
        currentUser,
        allUsers,
        posts,
        stories,
        reels,
        followingIds,
        followersIds,
        blockedUserIds,
        conversations,
        messages,
        notifications,
        collections,
        savedPostIds,
        commentsByPostId,
        reports,
        auditLogs,
        settings,
        theme,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn('Error saving to localStorage:', e);
    }
  }, [
    currentUser,
    allUsers,
    posts,
    stories,
    reels,
    followingIds,
    followersIds,
    blockedUserIds,
    conversations,
    messages,
    notifications,
    collections,
    savedPostIds,
    commentsByPostId,
    reports,
    auditLogs,
    settings,
    theme,
  ]);

  // Apply dark / light class to root document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    setSettings((prev) => ({ ...prev, theme: nextTheme }));
  };

  const navigateToProfile = (username: string) => {
    setViewingProfileUsername(username);
    setActiveTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openStoryViewer = (storyId: string) => {
    setActiveStoryId(storyId);
  };

  const closeStoryViewer = () => {
    setActiveStoryId(null);
  };

  const openReportModal = (target: {
    targetType: 'profile' | 'post' | 'reel' | 'comment' | 'message';
    targetId: string;
    title?: string;
  }) => {
    setReportModalTarget(target);
  };

  const closeReportModal = () => {
    setReportModalTarget(null);
  };

  // Auth Operations
  const login = async (identifier: string, pass: string) => {
    const idClean = identifier.trim().toLowerCase();
    const user = allUsers.find(
      (u) => u.username.toLowerCase() === idClean || u.email.toLowerCase() === idClean
    );
    if (!user) {
      return { success: false, error: 'User not found. Try @priyasharma or sign up.' };
    }
    if (user.isSuspended) {
      return { success: false, error: 'This account has been suspended by administration.' };
    }
    setCurrentUser(user);
    return { success: true };
  };

  const signup = async (displayName: string, username: string, email: string, pass: string) => {
    const cleanUser = username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '');
    if (cleanUser.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters.' };
    }
    if (allUsers.some((u) => u.username.toLowerCase() === cleanUser)) {
      return { success: false, error: 'Username is already taken. Please choose another.' };
    }
    if (allUsers.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      return { success: false, error: 'Email is already registered. Please login.' };
    }

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      username: cleanUser,
      displayName: displayName.trim(),
      email: email.trim(),
      bio: 'New creator on Supriya ✨ Ready to Connect. Create. Share.',
      website: '',
      location: '',
      avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + (allUsers.length % 100)}?auto=format&fit=crop&w=400&q=80`,
      isVerified: false,
      isPrivate: false,
      isSuspended: false,
      role: 'user',
      followersCount: 0,
      followingCount: 1, // Auto follows Priya Sharma (welcome)
      postsCount: 0,
      reelsCount: 0,
      createdAt: new Date().toISOString(),
    };

    setAllUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    setFollowingIds((prev) => [...prev, CURRENT_USER.id]);

    // Send welcome notification
    const welcomeNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipientId: newUser.id,
      actor: CURRENT_USER,
      type: 'new_follower',
      previewText: 'welcomed you to Supriya! Start sharing your stories and photos.',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [welcomeNotif, ...prev]);

    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchUser = (user: UserProfile) => {
    setCurrentUser(user);
    if (viewingProfileUsername === user.username) {
      setViewingProfileUsername(null);
    }
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    setAllUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    // Also update author references in current user's posts
    setPosts((prev) =>
      prev.map((p) => (p.userId === updated.id ? { ...p, author: updated } : p))
    );
  };

  const checkUsernameAvailable = (userToCheck: string) => {
    const clean = userToCheck.trim().toLowerCase();
    if (!clean || clean.length < 3) return false;
    if (currentUser && currentUser.username.toLowerCase() === clean) return true;
    return !allUsers.some((u) => u.username.toLowerCase() === clean);
  };

  // Follow System
  const followUser = (targetId: string) => {
    if (!currentUser || targetId === currentUser.id) return;
    const targetUser = allUsers.find((u) => u.id === targetId);
    if (!targetUser) return;

    if (targetUser.isPrivate) {
      // Private profile creates a follow request notification
      const requestNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        recipientId: targetId,
        actor: currentUser,
        type: 'follow_request',
        previewText: 'requested to follow you',
        isRead: false,
        followRequestStatus: 'pending',
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [requestNotif, ...prev]);
    } else {
      setFollowingIds((prev) => [...prev, targetId]);
      // Update counts
      setAllUsers((prev) =>
        prev.map((u) => {
          if (u.id === targetId) return { ...u, followersCount: u.followersCount + 1 };
          if (u.id === currentUser.id) return { ...u, followingCount: u.followingCount + 1 };
          return u;
        })
      );
      if (currentUser) {
        setCurrentUser((prev) =>
          prev ? { ...prev, followingCount: prev.followingCount + 1 } : null
        );
      }
      // Trigger notification
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        recipientId: targetId,
        actor: currentUser,
        type: 'new_follower',
        previewText: 'started following you',
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  const unfollowUser = (targetId: string) => {
    if (!currentUser) return;
    setFollowingIds((prev) => prev.filter((id) => id !== targetId));
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === targetId) return { ...u, followersCount: Math.max(0, u.followersCount - 1) };
        if (u.id === currentUser.id)
          return { ...u, followingCount: Math.max(0, u.followingCount - 1) };
        return u;
      })
    );
    setCurrentUser((prev) =>
      prev ? { ...prev, followingCount: Math.max(0, prev.followingCount - 1) } : null
    );
  };

  const acceptFollowRequest = (senderId: string) => {
    if (!currentUser) return;
    setFollowersIds((prev) => (prev.includes(senderId) ? prev : [...prev, senderId]));
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) return { ...u, followersCount: u.followersCount + 1 };
        if (u.id === senderId) return { ...u, followingCount: u.followingCount + 1 };
        return u;
      })
    );
    setCurrentUser((prev) =>
      prev ? { ...prev, followersCount: prev.followersCount + 1 } : null
    );
    // Update notification status
    setNotifications((prev) =>
      prev.map((n) =>
        n.actor.id === senderId && n.type === 'follow_request'
          ? { ...n, followRequestStatus: 'accepted' }
          : n
      )
    );
  };

  const declineFollowRequest = (senderId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.actor.id === senderId && n.type === 'follow_request'
          ? { ...n, followRequestStatus: 'rejected' }
          : n
      )
    );
  };

  const removeFollower = (followerId: string) => {
    if (!currentUser) return;
    setFollowersIds((prev) => prev.filter((id) => id !== followerId));
    setCurrentUser((prev) =>
      prev ? { ...prev, followersCount: Math.max(0, prev.followersCount - 1) } : null
    );
  };

  const blockUser = (targetId: string) => {
    if (!currentUser || targetId === currentUser.id) return;
    setBlockedUserIds((prev) => (prev.includes(targetId) ? prev : [...prev, targetId]));
    unfollowUser(targetId);
  };

  const unblockUser = (targetId: string) => {
    setBlockedUserIds((prev) => prev.filter((id) => id !== targetId));
  };

  // Posts System
  const createPost = (data: {
    caption: string;
    location?: string;
    visibility: VisibilityType;
    media: { mediaUrl: string; mediaType: 'image' | 'video'; aspectRatio: AspectRatio }[];
    tags: string[];
    mentions: string[];
  }) => {
    if (!currentUser) return;
    const newPost: Post = {
      id: `post-${Date.now()}`,
      userId: currentUser.id,
      author: currentUser,
      caption: data.caption,
      location: data.location || '',
      visibility: data.visibility,
      media: data.media.map((m, idx) => ({
        id: `pm-${Date.now()}-${idx}`,
        mediaUrl: m.mediaUrl,
        mediaType: m.mediaType,
        aspectRatio: m.aspectRatio,
      })),
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      savesCount: 0,
      isLiked: false,
      isSaved: false,
      createdAt: new Date().toISOString(),
      tags: data.tags,
      mentions: data.mentions,
    };

    setPosts((prev) => [newPost, ...prev]);
    setCurrentUser((prev) => (prev ? { ...prev, postsCount: prev.postsCount + 1 } : null));
    setAllUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, postsCount: u.postsCount + 1 } : u))
    );

    // Notify mentioned users
    data.mentions.forEach((mentionUsername) => {
      const clean = mentionUsername.replace('@', '').toLowerCase();
      const mentionedUser = allUsers.find((u) => u.username.toLowerCase() === clean);
      if (mentionedUser && mentionedUser.id !== currentUser.id) {
        const notif: NotificationItem = {
          id: `notif-${Date.now()}-${clean}`,
          recipientId: mentionedUser.id,
          actor: currentUser,
          type: 'mention_post',
          entityId: newPost.id,
          previewText: `mentioned you in a post: "${data.caption.slice(0, 45)}..."`,
          previewMediaUrl: data.media[0]?.mediaUrl,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        setNotifications((prev) => [notif, ...prev]);
      }
    });

    setActiveTab('home');
  };

  const deletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    if (currentUser) {
      setCurrentUser((prev) =>
        prev ? { ...prev, postsCount: Math.max(0, prev.postsCount - 1) } : null
      );
    }
  };

  const editPost = (postId: string, newCaption: string) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, caption: newCaption } : p)));
    if (selectedPostForModal && selectedPostForModal.id === postId) {
      setSelectedPostForModal((prev) => (prev ? { ...prev, caption: newCaption } : null));
    }
  };

  const toggleLikePost = (postId: string) => {
    if (!currentUser) return;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextLiked = !p.isLiked;
          const nextCount = nextLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1);

          if (nextLiked && p.author.id !== currentUser.id) {
            const notif: NotificationItem = {
              id: `notif-${Date.now()}`,
              recipientId: p.author.id,
              actor: currentUser,
              type: 'like_post',
              entityId: p.id,
              previewText: 'liked your post',
              previewMediaUrl: p.media[0]?.mediaUrl,
              isRead: false,
              createdAt: new Date().toISOString(),
            };
            setNotifications((n) => [notif, ...n]);
          }
          return { ...p, isLiked: nextLiked, likesCount: nextCount };
        }
        return p;
      })
    );

    if (selectedPostForModal && selectedPostForModal.id === postId) {
      setSelectedPostForModal((prev) =>
        prev
          ? {
              ...prev,
              isLiked: !prev.isLiked,
              likesCount: !prev.isLiked ? prev.likesCount + 1 : Math.max(0, prev.likesCount - 1),
            }
          : null
      );
    }
  };

  const toggleSavePost = (postId: string, collectionId?: string) => {
    if (!currentUser) return;
    const isCurrentlySaved = savedPostIds.includes(postId);
    if (isCurrentlySaved) {
      setSavedPostIds((prev) => prev.filter((id) => id !== postId));
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, isSaved: false, savesCount: Math.max(0, p.savesCount - 1) } : p
        )
      );
      // Remove from all collections
      setCollections((prev) =>
        prev.map((col) => ({
          ...col,
          postIds: col.postIds.filter((id) => id !== postId),
        }))
      );
    } else {
      setSavedPostIds((prev) => [postId, ...prev]);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, isSaved: true, savesCount: p.savesCount + 1 } : p))
      );
      // Add to default All Saved collection and optional custom collection
      setCollections((prev) =>
        prev.map((col) => {
          if (col.name === 'All Saved' || col.id === collectionId) {
            return {
              ...col,
              postIds: col.postIds.includes(postId) ? col.postIds : [postId, ...col.postIds],
            };
          }
          return col;
        })
      );
    }
  };

  // Comments System
  const addComment = (postId: string, content: string, parentCommentId?: string) => {
    if (!currentUser || !content.trim()) return;
    const post = posts.find((p) => p.id === postId);

    if (parentCommentId) {
      // Add reply to existing comment
      const newReply = {
        id: `cr-${Date.now()}`,
        commentId: parentCommentId,
        userId: currentUser.id,
        author: currentUser,
        content: content.trim(),
        likesCount: 0,
        isLiked: false,
        createdAt: new Date().toISOString(),
      };

      setCommentsByPostId((prev) => {
        const postComments = prev[postId] || [];
        return {
          ...prev,
          [postId]: postComments.map((c) =>
            c.id === parentCommentId
              ? {
                  ...c,
                  repliesCount: c.repliesCount + 1,
                  replies: [...c.replies, newReply],
                }
              : c
          ),
        };
      });
    } else {
      // Top-level comment
      const newComment: Comment = {
        id: `c-${Date.now()}`,
        postId,
        userId: currentUser.id,
        author: currentUser,
        content: content.trim(),
        likesCount: 0,
        repliesCount: 0,
        replies: [],
        isLiked: false,
        createdAt: new Date().toISOString(),
      };

      setCommentsByPostId((prev) => ({
        ...prev,
        [postId]: [newComment, ...(prev[postId] || [])],
      }));
    }

    // Increment post comment count
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p))
    );
    if (selectedPostForModal && selectedPostForModal.id === postId) {
      setSelectedPostForModal((prev) =>
        prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : null
      );
    }

    // Trigger notification to author
    if (post && post.author.id !== currentUser.id) {
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        recipientId: post.author.id,
        actor: currentUser,
        type: 'comment_post',
        entityId: postId,
        previewText: `commented: "${content.slice(0, 45)}"`,
        previewMediaUrl: post.media[0]?.mediaUrl,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((n) => [notif, ...n]);
    }
  };

  const deleteComment = (postId: string, commentId: string) => {
    setCommentsByPostId((prev) => ({
      ...prev,
      [postId]: (prev[postId] || []).filter((c) => c.id !== commentId),
    }));
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, commentsCount: Math.max(0, p.commentsCount - 1) } : p
      )
    );
  };

  const toggleLikeComment = (postId: string, commentId: string) => {
    setCommentsByPostId((prev) => {
      const list = prev[postId] || [];
      return {
        ...prev,
        [postId]: list.map((c) => {
          if (c.id === commentId) {
            const next = !c.isLiked;
            return {
              ...c,
              isLiked: next,
              likesCount: next ? c.likesCount + 1 : Math.max(0, c.likesCount - 1),
            };
          }
          return c;
        }),
      };
    });
  };

  // Stories System
  const createStory = (data: {
    mediaUrl?: string;
    mediaType: 'image' | 'video' | 'text';
    textContent?: string;
    backgroundStyle?: string;
    fontStyle?: string;
  }) => {
    if (!currentUser) return;
    const newStory: Story = {
      id: `story-${Date.now()}`,
      userId: currentUser.id,
      author: currentUser,
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType,
      textContent: data.textContent,
      backgroundStyle: data.backgroundStyle || 'gradient_rose',
      fontStyle: data.fontStyle || 'modern',
      durationSeconds: data.mediaType === 'text' ? 6 : 5,
      viewsCount: 0,
      viewers: [],
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24h expiration
      createdAt: new Date().toISOString(),
    };
    setStories((prev) => [newStory, ...prev]);
  };

  const viewStory = (storyId: string) => {
    if (!currentUser) return;
    setStories((prev) =>
      prev.map((s) => {
        if (s.id === storyId) {
          const alreadyViewed = s.viewers.some((v) => v.userId === currentUser.id);
          if (!alreadyViewed) {
            return {
              ...s,
              viewsCount: s.viewsCount + 1,
              viewers: [
                ...s.viewers,
                {
                  userId: currentUser.id,
                  user: currentUser,
                  viewedAt: new Date().toISOString(),
                },
              ],
            };
          }
        }
        return s;
      })
    );
  };

  const deleteStory = (storyId: string) => {
    setStories((prev) => prev.filter((s) => s.id !== storyId));
    if (activeStoryId === storyId) {
      closeStoryViewer();
    }
  };

  // Reels System
  const createReel = (data: {
    videoUrl: string;
    thumbnailUrl?: string;
    caption: string;
    soundTitle?: string;
    soundArtist?: string;
    tags: string[];
  }) => {
    if (!currentUser) return;
    const newReel: Reel = {
      id: `reel-${Date.now()}`,
      userId: currentUser.id,
      author: currentUser,
      videoUrl: data.videoUrl,
      thumbnailUrl:
        data.thumbnailUrl ||
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      caption: data.caption,
      soundTitle: data.soundTitle || 'Original Audio',
      soundArtist: data.soundArtist || currentUser.displayName,
      durationSeconds: 15.0,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      viewsCount: 1,
      isLiked: false,
      isSaved: false,
      createdAt: new Date().toISOString(),
      tags: data.tags,
    };

    setReels((prev) => [newReel, ...prev]);
    setCurrentUser((prev) => (prev ? { ...prev, reelsCount: prev.reelsCount + 1 } : null));
    setActiveTab('reels');
  };

  const toggleLikeReel = (reelId: string) => {
    setReels((prev) =>
      prev.map((r) => {
        if (r.id === reelId) {
          const next = !r.isLiked;
          return {
            ...r,
            isLiked: next,
            likesCount: next ? r.likesCount + 1 : Math.max(0, r.likesCount - 1),
          };
        }
        return r;
      })
    );
  };

  const toggleSaveReel = (reelId: string) => {
    setReels((prev) =>
      prev.map((r) => (r.id === reelId ? { ...r, isSaved: !r.isSaved } : r))
    );
  };

  const recordReelView = (reelId: string) => {
    setReels((prev) =>
      prev.map((r) => (r.id === reelId ? { ...r, viewsCount: r.viewsCount + 1 } : r))
    );
  };

  // Messaging System
  const startConversationWith = (targetUserId: string): string => {
    if (!currentUser) return '';
    // Check if conversation already exists
    const existing = conversations.find((c) =>
      c.participants.some((p) => p.id === targetUserId)
    );
    if (existing) {
      setActiveConversationId(existing.id);
      setActiveTab('messages');
      return existing.id;
    }

    const targetUser = allUsers.find((u) => u.id === targetUserId);
    if (!targetUser) return '';

    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      participants: [currentUser, targetUser],
      unreadCount: 0,
      updatedAt: new Date().toISOString(),
    };

    setConversations((prev) => [newConv, ...prev]);
    setMessages((prev) => ({ ...prev, [newConv.id]: [] }));
    setActiveConversationId(newConv.id);
    setActiveTab('messages');
    return newConv.id;
  };

  const sendMessage = (
    conversationId: string,
    content: string,
    mediaUrl?: string,
    mediaType: 'text' | 'image' | 'video' = 'text'
  ) => {
    if (!currentUser || (!content.trim() && !mediaUrl)) return;
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: currentUser.id,
      sender: currentUser,
      content: content.trim(),
      mediaUrl,
      mediaType,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: newMsg,
              updatedAt: new Date().toISOString(),
            }
          : c
      )
    );

    // Realistic auto-reply simulation if messaging one of the other demo users
    const conv = conversations.find((c) => c.id === conversationId);
    const otherParticipant = conv?.participants.find((p) => p.id !== currentUser.id);

    if (otherParticipant && otherParticipant.id !== CURRENT_USER.id) {
      setTimeout(() => {
        const replyResponses = [
          "That's awesome! Thanks for reaching out ✨",
          "Love this perspective! Totally agree.",
          "Great chatting with you! Let's stay connected.",
          "Excited to collaborate soon 📸",
        ];
        const randomReply = replyResponses[Math.floor(Math.random() * replyResponses.length)];
        const replyMsg: Message = {
          id: `msg-${Date.now()}-reply`,
          conversationId,
          senderId: otherParticipant.id,
          sender: otherParticipant,
          content: randomReply,
          isRead: false,
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => ({
          ...prev,
          [conversationId]: [...(prev[conversationId] || []), replyMsg],
        }));

        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  lastMessage: replyMsg,
                  updatedAt: new Date().toISOString(),
                }
              : c
          )
        );
      }, 2500);
    }
  };

  const deleteMessage = (conversationId: string, messageId: string) => {
    setMessages((prev) => ({
      ...prev,
      [conversationId]: (prev[conversationId] || []).filter((m) => m.id !== messageId),
    }));
  };

  // Notifications
  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  // Collections
  const createCollection = (name: string, isPrivate: boolean = true) => {
    if (!currentUser || !name.trim()) return;
    const newCol: Collection = {
      id: `col-${Date.now()}`,
      userId: currentUser.id,
      name: name.trim(),
      isPrivate,
      postIds: [],
      createdAt: new Date().toISOString(),
    };
    setCollections((prev) => [...prev, newCol]);
  };

  const deleteCollection = (id: string) => {
    setCollections((prev) => prev.filter((c) => c.id !== id));
  };

  const renameCollection = (id: string, name: string) => {
    setCollections((prev) => prev.map((c) => (c.id === id ? { ...c, name: name.trim() } : c)));
  };

  // Settings
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Safety & Moderation
  const submitReport = (data: {
    targetType: 'profile' | 'post' | 'reel' | 'comment' | 'message';
    targetId: string;
    category: ReportCategory;
    reason: string;
    previewInfo?: string;
  }) => {
    if (!currentUser) return;
    const newReport: ReportItem = {
      id: `rep-${Date.now()}`,
      reporterId: currentUser.id,
      reporter: currentUser,
      targetType: data.targetType,
      targetId: data.targetId,
      category: data.category,
      reason: data.reason,
      status: 'pending',
      previewInfo: data.previewInfo,
      createdAt: new Date().toISOString(),
    };
    setReports((prev) => [newReport, ...prev]);
    closeReportModal();
  };

  const updateReportStatus = (
    reportId: string,
    status: ReportStatus,
    moderationNotes?: string
  ) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status, moderationNotes } : r))
    );

    if (currentUser) {
      const newAudit: AdminAuditLog = {
        id: `aud-${Date.now()}`,
        adminId: currentUser.id,
        adminName: currentUser.displayName,
        actionType: `REPORT_${status.toUpperCase()}`,
        targetType: 'report',
        targetId: reportId,
        notes: moderationNotes || `Report ${reportId} marked as ${status}`,
        timestamp: new Date().toISOString(),
      };
      setAuditLogs((prev) => [newAudit, ...prev]);
    }
  };

  const suspendUser = (userId: string) => {
    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isSuspended: true } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, isSuspended: true } : null));
    }
    if (currentUser) {
      const newAudit: AdminAuditLog = {
        id: `aud-${Date.now()}`,
        adminId: currentUser.id,
        adminName: currentUser.displayName,
        actionType: 'SUSPEND_USER',
        targetType: 'profile',
        targetId: userId,
        notes: `User suspended for community guidelines violation`,
        timestamp: new Date().toISOString(),
      };
      setAuditLogs((prev) => [newAudit, ...prev]);
    }
  };

  const restoreUser = (userId: string) => {
    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isSuspended: false } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, isSuspended: false } : null));
    }
  };

  const deleteUser = (userId: string) => {
    setAllUsers((prev) => prev.filter((u) => u.id !== userId));
    setPosts((prev) => prev.filter((p) => p.userId !== userId));
    setReels((prev) => prev.filter((r) => r.userId !== userId));
    setStories((prev) => prev.filter((s) => s.userId !== userId));
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        viewingProfileUsername,
        navigateToProfile,
        selectedPostForModal,
        setSelectedPostForModal,
        activeStoryId,
        openStoryViewer,
        closeStoryViewer,
        activeSearchQuery,
        setActiveSearchQuery,
        reportModalTarget,
        openReportModal,
        closeReportModal,
        theme,
        toggleTheme,
        currentUser,
        allUsers,
        isAuthenticated: !!currentUser,
        login,
        signup,
        logout,
        switchUser,
        updateProfile,
        checkUsernameAvailable,
        followingIds,
        followersIds,
        followUser,
        unfollowUser,
        acceptFollowRequest,
        declineFollowRequest,
        removeFollower,
        blockedUserIds,
        blockUser,
        unblockUser,
        posts,
        createPost,
        deletePost,
        editPost,
        toggleLikePost,
        toggleSavePost,
        commentsByPostId,
        addComment,
        deleteComment,
        toggleLikeComment,
        stories,
        createStory,
        viewStory,
        deleteStory,
        reels,
        createReel,
        toggleLikeReel,
        toggleSaveReel,
        recordReelView,
        conversations,
        messages,
        activeConversationId,
        setActiveConversationId,
        startConversationWith,
        sendMessage,
        deleteMessage,
        notifications,
        unreadNotificationsCount,
        markAllNotificationsAsRead,
        markNotificationAsRead,
        collections,
        savedPostIds,
        createCollection,
        deleteCollection,
        renameCollection,
        settings,
        updateSettings,
        reports,
        auditLogs,
        submitReport,
        updateReportStatus,
        suspendUser,
        restoreUser,
        deleteUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
