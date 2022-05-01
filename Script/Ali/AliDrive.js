let body = JSON.parse($response.body);
if (body.result) {
    body.result = body.result.filter(element => !(element['appCode'] == (subscription|giftshop|adrive)));
}
$done({ body: JSON.stringify(body) });