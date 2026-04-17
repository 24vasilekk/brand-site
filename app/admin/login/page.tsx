import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "./login-form";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-auth";

export default async function AdminLoginPage() {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  const isAuthed = await verifyAdminSessionToken(token);
  if (isAuthed) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-ivory text-charcoal">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-start justify-center px-4 py-8">
        <AdminLoginForm />
      </div>
    </main>
  );
}
