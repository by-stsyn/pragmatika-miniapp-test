export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone, name, email, sessionId, scheduleTime, callUrl } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone is required' });
    }

    // ===== Форматируем номер телефона =====
    let cleanPhone = phone.replace(/\D/g, '');
    let formattedPhone = cleanPhone;
    if (cleanPhone.length === 10) formattedPhone = '7' + cleanPhone;
    else if (cleanPhone.length === 11) {
      if (cleanPhone.startsWith('8')) formattedPhone = '7' + cleanPhone.slice(1);
      else if (!cleanPhone.startsWith('7')) formattedPhone = '7' + cleanPhone.slice(1);
    } else {
      return res.status(400).json({ error: 'Phone must be 10 or 11 digits' });
    }

    // ===== Подготавливаем тело запроса =====
    const payload = {
      routeKey: process.env.CALLTOUCH_WIDGET_KEY,
      phone: formattedPhone,
      fields: [
        name ? { type: 'name', name: 'Имя', value: name } : null,
        email ? { type: 'email', name: 'Почта', value: email } : null
      ].filter(Boolean),
      sessionId: sessionId || undefined,
      scheduleTime: scheduleTime || undefined,
      utmSource: 'telegram-miniapp',
      callUrl: callUrl || undefined
    };

    // ===== Отправка запроса на Calltouch =====
    const response = await fetch(
      'https://api.calltouch.ru/widget-service/v1/api/widget-request/user-form/create',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Token': process.env.CALLTOUCH_API_KEY,
          'SiteId': process.env.CALLTOUCH_SITE_ID
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    console.log('Calltouch response:', data);

    if (!response.ok) {
      return res.status(500).json({ error: 'Calltouch error', details: data });
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
}
