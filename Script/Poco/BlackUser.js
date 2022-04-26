let body = $response.body;
body = JSON.parse(body);

// 黑名单
let blackid = [178336580, 201494286, 201843361, 178336580, 201919782, 200605457];
if (body.data && body.data.list && body.data.list.length > 0) {
    var data = body.data.list;
    for (var i in data) {
        let uid = data[i].user_id;
        let nickname = data[i].user_nickname;
        for (var k in blackid) {
            if (uid === blackid[k]) {
                data[i] = null;
                data.splice(i, 1);
                console.log("屏蔽用户名："+ nickname);
                console.log("屏蔽用户ID："+ uid);
            }
        }
        
    }
}

body = JSON.stringify(body);
$done({ body });