var obj = JSON.parse($response.body); 
obj['data']['card']['official_verify']['type'] = 1;
obj['data']['card']['official_verify']['desc'] = "超级管理员";
obj['data']['card']['official_verify']['role'] = 1;
obj['data']['card']['official_verify']['title'] = "管理员";
obj['data']['card']['vip']['vipStatus'] = 1;
obj['data']['ad_source_content_v2']['is_ad_loc'] = false;
obj['data']['ad_source_content_v2']['client_ip'] = "222.178.244.1";
$done({body: JSON.stringify(obj)});