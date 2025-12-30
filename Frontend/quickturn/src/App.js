import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from './Toast';
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

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing Page - Default */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registeru" element={<RegistrationPageU />} />
          <Route path="/registerm" element={<RegistrationPageM />} />

          {/* Dashboard Routes */}
          <Route path="/dashboardu" element={<DashboardU />} />
          <Route path="/dashboardm" element={<DashboardM />} />

          <Route path="/profile-mahasiswa" element={<ProfileM />} />
          <Route path="/profile-umkm" element={<ProfileU />} />

          {/* Public Profile Route */}
          <Route path="/profile/:userId" element={<PublicProfile />} />

          <Route path="/chat" element={<ChatPage />} />

          {/* Feature Routes */}
          <Route path="/post-project" element={<PostProject />} />

          {/* Fallback - Landing Page */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;