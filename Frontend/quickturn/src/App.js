import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { ToastProvider } from './components/Toast';
import { SettingsProvider } from './layouts/SettingsContext';
import { ProtectedRoute, AuthRoute } from './layouts/RouteGuards';
import { HelmetProvider } from 'react-helmet-async';

// Lazy load all pages for code splitting - improves initial load time
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegistrationPageU = lazy(() => import('./pages/RegistrationPageU'));
const RegistrationPageM = lazy(() => import('./pages/RegistrationPageM'));
const DashboardU = lazy(() => import('./pages/DashboardU'));
const DashboardM = lazy(() => import('./pages/DashboardM'));
const PostProject = lazy(() => import('./pages/PostProject'));
const ProfileM = lazy(() => import('./pages/ProfileM'));
const ProfileU = lazy(() => import('./pages/ProfileU'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const PublicProfile = lazy(() => import('./pages/PublicProfile'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminReports = lazy(() => import('./pages/AdminReports'));
const SearchUsers = lazy(() => import('./pages/SearchUsers'));
const OAuth2Callback = lazy(() => import('./pages/OAuth2Callback'));
const SelectRole = lazy(() => import('./pages/SelectRole'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const EmailVerificationRequired = lazy(() => import('./pages/EmailVerificationRequired'));
const TermsConditions = lazy(() => import('./pages/TermsConditions'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
const FAQ = lazy(() => import('./pages/FAQ'));

// Loading fallback component
const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
  }}>
    <div style={{
      width: '50px',
      height: '50px',
      border: '3px solid rgba(255,255,255,0.1)',
      borderTop: '3px solid #6366f1',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

function App() {
  return (
    <SettingsProvider>
      <ToastProvider>
        <HelmetProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Landing Page - Public */}
              <Route path="/" element={<LandingPage />} />

              {/* Auth Routes - Redirect to dashboard if already logged in */}
              <Route path="/login" element={
                <AuthRoute>
                  <LoginPage />
                </AuthRoute>
              } />
              <Route path="/registeru" element={
                <AuthRoute>
                  <RegistrationPageU />
                </AuthRoute>
              } />
              <Route path="/registerm" element={
                <AuthRoute>
                  <RegistrationPageM />
                </AuthRoute>
              } />

              {/* OAuth2 Callback Route - Handles Google login redirect */}
              <Route path="/oauth2/callback" element={<OAuth2Callback />} />

              {/* Role Selection Route - For new OAuth users */}
              <Route path="/select-role" element={<SelectRole />} />

              {/* Email Verification Routes */}
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/email-verification-required" element={<EmailVerificationRequired />} />

              {/* Protected Dashboard Routes */}
              <Route path="/dashboardu" element={
                <ProtectedRoute allowedRoles={['UMKM', 'UKM']}>
                  <DashboardU />
                </ProtectedRoute>
              } />
              <Route path="/dashboardm" element={
                <ProtectedRoute allowedRoles={['MAHASISWA']}>
                  <DashboardM />
                </ProtectedRoute>
              } />

              {/* Protected Profile Routes */}
              <Route path="/profile-mahasiswa" element={
                <ProtectedRoute allowedRoles={['MAHASISWA']}>
                  <ProfileM />
                </ProtectedRoute>
              } />
              <Route path="/profile-umkm" element={
                <ProtectedRoute allowedRoles={['UMKM', 'UKM']}>
                  <ProfileU />
                </ProtectedRoute>
              } />

              {/* Public Profile Route - Protected but any role can access */}
              <Route path="/profile/:userId" element={
                <ProtectedRoute>
                  <PublicProfile />
                </ProtectedRoute>
              } />

              {/* Protected Chat Route */}
              <Route path="/chat" element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/reports" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminReports />
                </ProtectedRoute>
              } />

              {/* Protected Feature Routes */}
              <Route path="/post-project" element={
                <ProtectedRoute allowedRoles={['UMKM', 'UKM']}>
                  <PostProject />
                </ProtectedRoute>
              } />

              <Route path="/search-users" element={
                <ProtectedRoute>
                  <SearchUsers />
                </ProtectedRoute>
              } />

              {/* Fallback - Landing Page */}
              {/* Fallback - Landing Page */}
              <Route path="*" element={<LandingPage />} />
              
              {/* Legal Routes */}
              <Route path="/terms" element={<TermsConditions />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/refund" element={<RefundPolicy />} />
              <Route path="/faq" element={<FAQ />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        </HelmetProvider>
        {/* Vercel Analytics & Speed Insights */}
        <Analytics />
        <SpeedInsights />
      </ToastProvider>
    </SettingsProvider>
  );
}

export default App;