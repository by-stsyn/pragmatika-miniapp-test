<?php
// API router for Reg.ru / PHP 7.4
$endpoint=trim((string)($_GET['endpoint']??''),'/');
if($endpoint===''){$path=parse_url($_SERVER['REQUEST_URI']??'',PHP_URL_PATH);$endpoint=basename(rtrim((string)$path,'/'));$endpoint=preg_replace('/\.php$/','',$endpoint);}
$routes=['fetch-feed-all'=>'fetch-feed-all.php','fetch-feed-used'=>'fetch-feed-used.php','fetch-hot-feed'=>'fetch-hot-feed.php','fetch-news'=>'fetch-news.php','fetch-offers'=>'fetch-offers.php','send-booking'=>'send-booking.php','calltouch'=>'calltouch.php','render'=>'render.php','debug-ip'=>'debug-ip.php'];
if(!isset($routes[$endpoint])){http_response_code(404);header('Content-Type: application/json; charset=utf-8');echo json_encode(['error'=>'Unknown API endpoint','endpoint'=>$endpoint],JSON_UNESCAPED_UNICODE);exit;}
require __DIR__.'/'.$routes[$endpoint];
