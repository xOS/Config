var obj = JSON.parse($response.body); 
obj['textnow_wireless_store_banner']['banner_enabled'] = 0;
obj['android']['native_ads'] = {};
obj['android']['promo_campaign_ad'] = {};
obj['android']['banners'] = [];
obj['android']['banner_group'] = [];
obj['ad'] = {};
$done({body: JSON.stringify(obj)});