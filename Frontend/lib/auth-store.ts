import { createStorageStore } from "./storage-store";
import type { User } from "./types";

export interface Session {
  token: string;
  user: User;
}

export const sessionStore = createStorageStore<Session>("local", "busgo.session");
