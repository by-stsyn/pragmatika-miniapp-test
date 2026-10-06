import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const {
    name,
    phone,
    car,
    promoTitle,
    brand,
    model,
    dealer,
    service,
    date,
    time,
    comment,
    vin,
    requestType,
    orderType,
    city,
    location,
    article,
    product,
    quantity,
    unitPrice,
    totalPrice,
    stock,
    tireService,
    wheelStorage
  } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ success: false, message: "Имя и телефон обязательны" });
  }

  // SMTP конфигурация
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER || process.env.MAIL_USER,
      pass: process.env.SMTP_PASS || process.env.MAIL_PASS,
    },
  });

  const isTireWheelOrder =
    requestType === "Заявка на покупку Шин / Дисков" &&
    product &&
    orderType &&
    location &&
    article;

  const orderServices = [
    tireService ? "Шиномонтаж" : "",
    wheelStorage ? "Хранение резины (бесплатно)" : "",
  ].filter(Boolean);

  const orderComment = orderServices.length
    ? orderServices.join(", ")
    : "Дополнительные услуги не выбраны";

  // --- Логика определения типа заявки ---
  let subject = "";
  let html = "";

  // 🔹 Заявка на покупку шин / дисков
  if (isTireWheelOrder) {
    const qty = Math.max(1, Number(quantity) || 1);
    const price = Number(unitPrice) || 0;
    const total = Number(totalPrice) || price * qty;
    const services = orderServices;

    subject = `Заявка на покупку ${orderType}: ${product}`;
    html = `
      <h2>Telegram | MAX (приложение) - заявка на покупку шин / дисков</h2>
      <p><strong>Локация:</strong> ${location}</p>
      <p><strong>Город поставщика:</strong> ${city || ""}</p>
      <p><strong>Тип товара:</strong> ${orderType}</p>
      <p><strong>Артикул производителя:</strong> ${article}</p>
      <p><strong>Товар:</strong> ${product}</p>
      <p><strong>Количество:</strong> ${qty} шт.</p>
      <p><strong>Цена за 1 шт.:</strong> ${price.toLocaleString("ru-RU")} ₽</p>
      <p><strong>Итого:</strong> ${total.toLocaleString("ru-RU")} ₽</p>
      ${stock ? `<p><strong>Остаток на момент заказа:</strong> ${Number(stock)} шт.</p>` : ""}
      <p><strong>Дополнительные услуги:</strong> ${services.length ? services.join(", ") : "Не выбраны"}</p>
      <p><strong>Имя клиента:</strong> ${name}</p>
      <p><strong>Телефон:</strong> ${phone}</p>
    `;
  }

  // 🔹 Заявка на автомобиль
  else if (car) {
    subject = `Заявка на авто: ${car.vendor} ${car.model}`;
    html = `
      <h2>Telegram | MAX (приложение) - новая заявка на бронирование автомобиля</h2>
      <p><strong>Автомобиль:</strong> ${car.vendor} ${car.model}</p>
      <p><strong>Дилер:</strong> ${car.dealer}</p>
      <p><strong>Имя клиента:</strong> ${name}</p>
      <p><strong>Телефон:</strong> ${phone}</p>
      ${car.url ? `<p><a href="${car.url}" target="_blank">Ссылка на авто</a></p>` : ""}
    `;
  }

  // 🔹 Заявка по акции
  else if (promoTitle) {
    subject = `Заявка по акции: ${promoTitle}`;
    html = `
      <h2>Telegram | MAX (приложение) - заявка по акции</h2>
      <p><strong>Акция:</strong> ${promoTitle}</p>
      <p><strong>Имя клиента:</strong> ${name}</p>
      <p><strong>Телефон:</strong> ${phone}</p>
    `;
  }

  // 🔹 Заявка на сервис
  else if (brand && model && dealer && service && date && time) {
    subject = `Запись на сервис: ${brand} ${model}`;
    html = `
      <h2>Telegram | MAX (приложение) - заявка на сервис</h2>
      <p><strong>Марка:</strong> ${brand}</p>
      <p><strong>Модель:</strong> ${model}</p>
      <p><strong>Дилерский центр:</strong> ${dealer}</p>
      <p><strong>Услуга:</strong> ${service}</p>
      <p><strong>Дата:</strong> ${date}</p>
      <p><strong>Время:</strong> ${time}</p>
      <p><strong>Имя клиента:</strong> ${name}</p>
      <p><strong>Телефон:</strong> ${phone}</p>
      ${comment ? `<p><strong>Комментарий:</strong> ${comment}</p>` : ""}
    `;
  }

    // 🔹 Заявка на страховой полис
else if (requestType && model && vin) {
  subject = requestType;
  html = `
    <h2>Telegram | MAX (приложение) - заявка на страховой полис</h2>
    <p><strong>Тип заявки:</strong> ${requestType}</p>
    <p><strong>Автомобиль:</strong> ${model}</p>
    <p><strong>VIN:</strong> ${vin}</p>
    <p><strong>Имя клиента:</strong> ${name}</p>
    <p><strong>Телефон:</strong> ${phone}</p>
  `;
}

  // ❌ Нет подходящих данных
  else {
    return res.status(400).json({ success: false, message: "Недостаточно данных для обработки заявки" });
  }


