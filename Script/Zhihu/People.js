let body = $response.body
body = JSON.parse(body)
delete body['mcn_user_info']
if (body.vip_info) body.vip_info.is_vip = true;
body.is_unicom_free = true;
body.has_daily_recommend_permission = true;
body.is_professional = true;
body = JSON.stringify(body)
$done({ body })