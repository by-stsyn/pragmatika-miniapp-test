import { XMLParser } from "fast-xml-parser";

export default async function handler(req, res) {
  try {
    const rssUrl = "https://www.pragmaticar.ru/hot_offers_new_rss.xml";

    const response = await fetch(rssUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/xml,text/xml,*/*",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const xml = await response.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
      textNodeName: "text",
      trimValues: true,
    });

    const json = parser.parse(xml);

    const items = json?.rss?.channel?.item || [];

    const vins = (Array.isArray(items) ? items : [items])
      .map((item) => item.VIN || item.vin)
      .filter(Boolean);

    res.status(200).json({ vins });
  } catch (err) {
    console.error("Ошибка загрузки горячих предложений:", err);
    res.status(500).json({
      error: "Ошибка загрузки горячих предложений",
      details: err.message,
    });
  }
}