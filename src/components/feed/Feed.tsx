/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Users, CheckCircle2, UserPlus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StoriesBar } from '../stories/StoriesBar';
import { PostCard } from '../posts/PostCard';

export const Feed: React.FC = () => {
  const { posts, followingIds, currentUser, allUsers, followUser } = useApp();
  const [feedMode, setFeedMode] = useState<'for_you' | 'following'>('for_you');

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    if (feedMode === 'following') {
      return followingIds.includes(post.userId) || post.userId === currentUser?.id;
    }
    return true; // 'for_you' shows all community posts
  });

  // Suggested accounts to follow (not currently following and not current user)
  const suggestedUsers = allUsers
    .filter((u) => u.id !== currentUser?.id && !followingIds.includes(u.id))
    .slice(0, 4);

  return (
    <div id="feed-container" className="w-full max-w-xl mx-auto pb-20 md:pb-8">
      {/* 24-Hour Ephemeral Stories Bar */}
      <StoriesBar />

      {/* Feed Filter Switcher (For You | Following) */}
      <div className="flex items-center justify-center gap-6 py-3 border-b border-zinc-900 bg-zinc-950/60 sticky top-14 z-30 backdrop-blur-md">
        <button
          id="feed-tab-foryou"
          onClick={() => setFeedMode('for_you')}
          className={`flex items-center gap-1.5 text-xs font-bold tracking-wide transition relative pb-1 ${
            feedMode === 'for_you' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span>For You</span>
          {feedMode === 'for_you' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 to-purple-600 rounded-full" />
          )}
        </button>

        <button
          id="feed-tab-following"
          onClick={() => setFeedMode('following')}
          className={`flex items-center gap-1.5 text-xs font-bold tracking-wide transition relative pb-1 ${
            feedMode === 'following' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-purple-400" />
          <span>Following</span>
          {feedMode === 'following' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 to-purple-600 rounded-full" />
          )}
        </button>
      </div>

      {/* Posts Stream */}
      <div className="mt-3 px-0 sm:px-2">
        {filteredPosts.length === 0 ? (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 text-center my-6 space-y-4">
            <Users className="w-12 h-12 text-zinc-600 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-zinc-100">No Posts in Following</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                Follow more inspiring creators to populate your personal timeline or switch to the &quot;For You&quot; tab.
              </p>
            </div>
            {suggestedUsers.length > 0 && (
              <div className="pt-2 border-t border-zinc-800 space-y-3">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                  Suggested for you
                </span>
                <div className="space-y-2.5 max-w-sm mx-auto text-left">
                  {suggestedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-zinc-950/60 border border-zinc-800"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={user.avatarUrl}
                          alt={user.displayName}
                          className="w-9 h-9 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="text-xs font-semibold text-zinc-200">
                            {user.displayName}
                          </div>
                          <div className="text-[11px] text-zinc-400">@{user.username}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => followUser(user.id)}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500 text-white hover:bg-rose-600 flex items-center gap-1 transition"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Follow</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
        )}

        {/* Caught Up Badge */}
        {filteredPosts.length > 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <CheckCircle2 className="w-6 h-6 stroke-[2]" />
            </div>
            <h4 className="text-sm font-semibold text-zinc-200">You&apos;re All Caught Up</h4>
            <p className="text-xs text-zinc-500 max-w-xs">
              You&apos;ve seen all new updates from the creators and accounts you follow.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
