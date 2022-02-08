/* 没有天翼账号中心的可以网页打开
https://e.189.cn/
进行登录，登完分别依次打开脚本里的
https://e.189.cn/store/user/package_detail.do
https://e.189.cn/store/user/balance_new.do
就能获取信息了。 */

const detail = "https://e.189.cn/store/user/package_detail.do";
const money = "https://e.189.cn/store/user/balance_new.do";

(async () => {
    if (typeof $request != "undefined") {
        saveRequest();
        $done({
            title: "请求异常",
            content: "请检查运行环境！",
            style: 'error'
        });
        return;
    }

    let request = JSON.parse($persistentStore.read("Telecom"));
    let usage = await Request(detail, "post", request.headers, request.body);
    let balance = await Request(money, "post", request.headers, request.body);
    if (!usage || !balance || (usage.result < 0)) $done();
    let total = usage.total * 1024;
    let be = usage.balance * 1024;
    let fee = balance.totalBalanceAvailable;

    $done({
        title: `中国电信 | ${getTime()}`,
        content: `话费：¥ ${fee / 100} 元 | 流量：${bytesToSize(be)}`,
        icon: "simcard",
        "icon-color": "#35C759",
    });
})();

function Request(url, method = "get", headers, body) {
    let request = {
        url: url,
        headers: headers,
        body: body
    }
    return new Promise((resolve, reject) => {
        $httpClient[method](request, (err, resp, data) => {
            if (err != null) {
                reject(err);
                return;
            }
            if (resp.status !== 200) {
                reject("Not Available");
                return;
            }
            resolve(JSON.parse(data));
        });
    });
}

function bytesToSize(bytes) {
    if (bytes === 0) return "0 B";
    let k = 1024;
    sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    let i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + sizes[i];
}

function saveRequest() {
    let headers = $request.headers;
    delete headers.Connection;
    let request = {
        url: "",
        headers: headers,
        body: $request.body,
    };
    $persistentStore.write(JSON.stringify(request), "Telecom");
    $notification.post("Done", "成功保存请求信息", "");
}

function getTime() {
    let now = new Date();
    let hour = now.getHours();
    let minutes = now.getMinutes();
    hour = hour > 9 ? hour : "0" + hour;
    minutes = minutes > 9 ? minutes : "0" + minutes;
    return `${hour}:${minutes}`
}