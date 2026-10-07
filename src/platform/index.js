import { telegramAdapter } from "./telegram";
import { maxAdapter } from "./max";
import { vkAdapter } from "./vk";

// Проверка среды
const search = typeof window !== "undefined" ? window.location.search || "" : "";
const hash = typeof window !== "undefined" ? window.location.hash || "" : "";

// 1. Telegram Mini App
const isTelegram =
  typeof window !== "undefined" &&
  (!!window.Telegram?.WebApp?.initDataUnsafe?.user ||
    !!window.Telegram?.WebApp?.initData ||
    search.includes("tgWebAppData") ||
    search.includes("telegramId"));

// 2. MAX Mini App
const isMAX =
  !isTelegram &&
  typeof window !== "undefined" &&
  (!!window.WebApp?.initDataUnsafe?.user ||
    !!window.MaxWebApp?.initDataUnsafe?.user ||
    search.includes("maxId") ||
    search.includes("max_user_id"));

// 3. VK Mini App (проверяем реальные параметры VK, а не просто наличие подключенного скрипта)
const isVK =
  !isTelegram &&
  !isMAX &&
  typeof window !== "undefined" &&
  (search.includes("vk_user_id") ||
    search.includes("vk_app_id") ||
    hash.includes("vk_user_id") ||
    document.referrer?.includes("vk.com") ||
    (typeof window.vkBridge !== "undefined" && (search.includes("vk_") || hash.includes("vk_"))));

