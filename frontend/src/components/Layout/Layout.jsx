import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../../context/AuthContext';
import { 
  Menu, X, LayoutDashboard, Bird, ClipboardList, Egg, 
  CircleDollarSign, CalendarDays, Syringe, Building2, 
  Users, Receipt, Wallet, FileClock, ShoppingCart, LogOut,
  Moon, Sun, LineChart
} from 'lucide-react';
import './Layout.css';

// Theme hook with localStorage persistence
const useTheme = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('egg-theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('egg-theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => t === 'light' ? 'dark' : 'light');
  return { theme, toggle };
};

const Layout = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();

  const closeSidebar = () => setIsMobileOpen(false);

  const ALL_NAV_ITEMS = [
    { name: 'Dashboard',                path: '/dashboard',         icon: LayoutDashboard,   section: 'Overview' },
    { name: 'Calendar',                 path: '/calendar',          icon: CalendarDays,      section: 'Overview' },
    { name: 'Production Report',        path: '/production-report', icon: FileClock,         section: 'Overview' },
    { name: 'Flock Management',         path: '/flocks',            icon: Bird,              section: 'Operations' },
    { name: 'Feed Management',          path: '/feed',              icon: ClipboardList,     section: 'Operations' },
    { name: 'Daily Production',         path: '/production',        icon: ClipboardList,     section: 'Operations' },
    { name: 'Egg Production Records',   path: '/production-records',icon: FileClock,         section: 'Operations' },
    { name: 'Egg Inventory',            path: '/inventory',         icon: Egg,               section: 'Operations' },
    { name: 'Vaccination Records',      path: '/vaccinations',      icon: Syringe,           section: 'Health' },
    { name: 'Sales',                    path: '/sales',             icon: ShoppingCart,      section: 'Finance' },
    { name: 'Sales & Expense Monitoring', path: '/sales-monitoring',icon: LineChart,         section: 'Finance' },
    { name: 'Pricing',                  path: '/pricing',           icon: CircleDollarSign,  section: 'Finance' },
    { name: 'Staff Management',         path: '/staff',             icon: Users,             section: 'Admin' },
    { name: 'Expense Management',       path: '/expenses',          icon: Receipt,           section: 'Admin' },
    { name: 'Income Management',        path: '/income',            icon: Wallet,            section: 'Admin' },
  ];

  let allowedNames = [];
  if (user?.role === ROLES.ADMIN) {
    allowedNames = ALL_NAV_ITEMS.filter(i => i.name !== 'Production Report').map(i => i.name);
  } else if (user?.role === ROLES.STAFF) {
    allowedNames = [
      'Dashboard', 'Calendar', 'Production Report', 'Daily Production', 'Egg Production Records',
      'Egg Inventory', 'Vaccination Records', 'Feed Management', 'Sales'
    ];
  }

  const navItems = ALL_NAV_ITEMS.filter(item => allowedNames.includes(item.name));

  // Group by section
  const sections = [...new Set(navItems.map(i => i.section))];

  const activeNavItem = ALL_NAV_ITEMS.find(item => location.pathname === item.path);
  const pageTitle = location.pathname === '/account'
    ? 'My Account'
    : activeNavItem
      ? activeNavItem.name
      : 'Farm Dashboard';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="layout-container">
      {isMobileOpen && <div className="mobile-overlay" onClick={closeSidebar} />}

      <aside className={`sidebar ${isMobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-mark">🐣</div>
          <h2>Egg<span>Manager</span></h2>
          <button className="mobile-close-btn" onClick={closeSidebar} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <ul>
            {sections.map(section => (
              <React.Fragment key={section}>
                <li className="nav-section-label">{section}</li>
                {navItems.filter(i => i.section === section).map((item, idx) => (
                  <li key={idx} className="nav-item">
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => isActive ? 'active' : ''}
                      onClick={closeSidebar}
                    >
                      <item.icon size={17} />
                      <span>{item.name}</span>
                    </NavLink>
                  </li>
                ))}
              </React.Fragment>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile" onClick={() => { closeSidebar(); navigate('/account'); }} role="button" tabIndex={0} title="Open My Account" onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              closeSidebar();
              navigate('/account');
            }
          }}>
            <div className="avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{user?.role}</span>
            </div>
            <button onClick={(event) => { event.stopPropagation(); handleLogout(); }} className="logout-btn" title="Log out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="topbar">
          <button className="mobile-menu-btn" onClick={() => setIsMobileOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>

          <div className="topbar-title">
            <h1>{pageTitle}</h1>
          </div>

          <div className="topbar-actions">
            <button
              className="theme-toggle"
              onClick={toggle}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </header>

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
