!(async () => {
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
    var moduleName = "MitM 所有主机名";
    let panel = { title: "抓包状态", icon: "tray.and.arrow.down.fill" },
        capture, mitm;

    if (typeof $argument != "undefined") {
        let arg = Object.fromEntries($argument.split("&").map((item) => item.split("=")));
        if (arg.moduleName) moduleName = panel.title = arg.moduleName;
        if (arg.title) panel.title = arg.title;
        if (arg.icon) panel.icon = arg.icon;
    }

    if ($trigger == "button") {
        capture = (await httpAPI("/v1/features/capture")).enabled;
        mitm = (await httpAPI("/v1/modules")).enabled.includes(moduleName);

        if (capture == mitm) {
            await httpAPI("/v1/features/capture", "POST", { enabled: !capture });
        }
        let moduleBody = {};
        moduleBody[moduleName] = !mitm;
        await httpAPI("/v1/modules", "POST", moduleBody);
        await sleep(600);
    }
    capture = (await httpAPI("/v1/features/capture")).enabled;
    mitm = (await httpAPI("/v1/modules")).enabled.includes(moduleName);

    if (mitm && capture) {
        panel['icon-color'] = "#ff0000";
        panel.content = '抓包模式：已开启';
    } else if (capture || mitm) {
        panel['icon-color'] = "#ff9800";
        panel.content = '抓包模式：未就绪';
    } else {
        panel['icon-color'] = "#9978FF";
        panel.content = '抓包模式：已关闭';
    }
    // panel.content = `抓包模式：${mitm && capture ? "开启" : "关闭"}`;
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