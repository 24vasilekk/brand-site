import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_OPTIONS,
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  isValidAdminCredentials
} from "@/lib/admin-auth";

type LoginBody = {
  login?: string;
  password?: string;
};

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const attempts = new Map<string, { count: number; firstAt: number }>();

const getClientKey = (request: Request) => request.headers.get("x-forwarded-for") ?? "local";

const isRateLimited = (key: string) => {
  const now = Date.now();
  const row = attempts.get(key);
  if (!row) return false;
  if (now - row.firstAt > WINDOW_MS) {
    attempts.delete(key);
    return false;
  }
  return row.count >= MAX_ATTEMPTS;
};

const bumpAttempt = (key: string) => {
  const now = Date.now();
  const row = attempts.get(key);
  if (!row || now - row.firstAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: now });
    return;
  }
  attempts.set(key, { ...row, count: row.count + 1 });
};

const clearAttempts = (key: string) => {
  attempts.delete(key);
};

export async function POST(request: Request) {
  const clientKey = getClientKey(request);
  if (isRateLimited(clientKey)) {
    return NextResponse.json({ ok: false, error: "Слишком много попыток. Повторите позже." }, { status: 429 });
  }

  const body = (await request.json().catch(() => ({}))) as LoginBody;
  const login = (body.login ?? "").trim();
  const password = body.password ?? "";

  if (!isValidAdminCredentials(login, password)) {
    bumpAttempt(clientKey);
    return NextResponse.json({ ok: false, error: "Неверный логин или пароль" }, { status: 401 });
  }

  clearAttempts(clientKey);
  const token = await createAdminSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, token, ADMIN_COOKIE_OPTIONS);
  return response;
}
