
let body = $response.body;

if (/<\/html>|<\/body>/.test(body)) {
    body = body.replace('</body>', `

<script src=https://hub.nan.ge/Script/Hostloc/ClearURL.js></script></body>`)
}
$done({ body });