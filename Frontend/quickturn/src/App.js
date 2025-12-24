import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from './LoginPage';
import RegistrationPageU from './RegistrationPageU';
import RegistrationPageM from './RegistrationPageM';
import DashboardU from "./DashboardU";
import DashboardM from "./DashboardM";
import PostProject from "./PostProject";
import ProfileM from './ProfileM';
import ProfileU from './ProfileU';
import ChatPage from './ChatPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registeru" element={<RegistrationPageU/>} />
        <Route path="/registerm" element={<RegistrationPageM/>} />
        
        {/* Dashboard Routes */}
        <Route path="/dashboardu" element={<DashboardU />} />
        <Route path="/dashboardm" element={<DashboardM />} />

        <Route path="/profile-mahasiswa" element={<ProfileM />} />
        <Route path="/profile-umkm" element={<ProfileU />} />

        <Route path="/chat" element={<ChatPage />} />
        
        {/* Feature Routes */}
        {/* FIXED: Added hyphen to match DashboardU navigation */}
        <Route path="/post-project" element={<PostProject />} />
        
        {/* Default / Fallback */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;