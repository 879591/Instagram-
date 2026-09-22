/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Heart,
  MessageCircle,
  Bookmark,
  Send,
  Trash2,
  CornerDownRight,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PostOptionsModal } from './PostOptionsModal';

export const PostDetailModal: React.FC = () => {
  const {
    selectedPostForModal,
    setSelectedPostForModal,
    commentsByPostId,
    addComment,
    deleteComment,
    toggleLikeComment,
    toggleLikePost,
    toggleSavePost,
    currentUser,
    navigateToProfile,
    followingIds,
    followUser,
    unfollowUser,
  } = useApp();

  const [commentInput, setCommentInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [showOptions, setShowOptions] = useState(false);

  if (!selectedPostForModal) return null;

  const post = selectedPostForModal;
  const postComments = commentsByPostId[post.id] || [];
  const currentMedia = post.media[activeMediaIndex] || post.media[0];
  const isFollowingAuthor = followingIds.includes(post.userId);
  const isOwnPost = currentUser?.id === post.userId;

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    if (replyingTo) {
      addComment(post.id, commentInput.trim(), replyingTo.id);
      setReplyingTo(null);
    } else {
      addComment(post.id, commentInput.trim());
    }
    setCommentInput('');
  };

  return (
    <div
      id="post-detail-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-150"
      onClick={() => setSelectedPostForModal(null)}
    >
      <div
        className="relative w-full max-w-4xl h-[92vh] max-h-[720px] rounded-3xl bg-zinc-950 border border-zinc-800 flex flex-col md:flex-row overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button Mobile/Desktop */}
        <button
          onClick={() => setSelectedPostForModal(null)}
          className="absolute top-3 right-3 z-30 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/90 transition md:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media Half (Left on desktop) */}
        <div className="relative md:w-7/12 bg-black flex items-center justify-center overflow-hidden shrink-0 h-64 md:h-full">
          {currentMedia.mediaType === 'image' ? (
            <img
              src={currentMedia.mediaUrl}
              alt="Post preview"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          ) : (
            <video
              src={currentMedia.mediaUrl}
              controls
              playsInline
              className="w-full h-full object-contain"
            />
          )}

          {post.media.length > 1 && (
            <>
              {activeMediaIndex > 0 && (
                <button
                  onClick={() => setActiveMediaIndex((prev) => prev - 1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {activeMediaIndex < post.media.length - 1 && (
                <button
                  onClick={() => setActiveMediaIndex((prev) => prev + 1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Details & Comments Half (Right on desktop) */}
        <div className="flex-1 flex flex-col justify-between bg-zinc-950 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800/80 shrink-0">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  setSelectedPostForModal(null);
                  navigateToProfile(post.author.username);
                }}
                className="p-0.5 rounded-full ring-2 ring-rose-500/40 shrink-0"
              >
                <img
                  src={post.author.avatarUrl}
                  alt={post.author.displayName}
                  className="w-8 h-8 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>
              <div>
                <button
                  onClick={() => {
                    setSelectedPostForModal(null);
                    navigateToProfile(post.author.username);
                  }}
                  className="font-bold text-xs text-zinc-100 hover:text-rose-400 block text-left"
                >
                  {post.author.username}
                </button>
                {post.location && (
                  <span className="text-[10px] text-zinc-400 block">{post.location}</span>
                )}
              </div>

              {!isOwnPost && currentUser && (
                <button
                  onClick={() =>
                    isFollowingAuthor ? unfollowUser(post.userId) : followUser(post.userId)
                  }
                  className={`ml-2 text-xs font-semibold px-2.5 py-1 rounded-full transition ${
                    isFollowingAuthor
                      ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      : 'bg-rose-500 text-white hover:bg-rose-600'
                  }`}
                >
                  {isFollowingAuthor ? 'Following' : 'Follow'}
                </button>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowOptions(true)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedPostForModal(null)}
                className="hidden md:flex p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* Post Caption as first comment item */}
            <div className="flex items-start gap-2.5 pb-2 border-b border-zinc-900">
              <img
                src={post.author.avatarUrl}
                alt={post.author.displayName}
                className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1">
                <span className="font-bold text-zinc-100 mr-1.5">{post.author.username}</span>
                <span className="text-zinc-300 whitespace-pre-line leading-relaxed">
                  {post.caption}
                </span>
                <div className="text-[10px] text-zinc-500 mt-1">
                  {new Date(post.createdAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>

            {postComments.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                No comments yet. Start the conversation!
              </div>
            ) : (
              postComments.map((comment) => (
                <div key={comment.id} className="space-y-2">
                  <div className="flex items-start justify-between group">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <img
                        src={comment.author.avatarUrl}
                        alt={comment.author.displayName}
                        className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-zinc-100 mr-1.5">
                          {comment.author.username}
                        </span>
                        <span className="text-zinc-300 break-words leading-relaxed">
                          {comment.content}
                        </span>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-zinc-400">
                          <span>
                            {new Date(comment.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {comment.likesCount > 0 && (
                            <span className="font-semibold">{comment.likesCount} likes</span>
                          )}
                          <button
                            onClick={() =>
                              setReplyingTo({
                                id: comment.id,
                                username: comment.author.username,
                              })
                            }
                            className="font-semibold text-zinc-400 hover:text-white"
                          >
                            Reply
                          </button>
                          {comment.userId === currentUser?.id && (
                            <button
                              onClick={() => deleteComment(post.id, comment.id)}
                              className="text-zinc-500 hover:text-rose-400"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleLikeComment(post.id, comment.id)}
                      className="p-1 text-zinc-400 hover:text-rose-500 shrink-0"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          comment.isLiked ? 'fill-rose-500 text-rose-500' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Nested Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="pl-9 space-y-2 border-l border-zinc-800 ml-3.5">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start gap-2">
                          <img
                            src={reply.author.avatarUrl}
                            alt={reply.author.displayName}
                            className="w-5 h-5 rounded-full object-cover shrink-0 mt-0.5"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1">
                            <span className="font-bold text-zinc-100 mr-1.5">
                              {reply.author.username}
                            </span>
                            <span className="text-zinc-300 leading-relaxed">{reply.content}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Action Row & Input Bar */}
          <div className="border-t border-zinc-800/80 p-3.5 bg-zinc-950/80 space-y-2 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleLikePost(post.id)}
                  className={`transition ${post.isLiked ? 'text-rose-500' : 'text-zinc-300 hover:text-white'}`}
                >
                  <Heart
                    className={`w-5 h-5 ${post.isLiked ? 'fill-rose-500' : ''}`}
                  />
                </button>
                <button
                  onClick={() => toggleSavePost(post.id)}
                  className={`transition ${post.isSaved ? 'text-purple-400' : 'text-zinc-300 hover:text-white'}`}
                >
                  <Bookmark
                    className={`w-5 h-5 ${post.isSaved ? 'fill-purple-400' : ''}`}
                  />
                </button>
              </div>

              <span className="text-xs font-bold text-zinc-200">
                {post.likesCount} {post.likesCount === 1 ? 'like' : 'likes'}
              </span>
            </div>

            {/* Replying indicator */}
            {replyingTo && (
              <div className="flex items-center justify-between px-2 py-1 rounded bg-zinc-900 text-[11px] text-zinc-300">
                <div className="flex items-center gap-1.5">
                  <CornerDownRight className="w-3.5 h-3.5 text-rose-500" />
                  <span>
                    Replying to <strong className="text-white">@{replyingTo.username}</strong>
                  </span>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="text-zinc-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Comment Form */}
            <form onSubmit={handleSubmitComment} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder={
                  replyingTo ? `Reply to @${replyingTo.username}...` : 'Add a thoughtful comment...'
                }
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-3.5 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="p-2 rounded-full bg-gradient-to-r from-rose-500 to-purple-600 text-white disabled:opacity-40 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {showOptions && (
        <PostOptionsModal post={post} onClose={() => setShowOptions(false)} />
      )}
    </div>
  );
};
