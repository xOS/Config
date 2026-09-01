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
const wifiSSID = wifi && typeof wifi.ssid === 'string' ? wifi.ssid.trim() : '';
const wifiRouter = v4.primaryRouter || '';
const hasCellularMeta = !!(carrier || radio);
const isLikelyWifi = !!(wifiSSID || wifiRouter);
const isLikelyCellular = !isLikelyWifi && hasCellularMeta;

// 配置使用的 GeoIP 接口和 IPv6 开关
// 支持参数: GeoIPApi=xxx & EnableIPv6=1/0
let GeoIPApi = "aapl"; // 默认使用 AAPL 接口
let EnableIPv6 = true; // 默认开启 IPv6
let ScamalyUser = ""; // Scamalytics User
let ScamalyKey = ""; // Scamalytics Key
let ScamalyPolicy = ""; // Scamalytics 自定义请求策略组
if (typeof $argument !== 'undefined') console.log(`[Script] 参数原始值: ${$argument}`);

if (typeof $argument !== 'undefined' && $argument) {
    const args = $argument.split('&');
    for (const arg of args) {
        const [key, value] = arg.split('=');
        if (key === 'GeoIPApi') {
            GeoIPApi = value;
        }
        if (key === 'EnableIPv6') {
            EnableIPv6 = value === '1' || value === 'true';
        }
        if (key === 'ScamalyUser') {
            ScamalyUser = value;
        }
        if (key === 'ScamalyKey') {
            ScamalyKey = value;
        }
        if (key === 'ScamalyPolicy') {
            ScamalyPolicy = value;
        }
    }
}

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
var CBN = ['460-15']; //广电
var CSR = ['460-20']; //铁路

// 香港
var CSL = ['454-00', '454-02', '454-10', '454-18'];
var THK = ['454-03', '454-04', '454-05', '454-14']; //和记电讯
var SmarTone = ['454-06', '454-15', '454-17'];
var CMHK = ['454-12', '454-13'];
var HKT = ['454-19', '454-20'];

// 台湾
var CHT = ['466-92']; //中华电信
var TWM = ['466-97']; //台湾大哥大
var FET = ['466-01']; //远传电信
var TStar = ['466-89']; //台湾之星
var APT = ['466-05']; //亚太电信

// 新加坡
var Singtel = ['525-01', '525-02', '525-07'];
var M1 = ['525-03'];
var StarHub = ['525-05'];
var Simba = ['525-08']; //TPG

// 英国
var EE = ['234-30', '234-33', '234-34'];
var O2UK = ['234-02', '234-10', '234-11'];
var VodaUK = ['234-15'];
var ThreeUK = ['234-20'];

// 德国
var TelekomDE = ['262-01', '262-06'];
var VodaDE = ['262-02', '262-04', '262-09'];
var O2DE = ['262-03', '262-07', '262-08', '262-11'];

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
let server;

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
} else if (CSL.includes(carrier)) {
    server = "csl.";
} else if (THK.includes(carrier)) {
    server = "3 HK";
} else if (SmarTone.includes(carrier)) {
    server = "SmarTone";
} else if (CMHK.includes(carrier)) {
    server = "CMHK";
} else if (HKT.includes(carrier)) {
    server = "HKT";
} else if (CHT.includes(carrier)) {
    server = "中华电信";
} else if (TWM.includes(carrier)) {
    server = "台湾大哥大";
} else if (FET.includes(carrier)) {
    server = "远传电信";
} else if (TStar.includes(carrier)) {
    server = "台湾之星";
} else if (APT.includes(carrier)) {
    server = "亚太电信";
} else if (Singtel.includes(carrier)) {
    server = "Singtel";
} else if (M1.includes(carrier)) {
    server = "M1";
} else if (StarHub.includes(carrier)) {
    server = "StarHub";
} else if (Simba.includes(carrier)) {
    server = "SIMBA";
} else if (EE.includes(carrier)) {
    server = "EE";
} else if (O2UK.includes(carrier)) {
    server = "O2 (UK)";
} else if (VodaUK.includes(carrier)) {
    server = "Vodafone (UK)";
} else if (ThreeUK.includes(carrier)) {
    server = "Three (UK)";
} else if (TelekomDE.includes(carrier)) {
    server = "Telekom (DE)";
} else if (VodaDE.includes(carrier)) {
    server = "Vodafone (DE)";
} else if (O2DE.includes(carrier)) {
    server = "O2 (DE)";
} else {
    if (carrier && !/^\d{3}-\d{2,3}$/.test(carrier)) {
        server = carrier; // 如果 Surge 返回了直接的字符串名称而非代码
    } else {
        server = "蜂窝网络";
    }
}

