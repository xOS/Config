var obj = JSON.parse($response.body);
obj['features']['cdma_fallback'] = true;
obj['features']['e911_accepted'] = true;
obj['features']['is_employee'] = true;
obj['purchases_timestamp'] = '2020-06-01T05:09:06Z';
obj['forwarding_expiry'] = '2099-12-30';
obj['forwarding_status'] = '1';
obj['phone_expiry'] = '2099-12-30';
obj['expiry'] = '2099-12-30';
obj['show_ads'] = false;
obj['premium_calling'] = true;
obj.voice_autorenew = 1;
obj.ad_categories = null;
$done({body: JSON.stringify(obj)});