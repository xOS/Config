/**
hostname = biz.caiyunapp.com
^https:\/\/biz\.caiyunapp\.com\/v2\/user\?app_name\=weather url script-response-body https://raw.githubusercontent.com/godlikeanyone/Rules/master/ColorWeather.js
**/
var body = $response['body'];
var obj = JSON['parse'](body);
obj['result']['xy_vip_expire'] = 4096483190;
obj['result']['is_vip'] = true;
obj['result']['vip_expired_at'] = 4096483190;
obj['result']['is_xy_vip'] = true;
obj['result']['vip_type'] = 'v';
body = JSON['stringify'](obj);
$done({
    body
})