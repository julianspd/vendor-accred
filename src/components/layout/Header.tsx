import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Bell, ChevronDown, Search, LogOut, User, Settings, Menu } from 'lucide-react';
import { notifications } from '../../data/notifications';

const routeLabels: Record<string, string[]> = {
  '/dashboard': ['Home', 'Dashboard'],
  '/vendors': ['Home', 'Vendor Accreditation'],
  '/marketplace': ['Home', 'Requirement Marketplace'],
  '/operations': ['Home', 'Operations & Deployment'],
  '/billing': ['Home', 'Billing & Collections'],
  '/analytics': ['Home', 'AI Analytics'],
  '/compliance': ['Home', 'Compliance'],
  '/settings': ['Home', 'Settings'],
  '/onboarding': ['Home', 'Vendor Onboarding'],
};

interface HeaderProps {
  sidebarCollapsed: boolean;
  onMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [readNotifs, setReadNotifs] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const breadcrumbs = routeLabels[location.pathname] || ['Home'];
  const unreadCount = notifications.filter(n => !n.read && !readNotifs.has(n.id)).length;

  const handleMarkAllRead = () => {
    setReadNotifs(new Set(notifications.map(n => n.id)));
  };

  return (
    <header className="bg-white border-b border-gray-100 h-16 flex items-center px-3 md:px-6 gap-2 md:gap-4 flex-shrink-0" role="banner">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuToggle}
        className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
        aria-label="Open navigation menu"
      >
        <Menu size={20} />
      </button>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex-1 min-w-0">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm">
          {breadcrumbs.map((crumb, i) => (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-gray-300">/</span>}
              <span className={`${i === breadcrumbs.length - 1 ? 'font-semibold text-gray-900' : 'text-gray-400'} truncate max-w-[150px] sm:max-w-none`}>
                {crumb}
              </span>
            </li>
          ))}
        </ol>
      </nav>

      {/* Search */}
      <div className="relative hidden md:block">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
        <input
          type="search"
          placeholder="Search vendors, requirements..."
          className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-asianow-blue focus:border-transparent"
          aria-label="Global search"
        />
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
          className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
          aria-haspopup="true"
          aria-expanded={showNotifications}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-asianow-red text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {showNotifications && (
          <div
            className="absolute right-0 top-12 w-80 max-w-[calc(100vw-1rem)] bg-white rounded-xl border border-gray-100 shadow-xl z-50"
            role="menu"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="font-semibold text-sm text-gray-900">Notifications</span>
              <button onClick={handleMarkAllRead} className="text-xs text-asianow-blue hover:underline">Mark all read</button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.slice(0, 6).map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.read && !readNotifs.has(n.id) ? 'bg-blue-50/50' : ''}`}
                  role="menuitem"
                >
                  <div className="flex items-start gap-2">
                    <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                      n.type === 'error' ? 'bg-red-500' :
                      n.type === 'warning' ? 'bg-yellow-500' :
                      n.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                    }`} aria-hidden="true" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{n.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-2.5 text-center">
              <button className="text-xs text-asianow-blue hover:underline">View all notifications</button>
            </div>
          </div>
        )}
      </div>

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
          className="flex items-center gap-2 md:gap-2.5 px-2 md:px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-haspopup="true"
          aria-expanded={showUserMenu}
          aria-label="User menu"
        >
          <div className="w-7 h-7 rounded-full bg-asianow-dark flex items-center justify-center text-white text-xs font-bold">
            JD
          </div>
          <span className="hidden md:block text-sm font-medium text-gray-700">Julian D.</span>
          <ChevronDown size={14} className="text-gray-400 hidden md:block" aria-hidden="true" />
        </button>

        {showUserMenu && (
          <div
            className="absolute right-0 top-12 w-48 max-w-[calc(100vw-0.5rem)] bg-white rounded-xl border border-gray-100 shadow-xl z-50"
            role="menu"
          >
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">Julian D.</p>
              <p className="text-xs text-gray-500">Operations Admin</p>
            </div>
            <div className="py-1">
              <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" role="menuitem">
                <User size={15} /> My Profile
              </button>
              <Link to="/settings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" role="menuitem">
                <Settings size={15} /> Settings
              </Link>
              <div className="border-t border-gray-100 mt-1 pt-1">
                <Link to="/login" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50" role="menuitem">
                  <LogOut size={15} /> Sign Out
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
