let body = $response.body
body = JSON.parse(body)
body['data'].forEach((element, index) => {
    if (element['card_type'] == 'slot_event_card' || element.hasOwnProperty('ad')) {
        body['data'].splice(index, 1)
    }
})
if (body.data && body.data.length > 0) {
    for (var i in body.data) {
        let type = body.data[i].extra.type;
        if (type == 'zvideo') {
            body.data.splice(i, 1);
        }
        if (body.data[i].common_card.feed_content.hasOwnProperty('video')) body.data.splice(i, 1);
    }
}
body = JSON.stringify(body)
$done({ body })