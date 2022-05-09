let body = $response.body;
body = JSON.parse(body);
// adType: '推荐/广告', type: ad
if (body.hasOwnProperty('data'))
    body['data']['list'] = body['data']['list'].filter(element => !(element['type'] === 'ad'));
body = JSON.stringify(body);
$done({ body });