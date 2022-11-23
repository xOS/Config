var obj = JSON.parse($response.body);
const vipCenter = "/vipcenter/home";
const userInfo = "/activity/userinfo";
const mall = "/avatargj/mall";
const cardBackground = "/cardbackground/index";
const url = $request.url;
if (url.indexOf(vipCenter) != -1) {
 let data = obj.replace(/gq_/g, 'hy_');
 let obj = data.JSON.parse(data);
    if (obj && obj.data && obj.data.baseInfo) {
        obj.data.baseInfo.user_info.s_type = 3;
        obj.data.baseInfo.user_info.desc = '终身会员';
        obj.data.baseInfo.user_info.level = '8';
        obj.data.baseInfo.user_info.expired_days = 9999;
        obj.data.baseInfo.user_info.curtab.cashier_tab_id = '0';
        obj.data.baseInfo.user_info.mbtype = 12;
        obj.data.baseInfo.user_info.identity = '1,0';
        obj.data.baseInfo.user_info.svip_desc = '您已经是微博超级会员';
        obj.data.baseInfo.user_info.tip_desc = '2199年12月21日 到期';
        obj.data.baseInfo.user_info.vip_identity = 3;
        obj.data.baseInfo.user_info.curtab.name = "svip";
        obj.data.baseInfo.vip_identity = 3;
    }
    if (obj.data.gobuy) {
        obj.data.gobuy = {};
    }
    if(obj.data.card_list && obj.data.card_list[0].group){
    obj.data.card_list[0].group[0].show_act = false;
    obj.data.card_list[0].group[0].show_alert = true;
    obj.data.card_list[0].group[0].text = "2199年12月21日 SVIP到期";
    obj.data.card_list[0].group[0].actbg_config = {};
    obj.data.card_list[0].group[0].show_act = false;
    obj.data.card_list[0].group[0].actbg_config = {};
    
    obj.data.card_list[0].group[1].show_act = false;
    obj.data.card_list[0].group[1].show_alert = true;
    obj.data.card_list[0].group[1].text = "2199年12月21日 VIP到期";
    obj.data.card_list[0].group[1].actbg_config = {};
    obj.data.card_list[0].group[1].show_act = false;
    obj.data.card_list[0].group[1].actbg_config = {};
    if(obj.data.card_list[0].growdate_sort) obj.data.card_list[0].growdate_sort = [
  "SVIP：2199年12月21日 到期",
  "VIP：2199年12月21日 到期"
];
    obj.data.card_list[0].group[1].img = 'https://h5.sinaimg.cn/upload/1004/14/2021/01/22/VIIPcard3x.png';
    if(obj.data.card_list[0].group[1].btn_config){
    obj.data.card_list[0].group[1].btn_config.text = '续费';
    obj.data.card_list[0].group[1].btn_config.link = 'sinaweibo://mppopupwindow?wbx_hide_close_btn=true&wbx_bg_view_dismiss=true&scheme=sinaweibo%3A%2F%2Fwbox%3Fid%3Dn1htatg0fm%26page%3Dpages%2Fcashier%2Fcashier%26cashier_id%3D3%26F%3Dvipcenter_userinfo_t_hy';
    obj.data.card_list[0].group[1].bg_config.img = 'https://h5.sinaimg.cn/upload/1004/14/2021/01/22/VIPbackground3x.png';
    obj.data.card_list[0].group[1].bg_config.link = 'sinaweibo://mppopupwindow?wbx_hide_close_btn=true&wbx_bg_view_dismiss=true&scheme=sinaweibo%3A%2F%2Fwbox%3Fid%3Dn1htatg0fm%26page%3Dpages%2Fcashier%2Fcashier%26cashier_id%3D3%26F%3Dvipcenter_userinfo_t_hy';
     }
     if(obj.data.card_list[0].group[0].btn_config){
    obj.data.card_list[0].group[0].btn_config.text = '续费';
     }
    }
    if (obj.data.baseInfo.user_info.type != 1) {
        obj.data.baseInfo.user_info.type = 1;
        let i = obj.data.card_list.length - 2;
        obj.data.card_list.splice(1, i);
    }
    else if (obj.data.card_list) {
        obj.data.card_list = obj.data.card_list.filter(element => !(element['m_id'] == '1520'));
        obj.data.card_list = obj.data.card_list.filter(element => !(element['alias'] == 'Notice'));
        obj.data.card_list = obj.data.card_list.filter(element => !(element['m_id'] == '3238'));
        obj.data.card_list = obj.data.card_list.filter(element => !(element['m_id'] == '1460'));
        obj.data.card_list = obj.data.card_list.filter(element => !(element['m_id'] == '2630'));
        obj.data.card_list = obj.data.card_list.filter(element => !(element['m_id'] == '2080'));
        obj.data.card_list = obj.data.card_list.filter(element => !(element['m_id'] == '2480'));
        obj.data.card_list = obj.data.card_list.filter(element => !(element['m_id'] == '2530'));
        obj.data.card_list = obj.data.card_list.filter(element => !(element['m_id'] == '3263'));
        obj.data.card_list = obj.data.card_list.filter(element => !(element['m_id'] == '3363'));
        obj.data.card_list = obj.data.card_list.filter(element => !(element['m_id'] == '2280'));
    }
    if (obj.data.card_list.Notice) obj.data.card_list.Notice = {};
}

if (url.indexOf(userInfo) != -1) {
    if (obj && obj.data) {
        obj.data.is_vip = 3;
    }
}

if (url.indexOf(mall) != -1 || url.indexOf(cardBackground) != -1) {
    if (obj && obj.data) {
        obj.data.isVip = true;
        obj.data.novip_status = 0;
        obj.data.vip_level = 7;
        obj.data.vip_end_date = '2199-12-21';
        obj.data.pay_info = {
            'is_baoyue': false,
            'is_ios': true,
            'topInfo': null,
            'taocanInfo': null
        };
        obj.data.vip_info = {
            'novip_status': 0,
            'vip_level': 7,
            'is_vip': true,
            'vip_end_date': '2199-12-21'
        }
        obj.data.payPop = 0;
    }
}

$done({ body: JSON.stringify(obj) });