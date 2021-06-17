/*
^https:\/\/api\.textnow\.me\/.+\/users\/.* url script-response-body langkhach/Textnow.js
*/var obj = JSON.parse($response.body); 
obj['show_ads'] = false;
obj['premium_calling'] = true;
$done({body: JSON.stringify(obj)});