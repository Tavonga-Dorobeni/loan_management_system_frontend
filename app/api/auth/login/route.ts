import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { setSessionCookie, setSessionUserCookie } from "@/lib/auth/cookies";
import { isRole } from "@/lib/rbac";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { success: false, error: "Invalid request body", statusCode: 400 },
      { status: 400 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Auth service unreachable", statusCode: 502 },
      { status: 502 },
    );
  }

  const payload = await upstream.json().catch(() => null);

  if (!upstream.ok || !payload?.success) {
    const status = upstream.status || 500;
    return NextResponse.json(
      payload ?? { success: false, error: "Login failed", statusCode: status },
      { status },
    );
  }

  const token: string | undefined = payload.data?.token;
  const user = payload.data?.user;

  if (!token || !user || !isRole(user.role)) {
    return NextResponse.json(
      { success: false, error: "Malformed login response", statusCode: 502 },
      { status: 502 },
    );
  }

  setSessionCookie(token);
  setSessionUserCookie({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    status: user.status,
  });

  return NextResponse.json({ success: true, data: { user } });
}
