<?php
require_once __DIR__ . '/common.php';

try {
    $offers = api_cached('offers', 300, function() {
        $xml = api_fetch('https://www.pragmaticar.ru/offers_rss.xml', 20);

        $dom = new DOMDocument();
        $dom->preserveWhiteSpace = false;

        libxml_use_internal_errors(true);
        $loaded = $dom->loadXML($xml, LIBXML_NOCDATA | LIBXML_NONET);

        if (!$loaded) {
            throw new Exception('Не удалось разобрать RSS акций');
        }

        $xpath = new DOMXPath($dom);
        $items = $xpath->query('//*[local-name()="item"]');
        $result = [];

        foreach ($items as $item) {
            $getText = function ($query) use ($xpath, $item) {
                $nodes = $xpath->query($query, $item);
                return $nodes && $nodes->length
                    ? trim($nodes->item(0)->textContent)
                    : '';
            };

            $getAttribute = function ($query, $attribute) use ($xpath, $item) {
                $nodes = $xpath->query($query, $item);

                if (!$nodes || !$nodes->length) {
                    return '';
                }

                return trim($nodes->item(0)->getAttribute($attribute));
            };

            $title = $getText('./*[local-name()="title"]');
            $link = $getText('./*[local-name()="link"]');
            $description = $getText('./*[local-name()="description"]');
            $pubDate = $getText('./*[local-name()="pubDate"]');

            // Изображение акции: media:thumbnail
            $thumbnail = $getAttribute(
                './/*[local-name()="thumbnail"]',
                'url'
            );

            // Дополнительный вариант: media:content
            if ($thumbnail === '') {
                $thumbnail = $getAttribute(
                    './/*[local-name()="content"]',
                    'url'
                );
            }

            // Дополнительный вариант: enclosure
            if ($thumbnail === '') {
                $thumbnail = $getAttribute(
                    './/*[local-name()="enclosure"]',
                    'url'
                );
            }

            // Дополнительный вариант: изображение внутри HTML-описания
            if ($thumbnail === '' && $description !== '') {
                if (preg_match('/<img[^>]+src=["\']([^"\']+)["\']/i', $description, $match)) {
                    $thumbnail = html_entity_decode(
                        $match[1],
                        ENT_QUOTES | ENT_HTML5,
                        'UTF-8'
                    );
                }
            }

            $action = $getText('./*[local-name()="action"]');
            $dealer = $getText('./*[local-name()="diler"]');
            $brand = $getText('./*[local-name()="brand"]');
            $model = $getText('./*[local-name()="model"]');

            $result[] = [
                'title' => $title,
                'link' => $link,
                'description' => $description,
                'pubDate' => $pubDate,
                'thumbnail' => $thumbnail,
                'action' => $action,
                'dealer' => $dealer,
                'brand' => $brand,
                'model' => $model
            ];
        }

        return $result;
    });

    api_json($offers);

} catch (Throwable $e) {
    error_log('fetch-offers: ' . $e->getMessage());
    api_json(['error' => 'Ошибка загрузки акций', 'details' => $e->getMessage()], 500);
}
