export interface UserProfile {
  id: number;
  name: string;
  email: string;
  created_at?: string;
  createdAt?: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
}

export interface Station {
  code: string;
  name: string;
  city: string;
  campusCluster: string;
}

export type TrainClass = 'Ekonomi Mahasiswa' | 'Ekonomi Plus' | 'Eksekutif Kampus';

export interface TrainSchedule {
  id: string;
  trainName: string;
  trainCode: string;
  originCode: string;
  destinationCode: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  period: 'Pagi' | 'Siang' | 'Malam';
  trainClass: TrainClass;
  regularPrice: number;
  studentDiscountPercent: number;
  seatsAvailable: number;
  facilities: string[];
  badge?: string;
}

export interface SearchFilter {
  origin: string;
  destination: string;
  date: string;
  returnDate: string;
  passengers: number;
  isStudentKtm: boolean;
  classFilter: 'ALL' | TrainClass;
  periodFilter: 'ALL' | 'Pagi' | 'Siang' | 'Malam';
  sortBy: 'PRICE_ASC' | 'DEPARTURE_ASC' | 'DURATION_ASC';
}

export interface BookingRecord {
  bookingCode: string;
  train: TrainSchedule;
  originStation: Station;
  destinationStation: Station;
  travelDate: string;
  passengers: number;
  studentName: string;
  studentEmail: string;
  nim: string;
  university: string;
  paymentMethod: 'QRIS' | 'GoPay / DANA' | 'Virtual Account Kampus';
  totalPrice: number;
  savedAmount: number;
  seatNumber: string;
  createdAt: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}
