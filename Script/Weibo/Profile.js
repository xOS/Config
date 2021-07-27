var obj = JSON.parse($response.body); 
obj['moreInfo']['noMore'] = true;
a = obj['items'];
a.splice(8);
$done({body: JSON.stringify(obj)});