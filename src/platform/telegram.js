import WebApp from "@twa-dev/sdk";

export const telegramAdapter = {
  platform: "telegram",

  init(callback) {
    try {
      WebApp.ready?.();
      WebApp.expand?.();
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready?.();
        window.Telegram.WebApp.expand?.();
      }
    } catch (e) {
      console.warn("Telegram init error:", e);
    }
    const user = this.getUser();
    if (callback) callback(user);
    return user;
  },

  getUser() {
    const raw =
      WebApp.initDataUnsafe?.user ||
      window.Telegram?.WebApp?.initDataUnsafe?.user;

    if (!raw) return null;

    return {
      id: raw.id,
      firstName: raw.first_name || "",
      first_name: raw.first_name || "",
      lastName: raw.last_name || "",
      last_name: raw.last_name || "",
      username: raw.username || "",
      photo: raw.photo_url || "",
      language: raw.language_code || "ru",
      platform: "telegram",
    };
  },

  // ← универсальный метод получения ID
  getId() {
    const user = this.getUser();
    return user?.id || null;
  },

  // ← безопасная проверка платформы
  isMax() {
    return false; // Telegram никогда не Max
  },

  getStartParam() {
    return (
      WebApp.initDataUnsafe?.start_param ||
      window.Telegram?.WebApp?.initDataUnsafe?.start_param ||
      null
    );
  },

  showAlert(text) {
    try {
      if (WebApp.showAlert) {
        WebApp.showAlert(text);
      } else if (window.Telegram?.WebApp?.showAlert) {
        window.Telegram.WebApp.showAlert(text);
      } else {
        alert(text);
      }
    } catch {
      alert(text);
    }
  },

  haptic(type = "light") {
    try {
      const hapticFeedback =
        WebApp.HapticFeedback || window.Telegram?.WebApp?.HapticFeedback;
      if (hapticFeedback) {
        if (type === "success") {
          hapticFeedback.notificationOccurred("success");
        } else {
          hapticFeedback.impactOccurred(type);
        }
      }
    } catch {}
  },

  openSupport(payload) {
    const url = `https://t.me/pragmatikabot?start=${payload}`;
    if (window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(url);
    } else {
      window.open(url, "_blank");
    }
  },
};
