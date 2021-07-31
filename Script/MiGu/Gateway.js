let body = $response.body.replace('"needAuth": true', '"needAuth": false');
var obj = JSON.parse(body);
obj['body']['urlInfo']['rateDesc'] = '蓝光 1080P';
obj['body']['urlInfo']['rateType'] = '4';
obj['body']['urlInfo']['usageCode'] = '57';
obj['body']['urlInfo']['hdEquityInfo']['toast'] = '尊贵的钻石会员，为您切换至蓝光 1080P清晰度';
obj['body']['urlInfo']['hdEquityInfo']['rateDesc'] = '蓝光 1080P';
obj['body']['urlInfo']['hdEquityInfo']['rateType'] = '4';
obj['body']['mediaFiles'] = [
    {
      "hdCodeType": null,
      "fileSize": "17970455",
      "hdrType": null,
      "mediaType": "10",
      "ottEnable": "1",
      "rateTypeDesc": null,
      "cornerMarkImgUrl": null,
      "videoCoding": "h264",
      "usageCode": "455",
      "needAuth": false,
      "iconImgUrl": null,
      "userDolbyPlay": null,
      "codeRate": "80",
      "currentTerminalCanSwitch": "1",
      "rateDesc": "标清 540P",
      "rateType": "2"
    },
    {
      "hdCodeType": null,
      "fileSize": "27008374",
      "hdrType": null,
      "mediaType": "10",
      "ottEnable": "1",
      "rateTypeDesc": null,
      "cornerMarkImgUrl": null,
      "videoCoding": "h264",
      "usageCode": "56",
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
      "fileSize": "64038955",
      "hdrType": null,
      "mediaType": "10",
      "ottEnable": "1",
      "rateTypeDesc": null,
      "cornerMarkImgUrl": "https:\/\/img.cmvideo.cn\/publish\/noms\/2021\/04\/13\/1O31EBJMSV9CB.png",
      "videoCoding": "h264",
      "usageCode": "92",
      "needAuth": false,
      "iconImgUrl": null,
      "userDolbyPlay": null,
      "codeRate": "210",
      "currentTerminalCanSwitch": "1",
      "rateDesc": "蓝光 1080P",
      "rateType": "4"
    }
  ];

$done({body: JSON.stringify(obj)});