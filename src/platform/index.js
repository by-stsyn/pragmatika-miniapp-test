import { telegramAdapter } from "./telegram";
import { maxAdapter } from "./max";

// Проверка среды
const isMAX = !!window.WebApp && window.WebApp.initDataUnsafe?.user;
const isTelegram = !!window.Telegram?.WebApp && !isMAX;

// Фолбэк для локальной разработки
if (!isMAX && !isTelegram) {
  window.WebApp = {
    initDataUnsafe: {
      user: {
        id: 123456,
        first_name: "Test",
        last_name: "User",
        username: "testuser",
      },
      start_param: "local_test",
    },
    ready: (cb) => cb(),
    expand: () => {},
    showAlert: (msg) => console.log("ALERT:", msg),
  };
}

// Выбираем адаптер
export const platform = isMAX
  ? maxAdapter
  : isTelegram
  ? telegramAdapter
  : {
      init: (cb) => cb?.(),
      getUser: () => ({
        id: 123456,
        firstName: "Test",
        lastName: "User",
        username: "testuser",
        language: "ru",
        photo: "",
      }),
      getStartParam: () => "local_test",
      showAlert: (msg) => console.log("ALERT:", msg),
      isMax: () => false,
      platform: "local",
    };

// Унифицированная инициализация
if (platform.init) {
  const originalInit = platform.init;
  platform.init = (callback) => {
    originalInit(() => {
      if (callback) callback(platform.getUser());
    });
  };
}

// Унифицированный метод получения пользователя
if (platform.getUser) {
  const originalGetUser = platform.getUser;
  platform.getUser = () => {
    const user = originalGetUser();
    if (!user) return null;
    return {
      id: user.id,
      firstName: user.first_name || user.firstName || "",
      lastName: user.last_name || user.lastName || "",
      username: user.username || "",
      language: user.language_code || user.language || "",
      photo: user.photo_url || user.photo || "",
    };
  };
}

// --- ДОБАВЛЯЕМ УНИВЕРСАЛЬНЫЙ МЕТОД getId ---
platform.getId = () => {
  if (isTelegram) {
    const user = platform.getUser();
    return user?.id || null; // Telegram ID
  }
  if (isMAX) {
    // Для MAX используем chat.id, если бэкенд ожидает именно его
    return window.WebApp.initDataUnsafe?.chat?.id || platform.getUser()?.id || null;
  }
  // Локальный тест
  return 123456;
};

// Унифицированное открытие бота
platform.openSupport = (payload) => {
  if (isTelegram) {
    const url = `https://t.me/pragmatikabot?start=${payload}`;
    window.Telegram.WebApp.openTelegramLink(url);
    return;
  }

  if (isMAX) {
    const url = `https://max.ru/id7816561934_bot?start=${payload}`;
    window.WebApp.openLink(url);
    return;
  }

  window.open(`https://t.me/pragmatikabot?start=${payload}`, "_blank");
};
