var obj = JSON.parse($response.body);
obj.userInfo.user_ability_extend = 1;
obj.userInfo.verified_type_ext = 1;
obj.userInfo.verified_type = 0;
const verified_detail = {
  "custom": 1,
  "data": [
    {
      "key": 1,
      "weight": 10,
      "sub_key": 0,
      "desc": "最美小仙女"
    }
  ]
};
obj.userInfo.geo_enabled = false;
obj.userInfo.verified_detail = verified_detail;
obj.userInfo.svip = 1;
obj.userInfo.verified_reason = '最美小仙女';
obj.userInfo.statuses_count = 0;
obj.userInfo.orange_v = '最美小仙女';
obj.userInfo.verified_level = 2;
obj.userInfo.avatargj_id = 'gj_vip_583';
obj.userInfo.verified = true;
obj.userInfo.has_ability_tag = 1;
obj.userInfo.type = 1;
obj.userInfo.star = 1;
obj.userInfo.friendships_relation = 2;
obj.userInfo.icons = [
  {
    "url": "https:\/\/h5.sinaimg.cn\/upload\/1004\/409\/2021\/06\/08\/feed_icon_100vip_7.png",
    "scheme": "https:\/\/me.verified.weibo.com\/fans\/intro?topnavstyle=1"
  }
];
const verified = {
  "scheme": "",
  "icon_video_style_dark": "https:\/\/h5.sinaimg.cn\/upload\/1059\/799\/2021\/04\/16\/video_verified_dark.png",
  "icon_video_style": "https:\/\/h5.sinaimg.cn\/upload\/1059\/799\/2021\/04\/16\/video_verified.png",
  "icon_dark": "https:\/\/h5.sinaimg.cn\/upload\/1059\/799\/2020\/05\/19\/verified-dark.png",
  "actionlog": {
    "uicode": "10000198",
    "cardid": "",
    "luicode": "10000011",
    "act_code": 4630,
    "ext": "name:verified",
    "fid": "",
    "lfid": "profile_me",
    "oid": ""
  },
  "icon": "https:\/\/h5.sinaimg.cn\/upload\/1059\/799\/2020\/05\/19\/verified.png",
  "desc": "最美小仙女"
};
if (obj.userInfo.infoList[0].actionlog.ext != 'name:verified') {
  obj.userInfo.infoList.splice(0, 0, verified);
} else {
  obj.userInfo.infoList[0].desc = '最美小仙女';
}
obj.userInfo.badge = {
  "ylpshuidao_2021": 1,
  "gongyi_level": 1,
  "travel_2017": 1,
  "jvhuasuan_2019": 1,
  "cddyh_2020": 1,
  "taohuayuan_2019": 1,
  "china_2020": 1,
  "companion_card": 1,
  "wenchuan_10th": 1,
  "mi_2020": 1,
  "memorial_2018": 1,
  "yxlmlpl_2021": 1,
  "gongjiri_2019": 1,
  "hongbaofei_2019": 1,
  "qichenqiche_2021": 1,
  "yingxionglianmengs11_2021": 1,
  "school_2020": 1,
  "biyeji_2021": 1,
  "fishfarm_2021": 1,
  "unread_pool_ext": 1,
  "dailv_2020": 1,
  "wbzy_2018": 1,
  "kpl_2018": 1,
  "dzwbqlx_2019": 1,
  "daiyan": 1,
  "vip_activity2": 4,
  "ant_2019": 1,
  "zjszgf_2020": 1,
  "panda": 1,
  "womensday_2018": 1,
  "dzwbqlx_2016": 1,
  "uve_icon": 1,
  "wenda_v2": 1,
  "wbzy_2019": 1,
  "graduation_2020": 1,
  "zhonghuacishanri_2021": 1,
  "hongrenjie_2020": 1,
  "bind_taobao": 1,
  "denglong_2019": 1,
  "video_attention": 1,
  "wusi_2019": 1,
  "test_icon": 1,
  "lol_gm_2017": 1,
  "cz_wed_2017": 1,
  "china_2019": 1,
  "yiqijuan_2018": 1,
  "feiyan_2020": 1,
  "cuccidlam12_2021": 1,
  "unread_pool": 1,
  "lvzhilingyang_2021": 1,
  "renrengongyijie_2021": 1,
  "dailv_2018": 1,
  "weibozhiyexianxia_2021": 1,
  "hongbaofei2022_2021": 1,
  "kaixue21_2021": 1,
  "user_name_certificate": 1,
  "super_star_2017": 1,
  "uefa_euro_2016": 1,
  "hongbaofeifuniu_2021": 1,
  "gaokao_2021": 1,
  "ouzhoubei_2021": 1,
  "avengers_2019": 1,
  "daka_2020": 1,
  "shequweiyuan_2021": 1,
  "weibo_display_fans": 1,
  "national_day_2018": 1,
  "dailv_2019": 1,
  "hongbao_2020": 2,
  "weibozhiye_2021": 1,
  "suishoupai_2018": 1,
  "green_2020": 1,
  "nike_2020": 1,
  "cuccidlam20_2021": 1,
  "wennuanji_2020": 1,
  "aizi_2020": 1,
  "yinyuejie21_2021": 1,
  "weibozhiyebobao_2021": 1,
  "aoyun_2021": 1,
  "league_badge": 1,
  "anniversary": 1,
  "uc_domain": 1,
  "shuang11_2019": 1,
  "lol_msi_2017": 1,
  "enterprise": 1,
  "league_badge_2018": 1,
  "starlight_2019": 1,
  "hongkong_2019": 1,
  "pc_new": 6,
  "fools_day_2016": 1,
  "cishan_2019": 1,
  "wenda": 1,
  "vip_activity1": 1,
  "hongbaofeijika_2021": 1,
  "hongbaofei_2022": 1,
  "kangyi_2020": 1,
  "meilizhongguo_2018": 1,
  "earth_2019": 1,
  "vpick_2020": 1,
  "earthguarder_2021": 1,
  "disney5_2021": 1,
  "cuccidlam25_2021": 1,
  "zhongcaouser_2021": 1,
  "xiaominewlogo_2021": 1,
  "zongyiji": 1,
  "kfc_2020": 1,
  "yuanlongping_2021": 1,
  "dailu_2021": 1,
  "asiad_2018": 1,
  "fu_2019": 1,
  "double11_2018": 1,
  "zaolang_2020": 1,
  "brand_account_2021": 1,
  "weishi_2019": 1,
  "v_influence_2018": 1,
  "hope_2020": 1,
  "dongaohui_2022": 1,
  "family_2019": 1,
  "hongrenjie_2021": 1,
  "daqi_2019": 1,
  "gongyi": 1,
  "discount_2016": 1,
  "gongyi_2020": 1,
  "nihaoshenghuojie_2021": 1,
  "qixi_2018": 1,
  "qianbaofu_2021": 1,
  "china_2019_2": 1,
  "relation_display": 1,
  "self_media": 1,
  "kdx_2019": 1,
  "nissan_2020": 1,
  "weibozhiye_2020": 1,
  "follow_whitelist_video": 1,
  "movie_2020": 1,
  "lol_s8": 1,
  "yijia7_2020": 1,
  "zhongcaoguan_2021": 1,
  "party_cardid_state": 1,
  "hongrenjie_2019": 1,
  "shouhuan_2019": 1,
  "worldcup_2018": 1,
  "kfcflag_2021": 1,
  "super_star_2018": 1,
  "social_content": 1,
  "taobao": 1,
  "dailv": 1,
  "status_visible": 1,
  "inspector": 1,
  "suishoupai_2019": 1,
  "rrgyj_2019": 1,
  "macao_2019": 1
};
$done({ body: JSON.stringify(obj) });