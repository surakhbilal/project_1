import React from 'react';
import {
  MapPin,
  Calendar,
  Users,
  ArrowRightLeft,
  Sparkles,
  Search,
  ShieldCheck,
  Wifi,
  Zap,
  GraduationCap,
} from 'lucide-react';
import { STATIONS } from '../data/trains';
import type { SearchFilter } from '../types';

interface HeroSearchProps {
  filter: SearchFilter;
  onChangeFilter: (updater: (prev: SearchFilter) => SearchFilter) => void;
  onSubmitSearch: () => void;
}

export function HeroSearch({
  filter,
  onChangeFilter,
  onSubmitSearch,
}: HeroSearchProps) {
  const swapStations = () => {
    onChangeFilter((prev) => ({
      ...prev,
      origin: prev.destination === 'ALL' ? 'YK' : prev.destination,
      destination: prev.origin === 'ALL' ? 'GMR' : prev.origin,
    }));
  };

  return (
    <section
      id="cari-tiket"
      className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 pt-10 pb-20 text-white"
    >
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute top-20 right-10 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 mb-5">
            <GraduationCap className="h-4 w-4 text-emerald-400" />
            <span>Platform Resmi Mobilitas Mahasiswa Antar-Kota Pendidikan</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:leading-[1.15]">
            Perjalanan Pulang &amp; Menuntut Ilmu Jadi Lebih Hemat dengan{' '}
            <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300 bg-clip-text text-transparent">
              Tarif Khusus Mahasiswa
            </span>
          </h1>

          <p className="mt-4 text-base text-slate-300 sm:text-lg">
            Nikmati potongan langsung hingga{' '}
            <strong className="text-white">25% dengan Kartu Tanda Mahasiswa (KTM)</strong>,
            Wi-Fi cepat sepanjang perjalanan, dan bebas reschedule saat jadwal UAS berubah.
          </p>

          {/* Trust Pill Highlights */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-300">
            <span className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 ring-1 ring-white/10">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Diskon KTM Otomatis 20%–25%
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 ring-1 ring-white/10">
              <Wifi className="h-4 w-4 text-sky-400" />
              Gerbong Belajar &amp; Wi-Fi Kampus
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 ring-1 ring-white/10">
              <Zap className="h-4 w-4 text-amber-400" />
              E-Ticket QR Instan Tanpa Antre
            </span>
          </div>
        </div>

        {/* Search Widget Card */}
        <div className="mt-10 rounded-3xl border border-white/15 bg-white p-5 text-slate-900 shadow-2xl shadow-blue-950/50 sm:p-7">
          {/* Top Bar inside Widget */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <Search className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Pencarian Tiket Kereta Mahasiswa
                </h2>
                <p className="text-xs text-slate-500">
                  Pilih stasiun keberangkatan &amp; kota kampus tujuan Anda
                </p>
              </div>
            </div>

            {/* KTM Discount Toggle Switch */}
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-2 transition hover:bg-emerald-100/70">
              <input
                type="checkbox"
                checked={filter.isStudentKtm}
                onChange={(e) =>
                  onChangeFilter((prev) => ({
                    ...prev,
                    isStudentKtm: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
              />
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-xs font-extrabold text-emerald-900">
                    Aktifkan Subsidi Diskon KTM (20%–25%)
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  Khusus mahasiswa aktif dengan NIM &amp; KTM valid
                </p>
              </div>
            </label>
          </div>

          {/* Search Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12 items-end">
            {/* Origin Station */}
            <div className="md:col-span-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Stasiun Asal
              </label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-blue-600" />
                <select
                  value={filter.origin}
                  onChange={(e) =>
                    onChangeFilter((prev) => ({ ...prev, origin: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 py-3 text-sm font-semibold text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                >
                  <option value="ALL">Semua Stasiun Asal</option>
                  {STATIONS.map((st) => (
                    <option key={st.code} value={st.code}>
                      {st.city} — {st.name} ({st.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center md:col-span-1">
              <button
                type="button"
                onClick={swapStations}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition"
                title="Tukar Stasiun Asal & Tujuan"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </button>
            </div>

            {/* Destination Station */}
            <div className="md:col-span-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Stasiun Tujuan (Kota Kampus)
              </label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-emerald-600" />
                <select
                  value={filter.destination}
                  onChange={(e) =>
                    onChangeFilter((prev) => ({
                      ...prev,
                      destination: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 py-3 text-sm font-semibold text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                >
                  <option value="ALL">Semua Stasiun Tujuan</option>
                  {STATIONS.map((st) => (
                    <option key={st.code} value={st.code}>
                      {st.city} — {st.name} ({st.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Departure Date */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Tanggal Berangkat
              </label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  value={filter.date}
                  onChange={(e) =>
                    onChangeFilter((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 py-2.5 text-sm font-semibold text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Passengers */}
            <div className="md:col-span-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Kursi
              </label>
              <div className="relative">
                <Users className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <select
                  value={filter.passengers}
                  onChange={(e) =>
                    onChangeFilter((prev) => ({
                      ...prev,
                      passengers: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-2 py-3 text-sm font-semibold text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                >
                  {[1, 2, 3, 4].map((num) => (
                    <option key={num} value={num}>
                      {num} Mhs
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit CTA */}
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={onSubmitSearch}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-700/25 hover:from-blue-800 hover:to-emerald-700 transition"
              >
                <Search className="h-4 w-4" />
                <span>Cari Tiket</span>
              </button>
            </div>
          </div>

          {/* Quick Campus Route Shortcuts */}
          <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 text-xs">
            <span className="font-semibold text-slate-400">Rute Kampus Populer:</span>
            {[
              { label: 'Jakarta ⇄ Yogyakarta (UGM/UNY)', origin: 'GMR', dest: 'YK' },
              { label: 'Jakarta ⇄ Bandung (ITB/UNPAD)', origin: 'GMR', dest: 'BD' },
              { label: 'Jakarta ⇄ Malang (UB/UM)', origin: 'PSE', dest: 'ML' },
              { label: 'Jakarta ⇄ Surabaya (ITS/UNAIR)', origin: 'GMR', dest: 'SGU' },
              { label: 'Semua Rute', origin: 'ALL', dest: 'ALL' },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() =>
                  onChangeFilter((prev) => ({
                    ...prev,
                    origin: item.origin,
                    destination: item.dest,
                  }))
                }
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-semibold text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
