import { DOMParser, XMLSerializer } from "xmldom";

const FEED_URL = "https://export.maxposter.ru/dealer-export/10558-192314.xml";

// 🧠 кеш в памяти
let cachedCount = null;
let cachedAt = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 минут

export default async function handler(req, res) {
  const now = Date.now();

  // 🚀 1. САМЫЙ ПЕРВЫЙ БЛОК — мгновенный ответ из кеша
  if (
    req.query.count === "1" &&
    cachedCount !== null &&
    now - cachedAt < CACHE_TTL
  ) {
    res.setHeader("Cache-Control", "public, max-age=300");
    return res.status(200).json({ count: cachedCount });
  }

  try {
    // ⬇️ 2. XML загружаем ТОЛЬКО если кеша нет
    const response = await fetch(FEED_URL);
    if (!response.ok) {
      throw new Error("Ошибка загрузки фида с пробегом");
    }

    const xmlText = await response.text();
    const doc = new DOMParser().parseFromString(xmlText, "text/xml");

    // 🔴 ВАЖНО: vehicle, а не offer
    const vehicles = Array.from(doc.getElementsByTagName("vehicle"));

    // 💾 обновляем кеш
    cachedCount = vehicles.length;
    cachedAt = now;

    // 🔁 3. Если нужен только счётчик — сразу возвращаем
    if (req.query.count === "1") {
      res.setHeader("Cache-Control", "public, max-age=300");
      return res.status(200).json({ count: cachedCount });
    }

    // ⬇️ 4. Обычная сборка XML (для ShowcaseUsed)
    const serializer = new XMLSerializer();
    const vehiclesXmlText = vehicles
      .map((v) => serializer.serializeToString(v))
      .join("\n");

    const finalXml = `<?xml version="1.0" encoding="UTF-8"?>
<vehicles>
${vehiclesXmlText}
</vehicles>`;

    res.setHeader("Cache-Control", "public, max-age=300");
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.status(200).send(finalXml);
  } catch (error) {
    console.error("Ошибка fetch-feed-used:", error.message);
    res.status(500).json({ error: error.message });
  }
}
