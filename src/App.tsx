import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthEventHandler } from './components/AuthEventHandler';
import { TourProvider } from './context/TourContext';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';

import { lazyRetry } from './utils/lazyRetry';

// Lazy Load Pages for Performance with Retry Logic
// Using named export pattern: .then(module => ({ default: module.Component }))
const Login = lazyRetry(() => import('./pages/Login').then(module => ({ default: module.Login })));
const Signup = lazyRetry(() => import('./pages/Signup').then(module => ({ default: module.Signup })));
const ResetPassword = lazyRetry(() => import('./pages/ResetPassword').then(module => ({ default: module.ResetPassword })));
const Dashboard = lazyRetry(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Leads = lazyRetry(() => import('./pages/Leads').then(module => ({ default: module.Leads })));
const Pipeline = lazyRetry(() => import('./pages/Pipeline').then(module => ({ default: module.Pipeline })));
const Plans = lazyRetry(() => import('./pages/Plans').then(module => ({ default: module.Plans })));
const Reports = lazyRetry(() => import('./pages/Reports').then(module => ({ default: module.Reports })));
const Settings = lazyRetry(() => import('./pages/Settings').then(module => ({ default: module.Settings })));

// Loading Component
const PageLoader = () => (
  <div className="min-h-screen bg-dark-bg flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Marketing Pages
const TrafficAds = lazyRetry(() => import('./pages/marketing/TrafficAds').then(module => ({ default: module.TrafficAds })));
const MarketingPlanning = lazyRetry(() => import('./pages/marketing/MarketingPlanning').then(module => ({ default: module.MarketingPlanning })));
const CreativeLibrary = lazyRetry(() => import('./pages/marketing/CreativeLibrary').then(module => ({ default: module.CreativeLibrary })));


import { AppHashHandler, getInitialHash } from './components/Auth/SupabaseHashHandler';

const CalendarView = lazyRetry(() => import('./modules/calendar/components/CalendarView'));

// Inbox Pages
const UnifiedInbox = lazyRetry(() => import('./pages/inbox/UnifiedInbox').then(module => ({ default: module.UnifiedInbox })));
const InboxIntegrations = lazyRetry(() => import('./pages/inbox/InboxIntegrations').then(module => ({ default: module.InboxIntegrations })));

const App: React.FC = () => {
  return (
    <AppHashHandler>
      <AuthProvider>
        <HashRouter>
          <TourProvider>
            <AuthEventHandler />
            <React.Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/plans" element={<Plans />} />

                <Route path="/" element={
                  <Layout>
                    <Dashboard />
                  </Layout>
                } />

                <Route path="/pipeline" element={
                  <Layout>
                    <Pipeline />
                  </Layout>
                } />

                <Route path="/leads" element={
                  <Layout>
                    <Leads />
                  </Layout>
                } />

                <Route path="/calendar" element={
                  <Layout>
                    <CalendarView />
                  </Layout>
                } />

                <Route path="/reports" element={
                  <Layout>
                    <Reports />
                  </Layout>
                } />

                <Route path="/settings" element={
                  <Layout>
                    <Settings />
                  </Layout>
                } />

                {/* Marketing Routes */}
                <Route path="/marketing/traffic" element={
                  <Layout>
                    <TrafficAds />
                  </Layout>
                } />
                <Route path="/marketing/planning" element={
                  <Layout>
                    <MarketingPlanning />
                  </Layout>
                } />
                <Route path="/marketing/creatives" element={
                  <Layout>
                    <CreativeLibrary />
                  </Layout>
                } />

                {/* Inbox Routes */}
                <Route path="/inbox" element={
                  <Layout>
                    <UnifiedInbox />
                  </Layout>
                } />
                <Route path="/inbox/integrations" element={
                  <Layout>
                    <InboxIntegrations />
                  </Layout>
                } />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </React.Suspense>
          </TourProvider>
        </HashRouter>
      </AuthProvider>
    </AppHashHandler>
  );
};


export default App;