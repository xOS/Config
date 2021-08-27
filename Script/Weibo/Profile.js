var obj = JSON.parse($response.body); 
obj['moreInfo']['noMore'] = true;
item = obj['items'];
delete item[3];
item.splice(8);
items = item[5];
if(items['items'][3]) items['items'].splice(3);
$done({body: JSON.stringify(obj)});