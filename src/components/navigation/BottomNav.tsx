/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, Search, PlusCircle, Film } from 'lucide-react';
import { useApp, AppTab } from '../../context/AppContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, navigateToProfile } = useApp();

  const handleTabClick = (tab: AppTab) => {
    if (tab === 'profile' && currentUser) {
      navigateToProfile(currentUser.username);
    } else {
      setActiveTab(tab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-800/90 bg-zinc-950/90 backdrop-blur-lg pb-safe"
    >
      <div className="flex items-center justify-around h-14 px-2 max-w-lg mx-auto">
        {/* Home */}
        <button
          id="nav-home-btn"
          onClick={() => handleTabClick('home')}
          className={`flex flex-col items-center justify-center w-14 h-full transition ${
            activeTab === 'home' ? 'text-rose-500 scale-105' : 'text-zinc-400 hover:text-zinc-200'
          }`}
          aria-label="Home"
        >
          <Home className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] mt-0.5 font-medium">Home</span>
        </button>

        {/* Explore */}
        <button
          id="nav-explore-btn"
          onClick={() => handleTabClick('explore')}
          className={`flex flex-col items-center justify-center w-14 h-full transition ${
            activeTab === 'explore' ? 'text-rose-500 scale-105' : 'text-zinc-400 hover:text-zinc-200'
          }`}
          aria-label="Explore"
        >
          <Search className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] mt-0.5 font-medium">Explore</span>
        </button>

        {/* Create (+) */}
        <button
          id="nav-create-btn"
          onClick={() => handleTabClick('create')}
          className="flex flex-col items-center justify-center w-14 h-full -mt-2 transition transform active:scale-95"
          aria-label="Create Post"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-950/50 text-white">
            <PlusCircle className="w-6 h-6 stroke-[2.2]" />
          </div>
          <span className="text-[10px] mt-0.5 font-semibold text-rose-400">Create</span>
        </button>

        {/* Reels */}
        <button
          id="nav-reels-btn"
          onClick={() => handleTabClick('reels')}
          className={`flex flex-col items-center justify-center w-14 h-full transition ${
            activeTab === 'reels' ? 'text-rose-500 scale-105' : 'text-zinc-400 hover:text-zinc-200'
          }`}
          aria-label="Reels"
        >
          <Film className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] mt-0.5 font-medium">Reels</span>
        </button>

        {/* Profile */}
        <button
          id="nav-profile-btn"
          onClick={() => handleTabClick('profile')}
          className={`flex flex-col items-center justify-center w-14 h-full transition ${
            activeTab === 'profile' ? 'text-rose-500' : 'text-zinc-400 hover:text-zinc-200'
          }`}
          aria-label="Profile"
        >
          <div
            className={`w-6 h-6 rounded-full overflow-hidden p-0.5 transition ${
              activeTab === 'profile'
                ? 'ring-2 ring-rose-500 ring-offset-1 ring-offset-zinc-950'
                : 'opacity-85'
            }`}
          >
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.displayName}
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-zinc-700 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 font-medium">Profile</span>
        </button>
      </div>
    </nav>
  );
};
