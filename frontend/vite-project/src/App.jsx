import React from "react";
import Home from "./assets/Home.jsx";
import Login from "./assets/Login.jsx";
import LoginPage from "./assets/LoginPage.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./assets/Dashboard.jsx";
import Brand from "./assets/Brand.jsx";
import { AuthProvider } from "./assets/AuthContext.jsx";
import Profile from "./assets/Profile.jsx";
import Campaigns from "./assets/Campaigns.jsx";
import CreateCampaign from "./assets/CreateCampaign.jsx";
import Chats from "./assets/Chats.jsx";
import { NotificationProvider } from "./assets/NotificationContext.jsx";
import GlobalNotifications from "./assets/GlobalNotifications.jsx";
import NotificationManager from "./assets/NotificationManager.jsx";
import Subscription from "./assets/Subscription.jsx";
import AppliedCampaigns from "./assets/AppliedCampaigns.jsx";
import ChatList from "./assets/ChatList.jsx";
import Footer from "./assets/Footer.jsx";
import SubscriptionPlans from "./assets/SubscriptionPlans.jsx";
import PrivateRoutes from "./assets/PrivateRoutes.jsx";
import Contact from "./assets/Contact.jsx";
import About from "./assets/About.jsx";
import Blog from "./assets/Blog.jsx";
import PrivacyPolicy from "./assets/PrivacyPolicy.jsx";
import TermsOfService from "./assets/TermsOfService.jsx";
import AdminLogin from "./assets/AdminLogin.jsx";
import AdminDashboard from "./assets/AdminDashboard.jsx";
import UserNotifications from "./assets/UserNotifications.jsx";
import MyOrders from "./assets/MyOrders.jsx";
import PaymentSuccess from "./assets/PaymentSuccess.jsx";
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
            <Route path="/admin/login" element={<AdminLogin />} />
            
            <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/blogs" element={<Blog />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route element={<PrivateRoutes />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/brand" element={<Brand />} />
              <Route path="/dashboard/influencer" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/create-campaign" element={<CreateCampaign />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route
                path="/chats/campaign/:campaignId/user/:userId"
                element={<Chats />}
              />
              <Route path="/subscription" element={Subscription} />
              <Route path="/chat/:influencerId" element={<Chats />} />
              <Route path="/applied-campaigns" element={<AppliedCampaigns />} />
              <Route path="/chatslist" element={<ChatList />} />
              <Route path="/SubscriptionPlans" element={<SubscriptionPlans />}/>
              <Route path="/UserNotifications" element={<UserNotifications />}/>
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/chats" element={<Chats />} />
            </Route>
          </Routes>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;
