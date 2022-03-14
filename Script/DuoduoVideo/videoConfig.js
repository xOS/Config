var obj = JSON.parse($response.body);
var url = $request.url;
const url1 = "/get_combined_drama_detail";
const url2 = "/get_priority_video_quality_config";
const url3 = "/get_movie_play_info";

if(obj.data.m3u8 && url.indexOf(url3) != -1){
obj.data.m3u8.currentQuality = 'OD';
obj.data.m3u8.externalAds = false;
}

if(obj.data.qualityConfig && url.indexOf(url1) != -1){
obj.data.moviePlayInfo.m3u8.currentQuality = 'OD';
obj.data.moviePlayInfo.m3u8.externalAds = false;
obj.data.qualityConfig = {
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
        "canShowVip": false
      },
      {
        "qualityDescription": "AI原画",
        "qualityCode": "AI_OD",
        "canPlay": true,
        "initialQuality": true,
        "canShowLogin": false,
        "canShowVip": false
      }
    ]
  };
} else if(url.indexOf(url2) != -1){
obj.data = {
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
        "canShowVip": false
      },
      {
        "qualityDescription": "AI原画",
        "qualityCode": "AI_OD",
        "canPlay": true,
        "initialQuality": true,
        "canShowLogin": false,
        "canShowVip": false
      }
    ]
  };
}
$done({ body: JSON.stringify(obj) });
