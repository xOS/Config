var obj = JSON.parse($response.body); 
obj["data"]["list"] = [];
obj["data"]["has_more"]  = false;
$done({body: JSON.stringify(obj)});