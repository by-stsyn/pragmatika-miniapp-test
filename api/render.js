export default async function handler(req, res) {
  try {
    const path = req.query.path || "";

    const query = new URLSearchParams(req.query);
    query.delete("path");

    // Нормализация параметров для 1С CRM:
    // Бэкенд 1C требует telegramId или maxId.
    const effectiveId =
      query.get("telegramId") ||
      query.get("maxId") ||
      query.get("vk_user_id") ||
      query.get("userId") ||
      query.get("user_id") ||
      query.get("id");

    if (effectiveId) {
      // Для эндпоинтов api/profile/cars... бэкенд строго требует telegramId
      if (path.startsWith("api/profile/car") && !query.get("telegramId")) {
        query.set("telegramId", effectiveId);
      }
      // Для communication/contact/... если нет ни telegramId, ни maxId
      if (path.startsWith("communication/contact/") && !query.get("telegramId") && !query.get("maxId")) {
        query.set("telegramId", effectiveId);
      }
    }

    const targetUrl =
      `https://render-a0lw.onrender.com/${path}` +
      (query.toString() ? "?" + query.toString() : "");

    const options = {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    // Передаём body для POST/PUT/PATCH
    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      // Если в теле запроса передан id/vk_user_id, но нет telegramId для машины
      let bodyData = req.body;
      if (path.startsWith("api/profile/car") && bodyData && !bodyData.telegramId && effectiveId) {
        bodyData = { ...bodyData, telegramId: effectiveId };
      }
      options.body = JSON.stringify(bodyData);
    }

    const response = await fetch(targetUrl, options);
    const text = await response.text();

    res.status(response.status).send(text);
  } catch (error) {
    console.error("PROXY ERROR:", error);
    res.status(500).json({
      error: error.message,
    });
  }
}
