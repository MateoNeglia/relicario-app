import React, { useContext } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ProtectedRoute from '../utils/ProtectedRoute';
import AdminProtectedRoute from '../utils/AdminProtectedRoute';
import RegisterPage from '../pages/auth/Register/RegisterPage';
import LoginPage from '../pages/auth/Login/LoginPage';
import MainLayout from '../layouts/MainLayout/MainLayout';

const ResetPassword = () => <div>Reset Password (TBD)</div>;
const ForgotPassword = () => <div>Forgot Password (TBD)</div>;
const EmailConfirmation = () => <div>Email Confirmation (TBD)</div>;

export default function RouterComponent() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <Routes>
      {/* rutas públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/email-confirmation" element={<EmailConfirmation />} />

      {/* rutas protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route 
          path="/profile" 
          element={<MainLayout page="profile" />} />
        <Route 
          path="/search" 
          element={<MainLayout page="search" />} />
        <Route
          path="/relic/:id"
          element={<MainLayout page="relic-page" />}/>
        <Route
          path="/relic/add"
          element={<MainLayout page="add-relic" />}/>
        <Route
          path="/relic/update/:id"
          element={<MainLayout page="update-relic" />}/>
        <Route
          path="/reliquary"
          element={<MainLayout page="reliquary" />}/>
        <Route
          path="/reliquary/:id"
          element={<MainLayout page="niche-reliquary" />}/>
      </Route>

      {/* rutas del admin */}
      <Route element={<AdminProtectedRoute />}>
        <Route path="/admin" element={<MainLayout page="admin" />} />
      </Route>

      {/* ruta base para usuarios no autenticados */}
      <Route
        path="/"
        element={<MainLayout page={user ? 'home' : 'landing'} />}
      />

      {/* catchea todas las rutas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}