// Базовый веб-адаптер с поддержкой URL-параметров и LocalStorage
const createWebAdapter = () => {
  const getParams = () => {
    if (typeof window === "undefined") return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  };

  const getSavedUser = () => {
    try {
      const saved = localStorage.getItem("pragmatika_user") || sessionStorage.getItem("pragmatika_user");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  };

  return {
    platform: "web",
    init(cb) {
      if (cb) cb(this.getUser());
    },

    getUser() {
      const params = getParams();
      const saved = getSavedUser();

      // Читаем параметры из URL
      const id =
        params.get("id") ||
        params.get("user_id") ||
        params.get("userId") ||
        params.get("telegramId") ||
        params.get("vk_user_id") ||
        saved?.id ||
        123456;

      const firstName =
        params.get("first_name") ||
        params.get("firstName") ||
        params.get("name") ||
        saved?.firstName ||
        saved?.first_name ||
        "";

      const lastName =
        params.get("last_name") ||
        params.get("lastName") ||
        saved?.lastName ||
        saved?.last_name ||
        "";

      const phone =
        params.get("phone") ||
        saved?.phone ||
        "";

      const photo =
        params.get("photo") ||
        params.get("avatar") ||
        saved?.photo ||
        "";

      return {
        id: Number(id) || id,
        firstName,
        lastName,
        phone,
        photo,
        language: "ru",
        platform: "web",
      };
    },

    getId() {
      const user = this.getUser();
      return user?.id || 123456;
    },

    isMax() {
      return false;
    },

    getStartParam() {
      const params = getParams();
      return params.get("start") || null;
    },

    showAlert(msg) {
      console.log("ALERT:", msg);
    },
  };
};

// Выбираем адаптер по приоритету
const rawPlatform = isTelegram
  ? telegramAdapter
  : isMAX
  ? maxAdapter
  : isVK
  ? vkAdapter
  : createWebAdapter();

// Подписчики на обновление профиля пользователя
const userSubscribers = new Set();

export const platform = {
  ...rawPlatform,

  // Подписка на обновление данных пользователя
  subscribe(callback) {
    if (typeof callback !== "function") return () => {};
    userSubscribers.add(callback);
    const currentUser = platform.getUser();
    if (currentUser) {
      try {
        callback(currentUser);
      } catch (e) {
        console.error("Subscriber error:", e);
      }
    }
    return () => userSubscribers.delete(callback);
  },

  // Оповестить всех подписчиков
  notifySubscribers(user) {
    const data = user || platform.getUser();
    userSubscribers.forEach((cb) => {
      try {
        cb(data);
      } catch (e) {
        console.error("Notify error:", e);
      }
    });
  },

  // Единая инициализация с коллбеком
  init(callback) {
    if (rawPlatform.init) {
      rawPlatform.init((user) => {
        const resolved = platform.getUser();
        platform.notifySubscribers(resolved);
        if (callback) callback(resolved);
      });
    } else {
      const resolved = platform.getUser();
      platform.notifySubscribers(resolved);
      if (callback) callback(resolved);
    }
  },

  // Унифицированный метод получения пользователя со всеми фолбэками
  getUser() {
    let user = rawPlatform.getUser?.();

    // 1. Если платформа не вернула данные или вернула пустые, проверяем LocalStorage
    if (!user || (!user.firstName && !user.first_name)) {
      try {
        const cached = localStorage.getItem("pragmatika_user") || localStorage.getItem("vk_user") || sessionStorage.getItem("pragmatika_user");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && (parsed.firstName || parsed.first_name || parsed.id)) {
            user = { ...parsed, ...(user || {}) };
            if (!user.firstName && parsed.firstName) user.firstName = parsed.firstName;
            if (!user.first_name && (parsed.first_name || parsed.firstName)) user.first_name = parsed.first_name || parsed.firstName;
            if (!user.lastName && parsed.lastName) user.lastName = parsed.lastName;
            if (!user.last_name && (parsed.last_name || parsed.lastName)) user.last_name = parsed.last_name || parsed.lastName;
            if (!user.id && parsed.id) user.id = parsed.id;
          }
        }
      } catch (e) {}
    }

    // 2. Проверяем параметры строки URL (?name=... / ?first_name=... / ?id=... / ?vk_user_id=...)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace("#", "?"));

      const urlName =
        params.get("name") ||
        params.get("first_name") ||
        params.get("firstName") ||
        params.get("client_name") ||
        hashParams.get("name") ||
        hashParams.get("first_name");

      const urlLastName =
        params.get("last_name") ||
        params.get("lastName") ||
        hashParams.get("last_name");

      const urlPhone =
        params.get("phone") ||
        params.get("telephone") ||
        hashParams.get("phone");

      const urlId =
        params.get("vk_user_id") ||
        hashParams.get("vk_user_id") ||
        params.get("telegramId") ||
        params.get("id") ||
        params.get("user_id") ||
        params.get("userId") ||
        hashParams.get("id");

      if (urlName || urlId) {
        user = {
          ...(user || {}),
          id: user?.id || urlId || 123456,
          firstName: urlName || user?.firstName || user?.first_name || "",
          first_name: urlName || user?.firstName || user?.first_name || "",
          lastName: urlLastName || user?.lastName || user?.last_name || "",
          last_name: urlLastName || user?.lastName || user?.last_name || "",
          phone: urlPhone || user?.phone || "",
        };
      }
    }

    if (!user) {
      const fallbackId = platform.getId();
      return {
        id: fallbackId,
        firstName: "",
        first_name: "",
        lastName: "",
        last_name: "",
        username: "",
        phone: "",
        photo: "",
        platform: rawPlatform.platform || "web",
      };
    }

    return {
      id: user.id || platform.getId(),
      firstName: user.firstName || user.first_name || "",
      first_name: user.firstName || user.first_name || "",
      lastName: user.lastName || user.last_name || "",
      last_name: user.lastName || user.last_name || "",
      username: user.username || "",
      phone: user.phone || "",
      photo: user.photo_url || user.photo || user.photo_200 || user.photo_100 || "",
      platform: rawPlatform.platform || "web",
    };
  },

  // Универсальный ID для бэкенда
  getId() {
    // 1. Проверяем URL параметры (в первую очередь явный telegramId или maxId)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace("#", "?"));
      const urlId =
        params.get("telegramId") ||
        hashParams.get("telegramId") ||
        params.get("maxId") ||
        hashParams.get("maxId") ||
        params.get("vk_user_id") ||
        hashParams.get("vk_user_id") ||
        params.get("id") ||
        params.get("user_id") ||
        params.get("userId");
      if (urlId) return urlId;
    }

    // 2. Проверяем адаптер платформы
    if (rawPlatform.getId) {
      const id = rawPlatform.getId();
      if (id) return id;
    }

    // 3. Проверяем сохраненного пользователя
    try {
      const explicitId = localStorage.getItem("pragmatika_user_id");
      if (explicitId) return explicitId;
      const saved = localStorage.getItem("pragmatika_user") || localStorage.getItem("vk_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.id) return parsed.id;
      }
    } catch (e) {}

    // Фолбэк для разработки
    return 123456;
  },

  // Сохранить или обновить данные пользователя
  setUser(updates) {
    if (!updates) return;
    try {
      const current = platform.getUser() || {};
      const merged = { ...current, ...updates };
      if (updates.firstName && !updates.first_name) merged.first_name = updates.firstName;
      if (updates.first_name && !updates.firstName) merged.firstName = updates.first_name;
      if (updates.lastName && !updates.last_name) merged.last_name = updates.lastName;
      if (updates.last_name && !updates.lastName) merged.lastName = updates.last_name;

      localStorage.setItem("pragmatika_user", JSON.stringify(merged));
      sessionStorage.setItem("pragmatika_user", JSON.stringify(merged));
      platform.notifySubscribers(merged);
    } catch (e) {}
  },

  // Обогащение данными клиента из CRM (1C)
  updateFromClientInfo(client) {
    if (!client) return;
    const current = platform.getUser() || {};
    const updates = {};

    if (client.name) {
      const parts = client.name.trim().split(/\s+/);
      // Если у нас ещё нет имени или стоит временное/дефолтное
      if (!current.firstName || current.firstName === "Клиент") {
        updates.firstName = parts[0] || client.name;
        updates.first_name = parts[0] || client.name;
        if (parts.length > 1) {
          updates.lastName = parts.slice(1).join(" ");
          updates.last_name = parts.slice(1).join(" ");
        }
      }
    }
    if (client.telephone && !current.phone) {
      updates.phone = client.telephone;
    }

    if (Object.keys(updates).length > 0) {
      platform.setUser(updates);
    }
  },

  // Haptic feedback
  haptic(type = "light") {
    try {
      if (rawPlatform.haptic) {
        rawPlatform.haptic(type);
        return;
      }
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(type === "success" ? [15, 30, 15] : 10);
      }
    } catch (e) {}
  },

  // Открытие бота / поддержки
  openSupport(payload) {
    if (rawPlatform.openSupport) {
      rawPlatform.openSupport(payload);
      return;
    }
    if (typeof window !== "undefined") {
      window.open(`https://t.me/pragmatikabot?start=${payload}`, "_blank");
    }
  },
};
