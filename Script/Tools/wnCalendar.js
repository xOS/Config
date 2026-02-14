/*
 * 黄历 + 节日倒计时面板
 * 信息源自 zqzess/openApiData 中国日历数据
 * 自动获取节气与传统节日日期，无需每年手动更新
 */
const proxy = 'https://mirror.ghproxy.com/'
const baseUrl = 'https://raw.githubusercontent.com/zqzess/openApiData/main/calendar/'
const tnow = new Date()
const currentYear = tnow.getFullYear()
const currentMonth = tnow.getMonth() + 1
const currentDay = tnow.getDate()
const tnowf = currentYear + '-' + currentMonth + '-' + currentDay
const MONTHS_AHEAD = 4
let done = false // 防止 $done 被重复调用

function finish(obj) {
    if (!done) { done = true; $done(obj) }
}

// 日期格式处理（兼容不同 locale）
let _date = tnow.toLocaleDateString()
const dateRegex = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/
let dateStr = dateRegex.test(_date) ? _date : _date.replace(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, '$3/$1/$2')
let dateArray = dateStr.split('/')

// ========== 需要跟踪的事件 ==========
const eventMatchers = [
    // 24 节气
    { key: '小寒', name: '小寒' }, { key: '大寒', name: '大寒' },
    { key: '立春', name: '立春' }, { key: '雨水', name: '雨水' },
    { key: '惊蛰', name: '惊蛰' }, { key: '春分', name: '春分' },
    { key: '清明', name: '清明节' }, { key: '谷雨', name: '谷雨' },
    { key: '立夏', name: '立夏' }, { key: '小满', name: '小满' },
    { key: '芒种', name: '芒种' }, { key: '夏至', name: '夏至' },
    { key: '小暑', name: '小暑' }, { key: '大暑', name: '大暑' },
    { key: '立秋', name: '立秋' }, { key: '处暑', name: '处暑' },
    { key: '白露', name: '白露' }, { key: '秋分', name: '秋分' },
    { key: '寒露', name: '寒露' }, { key: '霜降', name: '霜降' },
    { key: '立冬', name: '立冬' }, { key: '小雪', name: '小雪' },
    { key: '大雪', name: '大雪' }, { key: '冬至', name: '冬至' },
    // 公历节日
    { key: '元旦', name: '元旦' }, { key: '情人节', name: '情人节' },
    { key: '妇女节', name: '妇女节' }, { key: '愚人节', name: '愚人节' },
    { key: '劳动节', name: '劳动节' }, { key: '母亲节', name: '母亲节' },
    { key: '儿童节', name: '儿童节' }, { key: '父亲节', name: '父亲节' },
    { key: '教师节', name: '教师节' }, { key: '国庆', name: '国庆节' },
    // 传统农历节日
    { key: '腊八', name: '腊八节' },
    { key: '北小年', name: '小年(北)' }, { key: '南小年', name: '小年(南)' },
    { key: '除夕', name: '除夕' }, { key: '春节', name: '春节' },
    { key: '元宵', name: '元宵节' },
    { key: '龙头', name: '龙抬头' }, { key: '龙抬头', name: '龙抬头' },
    { key: '端午', name: '端午节' }, { key: '七夕', name: '七夕节' },
    { key: '中元', name: '中元节' }, { key: '中秋', name: '中秋节' },
    { key: '重阳', name: '重阳节' }, { key: '寒衣', name: '寒衣节' },
    { key: '下元', name: '下元节' }
]

// ========== 工具函数 ==========
function dateDiff(start, end) {
    let s = start.split('-'), e = end.split('-')
    let sd = new Date(+s[0], +s[1] - 1, +s[2])
    let ed = new Date(+e[0], +e[1] - 1, +e[2])
    return Math.round((ed - sd) / 86400000)
}

function getMonthList() {
    let list = []
    for (let i = 0; i < MONTHS_AHEAD; i++) {
        let m = currentMonth + i, y = currentYear
        while (m > 12) { m -= 12; y++ }
        list.push({ year: y, month: m })
    }
    return list
}

function buildUrl(year, month, useProxy) {
    let ms = month < 10 ? '0' + month : '' + month
    let u = baseUrl + year + '/' + year + ms + '.json'
    return useProxy ? proxy + u : u
}

// 从万年历数据中提取目标事件
function processAlmanac(almanac) {
    let events = [], seen = {}
    almanac.forEach(function (d) {
        let ds = +d.year + '-' + +d.month + '-' + +d.day
        let combined = (d.term || '') + ' ' + (d.desc || '') + ' ' + (d.value || '')
        for (let i = 0; i < eventMatchers.length; i++) {
            let m = eventMatchers[i]
            if (combined.indexOf(m.key) !== -1) {
                let k = ds + '|' + m.name
                if (!seen[k]) { events.push({ name: m.name, date: ds }); seen[k] = 1 }
            }
        }
    })
    return events
}

