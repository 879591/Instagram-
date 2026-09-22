/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StoryCreatorModal } from './StoryCreatorModal';

export const StoriesBar: React.FC = () => {
  const { stories, currentUser, openStoryViewer } = useApp();
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);

  // Group active stories by user
  const now = new Date().getTime();
  const validStories = stories.filter((s) => new Date(s.expiresAt).getTime() > now);

  const ownStory = validStories.find((s) => s.userId === currentUser?.id);
  const otherStories = validStories.filter((s) => s.userId !== currentUser?.id);

  // De-duplicate users for stories rail
  const userStoryMap = new Map<string, typeof validStories[0]>();
  otherStories.forEach((s) => {
    if (!userStoryMap.has(s.userId)) {
      userStoryMap.set(s.userId, s);
    }
  });
  const displayedOtherStories = Array.from(userStoryMap.values());

  return (
    <>
      <div
        id="stories-bar"
        className="w-full overflow-x-auto no-scrollbar py-3 px-1 border-b border-zinc-800/60 bg-zinc-950/40"
      >
        <div className="flex items-center gap-3.5 sm:gap-4 px-2 min-w-max">
          {/* Current User Story Item (+ Add or View) */}
          <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
            <div className="relative">
              <button
                onClick={() => {
                  if (ownStory) {
                    openStoryViewer(ownStory.id);
                  } else {
                    setIsCreatorOpen(true);
                  }
                }}
                className={`relative w-16 h-16 rounded-full p-0.5 transition transform group-active:scale-95 ${
                  ownStory
                    ? 'bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600'
                    : 'bg-zinc-800'
                }`}
              >
                <img
                  src={
                    currentUser?.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                  }
                  alt="Your story"
                  className="w-full h-full rounded-full object-cover border-2 border-zinc-950"
                  referrerPolicy="no-referrer"
                />
              </button>

              {/* Add Story (+) button badge */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCreatorOpen(true);
                }}
                className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-gradient-to-tr from-rose-500 to-purple-600 text-white flex items-center justify-center ring-2 ring-zinc-950 shadow-md hover:scale-110 transition"
                title="Add Story"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
            <span className="text-[11px] font-medium text-zinc-300 max-w-[64px] truncate">
              Your story
            </span>
          </div>

          {/* Other Users' Stories */}
          {displayedOtherStories.map((story) => {
            const hasViewed = story.viewers.some((v) => v.userId === currentUser?.id);
            return (
              <div
                key={story.id}
                onClick={() => openStoryViewer(story.id)}
                className="flex flex-col items-center gap-1.5 cursor-pointer group select-none"
              >
                <div
                  className={`w-16 h-16 rounded-full p-0.5 transition transform group-hover:scale-105 group-active:scale-95 ${
                    hasViewed
                      ? 'bg-zinc-700/60'
                      : 'bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shadow-md shadow-rose-950/30 animate-pulse-subtle'
                  }`}
                >
                  <img
                    src={story.author.avatarUrl}
                    alt={story.author.displayName}
                    className="w-full h-full rounded-full object-cover border-2 border-zinc-950"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-[11px] font-medium text-zinc-300 max-w-[68px] truncate">
                  {story.author.username}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {isCreatorOpen && <StoryCreatorModal onClose={() => setIsCreatorOpen(false)} />}
    </>
  );
};
