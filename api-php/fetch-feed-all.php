<?php
require_once __DIR__ . '/common.php';

try {
    $feedUrl = 'https://export.maxposter.ru/dealer-export/1983-38233.xml';
    $xml = api_fetch($feedUrl, 45);

    libxml_use_internal_errors(true);
    $source = new DOMDocument('1.0', 'UTF-8');
    $source->preserveWhiteSpace = true;
    $source->formatOutput = false;

    if (!$source->loadXML($xml, LIBXML_NONET | LIBXML_NOERROR | LIBXML_NOWARNING)) {
        throw new Exception('Не удалось разобрать XML фида новых автомобилей');
    }

    $vehicles = $source->getElementsByTagName('vehicle');
    $count = $vehicles->length;

    if (isset($_GET['count']) && $_GET['count'] === '1') {
        api_json(['count' => $count]);
    }

    if ($count === 0) {
        throw new Exception('В фиде новых автомобилей не найдено ни одного элемента vehicle');
    }

    // Создаём новый документ, перенося каждый vehicle целиком.
    // importNode сохраняет вложенные узлы, включая фотографии и их атрибуты.
    $output = new DOMDocument('1.0', 'UTF-8');
    $output->formatOutput = false;
    $root = $output->createElement('vehicles');
    $output->appendChild($root);

    foreach ($vehicles as $vehicle) {
        $copy = $output->importNode($vehicle, true);

        // Сохраняем исходную логику Vercel: добавляем dealer в каждый автомобиль.
        $dealer = $output->createElement('dealer');
        $dealer->appendChild($output->createTextNode('Все локации'));
        $copy->appendChild($dealer);

        $root->appendChild($copy);
    }

    header('Content-Type: application/xml; charset=utf-8');
    header('Cache-Control: public, max-age=300');
    echo $output->saveXML();
} catch (Throwable $e) {
    error_log('fetch-feed-all: ' . $e->getMessage());
    api_json(['error' => $e->getMessage()], 500);
}