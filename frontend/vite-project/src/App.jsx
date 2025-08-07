import React from 'react';
import Home from './assets/Home';
import Login from './assets/Login'; // This is your Signup page
import LoginPage from './assets/LoginPage'; // This is your actual login form
import { BrowserRouter as BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Login />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
