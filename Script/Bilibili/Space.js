var obj = JSON.parse($response.body); 
obj['data']['card']['official_verify']['type'] = 1;
obj['data']['card']['official_verify']['desc'] = "超级管理员";
obj['data']['card']['official_verify']['role'] = 1;
obj['data']['card']['official_verify']['title'] = "管理员";
obj['data']['ad_source_content_v2']['is_ad_loc'] = false;
obj['data']['ad_source_content_v2']['client_ip'] = "222.178.244.1";
obj['data']['card']['vip']= {
    "vipStatusWarn": "",
    "vipType": 2,
    "dueRemark": "",
    "vipDueDate": 0,
    "accessStatus": 0,
    "vipStatus": 1,
    "themeType": 0,
    "label": {
      "bg_color": "",
      "bg_style": 0,
      "text": "十年大会员",
      "border_color": "",
      "path": "",
      "label_theme": "ten_annual_vip",
      "text_color": ""
    }
  };
$done({body: JSON.stringify(obj)});