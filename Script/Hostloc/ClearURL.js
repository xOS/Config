
let body = $response.body;

if (/<\/html>|<\/body>/.test(body)) {
    body = body.replace('</body>', `
  
  <script>

// @description  Hostloc 移除 AFF，URL 超链接化
// @author        Faxlok
// @match        https://hostloc.com/thread-*.html
// @match        https://hostloc.com/forum.php?mod=viewthread&tid=*&highlight=*
// @match        https://hostloc.com/forum.php?mod=viewthread&tid=*&page=*

(function () {
    'use strict';
    // https://regex101.com/r/sZaYtI/1
    var content = document.querySelectorAll(".pcb");
    const regex = new RegExp('(?<!font size="2"><a href=")((?<!src="|href=")https?:\\/\\/.*?)(<|&nbsp;)', 'gm');

    for (var i = 0; i < content.length; i++) {
        //console.log(content[i].innerHTML);
        //console.log(regex.test(content[i].innerHTML));

        // URL 转为超链接
        if (regex.test(content[i].innerHTML)) {
            content[i].innerHTML = content[i].innerHTML.replace(regex, '<a href="$1" target="_blank">$1</a><');
        }
        // 去掉 AFF
        content[i].innerHTML = content[i].innerHTML.replace(/aff\\.php/gm,'cart.php').replace(/aff=\\d+/gm,'a=add').replace(/(aff\\w*|ref=\\w+)/gm,'').replace(/affid=\\d+/gm, 'a=b').replace(/affkey=\\d+/gm, 'a=b');
    }
})();
</script></body>`)
}
$done({ body });