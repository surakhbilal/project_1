import React, { useCallback, useEffect, useState } from 'react';
import {
  Database,
  RefreshCw,
  CheckCircle2,
  XCircle,
  KeyRound,
  Users,
  Trash2,
  Edit3,
  X,
  Server,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  apiDeleteUser,
  apiListAllUsers,
  apiUpdateUser,
} from '../services/api';
import type { UserProfile } from '../types';

export function BackendInspector() {
  const {
    user,
    token,
    backendHealthy,
    backendLatency,
    lastHealthTimestamp,
    inspectorOpen,
    setInspectorOpen,
    pingHealth,
    refreshCurrentUser,
    pushToast,
  } = useAuth();

  const [dbUsers, setDbUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editName, setEditName] = useState<string>('');

  const fetchAllUsersFromDb = useCallback(async () => {
    setLoadingUsers(true);
    setDbError(null);
    try {
      const res = await apiListAllUsers();
      setDbUsers(res.data || []);
    } catch (err: any) {
      setDbError(
        err?.message ||
          'Database MySQL belum terhubung. Pastikan MySQL aktif & jalankan `bun run db:push`.',
      );
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (inspectorOpen) {
      pingHealth();
      fetchAllUsersFromDb();
    }
  }, [inspectorOpen, pingHealth, fetchAllUsersFromDb]);

  if (!inspectorOpen) return null;

  const handleSaveUpdate = async (id: number) => {
    if (!editName.trim()) return;
    try {
      await apiUpdateUser(id, { name: editName.trim() });
      setEditingUserId(null);
      await fetchAllUsersFromDb();
      if (user?.id === id) {
        await refreshCurrentUser();
      }
      pushToast({
        type: 'success',
        title: 'Data User Diperbarui di MySQL',
        description: `PUT /users/${id} berhasil dieksekusi.`,
      });
    } catch (err: any) {
      pushToast({
        type: 'error',
        title: 'Gagal Update User',
        description: err?.message,
      });
    }
  };

  const handleDeleteUser = async (id: number, email: string) => {
    try {
      await apiDeleteUser(id);
      await fetchAllUsersFromDb();
      if (user?.id === id) {
        await refreshCurrentUser();
      }
      pushToast({
        type: 'info',
        title: `User #${id} (${email}) Dihapus`,
        description: `DELETE /users/${id} berhasil menghapus baris di MySQL (beserta cascade session).`,
      });
    } catch (err: any) {
      pushToast({
        type: 'error',
        title: 'Gagal Hapus User',
        description: err?.message,
      });
    }
  };

  return (
    <div className="border-b border-blue-200 bg-slate-900 text-white shadow-inner">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">
                Panel Inspeksi Backend &amp; Database MySQL (Live Data Monitor)
              </h3>
              <p className="text-xs text-slate-400">
                Verifikasi langsung bahwa registrasi, sesi login (`sessions`), dan tabel `users` benar-benar masuk ke database backend.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                pingHealth();
                refreshCurrentUser();
                fetchAllUsersFromDb();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loadingUsers ? 'animate-spin' : ''}`}
              />
              <span>Refresh Data DB</span>
            </button>
            <button
              type="button"
              onClick={() => setInspectorOpen(false)}
              className="rounded-xl bg-slate-800 p-1.5 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 3 Diagnostic Columns */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Column 1: Server & Session State */}
          <div className="space-y-3 lg:col-span-5">
            {/* Endpoint 1: GET /health */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-300">
                  <Server className="h-3.5 w-3.5 text-blue-400" />
                  GET /health
                </span>
                {backendHealthy ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    200 OK ({backendLatency}ms)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2.5 py-0.5 text-[11px] font-bold text-rose-400">
                    <XCircle className="h-3 w-3" />
                    Offline
                  </span>
                )}
              </div>
              <p className="mt-1.5 font-mono text-[11px] text-slate-400">
                Timestamp: {lastHealthTimestamp || 'Memuat...'}
              </p>
            </div>

            {/* Endpoint 2: GET /api/users/current */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-300">
                  <KeyRound className="h-3.5 w-3.5 text-amber-400" />
                  GET /api/users/current (Tabel `sessions`)
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    user
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {user ? 'Sesi Aktif' : 'Belum Login'}
                </span>
              </div>

              {user && token ? (
                <div className="space-y-1.5 font-mono text-[11px]">
                  <p className="text-slate-400">
                    Bearer Token:{' '}
                    <span className="text-amber-300 break-all">{token}</span>
                  </p>
                  <p className="text-slate-300">
                    User ID: <strong className="text-white">#{user.id}</strong> •{' '}
                    {user.name} ({user.email})
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  Tidak ada Bearer token aktif. Silakan Daftar atau Login untuk melihat token UUID dari tabel `sessions`.
                </p>
              )}
            </div>
          </div>

          {/* Column 2: Live Users Table in MySQL (`GET /users`) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 lg:col-span-7">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-400" />
                <span className="font-mono text-xs font-bold text-slate-200">
                  GET /users — Isi Tabel `users` di Database MySQL
                </span>
              </div>
              <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[11px] font-bold text-blue-300">
                {dbUsers.length} Baris Tersimpan
              </span>
            </div>

            {dbError ? (
              <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-200">
                <p className="font-bold text-rose-300">
                  Koneksi Database MySQL Belum Siap:
                </p>
                <p className="mt-1 font-mono text-[11px]">{dbError}</p>
                <p className="mt-2 text-[11px] text-slate-300">
                  Pastikan service MySQL Anda berjalan, database{' '}
                  <code className="text-amber-300">project_1_db</code> sudah dibuat, dan jalankan{' '}
                  <code className="text-emerald-300">bun run db:push</code>.
                </p>
              </div>
            ) : dbUsers.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-center text-xs text-slate-400">
                Tabel `users` di MySQL masih kosong (0 baris). Klik tombol{' '}
                <strong className="text-white">Daftar KTM</strong> di pojok kanan atas untuk menambahkan mahasiswa pertama!
              </div>
            ) : (
              <div className="overflow-x-auto max-h-52">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="border-b border-slate-800 text-[11px] uppercase text-slate-400">
                    <tr>
                      <th className="py-2 pr-3">ID</th>
                      <th className="py-2 pr-3">Nama Mahasiswa</th>
                      <th className="py-2 pr-3">Email</th>
                      <th className="py-2 pr-3">Password</th>
                      <th className="py-2 text-right">Aksi CRUD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {dbUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-900/60">
                        <td className="py-2 pr-3 font-bold text-emerald-400">
                          #{u.id}
                        </td>
                        <td className="py-2 pr-3 text-white">
                          {editingUserId === u.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-32 rounded bg-slate-800 px-2 py-0.5 text-xs text-white border border-blue-500"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveUpdate(u.id)}
                                className="rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white"
                              >
                                Simpan
                              </button>
                            </div>
                          ) : (
                            <span>{u.name}</span>
                          )}
                        </td>
                        <td className="py-2 pr-3 text-slate-300">{u.email}</td>
                        <td className="py-2 pr-3">
                          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
                            [bcrypt hidden]
                          </span>
                        </td>
                        <td className="py-2 text-right space-x-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingUserId(u.id);
                              setEditName(u.name);
                            }}
                            className="inline-flex items-center rounded bg-slate-800 p-1 text-slate-300 hover:bg-blue-600 hover:text-white"
                            title={`Edit Nama (PUT /users/${u.id})`}
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            className="inline-flex items-center rounded bg-slate-800 p-1 text-rose-400 hover:bg-rose-600 hover:text-white"
                            title={`Hapus User (DELETE /users/${u.id})`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
