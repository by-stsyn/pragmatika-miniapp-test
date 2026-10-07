import { XMLParser } from "fast-xml-parser";

let cache = {
  data: null,
  timestamp: 0,
};

export default async function handler(req, res) {
  const now = Date.now();
  if (cache.data && now - cache.timestamp < 300000) {
    return res.status(200).json(cache.data);
  }

  try {
    const rssUrl = "https://www.pragmaticar.ru/offers_rss.xml";
    const response = await fetch(rssUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 PragmatikaMiniApp/1.0",
        Accept: "application/xml, text/xml, */*",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`Upstream HTTP ${response.status}`);
    }

    const xml = await response.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
      textNodeName: "text",
      cdataPropName: "cdata",
      isArray: (name) => name === "item",
    });

    const json = parser.parse(xml);
    const rawItems = json?.rss?.channel?.item;
    const items = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];

    const getVal = (v) => {
      if (!v) return "";
      if (typeof v === "object") return v.cdata || v.text || "";
      return String(v).trim();
    };

    const offers = items.map((item) => {
      const descRaw =
        typeof item.description === "object"
          ? item.description?.cdata || item.description?.text || ""
          : item.description || "";

      let thumbnail =
        item["media:thumbnail"]?.url || item["media:thumbnail"]?.["@_url"] || "";
      if (!thumbnail && item["media:content"]) {
        thumbnail = item["media:content"]?.url || item["media:content"]?.["@_url"] || "";
      }
      if (!thumbnail && item["enclosure"]) {
        thumbnail = item["enclosure"]?.url || item["enclosure"]?.["@_url"] || "";
      }
      if (!thumbnail && descRaw) {
        const match = descRaw.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (match) {
          thumbnail = match[1];
        }
      }

      return {
        title: getVal(item.title),
        link: getVal(item.link),
        description: descRaw,
        pubDate: getVal(item.pubDate),
        thumbnail: typeof thumbnail === "string" ? thumbnail.trim() : "",
        action: getVal(item["prag:action"]),
        dealer: getVal(item["prag:diler"]),
        brand: getVal(item["prag:brand"]),
        model: getVal(item["prag:model"]),
      };
    });

    if (offers.length > 0) {
      cache = {
        data: offers,
        timestamp: now,
      };
    }

    res.status(200).json(offers);
  } catch (err) {
    console.error("Ошибка загрузки фида акций:", err);
    if (cache.data && cache.data.length > 0) {
      return res.status(200).json(cache.data);
    }
    res.status(500).json({ error: "Ошибка загрузки акций", details: err.message });
  }
}
