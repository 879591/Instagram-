/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Send,
  Image as ImageIcon,
  CheckCheck,
  ChevronLeft,
  Trash2,
  Smile,
  Circle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MessagesView: React.FC = () => {
  const {
    conversations,
    messages,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    deleteMessage,
    currentUser,
    navigateToProfile,
  } = useApp();

  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const currentMessages = activeConversationId ? messages[activeConversationId] || [] : [];

  const otherParticipant = activeConversation?.participants.find(
    (p) => p.id !== currentUser?.id
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length, activeConversationId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!messageText.trim() && !selectedImageFile) || !activeConversationId) return;

    sendMessage(
      activeConversationId,
      messageText.trim(),
      selectedImageFile || undefined,
      selectedImageFile ? 'image' : 'text'
    );

    setMessageText('');
    setSelectedImageFile(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImageFile(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const filteredConversations = conversations.filter((c) => {
    const other = c.participants.find((p) => p.id !== currentUser?.id);
    if (!other) return true;
    return (
      other.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      other.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div
      id="messages-view"
      className="w-full max-w-4xl mx-auto h-[calc(100vh-3.5rem)] md:h-[calc(100vh-2rem)] flex bg-zinc-950 md:border border-zinc-800 md:rounded-3xl overflow-hidden shadow-2xl select-none"
    >
      {/* Conversations List (Left sidebar on desktop, full screen on mobile when no active chat) */}
      <div
        className={`w-full md:w-80 shrink-0 border-r border-zinc-800 flex flex-col bg-zinc-950 ${
          activeConversationId ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="font-extrabold text-sm text-zinc-100">Messages</h2>
          <span className="text-xs text-zinc-400 font-semibold">
            {conversations.length} {conversations.length === 1 ? 'chat' : 'chats'}
          </span>
        </div>

        {/* Search Chats */}
        <div className="p-3 border-b border-zinc-800/80">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* Conversation Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-900">
          {filteredConversations.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              No conversations found.
            </div>
          ) : (
            filteredConversations.map((c) => {
              const other = c.participants.find((p) => p.id !== currentUser?.id);
              if (!other) return null;
              const isSelected = c.id === activeConversationId;

              return (
                <div
                  key={c.id}
                  onClick={() => setActiveConversationId(c.id)}
                  className={`flex items-center gap-3 p-3.5 cursor-pointer transition ${
                    isSelected
                      ? 'bg-rose-500/10 border-l-2 border-rose-500'
                      : 'hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={other.avatarUrl}
                      alt={other.displayName}
                      className="w-11 h-11 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <Circle className="w-3 h-3 text-emerald-500 fill-emerald-500 absolute bottom-0 right-0 ring-2 ring-zinc-950" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-zinc-100 truncate">
                        {other.displayName}
                      </span>
                      <span className="text-[10px] text-zinc-500 shrink-0">
                        {new Date(c.updatedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs text-zinc-400 truncate">
                        {c.lastMessage?.content || 'Started a conversation'}
                      </span>
                      {c.unreadCount > 0 && (
                        <span className="h-4 min-w-[16px] px-1 rounded-full bg-rose-600 text-[10px] font-bold text-white flex items-center justify-center shrink-0">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Active Conversation Chat Window (Right side) */}
      <div
        className={`flex-1 flex flex-col bg-zinc-950 ${
          activeConversationId ? 'flex' : 'hidden md:flex'
        }`}
      >
        {activeConversation && otherParticipant ? (
          <>
            {/* Chat Top Header */}
            <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-950/80 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setActiveConversationId(null)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white md:hidden"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div
                  onClick={() => navigateToProfile(otherParticipant.username)}
                  className="flex items-center gap-2.5 cursor-pointer"
                >
                  <img
                    src={otherParticipant.avatarUrl}
                    alt={otherParticipant.displayName}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-rose-500/40"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <span className="font-bold text-xs text-zinc-100 block">
                      {otherParticipant.displayName}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-medium">Active now</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigateToProfile(otherParticipant.username)}
                className="px-3 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition"
              >
                View Profile
              </button>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {currentMessages.length === 0 ? (
                <div className="text-center py-16 space-y-2 text-zinc-500">
                  <p className="text-xs">
                    This is the beginning of your direct message history with{' '}
                    <strong className="text-zinc-300">@{otherParticipant.username}</strong>.
                  </p>
                </div>
              ) : (
                currentMessages.map((msg) => {
                  const isSentByMe = msg.senderId === currentUser?.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isSentByMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-end gap-1.5 max-w-[80%] group">
                        {isSentByMe && (
                          <button
                            onClick={() => deleteMessage(activeConversation.id, msg.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 transition"
                            title="Delete message"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <div
                          className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                            isSentByMe
                              ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-br-none shadow-md shadow-rose-950/30'
                              : 'bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-bl-none'
                          }`}
                        >
                          {msg.mediaUrl && (
                            <img
                              src={msg.mediaUrl}
                              alt="attachment"
                              className="w-full max-h-56 rounded-xl object-cover mb-2"
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <p>{msg.content}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 mt-1 text-[10px] text-zinc-500 px-1">
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {isSentByMe && <CheckCheck className="w-3 h-3 text-rose-400" />}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Image Preview before sending */}
            {selectedImageFile && (
              <div className="px-4 py-2 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={selectedImageFile}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded-lg border border-zinc-700"
                  />
                  <span className="text-xs text-zinc-300">Ready to send photo</span>
                </div>
                <button
                  onClick={() => setSelectedImageFile(null)}
                  className="text-xs text-rose-400 font-semibold hover:underline"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Message Input Form */}
            <form
              onSubmit={handleSend}
              className="p-3 border-t border-zinc-800 flex items-center gap-2 bg-zinc-950"
            >
              <label
                className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer transition"
                title="Send photo"
              >
                <ImageIcon className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={`Message ${otherParticipant.displayName}...`}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-rose-500 transition"
              />

              <button
                type="submit"
                disabled={!messageText.trim() && !selectedImageFile}
                className="p-2.5 rounded-full bg-gradient-to-r from-rose-500 to-purple-600 text-white disabled:opacity-40 transition shadow-md shadow-rose-950/30"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-zinc-500 space-y-3">
            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-rose-500">
              <Smile className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-200">Your Direct Messages</h3>
              <p className="text-xs text-zinc-500 max-w-xs mt-1">
                Select an existing conversation from the left or visit any profile to message friends.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
