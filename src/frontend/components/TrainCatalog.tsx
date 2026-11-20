import React from 'react';
import {
  Train,
  Clock,
  ArrowRight,
  Sparkles,
  Armchair,
  Filter,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { STATIONS } from '../data/trains';
import type { SearchFilter, TrainClass, TrainSchedule } from '../types';

interface TrainCatalogProps {
  schedules: TrainSchedule[];
  filter: SearchFilter;
  onChangeFilter: (updater: (prev: SearchFilter) => SearchFilter) => void;
  onSelectTrain: (train: TrainSchedule) => void;
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getDiscountedPrice(
  train: TrainSchedule,
  isStudentKtm: boolean,
): number {
  if (!isStudentKtm) return train.regularPrice;
  return Math.round(
    train.regularPrice * (1 - train.studentDiscountPercent / 100),
  );
}

export function TrainCatalog({
  schedules,
  filter,
  onChangeFilter,
  onSelectTrain,
}: TrainCatalogProps) {
  const stationMap = new Map(STATIONS.map((s) => [s.code, s]));

  return (
    <section id="katalog-kereta" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Section Header & Filter Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Jadwal &amp; Katalog Kereta Mahasiswa
            </h2>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
              {schedules.length} Kereta Tersedia
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Menampilkan tarif{' '}
            {filter.isStudentKtm ? (
              <span className="font-bold text-emerald-700">
                Subsidi Diskon KTM Mahasiswa (Hemat 20%–25%)
              </span>
            ) : (
              <span className="font-semibold text-slate-700">Reguler Non-Subsidi</span>
            )}{' '}
            untuk {filter.passengers} penumpang
          </p>
        </div>

        {/* Interactive Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mr-1">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter:</span>
          </div>

          {/* Class Filter */}
          <select
            value={filter.classFilter}
            onChange={(e) =>
              onChangeFilter((prev) => ({
                ...prev,
                classFilter: e.target.value as 'ALL' | TrainClass,
              }))
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm focus:border-blue-600 focus:outline-none"
          >
            <option value="ALL">Semua Kelas Kereta</option>
            <option value="Ekonomi Mahasiswa">Ekonomi Mahasiswa</option>
            <option value="Ekonomi Plus">Ekonomi Plus</option>
            <option value="Eksekutif Kampus">Eksekutif Kampus</option>
          </select>

          {/* Time Period Filter */}
          <select
            value={filter.periodFilter}
            onChange={(e) =>
              onChangeFilter((prev) => ({
                ...prev,
                periodFilter: e.target.value as 'ALL' | 'Pagi' | 'Siang' | 'Malam',
              }))
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm focus:border-blue-600 focus:outline-none"
          >
            <option value="ALL">Semua Waktu Berangkat</option>
            <option value="Pagi">Pagi (05:00 - 11:59)</option>
            <option value="Siang">Siang/Sore (12:00 - 17:59)</option>
            <option value="Malam">Malam (18:00 - 23:59)</option>
          </select>

          {/* Sort By */}
          <select
            value={filter.sortBy}
            onChange={(e) =>
              onChangeFilter((prev) => ({
                ...prev,
                sortBy: e.target.value as SearchFilter['sortBy'],
              }))
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm focus:border-blue-600 focus:outline-none"
          >
            <option value="PRICE_ASC">Urutkan: Harga Termurah</option>
            <option value="DEPARTURE_ASC">Urutkan: Keberangkatan Paling Awal</option>
            <option value="DURATION_ASC">Urutkan: Durasi Tercepat</option>
          </select>

          {(filter.origin !== 'ALL' ||
            filter.destination !== 'ALL' ||
            filter.classFilter !== 'ALL' ||
            filter.periodFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() =>
                onChangeFilter((prev) => ({
                  ...prev,
                  origin: 'ALL',
                  destination: 'ALL',
                  classFilter: 'ALL',
                  periodFilter: 'ALL',
                }))
              }
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Train Cards List */}
      {schedules.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Train className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-3 text-lg font-bold text-slate-900">
            Rute Kereta Tidak Ditemukan
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Coba ubah filter stasiun asal/tujuan atau klik tombol Reset untuk melihat semua rute kampus.
          </p>
          <button
            type="button"
            onClick={() =>
              onChangeFilter((prev) => ({
                ...prev,
                origin: 'ALL',
                destination: 'ALL',
                classFilter: 'ALL',
                periodFilter: 'ALL',
              }))
            }
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-800"
          >
            Tampilkan Semua Jadwal Kereta
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {schedules.map((train) => {
            const origin = stationMap.get(train.originCode);
            const destination = stationMap.get(train.destinationCode);
            const finalPrice = getDiscountedPrice(train, filter.isStudentKtm);
            const savings = train.regularPrice - finalPrice;

            return (
              <div
                key={train.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-blue-400 hover:shadow-md sm:p-6"
              >
                {/* Top Badges */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                        train.trainClass === 'Eksekutif Kampus'
                          ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20'
                          : train.trainClass === 'Ekonomi Plus'
                          ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20'
                          : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                      }`}
                    >
                      {train.trainClass}
                    </span>

                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-600">
                      {train.trainCode} • {train.period}
                    </span>

                    {train.badge && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-500/20">
                        <Sparkles className="h-3 w-3 text-amber-600" />
                        {train.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <Armchair className="h-4 w-4 text-emerald-600" />
                    <span>
                      Sisa <strong className="text-slate-900">{train.seatsAvailable}</strong> kursi mahasiswa
                    </span>
                  </div>
                </div>

                {/* Main Schedule Row */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
                  {/* Train Name & Campus Cluster */}
                  <div className="lg:col-span-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                        <Train className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {train.trainName}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Akses: {destination?.campusCluster}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Departure -> Duration -> Arrival */}
                  <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3 lg:col-span-5">
                    <div>
                      <p className="text-xl font-extrabold text-slate-900">
                        {train.departureTime}
                      </p>
                      <p className="text-xs font-bold text-slate-700">
                        {origin?.city} ({train.originCode})
                      </p>
                      <p className="text-[11px] text-slate-500">{origin?.name}</p>
                    </div>

                    <div className="flex flex-col items-center px-2 text-center">
                      <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                        <Clock className="h-3 w-3 text-blue-600" />
                        {train.duration}
                      </span>
                      <div className="my-1.5 flex w-24 items-center">
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                        <span className="h-0.5 flex-1 bg-gradient-to-r from-blue-600 to-emerald-500" />
                        <ArrowRight className="h-3.5 w-3.5 text-emerald-600" />
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700">
                        Langsung
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-extrabold text-slate-900">
                        {train.arrivalTime}
                      </p>
                      <p className="text-xs font-bold text-slate-700">
                        {destination?.city} ({train.destinationCode})
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {destination?.name}
                      </p>
                    </div>
                  </div>

                  {/* Pricing & Book Button */}
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center lg:col-span-4 lg:justify-end">
                    <div className="text-left sm:text-right">
                      {filter.isStudentKtm && (
                        <div className="flex items-center sm:justify-end gap-1.5">
                          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                            Diskon KTM -{train.studentDiscountPercent}%
                          </span>
                          <span className="text-xs font-medium text-slate-400 line-through">
                            {formatRupiah(train.regularPrice)}
                          </span>
                        </div>
                      )}
                      <p className="text-2xl font-extrabold text-blue-800">
                        {formatRupiah(finalPrice)}
                        <span className="text-xs font-normal text-slate-500">
                          /mhs
                        </span>
                      </p>
                      {filter.isStudentKtm && (
                        <p className="text-[11px] font-semibold text-emerald-600">
                          Hemat {formatRupiah(savings)} dengan KTM
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectTrain(train)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-blue-700/20 hover:bg-blue-800 transition"
                    >
                      <span>Pesan Tiket</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Facilities Footer */}
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <span className="font-semibold text-slate-400">Fasilitas Kampus:</span>
                  {train.facilities.map((fac) => (
                    <span
                      key={fac}
                      className="inline-flex items-center gap-1 text-slate-600"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      {fac}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
