/*
[Script]
http-request ^https://[\s\S]*\.googlevideo\.com/.*&(oad|ctier) script-path=https://config.nange.cn/Config/Surge/Script/YouTube.js
[MITM]
hostname = *.googlevideo.com
*/

var data = {
  body: "{}",
  headers: {
    "Content-Type": "multipart/byteranges"
  }
};
$done({response: data});
