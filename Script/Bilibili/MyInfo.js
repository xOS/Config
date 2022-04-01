var obj = JSON.parse($response.body);
obj['data']['official']['type'] = 1;
obj['data']['official']['desc'] = "超级管理员";
obj['data']['official']['role'] = 1;
obj['data']['official']['title'] = "管理员";
obj['data']['vip'] = {
    "status": 1,
    "avatar_subscript": 1,
    "nickname_color": "#FB7299",
    "due_date": 1964448000,
    "role": 1,
    "vip_pay_type": 0,
    "avatar_subscript_url": "http:\/\/i0.hdslb.com\/bfs\/vip\/icon_Certification_big_member_22_3x.png",
    "label": {
        "bg_color": "#FB7299",
        "bg_style": 1,
        "text": "十年大会员",
        "border_color": "",
        "path": "",
        "label_theme": "ten_annual_vip",
        "text_color": "#FFFFFF"
    },
    "type": 2,
    "theme_type": 0
};
$done({ body: JSON.stringify(obj) });