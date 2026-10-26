import { createStorageStore } from "./storage-store";
import type { BusType } from "./types";

/** Seats the user has locked and is filling passenger details for. */
export interface BookingDraft {
  busId: string;
  travelDate: string;
  seats: string[];
  lockExpireAt: string;
  fare: number;
  bus: {
    operator: string;
    busNumber: string;
    busType: BusType;
    from: string;
    to: string;
    duration: number;
  };
}

export const draftStore = createStorageStore<BookingDraft>("session", "busgo.draft");
