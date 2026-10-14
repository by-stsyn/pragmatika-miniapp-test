import { DOMParser, XMLSerializer } from "xmldom";

export default async function handler(req, res) {
  const feeds = [
    {
      url: "https://export.maxposter.ru/dealer-export/1983-38233.xml",
      dealer: "Все локации",
    },
  ];

  try {
    const vehiclesXml = [];
    let totalCount = 0;

    const validFeeds = feeds.filter((f) => f.url);

    for (const { url, dealer } of validFeeds) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Ошибка загрузки фида: ${url}`);
        }

        const xmlText = await response.text();
        const doc = new DOMParser().parseFromString(xmlText, "text/xml");

        // ✅ vehicle — правильно
        const vehicles = Array.from(doc.getElementsByTagName("vehicle"));

        totalCount += vehicles.length;
        console.log(`Фид ${dealer}: ${vehicles.length} автомобилей`);

        // 👉 если нужен ТОЛЬКО счётчик — дальше не обрабатываем XML
        if (req.query.count === "1") {
          continue;
        }

        for (const vehicle of vehicles) {
          const dealerNode = doc.createElement("dealer");
          dealerNode.appendChild(doc.createTextNode(dealer));
          vehicle.appendChild(dealerNode);

          vehiclesXml.push(vehicle);
        }
      } catch (feedErr) {
        console.error(`Ошибка обработки фида ${dealer}:`, feedErr.message);
      }
    }

    // 👉 только счётчик
    if (req.query.count === "1") {
      return res.status(200).json({
        count: totalCount,
      });
    }

    if (!vehiclesXml.length) {
      return res
        .status(500)
        .json({ error: "Не удалось загрузить ни одного автомобиля" });
    }

    const serializer = new XMLSerializer();
    const vehiclesXmlText = vehiclesXml
      .map((v) => serializer.serializeToString(v))
      .join("\n");

    const finalXml = `<?xml version="1.0" encoding="UTF-8"?>
<vehicles>
${vehiclesXmlText}
</vehicles>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.status(200).send(finalXml);
  } catch (error) {
    console.error("Глобальная ошибка:", error.message);
    res.status(500).json({ error: error.message });
  }
}
