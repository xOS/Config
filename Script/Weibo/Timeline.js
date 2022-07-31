const path1 = "/groups/timeline";
const path2 = "/statuses/unread";
const path3 = "/statuses/extend";
const path4 = "/comments/build_comments";
const path5 = "/photo/recommend_list";
const path6 = "/stories/video_stream";
const path7 = "/statuses/positives/get";
const path8 = "/stories/home_list";
const path9 = "/profile/statuses";
const path10 = "/statuses/friends/timeline";
const path11 = "/service/picfeed";
const path12 = "/fangle/timeline";
const path13 = "/searchall";
const path14 = "/cardlist";
const path15 = "/statuses/video_timeline";
const path16 = "/page";
const path17 = "/statuses/friends_timeline";
const path18 = "/!/photos/pic_recommend_status";
const path19 = "/statuses/video_mixtimeline";
const path20 = "/video/tiny_stream_video_list";
const path21 = "/photo/info";
const path22 = "/live/media_homelist";
const path23 = "/remind/unread_count";
const path24 = "/createrIndex";
const path25 = "/st_videos/tiny/effect/shoot_display_config";
const path26 = "/search/finder";
const path27 = "/search/container_timeline";
const path28 = "/huati/discovery_home_bottom_channel_list";
// const path29 = "/statuses/unread_topic_timeline";

const url = $request.url;
let body = $response.body;

if (
    url.indexOf(path1) != -1 ||
    url.indexOf(path2) != -1 ||
    url.indexOf(path10) != -1 ||
    url.indexOf(path15) != -1 ||
    url.indexOf(path17) != -1 ||
    url.indexOf(path20) != -1
) {
    let obj = JSON.parse(body);
    if (obj.statuses) obj.statuses = filter_timeline_statuses(obj.statuses);
    if (obj.advertises) obj.advertises = [];
    if (obj.ad) obj.ad = [];
    if (obj.num) obj.num = obj.original_num;
    if (obj.trends) obj.trends = [];
    if (obj.cards) {
        if (obj.cards.length > 0) {
            // obj.cards.splice(0, 2);
            var data = obj.cards;
            for (var i in data) {
                let element = obj.cards[i];
                if (element.card_type != 9) {
                    data[i] = null;
                    obj.cards.splice(i, 1);
                    // console.log(i);
                }
            }
        }
    }
    body = JSON.stringify(obj);
} else if (url.indexOf(path3) != -1) {
    let obj = JSON.parse(body);
    if (obj.trend) delete obj.trend;
    body = JSON.stringify(obj);
} else if (url.indexOf(path4) != -1) {
    let obj = JSON.parse(body);
    obj.recommend_max_id = 0;
    if (obj.status) {
        if (obj.top_hot_structs) {
            obj.max_id = obj.top_hot_structs.call_back_struct.max_id;
            delete obj.top_hot_structs;
        }
        if (obj.datas) obj.datas = filter_comments(obj.datas);
    } else {
        obj.datas = [];
    }
    body = JSON.stringify(obj);
} else if (url.indexOf(path5) != -1 || url.indexOf(path18) != -1) {
    let obj = JSON.parse(body);
    obj.data = {};
    body = JSON.stringify(obj);
} else if (url.indexOf(path6) != -1) {
    let obj = JSON.parse(body);
    let segments = obj.segments;
    if (segments && segments.length > 0) {
        let i = segments.length;
        while (i--) {
            const element = segments[i];
            let is_ad = element.is_ad;
            if (is_ad && is_ad == true) segments.splice(i, 1);
        }
    }
    body = JSON.stringify(obj);
} else if (url.indexOf(path7) != -1) {
    let obj = JSON.parse(body);
    obj.datas = [];
    body = JSON.stringify(obj);
} else if (url.indexOf(path8) != -1) {
    let obj = JSON.parse(body);
    obj.story_list = [];
    body = JSON.stringify(obj);
} else if (url.indexOf(path11) != -1 || url.indexOf(path22) != -1) {
    let obj = JSON.parse(body);
    obj.data = [];
    body = JSON.stringify(obj);
} else if (
    url.indexOf(path9) != -1 ||
    url.indexOf(path12) != -1 ||
    url.indexOf(path13) != -1 ||
    url.indexOf(path14) != -1 ||
    url.indexOf(path16) != -1
) {
    let obj = JSON.parse(body);
    if (obj.cards) obj.cards = filter_timeline_cards(obj.cards);
    // 删除热搜列表置顶条目
    if (url.indexOf(path16) != -1 && obj.cards && obj.cards.length > 0 && obj.cards[0].card_group && obj.cards[0].card_group[0].itemid) {
        obj.cards[0].card_group = obj.cards[0].card_group.filter(c => !c.itemid.includes("t:51"));
    }
    body = JSON.stringify(obj);
} else if (url.indexOf(path19) != -1) {
    let obj = JSON.parse(body);
    delete obj.expandable_view;
    if (obj.hasOwnProperty("expandable_views")) delete obj.expandable_views;
    body = JSON.stringify(obj);
} else if (url.indexOf(path21) != -1) {
    if (body.indexOf("ad_params") != -1) {
        body = JSON.stringify({});
    }
} else if (url.indexOf(path23) != -1) {
    let obj = JSON.parse(body);
    obj.video = {};
    body = JSON.stringify(obj);
} else if (url.indexOf(path24) != -1) {
    let obj = JSON.parse(body);
    if (obj.data.hasOwnProperty('cards')) {
        obj.data['cards'] = obj.data['cards'].filter(element => !(element['item_id'] == 'creator_center_task_task'));
        obj.data['cards'] = obj.data['cards'].filter(element => !(element['item_id'] == 'creator_center_video_video'));
        obj.data['cards'] = obj.data['cards'].filter(element => !(element['item_id'] == 'creator_center_banner_hot'));
    }
    body = JSON.stringify(obj);
} else if (url.indexOf(path25) != -1) {
    let obj = JSON.parse(body);
    obj.camera_widget = {};
    obj.camera_widget.show_close = false;
    body = JSON.stringify(obj);
} else if (url.indexOf(path26) != -1) {
    let obj = JSON.parse(body);
    if (obj.channelInfo) {
        if (obj.channelInfo.channelConfig.style) obj.channelInfo.channelConfig.style.height = '0.1';
        obj.channelInfo.channels.splice(1, 4);
        obj.channelInfo.channels[0].title = '';
        // obj.channelInfo.channels[0].titleInfo.style.padding = [0,0,0,0];
        let items = obj.channelInfo.channels[0].payload.items;
        if(obj.channelInfo.channels[0].payload.moreInfo) obj.channelInfo.channels[0].payload.moreInfo = null;
        if (items && items.length > 0) {
            items.splice(2);
            items[1].data.col = 1;
            items[1].data.title = '推荐词条';
            let group = obj.channelInfo.channels[0].payload.items[1].data.group;
            group = filter_top_search(group);
        }
    }
    body = JSON.stringify(obj);
} else if (url.indexOf(path27) != -1) {
    let obj = JSON.parse(body);
    if (obj.moreInfo) obj.moreInfo = null;
    if (obj.items && obj.items.length > 0) {
        obj.items.splice(2);
        obj.items[1].data.col = 1;
        obj.items[1].data.title = '推荐词条';
        if (obj.items.length > 0) {
            let i = obj.items.length;
            while (i--) {
                let element = obj.items[i];
                if (element.category && element.category == 'feed') {
                    obj.items[i] = null;
                    obj.items.splice(i, 1);
                }
            }
        }
        let group = obj.items[1].data.group;
        group = filter_top_search(group);
    }
    body = JSON.stringify(obj);
} else if (url.indexOf(path28) != -1) {
    let obj = JSON.parse(body);
    if (obj.channel_list) {
        obj.channel_list.splice(1);
    }
    body = JSON.stringify(obj);
}
$done({ body });

