import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from './Toast';
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


function App() {
  return (
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

          {/* Protected Feature Routes */}
          <Route path="/post-project" element={
            <ProtectedRoute allowedRoles={['UMKM', 'UKM']}>
              <PostProject />
            </ProtectedRoute>
          } />

          {/* Fallback - Landing Page */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;