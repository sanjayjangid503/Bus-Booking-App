export type BusType = "AC_SEATER" | "NON_AC_SEATER" | "AC_SLEEPER" | "NON_AC_SLEEPER";
export type SeatStatus = "AVAILABLE" | "LOCKED" | "BOOKED";
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface RouteStop {
  city: string;
  arrival: string;
  departure: string;
}

export interface Route {
  _id: string;
  from: string;
  to: string;
  stopes: RouteStop[];
  duration: number;
}

export interface Bus {
  _id: string;
  operator: string;
  busNumber: string;
  busType: BusType;
  totalSeats: number;
  seatLayout: string[][];
  route: Route;
}

export interface Seat {
  seatNumber: string;
  price: number;
  status: SeatStatus;
}

export interface Passenger {
  name: string;
  age: number;
  gender: Gender;
  seat: string;
}

export interface Booking {
  _id: string;
  bookingNumber: string;
  bus: Bus;
  user: string;
  travelDate: string;
  seats: string[];
  passengers: Passenger[];
  status: BookingStatus;
  totalAmount: number;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Cities {
  from: string[];
  to: string[];
}
