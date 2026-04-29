import { cookies } from "next/headers";
import type { SessionUser } from "./session";

export const SESSION_COOKIE = "session";
export const SESSION_USER_COOKIE = "session_user";

export function setSessionCookie(token: string, maxAgeSeconds = 3600) {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export function setSessionUserCookie(user: SessionUser, maxAgeSeconds = 3600) {
  cookies().set(SESSION_USER_COOKIE, JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export function clearSessionCookie() {
  cookies().delete(SESSION_COOKIE);
  cookies().delete(SESSION_USER_COOKIE);
}
