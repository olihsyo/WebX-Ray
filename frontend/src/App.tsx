import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/layout/Layout';

// Pages
import { OverviewDashboard } from './pages/OverviewDashboard';
import { CreateProject } from './pages/CreateProject';
import { ScanConfig } from './pages/ScanConfig';
import { LiveScanMonitor } from './pages/LiveScanMonitor';
import { PageExplorer } from './pages/PageExplorer';
import { BrowserInspector } from './pages/BrowserInspector';
import { DOMExplorer } from './pages/DOMExplorer';
import { CSSInspector } from './pages/CSSInspector';
import { DesignSystemViewer } from './pages/DesignSystemViewer';
import { ComponentExplorer } from './pages/ComponentExplorer';
import { AssetExplorer } from './pages/AssetExplorer';
import { NetworkExplorer } from './pages/NetworkExplorer';
import { APIExplorer } from './pages/APIExplorer';
import { BackendExplorer } from './pages/BackendExplorer';
import { DatabaseExplorer } from './pages/DatabaseExplorer';
import { TechStack } from './pages/TechStack';
import { AIAnalysisWorkspace } from './pages/AIAnalysisWorkspace';
import { BlueprintViewer } from './pages/BlueprintViewer';
import { ReconstructionWorkspace } from './pages/ReconstructionWorkspace';
import { VisualComparisonPage } from './pages/VisualComparisonPage';
import { FunctionalTestingPage } from './pages/FunctionalTestingPage';
import { ExportCenter } from './pages/ExportCenter';
import { AIProviderSettings } from './pages/AIProviderSettings';
import { ProjectSettings } from './pages/ProjectSettings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<OverviewDashboard />} />
            <Route path="/projects/new" element={<CreateProject />} />
            <Route path="/scans/config" element={<ScanConfig />} />
            <Route path="/scans/monitor" element={<LiveScanMonitor />} />
            <Route path="/pages" element={<PageExplorer />} />
            <Route path="/browser" element={<BrowserInspector />} />
            <Route path="/dom" element={<DOMExplorer />} />
            <Route path="/css" element={<CSSInspector />} />
            <Route path="/design-system" element={<DesignSystemViewer />} />
            <Route path="/components" element={<ComponentExplorer />} />
            <Route path="/assets" element={<AssetExplorer />} />
            <Route path="/network" element={<NetworkExplorer />} />
            <Route path="/api-explorer" element={<APIExplorer />} />
            <Route path="/backend" element={<BackendExplorer />} />
            <Route path="/database" element={<DatabaseExplorer />} />
            <Route path="/tech-stack" element={<TechStack />} />
            <Route path="/ai-analysis" element={<AIAnalysisWorkspace />} />
            <Route path="/blueprint" element={<BlueprintViewer />} />
            <Route path="/reconstruction" element={<ReconstructionWorkspace />} />
            <Route path="/visual-compare" element={<VisualComparisonPage />} />
            <Route path="/testing" element={<FunctionalTestingPage />} />
            <Route path="/export" element={<ExportCenter />} />
            <Route path="/settings/ai" element={<AIProviderSettings />} />
            <Route path="/settings/project" element={<ProjectSettings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
