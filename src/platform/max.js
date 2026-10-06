export const maxAdapter = {
  init(callback) {
    if (!window.WebApp) {
      console.warn("MAX WebApp SDK not loaded");
      console.log("MAX RAW INIT DATA:", window.WebApp?.initDataUnsafe);
      return;
    }

    window.WebApp.ready?.(() => {
      console.log("MAX ready");
      if (callback) callback();
    });

    window.WebApp.expand?.();
  },

  getUser() {
    const user = window.WebApp?.initDataUnsafe?.user;
    if (!user) return null;
    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      language: user.language_code,
      photo: user.photo_url,
    };
  },

    // ← добавляем сюда
  getId() {
    const user = this.getUser();
    return user?.id || null;
  },

  isMax() {
    return this.platform === "max" && !!this.getUser();
  },
  // ← конец добавленных методов

  getStartParam() {
    return window.WebApp?.initDataUnsafe?.start_param || null;
  },

  showAlert(text) {
    window.WebApp?.showAlert?.(text) || alert(text);
  },

  openSupport(payload) {
  const url = `https://max.ru/id7816561934_bot?start=${payload}`;
  window.WebApp?.openLink(url);
},

  platform: "max",
  
};
