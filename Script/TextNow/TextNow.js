/*
^https:\/\/api\.textnow\.me\/.+\/users\/.* url script-response-body langkhach/Textnow.js
*/
var obj = JSON.parse($response.body);
obj['features']['cdma_fallback'] = true;
obj['features']['e911_accepted'] = true;
obj['features']['is_employee'] = true;
obj['purchases_timestamp'] = '2020-06-01T05:09:06Z';
obj['forwarding_expiry'] = '2099-12-30';
obj['forwarding_status'] = '1';
obj['phone_expiry'] = '2099-12-30';
obj['expiry'] = '2099-12-30';
obj['state'] = "PREMIUM_SUBSCRIPTION";
obj['show_ads'] = false;
obj['premium_calling'] = true;
obj['platform'] = "TN_IOS_PREMIUM";
obj['code'] = "10000";
obj['result']['state'] = "PREMIUM_SUBSCRIPTION";
obj['result']['show_ads'] = false;
obj['result']['premium_calling'] = true;
obj['result']['platform'] = "TN_IOS_PREMIUM";
obj['result']['code'] = "10000";
obj['textnow_wireless_store_banner']['banner_enabled'] = 0;
obj['android']['native_ads']['in_call']['enabled']  = false;
obj['android']['native_ads']['conversation_list']['enabled']  = false;
obj['android']['native_ads']['default_native_ad'] = {};
obj['android']['native_ads']['outgoing_call_message']['enabled']  = false;
obj['android']['native_ads']['enable_native_ads'] = false;
obj['ad']['native_ads']['conversation_list']['enabled']  = false;
obj['ad']['native_ads']['in_call']['enabled']  = false;
obj['ad']['native_ads']['outgoing_call_message']['enabled']  = false;
obj['ad']['native_ads']['default_native_ad'] = {};
obj['ad']['native_ads']['native_announcement'] = {};
obj['ad']['native_ads']['jsdict'] = [];
obj['ad']['enable_native_ads']= false;
$done({body: JSON.stringify(obj)});