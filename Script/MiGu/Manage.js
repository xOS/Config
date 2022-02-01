let body = $response.body.toString().replace(/\"vip":"(\d)"/g, '"vip": "0"').replace(/\"status":"(\d)"/g, '"status": "1"');
$done({ body })