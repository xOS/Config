var tlist = {
    // 【2025年】
    1:  ["元旦",       "2025-01-01"],
    2:  ["小寒",       "2025-01-05"],
    3:  ["腊八节",     "2025-01-07"],   // 旧历腊八节（农历腊月初八，提示“1.7”）
    4:  ["大寒",       "2025-01-20"],
    5:  ["小年",       "2025-01-22"],   // 取农历腊月廿三（北方常用）
    6:  ["除夕",       "2025-01-28"],
    7:  ["春节",       "2025-01-29"],   // 农历正月初一
    8:  ["立春",       "2025-02-03"],   // 提示：2.3
    9:  ["元宵节",     "2025-02-12"],   // 农历正月十五
    10: ["情人节",     "2025-02-14"],
    11: ["雨水",       "2025-02-18"],
    12: ["龙抬头",     "2025-03-01"],   // 提示：3.1
    13: ["惊蛰",       "2025-03-05"],   // 提示：3.5
    14: ["妇女节",     "2025-03-08"],
    15: ["春分",       "2025-03-20"],
    16: ["愚人节",     "2025-04-01"],
    17: ["清明节",     "2025-04-04"],
    18: ["谷雨",       "2025-04-20"],
    19: ["劳动节",     "2025-05-01"],
    20: ["立夏",       "2025-05-05"],
    21: ["母亲节",     "2025-05-11"],   // 取五月第二个星期日
    22: ["小满",       "2025-05-21"],
    23: ["端午节",     "2025-05-31"],   // 内地对照：农历五月初五
    24: ["儿童节",     "2025-06-01"],
    25: ["芒种",       "2025-06-05"],
    26: ["父亲节",     "2025-06-15"],   // 提示：6.15
    27: ["夏至",       "2025-06-21"],
    28: ["小暑",       "2025-07-07"],
    29: ["大暑",       "2025-07-22"],
    30: ["立秋",       "2025-08-07"],
    31: ["处暑",       "2025-08-23"],   // 提示：8.23
    32: ["七夕节",     "2025-08-29"],   // 农历七月初七
    33: ["中元节",     "2025-09-06"],   // 农历七月十五，提示：9月6日
    34: ["白露",       "2025-09-07"],
    35: ["教师节",     "2025-09-10"],
    36: ["秋分",       "2025-09-23"],
    37: ["国庆节",     "2025-10-01"],
    38: ["中秋节",     "2025-10-06"],   // 农历八月十五
    39: ["寒露",       "2025-10-08"],
    40: ["霜降",       "2025-10-23"],
    41: ["重阳节",     "2025-10-29"],   // 农历九月九
    42: ["寒衣节",     "2025-11-01"],
    43: ["立冬",       "2025-11-07"],
    44: ["小雪",       "2025-11-22"],
    45: ["下元节",     "2025-12-04"],   // 按提示：2025年下元节定为12月4日
    46: ["大雪",       "2025-12-07"],
    47: ["冬至",       "2025-12-21"],
    // 【2026年延伸部分】（旧历乙巳蛇年尾部，直至春节）
    48: ["元旦",       "2026-01-01"],
    49: ["小寒",       "2026-01-05"],
    50: ["大寒",       "2026-01-20"],
    51: ["腊八节",     "2026-01-26"],   // 2026年腊八节（新一轮旧历尾部节日），取提示换算结果
    52: ["小年(北)",   "2026-02-10"],   // 按北方习俗，农历腊月廿三
    53: ["小年(南)",   "2026-02-11"],
    54: ["情人节",      "2026-02-14"],
    55: ["除夕",       "2026-02-16"],   // 农历腊月最后一天
    56: ["春节",       "2026-02-17"]    // 2026年农历正月初一（丙午马年）
};
let tnow = new Date();
let tnowf = tnow.getFullYear() + "-" + (tnow.getMonth() + 1) + "-" + tnow.getDate();

/* 计算2个日期相差的天数，不包含今天，如：2016-12-13到2016-12-15，相差2天
 * @param startDateString
 * @param endDateString
 * @returns
 */
function dateDiff(startDateString, endDateString) {
    var separator = "-"; //日期分隔符
    var startDates = startDateString.split(separator);
    var endDates = endDateString.split(separator);
    var startDate = new Date(startDates[0], startDates[1] - 1, startDates[2]);
    var endDate = new Date(endDates[0], endDates[1] - 1, endDates[2]);
    return parseInt(
        (endDate - startDate) / 1000 / 60 / 60 / 24
    ).toString();
}

