let body = JSON.parse($response.body);
if (body.data && body.data.length > 0) {
    var data = body.data;
    for (var i in data) {
        let content = JSON.parse(data[i].content);
        if (content.abstract == '' || content.card_title == '小视频' || content.video_source == 'ugc_video' || content.video_style == 2 || content.has_video == true) {
            data[i] = {};
            //break;
        }
    }
}
$done({ body: JSON.stringify(body) });