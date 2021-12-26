var obj = JSON.parse($response.body); 
obj['data']['user_entrances'][0]= {};
obj['data']['is_vip'] = 1;
obj['data']['banners']= {};
$done({body: JSON.stringify(obj)});