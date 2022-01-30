let body = $response.body;
body = JSON.parse(body);
if (body.hasOwnProperty('data'))
    body['data'] = body['data'].filter(element => !(element['is_ads'] == true));
body = JSON.stringify(body);
$done({ body });