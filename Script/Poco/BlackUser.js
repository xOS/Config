let body = $response.body;
body = JSON.parse(body);

// 黑名单
let blackId = [201494286, 201843361, 201919782, 200605457];

if (body.data && body.data.list && body.data.list.length > 0) {
    var data = body.data.list;
    for (var i in data) {
        let uid = data[i].user_id;
        let vid = data[i].visited_user_id;
        let nickname = data[i].user_nickname;
        for (var k in blackId) {
            if (uid === blackId[k] || vid === blackId[k] ) {
                data[i] = null;
                data.splice(i, 1);
                console.log(nickname + "已被屏蔽！");
                // console.log("屏蔽用户ID："+ uid);
            }
        }
        
    }
}

body = JSON.stringify(body);
$done({ body });