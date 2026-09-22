/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Settings,
  User,
  Shield,
  Bell,
  Moon,
  Sun,
  Lock,
  LogOut,
  Users,
  Eye,
  Check,
  CheckCircle,
  ShieldAlert,
  Download,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PWAInstallButton } from '../common/PWAInstallButton';

export const SettingsView: React.FC = () => {
  const {
    currentUser,
    allUsers,
    login,
    signup,
    logout,
    switchUser,
    settings,
    updateSettings,
    theme,
    toggleTheme,
    blockedUserIds,
    unblockUser,
    checkUsernameAvailable,
    setActiveTab,
  } = useApp();

  // Auth form state if logged out
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupUser, setSignupUser] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPass, setSignupPass] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const res = await login(identifier, password);
    if (!res.success) {
      setAuthError(res.error || 'Failed to login');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const res = await signup(signupName, signupUser, signupEmail, signupPass);
    if (!res.success) {
      setAuthError(res.error || 'Failed to sign up');
    }
  };

  return (
    <div id="settings-view" className="w-full max-w-2xl mx-auto px-4 py-6 pb-20 md:pb-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-rose-500" />
          <h2 className="font-extrabold text-base text-zinc-100">Settings & Account</h2>
        </div>
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setActiveTab('admin')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-semibold hover:bg-rose-500/30 transition"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Open Admin Hub</span>
          </button>
        )}
      </div>

      {/* Unauthenticated View: Sign In / Register */}
      {!currentUser ? (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-black text-white">
              {authMode === 'login' ? 'Welcome Back to Supriya' : 'Join the Supriya Community'}
            </h3>
            <p className="text-xs text-zinc-400">
              Connect with fellow creators, share visual stories, and discover fresh culture.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-zinc-950 p-1 border border-zinc-800">
            <button
              onClick={() => {
                setAuthMode('login');
                setAuthError(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                authMode === 'login' ? 'bg-rose-500 text-white shadow-sm' : 'text-zinc-400'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setAuthMode('signup');
                setAuthError(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                authMode === 'signup' ? 'bg-rose-500 text-white shadow-sm' : 'text-zinc-400'
              }`}
            >
              Create Account
            </button>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {authError}
            </div>
          )}

          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-300 font-semibold block mb-1">
                  Username or Email
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="priyasharma or priya@supriya.social"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-semibold block mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 text-white font-bold text-xs shadow-md shadow-rose-950/40 hover:opacity-95"
              >
                Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-300 font-semibold block mb-1">Full Name</label>
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="Aria Montgomery"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-semibold block mb-1">Username</label>
                <input
                  type="text"
                  value={signupUser}
                  onChange={(e) => setSignupUser(e.target.value)}
                  placeholder="aria_creates"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-semibold block mb-1">Email</label>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="aria@example.com"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-semibold block mb-1">Password</label>
                <input
                  type="password"
                  value={signupPass}
                  onChange={(e) => setSignupPass(e.target.value)}
                  placeholder="Create a secure password"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 text-white font-bold text-xs shadow-md shadow-rose-950/40 hover:opacity-95 mt-2"
              >
                Create Account
              </button>
            </form>
          )}

          {/* Quick Demo Login Shortcut */}
          <div className="pt-4 border-t border-zinc-800/80 space-y-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block text-center">
              Quick 1-Click Demo Profiles:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {allUsers.slice(0, 4).map((u) => (
                <button
                  key={u.id}
                  onClick={() => switchUser(u)}
                  className="flex items-center gap-2 p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-left hover:border-rose-500/50 transition"
                >
                  <img
                    src={u.avatarUrl}
                    alt={u.displayName}
                    className="w-7 h-7 rounded-full object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-semibold text-zinc-200 truncate">
                      {u.displayName}
                    </div>
                    <div className="text-[10px] text-zinc-400 capitalize">{u.role}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Authenticated Settings Screen */
        <div className="space-y-6">
          {/* Current User Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.displayName}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-rose-500"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-zinc-100">
                    {currentUser.displayName}
                  </h3>
                  {currentUser.isVerified && (
                    <CheckCircle className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                  )}
                  {currentUser.role === 'admin' && (
                    <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-bold">
                      ADMIN
                    </span>
                  )}
                </div>
                <span className="text-xs text-zinc-400">@{currentUser.username}</span>
                <span className="text-[11px] text-zinc-500 block">{currentUser.email}</span>
              </div>
            </div>

            <button
              onClick={logout}
              className="px-3.5 py-1.5 rounded-xl border border-zinc-700 hover:border-rose-500/50 text-xs font-semibold text-zinc-300 hover:text-rose-400 flex items-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Quick Demo Switcher */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                <Users className="w-4 h-4 text-rose-500" />
                <span>Switch Active Account (Multi-user Demo)</span>
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {allUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => switchUser(u)}
                  className={`p-2 rounded-xl text-left border flex items-center gap-2 transition ${
                    currentUser.id === u.id
                      ? 'border-rose-500 bg-rose-500/10'
                      : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                  }`}
                >
                  <img
                    src={u.avatarUrl}
                    alt={u.displayName}
                    className="w-7 h-7 rounded-full object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-semibold text-zinc-200 truncate">
                      {u.displayName}
                    </div>
                    <div className="text-[9px] text-zinc-400">@{u.username}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* App Preferences */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl divide-y divide-zinc-800/80">
            {/* Theme Toggle */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-purple-400" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-400" />
                )}
                <div>
                  <div className="text-xs font-semibold text-zinc-200">Appearance Mode</div>
                  <div className="text-[10px] text-zinc-400">
                    Currently set to {theme === 'dark' ? 'Dark' : 'Light'} theme
                  </div>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 capitalize"
              >
                Switch to {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
            </div>

            {/* Notifications */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-rose-500" />
                <div>
                  <div className="text-xs font-semibold text-zinc-200">Push Notifications</div>
                  <div className="text-[10px] text-zinc-400">
                    Receive alerts for likes, comments, and direct messages
                  </div>
                </div>
              </div>
              <button
                onClick={() =>
                  updateSettings({ pushNotifications: !settings.pushNotifications })
                }
                className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                  settings.pushNotifications
                    ? 'bg-rose-500 justify-end'
                    : 'bg-zinc-800 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
              </button>
            </div>

            {/* Activity Status */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="text-xs font-semibold text-zinc-200">Activity Status</div>
                  <div className="text-[10px] text-zinc-400">
                    Allow followers to see when you are active on Supriya
                  </div>
                </div>
              </div>
              <button
                onClick={() => updateSettings({ activityStatus: !settings.activityStatus })}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                  settings.activityStatus ? 'bg-rose-500 justify-end' : 'bg-zinc-800 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
              </button>
            </div>

            {/* Read Receipts */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-xs font-semibold text-zinc-200">Message Read Receipts</div>
                  <div className="text-[10px] text-zinc-400">
                    Let conversation participants know when you have read messages
                  </div>
                </div>
              </div>
              <button
                onClick={() => updateSettings({ readReceipts: !settings.readReceipts })}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                  settings.readReceipts ? 'bg-rose-500 justify-end' : 'bg-zinc-800 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
              </button>
            </div>

            {/* Two-Factor Authentication */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="text-xs font-semibold text-zinc-200">
                    Two-Factor Authentication (2FA)
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    Enhance account safety with an extra verification factor
                  </div>
                </div>
              </div>
              <button
                onClick={() =>
                  updateSettings({ twoFactorEnabled: !settings.twoFactorEnabled })
                }
                className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                  settings.twoFactorEnabled
                    ? 'bg-rose-500 justify-end'
                    : 'bg-zinc-800 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
              </button>
            </div>
          </div>

          {/* Blocked Accounts Management */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-3">
            <span className="text-xs font-bold text-zinc-200 flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-500" />
              <span>Blocked Accounts ({blockedUserIds.length})</span>
            </span>
            {blockedUserIds.length === 0 ? (
              <p className="text-xs text-zinc-500">You haven&apos;t blocked any accounts.</p>
            ) : (
              <div className="space-y-2">
                {blockedUserIds.map((id) => {
                  const u = allUsers.find((user) => user.id === id);
                  if (!u) return null;
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between p-2 rounded-xl bg-zinc-950"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={u.avatarUrl}
                          alt={u.displayName}
                          className="w-7 h-7 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-xs font-semibold text-zinc-200">@{u.username}</span>
                      </div>
                      <button
                        onClick={() => unblockUser(id)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-zinc-800 text-zinc-300 hover:text-white"
                      >
                        Unblock
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* PWA Install Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-zinc-900 border border-rose-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-rose-400" />
              <div>
                <div className="text-xs font-bold text-white">Install Supriya App</div>
                <div className="text-[10px] text-zinc-400">
                  Enjoy fullscreen experience, offline caching, and native gestures
                </div>
              </div>
            </div>
            <PWAInstallButton />
          </div>
        </div>
      )}
    </div>
  );
};
