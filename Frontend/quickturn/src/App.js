import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from './LoginPage';
import RegistrationPage from './RegistrationPage';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />        
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
