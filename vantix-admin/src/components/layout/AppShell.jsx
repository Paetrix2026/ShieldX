import React from 'react';
import { NavLink } from 'react-router-dom';
import { Search, User, Sliders } from 'lucide-react';

const AppShell = ({ children, onLogout }) => {
  return (
    <div className="app-shell">
      <div className="orion-global-bg"></div>
      
      <header className="orion-topnav">
        <div className="orion-brand">
          <div className="orion-brand-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--brand-purple)', color: 'white' }}>V</div>
          VANTIX
        </div>

        <nav className="orion-nav-links">
          <NavLink to="/" end className={({isActive}) => isActive ? 'active' : ''} data-active={window.location.pathname === '/'}>Overview</NavLink>
          <NavLink to="/employees" data-active={window.location.pathname.includes('/employees')}>Employees</NavLink>
          <NavLink to="/rules" data-active={window.location.pathname.includes('/rules')}>Rules</NavLink>
          <NavLink to="/violations" data-active={window.location.pathname.includes('/violations')}>Violations</NavLink>
          <NavLink to="/reports" data-active={window.location.pathname.includes('/reports')}>Reports</NavLink>
          <NavLink to="/settings" data-active={window.location.pathname.includes('/settings')}>Settings</NavLink>
        </nav>

        <div className="orion-actions">
          <User size={20} style={{cursor: 'pointer'}} onClick={onLogout} title="Logout" />
          <Sliders size={20} style={{cursor: 'pointer'}} />
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default AppShell;
