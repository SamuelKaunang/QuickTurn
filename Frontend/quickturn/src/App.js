import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from './LoginPage';
import RegistrationPageU from './RegistrationPageU';
import RegistrationPageM from './RegistrationPageM';
import DashboardU from "./DashboardU";
import DashboardM from "./DashboardM";
import PostProject from "./PostProject";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registeru" element={<RegistrationPageU/>} />
        <Route path="/registerm" element={<RegistrationPageM/>} />
        <Route path="/dashboardu" element={<DashboardU />} />
        <Route path="/dashboardm" element={<DashboardM />} />
        <Route path="*" element={<LoginPage />} />
        <Route path="/postproject" element={<PostProject />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
