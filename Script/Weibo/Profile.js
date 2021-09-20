var obj = JSON.parse($response.body); 
obj['moreInfo']['noMore'] = true;
item = obj['items'];
if(item[3]) delete item[3];
if(item[8]) item.splice(6);
if(item[7]) item.splice(5);
if(item[6] && !item[7]) item.splice(4);
$done({body: JSON.stringify(obj)});