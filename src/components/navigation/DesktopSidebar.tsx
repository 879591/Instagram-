/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Home,
  Search,
  PlusSquare,
  Film,
  MessageCircle,
  Bell,
  Bookmark,
  User,
  Settings,
  ShieldAlert,
  LogOut,
  Users,
  ChevronDown,
} from 'lucide-react';
import { useApp, AppTab } from '../../context/AppContext';
import { BrandLogo } from '../common/BrandLogo';

export const DesktopSidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    unreadNotificationsCount,
    conversations,
    currentUser,
    allUsers,
    switchUser,
    logout,
    navigateToProfile,
  } = useApp();

  const [showUserSwitcher, setShowUserSwitcher] = useState(false);

  const totalUnreadMessages = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const navItems = [
    { id: 'home' as AppTab, label: 'Home', icon: Home },
    { id: 'explore' as AppTab, label: 'Explore', icon: Search },
    { id: 'reels' as AppTab, label: 'Reels', icon: Film },
    {
      id: 'messages' as AppTab,
      label: 'Messages',
      icon: MessageCircle,
      badge: totalUnreadMessages > 0 ? totalUnreadMessages : undefined,
    },
    {
      id: 'notifications' as AppTab,
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
    },
    { id: 'create' as AppTab, label: 'Create', icon: PlusSquare },
    { id: 'saved' as AppTab, label: 'Saved', icon: Bookmark },
    {
      id: 'profile' as AppTab,
      label: 'Profile',
      icon: User,
      action: () => currentUser && navigateToProfile(currentUser.username),
    },
    { id: 'settings' as AppTab, label: 'Settings', icon: Settings },
  ];

  if (currentUser?.role === 'admin') {
    navItems.push({
      id: 'admin' as AppTab,
      label: 'Admin Hub',
      icon: ShieldAlert,
    });
  }

  return (
    <aside
      id="desktop-sidebar"
      aria-label="Desktop Sidebar"
      className="hidden md:flex flex-col justify-between w-64 lg:w-72 shrink-0 h-screen sticky top-0 border-r border-zinc-800/80 bg-zinc-950 p-5 select-none"
    >
      <div className="space-y-6">
        {/* Brand */}
        <div className="pt-2 px-2">
          <BrandLogo
            size="md"
            showTagline
            clickable
            onClick={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-medium transition text-sm ${
                  isActive
                    ? 'bg-rose-500/10 text-rose-400 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? 'text-rose-500 stroke-[2.4]' : 'text-zinc-400 stroke-[2]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-600 px-1.5 text-[11px] font-bold text-white shadow-xs">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Card & Switcher */}
      <div className="relative border-t border-zinc-800/80 pt-4">
        {showUserSwitcher && (
          <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-150 z-50">
            <div className="px-2 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-rose-400" />
              <span>Switch Demo Account</span>
            </div>
            {allUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  switchUser(user);
                  setShowUserSwitcher(false);
                }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-xs transition ${
                  currentUser?.id === user.id
                    ? 'bg-rose-500/15 text-rose-300 font-semibold'
                    : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <img
                  src={user.avatarUrl}
                  alt={user.displayName}
                  className="w-7 h-7 rounded-full object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{user.displayName}</div>
                  <div className="truncate text-[10px] text-zinc-400">@{user.username}</div>
                </div>
                {user.role === 'admin' && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-600 text-white font-bold">
                    ADMIN
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {currentUser ? (
          <div className="flex items-center justify-between gap-2 p-2 rounded-2xl hover:bg-zinc-900 transition">
            <button
              onClick={() => navigateToProfile(currentUser.username)}
              className="flex items-center gap-2.5 min-w-0 text-left"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.displayName}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-rose-500/30 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-zinc-100 truncate">
                  {currentUser.displayName}
                </div>
                <div className="text-[11px] text-zinc-400 truncate">@{currentUser.username}</div>
              </div>
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowUserSwitcher((prev) => !prev)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                title="Switch demo account"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setActiveTab('settings')}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 text-white font-semibold text-xs text-center shadow-md shadow-rose-950/40"
          >
            Sign In / Register
          </button>
        )}
      </div>
    </aside>
  );
};
