
if (!$response.body) {
  $done({});
} else {
  var body = JSON.parse($response.body);
  const personal = "/personal";
  const svip = "/vip/info";
  const url = $request.url;

  if (url.indexOf(svip) != -1) {
    if (body.vipList) {
      body.vipList[0] = {
        "code": "svip",
        "promotedAt": 1651254422,
        "expire": 4102349206,
        "name": "超级会员"
      };
      body.identity = 'svip';
    }
  }
  if (url.indexOf(personal) != -1) {
    if (body.personal_rights_info) {
      body.personal_rights_info.spu_id = 'svip';
      body.personal_rights_info.name = '超级会员';
    }
  }

  $done({ body: JSON.stringify(body) });
}

