
let body = $response.body;

if (/<\/html>|<\/body>/.test(body)) {
    body = body.replace('</body>', `

<script src=https://hub.nange.cn/Script/Hostloc/ClearURL.js></script></body>`)
}
$done({ body });