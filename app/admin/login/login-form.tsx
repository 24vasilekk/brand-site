"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error || "Неверный логин или пароль");
        return;
      }

      router.replace("/admin");
    } catch {
      setError("Ошибка сети. Попробуйте еще раз");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="w-full max-w-md rounded-3xl border border-charcoal/20 bg-charcoal p-6 text-ivory md:p-8"
    >
      <h1 className="brand-font text-center text-3xl uppercase">Вход в админку</h1>
      <p className="mt-2 text-center text-sm text-ivory/70">Введите логин и пароль</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block space-y-2">
          <span className="text-xs uppercase tracking-[0.12em] text-ivory/80">Логин</span>
          <input
            type="text"
            value={login}
            onChange={(event) => setLogin(event.target.value)}
            className="w-full rounded-xl border border-ivory/30 bg-charcoal px-4 py-3 text-sm text-ivory outline-none transition focus:border-ivory"
            placeholder="Введите логин"
            autoComplete="username"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-xs uppercase tracking-[0.12em] text-ivory/80">Пароль</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-ivory/30 bg-charcoal px-4 py-3 text-sm text-ivory outline-none transition focus:border-ivory"
            placeholder="Введите пароль"
            autoComplete="current-password"
          />
        </label>

        {error ? <p className="text-sm text-ivory">{error}</p> : null}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-full bg-ivory px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-charcoal transition hover:bg-ivory/85 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Вход..." : "Войти"}
        </button>
      </form>
    </motion.section>
  );
}
