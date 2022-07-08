var obj = JSON.parse($response.body);
if (obj.data.card) {
    obj['data']['card']['vip'] = {
        "vipStatusWarn": "",
        "vipType": 2,
        "dueRemark": "",
        "vipDueDate": 1964448000,
        "accessStatus": 0,
        "vipStatus": 1,
        "themeType": 0,
        "label": {
            "bg_color": "#FB7299",
            "bg_style": 1,
            "text": "十年大会员",
            "border_color": "",
            "path": "",
            "label_theme": "ten_annual_vip",
            "text_color": "#FFFFFF"
        }
    };
    if (obj.data.card.official_verify) {
        obj['data']['card']['official_verify']['type'] = 1;
        obj['data']['card']['official_verify']['desc'] = "超级管理员";
        obj['data']['card']['official_verify']['role'] = 1;
        obj['data']['card']['official_verify']['title'] = "管理员";
    }
}

if (obj.data.ad_source_content_v2) {
    obj['data']['ad_source_content_v2']['is_ad_loc'] = false;
    obj['data']['ad_source_content_v2']['client_ip'] = "222.178.244.1";
}

$done({ body: JSON.stringify(obj) });