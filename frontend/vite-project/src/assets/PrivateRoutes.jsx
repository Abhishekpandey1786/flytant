import React, { useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const PrivateRoutes = () => {
  const { user, token } = useContext(AuthContext);
  const isAuthenticated = user && token;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoutes;