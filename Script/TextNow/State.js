var obj = JSON.parse($response.body);
if(obj.state) obj['state'] = "PREMIUM_SUBSCRIPTION";
if(obj.show_ads) obj['show_ads'] = false;
if(obj.premium_calling) obj['premium_calling'] = true;
if(obj.platform) obj['platform'] = "TN_IOS_PREMIUM";
obj['code'] = "10000";
if(obj.result)
 {
obj['result']['state'] = "PREMIUM_SUBSCRIPTION";
obj['result']['show_ads'] = false;
obj['result']['premium_calling'] = true;
obj['result']['platform'] = "TN_IOS_PREMIUM";
obj['result']['code'] = "10000";
if(obj.result.expiryTime) obj['result']['expiryTime']['date'] = "2099-12-30 15:06:08.000000";
}
$done({body: JSON.stringify(obj)});