/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Image as ImageIcon, Type, Video, Sparkles, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const BG_GRADIENTS = [
  { id: 'gradient_rose', name: 'Rose Sunset', class: 'from-rose-600 via-pink-600 to-purple-800' },
  { id: 'gradient_amethyst', name: 'Amethyst', class: 'from-purple-800 via-indigo-900 to-slate-950' },
  { id: 'gradient_cyan', name: 'Ocean Cyan', class: 'from-cyan-600 via-blue-700 to-indigo-950' },
  { id: 'gradient_amber', name: 'Sunset Amber', class: 'from-amber-500 via-orange-600 to-rose-900' },
  { id: 'gradient_emerald', name: 'Emerald Noir', class: 'from-emerald-700 via-teal-900 to-zinc-950' },
];

const FONT_STYLES = [
  { id: 'modern', name: 'Modern', class: 'font-sans font-bold' },
  { id: 'serif', name: 'Editorial', class: 'font-serif italic font-semibold' },
  { id: 'display', name: 'Impact', class: 'font-mono tracking-tight font-black uppercase' },
];

const SAMPLE_MEDIA = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
];

export const StoryCreatorModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { createStory } = useApp();
  const [storyType, setStoryType] = useState<'text' | 'image' | 'video'>('text');
  const [textContent, setTextContent] = useState('');
  const [selectedBg, setSelectedBg] = useState(BG_GRADIENTS[0]);
  const [selectedFont, setSelectedFont] = useState(FONT_STYLES[0]);
  const [mediaUrl, setMediaUrl] = useState(SAMPLE_MEDIA[0]);
  const [customFilePreview, setCustomFilePreview] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCustomFilePreview(result);
      setMediaUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handlePublish = () => {
    if (storyType === 'text') {
      if (!textContent.trim()) return;
      createStory({
        mediaType: 'text',
        textContent: textContent.trim(),
        backgroundStyle: selectedBg.id,
        fontStyle: selectedFont.id,
      });
    } else {
      createStory({
        mediaType: storyType,
        mediaUrl: customFilePreview || mediaUrl,
        textContent: textContent.trim() || undefined,
        backgroundStyle: selectedBg.id,
        fontStyle: selectedFont.id,
      });
    }
    onClose();
  };

  return (
    <div
      id="story-creator-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md h-[90vh] max-h-[640px] rounded-3xl bg-zinc-950 border border-zinc-800 flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/80 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <h3 className="font-semibold text-sm text-zinc-100">Create 24h Story</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Story Type Selector */}
        <div className="flex border-b border-zinc-800/80 p-1.5 bg-zinc-900/60 shrink-0">
          <button
            onClick={() => setStoryType('text')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              storyType === 'text'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Text Story</span>
          </button>
          <button
            onClick={() => setStoryType('image')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              storyType === 'image'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Photo</span>
          </button>
          <button
            onClick={() => setStoryType('video')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              storyType === 'video'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video Clip</span>
          </button>
        </div>

        {/* Live Canvas Preview */}
        <div className="flex-1 relative flex items-center justify-center p-6 overflow-hidden">
          {storyType === 'text' ? (
            <div
              className={`w-full h-full rounded-2xl bg-gradient-to-br ${selectedBg.class} flex items-center justify-center p-6 shadow-inner relative`}
            >
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Type your story here..."
                maxLength={200}
                className={`w-full bg-transparent text-center text-white placeholder-white/60 resize-none outline-none text-2xl leading-relaxed ${selectedFont.class}`}
                rows={4}
                autoFocus
              />
              <span className="absolute bottom-3 right-4 text-[10px] text-white/50">
                {textContent.length}/200
              </span>
            </div>
          ) : (
            <div className="w-full h-full rounded-2xl bg-zinc-900 relative overflow-hidden flex items-center justify-center">
              {storyType === 'image' ? (
                <img
                  src={customFilePreview || mediaUrl}
                  alt="Story preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <video
                  src={customFilePreview || 'https://assets.mixkit.co/videos/preview/mixkit-liquid-colors-in-water-41484-large.mp4'}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}

              {/* Caption input overlay on top of photo */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md rounded-xl p-2">
                <input
                  type="text"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Add a caption..."
                  className="w-full bg-transparent text-xs text-white placeholder-zinc-400 outline-none px-1"
                />
              </div>
            </div>
          )}
        </div>

        {/* Customization Toolbar */}
        <div className="px-5 py-3 border-t border-zinc-800/80 bg-zinc-900/40 space-y-3 shrink-0">
          {storyType === 'text' ? (
            <>
              {/* Background gradient picker */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {BG_GRADIENTS.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => setSelectedBg(bg)}
                    className={`w-7 h-7 rounded-full bg-gradient-to-br ${bg.class} shrink-0 ring-2 transition flex items-center justify-center ${
                      selectedBg.id === bg.id ? 'ring-white scale-110' : 'ring-transparent'
                    }`}
                    title={bg.name}
                  >
                    {selectedBg.id === bg.id && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>

              {/* Font Style Buttons */}
              <div className="flex gap-2">
                {FONT_STYLES.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFont(f)}
                    className={`px-3 py-1 rounded-lg text-xs transition ${
                      selectedFont.id === f.id
                        ? 'bg-zinc-700 text-white font-bold'
                        : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Select sample or upload file:</span>
                <label className="text-rose-400 font-semibold cursor-pointer hover:underline">
                  Choose from device
                  <input
                    type="file"
                    accept={storyType === 'image' ? 'image/*' : 'video/*'}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex gap-2 overflow-x-auto py-1">
                {SAMPLE_MEDIA.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setMediaUrl(url);
                      setCustomFilePreview(null);
                    }}
                    className={`w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                      mediaUrl === url && !customFilePreview
                        ? 'border-rose-500 scale-105'
                        : 'border-transparent opacity-70'
                    }`}
                  >
                    <img src={url} alt={`Sample ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Publish Button */}
          <div className="pt-1 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={handlePublish}
              disabled={storyType === 'text' && !textContent.trim()}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-lg shadow-rose-950/40 hover:opacity-95 disabled:opacity-50 transition"
            >
              Share to Story
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
