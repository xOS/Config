var tlist = {
    1: ["大雪", "2023-12-07"],
    2: ["冬至", "2023-12-22"],
    3: ["元旦", "2024-01-01"],
    4: ["小寒", "2024-01-06"],
    5: ["腊八节", "2024-01-18"],
    6: ["大寒", "2024-01-20"],
    7: ["小年", "2024-02-02"],
    8: ["立春", "2024-02-04"],
    9: ["除夕", "2024-02-09"],
    10: ["春节", "2024-02-10"],
    11: ["情人节", "2024-02-14"],
    12: ["雨水", "2024-02-19"],
    13: ["元宵节", "2024-02-24"],
    14: ["惊蛰", "2024-03-05"],
    15: ["妇女节", "2024-03-08"],
    16: ["龙抬头", "2024-03-11"],
    17: ["春分", "2024-03-20"],
    18: ["愚人节", "2024-04-01"],
    19: ["清明节", "2024-04-04"],
    20: ["谷雨", "2024-04-19"],
    21: ["劳动节", "2024-05-01"],
    22: ["立夏", "2024-05-05"],
    23: ["母亲节", "2024-05-12"],
    24: ["小满", "2024-05-20"],
    25: ["儿童节", "2024-06-01"],
    26: ["芒种", "2024-06-05"],
    27: ["端午节", "2024-06-10"],
    28: ["父亲节", "2024-06-16"],
    29: ["夏至", "2024-06-21"],
    30: ["小暑", "2024-07-06"],
    31: ["大暑", "2024-07-22"],
    32: ["立秋", "2024-08-07"],
    33: ["七夕节", "2024-08-10"],
    34: ["中元节", "2024-08-18"],
    35: ["处暑", "2024-08-22"],
    36: ["白露", "2024-09-07"],
    37: ["教师节", "2024-09-10"],
    38: ["中秋节", "2024-09-17"],
    39: ["秋分", "2024-09-22"],
    40: ["国庆节", "2024-10-01"],
    41: ["寒露", "2024-10-08"],
    42: ["重阳节", "2024-10-11"],  
    43: ["霜降", "2024-10-23"],
    44: ["寒衣节", "2024-11-01"],
    45: ["立冬", "2024-11-07"],
    46: ["下元节", "2024-11-15"],
    47: ["小雪", "2024-11-22"],
    48: ["大雪", "2024-12-06"],
    49: ["冬至", "2024-12-21"],
    50: ["元旦", "2025-01-01"],
    51: ["小寒", "2025-01-05"],
    52: ["腊八节", "2025-01-07"],
    53: ["大寒", "2025-01-20"],
    54: ["小年", "2025-01-22"],
    55: ["除夕", "2025-01-28"],
    56: ["春节", "2025-01-29"]
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