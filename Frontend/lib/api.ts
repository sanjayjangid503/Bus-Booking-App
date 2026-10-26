import { sessionStore } from "./auth-store";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

// Messages the auth middleware sends when the token itself is the problem.
const TOKEN_ERRORS = ["Not authorized, token missing", "Invalid or expired token"];

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Query = Record<string, string | number | undefined | null>;

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Query;
  auth?: boolean;
}

export async function request<T>(path: string, { method = "GET", body, query, auth }: RequestOptions = {}) {
  const url = new URL(`${API_URL}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    }
  }

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = sessionStore.get()?.token;
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Can't reach the server. Check that the backend is running.");
  }

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message: string = json?.message ?? `Request failed (${res.status})`;
    if (res.status === 401 && TOKEN_ERRORS.includes(message)) {
      sessionStore.set(null);
    }
    throw new ApiError(res.status, message);
  }

  return json as T;
}

export const errorMessage = (err: unknown) =>
  err instanceof Error ? err.message : "Something went wrong";
