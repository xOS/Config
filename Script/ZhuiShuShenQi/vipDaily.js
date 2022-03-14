var obj = JSON.parse($response.body);
obj.isVip = true;
$done({ body: JSON.stringify(obj) });