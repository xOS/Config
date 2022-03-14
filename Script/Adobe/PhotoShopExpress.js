/*
Photoshop Express by LangKhach
[Script]
PS Express = type=http-response,pattern=^https:\/\/lcs-mobile-cops\.adobe\.io\/mobile_profile,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/XOS/Config/Her/Surge/Script/PS%20Express.js
[MITM]
lcs-mobile-cops.adobe.io
*/

let obj = JSON.parse($response.body)
let pro = obj["mobileProfile"];
pro["profileStatus"] = "PROFILE_AVAILABLE";
pro["legacyProfile"] = "{}";
pro["relationshipProfile"] = "[]";
$done({ body: JSON.stringify(obj) })