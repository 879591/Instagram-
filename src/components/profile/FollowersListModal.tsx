/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Search, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserProfile } from '../../types';

interface FollowersListModalProps {
  mode: 'followers' | 'following';
  user: UserProfile;
  onClose: () => void;
}

export const FollowersListModal: React.FC<FollowersListModalProps> = ({
  mode,
  user,
  onClose,
}) => {
  const {
    allUsers,
    followingIds,
    followUser,
    unfollowUser,
    removeFollower,
    currentUser,
    navigateToProfile,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  // Get relevant user list
  const userList = allUsers.filter((u) => {
    if (u.id === user.id) return false;
    if (mode === 'following') {
      return followingIds.includes(u.id);
    }
    // followers
    return u.followingCount > 0;
  });

  const filteredList = searchQuery.trim()
    ? userList.filter(
        (u) =>
          u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.displayName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : userList;

  const isSelf = currentUser?.id === user.id;

  return (
    <div
      id="followers-list-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-2xl flex flex-col h-[70vh] max-h-[520px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h3 className="font-bold text-sm text-zinc-100 capitalize">
            {mode} ({userList.length})
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-zinc-800/80">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filteredList.length === 0 ? (
            <div className="text-center py-12 text-xs text-zinc-500">
              No users found.
            </div>
          ) : (
            filteredList.map((targetUser) => {
              const isFollowingTarget = followingIds.includes(targetUser.id);
              const isTargetCurrentUser = currentUser?.id === targetUser.id;

              return (
                <div
                  key={targetUser.id}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-900/60 transition"
                >
                  <div
                    onClick={() => {
                      onClose();
                      navigateToProfile(targetUser.username);
                    }}
                    className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                  >
                    <img
                      src={targetUser.avatarUrl}
                      alt={targetUser.displayName}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-xs text-zinc-100 truncate">
                          {targetUser.displayName}
                        </span>
                        {targetUser.isVerified && (
                          <CheckCircle className="w-3 h-3 text-rose-500 fill-rose-500/20" />
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-400 block truncate">
                        @{targetUser.username}
                      </span>
                    </div>
                  </div>

                  {!isTargetCurrentUser && currentUser && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isSelf && mode === 'followers' && (
                        <button
                          onClick={() => removeFollower(targetUser.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-800 text-zinc-400 hover:text-rose-400 hover:bg-zinc-700"
                        >
                          Remove
                        </button>
                      )}
                      <button
                        onClick={() =>
                          isFollowingTarget
                            ? unfollowUser(targetUser.id)
                            : followUser(targetUser.id)
                        }
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                          isFollowingTarget
                            ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                            : 'bg-rose-500 text-white hover:bg-rose-600'
                        }`}
                      >
                        {isFollowingTarget ? 'Following' : 'Follow'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
