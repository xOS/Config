var obj = JSON.parse($response.body);
obj['data']['official']['type'] = 1;
obj['data']['official']['desc'] = "超级管理员";
obj['data']['official']['role'] = 1;
obj['data']['official']['title'] = "管理员";
obj['data']['vip'] = {
    "status": 1,
    "avatar_subscript": 1,
    "nickname_color": "#FB7299",
    "due_date": 0,
    "role": 0,
    "vip_pay_type": 0,
    "avatar_subscript_url": "",
    "label": {
        "bg_color": "",
        "bg_style": 0,
        "text": "十年大会员",
        "border_color": "",
        "path": "",
        "label_theme": "ten_annual_vip",
        "text_color": ""
    },
    "type": 2,
    "theme_type": 0
};
$done({ body: JSON.stringify(obj) });