/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  MessageCircle,
  Bell,
  Sun,
  Moon,
  ShieldAlert,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from '../common/BrandLogo';
import { PWAInstallButton } from '../common/PWAInstallButton';

export const TopHeader: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    unreadNotificationsCount,
    conversations,
    currentUser,
    theme,
    toggleTheme,
    navigateToProfile,
  } = useApp();

  const totalUnreadMessages = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <header
      id="top-header"
      className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md transition-colors"
    >
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Logo / Brand */}
        <div className="flex items-center gap-2">
          <BrandLogo
            size="sm"
            clickable
            onClick={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border transition ${
                activeTab === 'admin'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                  : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              <span>Admin</span>
            </button>
          )}
        </div>

        {/* Quick Search on larger screens */}
        <div className="hidden md:flex flex-1 max-w-xs mx-4">
          <button
            onClick={() => setActiveTab('explore')}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search users, tags, reels...</span>
          </button>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <PWAInstallButton compact />

          {/* Theme Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/70 transition"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-amber-400" />}
          </button>

          {/* Notifications Button */}
          <button
            id="notifications-nav-btn"
            onClick={() => setActiveTab('notifications')}
            className={`relative p-2 rounded-full transition ${
              activeTab === 'notifications'
                ? 'text-rose-500 bg-rose-500/10'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-800/70'
            }`}
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-zinc-950">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Direct Messages Button */}
          <button
            id="messages-nav-btn"
            onClick={() => setActiveTab('messages')}
            className={`relative p-2 rounded-full transition ${
              activeTab === 'messages'
                ? 'text-rose-500 bg-rose-500/10'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-800/70'
            }`}
            title="Direct Messages"
          >
            <MessageCircle className="w-5 h-5" />
            {totalUnreadMessages > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-zinc-950">
                {totalUnreadMessages > 9 ? '9+' : totalUnreadMessages}
              </span>
            )}
          </button>

          {/* User Avatar quick link */}
          {currentUser && (
            <button
              onClick={() => navigateToProfile(currentUser.username)}
              className="p-0.5 rounded-full ring-2 ring-transparent hover:ring-rose-500 transition shrink-0"
              title="My Profile"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.displayName}
                className="w-7 h-7 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
