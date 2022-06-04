const { wifi, v4 } = $network;
const v4IP = v4.primaryAddress;
if (!v4IP) {
    $done({
        title: "未连接网络",
        content: "请检查网络连接",
        icon: "airplane",
        "icon-color": "#ff9800"
    });
} else {
    $httpClient.get("https://api.qste.com/version", function (error, response, data) {
        var str = data.toString();
        var ver = str.replace(/backend\n$/gm, "").replace("subconverter ", "").replace(/\s+/g, "");
        var reg = RegExp(/backend/);
        if (str.match(reg)) {
            $done({
                title: "服务正常",
                content: 'API' + ' ' + ver + ' ' + '服务正常',
                style: 'good',
            });
        } else {
            $done({
                title: "服务异常",
                content: "API 服务异常",
                style: 'error'
            });
        }
    });
}