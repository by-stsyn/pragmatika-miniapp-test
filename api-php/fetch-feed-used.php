<?php
require_once __DIR__.'/common.php';
try {
 $data=api_cached('used_feed',300,function(){ $xml=api_fetch('https://export.maxposter.ru/dealer-export/10558-192314.xml',45); $doc=api_xml($xml); $vehicles=$doc->xpath('//vehicle'); return ['xml'=>$xml,'count'=>is_array($vehicles)?count($vehicles):0]; });
 if (isset($_GET['count']) && $_GET['count']==='1') api_json(['count'=>(int)$data['count']]);
 header('Content-Type: application/xml; charset=utf-8'); echo $data['xml'];
} catch(Throwable $e) { error_log('fetch-feed-used: '.$e->getMessage()); api_json(['error'=>$e->getMessage()],500); }
