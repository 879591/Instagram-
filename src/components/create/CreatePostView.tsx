/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Upload,
  Image as ImageIcon,
  MapPin,
  Globe,
  Lock,
  Users,
  Hash,
  AtSign,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AspectRatio, VisibilityType } from '../../types';

const SAMPLE_POST_IMAGES = [
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
];

const SUGGESTED_HASHTAGS = ['supriya', 'creators', 'minimal', 'vibes', 'visuals', 'aesthetic'];

export const CreatePostView: React.FC = () => {
  const { createPost, currentUser } = useApp();

  const [mediaList, setMediaList] = useState<
    { mediaUrl: string; mediaType: 'image' | 'video'; aspectRatio: AspectRatio }[]
  >([
    {
      mediaUrl: SAMPLE_POST_IMAGES[0],
      mediaType: 'image',
      aspectRatio: '1:1',
    },
  ]);

  const [activeMediaIdx, setActiveMediaIdx] = useState(0);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [visibility, setVisibility] = useState<VisibilityType>('public');
  const [tagsInput, setTagsInput] = useState('');
  const [mentionsInput, setMentionsInput] = useState('');
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>('1:1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isVideo = file.type.startsWith('video');
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setMediaList((prev) => [
          ...prev,
          {
            mediaUrl: url,
            mediaType: isVideo ? 'video' : 'image',
            aspectRatio: selectedRatio,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const addSamplePhoto = (url: string) => {
    setMediaList((prev) => [
      ...prev,
      {
        mediaUrl: url,
        mediaType: 'image',
        aspectRatio: selectedRatio,
      },
    ]);
  };

  const removeMedia = (idx: number) => {
    if (mediaList.length <= 1) return;
    setMediaList((prev) => prev.filter((_, i) => i !== idx));
    if (activeMediaIdx >= mediaList.length - 1) {
      setActiveMediaIdx(Math.max(0, mediaList.length - 2));
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (mediaList.length === 0 || !currentUser) return;
    setIsSubmitting(true);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const mentions = mentionsInput
      .split(',')
      .map((m) => m.trim().replace(/^@/, ''))
      .filter(Boolean);

    createPost({
      caption: caption.trim(),
      location: location.trim() || undefined,
      visibility,
      media: mediaList,
      tags,
      mentions,
    });
  };

  const currentMedia = mediaList[activeMediaIdx] || mediaList[0];

  return (
    <div id="create-post-view" className="w-full max-w-3xl mx-auto px-4 py-6 pb-20 md:pb-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-zinc-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-500" />
            <span>Create New Post</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Share high-resolution photos, multi-frame carousels, or video clips with the world.
          </p>
        </div>
      </div>

      <form onSubmit={handlePublish} className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Media Preview & Selection (Left Column) */}
        <div className="md:col-span-7 space-y-4">
          {/* Main Visual Display */}
          <div
            className={`w-full rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden relative shadow-lg flex items-center justify-center transition-all ${
              selectedRatio === '4:5'
                ? 'aspect-[4/5]'
                : selectedRatio === '16:9'
                ? 'aspect-[16/9]'
                : 'aspect-square'
            }`}
          >
            {currentMedia?.mediaType === 'image' ? (
              <img
                src={currentMedia.mediaUrl}
                alt="Upload preview"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <video
                src={currentMedia?.mediaUrl}
                controls
                playsInline
                className="w-full h-full object-cover"
              />
            )}

            {/* Remove active frame */}
            {mediaList.length > 1 && (
              <button
                type="button"
                onClick={() => removeMedia(activeMediaIdx)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-rose-600 text-white transition"
                title="Remove frame"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Aspect Ratio Switcher */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300">
            <span className="font-semibold text-zinc-400">Aspect Ratio:</span>
            <div className="flex gap-1.5">
              {(['1:1', '4:5', '16:9'] as AspectRatio[]).map((ratio) => (
                <button
                  type="button"
                  key={ratio}
                  onClick={() => setSelectedRatio(ratio)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                    selectedRatio === ratio
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Media Carousel Thumbnail Strip */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold">Carousel Frames ({mediaList.length})</span>
              <label className="text-rose-400 font-semibold cursor-pointer hover:underline flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Files</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {mediaList.map((m, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveMediaIdx(idx)}
                  className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 cursor-pointer transition ${
                    activeMediaIdx === idx ? 'border-rose-500 scale-105' : 'border-zinc-800 opacity-60'
                  }`}
                >
                  <img
                    src={m.mediaUrl}
                    alt={`Frame ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}

              {/* Quick sample image picker buttons */}
              {SAMPLE_POST_IMAGES.slice(1, 4).map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => addSamplePhoto(url)}
                  className="w-14 h-14 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 text-zinc-400 flex flex-col items-center justify-center text-[10px] shrink-0 hover:border-rose-500 hover:text-white transition"
                  title="Add curated sample frame"
                >
                  <Plus className="w-4 h-4" />
                  <span>Sample</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Post Metadata & Settings (Right Column) */}
        <div className="md:col-span-5 space-y-4">
          {/* Caption */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-200 block">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write an engaging caption... Use #hashtags and @mentions"
              rows={4}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-rose-500 resize-none transition"
            />
            {/* Quick suggested hashtags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {SUGGESTED_HASHTAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setCaption((prev) => `${prev} #${tag}`.trim())}
                  className="px-2 py-0.5 rounded-lg bg-zinc-800/80 hover:bg-rose-500/20 hover:text-rose-300 text-[10px] text-zinc-400 font-medium transition"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>Location (Optional)</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Kyoto, Japan or Central Park, NY"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-rose-500"
            />
          </div>

          {/* Hashtags */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-purple-400" />
              <span>Hashtags (comma separated)</span>
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="architecture, photography, travel"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-rose-500"
            />
          </div>

          {/* Mentions */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <AtSign className="w-3.5 h-3.5 text-amber-400" />
              <span>Tag People (usernames comma separated)</span>
            </label>
            <input
              type="text"
              value={mentionsInput}
              onChange={(e) => setMentionsInput(e.target.value)}
              placeholder="maya_creates, vikram_code"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-rose-500"
            />
          </div>

          {/* Visibility */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-200 block">Audience Visibility</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setVisibility('public')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition ${
                  visibility === 'public'
                    ? 'border-rose-500 bg-rose-500/10 text-white font-bold'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                }`}
              >
                <Globe className="w-4 h-4 text-rose-400" />
                <span className="text-[11px]">Public</span>
              </button>

              <button
                type="button"
                onClick={() => setVisibility('followers')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition ${
                  visibility === 'followers'
                    ? 'border-rose-500 bg-rose-500/10 text-white font-bold'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                }`}
              >
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-[11px]">Followers</span>
              </button>

              <button
                type="button"
                onClick={() => setVisibility('private')}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition ${
                  visibility === 'private'
                    ? 'border-rose-500 bg-rose-500/10 text-white font-bold'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                }`}
              >
                <Lock className="w-4 h-4 text-amber-400" />
                <span className="text-[11px]">Only Me</span>
              </button>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2">
            <button
              id="publish-post-btn"
              type="submit"
              disabled={isSubmitting || mediaList.length === 0}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-purple-600 text-white font-bold text-sm shadow-xl shadow-rose-950/50 hover:opacity-95 transition active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? 'Sharing to Supriya...' : 'Share Post'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
