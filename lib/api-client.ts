import { env, useMocks } from "./env";

const BROWSER_PROXY_BASE = "/api/backend";

export type FieldErrors = Record<string, string | string[]>;

type ServerTokenReader = () => string | null;

// Stored on globalThis so the registration survives HMR module evictions in
// dev. If `lib/api-client.ts` reloaded but `lib/api-client.server.ts` did
// not, a module-level `let serverTokenReader` would silently reset to null
// and every server-rendered fetch would drop the Authorization header.
declare global {
  // eslint-disable-next-line no-var
  var __lmsServerTokenReader: ServerTokenReader | undefined;
}

export function setServerTokenReader(reader: ServerTokenReader): void {
  globalThis.__lmsServerTokenReader = reader;
}

export class ApiError extends Error {
  readonly statusCode: number;
  readonly fieldErrors?: FieldErrors;

  constructor(message: string, statusCode: number, fieldErrors?: FieldErrors) {
    super(message);
    this.statusCode = statusCode;
    this.fieldErrors = fieldErrors;
    this.name = "ApiError";
  }
}

type SuccessEnvelope<T> = { success: true; data: T; message?: string };
type ErrorEnvelope = { success: false; error: string; statusCode: number; fieldErrors?: FieldErrors };
type Envelope<T> = SuccessEnvelope<T> | ErrorEnvelope;

export type Pagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type ListEnvelope<T> = { items: T[]; pagination: Pagination };

function resolveBaseUrl() {
  if (typeof window !== "undefined" && !useMocks) {
    return BROWSER_PROXY_BASE;
  }
  return env.NEXT_PUBLIC_API_BASE_URL.replace(/\/+$/, "");
}

function readServerToken(): string | null {
  if (typeof window !== "undefined") return null;
  const reader = globalThis.__lmsServerTokenReader;
  if (!reader) return null;
  try {
    return reader();
  } catch {
    return null;
  }
}

export type FetchInit = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown> | null;
  query?: Record<string, string | number | boolean | null | undefined>;
};

function buildQueryString(query: FetchInit["query"]): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === "") continue;
    params.set(k, String(v));
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

export async function apiFetch<T>(path: string, init: FetchInit = {}): Promise<T> {
  const base = resolveBaseUrl();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}${buildQueryString(init.query)}`;

  const headers = new Headers(init.headers);
  const token = typeof window === "undefined" ? readServerToken() : null;
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let body: BodyInit | undefined;
  if (init.body !== undefined && init.body !== null) {
    if (typeof init.body === "string" || init.body instanceof FormData || init.body instanceof Blob) {
      body = init.body as BodyInit;
    } else {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(init.body);
    }
  }

  const res = await fetch(url, {
    ...init,
    headers,
    body,
    credentials: "include",
    cache: init.cache ?? "no-store",
  });

  const text = await res.text();
  let envelope: Envelope<T> | null = null;
  if (text) {
    try {
      envelope = JSON.parse(text) as Envelope<T>;
    } catch {
      throw new ApiError(`Non-JSON response from ${path}`, res.status);
    }
  }

  if (!res.ok || !envelope || envelope.success === false) {
    const e = envelope as ErrorEnvelope | null;
    throw new ApiError(e?.error ?? res.statusText, e?.statusCode ?? res.status, e?.fieldErrors);
  }

  return envelope.data;
}

export async function apiList<T>(
  path: string,
  query: Record<string, string | number | boolean | null | undefined> = {},
): Promise<ListEnvelope<T>> {
  return apiFetch<ListEnvelope<T>>(path, { query });
}
