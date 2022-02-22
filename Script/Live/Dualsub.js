/*
    Dualsub for Surge by Neurogram
 
        - Disney+, Star+, HBO Max, Netflix bilingual subtitles
        - Disney+, Star+, HBO Max Official subtitles support
        - Disney+, Star+, HBO Max, Netflix Machine translation support (Google, DeepL)
        - YouTube subtitles auto-translate
        - Customized language support
 
    Manual:
        Setting tool for Shortcuts: https://www.icloud.com/shortcuts/7b6ee34a64d9465f8abd8d1608251dca

        Surge:

        [Script]

        // all in one
        Dualsub = type=http-response,pattern=https:\/\/(.+media.(dss|star)ott|manifests.v2.api.hbo|.+hbomaxcdn|.+nflxvideo).(com|net)\/((.+(.vtt|-all-.+.m3u8.*))|hls.m3u8.+|\?o=\d+&v=\d+&e=.+),requires-body=1,max-size=0,timeout=30,script-path=Dualsub.js
        Dualsub-setting = type=http-request,pattern=https:\/\/(setting|www).(media.(dss|star)ott|hbomaxcdn|nflxvideo|youtube).(com|net)\/(\?action=(g|s)et|api\/timedtext.+),requires-body=1,max-size=0,script-path=Dualsub.js

        // individual
        DisneyPlus-Dualsub = type=http-response,pattern=https:\/\/.+media.(dss|star)ott.com\/ps01\/disney\/.+(\.vtt|-all-.+\.m3u8.*),requires-body=1,max-size=0,timeout=30,script-path=Dualsub.js
        DisneyPlus-Dualsub-Setting = type=http-request,pattern=https:\/\/.+media.(dss|star)ott.com\/\?action=(g|s)et,requires-body=1,max-size=0,script-path=Dualsub.js
 
        HBO-Max-Dualsub = type=http-response,pattern=https:\/\/(manifests.v2.api.hbo.com|.+hbomaxcdn.com)\/(hls.m3u8.+|video.+\.vtt$),requires-body=1,max-size=0,timeout=30,script-path=Dualsub.js
        HBO-Max-Dualsub-Setting = type=http-request,pattern=https:\/\/setting.hbomaxcdn.com\/\?action=(g|s)et,requires-body=1,max-size=0,script-path=Dualsub.js

        Netflix-Dualsub = type=http-response,pattern=https:\/\/.+nflxvideo.net\/\?o=\d+&v=\d+&e=.+,requires-body=1,max-size=0,timeout=30,script-path=Dualsub.js
        Netflix-Dualsub-Setting = type=http-request,pattern=https:\/\/.+nflxvideo.net\/\?action=(g|s)et,requires-body=1,max-size=0,script-path=Dualsub.js

        YouTube-Subtrans = type=http-request,pattern=https:\/\/(setting|www).youtube.com\/(api\/timedtext.+|\?action=(g|s)et),requires-body=1,max-size=0,script-path=Dualsub.js

        [MITM]
        hostname = *.media.dssott.com, *.media.starott.com, *.api.hbo.com, *.hbomaxcdn.com, *.nflxvideo.net, *.youtube.com

    Author:
        Telegram: Neurogram
        GitHub: Neurogram-R
*/

let url = $request.url
let headers = $request.headers

let settings = $persistentStore.read()

if (!settings) settings = {
    Disney: {
        type: "Official", // Official, Google, DeepL, Disable
        lang: "English [CC]",
        sl: "auto",
        tl: "English [CC]",
        line: "s", // f, s
        dkey: "null", // DeepL API key
        s_subtitles_url: "null",
        t_subtitles_url: "null",
        subtitles: "null",
        subtitles_type: "null",
        subtitles_sl: "null",
        subtitles_tl: "null",
        subtitles_line: "null",
    },
    HBOMax: {
        type: "Official", // Official, Google, DeepL, Disable
        lang: "English CC",
        sl: "auto",
        tl: "en-US SDH",
        line: "s", // f, s
        dkey: "null", // DeepL API key
        s_subtitles_url: "null",
        t_subtitles_url: "null",
        subtitles: "null",
        subtitles_type: "null",
        subtitles_sl: "null",
        subtitles_tl: "null",
        subtitles_line: "null",
    },
    Netflix: {
        type: "Google", // Google, DeepL, Disable
        lang: "English",
        sl: "auto",
        tl: "zh-CN",
        line: "s", // f, s
        dkey: "null", // DeepL API key
        s_subtitles_url: "null",
        t_subtitles_url: "null",
        subtitles: "null",
        subtitles_type: "null",
        subtitles_sl: "null",
        subtitles_tl: "null",
        subtitles_line: "null",
    },
    YouTube: {
        type: "Enable", // Enable, Disable
        lang: "English",
        sl: "auto",
        tl: "zh-CN",
    }
}

