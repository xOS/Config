var obj = JSON.parse($response.body); 
obj['moreInfo']['noMore'] = true;
items = obj['items'];
delete items[3];
items.splice(8);
$done({body: JSON.stringify(obj)});