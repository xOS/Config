/*
^https:\/\/api\.textnow\.me\/.+\/users\/.* url script-response-body langkhach/Textnow.js
*/
var obj = JSON.parse($response.body); 
obj['result']['state'] = "PREMIUM_SUBSCRIPTION";
obj['result']['show_ads'] = false;
obj['result']['premium_calling'] = true;
obj['result']['platform'] = "TN_IOS";
obj['result']['code'] = "10000";
$done({body: JSON.stringify(obj)});