let body = $response.body
obj = JSON.parse(body)
delete obj['mcn_user_info']
if (obj.vip_info) {
    obj.vip_info.is_vip = true;
    obj.vip_info.entrance_v2 = null;
    obj.vip_info.entrance = null;
    obj.vip_info.entrance_new = null;
}
obj.badge = [{
    "type": "identity",
    "description": "系统管理员"
}];
obj.is_unicom_free = true;
obj.has_daily_recommend_permission = true;
obj.verify_status = 'applied';
obj.is_event14d_member = true;
obj.is_professional = true;
obj.has_add_baike_summary_permission = true;
obj.vip = null;
obj.is_vip = true;
body = JSON.stringify(obj)
$done({ body })