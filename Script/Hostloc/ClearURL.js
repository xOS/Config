
let body = $response.body;

if (/<\/html>|<\/body>/.test(body)) {
    body = body.replace('</body>', `
  
  <script>
// Hostloc 移除 AFF，URL 超链接化
var content = document.querySelectorAll(".pcb");
const regex = new RegExp('(?<!font size="2"><a href=")((?<!src="|href=")https?:\/\/.*?)(<|&nbsp;)', 'gm');

for (var i = 0; i < content.length; i++) {
    //console.log(content[i].innerHTML);
    //console.log(regex.test(content[i].innerHTML));

    // 转换为超链接
    if (regex.test(content[i].innerHTML)) {
        content[i].innerHTML = content[i].innerHTML.replace(regex, '<a href="$1" target="_blank">$1</a><');
    }
    // 去掉aff
    content[i].innerHTML = content[i].innerHTML.replace(/aff\.php/gm, 'cart.php').replace(/aff=\d+/gm, 'a=add').replace(/ref=\w+/gm, '').replace(aff=\d+/gm, 'a=add');
}
</script></body>`)
}
$done({ body });