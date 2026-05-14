import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, ShoppingBag, Truck, Receipt,
  BarChart3, Shield, Settings, ChevronLeft, ChevronRight, Zap, KeyRound, Bug,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const devItems = [
  { to: '/debug', icon: Bug, label: 'Debug' },
];

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/vendors', icon: Users, label: 'Vendors' },
  { to: '/marketplace', icon: ShoppingBag, label: 'Marketplace' },
  { to: '/operations', icon: Truck, label: 'Operations' },
  { to: '/billing', icon: Receipt, label: 'Billing' },
  { to: '/analytics', icon: BarChart3, label: 'AI Analytics' },
  { to: '/compliance', icon: Shield, label: 'Compliance' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const AsiaNowLogo: React.FC<{ collapsed: boolean }> = ({ collapsed }) => (
  <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/10">
    <div className="relative flex-shrink-0 w-9 h-9 bg-asianow-red rounded-lg flex items-center justify-center shadow-sm">
      <svg viewBox="0 0 24 24" fill="white" width="22" height="22" aria-hidden="true">
        <circle cx="15" cy="3.5" r="1.5"/>
        <path d="M11.5 11l-1.5 7H8l1.5-5.5L8 11l-2-1 1-3.5C7.5 5.5 9 5 10.5 5.5l2 1c.8.4 1.5 1 1.5 2l.5 2.5 2.5.5-.5 2-3.5-.5z"/>
        <path d="M12 18l1 4H11l-.5-3L12 18z"/>
        <path d="M10.5 18l-.5 3H8l1-3H10.5z"/>
      </svg>
    </div>
    {!collapsed && (
      <div className="flex items-baseline gap-0.5 overflow-hidden">
        <span className="text-xl font-bold text-asianow-red leading-none">Asia</span>
        <span className="text-xl font-bold text-white leading-none">Now</span>
      </div>
    )}
  </div>
);

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle, mobileOpen, onMobileClose }) => {
  return (
    <aside
      className={`
        fixed md:static inset-y-0 left-0 z-50 md:z-30
        flex flex-col bg-asianow-dark h-screen
        sidebar-transition flex-shrink-0
        w-60 ${collapsed ? 'md:w-16' : 'md:w-60'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
      aria-label="Main navigation"
    >
      <AsiaNowLogo collapsed={collapsed} />

      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto" aria-label="Sidebar navigation">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onMobileClose}
            aria-label={label}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
              ${isActive
                ? 'bg-asianow-red text-white shadow-sm'
                : 'text-white/80 hover:text-white hover:bg-white/10'
              }`
            }
          >
            <Icon size={18} aria-hidden="true" className="flex-shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Owner Mode */}
      <div className="px-2 pb-1">
        <NavLink
          to="/owner"
          onClick={onMobileClose}
          aria-label="Owner Alignment"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 border ${
              isActive
                ? 'bg-amber-500 text-white border-amber-400 shadow-sm'
                : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border-amber-500/30'
            }`
          }
        >
          <KeyRound size={16} aria-hidden="true" className="flex-shrink-0" />
          {!collapsed && <span className="truncate text-xs font-bold uppercase tracking-wide">Owner Mode</span>}
        </NavLink>
      </div>

      {/* Dev Tools */}
      <div className="px-2 pb-2">
        {devItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onMobileClose}
            aria-label={label}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-white/10 text-white/90'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`
            }
          >
            <Icon size={15} aria-hidden="true" className="flex-shrink-0" />
            {!collapsed && <span className="truncate text-xs font-medium">{label}</span>}
          </NavLink>
        ))}
      </div>

      <div className={`px-2 py-4 border-t border-white/10 ${collapsed ? 'flex justify-center' : ''}`}>
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg mb-2">
            <div className="w-8 h-8 rounded-full bg-asianow-blue flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              JD
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">Julian D.</p>
              <p className="text-xs text-white/50 truncate">Operations Admin</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-full bg-asianow-blue flex items-center justify-center text-white text-xs font-bold mb-2">
            JD
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-1.5 bg-asianow-blue/20 rounded-lg px-3 py-1.5">
            <Zap size={12} className="text-asianow-red" />
            <span className="text-xs text-white/70 font-medium">AI-Enabled Platform</span>
          </div>
        </div>
      )}

      {/* Toggle button — desktop only */}
      <button
        onClick={onToggle}
        className="hidden md:flex absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center shadow-sm hover:bg-gray-50 transition-colors z-10"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed
          ? <ChevronRight size={12} className="text-gray-500" />
          : <ChevronLeft size={12} className="text-gray-500" />
        }
      </button>
    </aside>
  );
};
