import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-asianow-light">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <Header
          sidebarCollapsed={collapsed}
          onMenuToggle={() => setMobileOpen(!mobileOpen)}
        />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-3 md:p-6"
          role="main"
          aria-label="Main content"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
