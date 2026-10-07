<?php
require_once __DIR__.'/common.php';
$path=trim((string)($_GET['path']??''),'/');if($path===''||strpos($path,'..')!==false)api_json(['error'=>'path required or invalid'],400);
$base='https://render-a0lw.onrender.com/';$target=$base.$path;$q=$_GET;unset($q['path']);
$effId=$q['telegramId']??$q['maxId']??$q['vk_user_id']??$q['userId']??$q['user_id']??$q['id']??null;
if($effId){
  if(strpos($path,'api/profile/car')===0&&empty($q['telegramId'])){$q['telegramId']=$effId;}
  if(strpos($path,'communication/contact/')===0&&empty($q['telegramId'])&&empty($q['maxId'])){$q['telegramId']=$effId;}
}
if($q)$target.='?'.http_build_query($q);
$method=$_SERVER['REQUEST_METHOD'];$body=file_get_contents('php://input');$headers=['Content-Type: application/json'];
try{$ch=curl_init($target);curl_setopt_array($ch,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_FOLLOWLOCATION=>false,CURLOPT_CONNECTTIMEOUT=>15,CURLOPT_TIMEOUT=>65,CURLOPT_CUSTOMREQUEST=>$method,CURLOPT_HTTPHEADER=>$headers,CURLOPT_POSTFIELDS=>in_array($method,['POST','PUT','PATCH','DELETE'],true)?$body:null]);$result=curl_exec($ch);$status=(int)curl_getinfo($ch,CURLINFO_HTTP_CODE);$type=curl_getinfo($ch,CURLINFO_CONTENT_TYPE);$err=curl_error($ch);curl_close($ch);if($result===false)throw new Exception($err);http_response_code($status?:502);header('Content-Type: '.($type?:'application/json; charset=utf-8'));echo $result;}catch(Throwable $e){error_log('Render proxy: '.$e->getMessage());api_json(['error'=>$e->getMessage()],502);}
