export const SITE_CONFIG_STORAGE_KEY = "brand_site_config_v1";

export const SIZES = ["XS", "S", "M", "L", "XL"] as const;

export type Size = (typeof SIZES)[number];

export type FirstBlockItem = {
  id: string;
  name: string;
  price: number;
  image: string;
};

export type MarketItem = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  images: string[];
  stock: Record<Size, number>;
};

export type SiteConfig = {
  telegramUsername: string;
  firstBlockItems: FirstBlockItem[];
  lookbookImages: string[];
  marketItems: MarketItem[];
};

export const defaultSiteConfig: SiteConfig = {
  telegramUsername: "Romanov_ink",
  firstBlockItems: [
    { id: "p-1", name: "Белая футболка", price: 4000, image: "/images/item-1.png" },
    { id: "p-2", name: "Черное худи", price: 7000, image: "/images/item-2.png" },
    { id: "p-3", name: "Черная футболка", price: 4000, image: "/images/item-3.png" },
    { id: "p-4", name: "Белое худи", price: 7000, image: "/images/item-4.png" }
  ],
  lookbookImages: [
    "/lookbook/look-1.jpg",
    "/lookbook/look-2.jpg",
    "/lookbook/look-3.jpg",
    "/lookbook/look-4.jpg",
    "/lookbook/look-5.jpg",
    "/lookbook/look-6.jpg",
    "/lookbook/look-7.jpg",
    "/lookbook/look-8.jpg",
    "/lookbook/look-9.jpg"
  ],
  marketItems: [
    {
      id: "m-2",
      name: "Черное худи",
      price: 7000,
      description: "Плотное худи на каждый день: мягкий футер, аккуратная посадка и чистый черный цвет.",
      image: "/images/item-2.png",
      images: ["/images/item-2.png", "/images/black-hoodie-2.jpg", "/images/black-hoodie-3.jpg"],
      stock: { XS: 1, S: 4, M: 6, L: 3, XL: 1 }
    },
    {
      id: "m-6",
      name: "Белое худи",
      price: 7000,
      description: "Светлое базовое худи с комфортным объемом и мягкой тканью — легко сочетать с любым образом.",
      image: "/images/item-4.png",
      images: ["/images/item-4.png", "/images/white-hoodie-2.jpg", "/images/white-hoodie-3.jpg"],
      stock: { XS: 1, S: 3, M: 5, L: 4, XL: 2 }
    }
  ]
};

export const createEmptyStock = (): Record<Size, number> => ({
  XS: 0,
  S: 0,
  M: 0,
  L: 0,
  XL: 0
});

export const createNewFirstBlockItem = (): FirstBlockItem => ({
  id: `first-${Date.now()}`,
  name: "Новый товар",
  price: 0,
  image: "/images/item-1.png"
});

export const createNewMarketItem = (): MarketItem => ({
  id: `market-${Date.now()}`,
  name: "Новый товар маркета",
  price: 0,
  description: "Короткое описание товара",
  image: "/images/item-1.png",
  images: ["/images/item-1.png"],
  stock: createEmptyStock()
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toSafeString = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);

const toSafeNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const defaultMarketDescriptionsById = Object.fromEntries(defaultSiteConfig.marketItems.map((item) => [item.id, item.description]));

const sanitizeStock = (value: unknown): Record<Size, number> => {
  const source = isRecord(value) ? value : {};
  return {
    XS: Math.max(0, Math.floor(toSafeNumber(source.XS, 0))),
    S: Math.max(0, Math.floor(toSafeNumber(source.S, 0))),
    M: Math.max(0, Math.floor(toSafeNumber(source.M, 0))),
    L: Math.max(0, Math.floor(toSafeNumber(source.L, 0))),
    XL: Math.max(0, Math.floor(toSafeNumber(source.XL, 0)))
  };
};

export const isSiteConfig = (value: unknown): value is SiteConfig => {
  if (!isRecord(value)) return false;
  return (
    typeof value.telegramUsername === "string" &&
    Array.isArray(value.firstBlockItems) &&
    Array.isArray(value.lookbookImages) &&
    Array.isArray(value.marketItems)
  );
};

export const sanitizeSiteConfig = (value: unknown): SiteConfig => {
  if (!isSiteConfig(value)) return defaultSiteConfig;

  const firstBlockItems = value.firstBlockItems
    .filter(isRecord)
    .map((item, index) => ({
      id: toSafeString(item.id, `first-${Date.now()}-${index}`),
      name: toSafeString(item.name, "Товар"),
      price: Math.max(0, Math.floor(toSafeNumber(item.price, 0))),
      image: toSafeString(item.image, "/images/item-1.png")
    }));

  const lookbookImages = value.lookbookImages
    .filter((item): item is string => typeof item === "string")
    .filter(Boolean);

  const marketItems = value.marketItems
    .filter(isRecord)
    .map((item, index) => {
      const images = Array.isArray(item.images)
        ? item.images.filter((img): img is string => typeof img === "string" && img.length > 0)
        : [];
      const image = toSafeString(item.image, images[0] ?? "/images/item-1.png");

      return {
        id: toSafeString(item.id, `market-${Date.now()}-${index}`),
        name: toSafeString(item.name, "Товар маркета"),
        price: Math.max(0, Math.floor(toSafeNumber(item.price, 0))),
        description: toSafeString(item.description, defaultMarketDescriptionsById[toSafeString(item.id)] ?? "Короткое описание товара"),
        image,
        images: images.length > 0 ? images : [image],
        stock: sanitizeStock(item.stock)
      } satisfies MarketItem;
    });

  return {
    telegramUsername: toSafeString(value.telegramUsername, defaultSiteConfig.telegramUsername).replace(/^@/, ""),
    firstBlockItems: firstBlockItems.length > 0 ? firstBlockItems : defaultSiteConfig.firstBlockItems,
    lookbookImages: lookbookImages.length > 0 ? lookbookImages : defaultSiteConfig.lookbookImages,
    marketItems: marketItems.length > 0 ? marketItems : defaultSiteConfig.marketItems
  };
};
