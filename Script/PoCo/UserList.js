var obj = JSON.parse($response.body);
if (obj.data) {
    obj.data.list = null;
    obj.data.has_more = false;
}
$done({ body: JSON.stringify(obj) });