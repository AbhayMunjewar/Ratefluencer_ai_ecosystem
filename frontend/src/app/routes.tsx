import { createBrowserRouter, Navigate } from 'react-router';
import { lazy, Suspense, type ReactNode } from 'react';
import { AppLayout } from './AppLayout';

const Landing = lazy(() => import('./pages/Landing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const InfluencerSearch = lazy(() => import('./pages/InfluencerSearch'));
const InfluencerProfile = lazy(() => import('./pages/InfluencerProfile'));
const AuthenticityAnalysis = lazy(() => import('./pages/AuthenticityAnalysis'));
const GrowthPrediction = lazy(() => import('./pages/GrowthPrediction'));
const BrandMatching = lazy(() => import('./pages/BrandMatching'));
const Campaigns = lazy(() => import('./pages/Campaigns'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const AICopilot = lazy(() => import('./pages/AICopilot'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const Settings = lazy(() => import('./pages/Settings'));

function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      minHeight: 300,
      gap: 12,
    }}>
      <div style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: '#38BDF8',
        animation: 'loaderPulse 1.2s ease-in-out infinite',
      }} />
      <div style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: '#38BDF8',
        animation: 'loaderPulse 1.2s ease-in-out 0.2s infinite',
      }} />
      <div style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: '#38BDF8',
        animation: 'loaderPulse 1.2s ease-in-out 0.4s infinite',
      }} />
      <style>{`
        @keyframes loaderPulse {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

function Wrap({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Wrap><Landing /></Wrap>,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { path: 'dashboard', element: <Wrap><Dashboard /></Wrap> },
      { path: 'influencers', element: <Wrap><InfluencerSearch /></Wrap> },
      { path: 'influencers/:id', element: <Wrap><InfluencerProfile /></Wrap> },
      { path: 'authenticity', element: <Wrap><AuthenticityAnalysis /></Wrap> },
      { path: 'growth', element: <Wrap><GrowthPrediction /></Wrap> },
      { path: 'brand-matching', element: <Wrap><BrandMatching /></Wrap> },
      { path: 'campaigns', element: <Wrap><Campaigns /></Wrap> },
      { path: 'leaderboard', element: <Wrap><Leaderboard /></Wrap> },
      { path: 'copilot', element: <Wrap><AICopilot /></Wrap> },
      { path: 'admin', element: <Wrap><AdminPanel /></Wrap> },
      { path: 'settings', element: <Wrap><Settings /></Wrap> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
