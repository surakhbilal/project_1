import React, { useState } from 'react';
import {
  Train,
  GraduationCap,
  ShieldCheck,
  Database,
  LogOut,
  User,
  Menu,
  X,
  Ticket,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  myBookingsCount: number;
  onOpenMyBookings: () => void;
}

export function Navbar({ myBookingsCount, onOpenMyBookings }: NavbarProps) {
  const {
    user,
    backendHealthy,
    backendLatency,
    openAuthModal,
    logout,
    inspectorOpen,
    setInspectorOpen,
  } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-900 via-blue-700 to-emerald-600 text-white shadow-md shadow-blue-900/15 transition-transform group-hover:scale-105">
            <Train className="h-5 w-5" />
            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-slate-950 shadow">
              <GraduationCap className="h-3.5 w-3.5" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Edu<span className="text-blue-700">Rail</span>
              </span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-600/20">
                Kampus Pass
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500">
              Tiket Kereta Mahasiswa Indonesia
            </p>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
          <a href="#cari-tiket" className="hover:text-blue-700 transition-colors">
            Cari Tiket
          </a>
          <a href="#katalog-kereta" className="hover:text-blue-700 transition-colors">
            Jadwal &amp; Rute
          </a>
          <a href="#promo-mahasiswa" className="hover:text-blue-700 transition-colors">
            Promo KTM
          </a>
          <a href="#faq-ktm" className="hover:text-blue-700 transition-colors">
            Bantuan
          </a>
        </nav>

        {/* Actions & Auth State */}
        <div className="hidden md:flex items-center gap-3">
          {/* Live Backend DB Inspector Trigger */}
          <button
            type="button"
            onClick={() => setInspectorOpen(!inspectorOpen)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
              inspectorOpen
                ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-sm'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
            }`}
            title="Cek Koneksi Backend & Data MySQL"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                backendHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <Database className="h-3.5 w-3.5 text-blue-700" />
            <span>Cek Data Backend</span>
            {backendHealthy && (
              <span className="font-mono text-[10px] text-slate-400">
                {backendLatency}ms
              </span>
            )}
          </button>

          {/* My Tickets button */}
          {myBookingsCount > 0 && (
            <button
              type="button"
              onClick={onOpenMyBookings}
              className="flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 ring-1 ring-amber-500/30 hover:bg-amber-100 transition"
            >
              <Ticket className="h-3.5 w-3.5 text-amber-600" />
              <span>E-Ticket Saya ({myBookingsCount})</span>
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-2.5 pl-1">
              <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-1.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">
                      {user.name}
                    </span>
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      <ShieldCheck className="h-2.5 w-2.5" />
                      KTM Aktif
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500">
                    {user.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                title="Logout (DELETE /api/users/current)"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="rounded-xl px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('register')}
                className="flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-blue-700/25 hover:bg-blue-800 transition"
              >
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>Daftar KTM</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setInspectorOpen(!inspectorOpen)}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                backendHealthy ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
            <Database className="h-3.5 w-3.5 text-blue-700" />
            <span>DB</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden space-y-3">
          <div className="flex flex-col space-y-2 text-sm font-semibold text-slate-700">
            <a
              href="#cari-tiket"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-2 py-1.5 hover:bg-slate-100"
            >
              Cari Tiket
            </a>
            <a
              href="#katalog-kereta"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-2 py-1.5 hover:bg-slate-100"
            >
              Jadwal &amp; Rute
            </a>
            <a
              href="#promo-mahasiswa"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-2 py-1.5 hover:bg-slate-100"
            >
              Promo KTM
            </a>
            <a
              href="#faq-ktm"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-2 py-1.5 hover:bg-slate-100"
            >
              Bantuan
            </a>
          </div>

          <div className="border-t border-slate-100 pt-3">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-emerald-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{user.name}</p>
                    <p className="text-[11px] text-slate-500">{user.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-700"
                >
                  Masuk
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('register');
                  }}
                  className="rounded-xl bg-blue-700 py-2 text-xs font-bold text-white"
                >
                  Daftar KTM
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
