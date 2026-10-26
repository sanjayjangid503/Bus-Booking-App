import { request } from "./api";
import type { Booking, BookingStatus, Bus, BusType, Cities, Pagination, Passenger, Seat, User } from "./types";

export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; data: User }>("/auth/login", { method: "POST", body: { email, password } }),

  register: (name: string, email: string, password: string) =>
    request<{ token: string; data: User }>("/auth/register", {
      method: "POST",
      body: { name, email, password },
    }),

  me: () => request<{ user: User }>("/auth/user", { auth: true }),
};

export const busApi = {
  cities: () => request<{ result: Cities }>("/buses/cities").then((r) => r.result),

  search: (params: { from?: string; to?: string; busType?: BusType; page?: number; limit?: number }) =>
    request<{ result: { buses: Bus[]; pagination: Pagination } }>("/buses/search", { query: params }).then(
      (r) => r.result,
    ),

  get: (id: string) => request<{ result: Bus | null }>(`/buses/${id}`).then((r) => r.result),

  seats: (id: string, date: string) =>
    request<{ seats: Seat[] }>(`/buses/${id}/seats`, { query: { date } }).then((r) => r.seats),

  lock: (id: string, travelDate: string, seats: string[]) =>
    request<{ data: { lockExpireAt: string } }>(`/buses/${id}/seats/lock`, {
      method: "POST",
      auth: true,
      body: { travelDate, seats },
    }).then((r) => r.data),

  unlock: (id: string, travelDate: string, seats: string[]) =>
    request(`/buses/${id}/seats/lock`, { method: "DELETE", auth: true, body: { travelDate, seats } }),
};

export const bookingApi = {
  create: (busId: string, travelDate: string, seats: string[], passengers: Passenger[]) =>
    request<{ result: Booking }>("/bookings", {
      method: "POST",
      auth: true,
      body: { busId, travelDate, seats, passengers },
    }).then((r) => r.result),

  list: (params: { page: number; limit: number; status?: BookingStatus; sort: "asc" | "desc" }) =>
    request<{ result: { bookings: Booking[]; total: number; page: number; totalPages: number } }>("/bookings", {
      auth: true,
      query: params,
    }).then((r) => r.result),

  get: (id: string) => request<{ booking: Booking }>(`/bookings/${id}`, { auth: true }).then((r) => r.booking),

  cancel: (id: string) =>
    request<{ booking: Booking }>(`/bookings/${id}/cancel`, { method: "PATCH", auth: true }).then((r) => r.booking),
};
