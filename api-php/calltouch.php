<?php
require_once __DIR__ . '/common.php';

// Загружаем конфигурацию
$configPath = __DIR__ . '/../private/mail-config.php';

if (!is_file($configPath)) {
    api_json([
        'success' => false,
        'error' => 'Configuration file not found'
    ], 500);
}

$config = require $configPath;

if (!is_array($config)) {
    api_json([
        'success' => false,
        'error' => 'Invalid configuration'
    ], 500);
}

// Только POST
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    api_json([
        'success' => false,
        'error' => 'Method not allowed'
    ], 405);
}

// Получаем данные
$in = api_body();

// Нормализуем телефон
$phone = preg_replace('/\D+/', '', (string)($in['phone'] ?? ''));

if (strlen($phone) === 10) {
    $phone = '7' . $phone;
} elseif (strlen($phone) === 11) {
    if ($phone[0] === '8') {
        $phone = '7' . substr($phone, 1);
    } elseif ($phone[0] !== '7') {
        api_json([
            'success' => false,
            'error' => 'Invalid phone number'
        ], 400);
    }
} else {
    api_json([
        'success' => false,
        'error' => 'Phone must be 10 or 11 digits'
    ], 400);
}

// Настройки Calltouch
$widgetKey = $config['CALLTOUCH_WIDGET_KEY'] ?? '';
$apiKey = $config['CALLTOUCH_API_KEY'] ?? '';
$siteId = $config['CALLTOUCH_SITE_ID'] ?? '';

if (!$widgetKey || !$apiKey || !$siteId) {
    error_log('Calltouch: credentials are not configured');

    api_json([
        'success' => false,
        'error' => 'Calltouch credentials are not configured'
    ], 500);
}

// Дополнительные поля формы
$fields = [];

if (!empty($in['name'])) {
    $fields[] = [
        'type' => 'name',
        'name' => 'Имя',
        'value' => (string)$in['name']
    ];
}

if (!empty($in['email'])) {
    $fields[] = [
        'type' => 'email',
        'name' => 'Почта',
        'value' => (string)$in['email']
    ];
}

// Формируем запрос Calltouch
$payload = [
    'routeKey' => $widgetKey,
    'phone' => $phone,
    'fields' => $fields,
    'utmSource' => 'telegram-miniapp'
];

foreach (['sessionId', 'scheduleTime', 'callUrl'] as $key) {
    if (!empty($in[$key])) {
        $payload[$key] = $in[$key];
    }
}

$jsonPayload = json_encode(
    $payload,
    JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
);

if ($jsonPayload === false) {
    api_json([
        'success' => false,
        'error' => 'Could not encode request'
    ], 500);
}

// Отправляем запрос в Calltouch
try {
    $ch = curl_init(
        'https://api.calltouch.ru/widget-service/v1/api/widget-request/user-form/create'
    );

    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Accept: application/json',
            'Access-Token: ' . $apiKey,
            'SiteId: ' . $siteId
        ],
        CURLOPT_POSTFIELDS => $jsonPayload,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2
    ]);

    $body = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);

    curl_close($ch);

    if ($body === false) {
        throw new Exception('Calltouch connection error: ' . $error);
    }

    $data = json_decode($body, true);

    if ($status < 200 || $status >= 300) {
        error_log(
            'Calltouch HTTP ' . $status . ': '
            . substr((string)$body, 0, 2000)
        );

        api_json([
            'success' => false,
            'error' => 'Calltouch error',
            'details' => is_array($data)
                ? $data
                : ['response' => substr((string)$body, 0, 1000)]
        ], 502);
    }

    api_json([
        'success' => true,
        'data' => $data
    ]);

} catch (Throwable $e) {
    error_log('Calltouch: ' . $e->getMessage());

    api_json([
        'success' => false,
        'error' => 'Server error'
    ], 500);
}

