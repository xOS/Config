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

// 配置使用的 GeoIP 接口和 IPv6 开关
// 支持参数: GeoIPApi=xxx & EnableIPv6=1/0
let GeoIPApi = "muhan"; // 默认值
let EnableIPv6 = true; // 默认开启 IPv6
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
        return;
    }
    
    const ip = IPv4;
    const router = wifi.ssid ? v4.primaryRouter : '';

    // 获取外部 IPv4 地址的函数
    function getExternalIPv4(callback) {
        let url, parser;
        
        switch (GeoIPApi) {
            case "muhan":
                url = "https://uapi.woobx.cn/app/ip-location";
                parser = function(data) {
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
                parser = function(data) {
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
                parser = function(data) {
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
                parser = function(data) {
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
                            const provider = lines.length >= 4 ? lines[3] : ''; // 第四行是商家名称
                            
                            console.log(`ping0 解析结果: IP=${ip}, 位置=${location}, AS=${asNumber}, 商家=${provider}`);
                            
                            if (isValidIPv4(ip)) {
                                // 组合地理信息：位置 + 商家
                                let info = location;
                                if (provider && !provider.startsWith('AS')) {
                                    info += provider;
                                }
                                // 移除中国、"-"、空格和英文字符
                                info = info.replace([/中国|\s\-a-zA-Z]/g, '') || '未知地区';
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
                parser = function(data) {
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
                
            case "quic":
                url = "https://api.quic.me/json";
                parser = function(data) {
                    try {
                        console.log(`quic 解析器收到数据: [${data.toString()}]`);
                        let json = JSON.parse(data);
                        // 兼容数组格式
                        if (Array.isArray(json)) {
                            json = json[0] || {};
                        }
                        console.log(`quic JSON解析结果:`, JSON.stringify(json, null, 2));
                        if (json && json.ip) {
                            const ip = json.ip;
                            console.log(`quic 提取到IP: ${ip}`);
                            if (isValidIPv4(ip) || isValidIPv6(ip)) {
                                const country = json.country || '';
                                const region = json.region || '';
                                const city = json.city || '';
                                const street = json.street || '';
                                let isp = json.isp || '';
                                // connection_type 翻译
                                let connType = '';
                                if (json.connection_type && typeof json.connection_type === 'string' && json.connection_type.trim() !== '') {
                                    switch (json.connection_type) {
                                        case 'Cellular':
                                            connType = '基站WiFi';
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
                                    if (connType) {
                                        isp += connType;
                                    }
                                }
                                // 拼接 info，包含 street 字段
                                let info = `${region}${city}`;
                                if (street) info += street;
                                info += isp;
                                info = info.replace(/\s+|[-/\\]/g, '') || '未知地区';
                                console.log(`quic 地理信息: 国家=${country}, 地区=${region}, 城市=${city}, 街道=${street}, ISP=${isp}`);
                                console.log(`quic 最终地理信息: ${info}`);
                                return { ip, info };
                            } else {
                                console.log(`quic IP地址无效: ${ip}`);
                            }
                        } else {
                            console.log(`quic 数据结构不符合预期`);
                            console.log(`json.ip: ${json ? json.ip : 'undefined'}`);
                        }
                        return { ip: null, info: null };
                    } catch (e) {
                        console.log('quic 解析器出错:', e.message);
                        return { ip: null, info: null };
                    }
                };
                break;
                
            default:
                callback(null, null);
                return;
        }
        
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

    // 获取外部 IPv6 地址的函数（增强版，支持真实的外部查询）
    function getExternalIPv6(callback) {
        // 只要未开启 EnableIPv6 或没有本地 IPv6 地址，直接回调
        if (!EnableIPv6 || !IPv6) {
            callback(null, null, false);
            return;
        }

        // 检查 API 是否支持 IPv6 查询
        if (GeoIPApi === 'ping0' || GeoIPApi === 'pingan' || GeoIPApi === 'quic') {
            let ipv6Url;
            if (GeoIPApi === 'ping0') {
                ipv6Url = "https://ipv6.ping0.cc/geo";
            } else if (GeoIPApi === 'pingan') {
                ipv6Url = "https://rmb.pingan.com.cn/itam/mas/linden/ip/request";
            } else if (GeoIPApi === 'quic') {
                ipv6Url = "https://ipv6.quic.me/json";
            }
            
            $httpClient.get(ipv6Url, function (error, response, data) {
                if (error) {
                    callback(null, null, false);
                    return;
                }

                let result = { ip: null, info: null };

                try {
                    if (GeoIPApi === 'ping0') {
                        const lines = data.toString().trim().split('\n').map(line => line.trim()).filter(line => line);
                        if (lines.length >= 2) {
                            const ip = lines[0];
                            if (isValidIPv6(ip)) {
                                const location = lines[1];
                                const provider = lines.length >= 4 ? lines[3] : '';
                                let info = location;
                                if (provider && !provider.startsWith('AS')) {
                                    info += provider;
                                }
                                info = info.replace([/中国|\s\-a-zA-Z]/g, '') || '未知地区';
                                result = { ip, info };
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
                            result = { ip, info };
                        }
                    } else if (GeoIPApi === 'quic') {
                        let json = JSON.parse(data);
                        if (Array.isArray(json)) {
                            json = json[0] || {};
                        }
                        if (json && json.ip && isValidIPv6(json.ip)) {
                            const ip = json.ip;
                            const region = json.region || '';
                            const city = json.city || '';
                            let isp = json.isp || '';
                            // connection_type 翻译
                            let connType = '';
                            if (json.connection_type && typeof json.connection_type === 'string' && json.connection_type.trim() !== '') {
                                switch (json.connection_type) {
                                    case 'Cellular': connType = '基站WiFi'; break;
                                    case 'Cable/DSL': connType = '宽带网络'; break;
                                    case 'Corporate': connType = '企业专线'; break;
                                    default: connType = '';
                                }
                                if (connType) {
                                    isp += connType;
                                }
                            }
                            const info = `${region}${city}${isp}`.replace(/\s+|[-/\\]/g, '') || '未知地区';
                            result = { ip, info };
                        }
                    }
                } catch (e) {
                    // ignore parsing error
                }

                if (result.ip) {
                    const obfuscatedIp = result.ip.replace(/^(.{7}).+(.{7})$/, "$1****$2");
                    callback(obfuscatedIp, result.info, false);
                } else {
                    callback(null, null, false);
                }
            });
        } else {
            // 对于不支持 IPv6 查询的 API，默认返回本地 IPv6
            const IPv6Original = v6.primaryAddress;
            if (IPv6Original) {
                callback(IPv6, '公网直连', true);
            } else {
                callback(null, null, false);
            }
        }
    }

    // 获取外部 IPv4 信息
    getExternalIPv4(function(externalIP, info) {
        if (!externalIP) {
            $done({
                title: "外网信息获取失败",
                content: `无法通过 ${GeoIPApi} 接口获取外部 IP 信息`,
                icon: "exclamationmark.triangle",
                "icon-color": "#ff9800"
            });
            return;
        }
        
        // 获取外部 IPv6 地址
        getExternalIPv6(function(externalIPv6, ipv6Info, isIPv6Same) {
            const body = {
                title: wifi.ssid ? `WiFi 网络 | ${wifi.ssid}` : `蜂窝数据${server && server !== 'unknown' ? ` | ${server}` : ''}${radios && radios !== 'unknown' ? ` ${radios}` : ''}${radio && radio !== 'unknown' ? ` [${radio}]` : ''}`,
                content: wifi.ssid
                    ? `路由 IPv4：${router}\n内部 IPv4：${ip}\n外部 IPv4：${externalIP}\n${IPv6 ? (isIPv6Same ? `IPv6 地址：${IPv6}\n` : `内部 IPv6：${IPv6}\n`) : ""}${externalIPv6 && !isIPv6Same ? `外部 IPv6：${externalIPv6}\n` : ""}IPv4 信息：${info}${ipv6Info && ipv6Info !== '公网直连' ? `\nIPv6 信息：${ipv6Info}` : ""}`
                    : `内部 IPv4：${ip}\n外部 IPv4：${externalIP}\n${IPv6 ? (isIPv6Same ? `IPv6 地址：${IPv6}\n` : `内部 IPv6：${IPv6}\n`) : ""}${externalIPv6 && !isIPv6Same ? `外部 IPv6：${externalIPv6}\n` : ""}IPv4 信息：${info}${ipv6Info && ipv6Info !== '公网直连' ? `\nIPv6 信息：${ipv6Info}` : ""}`,
                icon: wifi.ssid ? "wifi" : "antenna.radiowaves.left.and.right",
                "icon-color": wifi.ssid ? "#007AFE" : "#35C759"
            };
            $done(body);
        });
    });
})();
