import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Tag,
  BarChart3,
  Users,
  Boxes,
  Scale,
  LogOut,
  Send,
} from 'lucide-react';

export function Sidebar({ currentTab, setCurrentTab, currentRole, currentUser, onLogout }) {
  const isSuperAdmin = currentRole === 'super_admin';

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-sky-100 p-4 space-y-6 sticky top-0 h-screen z-20">
      <div className="px-2 py-1">
        <span className="font-extrabold text-sm text-slate-900 block leading-tight">Pendataan Ayam</span>
        <span className="text-[10px] text-sky-600 font-bold uppercase tracking-wider">Kloter Management</span>
      </div>

      <nav className="space-y-1.5 flex-1">
        <button
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
            currentTab === 'dashboard'
              ? 'bg-sky-50 text-sky-800 border border-sky-200 shadow-xs'
              : 'text-slate-600 hover:bg-slate-50 hover:text-sky-700'
          }`}
          onClick={() => setCurrentTab('dashboard')}
        >
          <LayoutDashboard size={18} className={currentTab === 'dashboard' ? 'text-sky-600' : 'text-slate-400'} />
          <span>Dashboard Analitik</span>
        </button>

        <button
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
            currentTab === 'kloter'
              ? 'bg-sky-50 text-sky-800 border border-sky-200 shadow-xs'
              : 'text-slate-600 hover:bg-slate-50 hover:text-sky-700'
          }`}
          onClick={() => setCurrentTab('kloter')}
        >
          <Layers size={18} className={currentTab === 'kloter' ? 'text-sky-600' : 'text-slate-400'} />
          <span>Manajemen Kloter</span>
        </button>

        <button
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
            currentTab === 'penjualan'
              ? 'bg-sky-50 text-sky-800 border border-sky-200 shadow-xs'
              : 'text-slate-600 hover:bg-slate-50 hover:text-sky-700'
          }`}
          onClick={() => setCurrentTab('penjualan')}
        >
          <Scale size={18} className={currentTab === 'penjualan' ? 'text-sky-600' : 'text-slate-400'} />
          <span>Data Penjualan</span>
        </button>

        <button
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
            currentTab === 'harga'
              ? 'bg-sky-50 text-sky-800 border border-sky-200 shadow-xs'
              : 'text-slate-600 hover:bg-slate-50 hover:text-sky-700'
          }`}
          onClick={() => setCurrentTab('harga')}
        >
          <Tag size={18} className={currentTab === 'harga' ? 'text-sky-600' : 'text-slate-400'} />
          <span>Pengaturan Harga</span>
        </button>

        <button
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
            currentTab === 'laporan'
              ? 'bg-sky-50 text-sky-800 border border-sky-200 shadow-xs'
              : 'text-slate-600 hover:bg-slate-50 hover:text-sky-700'
          }`}
          onClick={() => setCurrentTab('laporan')}
        >
          <BarChart3 size={18} className={currentTab === 'laporan' ? 'text-sky-600' : 'text-slate-400'} />
          <span>Laporan & Analisis</span>
        </button>

        {(currentRole === 'super_admin' || currentRole === 'admin') && (
          <>
            <div className="pt-4 pb-1 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Pengaturan User &amp; Export
            </div>

            <button
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                currentTab === 'jadwal_export'
                  ? 'bg-sky-50 text-sky-800 border border-sky-200 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-sky-700'
              }`}
              onClick={() => setCurrentTab('jadwal_export')}
            >
              <Send size={18} className={currentTab === 'jadwal_export' ? 'text-sky-600' : 'text-slate-400'} />
              <span>Jadwal Kirim PDF</span>
            </button>

            <button
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                currentTab === 'user'
                  ? 'bg-sky-50 text-sky-800 border border-sky-200 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-sky-700'
              }`}
              onClick={() => setCurrentTab('user')}
            >
              <Users size={18} className={currentTab === 'user' ? 'text-sky-600' : 'text-slate-400'} />
              <span>Manajemen User</span>
            </button>
          </>
        )}
      </nav>

      {/* User Profile Info & Log Out Button (Bottom Left) */}
      {currentUser && (
        <div className="pt-4 border-t border-sky-100 space-y-2.5 mt-auto">
          <div className="flex items-center gap-3 p-2 bg-sky-50/70 border border-sky-100 rounded-xl">
            <div className="w-8 h-8 rounded-xl bg-sky-700 text-white flex items-center justify-center text-xs font-extrabold shadow-2xs">
              {currentUser.nama.charAt(0)}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-extrabold text-slate-900 truncate">
                {currentUser.nama}
              </span>
              <span className="text-[10px] text-sky-700 font-bold truncate">
                {currentUser.labelRole}
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200/60 transition cursor-pointer"
          >
            <LogOut size={14} />
            <span>Keluar dari Sistem</span>
          </button>
        </div>
      )}
    </aside>
  );
}
