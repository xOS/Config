var obj = JSON.parse($response.body); 
obj["data"]["list"]= [];
$done({body: JSON.stringify(obj)});