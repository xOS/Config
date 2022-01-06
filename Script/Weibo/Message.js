let body = $response.body.replace(/\"verified_type_ext\":(\d)/g,'"verified_type_ext": 1');
$done({body})