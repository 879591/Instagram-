/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Film, Music, Hash, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const SAMPLE_REEL_VIDEOS = [
  {
    title: 'Neon Cyberpunk Shibuya',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-reflection-of-neon-lights-in-the-rain-41584-large.mp4',
    sound: 'Midnight Tokyo Nights',
    artist: 'Lofi Cyber',
    thumb: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Golden Hour Waves Ocean',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
    sound: 'Ocean Breeze Serenade',
    artist: 'Coastal Vibes',
    thumb: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Abstract Fluid Aesthetics',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-liquid-colors-in-water-41484-large.mp4',
    sound: 'Modern Abstract Bass',
    artist: 'Synthwave Labs',
    thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
  },
];

export const ReelCreatorModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { createReel } = useApp();
  const [selectedSample, setSelectedSample] = useState(SAMPLE_REEL_VIDEOS[0]);
  const [caption, setCaption] = useState('');
  const [tagsInput, setTagsInput] = useState('reels, trending, viral');
  const [soundTitle, setSoundTitle] = useState(SAMPLE_REEL_VIDEOS[0].sound);
  const [soundArtist, setSoundArtist] = useState(SAMPLE_REEL_VIDEOS[0].artist);
  const [customFileUrl, setCustomFileUrl] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCustomFileUrl(url);
  };

  const handlePublish = () => {
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    createReel({
      videoUrl: customFileUrl || selectedSample.url,
      thumbnailUrl: selectedSample.thumb,
      caption: caption.trim() || 'New reel created on Supriya ✨',
      soundTitle,
      soundArtist,
      tags,
    });
    onClose();
  };

  return (
    <div
      id="reel-creator-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-rose-500" />
            <h3 className="font-semibold text-sm text-zinc-100">Create New Reel</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Video Preview */}
          <div className="w-full aspect-[9/14] max-h-72 rounded-2xl bg-black overflow-hidden relative border border-zinc-800">
            <video
              src={customFileUrl || selectedSample.url}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-rose-400" />
              <span>9:16 Vertical</span>
            </div>
          </div>

          {/* Sample Video Library or Custom Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Choose sample footage:</span>
              <label className="text-rose-400 font-semibold cursor-pointer hover:underline">
                Upload MP4
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_REEL_VIDEOS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedSample(item);
                    setSoundTitle(item.sound);
                    setSoundArtist(item.artist);
                    setCustomFileUrl(null);
                  }}
                  className={`p-1.5 rounded-xl border text-left transition ${
                    selectedSample.url === item.url && !customFileUrl
                      ? 'border-rose-500 bg-rose-500/10'
                      : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                  }`}
                >
                  <img
                    src={item.thumb}
                    alt={item.title}
                    className="w-full h-14 object-cover rounded-lg mb-1"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-[10px] font-semibold text-zinc-200 truncate">
                    {item.title}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Caption */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Caption & Thoughts</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a catchy caption with #hashtags..."
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-rose-500 resize-none"
            />
          </div>

          {/* Audio Track metadata */}
          <div className="space-y-2 pt-1 border-t border-zinc-900">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
              <Music className="w-3.5 h-3.5 text-rose-500" />
              <span>Audio Soundtrack</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={soundTitle}
                onChange={(e) => setSoundTitle(e.target.value)}
                placeholder="Song title"
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
              />
              <input
                type="text"
                value={soundArtist}
                onChange={(e) => setSoundArtist(e.target.value)}
                placeholder="Artist name"
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
              <Hash className="w-3.5 h-3.5 text-purple-400" />
              <span>Hashtags (comma separated)</span>
            </div>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. reels, cinematography, vibe"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 flex justify-end gap-2 bg-zinc-900/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handlePublish}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-lg shadow-rose-950/40 hover:opacity-95"
          >
            Publish Reel
          </button>
        </div>
      </div>
    </div>
  );
};