if (typeof (settings) == "string") settings = JSON.parse(settings)

let service = ""
if (url.match(/(dss|star)ott.com/)) service = "Disney"
if (url.match(/hbo(maxcdn)*.com/)) service = "HBOMax"
if (url.match(/nflxvideo.net/)) service = "Netflix"
if (url.match(/youtube.com/)) service = "YouTube"

if (!service) $done({})

let setting = settings[service]

if (url.match(/action=get/)) {
    delete setting.t_subtitles_url
    delete setting.subtitles
    $done({ response: { body: JSON.stringify(setting) } })
}

if (url.match(/action=set/)) {
    let new_setting = JSON.parse($request.body)
    if (new_setting.type) settings[service].type = new_setting.type
    if (new_setting.lang) settings[service].lang = new_setting.lang
    if (new_setting.sl) settings[service].sl = new_setting.sl
    if (new_setting.tl) settings[service].tl = new_setting.tl
    if (new_setting.line) settings[service].line = new_setting.line
    if (new_setting.dkey) settings[service].dkey = new_setting.dkey
    if (new_setting.s_subtitles_url) settings[service].s_subtitles_url = new_setting.s_subtitles_url
    if (new_setting.t_subtitles_url) settings[service].t_subtitles_url = new_setting.t_subtitles_url
    if (new_setting.subtitles) settings[service].subtitles = new_setting.subtitles
    if (new_setting.subtitles_type) settings[service].subtitles_type = new_setting.subtitles_type
    if (new_setting.subtitles_sl) settings[service].subtitles_sl = new_setting.subtitles_sl
    if (new_setting.subtitles_tl) settings[service].subtitles_tl = new_setting.subtitles_tl
    if (new_setting.subtitles_line) settings[service].subtitles_line = new_setting.subtitles_line
    $persistentStore.write(JSON.stringify(settings))
    delete settings[service].t_subtitles_url
    delete settings[service].subtitles
    $done({ response: { body: JSON.stringify(settings[service]) } })
}

if (setting.type == "Disable") $done({})

if (service == "YouTube") {
    let patt = new RegExp(`lang=${setting.tl}`)

    if (url.match(patt)) $done({})

    if (url.match(/&tlang=/)) $done({})

    $done({ url: `${url}&tlang=${setting.tl == "zh-CN" ? "zh-Hans" : setting.tl == "zh-TW" ? "zh-Hant" : setting.tl}` })
}

if (setting.type != "Official" && url.match(/\.m3u8/)) $done({})

let body = $response.body

if (!body) $done({})

let subtitles_urls_data = setting.t_subtitles_url

