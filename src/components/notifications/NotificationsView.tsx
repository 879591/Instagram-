/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  AtSign,
  Check,
  X,
  CheckCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NotificationItem } from '../../types';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    acceptFollowRequest,
    declineFollowRequest,
    followUser,
    followingIds,
    navigateToProfile,
    setSelectedPostForModal,
    posts,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'requests' | 'mentions'>('all');

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'requests') return n.type === 'follow_request';
    if (activeFilter === 'mentions')
      return n.type === 'mention_post' || n.type === 'mention_comment';
    return true;
  });

  const handleNotificationClick = (item: NotificationItem) => {
    markNotificationAsRead(item.id);

    if (item.entityId) {
      const targetPost = posts.find((p) => p.id === item.entityId);
      if (targetPost) {
        setSelectedPostForModal(targetPost);
        return;
      }
    }
    navigateToProfile(item.actor.username);
  };

  const renderIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'like_post':
        return <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />;
      case 'comment_post':
        return <MessageCircle className="w-3.5 h-3.5 text-blue-400" />;
      case 'new_follower':
      case 'follow_request':
        return <UserPlus className="w-3.5 h-3.5 text-purple-400" />;
      case 'mention_post':
      case 'mention_comment':
        return <AtSign className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-rose-500" />;
    }
  };

  return (
    <div id="notifications-view" className="w-full max-w-2xl mx-auto px-4 py-4 pb-20 md:pb-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-rose-500" />
          <h2 className="font-extrabold text-base text-zinc-100">Notifications</h2>
        </div>
        <button
          onClick={markAllNotificationsAsRead}
          className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 transition"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark all as read</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            activeFilter === 'all'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
          }`}
        >
          All Activity
        </button>
        <button
          onClick={() => setActiveFilter('requests')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            activeFilter === 'requests'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
          }`}
        >
          Follow Requests
        </button>
        <button
          onClick={() => setActiveFilter('mentions')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            activeFilter === 'mentions'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
          }`}
        >
          Mentions
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/40 rounded-2xl border border-zinc-800/80 text-zinc-500 text-xs">
            No notifications in this category.
          </div>
        ) : (
          filtered.map((notif) => {
            const isFollowingActor = followingIds.includes(notif.actor.id);

            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`flex items-center justify-between gap-3 p-3 rounded-2xl border cursor-pointer transition ${
                  notif.isRead
                    ? 'bg-zinc-950 border-zinc-800/60 hover:bg-zinc-900/50'
                    : 'bg-rose-500/5 border-rose-500/30 hover:bg-rose-500/10'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Actor Avatar with event indicator */}
                  <div className="relative shrink-0">
                    <img
                      src={notif.actor.avatarUrl}
                      alt={notif.actor.displayName}
                      className="w-11 h-11 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                      {renderIcon(notif.type)}
                    </div>
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1 text-xs">
                    <p className="leading-snug text-zinc-200">
                      <strong className="text-zinc-100 font-bold hover:underline">
                        {notif.actor.username}
                      </strong>{' '}
                      <span className="text-zinc-300">{notif.previewText}</span>
                    </p>
                    <span className="text-[10px] text-zinc-500 mt-0.5 block">
                      {new Date(notif.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Right Action: Follow back, Accept/Decline request, or Post Thumbnail preview */}
                <div
                  className="flex items-center gap-2 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {notif.type === 'follow_request' ? (
                    notif.followRequestStatus === 'accepted' ? (
                      <span className="text-[11px] font-semibold text-emerald-400">Accepted</span>
                    ) : notif.followRequestStatus === 'rejected' ? (
                      <span className="text-[11px] font-semibold text-zinc-500">Declined</span>
                    ) : (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => acceptFollowRequest(notif.actor.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Confirm</span>
                        </button>
                        <button
                          onClick={() => declineFollowRequest(notif.actor.id)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-400 text-xs font-semibold hover:bg-zinc-700"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )
                  ) : notif.type === 'new_follower' && !isFollowingActor ? (
                    <button
                      onClick={() => followUser(notif.actor.id)}
                      className="px-3 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition"
                    >
                      Follow Back
                    </button>
                  ) : notif.previewMediaUrl ? (
                    <img
                      src={notif.previewMediaUrl}
                      alt="Thumbnail"
                      className="w-10 h-10 rounded-xl object-cover border border-zinc-800"
                      referrerPolicy="no-referrer"
                    />
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
