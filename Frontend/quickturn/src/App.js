import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { ToastProvider } from './Toast';
import { SettingsProvider } from './SettingsContext';
import { ProtectedRoute, AuthRoute } from './RouteGuards';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
import RegistrationPageU from './RegistrationPageU';
import RegistrationPageM from './RegistrationPageM';
import DashboardU from "./DashboardU";
import DashboardM from "./DashboardM";
import PostProject from "./PostProject";
import ProfileM from './ProfileM';
import ProfileU from './ProfileU';
import ChatPage from './ChatPage';
import PublicProfile from './PublicProfile';
import AdminDashboard from './AdminDashboard';
import AdminReports from './AdminReports';
import SearchUsers from './SearchUsers';
import OAuth2Callback from './OAuth2Callback';
import SelectRole from './SelectRole';


function App() {
  return (
    <SettingsProvider>
      <ToastProvider>
        <BrowserRouter>
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
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </BrowserRouter>

        {/* Vercel Analytics & Speed Insights */}
        <Analytics />
        <SpeedInsights />
      </ToastProvider>
    </SettingsProvider>
  );
}

export default App;