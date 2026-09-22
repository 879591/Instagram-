/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Bookmark,
  Plus,
  Lock,
  Globe,
  Trash2,
  FolderPlus,
  ChevronLeft,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SavedView: React.FC = () => {
  const {
    collections,
    createCollection,
    deleteCollection,
    savedPostIds,
    posts,
    setSelectedPostForModal,
  } = useApp();

  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);

  const activeCollection = collections.find((c) => c.id === activeCollectionId);

  // Posts for the active collection or all saved
  const displayedPosts = activeCollection
    ? activeCollection.name === 'All Saved'
      ? posts.filter((p) => savedPostIds.includes(p.id))
      : posts.filter((p) => activeCollection.postIds.includes(p.id))
    : [];

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    createCollection(newCollectionName.trim(), isPrivate);
    setNewCollectionName('');
    setShowCreateModal(false);
  };

  return (
    <div id="saved-view" className="w-full max-w-4xl mx-auto px-4 py-4 pb-20 md:pb-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          {activeCollectionId ? (
            <button
              onClick={() => setActiveCollectionId(null)}
              className="p-1 rounded-lg text-zinc-400 hover:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <Bookmark className="w-5 h-5 text-purple-400" />
          )}
          <h2 className="font-extrabold text-base text-zinc-100">
            {activeCollection ? activeCollection.name : 'Saved Collections'}
          </h2>
        </div>

        {!activeCollectionId && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-rose-500 to-purple-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-rose-950/30"
          >
            <Plus className="w-4 h-4" />
            <span>New Collection</span>
          </button>
        )}
      </div>

      {/* Collection Grid when not drilled down */}
      {!activeCollectionId ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4">
          {collections.map((col) => {
            const count =
              col.name === 'All Saved' ? savedPostIds.length : col.postIds.length;
            const previewPost = posts.find((p) =>
              col.name === 'All Saved'
                ? savedPostIds.includes(p.id)
                : col.postIds.includes(p.id)
            );

            return (
              <div
                key={col.id}
                onClick={() => setActiveCollectionId(col.id)}
                className="group relative rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden cursor-pointer hover:border-zinc-700 transition aspect-square flex flex-col justify-between p-3.5"
              >
                {/* Background image if has posts */}
                {previewPost?.media[0]?.mediaUrl ? (
                  <img
                    src={previewPost.media[0].mediaUrl}
                    alt={col.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:scale-105 transition"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-950" />
                )}

                <div className="relative z-10 flex items-center justify-between">
                  <span className="p-2 rounded-xl bg-black/60 backdrop-blur-xs text-white">
                    <Bookmark className="w-4 h-4" />
                  </span>
                  {col.name !== 'All Saved' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCollection(col.id);
                      }}
                      className="p-1.5 rounded-lg bg-black/60 text-zinc-400 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition"
                      title="Delete collection"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="relative z-10 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-white truncate">{col.name}</h3>
                    {col.isPrivate ? (
                      <Lock className="w-3 h-3 text-zinc-400" />
                    ) : (
                      <Globe className="w-3 h-3 text-zinc-400" />
                    )}
                  </div>
                  <span className="text-[11px] text-zinc-300 font-medium">
                    {count} {count === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Posts in Selected Collection */
        <div>
          {displayedPosts.length === 0 ? (
            <div className="py-20 text-center text-zinc-500 text-xs">
              No posts saved in this collection yet.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 sm:gap-2">
              {displayedPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => setSelectedPostForModal(post)}
                  className="aspect-square bg-zinc-900 overflow-hidden cursor-pointer group relative"
                >
                  <img
                    src={post.media[0]?.mediaUrl}
                    alt={post.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Collection Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-zinc-950 border border-zinc-800 p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-sm text-zinc-100">Create Collection</h3>
            </div>

            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Collection Name</label>
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="e.g. Moodboard, Streetwear, Recipes"
                  required
                  autoFocus
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs text-zinc-300">Keep Private</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPrivate((prev) => !prev)}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition ${
                    isPrivate ? 'bg-purple-600 justify-end' : 'bg-zinc-800 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-rose-500 to-purple-600 text-white"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
