const scriptName = "小红书开屏广告";
let magicJS = MagicJS(scriptName, "INFO");

// prettier-ignore
!function (t, e) { "object" == typeof exports && "undefined" != typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define(e) : (t = "undefined" != typeof globalThis ? globalThis : t || self).dayjs = e() }(this, (function () { "use strict"; var t = 1e3, e = 6e4, n = 36e5, r = "millisecond", i = "second", s = "minute", u = "hour", a = "day", o = "week", f = "month", h = "quarter", c = "year", d = "date", $ = "Invalid Date", l = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/, y = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, M = { name: "en", weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_") }, m = function (t, e, n) { var r = String(t); return !r || r.length >= e ? t : "" + Array(e + 1 - r.length).join(n) + t }, g = { s: m, z: function (t) { var e = -t.utcOffset(), n = Math.abs(e), r = Math.floor(n / 60), i = n % 60; return (e <= 0 ? "+" : "-") + m(r, 2, "0") + ":" + m(i, 2, "0") }, m: function t(e, n) { if (e.date() < n.date()) return -t(n, e); var r = 12 * (n.year() - e.year()) + (n.month() - e.month()), i = e.clone().add(r, f), s = n - i < 0, u = e.clone().add(r + (s ? -1 : 1), f); return +(-(r + (n - i) / (s ? i - u : u - i)) || 0) }, a: function (t) { return t < 0 ? Math.ceil(t) || 0 : Math.floor(t) }, p: function (t) { return { M: f, y: c, w: o, d: a, D: d, h: u, m: s, s: i, ms: r, Q: h }[t] || String(t || "").toLowerCase().replace(/s$/, "") }, u: function (t) { return void 0 === t } }, D = "en", v = {}; v[D] = M; var p = function (t) { return t instanceof _ }, S = function (t, e, n) { var r; if (!t) return D; if ("string" == typeof t) v[t] && (r = t), e && (v[t] = e, r = t); else { var i = t.name; v[i] = t, r = i } return !n && r && (D = r), r || !n && D }, w = function (t, e) { if (p(t)) return t.clone(); var n = "object" == typeof e ? e : {}; return n.date = t, n.args = arguments, new _(n) }, O = g; O.l = S, O.i = p, O.w = function (t, e) { return w(t, { locale: e.$L, utc: e.$u, x: e.$x, $offset: e.$offset }) }; var _ = function () { function M(t) { this.$L = S(t.locale, null, !0), this.parse(t) } var m = M.prototype; return m.parse = function (t) { this.$d = function (t) { var e = t.date, n = t.utc; if (null === e) return new Date(NaN); if (O.u(e)) return new Date; if (e instanceof Date) return new Date(e); if ("string" == typeof e && !/Z$/i.test(e)) { var r = e.match(l); if (r) { var i = r[2] - 1 || 0, s = (r[7] || "0").substring(0, 3); return n ? new Date(Date.UTC(r[1], i, r[3] || 1, r[4] || 0, r[5] || 0, r[6] || 0, s)) : new Date(r[1], i, r[3] || 1, r[4] || 0, r[5] || 0, r[6] || 0, s) } } return new Date(e) }(t), this.$x = t.x || {}, this.init() }, m.init = function () { var t = this.$d; this.$y = t.getFullYear(), this.$M = t.getMonth(), this.$D = t.getDate(), this.$W = t.getDay(), this.$H = t.getHours(), this.$m = t.getMinutes(), this.$s = t.getSeconds(), this.$ms = t.getMilliseconds() }, m.$utils = function () { return O }, m.isValid = function () { return !(this.$d.toString() === $) }, m.isSame = function (t, e) { var n = w(t); return this.startOf(e) <= n && n <= this.endOf(e) }, m.isAfter = function (t, e) { return w(t) < this.startOf(e) }, m.isBefore = function (t, e) { return this.endOf(e) < w(t) }, m.$g = function (t, e, n) { return O.u(t) ? this[e] : this.set(n, t) }, m.unix = function () { return Math.floor(this.valueOf() / 1e3) }, m.valueOf = function () { return this.$d.getTime() }, m.startOf = function (t, e) { var n = this, r = !!O.u(e) || e, h = O.p(t), $ = function (t, e) { var i = O.w(n.$u ? Date.UTC(n.$y, e, t) : new Date(n.$y, e, t), n); return r ? i : i.endOf(a) }, l = function (t, e) { return O.w(n.toDate()[t].apply(n.toDate("s"), (r ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(e)), n) }, y = this.$W, M = this.$M, m = this.$D, g = "set" + (this.$u ? "UTC" : ""); switch (h) { case c: return r ? $(1, 0) : $(31, 11); case f: return r ? $(1, M) : $(0, M + 1); case o: var D = this.$locale().weekStart || 0, v = (y < D ? y + 7 : y) - D; return $(r ? m - v : m + (6 - v), M); case a: case d: return l(g + "Hours", 0); case u: return l(g + "Minutes", 1); case s: return l(g + "Seconds", 2); case i: return l(g + "Milliseconds", 3); default: return this.clone() } }, m.endOf = function (t) { return this.startOf(t, !1) }, m.$set = function (t, e) { var n, o = O.p(t), h = "set" + (this.$u ? "UTC" : ""), $ = (n = {}, n[a] = h + "Date", n[d] = h + "Date", n[f] = h + "Month", n[c] = h + "FullYear", n[u] = h + "Hours", n[s] = h + "Minutes", n[i] = h + "Seconds", n[r] = h + "Milliseconds", n)[o], l = o === a ? this.$D + (e - this.$W) : e; if (o === f || o === c) { var y = this.clone().set(d, 1); y.$d[$](l), y.init(), this.$d = y.set(d, Math.min(this.$D, y.daysInMonth())).$d } else $ && this.$d[$](l); return this.init(), this }, m.set = function (t, e) { return this.clone().$set(t, e) }, m.get = function (t) { return this[O.p(t)]() }, m.add = function (r, h) { var d, $ = this; r = Number(r); var l = O.p(h), y = function (t) { var e = w($); return O.w(e.date(e.date() + Math.round(t * r)), $) }; if (l === f) return this.set(f, this.$M + r); if (l === c) return this.set(c, this.$y + r); if (l === a) return y(1); if (l === o) return y(7); var M = (d = {}, d[s] = e, d[u] = n, d[i] = t, d)[l] || 1, m = this.$d.getTime() + r * M; return O.w(m, this) }, m.subtract = function (t, e) { return this.add(-1 * t, e) }, m.format = function (t) { var e = this, n = this.$locale(); if (!this.isValid()) return n.invalidDate || $; var r = t || "YYYY-MM-DDTHH:mm:ssZ", i = O.z(this), s = this.$H, u = this.$m, a = this.$M, o = n.weekdays, f = n.months, h = function (t, n, i, s) { return t && (t[n] || t(e, r)) || i[n].substr(0, s) }, c = function (t) { return O.s(s % 12 || 12, t, "0") }, d = n.meridiem || function (t, e, n) { var r = t < 12 ? "AM" : "PM"; return n ? r.toLowerCase() : r }, l = { YY: String(this.$y).slice(-2), YYYY: this.$y, M: a + 1, MM: O.s(a + 1, 2, "0"), MMM: h(n.monthsShort, a, f, 3), MMMM: h(f, a), D: this.$D, DD: O.s(this.$D, 2, "0"), d: String(this.$W), dd: h(n.weekdaysMin, this.$W, o, 2), ddd: h(n.weekdaysShort, this.$W, o, 3), dddd: o[this.$W], H: String(s), HH: O.s(s, 2, "0"), h: c(1), hh: c(2), a: d(s, u, !0), A: d(s, u, !1), m: String(u), mm: O.s(u, 2, "0"), s: String(this.$s), ss: O.s(this.$s, 2, "0"), SSS: O.s(this.$ms, 3, "0"), Z: i }; return r.replace(y, (function (t, e) { return e || l[t] || i.replace(":", "") })) }, m.utcOffset = function () { return 15 * -Math.round(this.$d.getTimezoneOffset() / 15) }, m.diff = function (r, d, $) { var l, y = O.p(d), M = w(r), m = (M.utcOffset() - this.utcOffset()) * e, g = this - M, D = O.m(this, M); return D = (l = {}, l[c] = D / 12, l[f] = D, l[h] = D / 3, l[o] = (g - m) / 6048e5, l[a] = (g - m) / 864e5, l[u] = g / n, l[s] = g / e, l[i] = g / t, l)[y] || g, $ ? D : O.a(D) }, m.daysInMonth = function () { return this.endOf(f).$D }, m.$locale = function () { return v[this.$L] }, m.locale = function (t, e) { if (!t) return this.$L; var n = this.clone(), r = S(t, e, !0); return r && (n.$L = r), n }, m.clone = function () { return O.w(this.$d, this) }, m.toDate = function () { return new Date(this.valueOf()) }, m.toJSON = function () { return this.isValid() ? this.toISOString() : null }, m.toISOString = function () { return this.$d.toISOString() }, m.toString = function () { return this.$d.toUTCString() }, M }(), b = _.prototype; return w.prototype = b, [["$ms", r], ["$s", i], ["$m", s], ["$H", u], ["$W", a], ["$M", f], ["$y", c], ["$D", d]].forEach((function (t) { b[t[1]] = function (e) { return this.$g(e, t[0], t[1]) } })), w.extend = function (t, e) { return t.$i || (t(e, _, w), t.$i = !0), w }, w.locale = S, w.isDayjs = p, w.unix = function (t) { return w(1e3 * t) }, w.en = v[D], w.Ls = v, w.p = {}, w }));

const splashReg = new RegExp(/^https?:\/\/edith\.xiaohongshu\.com\/api\/sns\/v2\/system_service\/splash_config/);
const feedReg = new RegExp(/^https:\/\/edith\.xiaohongshu\.com\/api\/sns\/v6\/homefeed\?/);

if (splashReg.test($request.url)) {
    try {
        let body = JSON.parse(magicJS.response.body);
        const nextTime = dayjs().add(20, "year");
        body.data.ads_groups.forEach((i) => {
            i.start_time = nextTime.valueOf().toString();
            i.end_time = nextTime.add(1, "day").valueOf().toString();
            if (i.ads) {
                i.ads.forEach((j) => {
                    j.start_time = nextTime.valueOf().toString();
                    j.end_time = nextTime.add(1, "day").valueOf().toString();
                })
            };
        });
        body = JSON.stringify(body);
        $done({ body });
    } catch (err) {
        magicJS.logError(`小红书开屏去广告出现异常：${err}`);
        $done({});
    }
} else if (feedReg.test($request.url)) {
    try {
        let body = JSON.parse(magicJS.response.body);
        body.data = body.data.filter((d) => !d.ads_info);
        body = JSON.stringify(body);
        $done({ body });
    } catch (error) {
        magicJS.logError(`小红书推荐流出现异常：${error}`);
        $done({});
    }
}

// prettier-ignore
function MagicJS(e = "MagicJS", t = "INFO") { const s = { accept: "Accept", "accept-ch": "Accept-CH", "accept-charset": "Accept-Charset", "accept-features": "Accept-Features", "accept-encoding": "Accept-Encoding", "accept-language": "Accept-Language", "accept-ranges": "Accept-Ranges", "access-control-allow-credentials": "Access-Control-Allow-Credentials", "access-control-allow-origin": "Access-Control-Allow-Origin", "access-control-allow-methods": "Access-Control-Allow-Methods", "access-control-allow-headers": "Access-Control-Allow-Headers", "access-control-max-age": "Access-Control-Max-Age", "access-control-expose-headers": "Access-Control-Expose-Headers", "access-control-request-method": "Access-Control-Request-Method", "access-control-request-headers": "Access-Control-Request-Headers", age: "Age", allow: "Allow", alternates: "Alternates", authorization: "Authorization", "cache-control": "Cache-Control", connection: "Connection", "content-encoding": "Content-Encoding", "content-language": "Content-Language", "content-length": "Content-Length", "content-location": "Content-Location", "content-md5": "Content-MD5", "content-range": "Content-Range", "content-security-policy": "Content-Security-Policy", "content-type": "Content-Type", cookie: "Cookie", dnt: "DNT", date: "Date", etag: "ETag", expect: "Expect", expires: "Expires", from: "From", host: "Host", "if-match": "If-Match", "if-modified-since": "If-Modified-Since", "if-none-match": "If-None-Match", "if-range": "If-Range", "if-unmodified-since": "If-Unmodified-Since", "last-event-id": "Last-Event-ID", "last-modified": "Last-Modified", link: "Link", location: "Location", "max-forwards": "Max-Forwards", negotiate: "Negotiate", origin: "Origin", pragma: "Pragma", "proxy-authenticate": "Proxy-Authenticate", "proxy-authorization": "Proxy-Authorization", range: "Range", referer: "Referer", "retry-after": "Retry-After", "sec-websocket-extensions": "Sec-Websocket-Extensions", "sec-websocket-key": "Sec-Websocket-Key", "sec-websocket-origin": "Sec-Websocket-Origin", "sec-websocket-protocol": "Sec-Websocket-Protocol", "sec-websocket-version": "Sec-Websocket-Version", server: "Server", "set-cookie": "Set-Cookie", "set-cookie2": "Set-Cookie2", "strict-transport-security": "Strict-Transport-Security", tcn: "TCN", te: "TE", trailer: "Trailer", "transfer-encoding": "Transfer-Encoding", upgrade: "Upgrade", "user-agent": "User-Agent", "variant-vary": "Variant-Vary", vary: "Vary", via: "Via", warning: "Warning", "www-authenticate": "WWW-Authenticate", "x-content-duration": "X-Content-Duration", "x-content-security-policy": "X-Content-Security-Policy", "x-dnsprefetch-control": "X-DNSPrefetch-Control", "x-frame-options": "X-Frame-Options", "x-requested-with": "X-Requested-With", "x-surge-skip-scripting": "X-Surge-Skip-Scripting" }; return new class { constructor() { this.version = "2.2.3.3"; this.scriptName = e; this.logLevels = { DEBUG: 5, INFO: 4, NOTIFY: 3, WARNING: 2, ERROR: 1, CRITICAL: 0, NONE: -1 }; this.isLoon = typeof $loon !== "undefined"; this.isQuanX = typeof $task !== "undefined"; this.isJSBox = typeof $drive !== "undefined"; this.isNode = typeof module !== "undefined" && !this.isJSBox; this.isSurge = typeof $httpClient !== "undefined" && !this.isLoon; this.platform = this.getPlatform(); this.node = { request: undefined, fs: undefined, data: {} }; this.iOSUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.5 Mobile/15E148 Safari/604.1"; this.pcUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36 Edg/84.0.522.59"; this.logLevel = t; this._unifiedPushUrl = ""; if (this.isNode) { this.node.fs = require("fs"); this.node.request = require("request"); try { this.node.fs.accessSync("./magic.json", this.node.fs.constants.R_OK | this.node.fs.constants.W_OK) } catch (e) { this.node.fs.writeFileSync("./magic.json", "{}", { encoding: "utf8" }) } this.node.data = require("./magic.json") } else if (this.isJSBox) { if (!$file.exists("drive://MagicJS")) { $file.mkdir("drive://MagicJS") } if (!$file.exists("drive://MagicJS/magic.json")) { $file.write({ data: $data({ string: "{}" }), path: "drive://MagicJS/magic.json" }) } } } set unifiedPushUrl(e) { this._unifiedPushUrl = !!e ? e.replace(/\/+$/g, "") : "" } set logLevel(e) { this._logLevel = typeof e === "string" ? e.toUpperCase() : "DEBUG" } get logLevel() { return this._logLevel } get isRequest() { return typeof $request !== "undefined" && typeof $response === "undefined" } get isResponse() { return typeof $response !== "undefined" } get request() { return typeof $request !== "undefined" ? $request : undefined } get response() { if (typeof $response !== "undefined") { if ($response.hasOwnProperty("status")) $response["statusCode"] = $response["status"]; if ($response.hasOwnProperty("statusCode")) $response["status"] = $response["statusCode"]; return $response } else { return undefined } } getPlatform() { if (this.isSurge) return "Surge"; else if (this.isQuanX) return "QuantumultX"; else if (this.isLoon) return "Loon"; else if (this.isJSBox) return "JSBox"; else if (this.isNode) return "Node.js"; else return "unknown" } read(e, t = "") { let s = ""; if (this.isSurge || this.isLoon) { s = $persistentStore.read(e) } else if (this.isQuanX) { s = $prefs.valueForKey(e) } else if (this.isNode) { s = this.node.data } else if (this.isJSBox) { s = $file.read("drive://MagicJS/magic.json").string } try { if (this.isNode) s = s[e]; if (this.isJSBox) s = JSON.parse(s)[e]; if (!!t) { if (typeof s === "string") s = JSON.parse(s); s = !!s && typeof s === "object" ? s[t] : null } } catch (i) { this.logError(i); s = !!t ? {} : null; this.del(e) } if (typeof s === "undefined") s = null; try { if (!!s && typeof s === "string") s = JSON.parse(s) } catch (e) { } this.logDebug(`READ DATA [${e}]${!!t ? `[${t}]` : ""}(${typeof s})\n${JSON.stringify(s)}`); return s } write(e, t, s = "") { let i = !!s ? {} : ""; if (!!s && (this.isSurge || this.isLoon)) { i = $persistentStore.read(e) } else if (!!s && this.isQuanX) { i = $prefs.valueForKey(e) } else if (this.isNode) { i = this.node.data } else if (this.isJSBox) { i = JSON.parse($file.read("drive://MagicJS/magic.json").string) } if (!!s) { try { if (typeof i === "string") i = JSON.parse(i); i = typeof i === "object" && !!i ? i : {} } catch (t) { this.logError(t); this.del(e); i = {} } if (this.isJSBox || this.isNode) { if (!i.hasOwnProperty(e) || typeof i[e] !== "object" || i[e] === null) { i[e] = {} } if (!i[e].hasOwnProperty(s)) { i[e][s] = null } if (typeof t === "undefined") { delete i[e][s] } else { i[e][s] = t } } else { if (typeof t === "undefined") { delete i[s] } else { i[s] = t } } } else { if (this.isNode || this.isJSBox) { if (typeof t === "undefined") { delete i[e] } else { i[e] = t } } else { if (typeof t === "undefined") { i = null } else { i = t } } } if (typeof i === "object") i = JSON.stringify(i); if (this.isSurge || this.isLoon) { $persistentStore.write(i, e) } else if (this.isQuanX) { $prefs.setValueForKey(i, e) } else if (this.isNode) { this.node.fs.writeFileSync("./magic.json", i) } else if (this.isJSBox) { $file.write({ data: $data({ string: i }), path: "drive://MagicJS/magic.json" }) } this.logDebug(`WRITE DATA [${e}]${!!s ? `[${s}]` : ""}(${typeof t})\n${JSON.stringify(t)}`) } del(e, t = "") { this.logDebug(`DELETE KEY [${e}]${!!t ? `[${t}]` : ""}`); this.write(e, null, t) } notify(e = this.scriptName, t = "", s = "", i = "") { let o = e => { let t = {}; if (this.isSurge || this.isQuanX || this.isLoon) { if (typeof e === "string") { if (this.isLoon) t = { openUrl: e }; else if (this.isQuanX) t = { "open-url": e }; else if (this.isSurge) t = { url: e } } else if (typeof e === "object") { let s = { Surge: { openUrl: "url", "open-url": "url" }, Loon: { url: "openUrl", "open-url": "openUrl", "media-url": "mediaUrl" }, QuantumultX: { url: "open-url", openUrl: "open-url", mediaUrl: "media-url" } }; let i = Object.keys(e); for (let o = 0; o < i.length; o++) { if (!!s[this.platform][i[o]]) { t[s[this.platform][i[o]]] = e[i[o]] } else { t[i[o]] = e[i[o]] } } } } return t }; i = o(i); this.logNotify(`title:${e}\nsubTitle:${t}\nbody:${s}\noptions:${typeof i === "object" ? JSON.stringify(i) : i}`); if (arguments.length == 1) { e = this.scriptName; t = "", s = arguments[0] } if (!!this._unifiedPushUrl) { let i = encodeURI(`${e}/${t}${!!t ? "\n" : ""}${s}`); this.get(`${this._unifiedPushUrl}/${i}`, () => { }) } if (this.isSurge || this.isLoon) { $notification.post(e, t, s, i) } else if (this.isQuanX) { $notify(e, t, s, i) } else if (this.isJSBox) { let i = { title: e, body: !!t ? `${t}\n${s}` : s }; $push.schedule(i) } } log(e, t = "INFO") { if (!(this.logLevels[this._logLevel] < this.logLevels[t.toUpperCase()])) console.log(`[${t}] [${this.scriptName}]\n${e}\n`) } logDebug(e) { this.log(e, "DEBUG") } logInfo(e) { this.log(e, "INFO") } logNotify(e) { this.log(e, "NOTIFY") } logWarning(e) { this.log(e, "WARNING") } logError(e) { this.log(e, "ERROR") } adapterHttpOptions(e, t) { let i = typeof e === "object" ? Object.assign({}, e) : { url: e, headers: {} }; if (i.hasOwnProperty("header") && !i.hasOwnProperty("headers")) { i["headers"] = i["header"]; delete i["header"] } if (typeof i.headers === "object" && !!s) { for (let e in i.headers) { if (s[e]) { i.headers[s[e]] = i.headers[e]; delete i.headers[e] } } } if (!!!i.headers || typeof i.headers !== "object" || !!!i.headers["User-Agent"]) { if (!!!i.headers || typeof i.headers !== "object") i.headers = {}; if (this.isNode) i.headers["User-Agent"] = this.pcUserAgent; else i.headers["User-Agent"] = this.iOSUserAgent } let o = false; if (typeof i["opts"] === "object" && (i["opts"]["hints"] === true || i["opts"]["Skip-Scripting"] === true) || typeof i["headers"] === "object" && i["headers"]["X-Surge-Skip-Scripting"] === true) { o = true } if (!o) { if (this.isSurge) i.headers["X-Surge-Skip-Scripting"] = false; else if (this.isLoon) i.headers["X-Requested-With"] = "XMLHttpRequest"; else if (this.isQuanX) { if (typeof i["opts"] !== "object") i.opts = {}; i.opts["hints"] = false } } if (!this.isSurge || o) delete i.headers["X-Surge-Skip-Scripting"]; if (!this.isQuanX && i.hasOwnProperty("opts")) delete i["opts"]; if (this.isQuanX && i.hasOwnProperty("opts")) delete i["opts"]["Skip-Scripting"]; if (t === "GET" && !this.isNode && !!i.body) { let e = Object.keys(i.body).map(e => { if (typeof i.body === "undefined") return ""; return `${encodeURIComponent(e)}=${encodeURIComponent(i.body[e])}` }).join("&"); if (i.url.indexOf("?") < 0) i.url += "?"; if (i.url.lastIndexOf("&") + 1 != i.url.length && i.url.lastIndexOf("?") + 1 != i.url.length) i.url += "&"; i.url += e; delete i.body } if (this.isQuanX) { if (i.hasOwnProperty("body") && typeof i["body"] !== "string") i["body"] = JSON.stringify(i["body"]); i["method"] = t } else if (this.isNode) { delete i.headers["Accept-Encoding"]; if (typeof i.body === "object") { if (t === "GET") { i.qs = i.body; delete i.body } else if (t === "POST") { i["json"] = true; i.body = i.body } } } else if (this.isJSBox) { i["header"] = i["headers"]; delete i["headers"] } return i } get(e, t) { let s = this.adapterHttpOptions(e, "GET"); this.logDebug(`HTTP GET: ${JSON.stringify(s)}`); if (this.isSurge || this.isLoon) { $httpClient.get(s, t) } else if (this.isQuanX) { $task.fetch(s).then(e => { e["status"] = e.statusCode; t(null, e, e.body) }, e => t(e.error, null, null)) } else if (this.isNode) { return this.node.request.get(s, t) } else if (this.isJSBox) { s["handler"] = (e => { let s = e.error ? JSON.stringify(e.error) : undefined; let i = typeof e.data === "object" ? JSON.stringify(e.data) : e.data; t(s, e.response, i) }); $http.get(s) } } post(e, t) { let s = this.adapterHttpOptions(e, "POST"); this.logDebug(`HTTP POST: ${JSON.stringify(s)}`); if (this.isSurge || this.isLoon) { $httpClient.post(s, t) } else if (this.isQuanX) { $task.fetch(s).then(e => { e["status"] = e.statusCode; t(null, e, e.body) }, e => { t(e.error, null, null) }) } else if (this.isNode) { return this.node.request.post(s, t) } else if (this.isJSBox) { s["handler"] = (e => { let s = e.error ? JSON.stringify(e.error) : undefined; let i = typeof e.data === "object" ? JSON.stringify(e.data) : e.data; t(s, e.response, i) }); $http.post(s) } } done(e = {}) { if (typeof $done !== "undefined") { $done(e) } } isToday(e) { if (e == null) { return false } else { let t = new Date; if (typeof e == "string") { e = new Date(e) } if (t.getFullYear() == e.getFullYear() && t.getMonth() == e.getMonth() && t.getDay() == e.getDay()) { return true } else { return false } } } isNumber(e) { return parseFloat(e).toString() === "NaN" ? false : true } attempt(e, t = null) { return e.then(e => { return [null, e] }).catch(e => { this.logError(e); return [e, t] }) } retry(e, t = 5, s = 0, i = null) { return (...o) => { return new Promise((r, n) => { function a(...o) { Promise.resolve().then(() => e.apply(this, o)).then(e => { if (typeof i === "function") { Promise.resolve().then(() => i(e)).then(() => { r(e) }).catch(e => { this.logError(e); if (t >= 1 && s > 0) { setTimeout(() => a.apply(this, o), s) } else if (t >= 1) { a.apply(this, o) } else { n(e) } t-- }) } else { r(e) } }).catch(e => { this.logError(e); if (t >= 1 && s > 0) { setTimeout(() => a.apply(this, o), s) } else if (t >= 1) { a.apply(this, o) } else { n(e) } t-- }) } a.apply(this, o) }) } } formatTime(e, t = "yyyy-MM-dd hh:mm:ss") { var s = { "M+": e.getMonth() + 1, "d+": e.getDate(), "h+": e.getHours(), "m+": e.getMinutes(), "s+": e.getSeconds(), "q+": Math.floor((e.getMonth() + 3) / 3), S: e.getMilliseconds() }; if (/(y+)/.test(t)) t = t.replace(RegExp.$1, (e.getFullYear() + "").substr(4 - RegExp.$1.length)); for (let e in s) if (new RegExp("(" + e + ")").test(t)) t = t.replace(RegExp.$1, RegExp.$1.length == 1 ? s[e] : ("00" + s[e]).substr(("" + s[e]).length)); return t } now() { return this.formatTime(new Date, "yyyy-MM-dd hh:mm:ss") } today() { return this.formatTime(new Date, "yyyy-MM-dd") } sleep(e) { return new Promise(t => setTimeout(t, e)) } }(e) }