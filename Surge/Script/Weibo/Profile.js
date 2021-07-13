let body= $response.body;
var obj = JSON.parse(body);
delete obj.items;
$done({
    body: JSON.stringify(body)
  });