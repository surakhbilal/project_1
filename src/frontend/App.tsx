import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  Train,
  GraduationCap,
  Ticket,
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { BackendInspector } from './components/BackendInspector';
import { HeroSearch } from './components/HeroSearch';
import { TrainCatalog, getDiscountedPrice } from './components/TrainCatalog';
import { BookingModal } from './components/BookingModal';
import { PromoSection } from './components/PromoSection';
import { AuthModal } from './components/AuthModal';
import { TRAIN_SCHEDULES } from './data/trains';
import type { BookingRecord, SearchFilter, TrainSchedule } from './types';

function parseDurationMinutes(duration: string): number {
  const hoursMatch = duration.match(/(\d+)j/);
  const minsMatch = duration.match(/(\d+)m/);
  const hours = hoursMatch ? Number(hoursMatch[1]) : 0;
  const mins = minsMatch ? Number(minsMatch[1]) : 0;
  return hours * 60 + mins;
}

function EduRailContent() {
  const { toasts, dismissToast, pushToast } = useAuth();

  const [filter, setFilter] = useState<SearchFilter>({
    origin: 'ALL',
    destination: 'ALL',
    date: '2026-11-25',
    returnDate: '',
    passengers: 1,
    isStudentKtm: true,
    classFilter: 'ALL',
    periodFilter: 'ALL',
    sortBy: 'PRICE_ASC',
  });

  const [selectedTrain, setSelectedTrain] = useState<TrainSchedule | null>(null);
  const [myBookings, setMyBookings] = useState<BookingRecord[]>([]);
  const [showMyBookingsModal, setShowMyBookingsModal] = useState(false);

  const filteredSchedules = useMemo(() => {
    return TRAIN_SCHEDULES.filter((item) => {
      if (filter.origin !== 'ALL' && item.originCode !== filter.origin) {
        return false;
      }
      if (
        filter.destination !== 'ALL' &&
        item.destinationCode !== filter.destination
      ) {
        return false;
      }
      if (
        filter.classFilter !== 'ALL' &&
        item.trainClass !== filter.classFilter
      ) {
        return false;
      }
      if (
        filter.periodFilter !== 'ALL' &&
        item.period !== filter.periodFilter
      ) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (filter.sortBy === 'PRICE_ASC') {
        return (
          getDiscountedPrice(a, filter.isStudentKtm) -
          getDiscountedPrice(b, filter.isStudentKtm)
        );
      }
      if (filter.sortBy === 'DEPARTURE_ASC') {
        return a.departureTime.localeCompare(b.departureTime);
      }
      return parseDurationMinutes(a.duration) - parseDurationMinutes(b.duration);
    });
  }, [filter]);

  const handleSearchSubmit = () => {
    const el = document.getElementById('katalog-kereta');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    pushToast({
      type: 'info',
      title: `Ditemukan ${filteredSchedules.length} Jadwal Kereta Mahasiswa`,
      description: filter.isStudentKtm
        ? 'Tarif subsidi KTM 20%–25% telah diaktifkan.'
        : 'Menampilkan tarif reguler.',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <Navbar
        myBookingsCount={myBookings.length}
        onOpenMyBookings={() => setShowMyBookingsModal(true)}
      />

      {/* Live Backend & MySQL Inspector Panel */}
      <BackendInspector />

      {/* Main Content */}
      <main className="flex-1">
        <HeroSearch
          filter={filter}
          onChangeFilter={setFilter}
          onSubmitSearch={handleSearchSubmit}
        />

        <TrainCatalog
          schedules={filteredSchedules}
          filter={filter}
          onChangeFilter={setFilter}
          onSelectTrain={(train) => setSelectedTrain(train)}
        />

        <PromoSection />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-800 text-white">
              <Train className="h-4 w-4" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900">
                EduRail Indonesia
              </span>
              <p className="text-[11px] text-slate-400">
                Powered by Bun + ElysiaJS + Drizzle ORM + MySQL + React
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <GraduationCap className="h-4 w-4 text-blue-700" />
            <span>
              Layanan Tiket Kereta Khusus Mahasiswa • Terintegrasi Penuh dengan Backend REST API
            </span>
          </div>
        </div>
      </footer>

      {/* Booking & Digital Boarding Pass Modal */}
      <BookingModal
        train={selectedTrain}
        filter={filter}
        onClose={() => setSelectedTrain(null)}
        onBookingCompleted={(rec) => setMyBookings((prev) => [rec, ...prev])}
      />

      {/* Saved Bookings Drawer/Modal */}
      {showMyBookingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-blue-700" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Daftar E-Ticket Mahasiswa Saya ({myBookings.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMyBookingsModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 max-h-96 space-y-3 overflow-y-auto">
              {myBookings.map((b) => (
                <div
                  key={b.bookingCode}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between"
                >
                  <div>
                    <span className="rounded bg-emerald-600 px-2 py-0.5 font-mono text-[11px] font-bold text-white">
                      {b.bookingCode}
                    </span>
                    <p className="mt-1 text-sm font-extrabold text-slate-900">
                      {b.train.trainName} • {b.originStation.city} →{' '}
                      {b.destinationStation.city}
                    </p>
                    <p className="text-xs text-slate-500">
                      {b.travelDate} • Jam {b.train.departureTime} • Kursi{' '}
                      {b.seatNumber}
                    </p>
                    <p className="text-[11px] font-semibold text-blue-700 mt-0.5">
                      {b.studentName} ({b.nim} - {b.university})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Login & Register Modal */}
      <AuthModal />

      {/* Toast Notification Stack */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-xl transition-all ${
              t.type === 'success'
                ? 'border-emerald-200 bg-white text-slate-900'
                : t.type === 'error'
                ? 'border-rose-200 bg-white text-slate-900'
                : 'border-blue-200 bg-white text-slate-900'
            }`}
          >
            {t.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
            ) : t.type === 'error' ? (
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
            ) : (
              <Info className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
            )}
            <div className="flex-1 text-xs">
              <p className="font-extrabold text-slate-900">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-slate-600 leading-relaxed">
                  {t.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <EduRailContent />
    </AuthProvider>
  );
}
