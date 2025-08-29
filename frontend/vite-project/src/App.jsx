import React from 'react';
import Home from './assets/Home.jsx';
import Login from './assets/Login.jsx';
import LoginPage from './assets/LoginPage.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './assets/Dashboard.jsx';
import Brand from './assets/Brand.jsx';
import { AuthProvider } from './assets/AuthContext.jsx';
import Profile from './assets/Profile.jsx';
import Campaigns from './assets/Campaigns.jsx';
import CreateCampaign from './assets/CreateCampaign.jsx';
import Chats from './assets/Chats.jsx';
import { NotificationProvider } from './assets/NotificationContext.jsx';
import GlobalNotifications from './assets/GlobalNotifications.jsx';
import NotificationManager from './assets/NotificationManager.jsx';

function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          <NotificationManager />
          <GlobalNotifications />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<Login />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/brand" element={<Brand />} />
            <Route path="/dashboard/influencer" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/create-campaign" element={<CreateCampaign />} />
            <Route path="/chats/campaign/:campaignId/user/:userId" element={<Chats />} />
          </Routes>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;
