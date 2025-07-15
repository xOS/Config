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

// 配置使用的 GeoIP 接口
// 从外部参数获取 GeoIPApi，格式: argument=GeoIPApi={{{GeoIPApi}}}
let GeoIPApi = "muhan"; // 默认值
if (typeof $argument !== 'undefined' && $argument) {
    const args = $argument.split('&');
    for (const arg of args) {
        const [key, value] = arg.split('=');
        if (key === 'GeoIPApi') {
            GeoIPApi = value;
            break;
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
                                const info = `${body.region || ''}${body.city || ''}${body.isp || ''}`.replace(/中国|\s+/g, '');
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
                                const info = location.slice(1).join('').replace(/中国|\s+/g, '') || '未知地区';
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
                                
                                const info = `${province}${city}${isp}`.replace(/中国|\s+/g, '') || '未知地区';
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
                                info = info.replace(/中国|[\s\-a-zA-Z]/g, '') || '未知地区';
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
                                const info = `${region}${city}${isp}`.replace(/中国|\s+/g, '') || '未知地区';
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
            
            if (!result.ip || !isValidIPv4(result.ip)) {
                console.log(`${GeoIPApi} 接口解析失败，解析结果:`, JSON.stringify(result));
                console.log(`${GeoIPApi} 是否有效IPv4:`, result.ip ? isValidIPv4(result.ip) : false);
                callback(null, null);
                return;
            }
            
            console.log(`${GeoIPApi} 接口解析成功:`, JSON.stringify(result));
            callback(result.ip, result.info || '未知地区');
        });
    }

    // 获取外部 IPv6 地址的函数（增强版，支持真实的外部查询）
    function getExternalIPv6(callback) {
        // 如果选择 ping0 或 pingan 接口，也查询 IPv6
        if ((GeoIPApi === 'ping0' || GeoIPApi === 'pingan') && IPv6) {
            let ipv6Url;
            
            if (GeoIPApi === 'ping0') {
                ipv6Url = "https://ipv6.ping0.cc/geo";
            } else if (GeoIPApi === 'pingan') {
                // pingan 接口同样支持 IPv6，使用相同的URL
                ipv6Url = "https://rmb.pingan.com.cn/itam/mas/linden/ip/request";
            }
            
            $httpClient.get(ipv6Url, function (error, response, data) {
                if (error) {
                    console.log(`${GeoIPApi} IPv6接口请求错误:`, error);
                    // 回退到简化逻辑
                    const IPv6Original = v6.primaryAddress;
                    if (IPv6Original) {
                        callback(IPv6, '公网直连', true);
                    } else {
                        callback(null, null, false);
                    }
                    return;
                }
                
                if (!data) {
                    console.log(`${GeoIPApi} IPv6接口返回空数据`);
                    // 回退到简化逻辑
                    const IPv6Original = v6.primaryAddress;
                    if (IPv6Original) {
                        callback(IPv6, '公网直连', true);
                    } else {
                        callback(null, null, false);
                    }
                    return;
                }
                
                try {
                    if (GeoIPApi === 'ping0') {
                        const dataStr = data.toString().trim();
                        console.log(`ping0 IPv6接口返回数据: [${dataStr}]`);
                        
                        const lines = dataStr.split('\n').map(line => line.trim()).filter(line => line);
                        console.log(`ping0 IPv6按行分割结果:`, lines);
                        
                        if (lines.length >= 2) {
                            const externalIPv6 = lines[0]; // 第一行是IPv6地址
                            const location = lines[1]; // 第二行是位置信息
                            const provider = lines.length >= 4 ? lines[3] : ''; // 第四行是商家名称
                            
                            console.log(`ping0 IPv6解析结果: IP=${externalIPv6}, 位置=${location}`);
                            
                            if (isValidIPv6(externalIPv6)) {
                                // 组合IPv6地理信息
                                let ipv6Info = location;
                                if (provider && !provider.startsWith('AS')) {
                                    ipv6Info += provider;
                                }
                                // 移除中国、"-"、空格和英文字符
                                ipv6Info = ipv6Info.replace(/中国|[\s\-a-zA-Z]/g, '') || '未知地区';
                                
                                // 检查内外部IPv6是否相同
                                const IPv6Original = v6.primaryAddress;
                                const isIPv6Same = IPv6Original === externalIPv6;
                                
                                console.log(`ping0 IPv6最终信息: ${ipv6Info}, 内外部相同: ${isIPv6Same}`);
                                
                                // 格式化显示的IPv6地址
                                const displayIPv6 = externalIPv6.replace(/^(.{7}).+(.{7})$/, "$1****$2");
                                
                                callback(displayIPv6, ipv6Info, isIPv6Same);
                                return;
                            } else {
                                console.log(`ping0 IPv6地址无效: ${externalIPv6}`);
                            }
                        } else {
                            console.log(`ping0 IPv6数据行数不足: ${lines.length} 行`);
                        }
                    } else if (GeoIPApi === 'pingan') {
                        console.log(`pingan IPv6接口返回数据: [${data.toString()}]`);
                        const json = JSON.parse(data);
                        console.log(`pingan IPv6 JSON解析结果:`, JSON.stringify(json, null, 2));
                        
                        if (json && json.code === 0 && json.data && json.data.ip) {
                            const externalIPv6 = json.data.ip;
                            console.log(`pingan IPv6提取到IP: ${externalIPv6}`);
                            
                            if (isValidIPv6(externalIPv6)) {
                                const region = json.data.region || '';
                                const city = json.data.city || '';
                                const isp = json.data.isp || '';
                                console.log(`pingan IPv6地理信息: 地区=${region}, 城市=${city}, ISP=${isp}`);
                                
                                // 组合IPv6地理信息，去除中国字样
                                const ipv6Info = `${region}${city}${isp}`.replace(/中国|\s+/g, '') || '未知地区';
                                
                                // 检查内外部IPv6是否相同
                                const IPv6Original = v6.primaryAddress;
                                const isIPv6Same = IPv6Original === externalIPv6;
                                
                                console.log(`pingan IPv6最终信息: ${ipv6Info}, 内外部相同: ${isIPv6Same}`);
                                
                                // 格式化显示的IPv6地址
                                const displayIPv6 = externalIPv6.replace(/^(.{7}).+(.{7})$/, "$1****$2");
                                
                                callback(displayIPv6, ipv6Info, isIPv6Same);
                                return;
                            } else {
                                console.log(`pingan IPv6地址无效: ${externalIPv6}`);
                            }
                        } else {
                            console.log(`pingan IPv6数据结构不符合预期`);
                        }
                    }
                } catch (e) {
                    console.log(`${GeoIPApi} IPv6解析器出错:`, e.message);
                }
                
                // 解析失败，回退到简化逻辑
                const IPv6Original = v6.primaryAddress;
                if (IPv6Original) {
                    callback(IPv6, '公网直连', true);
                } else {
                    callback(null, null, false);
                }
            });
        } else {
            // 非支持的接口或没有 IPv6，使用简化逻辑
            if (!IPv6) {
                callback(null, null, false);
                return;
            }
            
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
