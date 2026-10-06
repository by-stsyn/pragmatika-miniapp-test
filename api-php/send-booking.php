<?php
require_once __DIR__ . '/common.php';
$config = require __DIR__ . '/../private/mail-config.php';

foreach ($config as $key => $value) {
    if (getenv($key) === false) {
        putenv($key . '=' . $value);
    }
}

/**
 * Pragmatika MiniApp: обработка заявок.
 * PHP 7.4+
 */

// Только POST
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    api_json([
        'success' => false,
        'message' => 'Method Not Allowed'
    ], 405);
}

// Получаем данные
$in = api_body();

$name = trim((string)($in['name'] ?? ''));
$phone = trim((string)($in['phone'] ?? ''));

if ($name === '' || $phone === '') {
    api_json([
        'success' => false,
        'message' => 'Имя и телефон обязательны'
    ], 400);
}

// Определяем тип заявки на шины или диски
$isTW = (
    ($in['requestType'] ?? '') === 'Заявка на покупку Шин / Дисков'
    && !empty($in['product'])
    && !empty($in['orderType'])
    && !empty($in['location'])
    && !empty($in['article'])
);

// Подготовка данных письма
$esc = function ($value) {
    if (is_array($value) || is_object($value)) {
        return '';
    }

    return htmlspecialchars(
        (string)$value,
        ENT_QUOTES | ENT_SUBSTITUTE,
        'UTF-8'
    );
};

$subject = '';
$rows = [];

$add = function ($label, $value) use (&$rows, $esc) {
    if ($value === null || $value === '' || is_array($value)) {
        return;
    }

    $rows[] = '<p><strong>' . $esc($label) . ':</strong> '
        . $esc($value) . '</p>';
};

// 1. Заказ шин и дисков
if ($isTW) {
    $qty = max(1, (int)($in['quantity'] ?? 1));
    $price = (float)($in['unitPrice'] ?? 0);
    $total = (float)($in['totalPrice'] ?? ($price * $qty));

    $subject = 'Заявка на покупку '
        . $in['orderType'] . ': ' . $in['product'];

    $add('Локация', $in['location']);
    $add('Город поставщика', $in['city'] ?? '');
    $add('Тип товара', $in['orderType']);
    $add('Артикул производителя', $in['article']);
    $add('Товар', $in['product']);
    $add('Количество', $qty . ' шт.');
    $add('Цена за 1 шт.', number_format($price, 2, ',', ' ') . ' ₽');
    $add('Итого', number_format($total, 2, ',', ' ') . ' ₽');
    $add('Остаток', $in['stock'] ?? '');

    $services = [];

    if (!empty($in['tireService'])) {
        $services[] = 'Шиномонтаж';
    }

    if (!empty($in['wheelStorage'])) {
        $services[] = 'Хранение резины (бесплатно)';
    }

    $add(
        'Дополнительные услуги',
        $services ? implode('; ', $services) : 'Не выбраны'
    );
}

// 2. Заявка по автомобилю
elseif (!empty($in['car']) && is_array($in['car'])) {
    $car = $in['car'];

    $vendor = (string)($car['vendor'] ?? '');
    $model = (string)($car['model'] ?? '');

    $subject = 'Заявка на авто: ' . trim($vendor . ' ' . $model);

    $add('Автомобиль', trim($vendor . ' ' . $model));
    $add('Дилер', $car['dealer'] ?? '');
    $add('Ссылка на авто', $car['url'] ?? '');
}

// 3. Заявка по акции
elseif (!empty($in['promoTitle'])) {
    $subject = 'Заявка по акции: ' . $in['promoTitle'];
    $add('Акция', $in['promoTitle']);
}

// 4. Запись на сервис
elseif (
    !empty($in['brand'])
    && !empty($in['model'])
    && !empty($in['dealer'])
    && !empty($in['service'])
    && !empty($in['date'])
    && !empty($in['time'])
) {
    $subject = 'Запись на сервис: '
        . $in['brand'] . ' ' . $in['model'];

    $fields = [
        'Марка' => 'brand',
        'Модель' => 'model',
        'Дилерский центр' => 'dealer',
        'Услуга' => 'service',
        'Дата' => 'date',
        'Время' => 'time',
        'Комментарий' => 'comment'
    ];

    foreach ($fields as $label => $key) {
        $add($label, $in[$key] ?? '');
    }
}

// 5. Другие заявки с VIN
elseif (
    !empty($in['requestType'])
    && !empty($in['model'])
    && !empty($in['vin'])
) {
    $subject = (string)$in['requestType'];

    $add('Тип заявки', $in['requestType']);
    $add('Автомобиль', $in['model']);
    $add('VIN', $in['vin']);
}

// Неизвестный тип заявки
else {
    api_json([
        'success' => false,
        'message' => 'Недостаточно данных для обработки заявки'
    ], 400);
}

