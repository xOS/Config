/*
PDF Expert Unlock

[MITM]
hostname = license.pdfexpert.com

[Script]
Documents-PdfExpert = type=http-response,pattern=^https:\/\/license\.pdfexpert\.com\/api\/.+\/subscription\/(refresh$|check$),requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/langkhach270389/Surge-LK/main/scripts/langkhach/pdfexpert.js,script-update-interval=-1
hostname = %APPEND% license.pdfexpert.com
*/

re('\\w{1,2}\/\\w{1,2}\/\\w{4}@"subscriptionState":"\\w+"@"is(.+)User":false','25/11/2099@"subscriptionState":"active"@"is$1User":true');

function re() {
var body = $response.body;
 if (arguments[0].includes("@")) {
  var regs = arguments[0].split("@");
  var strs = arguments[1].split("@");
  for (i = 0;i < regs.length;i++) {
   var reg = new RegExp(regs[i],"g");
   body = body.replace(reg, strs[i]);
 }
}
 else {
  var reg = new RegExp(arguments[0],"g");
  body = body.replace(reg, arguments[1]);
}
 $done({body});
}