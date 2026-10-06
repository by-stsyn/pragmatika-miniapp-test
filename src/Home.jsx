import React, { useState, useEffect, useCallback, useRef } from "react";
import { platform } from "./platform";
import { useNavigate } from "react-router-dom";
import BottomNav from "/src/components/BottomNav";
import {
  Car,
  Wrench,
  CircleDot,
  Gift,
  Newspaper,
  User,
  ChevronRight,
  ChevronLeft,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CreditCard,
  CheckCircle2,
  X,
} from "lucide-react";
import { formatRussianPhone } from "/src/utils/phone";

const BASE_URL = "/api/render";

// Официальные бренды Прагматики (соответствуют сайту)
const DEALER_BRANDS = [
  {
    name: "LADA",
    logo: "/logos/lada.png",
    countText: "902 авто в наличии",
    badge: "902",
    filterVendor: "LADA",
  },
  {
    name: "CHANGAN",
    logo: "/logos/changan.png",
    countText: "64 авто в наличии",
    badge: "64",
    filterVendor: "Changan",
  },
  {
    name: "GEELY",
    logo: "/logos/geely.png",
    countText: "54 авто в наличии",
    badge: "54",
    filterVendor: "Geely",
  },
  {
    name: "BELGEE",
    logo: "/logos/belgee.png",
    countText: "50 авто в наличии",
    badge: "50",
    filterVendor: "Belgee",
  },
  {
    name: "EVOLUTE",
    logo: "/logos/evolute.png",
    countText: "Автомобили в наличии",
    badge: "NEW",
    filterVendor: "Evolute",
  },
];

// Начальные промо-слайды (последние актуальные акции из фида)
const DEFAULT_PROMO_SLIDES = [
  {
    title: "Масляный сервис Fix Price",
    thumbnail:
      "https://www.pragmaticar.ru/uploads/offer/9a71d62a80fcd4d3084a7da779fab0b4.png",
    link: "https://www.pragmaticar.ru/offers/service/maslyanyi_servis_fix_price_originalnoe_maslo_pochti_darom_vse_vklucheno_bez_skrytyh_surprizov__uspeite/",
  },
  {
    title: "ТО на Ваш KIA на специальной цене",
    thumbnail:
      "https://www.pragmaticar.ru/uploads/offer/dfb6995f230bf67f639cc4a5d4d37699.jpg",
    link: "https://www.pragmaticar.ru/offers/service/to_na_vash_kia_na_specialnoi_cene/",
  },
  {
    title: "С заботой в зиму! Комплексная подготовка",
    thumbnail:
      "https://www.pragmaticar.ru/uploads/offer/f094f061cd1967dfff9d29da1a93337e.png",
    link: "https://www.pragmaticar.ru/offers/service/s_zabotoi_v_zimu/",
  },
];

