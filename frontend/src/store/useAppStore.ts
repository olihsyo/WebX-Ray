import { create } from 'zustand';
import { Project, ScanJob } from '../types';

export interface ToastNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: number;
}

interface AppState {
  // Current active project
  activeProjectId: string | null;
  activeProject: Project | null;
  setActiveProject: (project: Project | null) => void;
  setActiveProjectId: (id: string | null) => void;

  // Active scan tracking
  activeScan: ScanJob | null;
  setActiveScan: (scan: ScanJob | null) => void;

  // Selected viewport for inspection
  selectedViewport: 'desktop' | 'tablet' | 'mobile';
  setSelectedViewport: (viewport: 'desktop' | 'tablet' | 'mobile') => void;

  // Navigation / Active View
  activeScreen: string;
  setActiveScreen: (screen: string) => void;

  // Toast Notifications
  notifications: ToastNotification[];
  addNotification: (type: 'info' | 'success' | 'warning' | 'error', message: string) => void;
  removeNotification: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeProjectId: null,
  activeProject: null,
  setActiveProject: (project) => set({ activeProject: project, activeProjectId: project?.id || null }),
  setActiveProjectId: (id) => set({ activeProjectId: id }),

  activeScan: null,
  setActiveScan: (scan) => set({ activeScan: scan }),

  selectedViewport: 'desktop',
  setSelectedViewport: (viewport) => set({ selectedViewport: viewport }),

  activeScreen: 'overview',
  setActiveScreen: (screen) => set({ activeScreen: screen }),

  notifications: [],
  addNotification: (type, message) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      notifications: [...state.notifications, { id, type, message, timestamp: Date.now() }],
    }));
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, 5000);
  },
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
