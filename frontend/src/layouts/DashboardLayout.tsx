import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { FloatingSupportChatbot } from '../features/support/FloatingSupportChatbot';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden relative">
      <Navbar />
      <div className="flex-1 flex overflow-hidden min-h-0">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 min-h-0">
          <div className="max-w-7xl mx-auto space-y-8 pb-12">
            <Outlet />
          </div>
        </main>
      </div>
      {/* Global Floating Draggable Support Assistant Trigger & Chat Window */}
      <FloatingSupportChatbot />
    </div>
  );
};

