/**
 * Generate subscription info with the url you input and display on the panel
 * Updated: Sep 27, 2022
 * @Author cactusnix
 */

const SI_CONFIG = $persistentStore.read("SI_CONFIG");
if (!SI_CONFIG) {
  $done({
    title: "[Warning]: No Config in $persistentStore!",
  });
}
const config = JSON.parse(SI_CONFIG);
$httpClient.get(config.url, (err, resp, _) => {
  if (err || resp.status !== 200 || !resp.headers["subscription-userinfo"]) {
    $done({
      title: "Get Info Error or no info in headers",
    });
  }
  const data = resp.headers["subscription-userinfo"];
  const keyValue = {
    Up: {
      regex: /upload=(\d+)/,
      value: 0,
    },
    Down: {
      regex: /download=(\d+)/,
      value: 0,
    },
    Total: {
      regex: /total=(\d+)/,
      value: 0,
    },
  };
  Object.keys(keyValue).forEach((key) => {
    keyValue[key].value = Number(
      (data.match(keyValue[key].regex)[1] / (1024 * 1024 * 1024)).toFixed(2)
    );
  });
  const content = [
    `Updated: ${new Date().toLocaleString()}`,
    `Used: ${(keyValue.Up.value + keyValue.Down.value).toFixed(2)}GB`,
    `Total: ${keyValue.Total.value}GB`,
    `Expire: ${new Date(
      Number(data.match(/expire=(\d+)/)[1]) * 1000
    ).toLocaleDateString()}`,
  ];
  $done({
    title: config.name ? config.name : "Sub Info",
    content: content.join("\n"),
  });
});