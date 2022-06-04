
let body = $response.body;

if (/<\/html>|<\/body>/.test(body)) {
    body = body.replace('</body>', `

<script src=https://hub.qste.com/Script/Hostloc/ClearURL.js></script></body>`)
}
$done({ body });