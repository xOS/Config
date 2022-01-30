const BASE_URL = 'https://www.netflix.com/title/'
const FILM_ID = 81215567
const AREA_TEST_FILM_ID = 80018499

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

    ;
(async () => {
    let result = {
        title: 'Netflix 检测异常',
        style: 'error',
        content: '检测失败，请刷新',
    }

    await test(FILM_ID)
        .then((code) => {
            if (code === 'Not Found') {
                return test(AREA_TEST_FILM_ID)
            }
            region = area.get(code.toUpperCase());
            result['title'] = 'Netflix 已解锁'
            result['style'] = 'good'
            result['content'] = '完整解锁' + region + '区所有剧'
            return Promise.reject('BreakSignal')
        })
        .then((code) => {
            if (code === 'Not Found') {
                return Promise.reject('Not Available')
            }
            region = area.get(code.toUpperCase());
            result['title'] = 'Netflix 半解锁'
            result['style'] = 'info'
            result['content'] = '仅支持解锁' + region + '区自制剧'
            return Promise.reject('BreakSignal')
        })
        .catch((error) => {
            if (error === 'Not Available') {
                result['title'] = 'Netflix 未解锁'
                result['style'] = 'alert'
                result['content'] = '不支持解锁'
                return
            }
        })
        .finally(() => {
            $done(result)
        })
})()

function test(filmId) {
    return new Promise((resolve, reject) => {
        let option = {
            url: BASE_URL + filmId,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36',
            },
        }
        $httpClient.get(option, function (error, response, data) {
            if (error != null) {
                reject('Error')
                return
            }

            if (response.status === 403) {
                reject('Not Available')
                return
            }

            if (response.status === 404) {
                resolve('Not Found')
                return
            }

            if (response.status === 200) {
                let url = response.headers['x-originating-url']
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