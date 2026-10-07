// Адаптер для VK Mini Apps
export const vkAdapter = {
  platform: "vk",
  _user: null,

  init(callback) {
    try {
      if (typeof window !== "undefined" && window.vkBridge) {
        // Инициализация VK Mini App
        window.vkBridge.send("VKWebAppInit").catch(() => {});

        // Запрашиваем официальные данные пользователя у VK Bridge
        window.vkBridge
          .send("VKWebAppGetUserInfo")
          .then((data) => {
            if (data && (data.id || data.first_name)) {
              this._user = {
                id: data.id || this.getId(),
                firstName: data.first_name || "",
                lastName: data.last_name || "",
                username: data.screen_name || "",
                photo: data.photo_200 || data.photo_100 || "",
                language: data.language || "ru",
                platform: "vk",
              };
              try {
                localStorage.setItem("vk_user", JSON.stringify(this._user));
                localStorage.setItem("pragmatika_user", JSON.stringify(this._user));
              } catch (e) {}
            }
            if (callback) callback(this.getUser());
          })
          .catch((err) => {
            console.warn("VKWebAppGetUserInfo error:", err);
            if (callback) callback(this.getUser());
          });
      } else {
        if (callback) callback(this.getUser());
      }
    } catch (e) {
      console.warn("VK Init error:", e);
      if (callback) callback(this.getUser());
    }
  },

  getUser() {
    // Если уже есть полноценный пользователь с именем, возвращаем
    if (this._user && (this._user.firstName || this._user.first_name)) {
      return this._user;
    }

    // 1. Проверяем кэш VK или сохраненного пользователя
    try {
      const cached = localStorage.getItem("vk_user") || localStorage.getItem("pragmatika_user");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && (parsed.id || parsed.firstName || parsed.first_name)) {
          this._user = {
            id: parsed.id || parsed.vk_user_id || this.getId(),
            firstName: parsed.firstName || parsed.first_name || "",
            lastName: parsed.lastName || parsed.last_name || "",
            username: parsed.username || parsed.screen_name || "",
            photo: parsed.photo || parsed.photo_200 || parsed.photo_100 || "",
            platform: "vk",
          };
          if (this._user.firstName) return this._user;
        }
      }
    } catch (e) {}

    // 2. Проверяем URL search params от VK и общие query params
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace("#", "?"));
      const vkId =
        params.get("vk_user_id") ||
        hashParams.get("vk_user_id") ||
        params.get("id") ||
        params.get("user_id") ||
        params.get("userId");

      const firstName =
        params.get("first_name") ||
        params.get("firstName") ||
        params.get("name") ||
        hashParams.get("first_name") ||
        hashParams.get("name") ||
        "";

      const lastName =
        params.get("last_name") ||
        params.get("lastName") ||
        hashParams.get("last_name") ||
        "";

      const photo =
        params.get("photo") ||
        params.get("avatar") ||
        params.get("photo_200") ||
        "";

      if (vkId || firstName) {
        this._user = {
          id: vkId ? (Number(vkId) || vkId) : 123456,
          firstName,
          lastName,
          username: params.get("username") || params.get("screen_name") || "",
          photo,
          platform: "vk",
        };
        return this._user;
      }
    }

    return this._user;
  },

  getId() {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace("#", "?"));
      const vkId =
        params.get("vk_user_id") ||
        hashParams.get("vk_user_id") ||
        params.get("id") ||
        params.get("user_id") ||
        params.get("userId");
      if (vkId) return vkId;
    }

    const u = this.getUser();
    return u?.id || null;
  },

  isMax() {
    return false;
  },

  getStartParam() {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("vk_ref") || null;
    }
    return null;
  },

  showAlert(text) {
    if (window.vkBridge) {
      window.vkBridge.send("VKWebAppShowToast", { message: text }).catch(() => {});
    }
  },

  haptic(type = "light") {
    try {
      if (window.vkBridge) {
        window.vkBridge.send("VKWebAppTapticImpactOccurred", { style: type }).catch(() => {});
      }
    } catch (e) {}
  },
};
