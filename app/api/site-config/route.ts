import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-auth";
import { readSiteConfig, writeSiteConfig } from "@/lib/server-site-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"
};

export async function GET() {
  const config = await readSiteConfig();
  return NextResponse.json(config, { headers: NO_STORE_HEADERS });
}

export async function PUT(request: Request) {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  const isAuthed = await verifyAdminSessionToken(token);
  if (!isAuthed) {
    return NextResponse.json({ ok: false, error: "Не авторизован" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as unknown;
  if (!payload) {
    return NextResponse.json({ ok: false, error: "Некорректные данные" }, { status: 400 });
  }

  try {
    const saved = await writeSiteConfig(payload);
    return NextResponse.json({ ok: true, config: saved }, { headers: NO_STORE_HEADERS });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Не удалось сохранить конфиг. Проверьте BLOB_READ_WRITE_TOKEN." },
      { status: 500 }
    );
  }
}