$add('Имя клиента', $name);
$add('Телефон', $phone);

// --------------------------------------------------
// Получатели писем
// --------------------------------------------------

$locationEmails = [
    'Geely Василеостровский' => [
        'm.kovalev@vasauto-kia.ru',
        's.turbylev@geely-pragmatika.ru',
        'd.titorenko@geely-pragmatika.ru',
        'd.sinikov@geely-pragmatika.ru',
        'd.faustov@geely-pragmatika.ru'
    ],
    'Changan Купчино' => [
        'v.romanyuk@pragmatika-changanauto.ru',
        'k.molkanov@pragmatika-changanauto.ru',
        'a.volkov@plt-kia.ru'
    ],
    'LADA Василеостровский' => [
        'denis.karnauhov@lada-pragmatika.ru',
        'v.abramov@mkc.terravto.ru'
    ],
    'LADA Парнас' => [
        'viktor.ezutov@lada-parnas.ru',
        'sergey.fridrikh@lada-parnas.ru',
        'alexandr.emelyanov@lada-parnas.ru'
    ],
    'LADA Купчино' => [
        'artem.lebedev@lada-kupchino.ru',
        'artem.golubkov@lada-kupchino.ru',
        'evgeniy.obabko@lada-kupchino.ru',
        'georgiy.gashunov@lada-kupchino.ru'
    ],
    'LADA Псков' => [
        'andrey.evdokimov@lada-pskov.ru',
        'roman.levin@lada-pskov.ru'
    ],
    'LADA Великие Луки' => [
        'pavel.ulyanchich@lada-luki.ru',
        'nadezhda.suvorova@lada-luki.ru',
        'valentina.boykova@lada-luki.ru'
    ],
    'LADA Новгород' => [
        'sergey.maksimov@lada-novlada.ru',
        'natalya.goldshteyn@lada-novlada.ru'
    ],
    'LADA Петрозаводск' => [
        'anna.anderson@lada-petrozavodsk.ru',
        'denis.klimenko@lada-petrozavodsk.ru'
    ],
    'LADA Мурманск' => [
        'aleksandr.lasenko@lada-murmansk.ru',
        'parts@lada-murmansk.ru'
    ]
];

if ($isTW) {
    $to = array_merge(
        $locationEmails[$in['location']] ?? [],
        [
            'a.kulakov@pragmaticar.ru',
            'a.bliznyukov@terravto.ru'
        ]
    );
} else {
    $to = array_filter(
        array_map(
            'trim',
            explode(',', getenv('MAIL_TO') ?: 'a.bliznyukov@terravto.ru')
        )
    );

    if (
        !empty($in['brand'])
        && in_array('call@terravto.ru', $to, true)
    ) {
        $to = array_values(
            array_diff($to, ['call@terravto.ru'])
        );
    }
}

$to = array_values(array_unique(array_filter(
    $to,
    function ($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
)));

if (!$to) {
    api_json([
        'success' => false,
        'message' => 'Не настроены получатели письма'
    ], 500);
}

// --------------------------------------------------
// SMTP
// --------------------------------------------------

$mailUser = getenv('MAIL_USER');
$mailPass = getenv('MAIL_PASS');
$mailFrom = getenv('MAIL_FROM') ?: $mailUser;
$mailHost = getenv('MAIL_HOST') ?: 'smtp.gmail.com';
$mailPort = (int)(getenv('MAIL_PORT') ?: 465);

if (
    !$mailUser
    || !$mailPass
    || !$mailFrom
    || !filter_var($mailFrom, FILTER_VALIDATE_EMAIL)
) {
    api_json([
        'success' => false,
        'message' => 'Не настроены параметры SMTP'
    ], 500);
}

function booking_smtp_read($socket)
{
    $response = '';

    while (($line = fgets($socket, 515)) !== false) {
        $response .= $line;

        if (strlen($line) >= 4 && $line[3] === ' ') {
            break;
        }
    }

    if (!preg_match('/^[23]\d\d/', $response)) {
        throw new Exception('SMTP response: ' . trim($response));
    }

    return $response;
}

function booking_smtp_command($socket, $command)
{
    if (fwrite($socket, $command . "\r\n") === false) {
        throw new Exception('SMTP write failed');
    }

    return booking_smtp_read($socket);
}

function booking_smtp_send(
    $host,
    $port,
    $user,
    $pass,
    $from,
    $recipients,
    $subject,
    $html
) {
    $context = stream_context_create([
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true
        ]
    ]);

    $socket = stream_socket_client(
        'ssl://' . $host . ':' . $port,
        $errno,
        $errstr,
        20,
        STREAM_CLIENT_CONNECT,
        $context
    );

    if (!$socket) {
        throw new Exception('SMTP connection failed: ' . $errstr);
    }

    stream_set_timeout($socket, 20);

    try {
        booking_smtp_read($socket);

        booking_smtp_command($socket, 'EHLO pragmaticar.ru');
        booking_smtp_command($socket, 'AUTH LOGIN');
        booking_smtp_command($socket, base64_encode($user));
        booking_smtp_command($socket, base64_encode($pass));

        booking_smtp_command($socket, 'MAIL FROM:<' . $from . '>');

        foreach ($recipients as $email) {
            booking_smtp_command($socket, 'RCPT TO:<' . $email . '>');
        }

        booking_smtp_command($socket, 'DATA');

        $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';

        $headers = [
            'From: Pragmatika <' . $from . '>',
            'To: ' . implode(', ', $recipients),
            'Subject: ' . $encodedSubject,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
            'Content-Transfer-Encoding: 8bit'
        ];

        $message = implode("\r\n", $headers)
            . "\r\n\r\n"
            . $html;

        // SMTP требует удваивать точку в начале строки.
        $message = preg_replace('/^\./m', '..', $message);

        if (fwrite($socket, $message . "\r\n.\r\n") === false) {
            throw new Exception('SMTP message write failed');
        }

        booking_smtp_read($socket);
        booking_smtp_command($socket, 'QUIT');
    } finally {
        fclose($socket);
    }
}

