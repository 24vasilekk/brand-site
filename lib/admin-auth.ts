export const ADMIN_SESSION_COOKIE = "brand_admin_session";

const ADMIN_LOGIN = process.env.ADMIN_LOGIN ?? "123132";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "123132";
const ADMIN_SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ?? "brand-admin-secret-change-me-in-env";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14;

const encoder = new TextEncoder();

const toBase64Url = (bytes: Uint8Array) => {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const fromBase64Url = (value: string) => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4 || 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

const safeEqual = (left: string, right: string) => {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let i = 0; i < left.length; i += 1) mismatch |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return mismatch === 0;
};

const sign = async (data: string) => {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(ADMIN_SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return toBase64Url(new Uint8Array(signature));
};

type SessionPayload = {
  u: string;
  exp: number;
};

export const isValidAdminCredentials = (login: string, password: string) =>
  safeEqual(login, ADMIN_LOGIN) && safeEqual(password, ADMIN_PASSWORD);

export const createAdminSessionToken = async () => {
  const payload: SessionPayload = {
    u: ADMIN_LOGIN,
    exp: Date.now() + SESSION_TTL_MS
  };
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await sign(body);
  return `${body}.${signature}`;
};

export const verifyAdminSessionToken = async (token: string | undefined) => {
  if (!token) return false;
  const [body, signature] = token.split(".");
  if (!body || !signature) return false;

  const expected = await sign(body);
  if (!safeEqual(signature, expected)) return false;

  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as SessionPayload;
    if (payload.u !== ADMIN_LOGIN) return false;
    if (!payload.exp || payload.exp < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
};

export const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 14
};
