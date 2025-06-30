/**
 * Surge 网络信息面板
 * 
 * IPv6 说明：
 * - IPv6 设计为端到端连接，不需要 NAT（网络地址转换）
 * - 因此内部和外部 IPv6 地址可能相同，这是正常现象
 * - 当内外部 IPv6 相同时，显示为"IPv6 地址"
 */

const { wifi, v4, v6 } = $network;
const IPv4 = v4.primaryAddress;
const cellularData = $network["cellular-data"];
const radio = cellularData ? cellularData.radio : '';
const carrier = cellularData ? cellularData.carrier : '';
const IPv6 = v6.primaryAddress ? v6.primaryAddress.replace(/^(.{7}).+(.{7})$/, "$1****$2") : '';
let ipv4Url = "http://ipv4.ping0.cc/geo";
let ipv6Url = "http://ipv6.ping0.cc/geo";

// IPv4 地址验证函数
function isValidIPv4(ip) {
    const ipv4Regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipv4Regex.test(ip);
}

// IPv6 地址验证函数
function isValidIPv6(ip) {
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$|^([0-9a-fA-F]{1,4}:){1,7}:$|^([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}$|^([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}$|^([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}$|^([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}$|^[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})$|^:((:[0-9a-fA-F]{1,4}){1,7}|:)$/;
    return ipv6Regex.test(ip);
}
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
    const router = wifi.ssid ? v4.primaryRouter : '';

    // 获取外部 IPv6 地址的函数
    function getExternalIPv6(callback) {
        if (!IPv6) {
            callback(null, null);
            return;
        }
        
        $httpClient.get(ipv6Url, function (ipv6Error, ipv6Response, ipv6Data) {
            if (!ipv6Error && ipv6Data) {
                const lines = ipv6Data.toString().split("\n");
                const externalIPv6 = lines[0].trim();
                const ipv6Info = lines[1]?.replace(/(中国|\s+|\/|—|[a-zA-Z])/gm, '') || '';
                
                if (isValidIPv6(externalIPv6)) {
                    // 检查内外部 IPv6 是否相同（未脱敏的原始地址比较）
                    const IPv6Original = v6.primaryAddress;
                    const isIPv6Same = IPv6Original && IPv6Original === externalIPv6;
                    
                    // 对外部 IPv6 地址进行脱敏处理
                    const maskedIPv6 = externalIPv6.replace(/^(.{7}).+(.{7})$/, "$1****$2");
                    callback(maskedIPv6, ipv6Info, isIPv6Same);
                    return;
                }
            }
            callback(null, null, false);
        });
    }

    $httpClient.get(ipv4Url, function (error, response, data) {
        if (error || !data) {
            $done({
                title: "外网信息获取失败",
                content: "无法获取外部 IP 信息",
                icon: "exclamationmark.triangle",
                "icon-color": "#ff9800"
            });
            return;
        }
        
        const externalIP = data.toString().split("\n")[0].trim();
        
        // 验证返回的是否为有效的 IPv4 地址
        if (!isValidIPv4(externalIP)) {
            $done({
                title: "外网信息获取失败",
                content: "获取到的不是有效的 IPv4 地址",
                icon: "exclamationmark.triangle",
                "icon-color": "#ff9800"
            });
            return;
        }
        
        const info = data.toString().split("\n")[1]?.replace(/(中国|\s+|\/|—|[a-zA-Z])/gm, '') || '';

        // 获取外部 IPv6 地址
        getExternalIPv6(function(externalIPv6, ipv6Info, isIPv6Same) {
            const body = {
                title: wifi.ssid ? `WiFi 网络 | ${wifi.ssid}` : `蜂窝数据${server && server !== 'unknown' ? ` | ${server}` : ''}${radios && radios !== 'unknown' ? ` ${radios}` : ''}${radio && radio !== 'unknown' ? ` [${radio}]` : ''}`,
                content: wifi.ssid
                    ? `路由 IPv4：${router}\n内部 IPv4：${ip}\n外部 IPv4：${externalIP}\n${IPv6 ? (isIPv6Same ? `IPv6 地址：${IPv6}\n` : `内部 IPv6：${IPv6}\n`) : ""}${externalIPv6 && !isIPv6Same ? `外部 IPv6：${externalIPv6}\n` : ""}IPv4 信息：${info}${ipv6Info ? `\nIPv6 信息：${ipv6Info}` : ""}`
                    : `内部 IPv4：${ip}\n外部 IPv4：${externalIP}\n${IPv6 ? (isIPv6Same ? `IPv6 地址：${IPv6}\n` : `内部 IPv6：${IPv6}\n`) : ""}${externalIPv6 && !isIPv6Same ? `外部 IPv6：${externalIPv6}\n` : ""}IPv4 信息：${info}${ipv6Info ? `\nIPv6 信息：${ipv6Info}` : ""}`,
                icon: wifi.ssid ? "wifi" : "antenna.radiowaves.left.and.right",
                "icon-color": wifi.ssid ? "#007AFE" : "#35C759"
            };
            $done(body);
        });
    });
})();
