import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../../context/AuthContext';
import { 
  Menu, X, LayoutDashboard, Bird, ClipboardList, Egg, 
  CircleDollarSign, CalendarDays, Syringe, Building2, 
  Users, Receipt, Wallet, FileClock, ShoppingCart, LogOut
} from 'lucide-react';
import './Layout.css';

const Layout = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const toggleSidebar = () => setIsMobileOpen(!isMobileOpen);

  // Complete List of App Navigation
  const ALL_NAV_ITEMS = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Calendar', path: '/calendar', icon: CalendarDays },
    { name: 'Flock Management', path: '/flocks', icon: Bird },
    { name: 'Daily Production', path: '/production', icon: ClipboardList },
    { name: 'Egg Production Records', path: '/production-records', icon: FileClock },
    { name: 'Egg Inventory', path: '/inventory', icon: Egg },
    { name: 'Sales', path: '/sales', icon: ShoppingCart },
    { name: 'Sales Monitoring', path: '/sales-monitoring', icon: CircleDollarSign },
    { name: 'Vaccination Records', path: '/vaccinations', icon: Syringe },
    { name: 'Hatchery Records', path: '/hatchery', icon: Building2 },
    { name: 'Staff Management', path: '/staff', icon: Users },
    { name: 'Expense Management', path: '/expenses', icon: Receipt },
    { name: 'Income Management', path: '/income', icon: Wallet },
  ];

  // Apply Role-Based Filtering
  let allowedNames = [];
  if (user?.role === ROLES.ADMIN) {
    allowedNames = ALL_NAV_ITEMS.map(i => i.name); // Admin sees everything
  } else if (user?.role === ROLES.STAFF) {
    allowedNames = [
      'Dashboard', 'Calendar', 'Daily Production', 'Egg Production Records', 
      'Egg Inventory', 'Vaccination Records', 'Hatchery Records'
    ]; // Staff restricted view
  }

  const navItems = ALL_NAV_ITEMS.filter(item => allowedNames.includes(item.name));
  
  // Resolve current active title
  const activeNavItem = ALL_NAV_ITEMS.find(item => location.pathname === item.path);
  const pageTitle = activeNavItem ? activeNavItem.name : 'Farm Dashboard';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="layout-container">
      {isMobileOpen && <div className="mobile-overlay" onClick={toggleSidebar}></div>}

      <aside className={`sidebar ${isMobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-icon">🐣</div>
          <h2>EggManager</h2>
          <button className="mobile-close-btn" onClick={toggleSidebar}>
            <X size={24} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            {navItems.map((item, idx) => (
              <li key={idx} className="nav-item">
                <NavLink 
                  to={item.path} 
                  className={({ isActive }) => isActive ? 'active' : ''}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-profile" style={{ flex: 1, display: 'flex' }}>
            <div className="avatar" style={{ flexShrink: 0 }}>{user?.name?.charAt(0) || 'U'}</div>
            <div className="user-info" style={{ flex: 1, paddingLeft: '8px', overflow: 'hidden' }}>
              <span className="user-name" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.name}</span>
              <span className="user-role">{user?.role} Role</span>
            </div>
            
            <button onClick={handleLogout} title="Log Out" className="action-btn" style={{ padding: '6px', cursor: 'pointer', flexShrink: 0, color: '#ef4444' }}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="topbar">
          <button className="mobile-menu-btn" onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
          <div className="topbar-title">
            <h1>{pageTitle}</h1>
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