// 从数据中提取今日黄历信息
function extractToday(results) {
    for (let ri = 0; ri < results.length; ri++) {
        let almanac = results[ri]
        if (!almanac) continue
        for (let j = 0; j < almanac.length; j++) {
            let i = almanac[j]
            if (i.year === dateArray[0] && i.month === dateArray[1] && i.day === dateArray[2]) {
                let lnDate = i.lMonth + '月' + i.lDate
                let nlDate = dateStr + ' ' + i.lMonth + '月' + i.lDate
                let desc = ''
                desc += i.desc ? i.desc : ''
                desc += (i.term || i.value)
                    ? (i.term ? (i.value ? `${i.term} ${i.value}` : i.term) : i.value) : ''
                let notifyContent = '干支：' + i.gzYear + '年 ' + i.gzMonth + '月 ' + i.gzDate + '日'
                    + '\n禁忌：' + i.avoid + '\n适宜：' + i.suit
                return { lnDate, nlDate, desc, notifyContent }
            }
        }
    }
    return null
}

// ========== 图标/颜色 ==========
function icon_now(num) {
    if (num <= 7 && num > 3) return 'hare.fill'
    if (num <= 3 && num > 0) return 'hourglass'
    if (num === 0) return 'gift.fill'
    return 'tortoise.fill'
}

function icon_color(num) {
    if (num <= 7 && num > 3) return '#ff9800'
    if (num <= 3 && num > 0) return '#9978FF'
    if (num === 0) return '#FF0000'
    return '#35C759'
}

// ========== 分组同天事件 ==========
function buildGroups(upcoming) {
    let groups = [], gi = 0
    while (gi < upcoming.length) {
        let names = [upcoming[gi].name]
        for (let j = gi + 1; j < upcoming.length && upcoming[j].days === upcoming[gi].days; j++) {
            names.push(upcoming[j].name)
        }
        groups.push({ label: names.join('|'), days: upcoming[gi].days, count: names.length })
        gi += names.length
    }
    return groups
}

// ========== 面板构建 ==========
function buildPanel(today, upcoming) {
    let nearestDays = 999
    let countdownLine = '暂无倒计时数据'

    if (upcoming && upcoming.length > 0) {
        nearestDays = upcoming[0].days
        let groups = buildGroups(upcoming)

        // 当天有事件时推送节日通知（每天仅一次，6点后）
        if (nearestDays === 0 && $persistentStore.read('timecardpushed') !== upcoming[0].date && tnow.getHours() >= 6) {
            $persistentStore.write(upcoming[0].date, 'timecardpushed')
            $notification.post('节日提醒', '', '今天是' + upcoming[0].date + '【' + groups[0].label + '】，一个值得纪念的日子！')
        }

        // 最近3组倒计时（跳过当天事件）
        let futureGroups = groups.filter(function (g) { return g.days > 0 })
        let displayGroups = futureGroups.slice(0, 3)
        countdownLine = displayGroups.map(function (g) { return g.label + g.days + '天' }).join(' | ')
    }

    // 黄历通知推送（每天仅一次）
    if (today && $persistentStore.read('wnCalendarPushed') !== tnowf) {
        $persistentStore.write(tnowf, 'wnCalendarPushed')
        $notification.post('今日黄历', today.nlDate, today.notifyContent)
    }

    // 构建 title：农历日期 [节日]
    let title = '今日黄历'
    if (today) {
        title = today.desc ? `${today.lnDate} [${today.desc}]` : today.lnDate
    }

    // 构建 content：倒计时(首行) + 干支/禁忌/适宜
    let content = countdownLine
    if (today) {
        content = countdownLine + '\n' + today.notifyContent
    }

    finish({
        title: title,
        content: content,
        icon: icon_now(nearestDays),
        'icon-color': icon_color(nearestDays)
    })
}

// ========== 数据拉取与处理 ==========
function fetchData(useProxy) {
    let months = getMonthList()
    let results = new Array(months.length)
    let count = 0

    months.forEach(function (m, i) {
        $httpClient.get({ url: buildUrl(m.year, m.month, useProxy) }, function (err, resp, body) {
            try { results[i] = JSON.parse(body).data[0].almanac } catch (e) { results[i] = [] }

            if (++count === months.length) {
                let today = extractToday(results)

                let allEvents = []
                results.forEach(function (a) { if (a) allEvents = allEvents.concat(processAlmanac(a)) })

                let seen = {}, unique = []
                allEvents.forEach(function (e) {
                    let k = e.date + '|' + e.name
                    if (!seen[k]) { seen[k] = 1; unique.push(e) }
                })

                let upcoming = []
                unique.forEach(function (e) {
                    let d = dateDiff(tnowf, e.date)
                    if (d >= 0) upcoming.push({ name: e.name, date: e.date, days: d })
                })
                upcoming.sort(function (a, b) { return a.days - b.days })

                if (upcoming.length === 0 && !today && !useProxy) {
                    // 直连全部失败，尝试代理
                    fetchData(true)
                    return
                }

                buildPanel(today, upcoming)
            }
        })
    })
}

// ========== 主流程 ==========
;(function () {
    // 超时保护：8秒内未完成则返回默认
    setTimeout(function () {
        if (done) return
        finish({ title: '今日黄历', content: '数据加载超时，请稍后重试', icon: 'calendar', 'icon-color': '#9978FF' })
    }, 8000)

    // 直接拉取数据（不再先做 IP 检测，省去一次网络请求）
    fetchData(false)
})()
