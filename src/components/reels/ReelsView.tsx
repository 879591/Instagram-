/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Send,
  Volume2,
  VolumeX,
  Plus,
  Music,
  CheckCircle,
  Play,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ReelCreatorModal } from './ReelCreatorModal';
import { Reel } from '../../types';

export const ReelsView: React.FC = () => {
  const {
    reels,
    toggleLikeReel,
    toggleSaveReel,
    recordReelView,
    followingIds,
    followUser,
    unfollowUser,
    navigateToProfile,
    currentUser,
    startConversationWith,
    sendMessage,
  } = useApp();

  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [commentingReel, setCommentingReel] = useState<Reel | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [reelComments, setReelComments] = useState<Record<string, { user: string; text: string; time: string }[]>>({
    'reel-01': [
      { user: 'maya_creates', text: 'The camera pan speed is so smooth! 🎬', time: '1h ago' },
      { user: 'vikram_code', text: 'What lens was this shot with?', time: '45m ago' },
    ],
    'reel-02': [
      { user: 'priyasharma', text: 'Color grading tutorial when? 😍', time: '2h ago' },
    ],
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Record view on current reel
  useEffect(() => {
    const currentReel = reels[activeReelIndex];
    if (currentReel) {
      recordReelView(currentReel.id);
    }
  }, [activeReelIndex, reels]);

  // Handle scroll snap detection
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, clientHeight } = containerRef.current;
    const index = Math.round(scrollTop / clientHeight);
    if (index !== activeReelIndex && index >= 0 && index < reels.length) {
      setActiveReelIndex(index);
      setIsPlaying(true);
    }
  };

  // Play only active video, pause others
  useEffect(() => {
    videoRefs.current.forEach((video, idx) => {
      if (video) {
        if (idx === activeReelIndex) {
          video.play().catch(() => {});
        } else {
          video.pause();
          video.currentTime = 0;
        }
      }
    });
  }, [activeReelIndex]);

  const togglePlayPause = (idx: number) => {
    const video = videoRefs.current[idx];
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleAddComment = (reelId: string) => {
    if (!commentInput.trim() || !currentUser) return;
    const newEntry = {
      user: currentUser.username,
      text: commentInput.trim(),
      time: 'Just now',
    };
    setReelComments((prev) => ({
      ...prev,
      [reelId]: [newEntry, ...(prev[reelId] || [])],
    }));
    setCommentInput('');
  };

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] md:h-[calc(100vh-2rem)] flex justify-center bg-black overflow-hidden select-none">
      {/* Create Reel floating pill button */}
      <button
        id="create-reel-floating-btn"
        onClick={() => setIsCreatorOpen(true)}
        className="absolute top-4 right-4 z-30 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xl transition active:scale-95"
      >
        <Plus className="w-4 h-4 text-rose-400 stroke-[2.5]" />
        <span>Create Reel</span>
      </button>

      {/* Vertical Reel Scroller */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full max-w-sm md:max-w-md h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
      >
        {reels.map((reel, idx) => {
          const isFollowing = followingIds.includes(reel.userId);
          const isOwn = currentUser?.id === reel.userId;
          const comments = reelComments[reel.id] || [];

          return (
            <div
              key={reel.id}
              className="relative w-full h-full snap-start snap-always bg-zinc-950 flex items-center justify-center overflow-hidden"
            >
              {/* Video Element */}
              <video
                ref={(el) => {
                  videoRefs.current[idx] = el;
                }}
                src={reel.videoUrl}
                loop
                playsInline
                muted={isMuted}
                onClick={() => togglePlayPause(idx)}
                className="w-full h-full object-cover cursor-pointer"
              />

              {/* Pause overlay icon */}
              {!isPlaying && idx === activeReelIndex && (
                <div
                  onClick={() => togglePlayPause(idx)}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer pointer-events-auto"
                >
                  <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white">
                    <Play className="w-8 h-8 fill-white ml-1" />
                  </div>
                </div>
              )}

              {/* Mute / Unmute Toggle Button */}
              <button
                onClick={() => setIsMuted((prev) => !prev)}
                className="absolute top-4 left-4 z-20 p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Bottom Gradient Overlay for Readability */}
              <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

              {/* Bottom Metadata: Creator & Caption */}
              <div className="absolute bottom-16 md:bottom-6 left-4 right-16 z-20 space-y-2.5">
                {/* Creator row */}
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => navigateToProfile(reel.author.username)}
                    className="p-0.5 rounded-full ring-2 ring-rose-500/80"
                  >
                    <img
                      src={reel.author.avatarUrl}
                      alt={reel.author.displayName}
                      className="w-9 h-9 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => navigateToProfile(reel.author.username)}
                      className="font-bold text-xs text-white hover:underline"
                    >
                      {reel.author.username}
                    </button>
                    {reel.author.isVerified && (
                      <CheckCircle className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                    )}
                  </div>

                  {!isOwn && currentUser && (
                    <button
                      onClick={() =>
                        isFollowing ? unfollowUser(reel.userId) : followUser(reel.userId)
                      }
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full transition ${
                        isFollowing
                          ? 'bg-white/20 text-white'
                          : 'bg-rose-500 text-white hover:bg-rose-600'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>

                {/* Caption */}
                <p className="text-xs text-zinc-100 line-clamp-2 leading-relaxed">
                  {reel.caption}
                </p>

                {/* Soundtrack Ticker */}
                <div className="flex items-center gap-2 text-[11px] text-zinc-300 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full w-fit">
                  <Music className="w-3 h-3 text-rose-400 animate-pulse" />
                  <span className="truncate max-w-[200px]">
                    {reel.soundTitle} • {reel.soundArtist}
                  </span>
                </div>
              </div>

              {/* Right Side Action Column */}
              <div className="absolute bottom-16 md:bottom-6 right-3 z-20 flex flex-col items-center gap-4">
                {/* Like Button */}
                <button
                  onClick={() => toggleLikeReel(reel.id)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div
                    className={`w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center transition active:scale-125 ${
                      reel.isLiked ? 'text-rose-500' : 'text-white'
                    }`}
                  >
                    <Heart
                      className={`w-6 h-6 stroke-[1.8] ${reel.isLiked ? 'fill-rose-500' : ''}`}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-white shadow-xs">
                    {reel.likesCount}
                  </span>
                </button>

                {/* Comment Button */}
                <button
                  onClick={() => setCommentingReel(reel)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white transition active:scale-110">
                    <MessageCircle className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-bold text-white shadow-xs">
                    {comments.length}
                  </span>
                </button>

                {/* Save Button */}
                <button
                  onClick={() => toggleSaveReel(reel.id)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div
                    className={`w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center transition active:scale-110 ${
                      reel.isSaved ? 'text-purple-400' : 'text-white'
                    }`}
                  >
                    <Bookmark
                      className={`w-6 h-6 stroke-[1.8] ${
                        reel.isSaved ? 'fill-purple-400 stroke-purple-400' : ''
                      }`}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-white shadow-xs">Save</span>
                </button>

                {/* Share Button */}
                <button
                  onClick={() => {
                    const convId = startConversationWith(reel.userId);
                    if (convId) {
                      sendMessage(
                        convId,
                        `Shared a reel by @${reel.author.username}: "${reel.caption}"`
                      );
                    }
                  }}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white transition active:scale-110">
                    <Send className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <span className="text-[11px] font-bold text-white shadow-xs">Share</span>
                </button>

                {/* Rotating Vinyl Record Audio Indicator */}
                <div className="w-10 h-10 rounded-full bg-zinc-900 border-2 border-zinc-700 p-1 animate-spin duration-3000">
                  <img
                    src={reel.author.avatarUrl}
                    alt="audio"
                    className="w-full h-full rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reel Comments Bottom Sheet */}
      {commentingReel && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in"
          onClick={() => setCommentingReel(null)}
        >
          <div
            className="w-full max-w-sm rounded-t-3xl sm:rounded-3xl bg-zinc-950 border border-zinc-800 p-4 h-[60vh] flex flex-col justify-between shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
                Comments ({reelComments[commentingReel.id]?.length || 0})
              </h4>
              <button
                onClick={() => setCommentingReel(null)}
                className="text-zinc-400 hover:text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3">
              {(reelComments[commentingReel.id] || []).length === 0 ? (
                <div className="text-center py-10 text-zinc-500 text-xs">
                  No comments yet on this reel. Be the first!
                </div>
              ) : (
                reelComments[commentingReel.id].map((c, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs">
                    <div className="w-7 h-7 rounded-full bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center shrink-0">
                      {c.user[0].toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-zinc-200 mr-1.5">{c.user}</span>
                      <span className="text-zinc-400">{c.text}</span>
                      <div className="text-[10px] text-zinc-600 mt-0.5">{c.time}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-zinc-800 flex gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment(commentingReel.id)}
                placeholder="Add comment..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-3.5 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-rose-500"
              />
              <button
                onClick={() => handleAddComment(commentingReel.id)}
                disabled={!commentInput.trim()}
                className="px-3.5 py-1.5 rounded-full bg-rose-500 text-white text-xs font-semibold disabled:opacity-40"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      {isCreatorOpen && <ReelCreatorModal onClose={() => setIsCreatorOpen(false)} />}
    </div>
  );
};
