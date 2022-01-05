var obj = JSON.parse($response.body); 
obj.data.user.level = 50;
obj.data.user.year_vip_show = 1;
obj.data.user.exp = 401100;
obj.data.user.vip = 1;
$done({body: JSON.stringify(obj)});