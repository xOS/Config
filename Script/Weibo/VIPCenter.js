var obj = JSON.parse($response.body); 
obj.data.baseInfo.user_info.s_type = 1;
obj.data.baseInfo.user_info.desc = '永久会员';
obj.data.baseInfo.user_info.level = '7';
obj.data.baseInfo.user_info.expired_days = 0;
obj.data.baseInfo.user_info.curtab.cashier_tab_id = '0';
obj.data.baseInfo.user_info.mbtype = 12;
obj.data.baseInfo.user_info.identity = '1,0';
obj.data.baseInfo.user_info.svip_desc = '您已经是微博高级会员';
obj.data.card_list[0].img = 'https://h5.sinaimg.cn/upload/1004/14/2021/01/22/VIIPcard3x.png';
obj.data.card_list[0].btn_config.link = 'sinaweibo://mppopupwindow?wbx_hide_close_btn=true&wbx_bg_view_dismiss=true&scheme=sinaweibo%3A%2F%2Fwbox%3Fid%3Dn1htatg0fm%26page%3Dpages%2Fcashier%2Fcashier%26cashier_id%3D3%26F%3Dvipcenter_userinfo_t_hy';
obj.data.card_list[0].bg_config.img = 'https://h5.sinaimg.cn/upload/1004/14/2021/01/22/VIPbackground3x.png';
obj.data.card_list[0].bg_config.link = 'sinaweibo://mppopupwindow?wbx_hide_close_btn=true&wbx_bg_view_dismiss=true&scheme=sinaweibo%3A%2F%2Fwbox%3Fid%3Dn1htatg0fm%26page%3Dpages%2Fcashier%2Fcashier%26cashier_id%3D3%26F%3Dvipcenter_userinfo_t_hy';
if (obj.data.baseInfo.user_info.type != 1){
    obj.data.baseInfo.user_info.type = 1;
    obj.data.card_list.splice(1,13);
}
$done({body: JSON.stringify(obj)});