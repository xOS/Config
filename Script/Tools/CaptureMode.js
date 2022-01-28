!(async() => {
    const { wifi, v4 } = $network;
    const v4IP = v4.primaryAddress;
    if (!v4IP) {
        $.done({
            title: "未连接网络",
            content: "请检查网络连接",
            icon: "airplane",
            "icon-color": "#ff9800"
        });
    }
    let module = "MitM 所有主机名",
        panel = { title: "抓包状态", icon: "tray.and.arrow.down.fill" },
        capture,
        mitmall;
    if ($trigger == "button") {
        capture = (await httpAPI("/v1/features/capture")).enabled;
        mitmall = (await httpAPI("/v1/modules")).enabled.includes(module);
        if (capture == mitmall)
            await httpAPI("/v1/features/capture", "POST", { enabled: !capture });
        let moduleBody = {};
        moduleBody[module] = !mitmall;
        await httpAPI("/v1/modules", "POST", moduleBody);
        // await sleep(30);
    }
    capture = (await httpAPI("/v1/features/capture")).enabled;
    mitmall = (await httpAPI("/v1/modules")).enabled.includes(module);

    if (capture && mitmall) panel["icon-color"] = "#ff0000";
    else if (capture || mitmall) panel["icon-color"] = "#ff9800";
    else panel["icon-color"] = "#35C759";
    panel.content =
        `抓包模式：${mitmall && capture ? "开启" : "关闭"}`;
    $done(panel);
})();

function httpAPI(path = "", method = "GET", body = null) {
    return new Promise((resolve) => {
        $httpAPI(method, path, body, (result) => {
            resolve(result);
        });
    });
}

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}