/**
 * Surge 网络信息面板
 */

 const { wifi, v4 , v6 } = $network;
 const IPv4 = v4.primaryAddress;
 const radio = $network["cellular-data"].radio;
 const IPv6 = v6.primaryAddress ? v6.primaryAddress.replace(/^(.{8}).+(.{8})$/, "$1****$2") : null;
 let url = "https://myip.ipip.net/json";

 ;(async () => {
     if (!IPv4) {
         $done({
             title: "未连接网络",
             content: "请检查网络连接",
             icon: "airplane",
             "icon-color": "#ff9800"
         });
     }
    const ip = IPv4;
    const router = wifi.ssid ? v4.primaryRouter : undefined;

    $httpClient.get(url, function(error, response, data){
        data = JSON.parse(data);
        const externalIP = data['data']['ip'];
        const region = data['data']['location'][1];
        const city = data['data']['location'][2];
        const isp = data['data']['location'][4];

        if(city != '' ){
            info = region + ' ' + city + ' ' + isp;
        }
        else {
            info = region + ' ' + isp;
        };
        
        const body = {
            title: wifi.ssid || "蜂窝数据",
            content: (radio ? `网络制式：${radio}\n` : "")
                + `内部 IPv4：${ip} \n`
                + (wifi.ssid ? `路由 IPv4：${router}\n` : "")
                + `外部 IPv4：${externalIP}\n`
                + (IPv6 ? `外部 IPv6：${IPv6}\n` : "")
                + `IPv4 信息：${info}`,
            icon: wifi.ssid ? "wifi" : "antenna.radiowaves.left.and.right",
            "icon-color": wifi.ssid ? "#007AFE" : "#35C759"
        };
        $done(body);
    });
 })();