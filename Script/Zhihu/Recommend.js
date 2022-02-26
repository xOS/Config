let body = $response.body
body = JSON.parse(body)
body['data'].forEach((element, index) => {
    if (element['card_type'] == 'slot_event_card' || element.hasOwnProperty('ad')) {
        body['data'].splice(index, 1)
    }
})
if (body.data && body.data.length > 0) {
    var data = body.data;
    for (var i in data) {
        let content = JSON.parse(data[i].brief);
        if (content.type == 'zvideo') {
            data[i] = {};
        }
    }
}
body = JSON.stringify(body)
$done({ body })