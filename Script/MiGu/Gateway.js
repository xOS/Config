let body = $response.body.toString().replace(/\"needAuth\"\:true/g, '"needAuth": false');
$done({ body: JSON.stringify(obj) });