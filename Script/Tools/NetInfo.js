/**
 * Surge 网络信息面板
 */

 const { wifi, v4 } = $network;
 const v4IP = v4.primaryAddress;
 let url = "https://myip.ipip.net/json";

 ;(async () => {
     if (!v4IP) {
         $done({
             title: "未连接网络",
             content: "请检查网络连接",
             icon: "airplane",
             "icon-color": "#ff9800"
         });
     }
    const ip = v4IP;
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
            content: `内部 IP：${ip} \n`
                + (wifi.ssid ? `路由 IP：${router}\n` : "")
                + `外部 IP：${externalIP}\n`
                + `IP 信息：${info}`,
            icon: wifi.ssid ? "wifi" : "antenna.radiowaves.left.and.right",
            "icon-color": wifi.ssid ? "#007AFE" : "#35C759"
        };
        $done(body);
    });
 })();