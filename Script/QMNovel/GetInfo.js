var obj = JSON.parse($response.body); 
obj['data']['users']['isLifetimeVip']= 1;
obj['data']['users']['year_vip_show']= 1;
obj['data']['users']['isvip']= 1;
obj['data']['year_vip_show'] = 1;
obj['data']['rewardVideoConfig']= {};
obj['data']['content']= [];
$done({body: JSON.stringify(obj)});