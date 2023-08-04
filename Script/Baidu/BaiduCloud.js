/*
Baidu netdisc unlocks online video play speed.
Surge4.0:
http-response https:\/\/pan\.baidu\.com\/rest\/2\.0\/membership\/user requires-body=1,max-size=0,script-path=https://hub.nange.cn/Script/Baidu/BaiduCloud.js
QX1.0.0:
https:\/\/pan\.baidu\.com\/rest\/2\.0\/membership\/user url script-response-body https://hub.nange.cn/Script/Baidu/BaiduCloud.js
MITM = pan.baidu.com
*/

obj = {
    'product_infos': [
        {
            'product_id': '5310897792128633390',
            'start_time': 1417260485,
            'end_time': 2147483648,
            'buy_time': '1417260485',
            'cluster': 'offlinedl',
            'detail_cluster': 'offlinedl',
            'product_name': 'gz_telecom_exp'
        },
        {
            'product_name': 'svip2_nd',
            'product_description': '超级会员',
            'function_num': 0,
            'start_time': 1553702399,
            'buy_description': '',
            'buy_time': 0,
            'product_id': '1',
            'auto_upgrade_to_svip': 0,
            'end_time': 2147483648,
            'cluster': 'vip',
            'detail_cluster': 'svip',
            'status': 0
        }
    ],
    "user_type": "svip",
    "level_info": {
        "last_manual_collection_time": 0,
        "current_value": 43000,
        "history_value": 43000,
        "accumulated_uncollected_points": 0,
        "daily_value": 0,
        "accumulated_lost_points": 0,
        "current_max_points": 43000,
        "current_level": 10,
        "history_level": 8,
        "default_daily_value": 15,
        "accumulated_day": 0
    },
    'currenttime': 1573473597,
    'reminder': {
        'reminderWithContent': [],
        'advertiseContent': []
    },
    'request_id': 7501873289383875000,
    "status_data": "已是超级会员SVIP",
    'guide_data': {
        'title': '超级会员SVIP',
        'content': '已拥有极速下载+视频倍速特权',
        'button': {
            'text': '会员中心',
            'action_url': 'https://pan.baidu.com/wap/vip/user?from=myvip2#svip'
        }
    }
};
$done({ body: JSON.stringify(obj) });