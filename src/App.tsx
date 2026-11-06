/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AdProvider } from './contexts/AdContext';
import { MainLayout } from './components/layout/MainLayout';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Directory } from './pages/Directory';
import { Monks } from './pages/Monks';
import { MonkDetail } from './pages/MonkDetail';
import { LearnBuddhism } from './pages/LearnBuddhism';
import { Temples } from './pages/Temples';
import { TempleDetail } from './pages/TempleDetail';
import { Videos } from './pages/Videos';
import { Classifieds } from './pages/Classifieds';
import { Profile } from './pages/Profile';
import { GroupDetail } from './pages/GroupDetail';
import { AdminPanel } from './pages/AdminPanel';
import { Restaurants } from './pages/Restaurants';
import { FamousPeople } from './pages/FamousPeople';
import { PublicDigitalCardView } from './pages/PublicDigitalCardView';
import { AnimatePresence, motion } from 'motion/react';

import { Events } from './pages/Events';

// Protected Route Wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// Dummy page component for unbuilt routes
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-2xl">🚧</span>
      </div>
      <h2 className="text-2xl font-bold text-neutral-900 mb-2">{title}</h2>
      <p className="text-neutral-500 max-w-md">This section is currently under development. Please check back later.</p>
    </div>
  );
}

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

import { SectionProvider, SectionGuard } from './contexts/SectionContext';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      {/* @ts-expect-error key is not in RoutesProps but works in React */}
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        {/* Public Digital Business Card View - accessible without login */}
        <Route path="/card/:id" element={<PageTransition><PublicDigitalCardView /></PageTransition>} />
        
        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<PageTransition><Home /></PageTransition>} />
          <Route 
            path="directory" 
            element={
              <PageTransition>
                <SectionGuard section="directory" title="Community Directory">
                  <Directory />
                </SectionGuard>
              </PageTransition>
            } 
          />
          <Route 
            path="classifieds" 
            element={
              <PageTransition>
                <SectionGuard section="classifieds" title="Classifieds & Auctions">
                  <Classifieds />
                </SectionGuard>
              </PageTransition>
            } 
          />
          <Route 
            path="events" 
            element={
              <PageTransition>
                <SectionGuard section="events" title="Community Events">
                  <Events />
                </SectionGuard>
              </PageTransition>
            } 
          />
          <Route 
            path="temples" 
            element={
              <PageTransition>
                <SectionGuard section="temples" title="Buddhist Temples">
                  <Temples />
                </SectionGuard>
              </PageTransition>
            } 
          />
          <Route 
            path="temples/:id" 
            element={
              <PageTransition>
                <SectionGuard section="temples" title="Buddhist Temples">
                  <TempleDetail />
                </SectionGuard>
              </PageTransition>
            } 
          />
          <Route 
            path="restaurants" 
            element={
              <PageTransition>
                <SectionGuard section="restaurants" title="Restaurants & Food">
                  <Restaurants />
                </SectionGuard>
              </PageTransition>
            } 
          />
          <Route path="groups/:id" element={<PageTransition><GroupDetail /></PageTransition>} />
          <Route 
            path="monks" 
            element={
              <PageTransition>
                <SectionGuard section="monks" title="Buddhist Monks">
                  <Monks />
                </SectionGuard>
              </PageTransition>
            } 
          />
          <Route 
            path="monks/:id" 
            element={
              <PageTransition>
                <SectionGuard section="monks" title="Buddhist Monks">
                  <MonkDetail />
                </SectionGuard>
              </PageTransition>
            } 
          />
          <Route path="profile" element={<PageTransition><Profile /></PageTransition>} />
          <Route path="admin" element={<PageTransition><AdminPanel /></PageTransition>} />
          <Route 
            path="famous" 
            element={
              <PageTransition>
                <SectionGuard section="famous" title="Famous People Directory">
                  <FamousPeople />
                </SectionGuard>
              </PageTransition>
            } 
          />
          <Route 
            path="learn" 
            element={
              <PageTransition>
                <SectionGuard section="learn" title="Learn Buddhism & Training Courses">
                  <LearnBuddhism />
                </SectionGuard>
              </PageTransition>
            } 
          />
          <Route 
            path="videos" 
            element={
              <PageTransition>
                <SectionGuard section="videos" title="Dhamma Video Sermons">
                  <Videos />
                </SectionGuard>
              </PageTransition>
            } 
          />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AdProvider>
        <SectionProvider>
          <Router>
            <AnimatedRoutes />
          </Router>
        </SectionProvider>
      </AdProvider>
    </AuthProvider>
  );
}
