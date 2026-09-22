/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Check, Camera, Lock, Globe } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const EditProfileModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { currentUser, updateProfile, checkUsernameAvailable } = useApp();

  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [website, setWebsite] = useState(currentUser?.website || '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [isPrivate, setIsPrivate] = useState(currentUser?.isPrivate || false);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '');

    if (cleanUser !== currentUser?.username && !checkUsernameAvailable(cleanUser)) {
      setUsernameError('This username is already taken. Please choose another.');
      return;
    }

    updateProfile({
      displayName: displayName.trim(),
      username: cleanUser,
      bio: bio.trim(),
      website: website.trim(),
      location: location.trim(),
      avatarUrl,
      isPrivate,
    });
    onClose();
  };

  return (
    <div
      id="edit-profile-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in"
    >
      <div className="w-full max-w-md rounded-3xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h3 className="font-bold text-sm text-zinc-100">Edit Profile</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto">
          {/* Avatar Change */}
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-rose-500/50">
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer text-white opacity-0 hover:opacity-100 transition">
                <Camera className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFile}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <label className="text-xs font-semibold text-rose-400 hover:underline cursor-pointer block">
                Change Profile Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFile}
                  className="hidden"
                />
              </label>
              <span className="text-[10px] text-zinc-500">JPG, PNG or GIF up to 5MB</span>
            </div>
          </div>

          {/* Display Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
            />
          </div>

          {/* Username */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Username</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs text-zinc-500">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameError(null);
                }}
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-7 pr-3 py-2 text-xs text-white outline-none focus:border-rose-500"
              />
            </div>
            {usernameError && <p className="text-[11px] text-rose-400">{usernameError}</p>}
          </div>

          {/* Bio */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={160}
              placeholder="Tell the community about yourself..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none focus:border-rose-500 resize-none"
            />
            <div className="text-right text-[10px] text-zinc-500">{bio.length}/160</div>
          </div>

          {/* Website Link */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-zinc-400" />
              <span>Website</span>
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourportfolio.com"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
            />
          </div>

          {/* Location */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
            />
          </div>

          {/* Privacy Switch */}
          <div className="pt-2 border-t border-zinc-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-xs font-semibold text-zinc-200">Private Account</div>
                <div className="text-[10px] text-zinc-500">
                  Only approved followers will see your posts and stories
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPrivate((prev) => !prev)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                isPrivate ? 'bg-rose-500 justify-end' : 'bg-zinc-800 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
            </button>
          </div>

          {/* Footer Save Button */}
          <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md shadow-rose-950/40 hover:opacity-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
