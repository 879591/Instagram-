/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopHeader } from './components/navigation/TopHeader';
import { BottomNav } from './components/navigation/BottomNav';
import { DesktopSidebar } from './components/navigation/DesktopSidebar';
import { Feed } from './components/feed/Feed';
import { ExploreView } from './components/explore/ExploreView';
import { ReelsView } from './components/reels/ReelsView';
import { CreatePostView } from './components/create/CreatePostView';
import { MessagesView } from './components/messages/MessagesView';
import { NotificationsView } from './components/notifications/NotificationsView';
import { SavedView } from './components/saved/SavedView';
import { ProfileView } from './components/profile/ProfileView';
import { SettingsView } from './components/settings/SettingsView';
import { AdminDashboard } from './components/admin/AdminDashboard';

// Modals
import { PostDetailModal } from './components/posts/PostDetailModal';
import { StoryViewer } from './components/stories/StoryViewer';
import { ReportModal } from './components/common/ReportModal';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    activeStoryId,
    reportModalTarget,
    theme,
  } = useApp();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return <Feed />;
      case 'explore':
        return <ExploreView />;
      case 'reels':
        return <ReelsView />;
      case 'create':
        return <CreatePostView />;
      case 'messages':
        return <MessagesView />;
      case 'notifications':
        return <NotificationsView />;
      case 'saved':
        return <SavedView />;
      case 'profile':
        return <ProfileView />;
      case 'settings':
        return <SettingsView />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <Feed />;
    }
  };

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-200 ${
        theme === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'
      }`}
    >
      {/* Desktop Sidebar Layout */}
      <div className="flex h-screen overflow-hidden">
        {/* Left Sidebar on desktop */}
        <DesktopSidebar />

        {/* Center / Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Top Header on mobile & tablet */}
          <TopHeader />

          {/* Active View Container (Scrollable) */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
            {renderActiveView()}
          </main>

          {/* Mobile Bottom Navigation */}
          <BottomNav />
        </div>
      </div>

      {/* Global Modals & Overlays */}
      <PostDetailModal />

      {activeStoryId && <StoryViewer />}

      {reportModalTarget && <ReportModal />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
