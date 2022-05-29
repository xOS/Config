var obj = JSON.parse($response.body);
const user = "\/users";
const wallet = "\/wallet\?";
const subscription = "\/subscription\?";
const premium_state = "\/premium_state\?";
const url = $request.url;

if (url.indexOf(user) != -1) {
    if (obj) {
        obj.purchases_timestamp = '2020-06-01T05:09:06Z';
        obj.forwarding_expiry = '2099-12-30';
        obj.forwarding_status = '1';
        obj.phone_expiry = '2099-12-30';
        obj.expiry = '2099-12-30';
        obj.show_ads = false;
        obj.premium_calling = true;
        obj.credits = 99999;
        obj.ad_categories = null;
    }
}

if (url.indexOf(wallet) != -1 || url.indexOf(subscription) != -1 || url.indexOf(premium_state) != -1) {
    if (obj.state) obj.state = "PREMIUM_SUBSCRIPTION";
    if (obj.show_ads) obj.show_ads = false;
    if (obj.premium_calling) obj.premium_calling = true;
    if (obj.platform) obj.platform = "TN_IOS_PREMIUM";
    if (obj.result) {
        obj.result.state = "PREMIUM_SUBSCRIPTION";
        obj.result.show_ads = false;
        obj.result.premium_calling = true;
        obj.result.platform = "TN_IOS_PREMIUM";
        obj.result.code = "10000";
        if (obj.result.expiryTime) obj.result.expiryTime.date = "2099-12-30 15:06:08.000000";
        obj.result.textnow_credit = 99999;
        obj.result.account_balance = 99999;
    }
    obj.code = "10000";
}
$done({ body: JSON.stringify(obj) });