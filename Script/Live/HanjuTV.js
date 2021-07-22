let body = $response.body.replace(/\"quality\":(\d)/g,'"quality":10');
$done({body})