let host = url.match(/https.+media.(dss|star)ott.com\/ps01\/disney\/[^\/]+\//)
host = host ? host[0] : ""

if (setting.type == "Official" && url.match(/\.m3u8/)) {
    settings[service].t_subtitles_url = "null"
    $persistentStore.write(JSON.stringify(settings))

    let patt = new RegExp(`TYPE=SUBTITLES.+NAME="${setting.tl.replace(/(\[|\]|\(|\))/g, "\\$1")}.+URI="([^"]+)`)

    if (body.match(patt)) {

        let subtitles_data_link = `${host}${body.match(patt)[1]}`

        let options = {
            url: subtitles_data_link,
            headers: headers
        }

        $httpClient.get(options, function (error, response, data) {
            let subtitles_data = data.match(/http.+\.vtt/g)
            if (service == "Disney") subtitles_data = data.match(/.+-MAIN.+\.vtt/g)

            if (subtitles_data) {
                settings[service].t_subtitles_url = subtitles_data.join("\n")
                $persistentStore.write(JSON.stringify(settings))
            }

            if (service == "Disney" && subtitles_data_link.match(/.+-MAIN.+/) && data.match(/,\nseg.+\.vtt/g)) {
                subtitles_data = data.match(/,\nseg.+\.vtt/g)
                let url_path = subtitles_data_link.match(/\/r\/(.+)/)[1].replace(/\w+\.m3u8/, "")
                settings[service].t_subtitles_url = subtitles_data.join("\n").replace(/,\n/g, url_path)
                $persistentStore.write(JSON.stringify(settings))
            }

            $done({})
        })

    }

    if (!body.match(patt)) $done({})
}

if (url.match(/\.vtt/) || service == "Netflix") {
    if (service != "Netflix" && url == setting.s_subtitles_url && setting.subtitles != "null" && setting.subtitles_type == setting.type && setting.subtitles_sl == setting.sl && setting.subtitles_tl == setting.tl && setting.subtitles_line == setting.line) $done({ body: setting.subtitles })

    if (setting.type == "Official") {
        if (subtitles_urls_data == "null") $done({})
        subtitles_urls_data = subtitles_urls_data.match(/.+\.vtt/g)
        if (subtitles_urls_data) official_subtitles(subtitles_urls_data)
    }

    if (setting.type == "Google") machine_subtitles("Google")

    if (setting.type == "DeepL") machine_subtitles("DeepL")
}

async function machine_subtitles(type) {

    body = body.replace(/(\d+:\d\d:\d\d.\d\d\d -->.+line.+\n.+)\n(.+)/g, "$1 $2")
    body = body.replace(/(\d+:\d\d:\d\d.\d\d\d -->.+line.+\n.+)\n(.+)/g, "$1 $2")

    let dialogue = body.match(/\d+:\d\d:\d\d.\d\d\d -->.+line.+\n.+/g)

    if (!dialogue) $done({})

    let timeline = body.match(/\d+:\d\d:\d\d.\d\d\d -->.+line.+/g)

    let s_sentences = []
    for (var i in dialogue) {
        s_sentences.push(`${type == "Google" ? "~" + i + "~" : "&text="}${dialogue[i].replace(/<\/*(c\.[^>]+|i)>/g, "").replace(/\d+:\d\d:\d\d.\d\d\d -->.+line.+\n/, "")}`)
    }
    s_sentences = groupAgain(s_sentences, type == "Google" ? 80 : 50)

    let t_sentences = []
    let trans_result = []

    if (type == "Google") {
        for (var p in s_sentences) {
            let options = {
                url: `https://translate.google.com/translate_a/single?client=it&dt=qca&dt=t&dt=rmt&dt=bd&dt=rms&dt=sos&dt=md&dt=gt&dt=ld&dt=ss&dt=ex&otf=2&dj=1&hl=en&ie=UTF-8&oe=UTF-8&sl=${setting.sl}&tl=${setting.tl}`,
                headers: {
                    "User-Agent": "GoogleTranslate/6.29.59279 (iPhone; iOS 15.4; en; iPhone14,2)"
                },
                body: `q=${encodeURIComponent(s_sentences[p].join("\n"))}`
            }

            let trans = await send_request(options, "post")

            if (trans.sentences) {
                let sentences = trans.sentences
                for (var k in sentences) {
                    if (sentences[k].trans) trans_result.push(sentences[k].trans.replace(/\n$/g, "").replace(/\n/g, " ").replace(/〜|～/g, "~"))
                }
            }
        }

        if (trans_result.length > 0) {
            t_sentences = trans_result.join(" ").match(/~\d+~[^~]+/g)
        }

    }

    if (type == "DeepL") {
        for (var l in s_sentences) {
            let options = {
                url: "https://api-free.deepl.com/v2/translate",
                body: `auth_key=${setting.dkey}${setting.sl == "auto" ? "" : `&source_lang=${setting.sl}`}&target_lang=${setting.tl}${s_sentences[l].join("")}`
            }

            let trans = await send_request(options, "post")

            if (trans.translations) trans_result.push(trans.translations)
        }

        if (trans_result.length > 0) {
            for (var o in trans_result) {
                for (var u in trans_result[o]) {
                    t_sentences.push(trans_result[o][u].text.replace(/\n/g, " "))
                }
            }
        }
    }

    if (t_sentences.length > 0) {
        let g_t_sentences = t_sentences.join("\n").replace(/\s\n/g, "\n")

        for (var j in dialogue) {
            let patt = new RegExp(`(${timeline[j]})`)
            if (setting.line == "s") patt = new RegExp(`(${dialogue[j].replace(/(\[|\]|\(|\)|\?)/g, "\\$1")})`)

            let patt2 = new RegExp(`~${j}~\\s*(.+)`)

            if (g_t_sentences.match(patt2) && type == "Google") body = body.replace(patt, `$1\n${g_t_sentences.match(patt2)[1]}`)

            if (type == "DeepL") body = body.replace(patt, `$1\n${t_sentences[j]}`)

        }

        if (service != "Netflix") {
            settings[service].s_subtitles_url = url
            settings[service].subtitles = body
            settings[service].subtitles_type = setting.type
            settings[service].subtitles_sl = setting.sl
            settings[service].subtitles_tl = setting.tl
            settings[service].subtitles_line = setting.line
            $persistentStore.write(JSON.stringify(settings))
        }
    }

    $done({ body })

}

async function official_subtitles(subtitles_urls_data) {
    let result = []

    let subtitles_index = parseInt(url.match(/(\d+)\.vtt/)[1])

    let start = subtitles_index - 3 < 0 ? 0 : subtitles_index - 3

    subtitles_urls_data = subtitles_urls_data.slice(start, subtitles_index + 4)

    for (var k in subtitles_urls_data) {
        let options = {
            url: `${host ? host + "r/" : ""}${subtitles_urls_data[k]}`,
            headers: headers
        }
        result.push(await send_request(options, "get"))
    }

    body = body.replace(/(\d+:\d\d:\d\d.\d\d\d -->.+line.+\n.+)\n(.+)/g, "$1 $2")
    body = body.replace(/(\d+:\d\d:\d\d.\d\d\d -->.+line.+\n.+)\n(.+)/g, "$1 $2")

    let timeline = body.match(/\d+:\d\d:\d\d.\d\d\d -->.+line.+/g)

    for (var i in timeline) {
        let patt1 = new RegExp(`(${timeline[i]})`)
        if (setting.line == "s") patt1 = new RegExp(`(${timeline[i]}(\\n.+)+)`)

        let time = timeline[i].match(/^\d+:\d\d:\d\d/)[0]

        let patt2 = new RegExp(`${time}.\\d\\d\\d -->.+line.+(\\n.+)+`)

        let dialogue = result.join("\n\n").match(patt2)

        if (dialogue) body = body.replace(
            patt1,
            `$1\n${dialogue[0]
                .replace(/\d+:\d\d:\d\d.\d\d\d -->.+line.+\n/, "")
                .replace(/\n/, " ")}`
        )
    }

    settings[service].s_subtitles_url = url
    settings[service].subtitles = body
    settings[service].subtitles_type = setting.type
    settings[service].subtitles_sl = setting.sl
    settings[service].subtitles_tl = setting.tl
    settings[service].subtitles_line = setting.line
    $persistentStore.write(JSON.stringify(settings))

    $done({ body })
}

function send_request(options, method) {
    return new Promise((resolve, reject) => {

        if (method == "get") {
            $httpClient.get(options, function (error, response, data) {
                if (error) return reject('Error')
                resolve(data)
            })
        }

        if (method == "post") {
            $httpClient.post(options, function (error, response, data) {
                if (error) return reject('Error')
                resolve(JSON.parse(data))
            })
        }
    })
}

function groupAgain(data, num) {
    var result = []
    for (var i = 0; i < data.length; i += num) {
        result.push(data.slice(i, i + num))
    }
    return result
}