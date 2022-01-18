let body = JSON.parse($response.body);
if (body.data.GetSettings.Sections) {
    body.data.GetSettings.Sections[3].services = body.data.GetSettings.Sections[3].services.filter(element => !(element['id'] == '3'));

    body.data.GetSettings.Sections[3].services = body.data.GetSettings.Sections[3].services.filter(element => !(element['id'] == '13'));

    body.data.GetSettings.Sections[3].services = body.data.GetSettings.Sections[3].services.filter(element => !(element['id'] == '4'));

    body.data.GetSettings.Sections[3].services = body.data.GetSettings.Sections[3].services.filter(element => !(element['id'] == '2'));
    body.data.GetSettings.Sections = body.data.GetSettings.Sections.filter(element => !(element['componentName'] == 'activity-banner'));

    body.data.GetSettings.Sections = body.data.GetSettings.Sections.filter(element => !(element['componentName'] == 'cswiper'));
    body.data.GetSettings.Sections = body.data.GetSettings.Sections.filter(element => !(element['label'] == '第三方服务'));
}
$done({ body: JSON.stringify(body) });