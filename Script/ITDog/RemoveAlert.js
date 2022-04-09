
let body = $response.body;

if (/<\/html>|<\/body>/.test(body)) {
    body = body.replace('</body>', `

<script>
// (function() {
//     'use strict';
//     var content = document.querySelectorAll("script");
    
//     for (var i = 0; i < content.length; i++)
//     {
//         if(content[i].innerHTML.toString().indexOf('_0xodd=') != -1){
//             content[i].innerHTML = null;
//             break;
//         }
//         // break;
//     }
// })();
window.alert = function() {
    return false;
}
</script></body>`)
}
$done({ body });