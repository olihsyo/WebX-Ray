import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAppStore } from '../../store/useAppStore';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const Layout: React.FC = () => {
  const { notifications, removeNotification } = useAppStore();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-main">
      {/* 256px Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* 64px Header */}
        <Header />

        {/* Scrollable Main Viewport */}
        <main className="flex-1 overflow-y-auto p-6 bg-background/50">
          <Outlet />
        </main>
      </div>

      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-center space-x-2.5 px-4 py-3 rounded-lg border shadow-xl transition-all duration-200 text-xs ${
              n.type === 'success'
                ? 'bg-surface border-primary/40 text-main'
                : n.type === 'warning'
                ? 'bg-surface border-warning/40 text-main'
                : n.type === 'error'
                ? 'bg-surface border-error/40 text-main'
                : 'bg-surface border-ai/40 text-main'
            }`}
          >
            {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
            {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-warning shrink-0" />}
            {n.type === 'error' && <AlertCircle className="w-4 h-4 text-error shrink-0" />}
            {n.type === 'info' && <Info className="w-4 h-4 text-ai shrink-0" />}

            <span className="font-medium">{n.message}</span>

            <button
              onClick={() => removeNotification(n.id)}
              className="text-secondary hover:text-main ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
