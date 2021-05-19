let obj = JSON.parse($request.body);
obj.quality = 10;
$done({body:JSON.stringify(app)});