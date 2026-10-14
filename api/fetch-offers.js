import { XMLParser } from "fast-xml-parser";

export default async function handler(req, res) {
  try {
    const rssUrl = "https://www.pragmaticar.ru/offers_rss.xml";
    const response = await fetch(rssUrl);
    const xml = await response.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
      textNodeName: "text",
      cdataPropName: "cdata"
    });

    const json = parser.parse(xml);
    const items = json?.rss?.channel?.item || [];

    const offers = items.map((item) => ({
      title: item.title,
      link: item.link,
      description: item.description?.cdata || "",
      pubDate: item.pubDate,
      thumbnail: item["media:thumbnail"]?.url || "",
      action: item["prag:action"] || "",
      dealer: item["prag:diler"] || "",
      brand: item["prag:brand"] || "",
      model: item["prag:model"] || ""
    }));

    res.status(200).json(offers);
  } catch (err) {
    console.error("Ошибка загрузки фида акций:", err);
    res.status(500).json({ error: "Ошибка загрузки акций" });
  }
}
