var body = $response.body;
var obj = JSON.parse(body);

obj.vipList = [{
    "expireDate": "20290609",
    "isAutoDeduct": "0",
    "isVip": "1",
    "isYear": "1",
    "payId": "0",
    "payName": "---",
    "register": "0",
    "vasid": "2",
    "vasType": "5",
    "vipDayGrow": "20",
    "vipGrow": "840",
    "vipLevel": "7"
}]

body = JSON.stringify(obj);
$done({ body }); 