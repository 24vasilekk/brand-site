import { NextResponse } from "next/server";
import { ADMIN_COOKIE_OPTIONS, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", { ...ADMIN_COOKIE_OPTIONS, maxAge: 0 });
  return response;
}
