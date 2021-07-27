var obj = JSON.parse($response.body); 
obj['moreInfo']['noMore'] = true;
items = obj['items'];
items.splice(8);
$done({body: JSON.stringify(obj)});