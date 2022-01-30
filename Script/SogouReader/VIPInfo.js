var obj = JSON.parse($response.body);
obj.vip.vipStatus = 1;
obj.vip.vipDays = 99;
obj.vip.enjoyDayCount = 999;
obj.freeVip = true;
if (obj.hasOwnProperty('userInfo')) {
    obj.userInfo.rmb = 999;
    obj.userInfo.todayGl = 1;
    obj.userInfo.gl = 1;
    obj.userInfo.extraStatus = 1;
}
$done({ body: JSON.stringify(obj) });