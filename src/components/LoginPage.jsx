import React, { useState } from 'react';
import { Boxes, Lock, Mail, ArrowRight, Tag, Eye, EyeOff } from 'lucide-react';
import { formatRupiah } from '../utils/calculations';

export function LoginPage({ users, activePrice, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Find user by email or username AND matching password
    const foundUser = users.find(
      (u) =>
        ((u.email && u.email.toLowerCase() === email.trim().toLowerCase()) ||
        (u.username && u.username.toLowerCase() === email.trim().toLowerCase())) &&
        u.password === password
    );

    if (foundUser) {
      onLogin(foundUser);
    } else {
      alert('Email/Username atau Kata Sandi salah!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-sky-200 flex items-center justify-center p-4 sm:p-6 md:p-10 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-sky-200 grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Branding Side — hidden on mobile, visible on md+ */}
        <div className="hidden md:flex bg-gradient-to-br from-sky-700 via-sky-800 to-blue-900 p-8 text-white flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-white text-sky-700 rounded-2xl flex items-center justify-center shadow-lg font-bold">
                <Boxes size={26} />
              </div>
              <div>
                <h2 className="font-extrabold text-lg leading-tight tracking-tight">Pendataan Ayam</h2>
                <span className="text-[10px] text-sky-300 uppercase tracking-widest font-bold block">
                  Sistem Kloter Broiler
                </span>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold leading-snug mb-3 tracking-tight">
              Sistem Pendataan Ayam Broiler
            </h1>
          </div>

          <div className="relative z-10 space-y-3 pt-6 border-t border-sky-600/60">
            <div className="bg-sky-950/50 p-3.5 rounded-2xl border border-sky-400/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-sky-200 font-semibold">
                <Tag size={14} className="text-sky-300" />
                <span>Harga Acuan:</span>
              </div>
              <strong className="text-white text-sm font-extrabold">
                {formatRupiah(activePrice)} / Ons
              </strong>
            </div>
          </div>
        </div>

        {/* Right Form Side */}
        <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-between bg-white">
          {/* Mobile branding header (only on small screens) */}
          <div className="flex md:hidden items-center gap-3 mb-5 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 bg-sky-600 text-white rounded-xl flex items-center justify-center shadow font-bold">
              <Boxes size={20} />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-slate-900 leading-tight">Pendataan Ayam</h2>
              <span className="text-[10px] text-sky-600 font-bold uppercase tracking-wider">Sistem Kloter Broiler</span>
            </div>
            <div className="ml-auto flex items-center gap-1 text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded-lg border border-sky-200">
              <Tag size={10} />
              <span>{formatRupiah(activePrice)} / Ons</span>
            </div>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-1 tracking-tight">
              Masuk Akun
            </h2>

            {/* Direct Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Email atau Username:</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 font-medium"
                    placeholder="Masukkan email atau username..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Kata Sandi (Password):</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 font-medium"
                    placeholder="Masukkan kata sandi..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer p-1"
                    title={showPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    className="rounded text-sky-600 focus:ring-sky-500"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Ingat sesi masuk</span>
                </label>
                <span className="text-sky-600 font-semibold cursor-pointer hover:underline">
                  Lupa kata sandi?
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-sky-600 to-sky-700 text-white font-bold text-xs rounded-xl shadow-md hover:from-sky-700 hover:to-sky-800 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Masuk Ke Dashboard</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400 font-medium">
            Pendataan Ayam &copy; 2026 Peternakan Unggul. Hak Cipta Dilindungi.
          </div>
        </div>
      </div>
    </div>
  );
}
