<?php
// Shared helpers; compatible with PHP 7.4.
function api_json($data, $status = 200) { http_response_code($status); header('Content-Type: application/json; charset=utf-8'); echo json_encode($data, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES); exit; }
function api_fetch($url, $timeout=25, $headers=[]) {
  if (!function_exists('curl_init')) throw new Exception('PHP cURL extension is required');
  $ch=curl_init($url); curl_setopt_array($ch,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_FOLLOWLOCATION=>true,CURLOPT_MAXREDIRS=>5,CURLOPT_CONNECTTIMEOUT=>10,CURLOPT_TIMEOUT=>$timeout,CURLOPT_SSL_VERIFYPEER=>true,CURLOPT_SSL_VERIFYHOST=>2,CURLOPT_HTTPHEADER=>$headers,CURLOPT_USERAGENT=>'Mozilla/5.0 Pragmatika MiniApp']);
  $body=curl_exec($ch); $err=curl_error($ch); $status=(int)curl_getinfo($ch,CURLINFO_HTTP_CODE); curl_close($ch);
  if ($body===false) throw new Exception('Request failed: '.$err);
  if ($status<200 || $status>=300) throw new Exception('Upstream HTTP '.$status);
  return $body;
}
function api_xml($xml) { libxml_use_internal_errors(true); $doc=simplexml_load_string($xml, 'SimpleXMLElement', LIBXML_NOCDATA|LIBXML_NONET); if ($doc===false) throw new Exception('Invalid XML feed'); return $doc; }
function api_text($v) { if ($v===null) return ''; if (is_array($v)) return ''; return trim((string)$v); }
function api_cache_file($name) { return rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR.'pragmatika_'.preg_replace('/[^a-z0-9_-]/i','',$name).'.json'; }
function api_cached($name,$ttl,$loader) { $f=api_cache_file($name); if (is_file($f) && time()-filemtime($f)<$ttl) { $v=json_decode((string)file_get_contents($f),true); if (is_array($v)) return $v; } $v=$loader(); @file_put_contents($f,json_encode($v,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES),LOCK_EX); return $v; }
function api_body() { $raw=file_get_contents('php://input'); $v=json_decode($raw,true); return is_array($v)?$v:[]; }
