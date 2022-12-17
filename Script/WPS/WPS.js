/*
WPS Office 解锁部分功能

***************************
QuantumultX:

[rewrite_local]
^https?:\/\/[a-z-]*account\.wps\.c(n|om)(:\d+|)\/api\/users url script-response-body https://raw.githubusercontent.com/NobyDa/Script/master/Surge/JS/Wps.js

[mitm]
hostname = *account.wps.cn, *account.wps.com

***************************
Surge4 or Loon:

[Script]
http-response ^https?:\/\/[a-z-]*account\.wps\.c(n|om)(:\d+|)\/api\/users requires-body=1,max-size=-1,script-path=https://raw.githubusercontent.com/NobyDa/Script/master/Surge/JS/Wps.js

[MITM]
hostname = *account.wps.cn, *account.wps.com

**************************/

var body = JSON.parse($response.body);
if (body) {
	body.level = 8;
	body.exp = 9999;
	body.privilege = [
    { spid: "data_recover", times: 0, expire_time: 4133059437 },
    { spid: "ocr", times: 0, expire_time: 4133059437 },
    { spid: "pdf2doc", times: 0, expire_time: 4133059437 },
    { spid: "pdf_merge", times: 0, expire_time: 4133059437 },
    { spid: "pdf_sign", times: 0, expire_time: 4133059437 },
    { spid: "pdf_split", times: 0, expire_time: 4133059437 }
  ];
	body.vip = {
    name: "超级会员",
    has_ad: 0,
    memberid: 40,
    expire_time: 4133059437,
    enabled: [
      { memberid: 40, name: "超级会员", expire_time: 4133059437 },
      { memberid: 20, name: "WPS会员", expire_time: 4133059437 },
      { memberid: 12, name: "稻壳会员", expire_time: 4133059437 }
    ]
  };
	body.expire_time = 4133059437;
  
}
$done({ body: JSON.stringify(body) });