var obj = JSON.parse($response.body); 
obj['moreInfo']['noMore'] = true;
items = obj['items'];
delete items[3];
recommend = items[5][items];
recommend.splice(3);
items.splice(8);
$done({body: JSON.stringify(obj)});