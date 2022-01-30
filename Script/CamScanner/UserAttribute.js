let obj = JSON.parse($response.body);
obj.data = {
  "edu_auth": {
    "account": "2013110680@stu.hznu.edu.cn",
    "auth_time": 1642630061,
    "expiry": 4072543930
  },
  "psnl_vip_property": {
    "expiry": "4072543930"
  }
};
$done({ body: JSON.stringify(obj) });