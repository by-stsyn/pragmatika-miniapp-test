import WebApp from "@twa-dev/sdk";

export const telegramAdapter = {
  init() {
    WebApp.ready();
    WebApp.expand();
  },

  getUser() {
    return WebApp.initDataUnsafe?.user || null;
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
    return WebApp.initDataUnsafe?.start_param || null;
  },

  showAlert(text) {
    WebApp.showAlert(text);
  },

  openSupport(payload) {
    const url = `https://t.me/pragmatikabot?start=${payload}`;
    window.Telegram?.WebApp?.openTelegramLink(url);
  },

  platform: "telegram",
};
