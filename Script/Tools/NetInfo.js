/**
 * Surge 网络信息面板
 * @author: Peng-YM
 */
const $ = API("NetInfo", true);
const $http = HTTP();

const { wifi, v4 } = $network;
const v4IP = v4.primaryAddress;

!(async () => {
    // No network connection
    if (!v4IP) {
        $.done({
            title: "未连接网络",
            content: "请检查网络连接",
            icon: "airplane",
            icon-color: "#ff9800"
        });
        return;
    }
    const ip = v4IP;
    const router = wifi.ssid ? v4.primaryRouter : undefined;

    const resp = await $http.get("https://api.my-ip.io/ip");
    const externalIP = resp.body;

    const body = {
        title: wifi.ssid || "蜂窝数据",
        content: `内部 IP：${ip} \n`
            + (wifi.ssid ? `路由 IP：${router}\n` : "")
            + `外部 IP：${externalIP}`,
        icon: wifi.ssid ? "wifi" : "antenna.radiowaves.left.and.right",
        icon-color: "#079a0d"
    };
    $.done(body);
})();