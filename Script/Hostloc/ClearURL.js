(function() {
    'use strict';
       var content = document.querySelectorAll(".pcb");
       const regex = new RegExp('(?<!font size="2"><a href=")((?<!src="|href=")https?:\/\/.*?)(<|&nbsp;)', 'gm');

       for (var i = 0; i < content.length; i++)
       {

           // 转换为超链接
           if (regex.test(content[i].innerHTML))
           {
             content[i].innerHTML = content[i].innerHTML.replace(regex,'<a href="$1" target="_blank">$1</a><');
           }
           // 去掉
           content[i].innerHTML = content[i].innerHTML.replace(/aff\.php/gm,'cart.php').replace(/aff=\d+/gm,'a=add').replace(/(aff\w*|ref=\w+)/gm,'').replace(/affid=\d+/gm, 'a=b').replace(/affkey=\d+/gm, 'a=b');
       }
})();