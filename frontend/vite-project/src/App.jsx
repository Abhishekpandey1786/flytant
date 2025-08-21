import React from 'react';
import Home from './assets/Home';
import Login from './assets/Login';
import LoginPage from './assets/LoginPage'; 
import { BrowserRouter as BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './assets/Dashboard';
import Brand from './assets/Brand'; 
import { AuthProvider } from './assets/AuthContext';
import Profile from './assets/Profile'; // Import Profile component
import Campaigns from './assets/Campaigns';
import CreateCampaign from './assets/CreateCampaign'; // Import CreateCampaign component
function App() {
  return (
    <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Login />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/brand" element={<Brand />} />
        <Route path="/dashboard/influencer" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/campaigns" element={<Campaigns/>} />
                <Route path="/create-campaign" element={<CreateCampaign />} />
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
