/*
***************************
QuantumultX:

[rewrite_local]
^https?:\/\/.+?\.(pipi|fuli|xiang(jiao|xiang))apps\.com\/(ucp\/index|getGlobalData|(\/|)vod\/reqplay\/) url script-response-body https://raw.githubusercontent.com/NobyDa/Script/master/QuantumultX/File/xjsp.js

[mitm]
hostname = ios.fuliapps.com, apple.fuliapps.com, ios.xiangjiaoapps.com, apple.xiangjiaoapps.com, *.xiangxiangapps.com, *.pipiapps.com

***************************
Surge4 or Loon://

[Script]
http-response https?:\/\/.+?\.(pipi|fuli|xiang(jiao|xiang))apps\.com\/(ucp\/index|getGlobalData|(\/|)vod\/reqplay\/) requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/NobyDa/Script/master/QuantumultX/File/xjsp.js

[MITM]
hostname = ios.fuliapps.com, apple.fuliapps.com, ios.xiangjiaoapps.com, apple.xiangjiaoapps.com, *.xiangxiangapps.com, *.pipiapps.com

**************************/

var body = $response.body;
var url = $request.url;

if (body) {
    var obj = JSON.parse($response.body);
    if (/\/ucp\/(index|affcenter)/.test(url) && obj.data) {
        if (obj.data.uinfo.goldcoin) obj.data.uinfo.goldcoin = "999";
        if (obj.data.uinfo.down_daily_remainders) obj.data.uinfo.down_daily_remainders = 999;
        if (obj.data.uinfo.play_daily_remainders) obj.data.uinfo.play_daily_remainders = 999;
        if (obj.data.uinfo.minivod_play_daily_remainders) obj.data.uinfo.minivod_play_daily_remainders = 666;
        if (obj.data.uinfo.minivod_down_daily_remainders) obj.data.uinfo.minivod_down_daily_remainders = 666;
        if (obj.data.uinfo.curr_group.minup) obj.data.uinfo.curr_group.minup = "1000000";
        if (obj.data.uinfo.curr_group.gname) obj.data.uinfo.curr_group.gname = "尊贵VIP";
        if (obj.data.uinfo.curr_group.gicon) obj.data.uinfo.curr_group.gicon = "V6";
        if (obj.data.uinfo.curr_group.gid) obj.data.uinfo.curr_group.gid = "6";
        if (obj.data.uinfo.next_group.gname) obj.data.uinfo.next_group.gname = "尊贵VIP";
        if (obj.data.uinfo.next_group.minup) obj.data.uinfo.next_group.minup = "10";
        if (obj.data.uinfo.next_group.gicon) obj.data.uinfo.next_group.gicon = "V6";
        if (obj.data.uinfo.next_group.gid) obj.data.uinfo.next_group.gid = "6";
        if (obj.data.uinfo) obj.data.uinfo["next_upgrade_need"] = "1";
        if (obj.data.user) {
            obj.data.user.isvip = 1;
            obj.data.user.gids = 001;
            obj.data.user.goldcoin = "999";
            obj.data.user.gicon = "V6";
            obj.data.user.gid = "6";
        }
    }
    if (/\/getGlobalData/.test(url) && obj.data) {
        if (obj.data.app_launch_times_adshow) obj.data.app_launch_times_adshow = 0;
        if (obj.data.sharetext) obj.data.sharetext = "";
        if (obj.data.promotion_earn_dscr) obj.data.promotion_earn_dscr = {};
        if (obj.data.popuptext_v2) obj.data.popuptext_v2 = {};
        if (obj.data.adgroups) obj.data.adgroups = {};
        if (obj.data.Android_adgroups) obj.data.Android_adgroups = {};
        if (obj.data.iOS_adgroups) obj.data.iOS_adgroups = {};
        if (obj.data.newurl) obj.data.newurl = "";
        if (obj.data.appdownurl) obj.data.appdownurl = "";
        if (obj.data.popuptext_Android) obj.data.popuptext_Android = {};
        if (obj.data.adrows) obj.data.adrows = [];
        if (obj.data.popuptext_iOS) obj.data.popuptext_iOS = {};
        if (obj.data.appver) obj.data.appver = {};
    }
    if (/\/index/.test(url) && obj.data) {
        if (obj.data.pcsliderows) obj.data.pcsliderows = [];
        obj.data.toString().replace(/\"isvip":"(\d)"/g, '"isvip": "1"');
        v2 = obj.data.v2sliderows;
        if (v2) {
            v2.splice(0, 4);
            v2.pop();
        }
        if (obj.data.mbsliderows) obj.data.mbsliderows = [];
        if (obj.data.sliderows) obj.data.sliderows = [];
    }
    if (/\/reqplay/.test(url) && obj) {
        obj.retcode = 0;
        if (obj.data.hasOwnProperty("httpurl_preview") && obj.data) {
            var playurl = obj.data["httpurl_preview"];
            obj.data["httpurl"] = playurl;
        };
    }
    if (/\/vod/.test(url) && obj) {
        obj.toString().replace(/\"isvip":"(\d)"/g, '"isvip": "1"');
    }
    $done({ body: JSON.stringify(obj) });
} else {
    $done({})
}