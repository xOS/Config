let body = JSON.parse($response.body);
if (body.result) {
    body.result = body.result.filter(element => !(element['appCode'] == 'subscription'));
    body.result = body.result.filter(element => !(element['appCode'] == 'giftshop'));
    body.result = body.result.filter(element => !(element['appCode'] == 'adrive'));
}
$done({ body: JSON.stringify(body) });