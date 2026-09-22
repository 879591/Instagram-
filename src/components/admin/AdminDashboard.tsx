/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  Film,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  UserX,
  UserCheck,
  Trash2,
  Activity,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ReportStatus } from '../../types';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    allUsers,
    posts,
    reels,
    reports,
    auditLogs,
    updateReportStatus,
    suspendUser,
    restoreUser,
    deleteUser,
    deletePost,
    switchUser,
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<'reports' | 'users' | 'logs'>('reports');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [moderationNote, setModerationNote] = useState('');

  // If current user is not admin, provide access notice
  if (currentUser?.role !== 'admin') {
    const adminUser = allUsers.find((u) => u.role === 'admin');

    return (
      <div className="w-full max-w-lg mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Administrator Access Required</h2>
          <p className="text-xs text-zinc-400 mt-1">
            You must be logged in with an administrator account to view the moderation queue and system audit logs.
          </p>
        </div>
        {adminUser && (
          <button
            onClick={() => switchUser(adminUser)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 text-white text-xs font-bold shadow-lg"
          >
            Switch to Admin (@{adminUser.username})
          </button>
        )}
      </div>
    );
  }

  const pendingReports = reports.filter((r) => r.status === 'pending');
  const filteredUsers = allUsers.filter(
    (u) =>
      u.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.displayName.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  return (
    <div id="admin-dashboard" className="w-full max-w-5xl mx-auto px-4 py-6 pb-20 md:pb-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white">Supriya Safety & Moderation Hub</h1>
            <p className="text-xs text-zinc-400">
              Community standards enforcement, incident triage, and administrative controls
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>RLS Protected</span>
          </span>
        </div>
      </div>

      {/* Platform Metrics Bento Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Total Accounts</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{allUsers.length}</div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Published Posts</span>
            <FileText className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-white">{posts.length}</div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Reels Stream</span>
            <Film className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{reels.length}</div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Pending Reports</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-400">{pendingReports.length}</div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveAdminTab('reports')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 -mb-px transition flex items-center gap-1.5 ${
            activeAdminTab === 'reports'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Moderation Queue ({pendingReports.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('users')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 -mb-px transition flex items-center gap-1.5 ${
            activeAdminTab === 'users'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('logs')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 -mb-px transition flex items-center gap-1.5 ${
            activeAdminTab === 'logs'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* Reports Queue */}
      {activeAdminTab === 'reports' && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 text-xs">
              No reports filed yet. The community is clean!
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className={`p-4 rounded-2xl border space-y-3 transition ${
                  report.status === 'pending'
                    ? 'bg-zinc-950 border-rose-500/40 shadow-xs'
                    : 'bg-zinc-900/40 border-zinc-800 opacity-70'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300">
                        {report.targetType}
                      </span>
                      <span className="text-xs font-bold text-white capitalize">
                        {report.category.replace('_', ' ')}
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-[11px] text-zinc-400">
                        Reported by @{report.reporter.username}
                      </span>
                    </div>
                    {report.previewInfo && (
                      <p className="text-xs text-zinc-300 font-medium">
                        Target: <span className="text-rose-400">{report.previewInfo}</span>
                      </p>
                    )}
                    <p className="text-xs text-zinc-400 leading-relaxed italic">
                      &quot;{report.reason}&quot;
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      report.status === 'pending'
                        ? 'bg-amber-500/20 text-amber-300'
                        : report.status === 'resolved'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {report.status}
                  </span>
                </div>

                {report.status === 'pending' && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-900">
                    <button
                      onClick={() =>
                        updateReportStatus(report.id, 'dismissed', 'Reviewed and dismissed as benign')
                      }
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Dismiss Report</span>
                    </button>

                    <button
                      onClick={() => {
                        updateReportStatus(
                          report.id,
                          'resolved',
                          'Content removed and guidelines warning dispatched'
                        );
                        if (report.targetType === 'post') {
                          deletePost(report.targetId);
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Enforce & Resolve</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* User Directory */}
      {activeAdminTab === 'users' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              placeholder="Search user accounts by name or @handle..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-rose-500"
            />
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-900">
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName}
                    className="w-10 h-10 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-zinc-100">{user.displayName}</span>
                      {user.role === 'admin' && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white text-[9px] font-bold">
                          ADMIN
                        </span>
                      )}
                      {user.isSuspended && (
                        <span className="px-1.5 py-0.2 rounded bg-red-900/60 text-red-200 text-[9px] font-bold">
                          SUSPENDED
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-400">@{user.username}</span>
                    <span className="text-[10px] text-zinc-600 block">{user.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {user.id !== currentUser.id && (
                    <>
                      {user.isSuspended ? (
                        <button
                          onClick={() => restoreUser(user.id)}
                          className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-500/20 flex items-center gap-1"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Unsuspend</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => suspendUser(user.id)}
                          className="px-3 py-1 rounded-lg bg-red-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold hover:bg-rose-500/20 flex items-center gap-1"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Suspend</span>
                        </button>
                      )}
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-500 transition"
                        title="Delete account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Logs */}
      {activeAdminTab === 'logs' && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-900 text-xs">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-3.5 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-zinc-800 text-zinc-200">
                    {log.actionType}
                  </span>
                  <span className="font-semibold text-zinc-200">by {log.adminName}</span>
                </div>
                <p className="text-zinc-400 text-[11px]">{log.notes}</p>
              </div>
              <span className="text-[10px] text-zinc-500">
                {new Date(log.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
