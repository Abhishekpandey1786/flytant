import React from 'react';
import Home from './assets/Home';
import Login from './assets/Login';
import LoginPage from './assets/LoginPage'; 
import { BrowserRouter as BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './assets/Dashboard';
import Brand from './assets/Brand'; 
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Login />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/brand" element={<Brand />} />
        <Route path="/dashboard/influencer" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
