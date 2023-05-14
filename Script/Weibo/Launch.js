/*
README：https://github.com/yichahucha/surge/tree/master
 */

const path1 = "/interface/sdk/sdkad.php";
const path2 = "/wbapplua/wbpullad.lua";

const url = $request.url;
var body = $response.body;

if (url.indexOf(path1) != -1) {
    let re = /\{.*\}/;
    body = body.match(re);
    var obj = JSON.parse(body);
    if (obj.background_delay_display_time) obj.background_delay_display_time = 60 * 60 * 24 * 365;
    if (obj.show_push_splash_ad) obj.show_push_splash_ad = false;
    if (obj.ads) obj.ads = [];
    body = JSON.stringify(obj) + 'OK';
}

if (url.indexOf(path2) != -1) {
    var obj = JSON.parse(body);
    if (obj.cached_ad && obj.cached_ad.ads) obj.cached_ad.ads = [];
    body = JSON.stringify(obj);
    if (body.hasOwnProperty('cached_ad') && body['cached_ad'].hasOwnProperty('ads'))
for (let item of body['cached_ad']['ads']) {
    item['duration'] = 0
    // 2026-11-30 15:48:24
    item['end_date'] = '1796024904'
    item['start_date'] = '1796024914'
    }
    body = JSON.stringify(body);
}

$done({ body });
