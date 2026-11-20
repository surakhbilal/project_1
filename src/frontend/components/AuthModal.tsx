import React, { useEffect, useState } from 'react';
import {
  X,
  GraduationCap,
  Mail,
  Lock,
  User,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AuthModal() {
  const {
    authModalOpen,
    authModalTab,
    openAuthModal,
    closeAuthModal,
    login,
    register,
  } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setErrorMsg(null);
  }, [authModalTab, authModalOpen]);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (authModalTab === 'register' && name.trim().length < 1) {
      setErrorMsg('Nama lengkap mahasiswa wajib diisi');
      return;
    }

    if (authModalTab === 'register' && password.length < 6) {
      setErrorMsg('Password minimal 6 karakter');
      return;
    }

    setSubmitting(true);
    try {
      if (authModalTab === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      setName('');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Terjadi kesalahan autentikasi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Top Banner */}
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-emerald-700 px-6 py-6 text-white">
          <button
            type="button"
            onClick={closeAuthModal}
            className="absolute right-4 top-4 rounded-lg bg-white/10 p-1.5 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-emerald-200 mb-3">
            <GraduationCap className="h-4 w-4" />
            <span>EduRail Student Pass</span>
          </div>

          <h3 className="text-xl font-extrabold">
            {authModalTab === 'login'
              ? 'Masuk ke Akun Mahasiswa'
              : 'Daftar Akun KTM Mahasiswa'}
          </h3>
          <p className="mt-1 text-xs text-blue-100">
            {authModalTab === 'login'
              ? 'Autentikasi via POST /api/users/login & aktifkan token sesi UUID'
              : 'Registrasi via POST /api/users dengan enkripsi password bcrypt'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50 p-1.5">
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className={`rounded-xl py-2 text-xs font-extrabold transition ${
              authModalTab === 'login'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => openAuthModal('register')}
            className={`rounded-xl py-2 text-xs font-extrabold transition ${
              authModalTab === 'register'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Daftar Baru (Register)
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {authModalTab === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nama Lengkap Mahasiswa (Sesuai KTM)
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Rakhbilal"
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Email Kampus / Mahasiswa
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mahasiswa@kampus.ac.id"
                className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Password {authModalTab === 'register' && '(Minimal 6 karakter)'}
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                minLength={authModalTab === 'register' ? 6 : 1}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-3 text-sm font-bold text-white shadow-md shadow-blue-700/20 hover:bg-blue-800 disabled:opacity-60 transition"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Memproses ke Backend...</span>
              </>
            ) : authModalTab === 'login' ? (
              <span>Masuk &amp; Aktifkan Diskon KTM</span>
            ) : (
              <span>Daftar &amp; Simpan ke Database</span>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>
              Terhubung langsung ke API ElysiaJS + Drizzle ORM + MySQL
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
