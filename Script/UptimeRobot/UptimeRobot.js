var body = JSON.parse($response.body);
if (body.account) {
    body.account.sms_credits = 9000;
    body.account.payment_processor = true;
    body.account.subscription_expiry_date = '2099-12-21';
}
$done({ body: JSON.stringify(body) });