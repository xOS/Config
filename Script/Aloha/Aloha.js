var obj = JSON.parse($response.body);
obj['profile']['is_premium'] = true;
$done({ body: JSON.stringify(obj) });