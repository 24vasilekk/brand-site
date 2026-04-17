"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useSiteConfig } from "@/hooks/use-site-config";
import { SIZES, type Size } from "@/lib/site-config";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  size?: Size;
};

const landingOffsetsX = [-28, 10, -18, 14, -12, 8, -24, 2];
const landingOffsetsY = [-8, -2, -6, 0, -4, -7, -1, -5];
const landingRotations = [-8, 7, -5, 11, -3, 6, -9, 4];
const rub = (value: number) => `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;

export default function HomePage() {
  const { config, isReady } = useSiteConfig();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [openedProduct, setOpenedProduct] = useState<string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, Size | undefined>>({});
  const [marketViewer, setMarketViewer] = useState<{ productId: string; index: number } | null>(null);
  const [lookbookViewerIndex, setLookbookViewerIndex] = useState<number | null>(null);
  const [careViewerOpen, setCareViewerOpen] = useState(false);
  const [deliveryPolicyOpen, setDeliveryPolicyOpen] = useState(false);
  const [orderCopied, setOrderCopied] = useState(false);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price, 0), [cart]);

  const addToCart = (item: CartItem) => setCart((current) => [...current, item]);
  const clearCart = () => setCart([]);

  const firstBlockItems = config.firstBlockItems;
  const marketItems = config.marketItems;
  const lookbookImages = config.lookbookImages;

  const marketViewerProduct = marketViewer
    ? marketItems.find((item) => item.id === marketViewer.productId) ?? null
    : null;

  const orderMessage =
    cart.length === 0
      ? "Здравствуйте! Хочу сделать заказ."
      : [
          "Здравствуйте! Хочу оформить заказ:",
          ...cart.map((item, index) => {
            const selectedSize = item.size ?? "не выбран";
            return `${index + 1}. ${item.name}\nРазмер: ${selectedSize}\nЦена: ${rub(item.price)}`;
          }),
          `Итого: ${rub(cartTotal)}`
        ].join("\n");
  const handleTelegramOrder = async () => {
    if (cart.length === 0) return;
    const cleanMessage = orderMessage.replace(/\u00A0/g, " ");

    try {
      await navigator.clipboard.writeText(cleanMessage);
      setOrderCopied(true);
    } catch {
      setOrderCopied(false);
    }

    window.open("https://t.me/Romanov_ink", "_blank", "noopener,noreferrer");
  };

  if (!isReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-charcoal text-ivory">
        <p className="text-sm uppercase tracking-[0.18em]">Загрузка витрины...</p>
      </main>
    );
  }

  return (
    <>
      <header className="z-50 border-b border-ivory/15 bg-charcoal">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-4 md:flex-row md:justify-between md:gap-4 md:px-8">
          <div className="relative h-[2.8rem] w-[min(88vw,360px)] overflow-hidden md:h-[4.5rem] md:w-[480px]">
            <Image
              src="/images/logo-new.png"
              alt="Логотип бренда"
              fill
              priority
              className="object-cover object-center"
            />
          </div>
          <nav className="grid w-full grid-cols-5 gap-1 md:flex md:w-auto md:gap-3">
            <a href="#market" className="inline-flex h-6 w-full items-center justify-center rounded-full border border-ivory/40 px-1 text-[8px] font-semibold uppercase tracking-[0.06em] text-ivory transition hover:bg-ivory hover:text-charcoal md:h-10 md:w-auto md:px-4 md:text-sm md:tracking-[0.14em]">
              Все
            </a>
            <a href="#market" className="inline-flex h-6 w-full items-center justify-center rounded-full border border-ivory/40 px-1 text-[8px] font-semibold uppercase tracking-[0.06em] text-ivory transition hover:bg-ivory hover:text-charcoal md:h-10 md:w-auto md:px-4 md:text-sm md:tracking-[0.14em]">
              Худи
            </a>
            <a href="#market" className="inline-flex h-6 w-full items-center justify-center rounded-full border border-ivory/40 px-1 text-[8px] font-semibold uppercase tracking-[0.06em] text-ivory transition hover:bg-ivory hover:text-charcoal md:h-10 md:w-auto md:px-4 md:text-sm md:tracking-[0.14em]">
              Футболки
            </a>
            <a href="#market" className="inline-flex h-6 w-full items-center justify-center rounded-full border border-ivory/40 px-1 text-[8px] font-semibold uppercase tracking-[0.06em] text-ivory transition hover:bg-ivory hover:text-charcoal md:h-10 md:w-auto md:px-4 md:text-sm md:tracking-[0.14em]">
              Кастом
            </a>
            <a href="#market" className="inline-flex h-6 w-full items-center justify-center rounded-full border border-ivory/40 px-1 text-[8px] font-semibold uppercase tracking-[0.06em] text-ivory transition hover:bg-ivory hover:text-charcoal md:h-10 md:w-auto md:px-4 md:text-sm md:tracking-[0.14em]">
              Аксессуары
            </a>
          </nav>
        </div>
      </header>

      <main className="bg-charcoal text-ivory">
      <div className="mx-auto mt-8 max-w-6xl px-4 md:px-8">
        <section id="catalog" className="overflow-hidden rounded-3xl bg-charcoal shadow-soft">
          <div className="overflow-hidden border-b border-ivory/20 py-3 text-ivory">
            <div className="marquee-track animate-marquee text-xs font-semibold uppercase tracking-[0.35em] md:text-sm">
              {Array.from({ length: 24 }).map((_, index) => (
                <span key={`marquee-${index}`}>Новая коллекция</span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 p-4 md:p-10 lg:grid-cols-4">
            {firstBlockItems.map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.05 }}
                className="flex h-full flex-col items-center"
              >
                <div className="relative h-44 w-full md:h-56">
                  <Image src={item.image} alt={item.name} fill className="object-contain" />
                </div>
                <p className="mt-3 flex min-h-[2.75rem] items-center text-center text-sm font-semibold uppercase tracking-[0.08em] text-ivory">{item.name}</p>
                <p className="mt-1 text-sm text-ivory/80">{rub(item.price)}</p>
                <button
                  type="button"
                  onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, image: item.image })}
                  className="mt-4 inline-flex h-10 w-full max-w-[220px] items-center justify-center rounded-full bg-ivory px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-charcoal transition hover:bg-ivory/85 md:px-5 md:text-xs md:tracking-[0.15em]"
                >
                  Добавить в корзину
                </button>
              </motion.article>
            ))}
          </div>
        </section>
      </div>

      <section id="cart" className="mx-auto mt-8 max-w-6xl px-4 md:px-8">
        <article className="rounded-3xl border border-charcoal/20 bg-[var(--cart-ivory)] p-5 md:p-7">
          <div className="grid items-stretch gap-6 md:grid-cols-2">
            <div>
              <p className="brand-font text-2xl uppercase text-charcoal">Корзина</p>
              <p className="mt-2 text-sm text-charcoal/70">Товары из каталога попадают сюда после нажатия «Добавить в корзину».</p>
              <div className="relative mt-3 h-[26rem] overflow-hidden rounded-3xl border border-charcoal/30 bg-[var(--cart-ivory)] md:h-[36rem]">
                <Image
                  src="/images/basket.png"
                  alt="Корзина"
                  fill
                  className="object-contain object-[center_40%] p-1 [clip-path:inset(0_0_10%_0)] md:p-3"
                />
                <AnimatePresence>
                  {cart.map((item, index) => (
                    <motion.div
                      key={`${item.id}-${index}`}
                      initial={{
                        opacity: 0,
                        y: -280,
                        x: landingOffsetsX[index % landingOffsetsX.length] + (index % 2 === 0 ? -20 : 20),
                        rotate: landingRotations[index % landingRotations.length] * 0.3,
                        scale: 0.8
                      }}
                      animate={{
                        opacity: 1,
                        y: landingOffsetsY[index % landingOffsetsY.length],
                        x: landingOffsetsX[index % landingOffsetsX.length],
                        rotate: landingRotations[index % landingRotations.length],
                        scale: 1
                      }}
                      exit={{ opacity: 0, scale: 0.75 }}
                      transition={{ type: "spring", stiffness: 210, damping: 18 }}
                      className="absolute left-[46%] top-[44%] -translate-x-1/2 -translate-y-1/2"
                      style={{ zIndex: index + 1 }}
                    >
                      <Image src={item.image} alt={item.name} width={100} height={126} className="h-auto w-[64px] object-contain md:w-[100px]" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex flex-col border-charcoal/15 md:border-l md:pl-6">
              <div className="flex items-center justify-between gap-3">
                <p className="brand-font text-2xl uppercase text-charcoal">Ваш заказ</p>
                <span className="rounded-full border border-charcoal/25 px-3 py-1 text-xs uppercase tracking-[0.18em] text-charcoal">{cart.length} шт</span>
              </div>
              <div className="mt-4 max-h-56 flex-1 space-y-3 overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <p className="text-sm text-charcoal/70">Корзина пустая. Добавьте товары из блока выше.</p>
                ) : (
                  cart.map((item, index) => (
                    <div key={`${item.id}-line-${index}`} className="flex items-center justify-between border-b border-charcoal/15 pb-2 text-sm text-charcoal">
                      <span>
                        {item.name}
                        {item.size ? ` (${item.size})` : ""}
                      </span>
                      <span>{rub(item.price)}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-5 flex items-center justify-between pt-4 text-charcoal">
                <span className="font-semibold uppercase tracking-[0.12em]">Итого</span>
                <span className="font-semibold">{rub(cartTotal)}</span>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={cart.length === 0}
                  onClick={handleTelegramOrder}
                  className={`inline-flex h-11 items-center justify-center rounded-full px-5 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                    cart.length > 0 ? "bg-charcoal text-ivory hover:bg-charcoal/90" : "cursor-not-allowed bg-charcoal/20 text-charcoal/60"
                  }`}
                >
                  Заказать в Telegram
                </button>
                <a
                  href="https://vk.ru/n_ch_x"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-charcoal/30 px-5 text-xs font-semibold uppercase tracking-[0.12em] text-charcoal transition hover:bg-charcoal hover:text-ivory"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                    <path d="M12.76 17c-5.12 0-8.04-3.5-8.16-9.33h2.57c.08 4.28 1.97 6.1 3.47 6.48V7.67h2.41v3.7c1.48-.16 3.04-1.85 3.56-3.7h2.4c-.4 2.3-2.1 3.99-3.31 4.69 1.21.56 3.14 2.02 3.88 4.64h-2.64c-.57-1.77-2-3.14-3.89-3.33V17h-.29Z" />
                  </svg>
                  ВКонтакте
                </a>
                <button
                  type="button"
                  onClick={clearCart}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-charcoal/30 px-5 text-xs font-semibold uppercase tracking-[0.16em] text-charcoal transition hover:bg-charcoal hover:text-ivory"
                >
                  Очистить корзину
                </button>
              </div>
              {orderCopied ? (
                <p className="mt-3 text-xs text-charcoal/70">
                  Текст заказа скопирован. Открылся чат @Romanov_ink, просто вставьте сообщение.
                </p>
              ) : null}
            </div>
          </div>
        </article>
      </section>

      <section id="lookbook" className="mx-auto mt-10 max-w-6xl px-4 md:px-8">
        <div className="rounded-3xl border border-charcoal/20 bg-charcoal p-6 md:p-8">
          <h2 className="brand-font text-center text-3xl uppercase text-ivory">Лукбук</h2>
          <div className="mt-6 grid grid-cols-3 gap-3 md:gap-4">
            {lookbookImages.map((image, index) => (
              <motion.button
                key={`look-${index}`}
                type="button"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6, scale: 1.02 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.04 }}
                className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-ivory/35 bg-ivory"
                onClick={() => setLookbookViewerIndex(index)}
              >
                <Image src={image} alt={`Лукбук фото ${index + 1}`} fill className="object-cover" />
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto mt-12 -mb-2 max-w-6xl px-4 md:mt-14 md:px-8">
        <svg viewBox="0 0 1440 140" className="h-20 w-full md:h-24" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 56C45 28 99 28 144 56C189 84 243 84 288 56C333 28 387 28 432 56C477 84 531 84 576 56C621 28 675 28 720 56C765 84 819 84 864 56C909 28 963 28 1008 56C1053 84 1107 84 1152 56C1197 28 1251 28 1296 56C1341 84 1395 84 1440 56V140H0V56Z"
            fill="#8A72B1"
          />
          <path
            d="M0 58C45 31 99 31 144 58C189 85 243 85 288 58C333 31 387 31 432 58C477 85 531 85 576 58C621 31 675 31 720 58C765 85 819 85 864 58C909 31 963 31 1008 58C1053 85 1107 85 1152 58C1197 31 1251 31 1296 58C1341 85 1395 85 1440 58"
            stroke="#F3F0E7"
            strokeOpacity="0.18"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      </div>

      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <section id="market" className="relative z-20 overflow-hidden rounded-b-3xl bg-charcoal pb-16 pt-8 text-ivory">
          <div className="relative z-20 px-4 md:px-8">
            <h2 className="relative z-20 brand-font text-center text-3xl uppercase">Маркет</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-ivory/80 md:text-base">
              Карточки с открытием деталей и выбором размера.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
              {marketItems.map((item) => {
                const isOpen = openedProduct === item.id;
                const selectedSize = selectedSizes[item.id];
                const selectedStock = selectedSize ? item.stock[selectedSize] ?? 0 : 0;

                return (
                  <motion.article key={item.id} whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="flex h-full flex-col rounded-2xl border border-ivory/25 bg-charcoal p-4">
                    <div className="relative h-56">
                      <Image src={item.image} alt={item.name} fill className="object-contain" />
                    </div>
                    <p className="mt-4 flex min-h-[2.75rem] items-center text-xs font-semibold uppercase tracking-[0.08em] md:text-sm">{item.name}</p>
                    <p className="mt-1 text-sm text-ivory/80">{rub(item.price)}</p>
                    <p className="mt-2 min-h-[2.5rem] text-[11px] leading-relaxed text-ivory/75 md:text-xs">{item.description}</p>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setOpenedProduct(isOpen ? null : item.id)}
                        className="inline-flex h-10 items-center justify-center rounded-full border border-ivory/35 px-2 text-[8px] font-semibold uppercase tracking-[0.07em] transition hover:bg-ivory hover:text-charcoal md:px-4 md:text-[10px] md:tracking-[0.13em]"
                      >
                        {isOpen ? "Скрыть" : "Открыть"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMarketViewer({ productId: item.id, index: 0 })}
                        className="inline-flex h-10 items-center justify-center rounded-full border border-ivory/35 px-2 text-[8px] font-semibold uppercase tracking-[0.07em] transition hover:bg-ivory hover:text-charcoal md:px-4 md:text-[10px] md:tracking-[0.13em]"
                      >
                        Смотреть фото
                      </button>
                    </div>

                    <div className="mt-4 border-t border-ivory/20 pt-4">
                      <AnimatePresence initial={false}>
                        {isOpen ? (
                          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="min-h-[144px]">
                            <p className="mb-3 text-[11px] leading-relaxed text-ivory/75 md:text-xs">{item.description}</p>
                            <p className="text-xs uppercase tracking-[0.14em] text-ivory/75">Размер и остаток</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {SIZES.map((size) => {
                                const stock = item.stock[size] ?? 0;
                                return (
                                  <button
                                    key={`${item.id}-${size}`}
                                    type="button"
                                    onClick={() => setSelectedSizes((current) => ({ ...current, [item.id]: size }))}
                                    className={`rounded-full border px-3 py-1 text-[10px] transition ${
                                      selectedSize === size
                                        ? "border-ivory bg-ivory text-charcoal"
                                        : "border-ivory/35 text-ivory hover:border-ivory"
                                    } ${stock <= 0 ? "opacity-40" : ""}`}
                                  >
                                    {size} ({stock})
                                  </button>
                                );
                              })}
                            </div>

                            <button
                              type="button"
                              disabled={!selectedSize || selectedStock <= 0}
                              onClick={() =>
                                addToCart({
                                  id: item.id,
                                  name: item.name,
                                  price: item.price,
                                  image: item.image,
                                  size: selectedSize
                                })
                              }
                              className={`mt-4 inline-flex h-10 w-full items-center justify-center rounded-full px-4 text-[10px] font-semibold uppercase tracking-[0.13em] transition ${
                                selectedSize && selectedStock > 0
                                  ? "bg-ivory text-charcoal hover:bg-ivory/85"
                                  : "cursor-not-allowed bg-ivory/30 text-ivory/70"
                              }`}
                            >
                              {selectedSize ? `Добавить (${selectedSize})` : "Выберите размер"}
                            </button>
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex min-h-[144px] items-center justify-center rounded-xl border border-dashed border-ivory/20 text-center text-[11px] uppercase tracking-[0.12em] text-ivory/45"
                          >
                            Нажмите «Открыть», чтобы выбрать размер
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {marketViewer && marketViewerProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/85 p-4"
            onClick={() => setMarketViewer(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-3xl rounded-3xl border border-ivory/30 bg-charcoal p-4 md:p-6"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between gap-3 text-ivory">
                <p className="brand-font text-base uppercase md:text-xl">{marketViewerProduct.name}</p>
                <button
                  type="button"
                  onClick={() => setMarketViewer(null)}
                  className="rounded-full border border-ivory/35 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] hover:bg-ivory hover:text-charcoal md:text-xs md:tracking-[0.12em]"
                >
                  Закрыть
                </button>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-ivory/25 bg-charcoal">
                <div className="relative h-[58vh] max-h-[520px] min-h-[300px]">
                  <Image
                    src={marketViewerProduct.images[marketViewer.index] ?? marketViewerProduct.image}
                    alt={`${marketViewerProduct.name} фото ${marketViewer.index + 1}`}
                    fill
                    className="object-contain p-4"
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setMarketViewer((current) =>
                      current
                        ? {
                            ...current,
                            index: (current.index - 1 + marketViewerProduct.images.length) % marketViewerProduct.images.length
                          }
                        : current
                    )
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-ivory/35 bg-charcoal/70 px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-ivory hover:bg-ivory hover:text-charcoal md:left-3 md:px-3 md:text-xs md:tracking-[0.12em]"
                >
                  Назад
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setMarketViewer((current) =>
                      current
                        ? {
                            ...current,
                            index: (current.index + 1) % marketViewerProduct.images.length
                          }
                        : current
                    )
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-ivory/35 bg-charcoal/70 px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-ivory hover:bg-ivory hover:text-charcoal md:right-3 md:px-3 md:text-xs md:tracking-[0.12em]"
                >
                  Далее
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lookbookViewerIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-charcoal/90 p-3 md:p-4"
            onClick={() => setLookbookViewerIndex(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative h-[86vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-ivory/35 bg-charcoal"
              onClick={(event) => event.stopPropagation()}
            >
              <Image src={lookbookImages[lookbookViewerIndex]} alt={`Лукбук фото ${lookbookViewerIndex + 1}`} fill className="object-contain p-2 md:p-4" />
              <button
                type="button"
                onClick={() => setLookbookViewerIndex((current) => (current === null ? current : (current - 1 + lookbookImages.length) % lookbookImages.length))}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-ivory/40 bg-charcoal/70 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ivory hover:bg-ivory hover:text-charcoal md:left-3"
              >
                Назад
              </button>
              <button
                type="button"
                onClick={() => setLookbookViewerIndex((current) => (current === null ? current : (current + 1) % lookbookImages.length))}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-ivory/40 bg-charcoal/70 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ivory hover:bg-ivory hover:text-charcoal md:right-3"
              >
                Далее
              </button>
              <button
                type="button"
                onClick={() => setLookbookViewerIndex(null)}
                className="absolute right-2 top-2 rounded-full border border-ivory/40 bg-charcoal/70 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ivory hover:bg-ivory hover:text-charcoal md:right-3 md:top-3"
              >
                Закрыть
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {careViewerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-charcoal/90 p-3 md:p-4"
            onClick={() => setCareViewerOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative h-[86vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-ivory/35 bg-charcoal"
              onClick={(event) => event.stopPropagation()}
            >
              <Image src="/images/care.jpg" alt="Уход за изделиями" fill className="object-contain p-2 md:p-4" />
              <button
                type="button"
                onClick={() => setCareViewerOpen(false)}
                className="absolute right-2 top-2 rounded-full border border-ivory/40 bg-charcoal/70 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ivory hover:bg-ivory hover:text-charcoal md:right-3 md:top-3"
              >
                Закрыть
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deliveryPolicyOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-charcoal/90 p-3 md:p-4"
            onClick={() => setDeliveryPolicyOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2 }}
                className="w-full max-w-2xl rounded-3xl border border-ivory/35 bg-charcoal p-5 text-ivory md:p-7"
                onClick={(event) => event.stopPropagation()}
              >
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="brand-font text-xl uppercase">Политика доставки и отмены</p>
                <button
                  type="button"
                  onClick={() => setDeliveryPolicyOpen(false)}
                  className="rounded-full border border-ivory/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] transition hover:bg-ivory hover:text-charcoal"
                >
                  Закрыть
                </button>
              </div>
              <div className="space-y-3 text-sm leading-relaxed">
                <p>Доставка по России осуществляется после подтверждения заказа в Telegram.</p>
                <p>Срок отправки обычно составляет от 1 до 3 рабочих дней после подтверждения.</p>
                <p>Стоимость и способ доставки уточняются индивидуально перед оплатой.</p>
                <p>Отмена заказа возможна до момента отправки товара.</p>
                <p>После отправки отмена заказа невозможна, но вы можете оформить возврат по согласованию.</p>
                <p>Если у вас есть вопросы по срокам или статусу заказа, напишите нам в Telegram.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="bg-charcoal py-10">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-[1fr_2fr] md:px-8">
          <div>
            <div className="relative h-[42px] w-[264px] overflow-hidden md:h-[84px] md:w-[528px]">
              <Image src="/images/logo-new.png" alt="Логотип бренда" fill className="object-cover object-center" />
            </div>
          </div>

          <div className="grid gap-4 text-sm text-ivory/90">
            <button
              type="button"
              onClick={() => setDeliveryPolicyOpen(true)}
              className="text-left transition hover:text-ivory"
            >
              Политика доставки и отмены
            </button>
            <button
              type="button"
              onClick={() => setCareViewerOpen(true)}
              className="text-left transition hover:text-ivory"
            >
              Уход за изделиями
            </button>
            <a href={`https://t.me/${config.telegramUsername}`} target="_blank" className="transition hover:text-ivory">Телеграм</a>
            <a href="https://vk.com" target="_blank" className="transition hover:text-ivory">ВКонтакте</a>
          </div>
        </div>
      </footer>
      </main>
    </>
  );
}
