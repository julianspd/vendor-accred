import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { VendorAccreditation } from './pages/VendorAccreditation';
import { Marketplace } from './pages/Marketplace';
import { Operations } from './pages/Operations';
import { Billing } from './pages/Billing';
import { Analytics } from './pages/Analytics';
import { Compliance } from './pages/Compliance';
import { Settings } from './pages/Settings';
import { VendorOnboarding } from './pages/VendorOnboarding';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<VendorOnboarding />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="vendors" element={<VendorAccreditation />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="operations" element={<Operations />} />
          <Route path="billing" element={<Billing />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="compliance" element={<Compliance />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
