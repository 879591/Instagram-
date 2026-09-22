/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Trash2, Eye, Send, Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const StoryViewer: React.FC = () => {
  const {
    activeStoryId,
    closeStoryViewer,
    stories,
    viewStory,
    deleteStory,
    currentUser,
    sendMessage,
    startConversationWith,
    navigateToProfile,
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showViewersModal, setShowViewersModal] = useState(false);
  const timerRef = useRef<any>(null);

  // Filter valid stories
  const now = new Date().getTime();
  const validStories = stories.filter((s) => new Date(s.expiresAt).getTime() > now);

  useEffect(() => {
    if (activeStoryId) {
      const idx = validStories.findIndex((s) => s.id === activeStoryId);
      if (idx !== -1) {
        setCurrentIndex(idx);
      }
    }
  }, [activeStoryId, validStories.length]);

  const currentStory = validStories[currentIndex];

  // Record view on story display
  useEffect(() => {
    if (currentStory) {
      viewStory(currentStory.id);
      setProgress(0);
    }
  }, [currentIndex, currentStory?.id]);

  // Story progression timer
  useEffect(() => {
    if (!currentStory || isPaused || showViewersModal) return;

    const durationMs = (currentStory.durationSeconds || 5) * 1000;
    const intervalMs = 50;
    const step = (intervalMs / durationMs) * 100;

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isPaused, showViewersModal, currentStory]);

  if (!activeStoryId || !currentStory) return null;

  const isOwnStory = currentStory.userId === currentUser?.id;

  const handleNext = () => {
    if (currentIndex < validStories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      closeStoryViewer();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    } else {
      setProgress(0);
    }
  };

  const handleSendReply = (emoji?: string) => {
    const textToSend = emoji || replyText.trim();
    if (!textToSend || !currentUser) return;

    const convId = startConversationWith(currentStory.userId);
    if (convId) {
      sendMessage(
        convId,
        `Replied to story: ${textToSend}`,
        currentStory.mediaUrl,
        currentStory.mediaType === 'image' ? 'image' : 'text'
      );
    }
    setReplyText('');
  };

  const getGradientClass = (bg?: string) => {
    switch (bg) {
      case 'gradient_amethyst':
        return 'from-purple-800 via-indigo-900 to-slate-950';
      case 'gradient_cyan':
        return 'from-cyan-600 via-blue-700 to-indigo-950';
      case 'gradient_amber':
        return 'from-amber-500 via-orange-600 to-rose-900';
      case 'gradient_emerald':
        return 'from-emerald-700 via-teal-900 to-zinc-950';
      default:
        return 'from-rose-600 via-pink-600 to-purple-800';
    }
  };

  return (
    <div
      id="story-viewer-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md select-none"
    >
      <div
        className="relative w-full max-w-sm h-full max-h-[860px] md:h-[92vh] md:rounded-3xl bg-zinc-950 overflow-hidden flex flex-col justify-between shadow-2xl border border-zinc-800/60"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Top Progress Segmented Bar */}
        <div className="absolute top-0 left-0 right-0 z-30 p-3 pt-4 bg-gradient-to-b from-black/80 to-transparent space-y-2.5">
          <div className="flex gap-1.5 w-full">
            {validStories.map((s, idx) => (
              <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-75"
                  style={{
                    width:
                      idx < currentIndex
                        ? '100%'
                        : idx === currentIndex
                        ? `${progress}%`
                        : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Author Header Bar */}
          <div className="flex items-center justify-between">
            <div
              onClick={() => {
                closeStoryViewer();
                navigateToProfile(currentStory.author.username);
              }}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <img
                src={currentStory.author.avatarUrl}
                alt={currentStory.author.displayName}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-rose-500/80"
                referrerPolicy="no-referrer"
              />
              <div>
                <span className="text-xs font-bold text-white block">
                  {currentStory.author.username}
                </span>
                <span className="text-[10px] text-zinc-300">
                  {new Date(currentStory.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isOwnStory && (
                <button
                  onClick={() => deleteStory(currentStory.id)}
                  className="p-1.5 rounded-full text-zinc-300 hover:text-rose-400 hover:bg-black/40 transition"
                  title="Delete Story"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={closeStoryViewer}
                className="p-1.5 rounded-full text-white hover:bg-white/20 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Story Content Canvas with Tap Navigators */}
        <div className="relative flex-1 flex items-center justify-center overflow-hidden">
          {/* Tap Left / Right Controls */}
          <div
            onClick={handlePrev}
            className="absolute left-0 top-16 bottom-20 w-1/3 z-20 cursor-pointer"
            title="Previous Story"
          />
          <div
            onClick={handleNext}
            className="absolute right-0 top-16 bottom-20 w-1/3 z-20 cursor-pointer"
            title="Next Story"
          />

          {currentStory.mediaType === 'text' ? (
            <div
              className={`w-full h-full bg-gradient-to-br ${getGradientClass(
                currentStory.backgroundStyle
              )} flex items-center justify-center p-8 text-center`}
            >
              <p
                className={`text-white text-2xl md:text-3xl leading-relaxed drop-shadow-md ${
                  currentStory.fontStyle === 'serif'
                    ? 'font-serif italic font-semibold'
                    : currentStory.fontStyle === 'display'
                    ? 'font-mono uppercase font-black'
                    : 'font-sans font-bold'
                }`}
              >
                {currentStory.textContent}
              </p>
            </div>
          ) : currentStory.mediaType === 'image' ? (
            <div className="w-full h-full relative">
              <img
                src={currentStory.mediaUrl}
                alt="Story"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {currentStory.textContent && (
                <div className="absolute bottom-20 left-4 right-4 bg-black/60 backdrop-blur-md rounded-xl p-3 text-center text-sm font-medium text-white shadow-lg">
                  {currentStory.textContent}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full relative">
              <video
                src={currentStory.mediaUrl}
                autoPlay
                playsInline
                loop
                className="w-full h-full object-cover"
              />
              {currentStory.textContent && (
                <div className="absolute bottom-20 left-4 right-4 bg-black/60 backdrop-blur-md rounded-xl p-3 text-center text-sm font-medium text-white shadow-lg">
                  {currentStory.textContent}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Bar: Own Story Views vs Other Story Reply Input */}
        <div className="relative z-30 p-3 pb-5 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
          {isOwnStory ? (
            <div className="flex items-center justify-between px-2">
              <button
                onClick={() => setShowViewersModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-white hover:bg-white/25 transition"
              >
                <Eye className="w-4 h-4 text-rose-400" />
                <span>
                  {currentStory.viewsCount}{' '}
                  {currentStory.viewsCount === 1 ? 'view' : 'views'}
                </span>
              </button>
              <span className="text-[11px] text-zinc-400">Expires in 24 hours</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                  placeholder={`Reply to ${currentStory.author.username}...`}
                  className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-xs text-white placeholder-zinc-300 outline-none focus:border-rose-400 transition"
                />
                {replyText.trim() ? (
                  <button
                    onClick={() => handleSendReply()}
                    className="p-2 rounded-full bg-gradient-to-tr from-rose-500 to-purple-600 text-white shadow-md transition active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleSendReply('❤️')}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-rose-400 transition active:scale-125"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                )}
              </div>

              {/* Quick Reaction Emojis */}
              <div className="flex items-center justify-around pt-1">
                {['🔥', '👏', '😂', '😮', '✨', '😍'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleSendReply(emoji)}
                    className="text-lg hover:scale-125 transition transform active:scale-95"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Viewers Sheet for Own Story */}
        {showViewersModal && (
          <div className="absolute inset-0 z-40 bg-zinc-950/95 backdrop-blur-md flex flex-col p-5 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-rose-500" />
                <h4 className="font-semibold text-sm text-zinc-100">
                  Viewers ({currentStory.viewers.length})
                </h4>
              </div>
              <button
                onClick={() => setShowViewersModal(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {currentStory.viewers.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 text-xs">
                  No views yet. Share your story with friends!
                </div>
              ) : (
                currentStory.viewers.map((viewer) => (
                  <div key={viewer.userId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={viewer.user.avatarUrl}
                        alt={viewer.user.displayName}
                        className="w-8 h-8 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="text-xs font-semibold text-zinc-200">
                          {viewer.user.displayName}
                        </div>
                        <div className="text-[10px] text-zinc-400">@{viewer.user.username}</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-500">
                      {new Date(viewer.viewedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
