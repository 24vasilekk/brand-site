"use client";

import { useEffect, useMemo, useState } from "react";
import { defaultSiteConfig, sanitizeSiteConfig, type SiteConfig } from "@/lib/site-config";

export const useSiteConfig = () => {
  const [config, setConfig] = useState<SiteConfig>(defaultSiteConfig);
  const [savedConfig, setSavedConfig] = useState<SiteConfig>(defaultSiteConfig);
  const [isReady, setIsReady] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadConfig = async () => {
      try {
        const response = await fetch("/api/site-config", { cache: "no-store" });
        if (!response.ok) throw new Error("fetch-failed");
        const payload = (await response.json().catch(() => null)) as unknown;
        const normalized = sanitizeSiteConfig(payload);
        if (!isMounted) return;
        setConfig(normalized);
        setSavedConfig(normalized);
      } catch {
        if (!isMounted) return;
        setConfig(defaultSiteConfig);
        setSavedConfig(defaultSiteConfig);
      } finally {
        if (isMounted) setIsReady(true);
      }
    };

    loadConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  const saveConfig = async () => {
    if (!isReady || isSaving) return;
    setSaveError("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/site-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });

      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; config?: unknown; error?: string }
        | null;

      if (!response.ok || !payload?.ok) {
        setSaveError(payload?.error || "Ошибка сохранения");
        return;
      }

      const normalized = sanitizeSiteConfig(payload.config);
      setConfig(normalized);
      setSavedConfig(normalized);
      setLastSavedAt(Date.now());
    } catch {
      setSaveError("Ошибка сети при сохранении");
    } finally {
      setIsSaving(false);
    }
  };

  const resetConfig = () => {
    setConfig(defaultSiteConfig);
    setSaveError("");
  };

  const hasUnsavedChanges = JSON.stringify(config) !== JSON.stringify(savedConfig);

  return useMemo(
    () => ({
      config,
      setConfig,
      isReady,
      hasUnsavedChanges,
      saveConfig,
      resetConfig,
      lastSavedAt,
      saveError,
      isSaving
    }),
    [config, hasUnsavedChanges, isReady, isSaving, lastSavedAt, saveError]
  );
};
