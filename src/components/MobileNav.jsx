import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Tag,
  BarChart3,
  Scale,
  Users,
} from 'lucide-react';

export function MobileNav({ currentTab, setCurrentTab, currentRole, currentUser }) {
  const activeRole = currentRole || currentUser?.role || 'viewer';
  const canAccessUser = activeRole === 'super_admin' || activeRole === 'admin';

  return (
    <nav className="mobile-bottom-bar">
      <div className="mobile-nav-items">
        <button
          className={`mobile-nav-btn ${currentTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentTab('dashboard')}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </button>

        <button
          className={`mobile-nav-btn ${currentTab === 'kloter' ? 'active' : ''}`}
          onClick={() => setCurrentTab('kloter')}
        >
          <Layers size={20} />
          <span>Kloter</span>
        </button>

        <button
          className={`mobile-nav-btn ${currentTab === 'penjualan' ? 'active' : ''}`}
          onClick={() => setCurrentTab('penjualan')}
        >
          <Scale size={20} />
          <span>Penjualan</span>
        </button>

        <button
          className={`mobile-nav-btn ${currentTab === 'harga' ? 'active' : ''}`}
          onClick={() => setCurrentTab('harga')}
        >
          <Tag size={20} />
          <span>Harga</span>
        </button>

        <button
          className={`mobile-nav-btn ${currentTab === 'laporan' ? 'active' : ''}`}
          onClick={() => setCurrentTab('laporan')}
        >
          <BarChart3 size={20} />
          <span>Laporan</span>
        </button>

        {canAccessUser && (
          <button
            className={`mobile-nav-btn ${currentTab === 'user' ? 'active' : ''}`}
            onClick={() => setCurrentTab('user')}
          >
            <Users size={20} />
            <span>User</span>
          </button>
        )}
      </div>
    </nav>
  );
}
