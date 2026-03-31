!(async () => {
    const { wifi, v4 } = $network;
    const v4IP = v4.primaryAddress;
    if (!v4IP) {
        $.done({
            title: "未连接网络",
            content: "请检查网络连接",
            icon: "airplane",
            "icon-color": "#00c8ff"
        });
    }

    let dnsCache = (await httpAPI("/v1/dns", "GET")).dnsCache;
    dnsCache = [...new Set(dnsCache.map((d) => d.server))].toString().replace(/,/g, "\n");
    await httpAPI("/v1/dns/flush");
    let delay = ((await httpAPI("/v1/test/dns_delay")).delay * 1000).toFixed(0);
    $done({
        title: "DNS 缓存刷新",
        content: `延迟：${delay} ms`,
        icon: "leaf.arrow.triangle.circlepath",
        "icon-color": "#35C759"
    });
})();

function httpAPI(path = "", method = "POST", body = null) {
    return new Promise((resolve) => {
        $httpAPI(method, path, body, (result) => {
            resolve(result);
        });
    });
}