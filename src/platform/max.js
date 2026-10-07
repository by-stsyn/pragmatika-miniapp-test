export const maxAdapter = {
  platform: "max",

  init(callback) {
    const webApp = window.WebApp || window.MaxWebApp;
    if (!webApp) {
      console.warn("MAX WebApp SDK not loaded");
    }

    try {
      webApp?.ready?.(() => {
        if (callback) callback(this.getUser());
      });
      webApp?.expand?.();
    } catch (e) {}

    const user = this.getUser();
    if (callback) callback(user);
    return user;
  },

  getUser() {
    const webApp = window.WebApp || window.MaxWebApp;
    const user = webApp?.initDataUnsafe?.user;
    if (!user) return null;
    return {
      id: user.id,
      firstName: user.first_name || "",
      first_name: user.first_name || "",
      lastName: user.last_name || "",
      last_name: user.last_name || "",
      username: user.username || "",
      language: user.language_code || "ru",
      photo: user.photo_url || "",
      platform: "max",
    };
  },

  getId() {
    const user = this.getUser();
    return user?.id || null;
  },

  isMax() {
    return true;
  },

  getStartParam() {
    const webApp = window.WebApp || window.MaxWebApp;
    return webApp?.initDataUnsafe?.start_param || null;
  },

  showAlert(text) {
    const webApp = window.WebApp || window.MaxWebApp;
    webApp?.showAlert?.(text) || alert(text);
  },

  openSupport(payload) {
    const url = `https://max.ru/id7816561934_bot?start=${payload}`;
    const webApp = window.WebApp || window.MaxWebApp;
    webApp?.openLink?.(url) || window.open(url, "_blank");
  },
};
