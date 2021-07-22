// URL = ^https:\/\/graph\.microsoft\.com\/v1\.0\/myorganization\/applications\/[\w-]+\/addPassword

body = $request.body;
let obj = JSON.parse(body);
obj["passwordCredential"]["endDateTime"] = "2999-10-11T07:19:47.610Z";
body = JSON.stringify(obj); 
$done({body});