export default function Home() {
  const navigate = useNavigate();

  // Состояние пользователя
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);

  // Бонусы: строго из профиля пользователя (никаких случайных 1500)
  const [bonus, setBonus] = useState(null);
  const [bonusLoading, setBonusLoading] = useState(true);

  // Счетчики авто
  const [newCount, setNewCount] = useState(null);
  const [usedCount, setUsedCount] = useState(null);

  // Переключатель каталога
  const [activeCatalogTab, setActiveCatalogTab] = useState("new");

  // Слайдер акций (последние 3 акции из фида, ТОЛЬКО картинки)
  const [promoSlides, setPromoSlides] = useState(DEFAULT_PROMO_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);

  /* ====================================================
     Инициализация пользователя и бонусов (из профиля)
  ==================================================== */
  useEffect(() => {
    try {
      const userData = platform.getUser();
      if (userData) {
        setUser({
          first_name: userData.firstName || userData.first_name || "Клиент",
          last_name: userData.lastName || userData.last_name || "",
          photo: userData.photo || userData.photo_url || "",
          username: userData.username || "",
        });
      }

      // 1. Читаем кэш из профиля (если пользователь уже открывал профиль)
      try {
        const cached =
          localStorage.getItem("userBonus") ||
          sessionStorage.getItem("userBonus");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed.balance !== "undefined") {
            setBonus(parsed);
          }
        }
      } catch (e) {}

      // 2. Получаем ID пользователя из Telegram / MAX
      const uid = platform.getId?.();
      setUserId(uid);

      if (!uid) {
        setBonusLoading(false);
        return;
      }

      // 3. Загружаем актуальные данные карты лояльности с бэкенда
      const idParam = platform.isMax?.() ? "maxId" : "telegramId";
      fetch(`${BASE_URL}?path=communication/contact/bonus&${idParam}=${uid}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.card) {
            setBonus(data.card);
            try {
              localStorage.setItem("userBonus", JSON.stringify(data.card));
              sessionStorage.setItem("userBonus", JSON.stringify(data.card));
            } catch (e) {}
          } else {
            // Если карты нет в профиле пользователя — отображаем null (0 баллов)
            setBonus(null);
            try {
              localStorage.removeItem("userBonus");
              sessionStorage.removeItem("userBonus");
            } catch (e) {}
          }
        })
        .catch(() => {
          // При сетевой ошибке не ставим случайных чисел
        })
        .finally(() => {
          setBonusLoading(false);
        });
    } catch {
      setBonusLoading(false);
    }
  }, []);

  /* ====================================================
     Загрузка счетчиков автомобилей
  ==================================================== */
  useEffect(() => {
    const loadCounts = async () => {
      const now = Date.now();

      const fetchCount = async (url, storageKey, setter) => {
        try {
          const cached = localStorage.getItem(storageKey);
          const lastUpdate = Number(
            localStorage.getItem(`${storageKey}UpdatedAt`)
          );

          if (
            cached !== null &&
            Number.isFinite(Number(cached)) &&
            Number.isFinite(lastUpdate) &&
            now - lastUpdate < 5 * 60 * 1000
          ) {
            setter(Number(cached));
            return;
          }

          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            const val = Number(data.count);
            if (Number.isFinite(val)) {
              setter(val);
              localStorage.setItem(storageKey, String(val));
              localStorage.setItem(`${storageKey}UpdatedAt`, String(now));
            }
          }
        } catch {
          const cached = Number(localStorage.getItem(storageKey));
          if (Number.isFinite(cached)) setter(cached);
        }
      };

      await Promise.all([
        fetchCount("/api/fetch-feed-all?count=1", "newCount", setNewCount),
        fetchCount("/api/fetch-feed-used?count=1", "usedCount", setUsedCount),
      ]);
    };

    loadCounts();
  }, []);

  /* ====================================================
     Загрузка последних 3 акций для слайдера (только картинки)
  ==================================================== */
  useEffect(() => {
    fetch("/api/fetch-offers")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const sorted = [...data].sort(
            (a, b) => new Date(b.pubDate) - new Date(a.pubDate)
          );
          const withThumbs = sorted.filter(
            (item) =>
              item.thumbnail &&
              typeof item.thumbnail === "string" &&
              item.thumbnail.trim().length > 0
          );
          if (withThumbs.length > 0) {
            setPromoSlides(withThumbs.slice(0, 3));
          }
        }
      })
      .catch((err) => {
        console.error("Ошибка загрузки акций для слайдера:", err);
      });
  }, []);

  /* ====================================================
     Автопрокрутка слайдера акций каждые 4.5 сек
  ==================================================== */
  useEffect(() => {
    if (promoSlides.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promoSlides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [promoSlides.length, isPaused]);

  const navigateTo = useCallback(
    (path, state = {}) =>
      (e) => {
        e?.preventDefault();
        navigate(path, { state });
      },
    [navigate]
  );

  const [showCallback, setShowCallback] = useState(false);
  const [callbackName, setCallbackName] = useState("");
  const [callbackPhone, setCallbackPhone] = useState("");
  const [callbackTopic, setCallbackTopic] = useState("Запись на сервис");
  const [callbackStatus, setCallbackStatus] = useState("");
  const [callbackSubmitting, setCallbackSubmitting] = useState(false);

  const handleCallbackSubmit = async (e) => {
    e.preventDefault();
    if (!callbackPhone || callbackPhone.replace(/\D/g, "").length < 11) {
      setCallbackStatus("Пожалуйста, введите полный номер телефона");
      return;
    }

    setCallbackSubmitting(true);
    setCallbackStatus("Отправка заявки...");

    try {
      const res = await fetch("/api/calltouch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: callbackPhone,
          name: callbackName || "Клиент",
          comment: callbackTopic,
          callUrl: window.location.href,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setCallbackStatus("Ваша заявка принята! Мы перезвоним вам в течение 1 минуты.");
        setCallbackPhone("");
        setCallbackName("");
        setTimeout(() => {
          setShowCallback(false);
          setCallbackStatus("");
        }, 2200);
      } else {
        setCallbackStatus("Ошибка отправки: " + (data?.details?.message || "попробуйте позже"));
      }
    } catch (err) {
      setCallbackStatus("Ошибка соединения. Пожалуйста, повторите.");
    } finally {
      setCallbackSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#1a202c] pb-[120px] font-sans antialiased selection:bg-[#8cc63f] selection:text-white">
      {/* ====================================================
          1. КОМПАКТНЫЙ ХЕДЕР В ОДНУ СТРОКУ (ЛОГОТИП, ЗВОНОК, ПРОФИЛЬ)
      ==================================================== */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200/80 px-4 sm:px-6 py-2.5 sm:py-3 transition-all shadow-2xs">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          {/* Официальный логотип Pragmatika */}
          <div
            onClick={() => navigate("/")}
            className="cursor-pointer flex items-center shrink-0"
          >
            <img
              src="/logo-pragmatika-1.svg"
              alt="Прагматика"
              className="h-7 sm:h-8 w-auto object-contain max-w-[155px] sm:max-w-[190px]"
              onError={(e) => {
                e.currentTarget.src = "/logo-pragmatika.svg";
              }}
            />
          </div>

          {/* Правая часть в одну строчку: Звонок и Профиль */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 shrink-0">
            <button
              onClick={() => {
                setCallbackTopic("Заказ звонка из шапки");
                setShowCallback(true);
              }}
              className="flex items-center space-x-1.5 font-semibold text-gray-800 hover:text-[#76aa34] bg-[#f0f7e8] hover:bg-[#e4f2d3] px-3 py-1.5 rounded-full border border-[#8cc63f]/30 transition-all text-xs whitespace-nowrap cursor-pointer shadow-2xs"
            >
              <Phone size={13} className="text-[#76aa34] shrink-0" />
              <span>Звонок</span>
            </button>

            <button
              onClick={() => navigate("/ProfilePage")}
              aria-label="Личный кабинет"
              title="Личный кабинет"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-[#f0f7e8] border border-gray-200/90 hover:border-[#8cc63f] flex items-center justify-center transition-all shadow-2xs shrink-0 relative group cursor-pointer"
            >
              {user?.photo ? (
                <img
                  src={user.photo}
                  alt={user.first_name || "Профиль"}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#f0f7e8] group-hover:bg-[#8cc63f] text-[#6fa02f] group-hover:text-white flex items-center justify-center transition-colors">
                  <User size={16} strokeWidth={2.2} />
                </div>
              )}
              {/* Статусная точка бренда */}
              <span className="w-2.5 h-2.5 bg-[#8cc63f] rounded-full border-2 border-white absolute top-0 right-0" />
            </button>
          </div>
        </div>
      </header>

      {/* Основной контент с просторными отступами и воздушной сеткой */}
      <main className="max-w-xl mx-auto px-4 sm:px-6 pt-5 sm:pt-7 pb-28 sm:pb-32 space-y-7 sm:space-y-9">
        {/* ====================================================
            2. ПЕРСОНАЛИЗАЦИЯ: КАРТА УЧАСТНИКА ПРОГРАММЫ ЛОЯЛЬНОСТИ
        ==================================================== */}
        <section
          onClick={() => navigate("/ProfilePage")}
          className="relative bg-white hover:border-[#8cc63f] rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200 group cursor-pointer overflow-hidden"
        >
          {/* Фоновый градиентный акцент */}
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-bl from-[#8cc63f]/10 to-transparent rounded-full pointer-events-none" />

          {/* Верхняя строка: Аватар, имя, клубный статус и переход в профиль */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 gap-3 relative z-10">
            <div className="flex items-center space-x-3 min-w-0">
              {/* Аватар пользователя */}
              <div className="relative shrink-0">
                {user?.photo ? (
                  <img
                    src={user.photo}
                    alt={user.first_name || "Участник"}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-[#8cc63f]/40 shadow-2xs"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#f0f7e8] border border-[#8cc63f]/30 text-[#6fa02f] flex items-center justify-center font-bold text-base shadow-2xs">
                    {user?.first_name ? user.first_name[0].toUpperCase() : <User size={20} />}
                  </div>
                )}
                <span className="w-3 h-3 bg-[#8cc63f] rounded-full border-2 border-white absolute bottom-0 right-0" />
              </div>

              {/* Имя и статус клубной программы */}
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-[#6fa02f] bg-[#f0f7e8] px-2 py-0.5 rounded-md">
                    Участник клуба
                  </span>
                  {bonus?.number && (
                    <span className="text-[10px] sm:text-[11px] font-mono text-gray-400">
                      № {bonus.number}
                    </span>
                  )}
                </div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mt-0.5 truncate leading-tight group-hover:text-[#76aa34] transition-colors">
                  {user?.first_name
                    ? `${user.first_name}${user.last_name ? " " + user.last_name : ""}`
                    : "Клиент Прагматика"}
                </h2>
              </div>
            </div>

            {/* Иконка перехода в профиль */}
            <div className="w-8 h-8 rounded-xl bg-gray-50 group-hover:bg-[#f0f7e8] text-gray-400 group-hover:text-[#76aa34] flex items-center justify-center transition-all shrink-0">
              <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Нижняя часть: Баланс бонусов и кнопки перехода */}
          <div className="pt-4 flex items-end justify-between gap-3 relative z-10">
            <div className="min-w-0">
              <span className="text-xs text-gray-500 block mb-0.5">
                Бонусный баланс
              </span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#76aa34] tracking-tight leading-none">
                  {bonusLoading
                    ? "..."
                    : bonus?.balance !== undefined
                    ? Number(bonus.balance).toLocaleString("ru-RU")
                    : "0"}
                </span>
                <span className="text-xs sm:text-sm font-bold text-gray-600">
                  баллов
                </span>
              </div>
              <span className="text-[11px] text-gray-400 mt-1 block leading-tight">
                1 балл = 1 ₽ скидки при оплате сервиса
              </span>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/BonusPage");
                }}
                className="text-xs font-bold text-[#76aa34] hover:bg-[#f0f7e8] border border-[#8cc63f]/30 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer"
              >
                История
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/ProfilePage");
                }}
                className="bg-[#8cc63f] hover:bg-[#7ab82c] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-2xs whitespace-nowrap cursor-pointer flex items-center space-x-1"
              >
                <span>В профиль</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </section>

        {/* ====================================================
            3. СЛАЙДЕР АКЦИЙ (ПОСЛЕДНИЕ 3 АКЦИИ, ТОЛЬКО КАРТИНКИ)
        ==================================================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight leading-snug">
              Спецпредложения
            </h2>
            <button
              onClick={() => navigate("/offers")}
              className="text-xs sm:text-sm font-semibold text-[#76aa34] hover:underline flex items-center space-x-0.5 whitespace-nowrap cursor-pointer"
            >
              <span>Все акции</span>
              <ChevronRight size={15} />
            </button>
          </div>

          <div
            className="relative w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200/90 shadow-xs select-none group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0].clientX;
              setIsPaused(true);
            }}
            onTouchMove={(e) => {
              if (touchStartX.current === null) return;
              const diff = touchStartX.current - e.touches[0].clientX;
              if (Math.abs(diff) > 40) {
                if (diff > 0) {
                  setCurrentSlide((prev) => (prev + 1) % promoSlides.length);
                } else {
                  setCurrentSlide(
                    (prev) =>
                      (prev - 1 + promoSlides.length) % promoSlides.length
                  );
                }
                touchStartX.current = null;
              }
            }}
            onTouchEnd={() => {
              touchStartX.current = null;
              setIsPaused(false);
            }}
          >
            {/* Слайды (тянем ТОЛЬКО чистые маркетинговые постеры) */}
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {promoSlides.map((slide, idx) => (
                <div
                  key={slide.thumbnail || idx}
                  onClick={() => {
                    navigate(`/offer/${idx}`, { state: { offer: slide } });
                  }}
                  className="w-full shrink-0 cursor-pointer aspect-[2.29/1] relative overflow-hidden bg-zinc-950 flex items-center justify-center"
                >
                  <img
                    src={slide.thumbnail}
                    alt={slide.title || "Акция Прагматика"}
                    className="w-full h-full object-cover block"
                    loading={idx === 0 ? "eager" : "lazy"}
                  />
                </div>
              ))}
            </div>

            {/* Стрелки переключения для ПК/планшетов */}
            {promoSlides.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Предыдущий слайд"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide(
                      (prev) =>
                        (prev - 1 + promoSlides.length) % promoSlides.length
                    );
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-opacity opacity-0 group-hover:opacity-100 sm:opacity-75"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  aria-label="Следующий слайд"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide(
                      (prev) => (prev + 1) % promoSlides.length
                    );
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-opacity opacity-0 group-hover:opacity-100 sm:opacity-75"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}

            {/* Точки-индикаторы */}
            {promoSlides.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center items-center space-x-2 z-10 pointer-events-none">
                {promoSlides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Слайд ${idx + 1}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSlide(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 pointer-events-auto ${
                      currentSlide === idx
                        ? "w-6 bg-[#8cc63f]"
                        : "w-2 bg-white/70 hover:bg-white"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ====================================================
            4. ОФИЦИАЛЬНЫЙ ДИЛЕР (ПЛОСКАЯ ПРОСТОРНАЯ СЕТКА)
        ==================================================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight leading-snug">
                Официальный дилер
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                Новые автомобили с заводской гарантией в наличии
              </p>
            </div>
            <button
              onClick={() => navigate("/showcase")}
              className="text-xs sm:text-sm font-semibold text-[#76aa34] hover:underline flex items-center space-x-0.5 whitespace-nowrap ml-2 cursor-pointer"
            >
              <span>Весь каталог</span>
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {DEALER_BRANDS.map((b) => (
              <button
                key={b.name}
                onClick={navigateTo("/showcase", { brand: b.filterVendor })}
                className="relative bg-white hover:border-[#8cc63f] active:scale-[0.98] border border-gray-200/90 rounded-2xl p-4 text-left transition-all flex flex-col justify-between shadow-2xs hover:shadow-xs group cursor-pointer touch-manipulation"
              >
                {/* Бейдж количества справа сверху */}
                <span className="absolute top-2.5 right-2.5 text-[11px] font-semibold text-gray-600 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200/80 whitespace-nowrap shadow-2xs">
                  {b.badge}
                </span>

                {/* Контейнер логотипа */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gray-50/90 border border-gray-100 flex items-center justify-center p-2 mb-2.5 group-hover:scale-105 transition-transform shadow-2xs">
                  <img
                    src={b.logo}
                    alt={b.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div>
                  <span className="font-bold text-sm text-gray-900 block mb-0.5 group-hover:text-[#76aa34] transition-colors leading-tight">
                    {b.name}
                  </span>
                  <span className="text-[11px] text-gray-500 block leading-tight whitespace-nowrap">
                    {b.countText}
                  </span>
                </div>
              </button>
            ))}

            {/* Карточка Авто с пробегом */}
            <button
              onClick={() => {
                localStorage.removeItem("usedFilters");
                localStorage.removeItem("usedVisibleCount");
                localStorage.removeItem("scrollToUsedCarId");
                navigate("/ShowcaseUsed");
              }}
              className="relative bg-white hover:border-orange-400 active:scale-[0.98] border border-gray-200/90 rounded-2xl p-4 text-left transition-all flex flex-col justify-between shadow-2xs hover:shadow-xs group cursor-pointer touch-manipulation"
            >
              {/* Бейдж количества справа сверху */}
              <span className="absolute top-2.5 right-2.5 text-[11px] font-bold bg-orange-500 text-white px-2 py-0.5 rounded-md shadow-2xs whitespace-nowrap">
                {usedCount || "519"}
              </span>

              {/* Контейнер красивой иконки авто с пробегом */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-orange-50/80 border border-orange-100 flex items-center justify-center p-2 mb-2.5 group-hover:scale-105 transition-transform shadow-2xs">
                <img
                  src="/logos/used.svg"
                  alt="С пробегом"
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <span className="font-bold text-sm text-gray-900 block mb-0.5 group-hover:text-orange-600 transition-colors leading-tight">
                  С пробегом
                </span>
                <span className="text-[11px] text-gray-500 block leading-tight whitespace-nowrap">
                  Проверено дилером
                </span>
              </div>
            </button>
          </div>

          {/* КАРТОЧКА: ЗАПИСЬ НА СЕРВИС ОНЛАЙН С ИЛЛЮСТРАЦИЕЙ SERVICE.PNG */}
          <div
            onClick={() => navigate("/ServiceBooking")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                navigate("/ServiceBooking");
              }
            }}
            className="bg-white border border-gray-200/90 hover:border-[#8cc63f] active:scale-[0.99] rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 group cursor-pointer flex flex-col justify-between touch-manipulation"
          >
            {/* Верхняя часть: Заголовок и бейдж */}
            <div className="p-4 sm:p-5 pb-2">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#f0f7e8] border border-[#8cc63f]/30 text-[#76aa34] text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8cc63f] animate-pulse shrink-0" />
                  <span>Официальный сервис 24/7</span>
                </div>
                <span className="text-[11px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                  Гарантия
                </span>
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-gray-900 leading-snug">
                Запись на сервис онлайн
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 leading-normal">
                ТО, диагностика, гарантийный ремонт и шиномонтаж без очередей
              </p>
            </div>

            {/* Центральная часть: Иллюстрация service.png */}
            <div className="w-full px-4 py-2 flex items-center justify-center bg-gradient-to-b from-white via-gray-50/40 to-white">
              <img
                src="/service.png"
                alt="Запись на сервис Прагматика"
                className="w-full h-auto max-h-40 sm:max-h-48 object-contain group-hover:scale-102 transition-transform duration-200"
              />
            </div>

            {/* Нижняя часть: Кнопка действия во всю ширину */}
            <div className="p-4 sm:p-5 pt-2">
              <div className="w-full bg-[#8cc63f] hover:bg-[#7ab82c] active:scale-[0.98] text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2 text-sm shadow-xs">
                <span>Записаться на сервис онлайн</span>
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            5. ПОИСК АВТОМОБИЛЯ: НОВЫЕ И С ПРОБЕГОМ В ЗАКРУГЛЕННЫХ КВАДРАТАХ
        ==================================================== */}
        <section className="bg-white rounded-2xl border border-gray-200/90 p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight leading-snug">
                Поиск автомобиля
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                Выберите категорию в наличии
              </p>
            </div>
            <span className="text-xs font-semibold text-[#76aa34] bg-[#f0f7e8] px-3 py-1 rounded-lg whitespace-nowrap">
              В наличии
            </span>
          </div>

          {/* Карточки: фото во весь закруглённый квадрат с текстом поверх */}
          <div className="grid grid-cols-2 gap-3.5 sm:gap-4.5 mb-5 sm:mb-6">
            {/* Карточка: Новые авто */}
            <button
              type="button"
              onClick={() => {
                if (activeCatalogTab === "new") {
                  navigate("/Showcase");
                } else {
                  setActiveCatalogTab("new");
                }
              }}
              className={`relative aspect-square rounded-2xl overflow-hidden text-left transition-all duration-300 group shadow-xs cursor-pointer ${
                activeCatalogTab === "new"
                  ? "ring-3 ring-[#8cc63f] shadow-md"
                  : "ring-1 ring-black/10 hover:ring-[#8cc63f]/60 hover:shadow-sm"
              }`}
            >
              {/* Фотография на всю площадь карточки */}
              <img
                src="/new-auto-1.png"
                alt="Новые автомобили"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Затемняющий градиент снизу под текст */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

              {/* Бейдж количества авто вверху */}
              <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg border border-white/20 whitespace-nowrap shadow-xs">
                {newCount || "1 177"} авто
              </span>

              {/* Индикатор выбора */}
              {activeCatalogTab === "new" && (
                <span className="absolute top-3 right-3 w-6 h-6 bg-[#8cc63f] text-white rounded-full flex items-center justify-center shadow-md">
                  <CheckCircle2 size={15} strokeWidth={2.5} />
                </span>
              )}

              {/* Текст снизу */}
              <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="text-white font-bold text-sm sm:text-base drop-shadow-sm leading-tight">
                    Новые авто
                  </span>
                  <ChevronRight
                    size={16}
                    className="text-white/90 drop-shadow-sm group-hover:translate-x-1 transition-transform shrink-0"
                  />
                </div>
              </div>
            </button>

            {/* Карточка: С пробегом */}
            <button
              type="button"
              onClick={() => {
                if (activeCatalogTab === "used") {
                  localStorage.removeItem("usedFilters");
                  localStorage.removeItem("usedVisibleCount");
                  localStorage.removeItem("scrollToUsedCarId");
                  navigate("/ShowcaseUsed");
                } else {
                  setActiveCatalogTab("used");
                }
              }}
              className={`relative aspect-square rounded-2xl overflow-hidden text-left transition-all duration-300 group shadow-xs cursor-pointer ${
                activeCatalogTab === "used"
                  ? "ring-3 ring-[#8cc63f] shadow-md"
                  : "ring-1 ring-black/10 hover:ring-[#8cc63f]/60 hover:shadow-sm"
              }`}
            >
              {/* Фотография на всю площадь карточки */}
              <img
                src="/auto-probeg-1.png"
                alt="Автомобили с пробегом"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Затемняющий градиент снизу под текст */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

              {/* Бейдж количества авто вверху */}
              <span className="absolute top-3 left-3 bg-orange-600/90 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg border border-white/20 whitespace-nowrap shadow-xs">
                {usedCount || "519"} авто
              </span>

              {/* Индикатор выбора */}
              {activeCatalogTab === "used" && (
                <span className="absolute top-3 right-3 w-6 h-6 bg-[#8cc63f] text-white rounded-full flex items-center justify-center shadow-md">
                  <CheckCircle2 size={15} strokeWidth={2.5} />
                </span>
              )}

              {/* Текст снизу */}
              <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="text-white font-bold text-sm sm:text-base drop-shadow-sm leading-tight">
                    С пробегом
                  </span>
                  <ChevronRight
                    size={16}
                    className="text-white/90 drop-shadow-sm group-hover:translate-x-1 transition-transform shrink-0"
                  />
                </div>
              </div>
            </button>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 mb-5 leading-relaxed">
            {activeCatalogTab === "new"
              ? "Все комплектации с официальной заводской гарантией. Программы субсидированного кредитования и обмен по Трейд-ин."
              : "Автомобили проверены по 120 пунктам технической диагностики с подтвержденной юридической чистотой."}
          </p>

          <button
            onClick={() => {
              if (activeCatalogTab === "new") {
                navigate("/Showcase");
              } else {
                localStorage.removeItem("usedFilters");
                localStorage.removeItem("usedVisibleCount");
                localStorage.removeItem("scrollToUsedCarId");
                navigate("/ShowcaseUsed");
              }
            }}
            className="w-full bg-[#8cc63f] hover:bg-[#7ab82c] text-white font-bold py-3.5 sm:py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base shadow-xs cursor-pointer"
          >
            <span className="whitespace-nowrap">
              {activeCatalogTab === "new"
                ? `Смотреть новые автомобили (${newCount || "1 177"})`
                : `Смотреть автомобили с пробегом (${usedCount || "519"})`}
            </span>
            <ArrowRight size={17} />
          </button>
        </section>

        {/* ====================================================
            6. КЛЮЧЕВЫЕ СЕРВИСЫ (ПЛОСКИЙ ПРОСТОРНЫЙ ГРИД)
        ==================================================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight leading-snug">
                Услуги автоцентра
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                Сервисные программы и клубные привилегии
              </p>
            </div>
            <span className="text-xs text-gray-400 font-medium">
              Для клиентов сети
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
            {/* Шины и диски */}
            <button
              onClick={navigateTo("/tires-wheels")}
              className="bg-white border border-gray-200/90 hover:border-[#8cc63f] active:scale-[0.98] rounded-2xl p-4 text-left transition-all flex flex-col justify-between shadow-2xs hover:shadow-xs group cursor-pointer touch-manipulation"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#f4f9ed] flex items-center justify-center p-2 mb-3 group-hover:scale-105 transition-all shadow-2xs">
                <img
                  src="/icons/tires.png"
                  alt="Шины и диски"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-bold text-sm sm:text-base text-gray-900 block mb-1 group-hover:text-[#76aa34] transition-colors leading-tight">
                  Шины и диски
                </span>
                <span className="text-[11px] sm:text-xs text-gray-500 block leading-tight">
                  Шиномонтаж и хранение
                </span>
              </div>
            </button>

            {/* Акции и скидки */}
            <button
              onClick={navigateTo("/offers")}
              className="bg-white border border-gray-200/90 hover:border-orange-300 active:scale-[0.98] rounded-2xl p-4 text-left transition-all flex flex-col justify-between shadow-2xs hover:shadow-xs group cursor-pointer touch-manipulation"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#fff7ed] flex items-center justify-center p-2 mb-3 group-hover:scale-105 transition-all shadow-2xs">
                <img
                  src="/icons/offers.png"
                  alt="Акции и выгода"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-bold text-sm sm:text-base text-gray-900 block mb-1 group-hover:text-orange-600 transition-colors leading-tight">
                  Акции и выгода
                </span>
                <span className="text-[11px] sm:text-xs text-gray-500 block leading-tight">
                  Специальные условия
                </span>
              </div>
            </button>

            {/* Новости Прагматика */}
            <button
              onClick={navigateTo("/NewsList")}
              className="bg-white border border-gray-200/90 hover:border-blue-300 active:scale-[0.98] rounded-2xl p-4 text-left transition-all flex flex-col justify-between shadow-2xs hover:shadow-xs group cursor-pointer touch-manipulation"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#f0f7ff] flex items-center justify-center p-2 mb-3 group-hover:scale-105 transition-all shadow-2xs">
                <img
                  src="/icons/news.png"
                  alt="Новости"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-bold text-sm sm:text-base text-gray-900 block mb-1 group-hover:text-blue-600 transition-colors leading-tight">
                  Новости
                </span>
                <span className="text-[11px] sm:text-xs text-gray-500 block leading-tight">
                  События и новинки
                </span>
              </div>
            </button>

            {/* Бонусный счёт */}
            <button
              onClick={navigateTo("/BonusPage")}
              className="bg-white border border-gray-200/90 hover:border-[#8cc63f] active:scale-[0.98] rounded-2xl p-4 text-left transition-all flex flex-col justify-between shadow-2xs hover:shadow-xs group cursor-pointer touch-manipulation"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#fdf8ec] flex items-center justify-center p-2 mb-3 group-hover:scale-105 transition-all shadow-2xs">
                <img
                  src="/icons/bonus.png"
                  alt="Бонусный клуб"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-bold text-sm sm:text-base text-gray-900 block mb-1 group-hover:text-[#76aa34] transition-colors leading-tight">
                  Бонусный клуб
                </span>
                <span className="text-[11px] sm:text-xs text-gray-500 block leading-tight">
                  Правила начисления
                </span>
              </div>
            </button>
          </div>
        </section>

        {/* ====================================================
            7. КОНТАКТЫ И СПРАВОЧНАЯ
        ==================================================== */}
        <section className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-xs">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight leading-snug">
                Контакты автоцентров
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 leading-snug">
                Сеть дилерских центров и сервисных станций
              </p>
            </div>
            <button
              onClick={() => navigate("/contacts")}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-[#76aa34] bg-[#f0f7e8] hover:bg-[#e4f2d3] px-3 py-1.5 rounded-xl transition-colors shrink-0 cursor-pointer shadow-2xs"
            >
              <span>Все адреса</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div className="flex items-center space-x-3 text-xs sm:text-sm text-gray-600 font-medium">
              <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[#8cc63f] shrink-0 shadow-2xs">
                <Clock size={18} />
              </div>
              <div>
                <span className="block text-gray-900 font-semibold leading-tight text-xs sm:text-sm">
                  Ежедневно 09:00 — 21:00
                </span>
                <span className="block text-gray-400 text-[11px] leading-tight mt-0.5">
                  Без выходных и перерывов
                </span>
              </div>
            </div>

            <div className="self-stretch sm:self-auto">
              <button
                onClick={() => {
                  setCallbackTopic("Заказ звонка из контактов");
                  setShowCallback(true);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 bg-[#8cc63f] hover:bg-[#7ab82c] text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-all whitespace-nowrap shadow-xs active:scale-98 cursor-pointer"
              >
                <Phone size={13} className="shrink-0" />
                <span>Заказать звонок</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Попап обратного звонка (Calltouch) */}
      {showCallback && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-center z-50 p-4"
          onClick={() => setShowCallback(false)}
        >
          <div
            className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm relative border border-gray-100 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCallback(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center space-x-2.5 mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-[#f0f7e8] text-[#8cc63f] flex items-center justify-center shrink-0">
                <Phone size={18} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Заказать звонок
              </h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Перезвоним в течение 1 минуты в рабочее время
            </p>

            <form onSubmit={handleCallbackSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Ваше имя
                </label>
                <input
                  type="text"
                  placeholder="Иван"
                  value={callbackName}
                  onChange={(e) => setCallbackName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-[#8cc63f] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Номер телефона <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  value={callbackPhone}
                  onChange={(e) => setCallbackPhone(formatRussianPhone(e.target.value))}
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-[#8cc63f] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Цель обращения
                </label>
                <select
                  value={callbackTopic}
                  onChange={(e) => setCallbackTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-[#8cc63f] focus:bg-white transition-all"
                >
                  <option value="Запись на сервис">Запись на сервис</option>
                  <option value="Покупка автомобиля">Покупка автомобиля</option>
                  <option value="Авто с пробегом">Авто с пробегом</option>
                  <option value="Общая консультация">Общая консультация</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={callbackSubmitting}
                className="mt-1 w-full bg-[#8cc63f] hover:bg-[#7bb531] text-white font-bold py-3 rounded-xl shadow-sm transition-all active:scale-98 text-sm cursor-pointer disabled:opacity-50"
              >
                {callbackSubmitting ? "Отправка..." : "Жду звонка"}
              </button>

              {callbackStatus && (
                <div
                  className={`text-xs mt-1 p-2.5 rounded-lg text-center font-medium ${
                    callbackStatus.startsWith("Ваша заявка")
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {callbackStatus}
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Нижняя навигация */}
      <BottomNav />
    </div>
  );
}
