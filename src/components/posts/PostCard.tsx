/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  MapPin,
  CheckCircle,
  Check,
} from 'lucide-react';
import { Post } from '../../types';
import { useApp } from '../../context/AppContext';
import { PostOptionsModal } from './PostOptionsModal';

export const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  const {
    toggleLikePost,
    toggleSavePost,
    addComment,
    editPost,
    commentsByPostId,
    navigateToProfile,
    setSelectedPostForModal,
    setActiveTab,
    setActiveSearchQuery,
    currentUser,
  } = useApp();

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editCaption, setEditCaption] = useState(post.caption);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const lastTapRef = useRef<number>(0);

  const postComments = commentsByPostId[post.id] || [];
  const mediaCount = post.media.length;
  const currentMedia = post.media[activeMediaIndex] || post.media[0];

  // Double-tap to like on mobile
  const handleMediaTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (!post.isLiked) {
        toggleLikePost(post.id);
      }
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 900);
    }
    lastTapRef.current = now;
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(post.id, commentText);
    setCommentText('');
  };

  const handleSaveEdit = () => {
    editPost(post.id, editCaption.trim());
    setIsEditing(false);
  };

  // Parse hashtags (#) and mentions (@) in caption
  const renderFormattedCaption = (text: string) => {
    const tokens = text.split(/(\s+)/);
    return tokens.map((token, i) => {
      if (token.startsWith('#')) {
        const tag = token.slice(1).replace(/[^a-zA-Z0-9_]/g, '');
        return (
          <span
            key={i}
            onClick={() => {
              setActiveSearchQuery(tag);
              setActiveTab('explore');
            }}
            className="text-rose-400 hover:text-rose-300 font-semibold cursor-pointer hover:underline"
          >
            {token}
          </span>
        );
      }
      if (token.startsWith('@')) {
        const username = token.slice(1).replace(/[^a-zA-Z0-9_]/g, '');
        return (
          <span
            key={i}
            onClick={() => navigateToProfile(username)}
            className="text-purple-400 hover:text-purple-300 font-semibold cursor-pointer hover:underline"
          >
            {token}
          </span>
        );
      }
      return token;
    });
  };

  return (
    <>
      <article
        id={`post-${post.id}`}
        className="w-full bg-zinc-950 border-b md:border border-zinc-800/80 md:rounded-3xl overflow-hidden mb-4 shadow-sm"
      >
        {/* Post Header */}
        <div className="flex items-center justify-between p-3.5">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigateToProfile(post.author.username)}
              className="p-0.5 rounded-full ring-2 ring-rose-500/30 hover:ring-rose-500 transition shrink-0"
            >
              <img
                src={post.author.avatarUrl}
                alt={post.author.displayName}
                className="w-9 h-9 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => navigateToProfile(post.author.username)}
                  className="font-semibold text-xs text-zinc-100 hover:text-rose-400 transition"
                >
                  {post.author.username}
                </button>
                {post.author.isVerified && (
                  <CheckCircle className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                )}
                <span className="text-zinc-600 text-xs">•</span>
                <span className="text-[11px] text-zinc-400">
                  {new Date(post.createdAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              {post.location && (
                <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                  <MapPin className="w-2.5 h-2.5 text-rose-500" />
                  <span className="truncate">{post.location}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowOptions(true)}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition"
            title="Post options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Media Container with Double-tap & Carousel */}
        <div
          className="relative w-full aspect-square bg-zinc-900 overflow-hidden flex items-center justify-center cursor-pointer select-none"
          onClick={handleMediaTap}
        >
          {currentMedia.mediaType === 'image' ? (
            <img
              src={currentMedia.mediaUrl}
              alt="Post visual"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          ) : (
            <video
              src={currentMedia.mediaUrl}
              controls
              playsInline
              className="w-full h-full object-cover"
            />
          )}

          {/* Double-tap Heart Burst Animation */}
          {showHeartBurst && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 animate-in zoom-in-50 fade-in duration-200">
              <Heart className="w-24 h-24 text-white fill-rose-500 drop-shadow-2xl animate-bounce" />
            </div>
          )}

          {/* Carousel Nav Arrows */}
          {mediaCount > 1 && (
            <>
              {activeMediaIndex > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMediaIndex((prev) => prev - 1);
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-xs text-white flex items-center justify-center hover:bg-black/80 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              {activeMediaIndex < mediaCount - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMediaIndex((prev) => prev + 1);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-xs text-white flex items-center justify-center hover:bg-black/80 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {/* Indicator Dots */}
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1 z-10">
                {post.media.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-200 ${
                      idx === activeMediaIndex ? 'w-4 bg-rose-500' : 'w-1.5 bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Action Toolbar */}
        <div className="p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Like Button */}
              <button
                id={`like-btn-${post.id}`}
                onClick={() => toggleLikePost(post.id)}
                className={`flex items-center gap-1.5 transition active:scale-125 ${
                  post.isLiked ? 'text-rose-500' : 'text-zinc-300 hover:text-white'
                }`}
                title={post.isLiked ? 'Unlike' : 'Like'}
              >
                <Heart
                  className={`w-6 h-6 stroke-[1.8] ${
                    post.isLiked ? 'fill-rose-500 stroke-rose-500 scale-110' : ''
                  }`}
                />
              </button>

              {/* Comment Button */}
              <button
                id={`comment-btn-${post.id}`}
                onClick={() => setSelectedPostForModal(post)}
                className="text-zinc-300 hover:text-white transition active:scale-110"
                title="View comments"
              >
                <MessageCircle className="w-6 h-6 stroke-[1.8]" />
              </button>

              {/* Share Button */}
              <button
                onClick={() => setShowOptions(true)}
                className="text-zinc-300 hover:text-white transition active:scale-110"
                title="Share post"
              >
                <Send className="w-5 h-5 stroke-[1.8]" />
              </button>
            </div>

            {/* Save / Bookmark Button */}
            <button
              id={`save-btn-${post.id}`}
              onClick={() => toggleSavePost(post.id)}
              className={`transition active:scale-110 ${
                post.isSaved ? 'text-purple-400' : 'text-zinc-300 hover:text-white'
              }`}
              title={post.isSaved ? 'Unsave' : 'Save'}
            >
              <Bookmark
                className={`w-6 h-6 stroke-[1.8] ${
                  post.isSaved ? 'fill-purple-400 stroke-purple-400' : ''
                }`}
              />
            </button>
          </div>

          {/* Likes Count */}
          <div className="text-xs font-bold text-zinc-100">
            {post.likesCount.toLocaleString()} {post.likesCount === 1 ? 'like' : 'likes'}
          </div>

          {/* Caption */}
          {isEditing ? (
            <div className="space-y-2 pt-1">
              <textarea
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-100 outline-none focus:border-rose-500 resize-none"
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 rounded-lg text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3.5 py-1 rounded-lg text-xs font-semibold bg-rose-600 text-white flex items-center gap-1 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="text-xs text-zinc-200 leading-relaxed">
              <span
                onClick={() => navigateToProfile(post.author.username)}
                className="font-bold text-white mr-1.5 cursor-pointer hover:underline"
              >
                {post.author.username}
              </span>
              <span className="whitespace-pre-line">{renderFormattedCaption(post.caption)}</span>
            </div>
          )}

          {/* View Comments trigger */}
          {post.commentsCount > 0 && (
            <button
              onClick={() => setSelectedPostForModal(post)}
              className="text-xs text-zinc-400 hover:text-zinc-300 transition block text-left pt-0.5"
            >
              View all {post.commentsCount} {post.commentsCount === 1 ? 'comment' : 'comments'}
            </button>
          )}

          {/* Recent Comment Preview */}
          {postComments.length > 0 && (
            <div className="space-y-1 text-xs">
              {postComments.slice(0, 2).map((c) => (
                <div key={c.id} className="text-zinc-300 truncate">
                  <span className="font-semibold text-zinc-100 mr-1.5">{c.author.username}</span>
                  <span>{c.content}</span>
                </div>
              ))}
            </div>
          )}

          {/* Inline Quick Comment Input */}
          <form
            onSubmit={handleCommentSubmit}
            className="flex items-center gap-2 pt-1 border-t border-zinc-900"
          >
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-transparent text-xs text-zinc-100 placeholder-zinc-500 outline-none py-1"
            />
            {commentText.trim() && (
              <button
                type="submit"
                className="text-xs font-semibold text-rose-500 hover:text-rose-400 transition"
              >
                Post
              </button>
            )}
          </form>
        </div>
      </article>

      {showOptions && (
        <PostOptionsModal
          post={post}
          onClose={() => setShowOptions(false)}
          onStartEdit={() => setIsEditing(true)}
        />
      )}
    </>
  );
};