//计算输入序号对应的时间与现在的天数间隔
function tnumcount(num) {
    let dnum = num;
    return dateDiff(tnowf, tlist[dnum][1]);
}

//获取最接近的日期
function now() {
    for (var i = 1; i <= Object.getOwnPropertyNames(tlist).length; i++) {
        if (Number(dateDiff(tnowf, tlist[i.toString()][1])) >= 0) {
            //console.log("最近的日期是:" + tlist[i.toString()][0]);
            //console.log("列表长度:" + Object.getOwnPropertyNames(tlist).length);
            //console.log("时间差距:" + Number(dateDiff(tnowf, tlist[i.toString()][1])));
            return i;
        }
    }
}

//如果是0天，发送通知
let nowlist = now();
function today(day) {
    let daythis = day;
    if (daythis == "0") {
        datenotice();
    }
    return daythis;
}

//提醒日当天发送通知
function datenotice() {
    if ($persistentStore.read("timecardpushed") != tlist[nowlist][1] && tnow.getHours() >= 6) {
        $persistentStore.write(tlist[nowlist][1], "timecardpushed");
        $notification.post("节日提醒", "", "今天是" + tlist[nowlist][1] + "【" + tlist[nowlist][0] + "】" + "，一个值得纪念的日子！")
    } else if ($persistentStore.read("timecardpushed") == tlist[nowlist][1]) {
        //console.log("当日已通知");
        // console.log("今天是" + tlist[nowlist][1] + "日 " + tlist[nowlist][0] + "   🎉");
    }
}

//>图标依次切换乌龟、兔子、闹钟、礼品盒
function icon_now(num) {
    if (num <= 7 && num > 3) {
        return "hare.fill"
    } else if (num <= 3 && num > 0) {
        return "hourglass"
    } else if (num == 0) {
        return "gift.fill"
    } else {
        return "tortoise.fill"
    }
}

//>图标颜色
function icon_color(num) {
    if (num <= 7 && num > 3) {
        return '#ff9800'
    } else if (num <= 3 && num > 0) {
        return '#9978FF'
    } else if (num == 0) {
        return '#FF0000'
    } else {
        return '#35C759'
    }
}

$done({
    title: title_random(tnumcount(Number(nowlist))),
    icon: icon_now(tnumcount(Number(nowlist))),
    "icon-color": icon_color(tnumcount(Number(nowlist))),
    content: today(tnumcount(nowlist)) == 0 ? tlist[Number(nowlist) + Number(1)][0] + tnumcount(Number(nowlist) + Number(1)) + "天" + " | " + tlist[Number(nowlist) + Number(2)][0] + tnumcount(Number(nowlist) + Number(2)) + "天" + " | " + tlist[Number(nowlist) + Number(3)][0] + tnumcount(Number(nowlist) + Number(3)) + "天" : tlist[nowlist][0] + today(tnumcount(nowlist)) + "天" + " | " + tlist[Number(nowlist) + Number(1)][0] + tnumcount(Number(nowlist) + Number(1)) + "天" + " | " + tlist[Number(nowlist) + Number(2)][0] + tnumcount(Number(nowlist) + Number(2)) + "天"
})

function title_random(num) {
    let r = Math.floor((Math.random() * 12) + 1);
    let dic = {
        1: "距离放假，还要摸鱼多少天？🥱",
        2: "坚持住，就快放假啦！💪",
        3: "上班好累呀，好想放假😮‍💨",
        4: "努力，我还能加班24小时！🧐",
        5: "天呐，还要多久才放假呀？😭",
        6: "躺平中，等放假(☝ ՞ਊ ՞)☝",
        7: "只有摸鱼才是赚老板的钱🙎🤳",
        8: "一起摸鱼吧✌(՞ټ՞ )✌",
        9: "摸鱼中，期待下一个假日.ʕʘ‿ʘʔ.",
        10: "小乌龟慢慢爬🐢",
        11: "太难了！😫😩😖(´◉‿◉)",
        12: "反正放假也不能去玩😤"
    };
    return num == 0 ? "今天是" + tlist[nowlist][0] + "，休息一下吧 ~" : dic[r]
}