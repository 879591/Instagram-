/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  X,
  TrendingUp,
  Heart,
  MessageCircle,
  Film,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const TRENDING_TAGS = [
  'architecture',
  'minimalism',
  'streetart',
  'cyberpunk',
  'portraits',
  'typography',
  'nature',
  'cinematography',
];

export const ExploreView: React.FC = () => {
  const {
    posts,
    reels,
    allUsers,
    activeSearchQuery,
    setActiveSearchQuery,
    setSelectedPostForModal,
    navigateToProfile,
    setActiveTab,
  } = useApp();

  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const query = (selectedTag || activeSearchQuery).trim().toLowerCase();

  // Matched accounts
  const matchedUsers = query
    ? allUsers.filter(
        (u) =>
          u.username.toLowerCase().includes(query) ||
          u.displayName.toLowerCase().includes(query) ||
          u.bio.toLowerCase().includes(query)
      )
    : [];

  // Matched posts
  const matchedPosts = query
    ? posts.filter(
        (p) =>
          p.caption.toLowerCase().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query)) ||
          p.location?.toLowerCase().includes(query)
      )
    : posts;

  const handleClearSearch = () => {
    setActiveSearchQuery('');
    setSelectedTag(null);
  };

  return (
    <div id="explore-view" className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 pb-20 md:pb-8 space-y-4">
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-zinc-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          id="explore-search-input"
          type="text"
          value={activeSearchQuery}
          onChange={(e) => {
            setActiveSearchQuery(e.target.value);
            if (selectedTag) setSelectedTag(null);
          }}
          placeholder="Search by creator @username, #tag, or topic..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-10 pr-10 py-3 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-rose-500 transition shadow-inner"
        />
        {activeSearchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3.5 p-1 rounded-full text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Trending Topics Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-400 uppercase tracking-wider pl-1 shrink-0">
          <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
          <span>Trending:</span>
        </div>
        {TRENDING_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => {
              if (selectedTag === tag) {
                setSelectedTag(null);
              } else {
                setSelectedTag(tag);
                setActiveSearchQuery(tag);
              }
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              selectedTag === tag || activeSearchQuery === tag
                ? 'bg-rose-500 text-white font-semibold shadow-xs'
                : 'bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-zinc-700'
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Account Matches when actively searching */}
      {query && matchedUsers.length > 0 && (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-3.5 space-y-3">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
            Creators ({matchedUsers.length})
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {matchedUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => navigateToProfile(user.username)}
                className="flex items-center justify-between p-2 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 cursor-pointer transition"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-xs text-zinc-100 truncate">
                        {user.displayName}
                      </span>
                      {user.isVerified && (
                        <CheckCircle className="w-3 h-3 text-rose-500 fill-rose-500/20" />
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-400 block truncate">
                      @{user.username}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToProfile(user.username);
                  }}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Discovery Bento Grid of Visual Posts & Reels */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>{query ? `Results for "${query}"` : 'Curated Explore Feed'}</span>
          </div>
          <span className="text-[11px] text-zinc-500">{matchedPosts.length} posts</span>
        </div>

        {matchedPosts.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/30 rounded-3xl border border-zinc-800/60 text-zinc-400 space-y-2">
            <p className="text-sm font-semibold">No results found for &quot;{query}&quot;</p>
            <p className="text-xs text-zinc-500">
              Try searching with another keyword or pick one of the trending tags above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
            {matchedPosts.map((post, idx) => {
              const isLargeCard = idx % 7 === 0;
              const media = post.media[0];

              return (
                <div
                  key={post.id}
                  onClick={() => setSelectedPostForModal(post)}
                  className={`group relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800/80 cursor-pointer aspect-square ${
                    isLargeCard ? 'sm:col-span-2 sm:row-span-2 sm:aspect-auto' : ''
                  }`}
                >
                  <img
                    src={media?.mediaUrl}
                    alt={post.caption}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />

                  {/* Multi-photo indicator icon */}
                  {post.media.length > 1 && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white">
                      +{post.media.length}
                    </div>
                  )}

                  {/* Hover Overlay with engagement metrics */}
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-5 text-white font-bold text-xs">
                    <div className="flex items-center gap-1.5">
                      <Heart className="w-4 h-4 fill-white" />
                      <span>{post.likesCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>{post.commentsCount}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
