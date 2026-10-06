// /api/fetch-news.js
import { XMLParser } from "fast-xml-parser";

export default async function handler(req, res) {
  const RSS_URL = "https://www.pragmaticar.ru/rss.xml"; // <- укажи реальный URL фида

  try {
    const response = await fetch(RSS_URL, { timeout: 10000 });
    if (!response.ok) {
      console.error("fetch-news: feed response not ok", response.status, response.statusText);
      return res.status(502).json({ error: "Не удалось получить RSS-фид", status: response.status });
    }

    const xmlText = await response.text();
    if (!xmlText || xmlText.trim().length === 0) {
      return res.status(204).json({ news: [] });
    }

    // Настройки парсера — сохраняем namespace content:encoded
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      // allow to keep content:encoded as key "content:encoded"
      removeNSPrefix: false,
      isArray: (name, jpath, isLeafNode, isAttribute) => {
        // force item to be array even если только одна запись
        if (name === "item") return true;
        return false;
      },
    });

    const parsed = parser.parse(xmlText);

    // Найти элементы item — поддерживаем разные корни: rss->channel->item или feed->entry (atom)
    let items = [];
    if (parsed?.rss?.channel) {
      const channel = parsed.rss.channel;
      // channel.item может быть массивой или одиночным объектом
      items = channel.item || [];
    } else if (parsed?.feed?.entry) {
      items = parsed.feed.entry || [];
    } else {
      // попытаемся найти любой item в дереве
      const maybeItems = parsed?.rss?.channel?.item || [];
      items = Array.isArray(maybeItems) ? maybeItems : (maybeItems ? [maybeItems] : []);
    }

    // Если items пустые — возвращаем пустой массив, но логируем
    if (!items || items.length === 0) {
      console.warn("fetch-news: no items found in feed");
      return res.status(200).json([]);
    }

    // Преобразуем каждый item в нужный формат
    const news = items.map((it) => {
      // В зависимости от парсера поля могут быть объектами или строками
      const title = it.title ?? (it["title"] ? it["title"] : "");
      const link = it.link?.["@_href"] ?? it.link ?? (Array.isArray(it.link) ? it.link[0] : "");
      // pubDate может быть pubDate или updated
      const pubDate = it.pubDate ?? it["pubDate"] ?? it.updated ?? it["updated"] ?? "";
      // description
      let description = "";
      if (it.description) {
        description = typeof it.description === "object" && "#text" in it.description ? it.description["#text"] : it.description;
      } else if (it["description"]) {
        description = it["description"];
      }

      // content:encoded (namespace key)
      const contentEncoded = it["content:encoded"] ?? it["content"] ?? "";

      // image: prefer enclosure@url, then thumbnail@url, then maybe media:content
      let image = "";
      if (it.enclosure?.["@_url"]) image = it.enclosure["@_url"];
      else if (it.thumbnail?.["@_url"]) image = it.thumbnail["@_url"];
      else if (it["media:content"]?.["@_url"]) image = it["media:content"]["@_url"];
      else if (it.enclosure && typeof it.enclosure === "string") image = it.enclosure;

      return {
        title: (typeof title === "object" && "#text" in title) ? title["#text"] : String(title || ""),
        link: String(link || ""),
        date: String(pubDate || ""),
        description: String((description || "").trim()),
        content: String((contentEncoded || "").trim()),
        image: String(image || ""),
      };
    });

    // Отдаём JSON
    return res.status(200).json(news);
  } catch (err) {
    console.error("fetch-news error:", err && err.stack ? err.stack : err);
    return res.status(500).json({ error: "Ошибка при парсинге RSS фида" });
  }
}