function filter_timeline_statuses(statuses) {
    if (statuses && statuses.length > 0) {
        let i = statuses.length;
        while (i--) {
            let element = statuses[i];
            element.user.user_ability_extend = 1;
            element.user.verified_type_ext = 1;
            element.user.verified_type = 0;
            element.user.svip = 1;
            element.user.verified_level = 2;
            element.user.verified = true;
            element.user.has_ability_tag = 1;
            element.user.type = 1;
            element.user.star = 1;
            element.user.icons = [{
                "url": "https:\/\/h5.sinaimg.cn\/upload\/1004\/409\/2021\/06\/08\/feed_icon_100vip_7.png",
                "scheme": "https:\/\/me.verified.weibo.com\/fans\/intro?topnavstyle=1"
            }];
            if (
                is_timeline_likerecommend(element.title) ||
                is_timeline_ad(element) ||
                is_stream_video_ad(element)
            ) {
                statuses.splice(i, 1);
            }
        }
    }
    return statuses;
}

function filter_comments(datas) {
    if (datas && datas.length > 0) {
        let i = datas.length;
        while (i--) {
            const element = datas[i];
            const type = element.type;
            if (type == 5 || type == 1 || type == 6) datas.splice(i, 1);
        }
    }
    return datas;
}

function filter_timeline_cards(cards) {
    if (cards && cards.length > 0) {
        let j = cards.length;
        while (j--) {
            let item = cards[j];
            let card_group = item.card_group;
            if (card_group && card_group.length > 0) {
                if (item.itemid && item.itemid == "hotword") {
                    filter_top_search(card_group);
                } else {
                    let i = card_group.length;
                    while (i--) {
                        let card_group_item = card_group[i];
                        let card_type = card_group_item.card_type;
                        if (card_type) {
                            if (card_type == 9) {
                                if (is_timeline_ad(card_group_item.mblog))
                                    card_group.splice(i, 1);
                            } else if (card_type == 118 || card_type == 182 || card_type == 89 || card_type == 19) {
                                card_group.splice(i, 1);
                            } else if (card_type == 42) {
                                if (
                                    card_group_item.desc ==
                                    "\u53ef\u80fd\u611f\u5174\u8da3\u7684\u4eba"
                                ) {
                                    cards.splice(j, 1);
                                    break;
                                }
                            } else if (card_type == 17) {
                                if (cards[0].card_group) cards[0].card_group[0].col = 1;
                                //if (cards[0].card_group) cards[0].card_group[1] = null;
                                filter_top_search(card_group_item.group);
                            }
                        }
                    }
                }
            } else {
                let card_type = item.card_type;
                if (card_type && card_type == 9) {
                    if (is_timeline_ad(item.mblog)) cards.splice(j, 1);
                }
            }
        }
    }
    return cards;
}

function filter_top_search(group) {
    if (group && group.length > 0) {
        let k = group.length;
        while (k--) {
            let group_item = group[k];
            if (group_item.hasOwnProperty("promotion")) {
                group.splice(k, 1);
            }
        }
    }
}

function is_timeline_ad(mblog) {
    if (!mblog) return false;
    let promotiontype =
        mblog.promotion && mblog.promotion.type && mblog.promotion.type == "ad";
    let mblogtype = mblog.mblogtype && mblog.mblogtype == 1;
    return promotiontype || mblogtype ? true : false;
}

function is_timeline_likerecommend(title) {
    return title && title.type && title.type == "likerecommend" ? true : false;
}

function is_stream_video_ad(item) {
    return item.ad_state && item.ad_state == 1;
}