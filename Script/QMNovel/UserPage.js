var obj = JSON.parse($response.body); 
obj.data.year_vip_show = 1;
obj.data.level = 50;
obj.data.role = 1;
obj.data.is_vip = 1;
obj.data.level_icon = 'https://cdn.wtzw.com/bookimg/free/images/app/1_0_0/level/level_icon_50.png';
$done({body: JSON.stringify(obj)});