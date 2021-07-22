// URL = ^https:\/\/main\.iam\.ad\.ext\.azure\.com\/api\/AADGraph

body = $request.body;
let obj = JSON.parse(body);
obj["passwordCredential"]["endDate"] = "2999-10-11T07:19:47.610Z";
body = JSON.stringify(obj); 
$done({body});