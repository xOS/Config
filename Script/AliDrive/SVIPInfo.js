let body = JSON.parse($response.body);
if (body) {
  body = {
    "vipList": [
      {
        "code": "svip",
        "promotedAt": 1651254422,
        "expire": 1924883222,
        "name": "超级会员"
      }
    ],
    "identity": "svip",
    "icon": "https:\/\/gw.alicdn.com\/imgextra\/i1\/O1CN01p5OON61LmDrgkaaGT_!!6000000001341-2-tps-40-40.png"
  }
}
$done({ body: JSON.stringify(body) });