// --- формирование массива получателей ---
// Для заявок на шины/диски отправляем письмо:
// 1) на все адреса выбранной локации из утверждённого списка;
// 2) обязательно на a.kulakov@pragmaticar.ru и a.bliznyukov@terravto.ru.
// Для остальных типов заявок сохраняем прежнюю логику через MAIL_TO.
const LOCATION_EMAILS = {
  "Geely Василеостровский": [
    "m.kovalev@vasauto-kia.ru",
    "s.turbylev@geely-pragmatika.ru",
    "d.titorenko@geely-pragmatika.ru",
    "d.sinikov@geely-pragmatika.ru",
    "d.faustov@geely-pragmatika.ru",
  ],
  "Changan Купчино": [
    "v.romanyuk@pragmatika-changanauto.ru",
    "k.molkanov@pragmatika-changanauto.ru",
    "a.volkov@plt-kia.ru",
  ],
  "LADA Василеостровский": [
    "denis.karnauhov@lada-pragmatika.ru",
    "v.abramov@mkc.terravto.ru",
  ],
  "LADA Парнас": [
    "viktor.ezutov@lada-parnas.ru",
    "sergey.fridrikh@lada-parnas.ru",
    "alexandr.emelyanov@lada-parnas.ru",
  ],
  "LADA Купчино": [
    "artem.lebedev@lada-kupchino.ru",
    "artem.golubkov@lada-kupchino.ru",
    "evgeniy.obabko@lada-kupchino.ru",
    "georgiy.gashunov@lada-kupchino.ru",
  ],
  "LADA Псков": [
    "andrey.evdokimov@lada-pskov.ru",
    "roman.levin@lada-pskov.ru",
  ],
  "LADA Великие Луки": [
    "pavel.ulyanchich@lada-luki.ru",
    "nadezhda.suvorova@lada-luki.ru",
    "valentina.boykova@lada-luki.ru",
  ],
  "LADA Новгород": [
    "sergey.maksimov@lada-novlada.ru",
    "natalya.goldshteyn@lada-novlada.ru",
  ],
  "LADA Петрозаводск": [
    "anna.anderson@lada-petrozavodsk.ru",
    "denis.klimenko@lada-petrozavodsk.ru",
  ],
  "LADA Мурманск": [
    "aleksandr.lasenko@lada-murmansk.ru",
    "parts@lada-murmansk.ru",
  ],
};

const mandatoryRecipients = [
  "a.kulakov@pragmaticar.ru",
  "a.bliznyukov@terravto.ru",
];

let recipients;

if (isTireWheelOrder) {
  recipients = [
    ...(LOCATION_EMAILS[location] || []),
    ...mandatoryRecipients,
  ];

  // Убираем возможные дубли адресов.
  recipients = [...new Set(recipients.map(email => email.trim()).filter(Boolean))];

  console.log("📧 Tire/wheel recipients:", {
    location,
    recipients,
  });
} else {
  recipients = (process.env.MAIL_TO || "a.bliznyukov@terravto.ru")
    .split(',')
    .map(e => e.trim())
    .filter(Boolean);

  // 👉 если это сервисная заявка — убираем call@
  const isServiceRequest = brand && model && dealer && service && date && time;

  if (isServiceRequest) {
    recipients = recipients.filter(email => email !== "call@terravto.ru");
  }
}

  
  // --- Отправка письма ---
  const mailOptions = {
    from: `"Telegram Mini App" <${process.env.SMTP_USER || process.env.MAIL_USER}>`,
    to: recipients,
    subject,
    html,
  };

  try {
    // Сначала отправляем письмо — текущая логика заявок сохраняется.
    await transporter.sendMail(mailOptions);

    // Для заказа шин/дисков дополнительно создаём Заказ клиента в 1С АА6
    // через Render-прокси. URL можно переопределить переменной окружения.
    if (isTireWheelOrder) {
      const renderBase =
        process.env.RENDER_PROXY_URL ||
        "https://render-a0lw.onrender.com";

      const orderId = `TW-${Date.now()}`;
      const qty = Math.max(1, Number(quantity) || 1);
      const price = Number(unitPrice) || 0;
      const total = Number(totalPrice) || price * qty;

      const orderPayload = {
        orderId,
        organization: location,
        client: name,
        telephone: phone,
        comment: orderComment,
        goods: [
          {
            article: String(article),
            name: String(product),
            price,
            quantity: qty,
            total,
            type: orderType === "Шины" ? "ШИНЫ" : "ДИСКИ",
          },
        ],
        test: false,
      };

      console.log("→ 1C order:", JSON.stringify({
        ...orderPayload,
        telephone: "***",
      }));

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      try {
        const oneCResponse = await fetch(
          `${renderBase}/communication/order/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderPayload),
            signal: controller.signal,
          }
        );

        const oneCText = await oneCResponse.text();
        let oneCData = null;

        try {
          oneCData = JSON.parse(oneCText);
        } catch {
          oneCData = { raw: oneCText };
        }

        console.log("1C order response:", oneCResponse.status, oneCData);

        if (!oneCResponse.ok || oneCData?.status === "error") {
          return res.status(502).json({
            success: false,
            emailSent: true,
            orderCreated: false,
            message: "Заявка отправлена на почту, но не удалось создать заказ в 1С",
            oneC: oneCData,
          });
        }

        return res.status(200).json({
          success: true,
          emailSent: true,
          orderCreated: true,
          orderId,
          oneC: oneCData,
          message: "Заявка отправлена",
        });
      } catch (oneCError) {
        console.error("1C order error:", oneCError);

        return res.status(502).json({
          success: false,
          emailSent: true,
          orderCreated: false,
          message: "Заявка отправлена на почту, но 1С временно недоступна",
        });
      } finally {
        clearTimeout(timeout);
      }
    }

    return res.status(200).json({ success: true, message: "Заявка отправлена" });
  } catch (error) {
    console.error("Ошибка при отправке:", error);
    return res.status(500).json({ success: false, message: "Ошибка при отправке письма" });
  }
}
