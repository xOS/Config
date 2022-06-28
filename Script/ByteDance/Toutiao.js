let body = JSON.parse($response.body);
const feed = "\/api\/news\/feed\/v88";
const wallet = "\/wallet\/portal\/api\/v3\/prefetch\/settings";
const url = $request.url;

if (body.data) {
    if (url.indexOf(feed) != -1) {
        if (body.data.length > 0) {
            var data = body.data;
            for (var i in data) {
                let content = JSON.parse(data[i].content);
                if (content.raw_data && content.raw_data.board) break;
                else if (content.abstract == '' || content.card_title == '小视频' || content.video_source == 'ugc_video' || content.video_style == 2 || content.has_video == true) {
                    data[i] = {};
                    //break;
                }
            }
        }
    }

    if (url.indexOf(wallet) != -1) {
        if (body.data.GetSettings.Sections) {
            body.data.GetSettings.Sections[3].services = body.data.GetSettings.Sections[3].services.filter(element => !(element['id'] == '3'));

            body.data.GetSettings.Sections[3].services = body.data.GetSettings.Sections[3].services.filter(element => !(element['id'] == '13'));

            body.data.GetSettings.Sections[3].services = body.data.GetSettings.Sections[3].services.filter(element => !(element['id'] == '4'));

            body.data.GetSettings.Sections[3].services = body.data.GetSettings.Sections[3].services.filter(element => !(element['id'] == '2'));
            body.data.GetSettings.Sections = body.data.GetSettings.Sections.filter(element => !(element['componentName'] == 'activity-banner'));

            body.data.GetSettings.Sections = body.data.GetSettings.Sections.filter(element => !(element['componentName'] == 'cswiper'));
            body.data.GetSettings.Sections = body.data.GetSettings.Sections.filter(element => !(element['label'] == '第三方服务'));
        }
    }
}

$done({ body: JSON.stringify(body) });