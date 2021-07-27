let body = JSON.parse($response.body);
if (body['data'])
    body['data'] = body['data']['list'].filter(element => (element['type'] === 'ad'));
$done({body: JSON.stringify(body)});