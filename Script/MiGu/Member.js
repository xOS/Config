var obj = JSON.parse($response.body);
obj = {
    "code": 200,
    "message": "success",
    "body": {
        "memberInfo": {
            "memberInfo": {
                "rights": {
                    "isUfc": true,
                    "isDiamond": true,
                    "skipBeforeAd": true,
                    "isVip": true
                },
                "memberGroup": "4",
                "icons": "diamond",
                "extra": "",
                "title": "钻石会员",
                "iconsDetail": {
                    "teamBorderIcon": "http:\/\/img.cmvideo.cn:8080\/publish\/noms\/2020\/05\/25\/1O25B1UFCP3IC.png",
                    "personalCenterIcon": "http:\/\/img.cmvideo.cn:8080\/publish\/noms\/2020\/05\/27\/1O25B7OBAS02V.png",
                    "badgeIcon": "http:\/\/img.cmvideo.cn:8080\/publish\/noms\/2020\/05\/25\/1O25B1UER73KR.png",
                    "personalInfoIcon": "http:\/\/img.cmvideo.cn:8080\/publish\/noms\/2020\/05\/27\/1O25B7ONU63LG.png",
                    "smallIcon": "http:\/\/img.cmvideo.cn:8080\/publish\/noms\/2020\/05\/25\/1O25B1UC3SHKH.png",
                    "barrageIcon": "http:\/\/img.cmvideo.cn:8080\/publish\/noms\/2020\/05\/25\/1O25B1UCU9I45.png"
                },
                "type": "diamond",
                "term": "2099-12-21 14:39:31"
            },
            "memberTerm": {
                "diamond": "2099-12-21 14:39:31"
            },
            "benefitsInfo": {
                "high-resolution": "2099-12-21 14:39:31",
                "ad-skip-5-seconds": "2099-12-21 14:39:31",
                "replay-7-days": "2099-12-21 14:39:31",
                "720p": "2099-12-21 14:39:31",
                "dolby": "2099-12-21 14:39:31",
                "vip": "2099-12-21 14:39:31",
                "1080p": "2099-12-21 14:39:31"
            }
        },
        "verticalMemberInfo": {},
        "resultCode": "SUCCESS"
    },
    "timeStamp": 1627887515006
};
$done({ body: JSON.stringify(obj) });