try {
    booking_smtp_send(
        $mailHost,
        $mailPort,
        $mailUser,
        $mailPass,
        $mailFrom,
        $to,
        $subject,
        '<h2>Telegram | MAX (приложение)</h2>' . implode("\n", $rows)
    );
} catch (Throwable $e) {
    error_log('send-booking SMTP: ' . $e->getMessage());

    api_json([
        'success' => false,
        'message' => 'Ошибка при отправке письма'
    ], 500);
}

// --------------------------------------------------
// Создание заказа шин/дисков в 1С через Render
// --------------------------------------------------

if ($isTW) {
    $base = rtrim(
        getenv('RENDER_PROXY_URL') ?: 'https://render-a0lw.onrender.com',
        '/'
    );

    $orderId = 'TW-' . round(microtime(true) * 1000);
    $qty = max(1, (int)($in['quantity'] ?? 1));
    $price = (float)($in['unitPrice'] ?? 0);
    $total = (float)($in['totalPrice'] ?? ($price * $qty));

    $services = [];

    if (!empty($in['tireService'])) {
        $services[] = 'Шиномонтаж';
    }

    if (!empty($in['wheelStorage'])) {
        $services[] = 'Хранение резины (бесплатно)';
    }

    $payload = [
        'orderId' => $orderId,
        'organization' => (string)$in['location'],
        'client' => $name,
        'telephone' => $phone,
        'comment' => $services
            ? implode(', ', $services)
            : 'Дополнительные услуги не выбраны',
        'goods' => [
            [
                'article' => (string)$in['article'],
                'name' => (string)$in['product'],
                'price' => $price,
                'quantity' => $qty,
                'total' => $total,
                'type' => ($in['orderType'] === 'Шины')
                    ? 'ШИНЫ'
                    : 'ДИСКИ'
            ]
        ],
        'test' => false
    ];

    $jsonPayload = json_encode(
        $payload,
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );

    if ($jsonPayload === false) {
        error_log('send-booking: JSON encode failed');

        api_json([
            'success' => false,
            'emailSent' => true,
            'orderCreated' => false,
            'message' => 'Письмо отправлено, но не удалось подготовить заказ для 1С'
        ], 500);
    }

    $ch = curl_init($base . '/communication/order/');

    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 35,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Accept: application/json'
        ],
        CURLOPT_POSTFIELDS => $jsonPayload,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2
    ]);

    $response = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);

    curl_close($ch);

    $oneC = json_decode((string)$response, true);

    $failed = (
        $response === false
        || $status < 200
        || $status >= 300
        || (is_array($oneC) && ($oneC['status'] ?? '') === 'error')
    );

    if ($failed) {
        error_log(
            'send-booking Render error: HTTP '
            . $status . '; ' . $error
            . '; response: ' . substr((string)$response, 0, 2000)
        );

        api_json([
            'success' => false,
            'emailSent' => true,
            'orderCreated' => false,
            'message' => 'Заявка отправлена на почту, но не удалось создать заказ в 1С',
            'oneC' => $oneC ?: [
                'error' => $error ?: ('HTTP ' . $status)
            ]
        ], 502);
    }

    api_json([
        'success' => true,
        'emailSent' => true,
        'orderCreated' => true,
        'orderId' => $orderId,
        'oneC' => $oneC,
        'message' => 'Заявка отправлена'
    ]);
}

// Обычная заявка: письмо отправлено
api_json([
    'success' => true,
    'message' => 'Заявка отправлена'
]);
