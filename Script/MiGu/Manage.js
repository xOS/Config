let body = $response.body.replace('"vip": 1', '"vip": 0');
body['body'] = [
    {
      "action": null,
      "sort": 1,
      "status": 1,
      "updateTime": 1574405925000,
      "resolutionName": "高清540P",
      "vip": 0,
      "resolution": "2"
    },
    {
      "action": null,
      "sort": 2,
      "status": 1,
      "updateTime": 1574213613000,
      "resolutionName": "超清720P",
      "vip": 0,
      "resolution": "3"
    },
    {
      "action": {
        "type": "JUMP_H5_BY_WEB_VIEW",
        "params": {
          "pageID": "",
          "location": "OTHER#1574213596107",
          "contentID": "",
          "extra": null,
          "frameID": "default-frame",
          "path": null,
          "url": "http:\/\/www.baidu.com"
        }
      },
      "sort": 3,
      "status": 1,
      "updateTime": 1574213595000,
      "resolutionName": "蓝光1080P",
      "vip": 0,
      "resolution": "4"
    },
    {
      "action": {
        "type": "JUMP_H5_BY_WEB_VIEW",
        "params": {
          "pageID": "",
          "location": "OTHER#1574405961031",
          "contentID": "",
          "extra": null,
          "frameID": "default-frame",
          "path": null,
          "url": "http:\/\/www.baidu.com"
        }
      },
      "sort": 4,
      "status": 1,
      "updateTime": 1574405960000,
      "resolutionName": "原画50帧HDR",
      "vip": 0,
      "resolution": "7"
    }
  ];
$done({body})