import React, { useState } from 'react';
import {
  X,
  Train,
  GraduationCap,
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Printer,
  Sparkles,
  Lock,
} from 'lucide-react';
import { STATIONS } from '../data/trains';
import { formatRupiah, getDiscountedPrice } from './TrainCatalog';
import { useAuth } from '../context/AuthContext';
import type { BookingRecord, SearchFilter, TrainSchedule } from '../types';

interface BookingModalProps {
  train: TrainSchedule | null;
  filter: SearchFilter;
  onClose: () => void;
  onBookingCompleted: (record: BookingRecord) => void;
}

const UNIVERSITIES = [
  'Universitas Gadjah Mada (UGM)',
  'Institut Teknologi Bandung (ITB)',
  'Universitas Indonesia (UI)',
  'Institut Teknologi Sepuluh Nopember (ITS)',
  'Universitas Brawijaya (UB)',
  'Universitas Airlangga (UNAIR)',
  'Universitas Padjadjaran (UNPAD)',
  'Universitas Diponegoro (UNDIP)',
  'Universitas Negeri Yogyakarta (UNY)',
  'Universitas Sebelas Maret (UNS)',
];

export function BookingModal({
  train,
  filter,
  onClose,
  onBookingCompleted,
}: BookingModalProps) {
  const { user, openAuthModal, pushToast } = useAuth();

  const [nim, setNim] = useState('24/512098/TK/56112');
  const [university, setUniversity] = useState(UNIVERSITIES[0]!);
  const [paymentMethod, setPaymentMethod] = useState<
    'QRIS' | 'GoPay / DANA' | 'Virtual Account Kampus'
  >('QRIS');
  const [createdTicket, setCreatedTicket] = useState<BookingRecord | null>(null);

  if (!train) return null;

  const stationMap = new Map(STATIONS.map((s) => [s.code, s]));
  const originStation = stationMap.get(train.originCode)!;
  const destinationStation = stationMap.get(train.destinationCode)!;

  const unitPrice = getDiscountedPrice(train, filter.isStudentKtm);
  const totalPrice = unitPrice * filter.passengers;
  const savedAmount = (train.regularPrice - unitPrice) * filter.passengers;

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      pushToast({
        type: 'info',
        title: 'Login Diperlukan untuk Verifikasi KTM',
        description:
          'Silakan masuk atau daftar akun mahasiswa terlebih dahulu agar tiket terhubung ke sesi Anda.',
      });
      openAuthModal('login');
      return;
    }

    if (!nim.trim()) {
      pushToast({
        type: 'error',
        title: 'NIM Wajib Diisi',
        description: 'Masukkan Nomor Induk Mahasiswa Anda untuk validasi tarif KTM.',
      });
      return;
    }

    const code = `EDU-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const wagon = train.trainClass === 'Eksekutif Kampus' ? 'EKS-1' : 'EKO-2';
    const seatRow = Math.floor(Math.random() * 14) + 1;
    const seatCol = ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)];

    const newRecord: BookingRecord = {
      bookingCode: code,
      train,
      originStation,
      destinationStation,
      travelDate: filter.date,
      passengers: filter.passengers,
      studentName: user.name,
      studentEmail: user.email,
      nim: nim.trim(),
      university,
      paymentMethod,
      totalPrice,
      savedAmount,
      seatNumber: `${wagon} / ${seatRow}${seatCol}`,
      createdAt: new Date().toISOString(),
    };

    setCreatedTicket(newRecord);
    onBookingCompleted(newRecord);
    pushToast({
      type: 'success',
      title: `E-Ticket ${code} Berhasil Diterbitkan!`,
      description: `Tiket ${train.trainName} atas nama ${user.name} siap digunakan.`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative my-8 w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-900 via-blue-800 to-emerald-700 px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <Train className="h-5 w-5 text-emerald-300" />
            <div>
              <h3 className="text-base font-extrabold">
                {createdTicket
                  ? 'E-Ticket & Boarding Pass Mahasiswa'
                  : 'Konfirmasi Pemesanan Tiket Mahasiswa'}
              </h3>
              <p className="text-xs text-blue-100">
                {train.trainName} ({train.trainCode}) • {train.trainClass}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-white/10 p-1.5 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* STEP 2: DIGITAL E-TICKET BOARDING PASS */}
        {createdTicket ? (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3 border border-emerald-200">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-xs font-extrabold text-emerald-900">
                    PEMBAYARAN LUNAS ({createdTicket.paymentMethod})
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    Tunjukkan QR Boarding Pass &amp; KTM Anda saat check-in di stasiun
                  </p>
                </div>
              </div>
              <span className="rounded-lg bg-emerald-600 px-2.5 py-1 font-mono text-xs font-bold text-white">
                {createdTicket.bookingCode}
              </span>
            </div>

            {/* Boarding Pass Card */}
            <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-50">
              <div className="bg-slate-900 px-5 py-3 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    EduRail Student Boarding Pass
                  </span>
                </div>
                <span className="text-xs font-semibold text-emerald-400">
                  KTM Verified • ID #{user?.id}
                </span>
              </div>

              <div className="p-5 grid grid-cols-1 gap-6 sm:grid-cols-12 items-center">
                <div className="sm:col-span-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-400">
                        KEBERANGKATAN
                      </p>
                      <p className="text-2xl font-extrabold text-slate-900">
                        {createdTicket.train.departureTime}
                      </p>
                      <p className="text-xs font-bold text-slate-700">
                        {createdTicket.originStation.name} (
                        {createdTicket.originStation.code})
                      </p>
                    </div>

                    <div className="text-center px-2">
                      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-800">
                        {createdTicket.train.duration}
                      </span>
                      <p className="mt-1 text-[11px] font-semibold text-slate-500">
                        {createdTicket.travelDate}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-400">TIBA</p>
                      <p className="text-2xl font-extrabold text-slate-900">
                        {createdTicket.train.arrivalTime}
                      </p>
                      <p className="text-xs font-bold text-slate-700">
                        {createdTicket.destinationStation.name} (
                        {createdTicket.destinationStation.code})
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-3 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium">
                        Nama Mahasiswa:
                      </span>
                      <p className="font-bold text-slate-900">
                        {createdTicket.studentName}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">NIM / KTM:</span>
                      <p className="font-mono font-bold text-slate-900">
                        {createdTicket.nim}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Kampus:</span>
                      <p className="font-bold text-slate-900">
                        {createdTicket.university}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">
                        Gerbong / Kursi:
                      </span>
                      <p className="font-mono font-extrabold text-blue-700">
                        {createdTicket.seatNumber} ({createdTicket.passengers} Mhs)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Simulated QR Code Block */}
                <div className="sm:col-span-4 flex flex-col items-center justify-center border-t sm:border-t-0 sm:border-l border-dashed border-slate-300 pt-4 sm:pt-0 sm:pl-4">
                  <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-2 border-slate-900 bg-white p-2 shadow-sm">
                    <QrCode className="h-20 w-20 text-slate-900" />
                  </div>
                  <p className="mt-2 font-mono text-xs font-extrabold text-slate-900">
                    {createdTicket.bookingCode}
                  </p>
                  <p className="text-[10px] font-semibold text-emerald-700">
                    Total: {formatRupiah(createdTicket.totalPrice)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <Printer className="h-4 w-4" />
                <span>Cetak E-Ticket</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-blue-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-800"
              >
                Selesai
              </button>
            </div>
          </div>
        ) : (
          /* STEP 1: BOOKING FORM */
          <form onSubmit={handleConfirmBooking} className="p-6 space-y-5">
            {/* Route Summary Box */}
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-blue-700">
                  {filter.date} • {filter.passengers} Penumpang Mahasiswa
                </span>
                <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                  {originStation.name} ({originStation.code}) →{' '}
                  {destinationStation.name} ({destinationStation.code})
                </p>
                <p className="text-xs text-slate-500">
                  Berangkat {train.departureTime} • Tiba {train.arrivalTime} (
                  {train.duration})
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Total Bayar</p>
                <p className="text-xl font-extrabold text-blue-800">
                  {formatRupiah(totalPrice)}
                </p>
                {savedAmount > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                    <Sparkles className="h-3 w-3" />
                    Hemat {formatRupiah(savedAmount)}
                  </span>
                )}
              </div>
            </div>

            {/* Auth Status Check */}
            {user ? (
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-950">
                    Terhubung ke Akun Mahasiswa: {user.name} ({user.email})
                  </span>
                </div>
                <span className="font-mono text-[11px] font-semibold text-emerald-700">
                  User ID #{user.id}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <Lock className="h-4 w-4 text-amber-600" />
                  <div>
                    <p className="text-xs font-bold text-amber-900">
                      Anda Belum Login ke Akun Mahasiswa
                    </p>
                    <p className="text-[11px] text-amber-700">
                      Login diperlukan agar pemesanan terverifikasi dengan sesi backend.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700"
                >
                  Login Sekarang
                </button>
              </div>
            )}

            {/* Student KTM Fields */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor Induk Mahasiswa (NIM / NPM)
                </label>
                <input
                  type="text"
                  required
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  placeholder="Contoh: 24/512098/TK/56112"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Perguruan Tinggi / Universitas
                </label>
                <select
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
                >
                  {UNIVERSITIES.map((uni) => (
                    <option key={uni} value={uni}>
                      {uni}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Metode Pembayaran Ramah Mahasiswa
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(
                  [
                    'QRIS',
                    'GoPay / DANA',
                    'Virtual Account Kampus',
                  ] as const
                ).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition ${
                      paymentMethod === method
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="h-4 w-4 mb-1 text-blue-600" />
                    <span className="text-xs font-bold">{method}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-blue-700/20 hover:from-blue-800 hover:to-emerald-700"
              >
                <span>Bayar &amp; Terbitkan E-Ticket</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
