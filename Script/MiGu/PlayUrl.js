let body = $response.body.toString().replace(/\"needAuth\"\:true/g, '"needAuth": false');
var obj = JSON.parse(body);
obj['rid'] = 'SUCCESS';
obj['playCode'] = '100000';
if(obj.body.urlInfo){
//obj['body']['auth']['logined'] = 'false';
//obj['body']['auth']['authPassDefinitionMap']['3'] = 'release';
obj['body']['urlInfo']['definitionRightSource'] = 'member';
obj['body']['urlInfo']['outPutFormat'] = 'm3u8';
obj['body']['urlInfo']['rateDesc'] = '蓝光 1080P';
obj['body']['urlInfo']['rateType'] = '4';
obj['body']['urlInfo']['usageCode'] = '55';
obj['body']['urlInfo']['hdEquityInfo']['toast'] = '尊贵的钻石会员，为您切换至蓝光 1080P 清晰度';
obj['body']['urlInfo']['hdEquityInfo']['source'] = 'member';
obj['body']['urlInfo']['hdEquityInfo']['rateDesc'] = '蓝光 1080P';
obj['body']['urlInfo']['hdEquityInfo']['rateType'] = '4';
obj['body']['mediaFiles'] = [{
    "hdCodeType": null,
    "fileSize": "0",
    "hdrType": null,
    "mediaType": "12",
    "ottEnable": "1",
    "rateTypeDesc": null,
    "cornerMarkImgUrl": null,
    "videoCoding": "h265",
    "usageCode": "53",
    "needAuth": false,
    "iconImgUrl": null,
    "userDolbyPlay": null,
    "codeRate": "100",
    "currentTerminalCanSwitch": "1",
    "rateDesc": "标清 540P",
    "rateType": "2"
},
{
    "hdCodeType": null,
    "fileSize": "0",
    "hdrType": null,
    "mediaType": "12",
    "ottEnable": "1",
    "rateTypeDesc": null,
    "cornerMarkImgUrl": null,
    "videoCoding": "h265",
    "usageCode": "54",
    "needAuth": false,
    "iconImgUrl": null,
    "userDolbyPlay": null,
    "codeRate": "150",
    "currentTerminalCanSwitch": "1",
    "rateDesc": "高清 720P",
    "rateType": "3"
},
{
    "hdCodeType": null,
    "fileSize": "0",
    "hdrType": null,
    "mediaType": "12",
    "ottEnable": "1",
    "rateTypeDesc": null,
    "cornerMarkImgUrl": "https:\/\/img.cmvideo.cn\/publish\/noms\/2021\/04\/13\/1O31EBJMSV9CB.png",
    "videoCoding": "h265",
    "usageCode": "55",
    "needAuth": false,
    "iconImgUrl": null,
    "userDolbyPlay": null,
    "codeRate": "200",
    "currentTerminalCanSwitch": "1",
    "rateDesc": "蓝光 1080P",
    "rateType": "4"
}
];
obj['body']['auth'] = {
    "member": {
        "triadiamondl": "2099-12-21 14:39:31"
    },
    "logined": true,
    "authPassDefinitionMap": {
        "3": "member",
        "1": "release",
        "4": "member",
        "2": "release"
    },
    "authResult": "SUCCESS",
    "extInfo": null,
    "resultDesc": "成功",
    "benefites": null
};
obj['body']['advertInfo'] = {
    "playLengths": "5",
    "isAdvert": "2",
    "toast": null,
    "reason": "ad-skip-5-seconds",
    "source": "member",
    "openMemberBenifitType": null
 }
}
$done({ body: JSON.stringify(obj) });