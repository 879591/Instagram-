/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Trash2, Edit3, Flag, Link, Bookmark, MessageCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Post } from '../../types';

interface PostOptionsModalProps {
  post: Post;
  onClose: () => void;
  onStartEdit?: () => void;
}

export const PostOptionsModal: React.FC<PostOptionsModalProps> = ({
  post,
  onClose,
  onStartEdit,
}) => {
  const {
    currentUser,
    deletePost,
    toggleSavePost,
    openReportModal,
    startConversationWith,
    sendMessage,
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [showShareDM, setShowShareDM] = useState(false);
  const isOwner = currentUser?.id === post.userId;
  const isAdmin = currentUser?.role === 'admin';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/#post-${post.id}`);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 1200);
  };

  const handleShareToDM = (targetUserId: string) => {
    const convId = startConversationWith(targetUserId);
    if (convId) {
      sendMessage(
        convId,
        `Shared a post by @${post.author.username}: "${post.caption.slice(0, 50)}..."`,
        post.media[0]?.mediaUrl,
        'image'
      );
    }
    onClose();
  };

  return (
    <div
      id="post-options-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xs rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-2xl divide-y divide-zinc-800 text-sm select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {isOwner && onStartEdit && (
          <button
            onClick={() => {
              onClose();
              onStartEdit();
            }}
            className="w-full px-4 py-3 flex items-center justify-center gap-2 font-medium text-zinc-200 hover:bg-zinc-800/80 transition"
          >
            <Edit3 className="w-4 h-4 text-zinc-400" />
            <span>Edit Caption</span>
          </button>
        )}

        {(isOwner || isAdmin) && (
          <button
            onClick={() => {
              deletePost(post.id);
              onClose();
            }}
            className="w-full px-4 py-3 flex items-center justify-center gap-2 font-semibold text-rose-500 hover:bg-rose-500/10 transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Post</span>
          </button>
        )}

        <button
          onClick={() => {
            toggleSavePost(post.id);
            onClose();
          }}
          className="w-full px-4 py-3 flex items-center justify-center gap-2 font-medium text-zinc-200 hover:bg-zinc-800/80 transition"
        >
          <Bookmark className="w-4 h-4 text-zinc-400" />
          <span>{post.isSaved ? 'Remove from Saved' : 'Save to Collection'}</span>
        </button>

        <button
          onClick={handleCopyLink}
          className="w-full px-4 py-3 flex items-center justify-center gap-2 font-medium text-zinc-200 hover:bg-zinc-800/80 transition"
        >
          <Link className="w-4 h-4 text-zinc-400" />
          <span>{copied ? 'Link Copied! ✓' : 'Copy Link'}</span>
        </button>

        {!isOwner && (
          <button
            onClick={() => {
              onClose();
              openReportModal({
                targetType: 'post',
                targetId: post.id,
                title: `Post by @${post.author.username}`,
              });
            }}
            className="w-full px-4 py-3 flex items-center justify-center gap-2 font-medium text-amber-400 hover:bg-amber-400/10 transition"
          >
            <Flag className="w-4 h-4" />
            <span>Report Post</span>
          </button>
        )}

        <button
          onClick={onClose}
          className="w-full px-4 py-3 text-center text-zinc-400 font-medium hover:bg-zinc-800/60 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
