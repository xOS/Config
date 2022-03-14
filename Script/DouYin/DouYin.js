if (typeof $response === "undefined") {
  const path = [
    "/feed/", // 推荐
    "/aweme/post/", // 用户
    "/follow/feed/", // 关注
    "/nearby/feed/", // 附近
    "/aweme/detail/", // 分享
    "/mix/aweme/", // 合辑
    "/hot/search/video/list/", // 热榜
    "/aweme/favorite/" // 喜欢
  ];
  let url = $request.url;
  let pattern = new RegExp(`\\d(${path.join("|")})\\?`);
  if (url.match(pattern)) {
    $done({ url: url.replace("/v2/", "/v1/") + "#scripting" });
  } else {
    $done({});
  }
} else {
  let obj = JSON.parse($response.body);
  delete obj.poi_op_card_list;
  if (obj.data) obj.data = filter_data(obj.data);
  if (obj.aweme_list) obj.aweme_list = filter_list(obj.aweme_list);
  if (obj.aweme_detail) obj.aweme_detail = filter_detail(obj.aweme_detail);
  $done({ body: JSON.stringify(obj) });
}

function filter_data(array) {
  let i = array.length;
  while (i--) {
    if (array[i].aweme.status) patch(array[i].aweme);
  }
  return array;
}

function filter_list(array) {
  let i = array.length;
  while (i--) {
    if (array[i].raw_ad_data || array[i].live_reason) {
      array.splice(i, 1);
    } else if (array[i].status) {
      patch(array[i]);
    }
  }
  return array;
}

function filter_detail(dictionary) {
  if (dictionary.status) patch(dictionary);
  return dictionary;
}

function patch(aweme) {
  try {
    aweme.status.reviewed = 1;
    aweme.video_control.allow_download = true;
    aweme.video_control.prevent_download_type = 0;
    delete aweme.video.misc_download_addrs;
    const play_url = aweme.video.play_addr;
    aweme.video.download_addr = play_url;
    aweme.video.download_suffix_logo_addr = play_url;
    if (aweme.images && aweme.images.length > 0) {
      let i = aweme.images.length;
      while (i--) {
        aweme.images[i].download_url_list = aweme.images[i].url_list;
      }
    }
  } catch (error) {
    console.log(`\n${error}\n${JSON.stringify(aweme)}`);
  }
  return aweme;
}