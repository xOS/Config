var obj = JSON.parse($response.body);
obj['data']['banners'] = [];
obj['data']['welfare'] = {};
obj['data']['recommend_pendants'] = {};
obj['data']['recommend_cards'] = {};
obj['data']['sort'] = [];
obj['data']['union_vip'] = [];
obj['data']['other_open_info'] = [];
obj['data']['user']['vip_overdue_explain'] = "大会员有效期 2032\/04\/02";
obj['data']['user']['tv_overdue_explain'] = "电视大会员有效期 2032\/04\/02";
obj['data']['user']['panel_sub_title'] = "十年大会员";
obj['data']['user']['notice']['can_close'] = true;
obj['data']['user']['notice']['surplus_seconds'] = 604800;
//obj['data']['user']['notice']['type'] = 2;
obj['data']['user']['vip'] = {
    "nickname_color": "#FB7299",
    "avatar_subscript": 1,
    "vip_type": 2,
    "mid": 40075363,
    "is_new_user": false,
    "vip_pay_type": 0,
    "vip_status": 1,
    "label": {
        "bg_color": "#FB7299",
        "text_color": "#FFFFFF",
        "bg_style": 1,
        "text": "十年大会员",
        "border_color": "",
        "path": "",
        "label_theme": "ten_annual_vip"
    },
    "avatar_subscript_url": "http:\/\/i0.hdslb.com\/bfs\/vip\/icon_Certification_big_member_22_3x.png",
    "vip_due_date": 1964448000,
    "theme_type": 0
};
obj['data']['user']['tv'] = {
    "vip_pay_type": 0,
    "status": 1,
    "type": 2,
    "due_date": 0
};
$done({ body: JSON.stringify(obj) });