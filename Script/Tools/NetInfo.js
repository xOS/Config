/**
 * Surge 网络信息面板
 */

const { wifi, v4, v6 } = $network;
const IPv4 = v4.primaryAddress;
const cellularData = $network["cellular-data"];
const radio = cellularData ? cellularData.radio : null;
const carrier = cellularData ? cellularData.carrier : null;
const IPv6 = v6.primaryAddress ? v6.primaryAddress.replace(/^(.{7}).+(.{7})$/, "$1****$2") : null;
let url = "http://ip.ping0.cc/geo";
var CNNET = ['460-03', '460-05', '460-11'];
var Unicom = ['460-01', '460-06', '460-09'];
var Mobile = ['460-00', '460-02', '460-04', '460-07', '460-08'];
var THK = ['454-03', '454-04', '454-05', '454-14']; //和记电讯
var CBN = ['460-15']; //广电
var CSR = ['460-20']; //铁路
const radioGeneration = {
    'GPRS': '2.5G',
    'CDMA1x': '2.5G',
    'EDGE': '2.75G',
    'WCDMA': '3G',
    'HSDPA': '3.5G',
    'CDMAEVDORev0': '3.5G',
    'CDMAEVDORevA': '3.5G',
    'CDMAEVDORevB': '3.75G',
    'HSUPA': '3.75G',
    'eHRPD': '3.9G',
    'LTE': '4G',
    'NRNSA': '5G',
    'NR': '5G',
};
const radios = radioGeneration[radio];
if (CNNET.includes(carrier)) {
    server = "中国电信";
} else if (Unicom.includes(carrier)) {
    server = "中国联通";
} else if (Mobile.includes(carrier)) {
    server = "中国移动";
} else if (CBN.includes(carrier)) {
    server = "中国广电";
} else if (CSR.includes(carrier)) {
    server = "中国铁路";
} else if (THK.includes(carrier)) {
    server = "和记电讯";
} else {
    server = "蜂窝网络";
}

(async () => {
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

    $httpClient.get(url, function (error, response, data) {
        const externalIP = data.toString().split("\n")[0];
        const info = data.toString().split("\n")[1].replace(/(中国|\s+|\/|—|[a-zA-Z])/gm, '');

        const body = {
            title: wifi.ssid ? `WiFi 网络 | ${wifi.ssid}` : `蜂窝数据 | ${server} ${radios} [${radio}]`,
            content: `内部 IPv4：${ip} \n` +
                (wifi.ssid ? `路由 IPv4：${router}\n` : "") +
                `外部 IPv4：${externalIP}\n` +
                (IPv6 ? `外部 IPv6：${IPv6}\n` : "") +
                `IPv4 信息：${info}`,
            icon: wifi.ssid ? "wifi" : "antenna.radiowaves.left.and.right",
            "icon-color": wifi.ssid ? "#007AFE" : "#35C759"
        };
        $done(body);
    });
})();
