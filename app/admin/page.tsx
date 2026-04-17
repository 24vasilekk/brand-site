"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSiteConfig } from "@/hooks/use-site-config";
import {
  createNewFirstBlockItem,
  createNewMarketItem,
  defaultSiteConfig,
  SIZES,
  type MarketItem,
  type Size
} from "@/lib/site-config";

type TabKey = "common" | "first" | "lookbook" | "market";

const tabs: { key: TabKey; label: string }[] = [
  { key: "common", label: "Общее" },
  { key: "first", label: "Первый блок" },
  { key: "lookbook", label: "Лукбук" },
  { key: "market", label: "Маркет" }
];

const parseNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Не удалось прочитать файл"));
    reader.readAsDataURL(file);
  });

type ImagePickerButtonProps = {
  onPick: (dataUrl: string) => void;
  label?: string;
};

function ImagePickerButton({ onPick, label = "Загрузить фото" }: ImagePickerButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  return (
    <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-ivory/35 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition hover:bg-ivory hover:text-charcoal">
      {isUploading ? "Загрузка..." : label}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          setUploadError("");
          setIsUploading(true);
          try {
            const dataUrl = await readFileAsDataUrl(file);
            onPick(dataUrl);
          } catch {
            setUploadError("Ошибка загрузки");
          } finally {
            setIsUploading(false);
            event.target.value = "";
          }
        }}
      />
      {uploadError ? <span className="ml-2 text-[10px]">{uploadError}</span> : null}
    </label>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const { config, setConfig, isReady, resetConfig, saveConfig, hasUnsavedChanges, lastSavedAt, saveError, isSaving } =
    useSiteConfig();
  const [activeTab, setActiveTab] = useState<TabKey>("common");
  const [jsonDraft, setJsonDraft] = useState("");
  const [jsonError, setJsonError] = useState("");

  const handleLogout = () => {
    fetch("/api/admin/logout", { method: "POST" }).finally(() => {
      router.replace("/admin/login");
    });
  };

  const saveStatus = useMemo(() => {
    if (!isReady) return "Загрузка конфигурации...";
    if (hasUnsavedChanges) return "Есть несохраненные изменения";
    if (lastSavedAt) return `Опубликовано: ${new Date(lastSavedAt).toLocaleTimeString("ru-RU")}`;
    return "Изменения опубликованы";
  }, [hasUnsavedChanges, isReady, lastSavedAt]);

  const updateMarketItem = (id: string, updater: (item: MarketItem) => MarketItem) => {
    setConfig((current) => ({
      ...current,
      marketItems: current.marketItems.map((item) => (item.id === id ? updater(item) : item))
    }));
  };

  const renderCommonTab = () => (
    <section className="space-y-4">
      <div className="rounded-2xl border border-ivory/25 bg-charcoal/40 p-4">
        <p className="text-xs uppercase tracking-[0.14em] text-ivory/70">
          Загрузка фото: можно выбрать изображение из медиатеки/файлов на телефоне. Фото сохраняются в браузере этого устройства.
        </p>
      </div>

      <div className="rounded-2xl border border-ivory/25 bg-charcoal/40 p-4">
        <p className="text-sm uppercase tracking-[0.16em] text-ivory/80">Telegram для заказов</p>
        <input
          type="text"
          value={config.telegramUsername}
          onChange={(event) => setConfig((current) => ({ ...current, telegramUsername: event.target.value.trim() }))}
          className="mt-2 w-full rounded-xl border border-ivory/25 bg-charcoal px-4 py-3 text-sm text-ivory outline-none transition focus:border-ivory"
          placeholder="username без @"
        />
      </div>

      <div className="rounded-2xl border border-ivory/25 bg-charcoal/40 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setJsonDraft(JSON.stringify(config, null, 2))}
            className="rounded-full border border-ivory/35 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] hover:bg-ivory hover:text-charcoal"
          >
            Экспорт JSON
          </button>
          <button
            type="button"
            onClick={() => {
              setConfig(defaultSiteConfig);
              setJsonDraft("");
              setJsonError("");
            }}
            className="rounded-full border border-ivory/35 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] hover:bg-ivory hover:text-charcoal"
          >
            Сбросить к шаблону
          </button>
        </div>

        <textarea
          value={jsonDraft}
          onChange={(event) => setJsonDraft(event.target.value)}
          className="mt-3 h-48 w-full rounded-xl border border-ivory/25 bg-charcoal px-4 py-3 text-xs text-ivory outline-none transition focus:border-ivory"
          placeholder="Вставьте JSON, если хотите импортировать конфиг"
        />

        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              try {
                const parsed = JSON.parse(jsonDraft);
                setConfig(parsed);
                setJsonError("");
              } catch {
                setJsonError("Некорректный JSON");
              }
            }}
            className="rounded-full border border-ivory/35 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] hover:bg-ivory hover:text-charcoal"
          >
            Импорт JSON
          </button>
          {jsonError ? <span className="text-xs text-ivory/80">{jsonError}</span> : null}
        </div>
      </div>
    </section>
  );

  const renderFirstBlockTab = () => (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm uppercase tracking-[0.16em] text-ivory/75">Товары первого блока</p>
        <button
          type="button"
          onClick={() => setConfig((current) => ({ ...current, firstBlockItems: [...current.firstBlockItems, createNewFirstBlockItem()] }))}
          className="rounded-full border border-ivory/35 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] hover:bg-ivory hover:text-charcoal"
        >
          Добавить товар
        </button>
      </div>

      {config.firstBlockItems.map((item) => (
        <div key={item.id} className="grid gap-3 rounded-2xl border border-ivory/25 bg-charcoal/40 p-4 md:grid-cols-[1fr_1fr_160px_auto_auto]">
          <input
            type="text"
            value={item.name}
            onChange={(event) =>
              setConfig((current) => ({
                ...current,
                firstBlockItems: current.firstBlockItems.map((it) => (it.id === item.id ? { ...it, name: event.target.value } : it))
              }))
            }
            className="rounded-xl border border-ivory/25 bg-charcoal px-3 py-2 text-sm text-ivory outline-none focus:border-ivory"
            placeholder="Название"
          />
          <input
            type="text"
            value={item.image}
            onChange={(event) =>
              setConfig((current) => ({
                ...current,
                firstBlockItems: current.firstBlockItems.map((it) => (it.id === item.id ? { ...it, image: event.target.value } : it))
              }))
            }
            className="rounded-xl border border-ivory/25 bg-charcoal px-3 py-2 text-sm text-ivory outline-none focus:border-ivory"
            placeholder="Путь к фото"
          />
          <ImagePickerButton
            label="Фото"
            onPick={(dataUrl) =>
              setConfig((current) => ({
                ...current,
                firstBlockItems: current.firstBlockItems.map((it) => (it.id === item.id ? { ...it, image: dataUrl } : it))
              }))
            }
          />
          <input
            type="number"
            value={item.price}
            onChange={(event) =>
              setConfig((current) => ({
                ...current,
                firstBlockItems: current.firstBlockItems.map((it) =>
                  it.id === item.id ? { ...it, price: parseNumber(event.target.value) } : it
                )
              }))
            }
            className="rounded-xl border border-ivory/25 bg-charcoal px-3 py-2 text-sm text-ivory outline-none focus:border-ivory"
            placeholder="Цена"
          />
          <button
            type="button"
            onClick={() =>
              setConfig((current) => ({
                ...current,
                firstBlockItems: current.firstBlockItems.filter((it) => it.id !== item.id)
              }))
            }
            className="rounded-xl border border-ivory/35 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] hover:bg-ivory hover:text-charcoal"
          >
            Удалить
          </button>
        </div>
      ))}
    </section>
  );

  const renderLookbookTab = () => (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm uppercase tracking-[0.16em] text-ivory/75">Фото лукбука</p>
        <button
          type="button"
          onClick={() => setConfig((current) => ({ ...current, lookbookImages: [...current.lookbookImages, "/lookbook/new.jpg"] }))}
          className="rounded-full border border-ivory/35 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] hover:bg-ivory hover:text-charcoal"
        >
          Добавить фото
        </button>
      </div>

      {config.lookbookImages.map((image, index) => (
        <div key={`${image}-${index}`} className="grid gap-3 rounded-2xl border border-ivory/25 bg-charcoal/40 p-4 md:grid-cols-[1fr_auto_auto]">
          <input
            type="text"
            value={image}
            onChange={(event) =>
              setConfig((current) => ({
                ...current,
                lookbookImages: current.lookbookImages.map((img, idx) => (idx === index ? event.target.value : img))
              }))
            }
            className="rounded-xl border border-ivory/25 bg-charcoal px-3 py-2 text-sm text-ivory outline-none focus:border-ivory"
            placeholder="Путь к фото"
          />
          <ImagePickerButton
            label="Фото"
            onPick={(dataUrl) =>
              setConfig((current) => ({
                ...current,
                lookbookImages: current.lookbookImages.map((img, idx) => (idx === index ? dataUrl : img))
              }))
            }
          />
          <button
            type="button"
            onClick={() =>
              setConfig((current) => ({
                ...current,
                lookbookImages: current.lookbookImages.filter((_, idx) => idx !== index)
              }))
            }
            className="rounded-xl border border-ivory/35 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] hover:bg-ivory hover:text-charcoal"
          >
            Удалить
          </button>
        </div>
      ))}
    </section>
  );

  const renderMarketTab = () => (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm uppercase tracking-[0.16em] text-ivory/75">Товары маркета</p>
        <button
          type="button"
          onClick={() => setConfig((current) => ({ ...current, marketItems: [...current.marketItems, createNewMarketItem()] }))}
          className="rounded-full border border-ivory/35 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] hover:bg-ivory hover:text-charcoal"
        >
          Добавить товар
        </button>
      </div>

      {config.marketItems.map((item) => (
        <div key={item.id} className="space-y-4 rounded-2xl border border-ivory/25 bg-charcoal/40 p-4">
          <div className="grid gap-3 md:grid-cols-5">
            <input
              type="text"
              value={item.name}
              onChange={(event) => updateMarketItem(item.id, (current) => ({ ...current, name: event.target.value }))}
              className="rounded-xl border border-ivory/25 bg-charcoal px-3 py-2 text-sm text-ivory outline-none focus:border-ivory"
              placeholder="Название"
            />
            <input
              type="number"
              value={item.price}
              onChange={(event) => updateMarketItem(item.id, (current) => ({ ...current, price: parseNumber(event.target.value) }))}
              className="rounded-xl border border-ivory/25 bg-charcoal px-3 py-2 text-sm text-ivory outline-none focus:border-ivory"
              placeholder="Цена"
            />
            <input
              type="text"
              value={item.image}
              onChange={(event) => updateMarketItem(item.id, (current) => ({ ...current, image: event.target.value }))}
              className="rounded-xl border border-ivory/25 bg-charcoal px-3 py-2 text-sm text-ivory outline-none focus:border-ivory"
              placeholder="Обложка"
            />
            <ImagePickerButton
              label="Фото"
              onPick={(dataUrl) => updateMarketItem(item.id, (current) => ({ ...current, image: dataUrl }))}
            />
            <button
              type="button"
              onClick={() =>
                setConfig((current) => ({
                  ...current,
                  marketItems: current.marketItems.filter((marketItem) => marketItem.id !== item.id)
                }))
              }
              className="rounded-xl border border-ivory/35 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] hover:bg-ivory hover:text-charcoal"
            >
              Удалить
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.14em] text-ivory/70">Описание</p>
            <textarea
              value={item.description ?? ""}
              onChange={(event) => updateMarketItem(item.id, (current) => ({ ...current, description: event.target.value }))}
              className="h-24 w-full rounded-xl border border-ivory/25 bg-charcoal px-3 py-2 text-sm text-ivory outline-none focus:border-ivory"
              placeholder="Короткое описание товара"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.14em] text-ivory/70">Галерея фото</p>
            {item.images.map((image, index) => (
              <div key={`${item.id}-img-${index}`} className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
                <input
                  type="text"
                  value={image}
                  onChange={(event) =>
                    updateMarketItem(item.id, (current) => ({
                      ...current,
                      images: current.images.map((img, idx) => (idx === index ? event.target.value : img))
                    }))
                  }
                  className="rounded-xl border border-ivory/25 bg-charcoal px-3 py-2 text-sm text-ivory outline-none focus:border-ivory"
                  placeholder="Путь к фото"
                />
                <ImagePickerButton
                  label="Фото"
                  onPick={(dataUrl) =>
                    updateMarketItem(item.id, (current) => ({
                      ...current,
                      images: current.images.map((img, idx) => (idx === index ? dataUrl : img))
                    }))
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    updateMarketItem(item.id, (current) => ({
                      ...current,
                      images: current.images.filter((_, idx) => idx !== index)
                    }))
                  }
                  className="rounded-xl border border-ivory/35 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] hover:bg-ivory hover:text-charcoal"
                >
                  Удалить
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => updateMarketItem(item.id, (current) => ({ ...current, images: [...current.images, current.image] }))}
              className="rounded-full border border-ivory/35 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] hover:bg-ivory hover:text-charcoal"
            >
              Добавить фото
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.14em] text-ivory/70">Остатки по размерам</p>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
              {SIZES.map((size) => (
                <label key={`${item.id}-${size}`} className="space-y-1 rounded-xl border border-ivory/20 bg-charcoal p-2">
                  <span className="text-xs uppercase tracking-[0.12em] text-ivory/80">{size}</span>
                  <input
                    type="number"
                    min={0}
                    value={item.stock[size]}
                    onChange={(event) =>
                      updateMarketItem(item.id, (current) => ({
                        ...current,
                        stock: {
                          ...current.stock,
                          [size]: Math.max(0, Math.floor(parseNumber(event.target.value)))
                        }
                      }))
                    }
                    className="w-full rounded-lg border border-ivory/25 bg-charcoal px-2 py-1 text-sm text-ivory outline-none focus:border-ivory"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      ))}
    </section>
  );

  const renderPanel = () => (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="w-full rounded-3xl border border-charcoal/20 bg-charcoal p-6 text-ivory md:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="brand-font text-3xl uppercase">Админка</h1>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-[0.12em] text-ivory/70">{saveStatus}</span>
          <button
            type="button"
            onClick={() => {
              resetConfig();
              setJsonDraft("");
              setJsonError("");
            }}
            className="rounded-full border border-ivory/35 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition hover:bg-ivory hover:text-charcoal"
          >
            Сбросить
          </button>
          <button
            type="button"
            onClick={saveConfig}
            disabled={!hasUnsavedChanges || isSaving}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
              hasUnsavedChanges
                ? "bg-ivory text-charcoal hover:bg-ivory/85"
                : "border border-ivory/35 text-ivory hover:bg-ivory hover:text-charcoal"
            } ${!hasUnsavedChanges || isSaving ? "opacity-70" : ""}`}
          >
            {isSaving ? "Сохраняем..." : "Применить и опубликовать"}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-ivory/35 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition hover:bg-ivory hover:text-charcoal"
          >
            Выйти
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
              activeTab === tab.key
                ? "border-ivory bg-ivory text-charcoal"
                : "border-ivory/35 text-ivory hover:border-ivory"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {saveError ? <p className="mb-4 text-sm text-ivory/80">{saveError}</p> : null}
        {activeTab === "common" ? renderCommonTab() : null}
        {activeTab === "first" ? renderFirstBlockTab() : null}
        {activeTab === "lookbook" ? renderLookbookTab() : null}
        {activeTab === "market" ? renderMarketTab() : null}
      </div>
    </motion.section>
  );

  return (
    <main className="min-h-screen bg-ivory text-charcoal">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-start justify-center px-4 py-8">
        {renderPanel()}
      </div>
    </main>
  );
}
