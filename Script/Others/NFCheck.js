/***

For Quantumult-X

[task-local]
# > 奈非解锁检测
event-interaction https://hub.qste.com/Script/Others/NFCheck.js, tag=奈非检测, img-url=text.magnifyingglass.system, enabled=true

**/

const BASE_URL = 'https://www.netflix.com/title/'
const FILM_ID = 81215567
const link = { "media-url": "https://hub.qste.com/QuantumultX/iColor/Netflix.png" }
const policy_name = "奈非影视" //填入你的 netflix 策略组名

var output = ""
var opts = {
    policy: $environment.params
};

var area = new Map([
    ["AF", "阿富汗"],
    ["AI", "安圭拉岛"],
    ["AL", "阿尔巴尼亚"],
    ["AM", "亚美尼亚"],
    ["AR", "阿根廷"],
    ["AU", "澳大利亚"],
    ["BE", "比利时"],
    ["BR", "巴西"],
    ["BS", "巴哈马"],
    ["BT", "不丹"],
    ["BV", "布韦岛"],
    ["BW", "博茨瓦纳"],
    ["BY", "白俄罗斯"],
    ["BZ", "伯利兹"],
    ["CA", "加拿大"],
    ["CF", "中非"],
    ["CH", "瑞士"],
    ["CK", "库克群岛"],
    ["CL", "智利"],
    ["CM", "喀麦隆"],
    ["CN", "中国"],
    ["CO", "哥伦比亚"],
    ["CR", "哥斯达黎加"],
    ["CU", "古巴"],
    ["CV", "佛得角"],
    ["CW", "库拉索"],
    ["CX", "圣诞岛"],
    ["CY", "赛普勒斯"],
    ["CZ", "捷克"],
    ["DE", "德国"],
    ["DJ", "吉布提"],
    ["DK", "丹麦"],
    ["DM", "多米尼克"],
    ["DO", "多米尼加"],
    ["DZ", "阿尔及利亚"],
    ["EG", "埃及"],
    ["EH", "西撒哈拉"],
    ["ER", "厄立特里亚"],
    ["ES", "西班牙"],
    ["EU", "欧盟"],
    ["FI", "芬兰"],
    ["FJ", "斐济"],
    ["FO", "法罗群岛"],
    ["FR", "法国"],
    ["GA", "加彭"],
    ["GB", "英国"],
    ["HK", "香港"],
    ["HU", "匈牙利"],
    ["ID", "印尼"],
    ["IE", "爱尔兰"],
    ["IL", "以色列"],
    ["IM", "马恩岛"],
    ["IN", "印度"],
    ["IS", "冰岛"],
    ["IT", "意大利"],
    ["JP", "日本"],
    ["KR", "韩国"],
    ["LU", "卢森堡"],
    ["MO", "澳门"],
    ["MX", "墨西哥"],
    ["MY", "马来西亚"],
    ["NL", "荷兰"],
    ["PH", "菲律宾"],
    ["RO", "罗马尼亚"],
    ["RS", "塞尔维亚"],
    ["RU", "俄罗斯"],
    ["RW", "卢旺达"],
    ["SB", "所罗门群岛"],
    ["SD", "苏丹"],
    ["SE", "瑞典"],
    ["SG", "新加坡"],
    ["TH", "泰国"],
    ["TO", "汤加"],
    ["TR", "土耳其"],
    ["TV", "图瓦卢"],
    ["TW", "台湾"],
    ["UK", "英国"],
    ["UM", "美国本土外小岛屿"],
    ["US", "美国"],
    ["UY", "乌拉圭"],
    ["UZ", "乌兹别克斯坦"],
    ["VA", "梵蒂冈"],
    ["VE", "委內瑞拉"],
    ["VN", "越南"]
])


!(async () => {
    let result = {
        title: 'Netflix 解锁检测',
        subtitle: output,
        content: '检测失败，请重试',
    }
    await Promise.race([test(FILM_ID), timeOut(5000)])
        .then((code) => {
            console.log(code)

            if (code === 'Not Available') {
                result['content'] = '该节点不支持 Netflix'
                //return 
                //console.log(result)
            } else if (code === 'Not Found') {
                result['content'] = '该节点仅支持解锁 Netflix 自制剧'
                //return
            } else if (code === "timeout") {
                result['content'] = "测试超时"
            } else {
                result['content'] = '该节点完整解锁 Netflix ' + area.get(code.toUpperCase()) + '地区所有剧'
            }

            //$notify(result["title"], output, result["content"], link)

            //console.log(result)
            $done({ "title": "Netflix 解锁检测", "message": result["content"] })
        })
})()
    .finally(() => $done());

function timeOut(delay) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            //reject(new Error('timeout'))
            resolve("timeout")
        }, delay)
    })
}


function test(filmId) {
    return new Promise((resolve, reject) => {
        let option = {
            url: BASE_URL + filmId,
            opts: opts,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.61 Safari/537.36',
            },
        }
        $task.fetch(option).then(response => {
            console.log(response.statusCode)
            if (response.statusCode === 404) {
                resolve('Not Found')
                return
            }

            if (response.statusCode === 403) {
                resolve('Not Available')
                return
            }

            if (response.statusCode === 200) {
                let url = response.headers['X-Originating-URL']
                let region = url.split('/')[3]
                region = region.split('-')[0]
                if (region == 'title') {
                    region = 'us'
                }
                resolve(region)
                return
            }
            reject('Error')
        })
    })
}