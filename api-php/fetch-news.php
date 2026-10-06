<?php
require_once __DIR__ . '/common.php';

try {
    $xml = api_fetch('https://www.pragmaticar.ru/rss.xml', 20);

    if (trim($xml) === '') {
        api_json([]);
    }

    $dom = new DOMDocument();
    $dom->preserveWhiteSpace = false;

    libxml_use_internal_errors(true);
    $loaded = $dom->loadXML($xml, LIBXML_NOCDATA | LIBXML_NONET);

    if (!$loaded) {
        throw new Exception('Не удалось разобрать RSS');
    }

    $xpath = new DOMXPath($dom);

    $items = $xpath->query('//*[local-name()="item"]');
    if (!$items || $items->length === 0) {
        $items = $xpath->query('//*[local-name()="entry"]');
    }

    $news = [];

    foreach ($items as $item) {
        $getText = function ($query) use ($xpath, $item) {
            $nodes = $xpath->query($query, $item);
            return ($nodes && $nodes->length)
                ? trim($nodes->item(0)->textContent)
                : '';
        };

        $getLink = function () use ($xpath, $item) {
            $nodes = $xpath->query('./*[local-name()="link"]', $item);

            if (!$nodes || !$nodes->length) {
                return '';
            }

            $node = $nodes->item(0);

            if ($node->hasAttribute('href')) {
                return trim($node->getAttribute('href'));
            }

            return trim($node->textContent);
        };

        $title = $getText('./*[local-name()="title"]');
        $link = $getLink();

        $date = $getText('./*[local-name()="pubDate"]');
        if ($date === '') {
            $date = $getText('./*[local-name()="updated"]');
        }
        if ($date === '') {
            $date = $getText('./*[local-name()="published"]');
        }

        $description = $getText('./*[local-name()="description"]');
        if ($description === '') {
            $description = $getText('./*[local-name()="summary"]');
        }

        $content = $getText('./*[local-name()="encoded"]');
        if ($content === '') {
            $content = $getText('./*[local-name()="content"]');
        }

        // Ищем изображение в стандартных RSS-полях.
        $image = '';

        $imageQueries = [
            './/*[local-name()="thumbnail"]',
            './/*[local-name()="content"]',
            './/*[local-name()="enclosure"]',
            './/*[local-name()="image"]'
        ];

        foreach ($imageQueries as $query) {
            $nodes = $xpath->query($query, $item);

            if (!$nodes) {
                continue;
            }

            foreach ($nodes as $node) {
                foreach (['url', 'href', 'src'] as $attribute) {
                    if ($node->hasAttribute($attribute)) {
                        $candidate = trim($node->getAttribute($attribute));

                        if ($candidate !== '') {
                            $image = $candidate;
                            break 3;
                        }
                    }
                }
            }
        }

        // Если отдельного поля с изображением нет,
        // пробуем найти img в HTML описания или контента.
        if ($image === '') {
            $html = $description . ' ' . $content;

            if (preg_match(
                '/<img\b[^>]*\bsrc\s*=\s*["\']([^"\']+)["\']/i',
                $html,
                $match
            )) {
                $image = html_entity_decode(
                    $match[1],
                    ENT_QUOTES | ENT_HTML5,
                    'UTF-8'
                );
            }
        }

        // Убираем CDATA-обёртку не требуется:
        // DOMDocument уже возвращает её содержимое.
        $news[] = [
            'title' => $title,
            'link' => $link,
            'date' => $date,
            'description' => $description,
            'content' => $content,
            'image' => $image
        ];
    }

    api_json($news);

} catch (Throwable $e) {
    error_log('fetch-news: ' . $e->getMessage());
    api_json([
        'error' => 'Ошибка при загрузке или парсинге RSS фида'
    ], 500);
}
