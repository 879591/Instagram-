/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Grid,
  Film,
  Bookmark,
  Lock,
  Globe,
  MapPin,
  CheckCircle,
  Settings as SettingsIcon,
  ShieldAlert,
  Share2,
  MessageCircle,
  UserPlus,
  UserCheck,
  Flag,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EditProfileModal } from './EditProfileModal';
import { FollowersListModal } from './FollowersListModal';

const SAMPLE_HIGHLIGHTS = [
  { id: 'h1', title: 'Kyoto ⛩️', thumb: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=300&q=80' },
  { id: 'h2', title: 'Studio 🎙️', thumb: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=300&q=80' },
  { id: 'h3', title: 'Aesthetic 🎨', thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80' },
  { id: 'h4', title: 'Gear 📷', thumb: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80' },
];

export const ProfileView: React.FC = () => {
  const {
    viewingProfileUsername,
    currentUser,
    allUsers,
    posts,
    reels,
    savedPostIds,
    followingIds,
    followUser,
    unfollowUser,
    startConversationWith,
    setSelectedPostForModal,
    setActiveTab,
    stories,
    openStoryViewer,
    openReportModal,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'posts' | 'reels' | 'saved'>('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [followModalMode, setFollowModalMode] = useState<'followers' | 'following' | null>(null);

  // Resolve user to display
  const targetUser = viewingProfileUsername
    ? allUsers.find(
        (u) => u.username.toLowerCase() === viewingProfileUsername.toLowerCase()
      ) || currentUser
    : currentUser;

  if (!targetUser) {
    return (
      <div className="py-20 text-center text-zinc-400">
        <p>User profile not found.</p>
        <button
          onClick={() => setActiveTab('home')}
          className="mt-4 px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-semibold"
        >
          Return Home
        </button>
      </div>
    );
  }

  const isSelf = currentUser?.id === targetUser.id;
  const isFollowing = followingIds.includes(targetUser.id);

  // Check if target user has an active story
  const now = new Date().getTime();
  const activeUserStory = stories.find(
    (s) => s.userId === targetUser.id && new Date(s.expiresAt).getTime() > now
  );

  // Filter content
  const userPosts = posts.filter((p) => p.userId === targetUser.id);
  const userReels = reels.filter((r) => r.userId === targetUser.id);
  const userSavedPosts = posts.filter((p) => savedPostIds.includes(p.id));

  const handleShareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: `${targetUser.displayName} (@${targetUser.username}) on Supriya`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Profile link copied to clipboard! ✨');
    }
  };

  return (
    <div id="profile-view" className="w-full max-w-3xl mx-auto px-4 py-6 pb-20 md:pb-8 space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Avatar with optional radiant story ring */}
        <div className="relative shrink-0">
          <div
            onClick={() => {
              if (activeUserStory) {
                openStoryViewer(activeUserStory.id);
              } else if (isSelf) {
                setIsEditModalOpen(true);
              }
            }}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 cursor-pointer transition transform active:scale-95 ${
              activeUserStory
                ? 'bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shadow-lg shadow-rose-950/40'
                : 'bg-zinc-800'
            }`}
          >
            <img
              src={targetUser.avatarUrl}
              alt={targetUser.displayName}
              className="w-full h-full rounded-full object-cover border-2 border-zinc-950"
              referrerPolicy="no-referrer"
            />
          </div>

          {targetUser.role === 'admin' && (
            <div
              className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-rose-600 text-[10px] font-black text-white ring-2 ring-zinc-950 flex items-center gap-0.5"
              title="Supriya Verified Administrator"
            >
              <ShieldAlert className="w-3 h-3" />
              <span>ADMIN</span>
            </div>
          )}
        </div>

        {/* User Info & Stats */}
        <div className="flex-1 space-y-3 min-w-0 w-full">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg sm:text-xl font-extrabold text-zinc-100 truncate">
                  {targetUser.displayName}
                </h1>
                {targetUser.isVerified && (
                  <CheckCircle className="w-4 h-4 text-rose-500 fill-rose-500/20 shrink-0" />
                )}
                {targetUser.isPrivate && (
                  <Lock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                )}
              </div>
              <span className="text-xs text-zinc-400 block">@{targetUser.username}</span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {isSelf ? (
                <>
                  <button
                    id="edit-profile-btn"
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                    title="Account Settings"
                  >
                    <SettingsIcon className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() =>
                      isFollowing ? unfollowUser(targetUser.id) : followUser(targetUser.id)
                    }
                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                      isFollowing
                        ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                        : 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md shadow-rose-950/40 hover:opacity-95'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => startConversationWith(targetUser.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 flex items-center gap-1.5 transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Message</span>
                  </button>

                  <button
                    onClick={() =>
                      openReportModal({
                        targetType: 'profile',
                        targetId: targetUser.id,
                        title: `@${targetUser.username}`,
                      })
                    }
                    className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-rose-400 transition"
                    title="Report Account"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                </>
              )}

              <button
                onClick={handleShareProfile}
                className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                title="Share profile"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Counts Row */}
          <div className="flex items-center gap-6 text-xs pt-1">
            <div>
              <span className="font-extrabold text-zinc-100">{userPosts.length}</span>{' '}
              <span className="text-zinc-400">posts</span>
            </div>
            <button
              onClick={() => setFollowModalMode('followers')}
              className="hover:underline text-left"
            >
              <span className="font-extrabold text-zinc-100">{targetUser.followersCount}</span>{' '}
              <span className="text-zinc-400">followers</span>
            </button>
            <button
              onClick={() => setFollowModalMode('following')}
              className="hover:underline text-left"
            >
              <span className="font-extrabold text-zinc-100">{targetUser.followingCount}</span>{' '}
              <span className="text-zinc-400">following</span>
            </button>
          </div>

          {/* Bio & Details */}
          <div className="space-y-1 text-xs leading-relaxed text-zinc-200">
            <p className="whitespace-pre-line">{targetUser.bio}</p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-zinc-400">
              {targetUser.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-500" />
                  <span>{targetUser.location}</span>
                </div>
              )}
              {targetUser.website && (
                <a
                  href={targetUser.website}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-1 text-rose-400 hover:underline font-semibold"
                >
                  <Globe className="w-3 h-3" />
                  <span>{targetUser.website.replace(/^https?:\/\//, '')}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Story Highlights Circles */}
      <div className="space-y-2 pt-2 border-t border-zinc-800/80">
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
          Featured Highlights
        </span>
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
          {SAMPLE_HIGHLIGHTS.map((hl) => (
            <div key={hl.id} className="flex flex-col items-center gap-1 cursor-pointer group">
              <div className="w-14 h-14 rounded-full p-0.5 border-2 border-zinc-700 group-hover:border-rose-500 transition">
                <img
                  src={hl.thumb}
                  alt={hl.title}
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-[11px] font-medium text-zinc-300 max-w-[60px] truncate">
                {hl.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Content Tabs */}
      <div className="border-t border-zinc-800">
        <div className="flex items-center justify-center gap-10">
          <button
            onClick={() => setActiveSubTab('posts')}
            className={`flex items-center gap-1.5 py-3 text-xs font-semibold uppercase tracking-wider border-t-2 -mt-px transition ${
              activeSubTab === 'posts'
                ? 'border-rose-500 text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Posts</span>
          </button>

          <button
            onClick={() => setActiveSubTab('reels')}
            className={`flex items-center gap-1.5 py-3 text-xs font-semibold uppercase tracking-wider border-t-2 -mt-px transition ${
              activeSubTab === 'reels'
                ? 'border-rose-500 text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Reels</span>
          </button>

          {isSelf && (
            <button
              onClick={() => setActiveSubTab('saved')}
              className={`flex items-center gap-1.5 py-3 text-xs font-semibold uppercase tracking-wider border-t-2 -mt-px transition ${
                activeSubTab === 'saved'
                  ? 'border-rose-500 text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Saved</span>
            </button>
          )}
        </div>

        {/* Tab Panels */}
        {activeSubTab === 'posts' && (
          <div className="pt-2">
            {userPosts.length === 0 ? (
              <div className="py-16 text-center text-zinc-500 text-xs">
                No posts shared yet.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1 sm:gap-2">
                {userPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPostForModal(post)}
                    className="relative aspect-square bg-zinc-900 overflow-hidden cursor-pointer group"
                  >
                    <img
                      src={post.media[0]?.mediaUrl}
                      alt={post.caption}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    {post.media.length > 1 && (
                      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/60 text-[10px] font-bold text-white">
                        +{post.media.length}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'reels' && (
          <div className="pt-2">
            {userReels.length === 0 ? (
              <div className="py-16 text-center text-zinc-500 text-xs">
                No reels created yet.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
                {userReels.map((reel) => (
                  <div
                    key={reel.id}
                    onClick={() => setActiveTab('reels')}
                    className="relative aspect-[9/16] rounded-xl bg-zinc-900 overflow-hidden cursor-pointer group shadow-xs"
                  >
                    <img
                      src={reel.thumbnailUrl}
                      alt={reel.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[11px] font-bold text-white bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-full">
                      <Film className="w-3 h-3 text-rose-400" />
                      <span>{reel.viewsCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'saved' && (
          <div className="pt-2">
            {userSavedPosts.length === 0 ? (
              <div className="py-16 text-center text-zinc-500 text-xs">
                No saved posts yet. Tap bookmark on any post to save it for later.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1 sm:gap-2">
                {userSavedPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPostForModal(post)}
                    className="relative aspect-square bg-zinc-900 overflow-hidden cursor-pointer group"
                  >
                    <img
                      src={post.media[0]?.mediaUrl}
                      alt={post.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {isEditModalOpen && <EditProfileModal onClose={() => setIsEditModalOpen(false)} />}

      {followModalMode && (
        <FollowersListModal
          mode={followModalMode}
          user={targetUser}
          onClose={() => setFollowModalMode(null)}
        />
      )}
    </div>
  );
};
