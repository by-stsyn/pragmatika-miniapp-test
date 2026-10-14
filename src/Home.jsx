import React, { useState, useEffect, useCallback, memo } from "react";
import { platform } from "./platform";
import { useNavigate } from "react-router-dom";
import BottomNav from "/src/components/BottomNav";
import {
  Car,
  Sparkles,
  Wrench,
  Disc,
  Tag,
  CreditCard,
  Newspaper,
  Gamepad2,
  ChevronRight,
  ArrowUpRight,
  User,
  Plus,
  ShieldCheck,
  RefreshCw,
  CheckCircle,
  X,
  Check,
} from "lucide-react";

const BASE_URL = "https://telegram-miniapp-orpin.vercel.app/api/render";

/* ==========================================================================
   Главный экран — Pragmatika Auto
   ========================================================================== */
export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState(null);

  /* Бонусы и автомобиль пользователя */
  const [userBonus, setUserBonus] = useState(null);
  const [userCar, setUserCar] = useState(null);

  /* Модальное окно Trade-in экспресс-оценки */
  const [isTradeInModalOpen, setIsTradeInModalOpen] = useState(false);
  const [tradeInForm, setTradeInForm] = useState({
    carName: "",
    vin: "",
    mileage: "",
    name: "",
    phone: "",
  });
  const [tradeInSubmitting, setTradeInSubmitting] = useState(false);
  const [tradeInSuccess, setTradeInSuccess] = useState(false);

  const navigate = useNavigate();

  const [newCount, setNewCount] = useState(() => {
    const cached = localStorage.getItem("newCount");
    return cached ? Number(cached) : null;
  });

  const [usedCount, setUsedCount] = useState(() => {
    const cached = localStorage.getItem("usedCount");
    return cached ? Number(cached) : null;
  });

  /* Инициализация пользователя Telegram / MAX */
  useEffect(() => {
    const init = async () => {
      try {
        const userData = platform.getUser();

        if (userData) {
          const first = userData.firstName || "Личный кабинет";
          const last = userData.lastName || "";
          setUser({
            first_name: first,
            last_name: last,
            photo: userData.photo || "",
            username: userData.username || "",
          });
          setTradeInForm((prev) => ({
            ...prev,
            name: `${first}${last ? ` ${last}` : ""}`,
          }));
        } else {
          setUser({
            first_name: "Личный кабинет",
            last_name: "",
            photo: "",
          });
        }
      } catch (err) {
        console.error("Initialization error:", err);
        setInitError("Не удалось инициализировать приложение");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  /* Загрузка бонусов и гаража пользователя */
  useEffect(() => {
    const userId = platform.getId();
    if (!userId) return;

    const idParam = platform?.isMax?.() ? "maxId" : "telegramId";

    // 1. Загрузка бонусов
    (async () => {
      try {
        const res = await fetch(
          `${BASE_URL}?path=communication/contact/bonus&${idParam}=${userId}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data?.card?.balance !== undefined) {
            setUserBonus(Number(data.card.balance));
          }
        }
      } catch (e) {
        console.warn("Бонусы не загружены:", e);
      }
    })();

    // 2. Загрузка автомобилей пользователя
    (async () => {
      try {
        const res = await fetch(
          `${BASE_URL}?path=api/profile/cars&telegramId=${userId}`
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.cars) && data.cars.length > 0) {
            const primaryCar = data.cars[0];
            setUserCar(primaryCar);
            setTradeInForm((prev) => ({
              ...prev,
              carName: `${primaryCar.brand} ${primaryCar.model}`,
              vin: primaryCar.vin || "",
            }));
          }
        }
      } catch (e) {
        console.warn("Гараж пользователя не загружен:", e);
      }
    })();
  }, []);

  /* Загрузка количества автомобилей (кэш 5 минут) */
  useEffect(() => {
    const loadCounts = async () => {
      try {
        const lastUpdate = Number(localStorage.getItem("countsUpdatedAt"));
        const now = Date.now();

        if (lastUpdate && now - lastUpdate < 5 * 60 * 1000) {
          return;
        }

        const [newRes, usedRes] = await Promise.all([
          fetch("/api/fetch-feed-all?count=1"),
          fetch("/api/fetch-feed-used?count=1"),
        ]);

        const newData = await newRes.json();
        const usedData = await usedRes.json();

        setNewCount(newData.count);
        setUsedCount(usedData.count);

        localStorage.setItem("newCount", newData.count);
        localStorage.setItem("usedCount", usedData.count);
        localStorage.setItem("countsUpdatedAt", now);
      } catch (e) {
        console.error(e);
      }
    };

    loadCounts();
  }, []);

  const navigateTo = useCallback(
    (path) => (e) => {
      e?.preventDefault();
      navigate(path);
    },
    [navigate]
  );

  const handleOpenUsed = useCallback(
    (e) => {
      e?.preventDefault();
      localStorage.removeItem("usedFilters");
      localStorage.removeItem("usedVisibleCount");
      localStorage.removeItem("scrollToUsedCarId");
      navigate("/ShowcaseUsed");
    },
    [navigate]
  );

  /* Открытие модалки Trade-in */
  const handleOpenTradeIn = useCallback(() => {
    if (userCar) {
      setTradeInForm((prev) => ({
        ...prev,
        carName: `${userCar.brand} ${userCar.model}`,
        vin: userCar.vin || "",
      }));
    }
    setTradeInSuccess(false);
    setIsTradeInModalOpen(true);
  }, [userCar]);

  /* Отправка заявки на Trade-in */
  const handleTradeInSubmit = async (e) => {
    e.preventDefault();
    if (!tradeInForm.phone) {
      alert("Пожалуйста, укажите контактный телефон");
      return;
    }

    setTradeInSubmitting(true);
    try {
      const res = await fetch("/api/send-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tradeInForm.name || "Клиент",
          phone: tradeInForm.phone,
          requestType: "Заявка на оценку авто (Trade-in)",
          model: `${tradeInForm.carName || "Автомобиль"} (Пробег: ${tradeInForm.mileage || "не указан"} км)`,
          vin: tradeInForm.vin || "Не указан",
        }),
      });

      if (res.ok) {
        setTradeInSuccess(true);
      } else {
        alert("Не удалось отправить заявку. Попробуйте позже.");
      }
    } catch (err) {
      console.error("Trade-in submit error:", err);
      alert("Ошибка сети. Попробуйте позже.");
    } finally {
      setTradeInSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#f8fafc]">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-11 w-11 border-2 border-slate-200 border-t-[#8cc63f]" />
          <img
            src="/logo-pragmatika-bez-fona.png"
            alt="Прагматика"
            className="absolute w-5 h-5 object-contain"
          />
        </div>
        <p className="mt-3.5 text-[11px] font-medium text-slate-400 tracking-wider uppercase">
          Загрузка…
        </p>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="flex justify-center items-center min-h-screen p-6 bg-[#f8fafc]">
        <div className="bg-white rounded-xl p-6 text-center max-w-sm border border-slate-200 shadow-sm">
          <p className="text-red-500 text-sm font-medium">{initError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#8cc63f] text-white text-xs font-semibold rounded-lg"
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  const fullName =
    user?.first_name && user.first_name !== "Пользователь"
      ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`
      : "Личный кабинет";

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-28">
      {/* ====================================================================
          1. ВЕРХНЯЯ ПАНЕЛЬ: Полный логотип
         ==================================================================== */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <img
              src="/logo-pragmatika.svg"
              alt="Прагматика"
              className="h-7 w-auto object-contain max-w-[170px]"
            />
          </div>

          <button
            onClick={navigateTo("/ProfilePage")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/90 active:scale-[0.98] transition-all"
            aria-label="Личный кабинет"
          >
            <span className="text-[12px] font-semibold text-slate-700">
              Кабинет
            </span>
            <ChevronRight size={13} className="text-slate-400" />
          </button>
        </div>
      </header>

      {/* ====================================================================
          ОСНОВНОЙ КОНТЕНТ (Mobile Frame)
         ==================================================================== */}
      <main className="max-w-md mx-auto px-4 pt-3.5 space-y-4">
        {/* ==================================================================
            2. МИНИ-ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ (User Profile Card)
           ================================================================== */}
        <section aria-label="Профиль пользователя">
          <div className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            {/* Верхняя строка: Аватар + Имя + Бонусы */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={navigateTo("/ProfilePage")}
                className="flex items-center gap-2.5 min-w-0 text-left active:opacity-80 transition-opacity"
              >
                <div className="w-11 h-11 rounded-full overflow-hidden border border-slate-200/80 bg-slate-100 flex items-center justify-center flex-shrink-0">
                  {user?.photo ? (
                    <img
                      src={user.photo}
                      alt={fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#8cc63f]/15 flex items-center justify-center text-[#5e8f23]">
                      <User size={19} strokeWidth={2} />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-slate-900 truncate leading-snug">
                    {fullName}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                    <span>Личный кабинет</span>
                    <ChevronRight size={12} className="text-slate-400" />
                  </div>
                </div>
              </button>

              {/* Бонусный бейдж в цвете #8cc63f */}
              <button
                onClick={navigateTo("/BonusPage")}
                className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#8cc63f]/15 hover:bg-[#8cc63f]/25 border border-[#8cc63f]/30 active:scale-95 transition-all text-[#5e8f23]"
                aria-label="Бонусный баланс"
              >
                <div className="text-right">
                  <span className="text-xs font-extrabold tabular-nums tracking-tight">
                    {userBonus !== null ? userBonus.toLocaleString("ru-RU") : "0"}
                  </span>
                  <span className="text-[10px] font-semibold ml-1">
                    баллов
                  </span>
                </div>
                <ChevronRight size={13} strokeWidth={2.5} />
              </button>
            </div>

            {/* Разделитель */}
            <div className="border-t border-slate-100 my-2.5" />

            {/* Блок автомобиля (Гараж) */}
            {userCar ? (
              <div className="space-y-2.5">
                {/* Карточка текущего автомобиля */}
                <div
                  onClick={navigateTo("/ProfilePage")}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100/90 border border-slate-200/70 cursor-pointer active:scale-[0.99] transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-md bg-[#8cc63f]/15 flex items-center justify-center text-[#5e8f23] flex-shrink-0">
                      <Car size={15} strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {userCar.brand} {userCar.model}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium tracking-wide">
                        {userCar.plate || "Госномер не указан"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-semibold text-[#6fa52c] flex-shrink-0 ml-2">
                    <span>В гараже</span>
                    <ChevronRight size={13} strokeWidth={2} />
                  </div>
                </div>

                {/* ============================================================
                    ДАШБОРД СОСТОЯНИЯ АВТОМОБИЛЯ (Что нужно моей машине)
                    По концепции руководства (Экран 1)
                   ============================================================ */}
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-2 px-0.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#5e8f23]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8cc63f]" />
                      <span>С автомобилем всё в порядке</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Ближайшие события
                    </span>
                  </div>

                  {/* Сетка из 4 триггеров жизненного цикла (CLM) */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* 1. Следующее ТО */}
                    <button
                      onClick={navigateTo("/ServiceBooking")}
                      className="p-2.5 rounded-lg bg-slate-50 hover:bg-[#8cc63f]/10 border border-slate-200/80 hover:border-[#8cc63f]/50 text-left active:scale-[0.98] transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="w-6 h-6 rounded-md bg-[#8cc63f]/15 flex items-center justify-center text-[#5e8f23]">
                          <Wrench size={13} strokeWidth={2} />
                        </div>
                        <ChevronRight size={12} className="text-slate-300" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-slate-800 leading-tight">
                          Запись на ТО
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          По регламенту
                        </div>
                      </div>
                    </button>

                    {/* 2. ОСАГО / КАСКО */}
                    <button
                      onClick={navigateTo("/ProfilePage")}
                      className="p-2.5 rounded-lg bg-slate-50 hover:bg-amber-50/60 border border-slate-200/80 hover:border-amber-300 text-left active:scale-[0.98] transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="w-6 h-6 rounded-md bg-amber-100/60 flex items-center justify-center text-amber-700">
                          <ShieldCheck size={13} strokeWidth={2} />
                        </div>
                        <ChevronRight size={12} className="text-slate-300" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-slate-800 leading-tight">
                          ОСАГО / КАСКО
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Проверить полис
                        </div>
                      </div>
                    </button>

                    {/* 3. Сезонные шины */}
                    <button
                      onClick={navigateTo("/tires-wheels")}
                      className="p-2.5 rounded-lg bg-slate-50 hover:bg-sky-50/60 border border-slate-200/80 hover:border-sky-300 text-left active:scale-[0.98] transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="w-6 h-6 rounded-md bg-sky-100/60 flex items-center justify-center text-sky-700">
                          <Disc size={13} strokeWidth={2} />
                        </div>
                        <ChevronRight size={12} className="text-slate-300" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-slate-800 leading-tight">
                          Смена шин
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Подбор и хранение
                        </div>
                      </div>
                    </button>

                    {/* 4. Оценка авто в Trade-in */}
                    <button
                      onClick={handleOpenTradeIn}
                      className="p-2.5 rounded-lg bg-slate-50 hover:bg-purple-50/60 border border-slate-200/80 hover:border-purple-300 text-left active:scale-[0.98] transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="w-6 h-6 rounded-md bg-purple-100/60 flex items-center justify-center text-purple-700">
                          <RefreshCw size={13} strokeWidth={2} />
                        </div>
                        <ChevronRight size={12} className="text-slate-300" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-slate-800 leading-tight">
                          Оценка в Trade-in
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Узнать цену за 2 мин
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={navigateTo("/ProfilePage")}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-50/80 hover:bg-slate-100 border border-dashed border-slate-200 hover:border-[#8cc63f] text-left active:scale-[0.99] transition-all"
                >
                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0">
                      <Plus size={13} strokeWidth={2.5} />
                    </div>
                    <span className="text-xs font-medium text-slate-700">
                      Добавить свой автомобиль в гараж
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#6fa52c] flex-shrink-0">
                    В гараж →
                  </span>
                </button>

                {/* Баннер экспресс-оценки Trade-in если авто еще не в профиле */}
                <button
                  onClick={handleOpenTradeIn}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gradient-to-r from-slate-50 to-[#8cc63f]/10 border border-slate-200/80 text-left active:scale-[0.99] transition-all"
                >
                  <div className="flex items-center gap-2">
                    <RefreshCw size={13} className="text-[#5e8f23]" />
                    <span className="text-[11px] font-semibold text-slate-800">
                      Хотите обменять автомобиль? Оценка в Trade-in
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#5e8f23]">
                    Оценить →
                  </span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ==================================================================
            3. КАТАЛОГ АВТОМОБИЛЕЙ (Hero Stock Cards: Новые / Пробег)
           ================================================================== */}
        <section aria-labelledby="catalog-heading">
          <div className="flex items-center justify-between mb-2 px-0.5">
            <h2
              id="catalog-heading"
              className="text-[11px] font-bold text-slate-400 uppercase tracking-wider"
            >
              Автомобили в наличии
            </h2>
            <span className="text-[11px] font-medium text-[#6fa52c]">
              Официальный дилер
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Карточка: Новые авто */}
            <button
              onClick={navigateTo("/Showcase")}
              className="group text-left relative overflow-hidden bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-[0_2px_6px_rgba(0,0,0,0.02)] hover:border-[#8cc63f] hover:shadow-md active:scale-[0.98] transition-all flex flex-col justify-between min-h-[142px]"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#8cc63f]/15 via-transparent to-transparent rounded-bl-3xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#8cc63f]/15 flex items-center justify-center text-[#5e8f23]">
                    <Car size={17} strokeWidth={1.8} />
                  </div>
                  <ArrowUpRight
                    size={15}
                    className="text-slate-300 group-hover:text-[#6fa52c] transition-colors"
                  />
                </div>
                <div className="font-bold text-slate-900 text-sm leading-snug">
                  Новые авто
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  С гарантией дилера
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-baseline justify-between">
                <span className="text-[11px] text-slate-400">В наличии:</span>
                <span className="text-base font-extrabold text-[#5e8f23] tabular-nums tracking-tight">
                  {newCount !== null ? newCount.toLocaleString("ru-RU") : "…"}
                </span>
              </div>
            </button>

            {/* Карточка: С пробегом */}
            <button
              onClick={handleOpenUsed}
              className="group text-left relative overflow-hidden bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-[0_2px_6px_rgba(0,0,0,0.02)] hover:border-[#8cc63f] hover:shadow-md active:scale-[0.98] transition-all flex flex-col justify-between min-h-[142px]"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-slate-200/50 via-transparent to-transparent rounded-bl-3xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                    <Sparkles size={17} strokeWidth={1.8} />
                  </div>
                  <ArrowUpRight
                    size={15}
                    className="text-slate-300 group-hover:text-[#6fa52c] transition-colors"
                  />
                </div>
                <div className="font-bold text-slate-900 text-sm leading-snug">
                  С пробегом
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Проверено по 100+ пунктам
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-baseline justify-between">
                <span className="text-[11px] text-slate-400">В наличии:</span>
                <span className="text-base font-extrabold text-slate-900 tabular-nums tracking-tight">
                  {usedCount !== null ? usedCount.toLocaleString("ru-RU") : "…"}
                </span>
              </div>
            </button>
          </div>
        </section>

        {/* ==================================================================
            4. СЕТКА СЕРВИСОВ И УСЛУГ (2x2 Quick Action Grid)
           ================================================================== */}
        <section aria-labelledby="services-heading">
          <div className="flex items-center justify-between mb-2 px-0.5">
            <h2
              id="services-heading"
              className="text-[11px] font-bold text-slate-400 uppercase tracking-wider"
            >
              Сервис и спецпредложения
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* 1. Запись на сервис */}
            <button
              onClick={navigateTo("/ServiceBooking")}
              className="group text-left bg-white rounded-xl p-3 border border-slate-200/90 shadow-[0_2px_6px_rgba(0,0,0,0.02)] hover:border-[#8cc63f] active:scale-[0.98] transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#8cc63f]/15 flex items-center justify-center text-[#5e8f23]">
                  <Wrench size={16} strokeWidth={1.8} />
                </div>
                <ChevronRight
                  size={14}
                  className="text-slate-300 group-hover:text-[#6fa52c] transition-colors"
                />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-[13px]">
                  Запись на сервис
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                  ТО и ремонт
                </div>
              </div>
            </button>

            {/* 2. Шины и диски */}
            <button
              onClick={navigateTo("/tires-wheels")}
              className="group text-left bg-white rounded-xl p-3 border border-slate-200/90 shadow-[0_2px_6px_rgba(0,0,0,0.02)] hover:border-[#8cc63f] active:scale-[0.98] transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-700">
                  <Disc size={16} strokeWidth={1.8} />
                </div>
                <ChevronRight
                  size={14}
                  className="text-slate-300 group-hover:text-[#6fa52c] transition-colors"
                />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-[13px]">
                  Шины и диски
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                  Каталог и монтаж
                </div>
              </div>
            </button>

            {/* 3. Акции и выгода */}
            <button
              onClick={navigateTo("/offers")}
              className="group text-left bg-white rounded-xl p-3 border border-slate-200/90 shadow-[0_2px_6px_rgba(0,0,0,0.02)] hover:border-[#8cc63f] active:scale-[0.98] transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
                  <Tag size={16} strokeWidth={1.8} />
                </div>
                <ChevronRight
                  size={14}
                  className="text-slate-300 group-hover:text-[#6fa52c] transition-colors"
                />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-[13px]">
                  Акции и выгода
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                  Специальные цены
                </div>
              </div>
            </button>

            {/* 4. Бонусный счёт */}
            <button
              onClick={navigateTo("/BonusPage")}
              className="group text-left bg-white rounded-xl p-3 border border-slate-200/90 shadow-[0_2px_6px_rgba(0,0,0,0.02)] hover:border-[#8cc63f] active:scale-[0.98] transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
                  <CreditCard size={16} strokeWidth={1.8} />
                </div>
                <ChevronRight
                  size={14}
                  className="text-slate-300 group-hover:text-[#6fa52c] transition-colors"
                />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-[13px]">
                  Бонусный счёт
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                  Баллы и баланс
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* ==================================================================
            5. ДОПОЛНИТЕЛЬНЫЕ РАЗДЕЛЫ: Новости & Развлечения
           ================================================================== */}
        <section aria-labelledby="more-heading">
          <div className="flex items-center justify-between mb-2 px-0.5">
            <h2
              id="more-heading"
              className="text-[11px] font-bold text-slate-400 uppercase tracking-wider"
            >
              Информация и сервисы
            </h2>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_2px_6px_rgba(0,0,0,0.02)] divide-y divide-slate-100 overflow-hidden">
            {/* Новости Прагматика */}
            <button
              onClick={navigateTo("/NewsList")}
              className="w-full text-left p-3 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
                  <Newspaper size={15} strokeWidth={1.8} />
                </div>
                <div>
                  <div className="text-[13px] font-bold text-slate-900">
                    Новости Прагматика
                  </div>
                  <div className="text-[11px] text-slate-500">
                    События холдинга и автомира
                  </div>
                </div>
              </div>
              <ChevronRight size={15} className="text-slate-300 flex-shrink-0" />
            </button>

            {/* Автозмейка */}
            <button
              onClick={navigateTo("/snake")}
              className="w-full text-left p-3 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#8cc63f]/15 flex items-center justify-center text-[#5e8f23] flex-shrink-0">
                  <Gamepad2 size={15} strokeWidth={1.8} />
                </div>
                <div>
                  <div className="text-[13px] font-bold text-slate-900">
                    Автозмейка
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Зона отдыха и мини-игра
                  </div>
                </div>
              </div>
              <ChevronRight size={15} className="text-slate-300 flex-shrink-0" />
            </button>
          </div>
        </section>
      </main>

      {/* ====================================================================
          МОДАЛЬНОЕ ОКНО: Экспресс-оценка в Trade-in
         ==================================================================== */}
      {isTradeInModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl border border-slate-200 relative">
            {/* Кнопка закрытия */}
            <button
              onClick={() => setIsTradeInModalOpen(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              aria-label="Закрыть"
            >
              <X size={15} />
            </button>

            {tradeInSuccess ? (
              <div className="py-6 text-center">
                <div className="w-12 h-12 rounded-full bg-[#8cc63f]/20 text-[#5e8f23] flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={28} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">
                  Заявка принята!
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-[260px] mx-auto">
                  Эксперт отдела Trade-in «Прагматика» рассчитает предварительную
                  стоимость и свяжется с вами.
                </p>
                <button
                  onClick={() => setIsTradeInModalOpen(false)}
                  className="mt-5 w-full py-2.5 rounded-xl bg-[#8cc63f] hover:bg-[#7db934] text-white text-xs font-bold transition-all shadow-sm"
                >
                  Понятно
                </button>
              </div>
            ) : (
              <form onSubmit={handleTradeInSubmit} className="space-y-3.5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-md bg-[#8cc63f]/15 flex items-center justify-center text-[#5e8f23]">
                      <RefreshCw size={13} strokeWidth={2} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Экспресс-оценка авто (Trade-in)
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Узнайте рыночную стоимость вашего авто и выгоду при обмене.
                  </p>
                </div>

                {/* Автомобиль */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Автомобиль
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Марка и модель (например, LADA Vesta)"
                    value={tradeInForm.carName}
                    onChange={(e) =>
                      setTradeInForm({ ...tradeInForm, carName: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#8cc63f] bg-slate-50/50"
                  />
                </div>

                {/* Пробег */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Текущий пробег (км)
                  </label>
                  <input
                    type="number"
                    placeholder="Например, 45 000"
                    value={tradeInForm.mileage}
                    onChange={(e) =>
                      setTradeInForm({ ...tradeInForm, mileage: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#8cc63f] bg-slate-50/50"
                  />
                </div>

                {/* Телефон */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Контактный телефон *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+7 (___) ___-__-__"
                    value={tradeInForm.phone}
                    onChange={(e) =>
                      setTradeInForm({ ...tradeInForm, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#8cc63f] bg-slate-50/50"
                  />
                </div>

                {/* Имя */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Ваше имя
                  </label>
                  <input
                    type="text"
                    placeholder="Имя"
                    value={tradeInForm.name}
                    onChange={(e) =>
                      setTradeInForm({ ...tradeInForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#8cc63f] bg-slate-50/50"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={tradeInSubmitting}
                    className="w-full py-2.5 rounded-xl bg-[#8cc63f] hover:bg-[#7db934] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-[0.98]"
                  >
                    {tradeInSubmitting ? (
                      <span>Отправка заявки…</span>
                    ) : (
                      <>
                        <span>Получить оценку</span>
                        <ChevronRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          ФИКСИРОВАННОЕ НИЖНЕЕ МЕНЮ
         ==================================================================== */}
      <BottomNav />
    </div>
  );
}
