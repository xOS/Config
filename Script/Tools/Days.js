var tlist = {
    1: ["元旦", "2022-01-01"],
    2: ["小寒", "2022-01-05"],
    3: ["腊八节", "2022-01-10"],
    4: ["大寒", "2022-01-20"],
    5: ["小年", "2022-01-25"],
    6: ["除夕", "2022-01-31"],
    7: ["春节", "2022-02-01"],
    8: ["立春", "2022-02-04"],
    9: ["情人节", "2022-02-14"],
    10: ["元宵节", "2022-02-15"],
    11: ["雨水", "2022-02-19"],
    12: ["龙抬头", "2022-03-04"],
    13: ["惊蛰", "2022-03-05"],
    14: ["妇女节", "2022-03-08"],
    15: ["春分", "2022-03-20"],
    16: ["愚人节", "2022-04-01"],
    17: ["清明节", "2022-04-05"],
    18: ["谷雨", "2022-04-20"],
    19: ["劳动节", "2022-05-01"],
    20: ["青年节", "2022-05-04"],
    21: ["立夏", "2022-05-05"],
    22: ["母亲节", "2022-05-08"],
    23: ["防灾减灾日", "2022-05-12"],
    24: ["小满", "2022-05-21"],
    25: ["儿童节", "2022-06-01"],
    26: ["端午节", "2022-06-03"],
    27: ["芒种", "2022-06-06"],
    28: ["父亲节", "2022-06-19"],
    29: ["夏至", "2022-06-21"],
    30: ["六月六", "2022-07-04"],
    31: ["小暑", "2022-07-07"],
    32: ["大暑", "2022-07-23"],
    33: ["七夕节", "2022-08-04"],
    34: ["立秋", "2022-08-07"],
    35: ["中元节", "2022-08-12"],
    36: ["处暑", "2022-08-23"],
    37: ["抗日战争胜利纪念日", "2022-09-03"],
    38: ["白露", "2022-09-07"],
    39: ["中秋节", "2022-09-10"],
    40: ["秋分", "2022-09-23"],
    41: ["国庆节", "2022-10-01"],
    42: ["重阳节", "2022-10-04"],
    43: ["寒露", "2022-10-08"],
    44: ["霜降", "2022-10-23"],
    45: ["寒衣节", "2022-10-25"],
    46: ["万圣节", "2022-10-31"],
    47: ["立冬", "2022-11-07"],
    48: ["光棍节", "2022-11-11"],
    49: ["小雪", "2022-11-22"],
    50: ["感恩节", "2022-11-24"],
    51: ["大雪", "2022-12-07"],
    52: ["国家公祭日", "2022-12-13"],
    53: ["冬至", "2022-12-22"],
    54: ["平安夜", "2022-12-24"],
    55: ["圣诞节", "2022-12-25"],
    56: ["腊八节", "2022-12-30"],
    57: ["元旦", "2023-01-01"],
    58: ["小寒", "2023-01-05"],
    59: ["小年", "2023-01-14"],
    60: ["大寒", "2023-01-20"],
    61: ["除夕", "2023-01-21"],
    62: ["春节", "2023-01-22"],
    63: ["立春", "2023-02-04"],
    64: ["元宵节", "2023-02-05"],
    65: ["情人节", "2023-02-14"],
    66: ["雨水", "2023-02-19"],
    67: ["龙抬头", "2023-02-21"],
    68: ["惊蛰", "2023-03-06"],
    69: ["妇女节", "2023-03-08"],
    70: ["春分", "2023-03-21"],
    71: ["龙抬头", "2023-03-23"],
    72: ["愚人节", "2023-04-01"],
    73: ["清明节", "2023-04-05"],
    74: ["谷雨", "2023-04-20"]
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