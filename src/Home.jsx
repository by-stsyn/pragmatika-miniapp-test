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
  ChevronDown,
  ChevronUp,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ShieldCheck,
  Plus,
  Sparkles,
  FileText,
  Snowflake,
  Sun,
  Disc,
  Bell,
  BellRing,
  Check,
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

// Начальные промо-слайды (актуальные акции из фида Прагматика)
const DEFAULT_PROMO_SLIDES = [
  {
    title: "Выгодный октябрь в Прагматика Belgee!",
    thumbnail:
      "https://www.pragmaticar.ru/uploads/offer/00621ed7bc4c7e695ad8ff2a6c0b4432.jpg",
    link: "https://www.pragmaticar.ru/offers/sell/vygodnyi_oktyabr_v_pragmatika_belgee/",
  },
  {
    title: "Выгодный октябрь в Прагматика Geely!",
    thumbnail:
      "https://www.pragmaticar.ru/uploads/offer/d8196e2f1ef095b514e5b57a9538b343.jpg",
    link: "https://www.pragmaticar.ru/offers/sell/vygodnyi_oktyabr_v_pragmatika_geely/",
  },
  {
    title: "Масляный сервис Fix Price",
    thumbnail:
      "https://www.pragmaticar.ru/uploads/offer/9a71d62a80fcd4d3084a7da779fab0b4.png",
    link: "https://www.pragmaticar.ru/offers/service/maslyanyi_servis_fix_price_originalnoe_maslo_pochti_darom_vse_vklucheno_bez_skrytyh_surprizov__uspeite/",
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

  // Автомобили пользователя и блок «Что нужно моему автомобилю»
  const [userCars, setUserCars] = useState([]);
  const [carsLoading, setCarsLoading] = useState(true);
  const [selectedCarIndex, setSelectedCarIndex] = useState(0);
  const [carRepairs, setCarRepairs] = useState([]);
  const [carRecs, setCarRecs] = useState([]);
  const [carInsurance, setCarInsurance] = useState([]);
  const [carDataLoading, setCarDataLoading] = useState(false);
  const [expandedRecs, setExpandedRecs] = useState(false);

  // Сезонные шины и напоминание о смене резины
  const [tireReminderSubscribed, setTireReminderSubscribed] = useState(() => {
    try {
      return localStorage.getItem("pragmatika_tire_reminder") === "true";
    } catch {
      return false;
    }
  });
  const [tireReminderAlert, setTireReminderAlert] = useState(false);

  const getTireSeasonInfo = () => {
    const month = new Date().getMonth() + 1; // 1-12
    if (month >= 9 && month <= 11) {
      return {
        season: "winter_change",
        title: "Сезонная смена шин на ЗИМУ",
        desc: "Среднесуточная температура опускается ниже +7°C. Рекомендуем заблаговременно перейти на зимний комплект и сдать летние шины на хранение.",
        badge: "❄️ Зимний сезон",
        badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
        iconType: "winter",
        recommendation: "Запишитесь на шиномонтаж до первых заморозков и очередей",
        actionBtn: "Запись на шиномонтаж",
      };
    }
    if (month === 12 || month <= 2) {
      return {
        season: "winter",
        title: "Зимний период: Контроль шин",
        desc: "Проверяйте давление в шинах и балансировку колес при резких перепадах температур для безопасного сцепления.",
        badge: "❄️ Зимний сезон",
        badgeColor: "bg-cyan-50 text-cyan-700 border-cyan-200",
        iconType: "winter",
        recommendation: "Проверка давления, балансировка и ошиповка",
        actionBtn: "Проверить шины",
      };
    }
    if (month >= 3 && month <= 5) {
      return {
        season: "summer_change",
        title: "Весенняя смена шин на ЛЕТО",
        desc: "Установилась устойчивая теплая погода. Своевременно переобуйтесь на летний комплект, чтобы сохранить ресурс зимней резины.",
        badge: "☀️ Летний сезон",
        badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
        iconType: "summer",
        recommendation: "Переход на летнюю резину и сезонное хранение зимней",
        actionBtn: "Запись на шиномонтаж",
      };
    }
    return {
      season: "summer",
      title: "Летний период: Контроль шин",
      desc: "Проверка остатка протектора, сход-развала и давления для надежного сцепления в любых погодных условиях.",
      badge: "☀️ Летний сезон",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      iconType: "summer",
      recommendation: "Проверка износа протектора и сход-развал",
      actionBtn: "Сход-развал и сервис",
    };
  };

  const handleToggleTireReminder = (e) => {
    e?.stopPropagation?.();
    const next = !tireReminderSubscribed;
    setTireReminderSubscribed(next);
    try {
      localStorage.setItem("pragmatika_tire_reminder", String(next));
    } catch {}
    if (next) {
      setTireReminderAlert(true);
      setTimeout(() => setTireReminderAlert(false), 3500);
    }
  };

  // Слайдер акций (актуальные акции из фида, ТОЛЬКО картинки)
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
        setCarsLoading(false);
        return;
      }

      const idParam = platform.isMax?.() ? "maxId" : "telegramId";

      // 3. Загружаем актуальные данные карты лояльности с бэкенда
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
            setBonus(null);
            try {
              localStorage.removeItem("userBonus");
              sessionStorage.removeItem("userBonus");
            } catch (e) {}
          }
        })
        .catch(() => {})
        .finally(() => {
          setBonusLoading(false);
        });

      // 4. Загружаем автомобили пользователя
      fetch(`${BASE_URL}?path=api/profile/cars&${idParam}=${uid}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          const list = Array.isArray(data?.cars) ? data.cars : [];
          setUserCars(list);
        })
        .catch(() => {})
        .finally(() => {
          setCarsLoading(false);
        });
    } catch {
      setBonusLoading(false);
      setCarsLoading(false);
    }
  }, []);

  /* ====================================================
     Загрузка истории ТО, рекомендаций и страховок для выбранного авто
  ==================================================== */
  useEffect(() => {
    if (!userId || !userCars.length || !userCars[selectedCarIndex]?.vin) {
      setCarRepairs([]);
      setCarRecs([]);
      setCarInsurance([]);
      setCarDataLoading(false);
      return;
    }

    const selectedCar = userCars[selectedCarIndex];
    const vin = selectedCar.vin;
    const idParam = platform.isMax?.() ? "maxId" : "telegramId";
    setCarDataLoading(true);

    Promise.allSettled([
      fetch(
        `${BASE_URL}?path=communication/contact/history_repair&${idParam}=${userId}&vin=${vin}`
      ).then((r) => (r.ok ? r.json() : null)),
      fetch(
        `${BASE_URL}?path=communication/contact/recommendation_repair&${idParam}=${userId}&vin=${vin}`
      ).then((r) => (r.ok ? r.json() : null)),
      fetch(
        `${BASE_URL}?path=communication/contact/insurance_policy&${idParam}=${userId}&vin=${vin}`
      ).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([repairsRes, recsRes, insRes]) => {
        if (repairsRes.status === "fulfilled" && repairsRes.value?.history) {
          const sorted = [...repairsRes.value.history].sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          );
          setCarRepairs(sorted);
        } else {
          setCarRepairs([]);
        }

        if (
          recsRes.status === "fulfilled" &&
          recsRes.value?.data?.recommendations
        ) {
          setCarRecs(recsRes.value.data.recommendations);
        } else {
          setCarRecs([]);
        }

        if (
          insRes.status === "fulfilled" &&
          insRes.value?.data?.insurancePolicies
        ) {
          setCarInsurance(insRes.value.data.insurancePolicies);
        } else {
          setCarInsurance([]);
        }
      })
      .catch((err) => {
        console.error("Ошибка загрузки данных автомобиля:", err);
      })
      .finally(() => {
        setCarDataLoading(false);
      });
  }, [userId, userCars, selectedCarIndex]);

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
            setPromoSlides(withThumbs);
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
      {/* Всплывающее уведомление о подписке на смену шин */}
      {tireReminderAlert && (
        <div className="fixed top-16 left-4 right-4 max-w-md mx-auto z-50 bg-gray-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300 border border-white/10">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#8cc63f] text-white flex items-center justify-center shrink-0">
              <BellRing size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold leading-tight">Напоминание о смене шин активировано</p>
              <p className="text-[11px] text-gray-300 leading-tight mt-0.5">
                Мы уведомим вас о наступлении оптимальной температуры (+7°C).
              </p>
            </div>
          </div>
          <button
            onClick={() => setTireReminderAlert(false)}
            className="text-gray-400 hover:text-white p-1 shrink-0"
          >
            <X size={15} />
          </button>
        </div>
      )}

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
            2. ПЕРСОНАЛИЗАЦИЯ И «ЧТО НУЖНО МОЕМУ АВТОМОБИЛЮ»
        ==================================================== */}
        <section className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden transition-all">
          {/* 1. Верхний блок: Просторный и свежий профиль, где имя помещается полностью */}
          <div
            onClick={() => navigate("/ProfilePage")}
            className="p-4 sm:p-5 bg-gradient-to-b from-white to-slate-50/60 cursor-pointer border-b border-gray-100 space-y-3 group transition-all"
          >
            {/* Верхняя строка: Аватар + Полное имя пользователя + Стрелка перехода */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                {/* Аватар пользователя */}
                <div className="relative shrink-0">
                  {user?.photo ? (
                    <img
                      src={user.photo}
                      alt={user.first_name || "Участник"}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-[#8cc63f]/30 shadow-xs"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#f0f7e8] border border-[#8cc63f]/30 text-[#6fa02f] flex items-center justify-center font-bold text-base shadow-xs">
                      {user?.first_name ? user.first_name[0].toUpperCase() : <User size={20} />}
                    </div>
                  )}
                  <span className="w-3.5 h-3.5 bg-[#8cc63f] rounded-full border-2 border-white absolute bottom-0 right-0 shadow-xs" />
                </div>

                {/* Полное имя без обрезания */}
                <div className="min-w-0 flex-1">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                    {user?.first_name
                      ? `${user.first_name}${user.last_name ? " " + user.last_name : ""}`
                      : "Клиент Прагматика"}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Личный кабинет {bonus?.number ? `• № ${bonus.number}` : ""}
                  </p>
                </div>
              </div>

              {/* Единственная понятная кнопка перехода в профиль */}
              <div className="w-8 h-8 rounded-full bg-white border border-gray-200/80 group-hover:border-[#8cc63f]/40 group-hover:bg-[#f0f7e8] text-gray-400 group-hover:text-[#76aa34] flex items-center justify-center transition-all shadow-2xs shrink-0">
                <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* Нижняя строка: Аккуратная плашка баллов лояльности и кэшбэка */}
            <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500 font-medium">Бонусный баланс:</span>
                <span className="text-sm font-extrabold text-[#76aa34]">
                  {bonusLoading
                    ? "..."
                    : bonus?.balance !== undefined
                    ? Number(bonus.balance).toLocaleString("ru-RU")
                    : "0"}{" "}
                  баллов
                </span>
              </div>
              <span className="text-[11px] font-bold text-[#6fa02f] bg-[#f0f7e8] px-2.5 py-0.5 rounded-full">
                Кэшбэк 5%
              </span>
            </div>
          </div>

          {/* 2. Нижняя часть: Интеллектуальный ассистент «Что нужно вашему автомобилю» */}
          <div className="p-4 sm:p-5 bg-white space-y-4">
            {/* Заголовок блока с иконкой и переключателем машин */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-[#f0f7e8] text-[#6fa02f] flex items-center justify-center shrink-0">
                  <Car size={17} strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-tight flex items-center gap-1.5">
                    <span>Что нужно моему автомобилю</span>
                    <Sparkles size={14} className="text-[#8cc63f]" />
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    {userCars.length > 0
                      ? `В гараже: ${userCars.length} ${userCars.length === 1 ? "авто" : "автомобиля"}`
                      : "Персональный онлайн-помощник ТО"}
                  </p>
                </div>
              </div>

              {userCars.length > 0 && (
                <button
                  type="button"
                  onClick={() => navigate("/ProfilePage")}
                  className="text-xs font-semibold text-[#76aa34] hover:underline flex items-center gap-1 shrink-0"
                >
                  <Plus size={13} />
                  <span>Добавить</span>
                </button>
              )}
            </div>

            {/* Если еще нет добавленных авто */}
            {carsLoading ? (
              <div className="space-y-3">
                <div className="py-4 text-center text-xs text-gray-400">
                  Загрузка данных гаража...
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/ServiceBooking")}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#8cc63f] hover:bg-[#7ab82c] text-white font-bold text-sm shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Wrench size={17} strokeWidth={2.3} />
                  <span>Записаться на сервис онлайн</span>
                </button>
              </div>
            ) : userCars.length === 0 ? (
              <div className="space-y-3.5">
                {/* Карточка предложения добавить авто */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-100 p-4 text-center">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 text-[#6fa02f] mx-auto mb-2 flex items-center justify-center shadow-2xs">
                    <Car size={20} />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">
                    Добавьте автомобиль в свой гараж
                  </h4>
                  <p className="text-xs text-gray-500 mb-3 max-w-sm mx-auto leading-relaxed">
                    График ТО, рекомендации мастера с последнего визита и контроль страховых полисов.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/ProfilePage")}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#425766] hover:bg-[#344653] text-white font-semibold text-xs shadow-2xs transition-all cursor-pointer active:scale-95"
                  >
                    <Plus size={14} />
                    <span>Добавить авто</span>
                  </button>
                </div>

                {/* Сезонное напоминание по шинам (стабильная ровная верстка) */}
                {(() => {
                  const tireSeason = getTireSeasonInfo();
                  return (
                    <div className="rounded-2xl border border-blue-100/90 bg-gradient-to-b from-blue-50/25 to-white p-4 space-y-3 shadow-xs">
                      {/* Верхний ряд: Бейдж сезона и метка */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${tireSeason.badgeColor}`}
                        >
                          {tireSeason.badge}
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium">
                          Сезонное ТО
                        </span>
                      </div>

                      {/* Средний ряд: Иконка + Заголовок на всю ширину */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                          {tireSeason.iconType === "winter" ? (
                            <Snowflake size={20} className="text-blue-500" />
                          ) : (
                            <Sun size={20} className="text-amber-500" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm sm:text-base font-bold text-gray-900 leading-snug">
                            {tireSeason.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            Своевременная замена резины и сезонное хранение шин на дилерском складе
                          </p>
                        </div>
                      </div>

                      {/* Нижний ряд: Симметричные кнопки 50/50 */}
                      <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={handleToggleTireReminder}
                          className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border flex items-center justify-center gap-1.5 active:scale-95 shadow-2xs ${
                            tireReminderSubscribed
                              ? "bg-[#f0f7e8] text-[#6fa02f] border-[#8cc63f]/50 font-bold"
                              : "bg-white text-gray-700 border-gray-200 hover:border-[#8cc63f]"
                          }`}
                        >
                          {tireReminderSubscribed ? (
                            <>
                              <BellRing size={13} className="text-[#6fa02f] shrink-0" />
                              <span className="truncate">Напоминание вкл</span>
                            </>
                          ) : (
                            <>
                              <Bell size={13} className="text-gray-400 shrink-0" />
                              <span className="truncate">Напомнить</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate("/tires-wheels")}
                          className="py-2 px-3 rounded-xl bg-white hover:bg-slate-50 border border-gray-200 text-[#425766] hover:text-[#76aa34] text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-2xs active:scale-95"
                        >
                          <span>Каталог шин</span>
                          <ChevronRight size={13} className="text-[#8cc63f]" />
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Единственная главная кнопка записи на сервис онлайн */}
                <button
                  type="button"
                  onClick={() => navigate("/ServiceBooking")}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#8cc63f] hover:bg-[#7ab82c] text-white font-bold text-sm sm:text-base shadow-sm shadow-[#8cc63f]/25 hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <Wrench size={18} strokeWidth={2.3} />
                  <span>Записаться на сервис онлайн</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {/* Табы выбора автомобиля (если машин > 1) */}
                {userCars.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {userCars.map((car, idx) => (
                      <button
                        key={car.id || idx}
                        type="button"
                        onClick={() => setSelectedCarIndex(idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                          selectedCarIndex === idx
                            ? "bg-[#425766] text-white border-[#425766] shadow-2xs"
                            : "bg-white text-gray-700 border-gray-200 hover:border-[#8cc63f]"
                        }`}
                      >
                        <Car size={13} />
                        <span>
                          {car.brand} {car.model}
                        </span>
                        {car.plate && (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                              selectedCarIndex === idx
                                ? "bg-white/20 text-white"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {car.plate}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Карточка выбранного автомобиля с данными */}
                {(() => {
                  const activeCar = userCars[selectedCarIndex] || userCars[0];
                  const lastRepair = carRepairs.length > 0 ? carRepairs[0] : null;

                  let toRecommendation = {
                    status: "unknown",
                    title: "Плановое ТО",
                    desc: "Регламентное ТО рекомендуется каждые 10 000 – 15 000 км или 1 раз в год",
                    badge: "Регламент",
                    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
                  };

                  if (lastRepair) {
                    const lastDate = new Date(lastRepair.date);
                    const now = new Date();
                    const monthsDiff =
                      (now.getFullYear() - lastDate.getFullYear()) * 12 +
                      (now.getMonth() - lastDate.getMonth());
                    const nextTargetDate = new Date(lastDate);
                    nextTargetDate.setFullYear(nextTargetDate.getFullYear() + 1);
                    const nextMileage = lastRepair.mileage
                      ? Number(lastRepair.mileage) + 15000
                      : null;

                    const formattedLastDate = lastDate.toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });
                    const formattedNextMonth = nextTargetDate.toLocaleDateString(
                      "ru-RU",
                      {
                        month: "long",
                        year: "numeric",
                      }
                    );

                    if (monthsDiff >= 12) {
                      toRecommendation = {
                        status: "urgent",
                        title: "Пора пройти плановое ТО",
                        desc: `Последний визит был ${formattedLastDate}${
                          lastRepair.mileage ? ` (${lastRepair.mileage} км)` : ""
                        }. Прошло более года — запишитесь на сервис.`,
                        badge: "Срочно на ТО",
                        badgeColor: "bg-red-50 text-red-700 border-red-200",
                      };
                    } else if (monthsDiff >= 10) {
                      toRecommendation = {
                        status: "soon",
                        title: "Приближается срок ТО",
                        desc: `Рекомендуем пройти ТО до ${formattedNextMonth}${
                          nextMileage
                            ? ` или на ${nextMileage.toLocaleString("ru-RU")} км`
                            : ""
                        }.`,
                        badge: "Скоро ТО",
                        badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
                      };
                    } else {
                      toRecommendation = {
                        status: "ok",
                        title: "ТО в графике",
                        desc: `Последний визит: ${formattedLastDate}. Следующее ТО до ${formattedNextMonth}${
                          nextMileage
                            ? ` (~${nextMileage.toLocaleString("ru-RU")} км)`
                            : ""
                        }.`,
                        badge: "В графике",
                        badgeColor: "bg-[#f0f7e8] text-[#6fa02f] border-[#8cc63f]/30",
                      };
                    }
                  }

                  const expiringInsurance = carInsurance.find((p) => {
                    if (!p?.dateEnd) return false;
                    const diffDays =
                      (new Date(p.dateEnd).getTime() - Date.now()) /
                      (1000 * 3600 * 24);
                    return diffDays <= 45 && diffDays >= -15;
                  });

                  return (
                    <div className="bg-white rounded-2xl border border-gray-100/90 p-4 shadow-2xs space-y-3.5">
                      {/* Шапка авто */}
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm sm:text-base font-extrabold text-gray-900 truncate">
                              {activeCar?.brand} {activeCar?.model}
                            </span>
                            {activeCar?.plate && (
                              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200 shrink-0">
                                {activeCar.plate}
                              </span>
                            )}
                          </div>
                          {activeCar?.vin && (
                            <span className="text-[11px] font-mono text-gray-400 block mt-0.5 truncate">
                              VIN: {activeCar.vin}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => navigate("/ProfilePage")}
                          className="text-xs text-gray-400 hover:text-[#76aa34] p-1 shrink-0"
                          title="Редактировать в профиле"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>

                      {carDataLoading ? (
                        <div className="py-4 text-center text-xs text-gray-400">
                          Анализ истории обслуживания и рекомендаций...
                        </div>
                      ) : (
                        <>
                          {/* 1. Блок ТО и графика */}
                          <div className="rounded-xl border border-gray-100 p-3 bg-slate-50/70">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center space-x-2 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-[#425766] flex items-center justify-center shrink-0 shadow-2xs">
                                  <Wrench size={14} />
                                </div>
                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-gray-900 block leading-tight">
                                    {toRecommendation.title}
                                  </span>
                                  <span className="text-[11px] text-gray-500 block leading-tight mt-0.5">
                                    {toRecommendation.desc}
                                  </span>
                                </div>
                              </div>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 whitespace-nowrap ${toRecommendation.badgeColor}`}
                              >
                                {toRecommendation.badge}
                              </span>
                            </div>
                          </div>

                          {/* 2. Блок Рекомендаций мастера */}
                          <div className="rounded-xl border border-gray-100 p-3 bg-slate-50/70">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-[#76aa34] flex items-center justify-center shrink-0 shadow-2xs">
                                  <FileText size={14} />
                                </div>
                                <span className="text-xs font-bold text-gray-900">
                                  Рекомендации с обслуживания
                                </span>
                              </div>
                              {carRecs.length > 0 && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                  {carRecs.length} шт.
                                </span>
                              )}
                            </div>

                            {carRecs.length > 0 ? (
                              <div className="mt-2 space-y-1.5">
                                {carRecs
                                  .slice(0, expandedRecs ? carRecs.length : 2)
                                  .map((rec, rIdx) => (
                                    <div
                                      key={rIdx}
                                      className="text-xs p-2 rounded-lg bg-white border border-gray-100 flex items-start gap-2 shadow-2xs"
                                    >
                                      <span className="text-sm shrink-0">
                                        {rec.included ? "🔴" : "🟡"}
                                      </span>
                                      <span className="text-gray-700 leading-snug line-clamp-2">
                                        {rec.description}
                                      </span>
                                    </div>
                                  ))}
                                {carRecs.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedRecs((prev) => !prev)
                                    }
                                    className="text-[11px] font-semibold text-[#76aa34] hover:underline flex items-center gap-0.5 pt-0.5"
                                  >
                                    <span>
                                      {expandedRecs
                                        ? "Свернуть"
                                        : `Ещё ${carRecs.length - 2} рекомендации`}
                                    </span>
                                    {expandedRecs ? (
                                      <ChevronUp size={12} />
                                    ) : (
                                      <ChevronDown size={12} />
                                    )}
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1.5 text-xs text-emerald-700 mt-1">
                                <CheckCircle2 size={13} className="shrink-0" />
                                <span>
                                  Замечаний мастера нет, автомобиль исправен
                                </span>
                              </div>
                            )}
                          </div>

                          {/* 3. Блок Страхования */}
                          <div className="rounded-xl border border-gray-100 p-3 bg-slate-50/70">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
                                  <ShieldCheck size={14} />
                                </div>
                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-gray-900 block leading-tight">
                                    Страховые полисы
                                  </span>
                                  {carInsurance.length > 0 ? (
                                    <span className="text-[11px] text-gray-500 block leading-tight mt-0.5 truncate">
                                      {carInsurance
                                        .map(
                                          (p) =>
                                            `${p.view || "Полис"} до ${
                                              p.dateEnd
                                                ? new Date(
                                                    p.dateEnd
                                                  ).toLocaleDateString("ru-RU")
                                                : "—"
                                            }`
                                        )
                                        .join(" • ")}
                                    </span>
                                  ) : (
                                    <span className="text-[11px] text-gray-400 block leading-tight mt-0.5">
                                      Полисы не привязаны
                                    </span>
                                  )}
                                </div>
                              </div>

                              {expiringInsurance ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 shrink-0">
                                  Пора продлить
                                </span>
                              ) : carInsurance.length > 0 ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                  Активен
                                </span>
                              ) : null}
                            </div>
                          </div>

                          {/* 4. Блок Сезонной смены шин и напоминания (стабильная ровная верстка) */}
                          {(() => {
                            const tireSeason = getTireSeasonInfo();
                            return (
                              <div className="rounded-2xl border border-blue-100/90 bg-gradient-to-b from-blue-50/25 to-white p-4 space-y-3 shadow-xs">
                                {/* Верхний ряд: Бейдж сезона и метка */}
                                <div className="flex items-center justify-between">
                                  <span
                                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${tireSeason.badgeColor}`}
                                  >
                                    {tireSeason.badge}
                                  </span>
                                  <span className="text-[11px] text-gray-400 font-medium">
                                    Сезонное ТО
                                  </span>
                                </div>

                                {/* Средний ряд: Иконка + Заголовок на всю ширину */}
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                                    {tireSeason.iconType === "winter" ? (
                                      <Snowflake size={20} className="text-blue-500" />
                                    ) : (
                                      <Sun size={20} className="text-amber-500" />
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="text-sm sm:text-base font-bold text-gray-900 leading-snug">
                                      {tireSeason.title}
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                      Своевременная замена резины и сезонное хранение шин на дилерском складе
                                    </p>
                                  </div>
                                </div>

                                {/* Нижний ряд: Симметричные кнопки 50/50 */}
                                <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-gray-100">
                                  <button
                                    type="button"
                                    onClick={handleToggleTireReminder}
                                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border flex items-center justify-center gap-1.5 active:scale-95 shadow-2xs ${
                                      tireReminderSubscribed
                                        ? "bg-[#f0f7e8] text-[#6fa02f] border-[#8cc63f]/50 font-bold"
                                        : "bg-white text-gray-700 border-gray-200 hover:border-[#8cc63f]"
                                    }`}
                                  >
                                    {tireReminderSubscribed ? (
                                      <>
                                        <BellRing size={13} className="text-[#6fa02f] shrink-0" />
                                        <span className="truncate">Напоминание вкл</span>
                                      </>
                                    ) : (
                                      <>
                                        <Bell size={13} className="text-gray-400 shrink-0" />
                                        <span className="truncate">Напомнить</span>
                                      </>
                                    )}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => navigate("/tires-wheels")}
                                    className="py-2 px-3 rounded-xl bg-white hover:bg-slate-50 border border-gray-200 text-[#425766] hover:text-[#76aa34] text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-2xs active:scale-95"
                                  >
                                    <span>Каталог шин</span>
                                    <ChevronRight size={13} className="text-[#8cc63f]" />
                                  </button>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Главная кнопка быстрой записи на сервис */}
                          <button
                            type="button"
                            onClick={() => {
                              navigate("/ServiceBooking", {
                                state: {
                                  car: activeCar,
                                  brand: activeCar.brand,
                                  model: activeCar.model,
                                  vin: activeCar.vin,
                                  plate: activeCar.plate,
                                },
                              });
                            }}
                            className="w-full py-3.5 px-4 rounded-xl bg-[#8cc63f] hover:bg-[#7ab82c] text-white font-bold text-sm sm:text-base shadow-sm shadow-[#8cc63f]/25 hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                          >
                            <Wrench size={18} strokeWidth={2.3} />
                            <span>Записаться на сервис онлайн</span>
                          </button>
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
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

            {/* Индикаторы слайдера */}
            {promoSlides.length > 1 && (
              <>
                {promoSlides.length <= 6 ? (
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
                ) : (
                  <>
                    <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-black/60 text-white text-xs font-semibold backdrop-blur-md shadow-xs">
                        {currentSlide + 1} / {promoSlides.length}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 pointer-events-none">
                      <div
                        className="h-full bg-[#8cc63f] transition-all duration-300"
                        style={{
                          width: `${((currentSlide + 1) / promoSlides.length) * 100}%`,
                        }}
                      />
                    </div>
                  </>
                )}
              </>
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
        </section>

        {/* ====================================================
            5. УСЛУГИ АВТОЦЕНТРА (ПЛОСКИЙ ПРОСТОРНЫЙ ГРИД)
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
