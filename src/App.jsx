import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { KhataProvider } from './context/KhataContext';
import AppShell from './components/layout/AppShell';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import DailyBook from './pages/DailyBook';
import DailyPage from './pages/DailyPage';
import CustomerList from './pages/CustomerList';
import CustomerPage from './pages/CustomerPage';
import Analytics from './pages/Analytics';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Settings from './pages/Settings';
import ItemsInventory from './pages/ItemsInventory';

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <KhataProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected App Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
            {/* Daily Book is the home screen */}
            <Route index element={<DailyBook />} />

            {/* Dashboard — analytics overview */}
            <Route path="dashboard" element={<Dashboard />} />

            {/* Calendar — separate tab */}
            <Route path="calendar" element={<Calendar />} />
            <Route path="daily/:date" element={<DailyPage />} />

            {/* Customer management */}
            <Route path="customers" element={<CustomerList />} />
            <Route path="customers/:id" element={<CustomerPage />} />

            {/* Analytics */}
            <Route path="analytics" element={<Analytics />} />

            {/* Shop Settings */}
            <Route path="settings" element={<Settings />} />

            {/* Items Inventory */}
            <Route path="items" element={<ItemsInventory />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </KhataProvider>
    </AuthProvider>
  );
}
