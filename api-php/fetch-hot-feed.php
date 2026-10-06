<?php
require_once __DIR__.'/common.php';
try { $xml=api_fetch('https://www.pragmaticar.ru/hot_offers_new_rss.xml',20,['Accept: application/xml,text/xml,*/*']); $doc=api_xml($xml); $vins=[]; foreach($doc->xpath('//item')?:[] as $item){ $vin=api_text($item->VIN ?? $item->vin ?? ''); if($vin!=='') $vins[]=$vin; } api_json(['vins'=>$vins]); }
catch(Throwable $e){ error_log('fetch-hot-feed: '.$e->getMessage()); api_json(['error'=>'Ошибка загрузки горячих предложений','details'=>$e->getMessage()],500); }
