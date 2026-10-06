<?php
require_once __DIR__.'/common.php';
try{$data=json_decode(api_fetch('https://api.ipify.org?format=json',10),true);api_json(['ip'=>$data['ip']??null]);}catch(Throwable $e){api_json(['error'=>$e->getMessage()],500);}
