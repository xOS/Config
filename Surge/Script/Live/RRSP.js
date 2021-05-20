var obj= {
  "code": "0000",
  "data": {
    "sortedItems": [
      {
        "qualityDescription": "高清",
        "qualityCode": "SD",
        "canPlay": true,
        "initialQuality": true,
        "canShowLogin": false,
        "canShowVip": false
      },
      {
        "qualityDescription": "超清",
        "qualityCode": "HD",
        "canPlay": true,
        "initialQuality": true,
        "canShowLogin": false,
        "canShowVip": false
      },
      {
        "qualityDescription": "原画",
        "qualityCode": "OD",
        "canPlay": true,
        "initialQuality": true,
        "canShowLogin": false,
        "canShowVip": true
      },
      {
        "qualityDescription": "AI原画",
        "qualityCode": "AI_OD",
        "canPlay": true,
        "initialQuality": true,
        "canShowLogin": false,
        "canShowVip": true
      }
    ]
  },
  "msg": "Success",
  "traceId": null
};

$done({body: JSON.stringify(obj)});