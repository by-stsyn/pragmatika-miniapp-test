import React, { useState, useEffect, useCallback, memo } from "react";
import { platform } from "./platform";
import { useNavigate } from "react-router-dom";
import InputMask from "react-input-mask";
import BottomNav from "/src/components/BottomNav";

/* =====================
   UI компоненты
===================== */

const Section = memo(({ title, children }) => (
  <div className="bg-white rounded-xl shadow-md p-4 mb-6">
    <h2 className="text-xl font-bold mb-4 text-gray-700">{title}</h2>
    <div className="flex flex-col gap-3">{children}</div>
  </div>
));

const AppButton = memo(({ label, onClick, disabled = false, count }) => {
  const handleClick = useCallback(
    (e) => {
      e.preventDefault();
      if (!disabled && onClick) onClick();
    },
    [onClick, disabled]
  );

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg shadow-sm transition-colors flex items-center justify-between ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <span>{label}</span>

      {typeof count === "number" && (
        <span className="ml-3 px-3 py-1 rounded-md bg-[#85bc3c] text-white text-sm font-semibold">
          {count}
        </span>
      )}
    </button>
  );
});

/* =====================
   Основной компонент
===================== */

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState(null);

 

  const navigate = useNavigate();

  const [newCount, setNewCount] = useState(null);

  const [usedCount, setUsedCount] = useState(null);

  /* Telegram WebApp init */
 useEffect(() => {
  const init = async () => {
    try {
      const userData = platform.getUser();

      if (userData) {
        // Используем поля, которые реально возвращает platform.getUser()
        setUser({
          first_name: userData.firstName || "Пользователь",
          last_name: userData.lastName || "",
        });
      } else {
        setUser({
          first_name: "Пользователь",
          last_name: "",
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

  
/* =====================
   Загрузка количества авто
===================== */
useEffect(() => {
  const loadCounts = async () => {
    const now = Date.now();

    const loadCount = async (url, storageKey, setCount, label) => {
      try {
        const cached = localStorage.getItem(storageKey);
        const lastUpdate = Number(
          localStorage.getItem(`${storageKey}UpdatedAt`)
        );

        // Используем отдельный кэш для каждого счётчика
        if (
          cached !== null &&
          Number.isFinite(Number(cached)) &&
          Number.isFinite(lastUpdate) &&
          now - lastUpdate < 5 * 60 * 1000
        ) {
          setCount(Number(cached));
          return;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const value = Number(data.count);

        if (!Number.isFinite(value)) {
          throw new Error(`Некорректное количество: ${data.count}`);
        }

        setCount(value);
        localStorage.setItem(storageKey, String(value));
        localStorage.setItem(
          `${storageKey}UpdatedAt`,
          String(now)
        );

        console.log(`${label}:`, value);
      } catch (error) {
        console.error(`Ошибка загрузки (${label}):`, error);

        // Если есть старое корректное значение — показываем его
        const cached = Number(localStorage.getItem(storageKey));
        if (Number.isFinite(cached)) {
          setCount(cached);
        }
      }
    };

    await Promise.all([
      loadCount(
        "/api/fetch-feed-all?count=1",
        "newCount",
        setNewCount,
        "Новые автомобили"
      ),
      loadCount(
        "/api/fetch-feed-used?count=1",
        "usedCount",
        setUsedCount,
        "Автомобили с пробегом"
      ),
    ]);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8cc63f]" />
      </div>
    );
  }

  if (initError) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <p className="text-red-500 text-center">{initError}</p>
      </div>
    );
  }

  return (
    <div className="p-6 pb-[90px] bg-gray-50 min-h-screen">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Автоцентр Прагматика
        </h1>
        {user && (
          <p className="text-sm text-gray-600 mt-1">
            Добро пожаловать, {user.first_name}!
          </p>
        )}
      </header>

      <Section title="Покупка">
        <AppButton
          label="🚗 Новые автомобили"
          count={newCount}
          onClick={navigateTo("/Showcase")}
        />

        <AppButton
          label="🚙 Автомобили с пробегом"
          count={usedCount}
          onClick={() => {
            localStorage.removeItem("usedFilters");
            localStorage.removeItem("usedVisibleCount");
            localStorage.removeItem("scrollToUsedCarId");
            navigate("/ShowcaseUsed");
          }}
        />
      </Section>

      <Section title="Обслуживание">
        <AppButton
          label="🛠 Запись на сервис"
          onClick={navigateTo("/ServiceBooking")}
        />
        <AppButton
          label="🔘 Шины и диски"
          onClick={navigateTo("/tires-wheels")}
        />
      </Section>

      <Section title="Прагматика">
        <AppButton label="🎁 Акции и предложения" onClick={navigateTo("/offers")} />
        <AppButton label="📰 Новости Прагматика" onClick={navigateTo("/NewsList")} />
        <AppButton label="💼 Профиль" onClick={navigateTo("/ProfilePage")} />
        <AppButton label="💳 Бонусный счёт" onClick={navigateTo("/BonusPage")} />
      </Section>

       <Section title="Зона отдыха">
        <AppButton label="🚘 Автозмейка" onClick={navigateTo("/snake")} />
      
      </Section>

      <BottomNav />
    </div>
  );
}
