var obj = JSON.parse($response.body);
if (obj['data']['swiper']) obj['data']['swiper'] = [];
if (obj['data']['recommend']) obj['data']['recommend'] = {};
$done({ body: JSON.stringify(obj) });