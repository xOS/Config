let body = $response.body;
body = JSON.parse(body);
var data = body.data;
if (data.length > 0) {
    for (var i in data) {
        let element = data[i];
        if (element.ads_info || element.is_ads == true) {
            data[i] = {};
            delete data[i];
        }
    }
}
body = JSON.stringify(body);
$done({ body });