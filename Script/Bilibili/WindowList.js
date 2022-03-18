var obj = JSON.parse($response.body);
if (obj.body.list) {
    obj.data.list[0].track_params.vip_status = 1;
    obj.data.list[0].track_params.vip_type = 2;
}
$done({ body: JSON.stringify(obj) });