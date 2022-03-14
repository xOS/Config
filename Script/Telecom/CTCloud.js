var body = JSON.parse($response.body);
body['data'].forEach((element, index) => {
    if (element.type == 'adCampaignServiceImpl' || element.type == '/SERVICE_RESOURCE_PLAZA') {
        body['data'].splice(index, 1)
    }
})
$done({ body: JSON.stringify(body) });