(async () => {
    if (!IPv4) {
        $done({
            title: "未连接网络",
            content: "请检查网络连接",
            icon: "airplane",
            "icon-color": "#ff9800"
        });
        return;
    }

    const ip = IPv4;
    const router = isLikelyWifi ? wifiRouter : '';

    // 获取外部 IPv4 地址的函数
    function getExternalIPv4(callback) {
        let url, parser;

        switch (GeoIPApi) {
            case "muhan":
                url = "https://uapi.woobx.cn/app/ip-location";
                parser = function (data) {
                    try {
                        const json = JSON.parse(data);
                        if (json && json.code === 200 && json.data && json.data.showapi_res_body) {
                            const body = json.data.showapi_res_body;
                            const ip = body.ip;
                            if (isValidIPv4(ip)) {
                                const info = `${body.region || ''}${body.city || ''}${body.isp || ''}`.replace(/\s+|[-/\\]/g, '');
                                return { ip, info: info || '未知地区' };
                            }
                        }
                        return { ip: null, info: null };
                    } catch (e) {
                        return { ip: null, info: null };
                    }
                };
                break;

            case "ipip":
                url = "http://myip.ipip.net/json";
                parser = function (data) {
                    try {
                        const json = JSON.parse(data);
                        if (json && json.ret === "ok" && json.data && json.data.ip) {
                            const ip = json.data.ip;
                            if (isValidIPv4(ip)) {
                                const location = json.data.location || [];
                                const info = location.slice(1).join('').replace(/\s+|[-/\\]/g, '') || '未知地区';
                                return { ip, info };
                            }
                        }
                        return { ip: null, info: null };
                    } catch (e) {
                        return { ip: null, info: null };
                    }
                };
                break;

            case "bilibili":
                url = "https://api.bilibili.com/x/web-interface/zone";
                parser = function (data) {
                    try {
                        console.log(`bilibili 解析器收到数据: [${data.toString()}]`);
                        const json = JSON.parse(data);
                        console.log(`bilibili JSON解析结果:`, JSON.stringify(json, null, 2));

                        if (json && json.code === 0 && json.data && json.data.addr) {
                            const ip = json.data.addr;
                            console.log(`bilibili 提取到IP: ${ip}`);

                            if (isValidIPv4(ip)) {
                                const province = json.data.province || '';
                                const city = json.data.city || '';
                                const isp = json.data.isp || '';
                                console.log(`bilibili 地理信息: 省=${province}, 市=${city}, ISP=${isp}`);

                                const info = `${province}${city}${isp}`.replace(/\s+|[-/\\]/g, '') || '未知地区';
                                console.log(`bilibili 最终地理信息: ${info}`);

                                return { ip, info };
                            } else {
                                console.log(`bilibili IP无效: ${ip}`);
                            }
                        } else {
                            console.log(`bilibili 数据结构不符合预期`);
                            console.log(`json.code: ${json ? json.code : 'undefined'}`);
                            console.log(`json.data: ${json && json.data ? JSON.stringify(json.data) : 'undefined'}`);
                        }
                        return { ip: null, info: null };
                    } catch (e) {
                        console.log('bilibili 解析器出错:', e.message);
                        return { ip: null, info: null };
                    }
                };
                break;

            case "ping0":
                url = "https://ipv4.ping0.cc/geo";
                parser = function (data) {
                    try {
                        const dataStr = data.toString().trim();
                        console.log(`ping0 解析器收到数据: [${dataStr}]`);

                        // ping0 IPv4接口返回格式：4行数据
                        // 第一行：IPv4地址
                        // 第二行：位置信息
                        // 第三行：AS号码
                        // 第四行：商家名称
                        const lines = dataStr.split('\n').map(line => line.trim()).filter(line => line);
                        console.log(`ping0 按行分割结果:`, lines);

                        if (lines.length >= 2) {
                            const ip = lines[0]; // 第一行是IPv4地址
                            const location = lines[1]; // 第二行是位置信息
                            const asNumber = lines.length >= 3 ? lines[2] : ''; // 第三行是AS号码
                            const provider = lines.length >= 4 ? lines[3] : ''; // 第四行可能是运营商

                            console.log(`ping0 解析结果: IP=${ip}, 位置=${location}, AS=${asNumber}, 第四行=${provider}`);

                            if (isValidIPv4(ip)) {
                                // 去除第二行中的 '中国 '（中国后跟空白），不移除单独的'中国'
                                // 仅当行首是 "中国 " 时移除；随后折叠多余空格
                                let cleanedLocation = location
                                    .replace(/^中国\s+/, '')
                                    .replace(/\s+/g, ' ');
                                let info = cleanedLocation; // 基础使用第二行位置信息
                                const hasCarrierAlready = /(移动|电信|联通|广电)/.test(info);
                                // 仅当第四行包含特定关键词时翻译并追加
                                if (!hasCarrierAlready && provider && !provider.startsWith('AS')) {
                                    const lower = provider.toLowerCase();
                                    let carrierCN = '';
                                    if (lower.includes('chinamobile')) {
                                        carrierCN = '中国移动';
                                    } else if (lower.includes('unicom')) {
                                        carrierCN = '中国联通';
                                    } else if (/(chinanet|telecom)/i.test(provider)) {
                                        carrierCN = '中国电信';
                                    } else if (/(television|broadcas|cable|tv|radio)/i.test(provider)) {
                                        carrierCN = '中国广电';
                                    }
                                    if (carrierCN) {
                                        info += carrierCN; // 只追加翻译后的中文
                                    }
                                }
                                // 清洗：去除英文、空白、连字符，保留中文（含“\u4e2d国”）
                                info = info.replace(/[\s\-a-zA-Z]/g, '') || '未知地区';
                                console.log(`ping0 最终地理信息: ${info}`);
                                return { ip, info };
                            } else {
                                console.log(`ping0 IPv4地址无效: ${ip}`);
                            }
                        } else {
                            console.log(`ping0 数据行数不足: ${lines.length} 行`);
                        }

                        return { ip: null, info: null };
                    } catch (e) {
                        console.log('ping0 解析器出错:', e.message);
                        return { ip: null, info: null };
                    }
                };
                break;

            case "pingan":
                url = "https://rmb.pingan.com.cn/itam/mas/linden/ip/request";
                parser = function (data) {
                    try {
                        console.log(`pingan 解析器收到数据: [${data.toString()}]`);
                        const json = JSON.parse(data);
                        console.log(`pingan JSON解析结果:`, JSON.stringify(json, null, 2));

                        if (json && json.code === 0 && json.data && json.data.ip) {
                            const ip = json.data.ip;
                            console.log(`pingan 提取到IP: ${ip}`);

                            if (isValidIPv4(ip) || isValidIPv6(ip)) {
                                const country = json.data.country || '';
                                const region = json.data.region || '';
                                const city = json.data.city || '';
                                const isp = json.data.isp || '';
                                console.log(`pingan 地理信息: 国家=${country}, 地区=${region}, 城市=${city}, ISP=${isp}`);

                                // 组合地理信息，去除中国字样
                                const info = `${region}${city}${isp}`.replace(/\s+|[-/\\]/g, '') || '未知地区';
                                console.log(`pingan 最终地理信息: ${info}`);

                                return { ip, info };
                            } else {
                                console.log(`pingan IP地址无效: ${ip}`);
                            }
                        } else {
                            console.log(`pingan 数据结构不符合预期`);
                            console.log(`json.code: ${json ? json.code : 'undefined'}`);
                            console.log(`json.data: ${json && json.data ? JSON.stringify(json.data) : 'undefined'}`);
                        }
                        return { ip: null, info: null };
                    } catch (e) {
                        console.log('pingan 解析器出错:', e.message);
                        return { ip: null, info: null };
                    }
                };
                break;

            case "aapl":
                url = "https://api.aapls.com/v1/geoip?lang=zh";
                parser = function (data) {
                    try {
                        console.log(`aapl 解析器收到数据: [${data.toString()}]`);
                        let json = JSON.parse(data);
                        // 兼容数组格式
                        if (Array.isArray(json)) {
                            json = json[0] || {};
                        }
                        console.log(`aapl JSON解析结果:`, JSON.stringify(json, null, 2));
                        if (json && json.ip) {
                            const ip = json.ip;
                            console.log(`aapl 提取到IP: ${ip}`);
                            if (isValidIPv4(ip) || isValidIPv6(ip)) {
                                const country = json.country || '';
                                const region = json.region || '';
                                const city = json.city || '';
                                const district = json.district || json.street || '';
                                let isp = json.isp || '';
                                // connection_type 处理
                                let connType = '';
                                if (json.connection_type && typeof json.connection_type === 'string' && json.connection_type.trim() !== '') {
                                    // 判断是否为中文
                                    if (/[\u4e00-\u9fa5]/.test(json.connection_type)) {
                                        // 中文直接使用
                                        connType = json.connection_type;
                                    } else {
                                        // 英文进行翻译
                                        switch (json.connection_type) {
                                            case 'Cellular':
                                                connType = '基站网络';
                                                break;
                                            case 'Cable/DSL':
                                                connType = '宽带网络';
                                                break;
                                            case 'Corporate':
                                                connType = '企业专线';
                                                break;
                                            default:
                                                connType = '';
                                        }
                                    }
                                    if (connType) {
                                        isp += connType;
                                    }
                                }
                                // 拼接 info，包含 district 字段
                                let info = `${region}${city}`;
                                if (district) info += district;
                                info += isp;
                                info = info.replace(/\s+|[-/\\]/g, '') || '未知地区';
                                console.log(`aapl 地理信息: 国家=${country}, 地区=${region}, 城市=${city}, 区域=${district}, ISP=${isp}`);
                                console.log(`aapl 最终地理信息: ${info}`);
                                return { ip, info };
                            } else {
                                console.log(`aapl IP地址无效: ${ip}`);
                            }
                        } else {
                            console.log(`aapl 数据结构不符合预期`);
                            console.log(`json.ip: ${json ? json.ip : 'undefined'}`);
                        }
                        return { ip: null, info: null };
                    } catch (e) {
                        console.log('aapl 解析器出错:', e.message);
                        return { ip: null, info: null };
                    }
                };
                break;

            default:
                callback(null, null);
                return;
        }

        // 简化：直接一次请求，不做 AAPL 特殊重试与定制超时
        $httpClient.get(url, function (error, response, data) {
            if (error) {
                console.log(`${GeoIPApi} 接口请求错误:`, error);
                console.log(`${GeoIPApi} 请求URL: ${url}`);
                callback(null, null);
                return;
            }

            console.log(`${GeoIPApi} 响应状态码:`, response ? response.status : 'no response');
            if (response && response.headers) {
                console.log(`${GeoIPApi} 响应头:`, JSON.stringify(response.headers, null, 2));
            }

            if (!data) {
                console.log(`${GeoIPApi} 接口返回空数据`);
                callback(null, null);
                return;
            }

            // 详细打印返回数据
            const dataStr = data ? data.toString() : 'null';
            console.log(`${GeoIPApi} 接口返回完整数据: [${dataStr}]`);
            console.log(`${GeoIPApi} 接口数据长度: ${dataStr.length}`);
            console.log(`${GeoIPApi} 接口数据类型:`, typeof data);

            const result = parser(data);

            if (!result.ip || !(isValidIPv4(result.ip) || isValidIPv6(result.ip))) {
                console.log(`${GeoIPApi} 接口解析失败，解析结果:`, JSON.stringify(result));
                console.log(`${GeoIPApi} 是否有效IP:`, result.ip ? (isValidIPv4(result.ip) || isValidIPv6(result.ip)) : false);
                callback(null, null);
                return;
            }

            console.log(`${GeoIPApi} 接口解析成功:`, JSON.stringify(result));
            callback(result.ip, result.info || '未知地区');
        });
    }

    // 获取外部 IPv6 地址的函数（恢复对支持接口的一次外部查询）
    function getExternalIPv6(callback) {
        // 未开启或本机无 IPv6，直接返回
        if (!EnableIPv6 || !IPv6) {
            callback(null, null, false);
            return;
        }

        // 仅对支持 IPv6 的接口发起一次请求
        if (GeoIPApi === 'ping0' || GeoIPApi === 'pingan' || GeoIPApi === 'aapl') {
            let ipv6Url;
            if (GeoIPApi === 'ping0') {
                ipv6Url = "https://ipv6.ping0.cc/geo";
            } else if (GeoIPApi === 'pingan') {
                ipv6Url = "https://rmb.pingan.com.cn/itam/mas/linden/ip/request";
            } else { // aapl
                ipv6Url = "https://ipv6.aapls.com/v1/geoip?lang=zh";
            }

            $httpClient.get(ipv6Url, function (error, response, data) {
                if (error || !data) {
                    callback(null, null, false);
                    return;
                }

                try {
                    if (GeoIPApi === 'ping0') {
                        const lines = data.toString().trim().split('\n').map(line => line.trim()).filter(line => line);
                        if (lines.length >= 2) {
                            const ip = lines[0];
                            if (isValidIPv6(ip)) {
                                // 去除第二行中的 '中国 '（中国后跟空白），不移除单独的'中国'
                                const locationRaw = lines[1]; // 第二行位置信息原始
                                const location = locationRaw
                                    .replace(/^中国\s+/, '') // 仅移除行首的 "中国 "
                                    .replace(/\s+/g, ' '); // 折叠多余空格
                                const hasCarrierAlready = /(移动|电信|联通|广电)/.test(location);
                                const provider = lines.length >= 4 ? lines[3] : '';
                                let info = location;
                                if (!hasCarrierAlready && provider && !provider.startsWith('AS')) {
                                    const lower = provider.toLowerCase();
                                    let carrierCN = '';
                                    if (lower.includes('chinamobile')) {
                                        carrierCN = '中国移动';
                                    } else if (lower.includes('unicom')) {
                                        carrierCN = '中国联通';
                                    } else if (/(chinanet|telecom)/i.test(provider)) {
                                        carrierCN = '中国电信';
                                    } else if (/(television|broadcas|cable|tv|radio)/i.test(provider)) {
                                        carrierCN = '中国广电';
                                    }
                                    if (carrierCN) {
                                        info += carrierCN;
                                    }
                                }
                                info = info.replace(/[\s\-a-zA-Z]/g, '') || '未知地区';
                                const obfuscated = ip.replace(/^(.{7}).+(.{7})$/, "$1****$2");
                                callback(obfuscated, info, false);
                                return;
                            }
                        }
                    } else if (GeoIPApi === 'pingan') {
                        const json = JSON.parse(data);
                        if (json && json.code === 0 && json.data && json.data.ip && isValidIPv6(json.data.ip)) {
                            const ip = json.data.ip;
                            const region = json.data.region || '';
                            const city = json.data.city || '';
                            const isp = json.data.isp || '';
                            const info = `${region}${city}${isp}`.replace(/\s+|[-/\\]/g, '') || '未知地区';
                            const obfuscated = ip.replace(/^(.{7}).+(.{7})$/, "$1****$2");
                            callback(obfuscated, info, false);
                            return;
                        }
                    } else { // aapl
                        let json = JSON.parse(data);
                        if (Array.isArray(json)) json = json[0] || {};
                        if (json && json.ip && isValidIPv6(json.ip)) {
                            const ip = json.ip;
                            const region = json.region || '';
                            const city = json.city || '';
                            const district = json.district || json.street || '';
                            let isp = json.isp || '';
                            let connType = '';
                            if (json.connection_type && typeof json.connection_type === 'string' && json.connection_type.trim() !== '') {
                                if (/^[\u4e00-\u9fa5]+$/.test(json.connection_type)) {
                                    connType = json.connection_type;
                                } else {
                                    switch (json.connection_type) {
                                        case 'Cellular': connType = '基站网络'; break;
                                        case 'Cable/DSL': connType = '宽带网络'; break;
                                        case 'Corporate': connType = '企业专线'; break;
                                        default: connType = '';
                                    }
                                }
                                if (connType) isp += connType;
                            }
                            let info = `${region}${city}`;
                            if (district) info += district;
                            info += isp;
                            info = info.replace(/\s+|[-/\\]/g, '') || '未知地区';
                            const obfuscated = ip.replace(/^(.{7}).+(.{7})$/, "$1****$2");
                            callback(obfuscated, info, false);
                            return;
                        }
                    }
                } catch (e) {
                    // ignore
                }
                callback(null, null, false);
            });
        } else {
            // 其它接口认为本机 IPv6 直接公网直连
            const IPv6Original = v6.primaryAddress;
            if (IPv6Original) {
                callback(IPv6, '公网直连', true);
            } else {
                callback(null, null, false);
            }
        }
    }
    // 获取 Scamalytics 境外落地 IP 风险信息
    function getScamalyticsInfo(callback) {
        console.log('[Scamaly] 启动落地 IP 查询...');
        $httpClient.get("http://ip-api.com/json?lang=zh-CN", function (err, res, data) {
            if (err || !data) {
                console.log('[Scamaly] ip-api 请求失败');
                callback(null, null);
                return;
            }
            try {
                const ipJson = JSON.parse(data);
                const landingIp = ipJson.query;
                if (!landingIp) {
                    callback(null, null);
                    return;
                }
                const landingCountry = ipJson.country || '';
                const landingRegion = ipJson.regionName || '';
                const landingCity = ipJson.city || '';
                let locationParts = [landingCountry, landingRegion, landingCity].filter(function (s) { return s && s !== ''; });
                let locationStr = locationParts.join('').replace(/\s+/g, ''); // 仅包含纯地理位置：美国俄亥俄州哥伦布

                // 动态计算对齐的前缀：根据是否包含冒号判定 v6/v4
                const ipLabel = landingIp.includes(':') ? '落地 IPv6' : '落地 IPv4';
                const infoLabel = '落地 信息'; // 中间留空格，强行对齐9个半角字符宽度
                
                // 即使未配置 Scamalytics 密钥，也要始终显示从 ip-api 获取的落地 IP 和基础地理信息
                if (!ScamalyUser || !ScamalyKey) {
                    console.log('[Scamaly] 未配置 Scamalytics 参数，仅返回 ip-api 落地信息');
                    callback(`${ipLabel}：${maskIPv6(landingIp)}`, `${infoLabel}：${locationStr}`);
                    return;
                }

                const scamUrl = `https://api11.scamalytics.com/v3/${ScamalyUser}/?key=${ScamalyKey}&ip=${landingIp}`;
                console.log(`[Scamaly] 准备请求 Scamalytics, IP: ${landingIp}`);

                
                let scamDone = false;
                const scamTimeout = setTimeout(function() {
                    if (!scamDone) {
                        scamDone = true;
                        console.log('[Scamaly] API 触发 3 秒软超时，提前返回');
                        callback(`${ipLabel}：${maskIPv6(landingIp)}`, `${infoLabel}：${locationStr} | API连接超时(节点阻断)`);
                    }
                }, 3000);

                let opts = {
                    url: scamUrl,
                    headers: {
                        'User-Agent': 'curl/8.7.1',
                        'Accept': '*/*'
                    }
                };
                if (ScamalyPolicy) {
                    opts.policy = ScamalyPolicy;
                    console.log(`[Scamaly] 尝试强行路由至策略组: ${ScamalyPolicy}`);
                }

                $httpClient.get(opts, function (err2, res2, scamData) {
                    if (scamDone) return;
                    clearTimeout(scamTimeout);
                    scamDone = true;

                    if (err2 || !scamData) {
                        console.log(`[Scamaly] Scamalytics API 报错/无数据, err: ${err2}`);
                        callback(`${ipLabel}：${maskIPv6(landingIp)}`, `${infoLabel}：${locationStr} | 请求失败(路由异常)`);
                        return;
                    }

                    try {
                        const scamStr = scamData.toString();
                        console.log('[Scamaly] Scamalytics 原始返回长度:', scamStr.length);
                        const json = JSON.parse(scamStr);
                        
                        let baseInfo = locationStr;
                        const isp = json.scamalytics && json.scamalytics.scamalytics_isp;
                        if (isp && isp !== "0" && isp !== "") {
                            baseInfo += ` ${isp}`; // 保持英文 ISP 名称前有一个空格，视觉更清爽
                        }

                        let extraParts = [];
                        const proxyType = json.external_datasources && json.external_datasources.ip2proxy && json.external_datasources.ip2proxy.proxy_type;
                        if (proxyType && proxyType !== "0" && proxyType !== "") {
                            extraParts.push(`类型: ${proxyType}`);
                        } else {
                            extraParts.push(`类型: 家宽`);
                        }
                        
                        const score = json.scamalytics && json.scamalytics.scamalytics_score;
                        const risk = json.scamalytics && json.scamalytics.scamalytics_risk;
                        if (score !== undefined && score !== null && score !== "") {
                            let scoreStr = `风险: ${score}`;
                            if (risk) {
                                let riskZH = risk.toLowerCase();
                                if (riskZH === 'low') riskZH = '低';
                                else if (riskZH === 'medium') riskZH = '中';
                                else if (riskZH === 'high') riskZH = '高';
                                else if (riskZH === 'very high') riskZH = '极高';
                                scoreStr += `[${riskZH}]`;
                            }
                            extraParts.push(scoreStr);
                        }
                        
                        const extraStr = extraParts.length > 0 ? ` | ${extraParts.join(' | ')}` : '';
                        callback(`${ipLabel}：${maskIPv6(landingIp)}`, `${infoLabel}：${baseInfo}${extraStr}`);
                    } catch (e) {
                        console.log('[Scamaly] 解析报错:', e.message);
                        callback(`${ipLabel}：${maskIPv6(landingIp)}`, `${infoLabel}：${locationStr}`);
                    }
                });
            } catch (e) {
                console.log('[Scamaly] ip-api 解析报错');
                callback(null, null);
            }
        });
    }

    // 三个查询全部并行发起，全部完成后组装面板
    let tasksDone = 0;
    const totalTasks = 3;
    let _externalIP = null, _info = null;
    let _externalIPv6 = null, _ipv6Info = null, _isIPv6Same = false;
    let _scamIpStr = null, _scamInfoStr = null;

    // IPv6 掩码函数，缩短过长的 IPv6 地址
    function maskIPv6(ip) {
        if (!ip) return ip;
        if (ip.includes(':')) {
            return ip.replace(/^(.{7}).+(.{7})$/, "$1****$2");
        }
        return ip;
    }

    function tryFinish() {
        tasksDone++;
        if (tasksDone < totalTasks) return;

        if (!_externalIP) {
            $done({
                title: "外网信息获取失败",
                content: `无法通过 ${GeoIPApi} 接口获取外部 IP 信息`,
                icon: "exclamationmark.triangle",
                "icon-color": "#ff9800"
            });
            return;
        }

        const maskedExtIPv6 = maskIPv6(_externalIPv6);

        const buildContent = (isWifi) => {
            let lines = [];
            if (isWifi) lines.push(`路由 IPv4：${router}`);
            lines.push(`内部 IPv4：${ip}`);
            lines.push(`外部 IPv4：${_externalIP}`);
            
            if (IPv6) {
                if (_isIPv6Same) {
                    lines.push(`IPv6 地址：${IPv6}`);
                } else {
                    lines.push(`内部 IPv6：${IPv6}`);
                }
            }
            if (maskedExtIPv6 && !_isIPv6Same) {
                lines.push(`外部 IPv6：${maskedExtIPv6}`);
            }
            
            // 落地 IP 调整到 IPv4 信息之上
            if (_scamIpStr) {
                lines.push(_scamIpStr);
            }
            
            lines.push(`IPv4 信息：${_info}`);
            if (_ipv6Info && _ipv6Info !== '公网直连') {
                lines.push(`IPv6 信息：${_ipv6Info}`);
            }
            
            // 落地 信息 放在最后一行
            if (_scamInfoStr) {
                lines.push(_scamInfoStr);
            }
            
            if (isWifi && !wifiSSID) {
                lines.push('⚠️ Surge Mac 版 JS 引擎不支持读取 WiFi 名称');
            }
            return lines.join('\n');
        };

        const body = {
            title: isLikelyWifi
                ? `WiFi 网络${wifiSSID ? ` | ${wifiSSID}` : (v4.primaryInterface ? ` | ${v4.primaryInterface}` : '')}`
                : isLikelyCellular
                    ? `蜂窝数据${server && server !== 'unknown' ? ` | ${server}` : ''}${radios && radios !== 'unknown' ? ` ${radios}` : ''}${radio && radio !== 'unknown' ? ` [${radio}]` : ''}`
                    : '当前网络',
            content: buildContent(isLikelyWifi),
            icon: isLikelyWifi ? "wifi" : (isLikelyCellular ? "antenna.radiowaves.left.and.right" : "network"),
            "icon-color": isLikelyWifi ? "#007AFE" : (isLikelyCellular ? "#35C759" : "#8E8E93")
        };
        $done(body);
    }

    // 并行任务 1: 外部 IPv4
    getExternalIPv4(function (externalIP, info) {
        _externalIP = externalIP;
        _info = info;
        tryFinish();
    });

    // 并行任务 2: IPv6
    getExternalIPv6(function (externalIPv6, ipv6Info, isIPv6Same) {
        _externalIPv6 = externalIPv6;
        _ipv6Info = ipv6Info;
        _isIPv6Same = isIPv6Same;
        tryFinish();
    });

    // 并行任务 3: Scamalytics 落地 IP
    getScamalyticsInfo(function (scamIpStr, scamInfoStr) {
        _scamIpStr = scamIpStr;
        _scamInfoStr = scamInfoStr;
        tryFinish();
    });
})();
