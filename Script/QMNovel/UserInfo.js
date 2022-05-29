var obj = JSON.parse($response.body);
const userinfo = "/get-user-info";
const getinfo = "/get-role-adv-vip-info";
const vipindex = "/vip/index";
const center = "/my-center";
const userpage = "/page";
const level = "/my-level";
const url = $request.url;

if (obj.data) {
    if (url.indexOf(userinfo) != -1) {
        obj['data']['is_vip'] = '1';
    }

    if (url.indexOf(getinfo) != -1 || url.indexOf(vipindex) != -1) {
        obj['data']['users']['isLifetimeVip'] = 1;
        obj['data']['users']['year_vip_show'] = 1;
        obj['data']['users']['isvip'] = 1;
        obj['data']['year_vip_show'] = 1;
        obj['data']['rewardVideoConfig'] = {};
        obj['data']['content'] = [];
    }

    if (url.indexOf(center) != -1) {
        obj.data.user_area.vip_info.deadline_date = '永久会员';
        obj.data.user_area.vip_info.vip_privilege_desc = '您已经是尊贵的永久VIP会员。';
        // obj.data.user_area.vip_info = {};
        obj.data.user_area.base_info.year_vip_show = 1;
        // obj.data.user_area.base_info.level = 50;
        obj.data.user_area.base_info.is_vip = 1;
        obj.data.user_area.base_info.vip_show_type = 3;
        obj.data.user_area.base_info.level_icon = 'https://cdn.wtzw.com/bookimg/free/images/app/1_0_0/level/level_icon_50.png';
        obj.data.user_area.grid_info[0].num = '999999';
        obj.data.user_area.grid_info[0].coin_to_money = '99999';
        // obj.data.func_area[1] = {};
        obj.data.func_area.splice(1, 1);
    }

    if (url.indexOf(userpage) != -1) {
        obj.data.year_vip_show = 1;
        obj.data.level = 50;
        obj.data.role = 1;
        obj.data.is_vip = 1;
        obj.data.level_icon = 'https://cdn.wtzw.com/bookimg/free/images/app/1_0_0/level/level_icon_50.png';
    }

    if (url.indexOf(level) != -1) {
        obj.data.user.level = 50;
        obj.data.user.year_vip_show = 1;
        obj.data.user.exp = 401100;
        obj.data.user.vip = 1;
    }
}

$done({ body: JSON.stringify(obj) });