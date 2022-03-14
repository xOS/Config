var obj = JSON.parse($response.body);
obj = {
    "code": 200,
    "message": "success",
    "body": {
        "indexMember": {
            "expireTime": "2099-12-21 14:39:31",
            "id": "5da5614dd79302d926350525",
            "expiredCardImg": "",
            "serialNumber": 2,
            "expiredIdentityIconUrl": "http:\/\/img.cmvideo.cn:8080\/publish\/noms\/2019\/10\/18\/1O1AACVOAGMPR.png",
            "memberType": "diamond",
            "timesFlag": "4",
            "memberName": "钻石会员",
            "assetType": "member",
            "cardImg": "",
            "sealedFlag": "0",
            "identityIconUrl": "http:\/\/img.cmvideo.cn:8080\/publish\/noms\/2019\/10\/18\/1O1AACVK3GNL7.png",
            "rightsCopywriting": "",
            "iconUrl": "http:\/\/img.cmvideo.cn:8080\/publish\/noms\/2019\/10\/18\/1O1AACVSQ6SQI.png",
            "rightsDescription": "享会员片库、直播7天回看、VIP专属下载等会员权益。",
            "effectiveFlag": "4"
        }
    },
    "timeStamp": 1627887514799
};
$done({ body: JSON.stringify(obj) });