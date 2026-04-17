import { head, put } from "@vercel/blob";
import { defaultSiteConfig, sanitizeSiteConfig, type SiteConfig } from "@/lib/site-config";

const SITE_CONFIG_BLOB_PATH = "config/site-config.json";

const getBlobToken = () => process.env["BLOB_READ_WRITE_TOKEN"];

const hasBlobToken = () => Boolean(getBlobToken());

const fetchConfigByUrl = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return null;
  const payload = (await response.json().catch(() => null)) as unknown;
  return sanitizeSiteConfig(payload);
};

export const readSiteConfig = async (): Promise<SiteConfig> => {
  if (!hasBlobToken()) return defaultSiteConfig;

  try {
    const blob = await head(SITE_CONFIG_BLOB_PATH, { token: getBlobToken() });
    const config = await fetchConfigByUrl(blob.url);
    return config ?? defaultSiteConfig;
  } catch {
    return defaultSiteConfig;
  }
};

export const writeSiteConfig = async (value: unknown): Promise<SiteConfig> => {
  const config = sanitizeSiteConfig(value);
  if (!hasBlobToken()) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
  }

  await put(SITE_CONFIG_BLOB_PATH, JSON.stringify(config), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json; charset=utf-8",
    token: getBlobToken()
  });

  return config;
};
