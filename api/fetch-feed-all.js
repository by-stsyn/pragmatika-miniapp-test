import { DOMParser, XMLSerializer } from "xmldom";

const FEED_URL = "https://export.maxposter.ru/dealer-export/1983-38233.xml";
const CACHE_TTL = 5 * 60 * 1000; // 5 минут

let cachedXml = null;
let cachedCount = null;
let cachedAt = 0;

export default async function handler(req, res) {
  const now = Date.now();

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, max-age=300");

  // 1. Быстрый ответ из кеша для счетчика
  if (req.query.count === "1" && cachedCount !== null && now - cachedAt < CACHE_TTL) {
    return res.status(200).json({ count: cachedCount });
  }

  // 2. Быстрый ответ из кеша для полного XML
  if (req.query.count !== "1" && cachedXml !== null && now - cachedAt < CACHE_TTL) {
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    return res.status(200).send(cachedXml);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(FEED_URL, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 Pragmatika MiniApp",
        "Accept": "application/xml,text/xml,*/*",
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Ошибка загрузки фида: HTTP ${response.status}`);
    }

    const xmlText = await response.text();
    const doc = new DOMParser().parseFromString(xmlText, "text/xml");
    const vehicles = Array.from(doc.getElementsByTagName("vehicle"));

    cachedCount = vehicles.length;
    cachedXml = xmlText;
    cachedAt = now;

    if (req.query.count === "1") {
      return res.status(200).json({ count: cachedCount });
    }

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    return res.status(200).send(cachedXml);
  } catch (error) {
    console.error("fetch-feed-all error:", error.message);

    // Если есть даже устаревший кеш — возвращаем его вместо падения
    if (cachedXml) {
      if (req.query.count === "1") {
        return res.status(200).json({ count: cachedCount || 1177 });
      }
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      return res.status(200).send(cachedXml);
    }

    return res.status(500).json({ error: error.message });
  }
}
