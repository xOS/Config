let body = JSON.parse($response.body);
if (body.data) {
    body.data.visited_user_identity_info = {
  "is_moderator": 1,
  "moderator_category": 1,
  "moderator_str": "上海",
  "is_editor": 1,
  "is_pocosite_master": 1,
  "is_pocosite_member": 1,
  "pocosite_id": 1,
  "pocosite_name": "楠格",
  "pocosite_master_str": "管理员",
  "is_user_favourite": 1,
  "user_favourite_category": 1,
  "user_favourite_str": "最美小仙女",
  "is_school_tutor": 1,
  "tutor_school_id": 0,
  "tutor_school_name": "楠格",
  "tutor_school_url": "",
  "is_school_student": 1,
  "school_student_list": [

  ],
  "is_vip": 1,
  "official_wechat_info": {
    "wechat_qrcode_url": "",
    "wechat_remark": "",
    "wechat_miniprogram_id": "",
    "wechat_miniprogram_path": "",
    "wechat_miniprogram_title": "",
    "wechat_miniprogram_type": 0
  }
};
body.data.identity_info = {
  "is_moderator": 1,
  "moderator_category": 1,
  "moderator_str": "上海",
  "is_editor": 1,
  "is_pocosite_master": 1,
  "is_pocosite_member": 1,
  "pocosite_id": 1,
  "pocosite_name": "楠格",
  "pocosite_master_str": "管理员",
  "is_user_favourite": 1,
  "user_favourite_category": 1,
  "user_favourite_str": "最美小仙女",
  "is_school_tutor": 1,
  "tutor_school_id": 0,
  "tutor_school_name": "楠格",
  "tutor_school_url": "",
  "is_school_student": 1,
  "school_student_list": [

  ],
  "is_vip": 1,
  "official_wechat_info": {
    "wechat_qrcode_url": "",
    "wechat_remark": "",
    "wechat_miniprogram_id": "",
    "wechat_miniprogram_path": "",
    "wechat_miniprogram_title": "",
    "wechat_miniprogram_type": 0
  }
};
}
$done({ body: JSON.stringify(body) });