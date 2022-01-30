// https://github.com/101arrowz/fflate
const e = Uint8Array,
    t = Uint16Array,
    r = Uint32Array,
    n = new e([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0, 0]),
    s = new e([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 0, 0]),
    i = new e([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]),
    o = (e, n) => {
        const s = new t(31); for (let t = 0; t < 31; ++t) s[t] = n += 1 << e[t - 1]; const i = new r(s[30]); for (let e = 1; e < 30; ++e)
            for (let t = s[e]; t < s[e + 1]; ++t) i[t] = t - s[e] << 5 | e; return [s, i]
    },
    [a, l] = o(n, 2);
a[28] = 258, l[258] = 28;
const [f, u] = o(s, 0), c = new t(32768);
for (let e = 0; e < 32768; ++e) {
    let t = (43690 & e) >>> 1 | (21845 & e) << 1;
    t = (52428 & t) >>> 2 | (13107 & t) << 2, t = (61680 & t) >>> 4 | (3855 & t) << 4, c[e] = ((65280 & t) >>> 8 | (255 & t) << 8) >>> 1
}
const h = (e, r, n) => {
    const s = e.length; let i = 0; const o = new t(r); for (; i < s; ++i) e[i] && ++o[e[i] - 1]; const a = new t(r); for (i = 0; i < r; ++i) a[i] = a[i - 1] + o[i - 1] << 1; let l; if (n) {
        l = new t(1 << r); const n = 15 - r; for (i = 0; i < s; ++i)
            if (e[i]) {
                const t = i << 4 | e[i],
                s = r - e[i]; let o = a[e[i] - 1]++ << s; for (const e = o | (1 << s) - 1; o <= e; ++o) l[c[o] >>> n] = t
            }
    } else
        for (l = new t(s), i = 0; i < s; ++i) e[i] && (l[i] = c[a[e[i] - 1]++] >>> 15 - e[i]); return l
},
    m = new e(288);
for (let e = 0; e < 144; ++e) m[e] = 8;
for (let e = 144; e < 256; ++e) m[e] = 9;
for (let e = 256; e < 280; ++e) m[e] = 7;
for (let e = 280; e < 288; ++e) m[e] = 8;
const d = new e(32);
for (let e = 0; e < 32; ++e) d[e] = 5;
const p = h(m, 9, 0),
    g = h(m, 9, 1),
    b = h(d, 5, 0),
    w = h(d, 5, 1),
    y = e => { let t = e[0]; for (let r = 1; r < e.length; ++r) e[r] > t && (t = e[r]); return t },
    I = (e, t, r) => { const n = t / 8 | 0; return (e[n] | e[n + 1] << 8) >> (7 & t) & r },
    N = (e, t) => { const r = t / 8 | 0; return (e[r] | e[r + 1] << 8 | e[r + 2] << 16) >> (7 & t) },
    k = e => (e + 7) / 8 | 0,
    T = (n, s, i) => {
        (null == s || s < 0) && (s = 0), (null == i || i > n.length) && (i = n.length); const o = new (2 == n.BYTES_PER_ELEMENT ? t : 4 == n.BYTES_PER_ELEMENT ? r : e)(i - s); return o.set(n.subarray(s, i)), o
    },
    E = ["unexpected EOF", "invalid block type", "invalid length/literal", "invalid distance", "stream finished", "no stream handler", , "no callback", "invalid UTF-8 data", "extra field too long", "date not in range 1980-2099", "filename too long", "stream finishing", "invalid zip data"],
    v = (e, t, r) => { const n = new Error(t || E[e]); if (n.code = e, Error.captureStackTrace && Error.captureStackTrace(n, v), !r) throw n; return n },
    O = (e, t, r) => {
        r <<= 7 & t; const n = t / 8 | 0;
        e[n] |= r, e[n + 1] |= r >>> 8
    },
    B = (e, t, r) => {
        r <<= 7 & t; const n = t / 8 | 0;
        e[n] |= r, e[n + 1] |= r >>> 8, e[n + 2] |= r >>> 16
    },
    S = (r, n) => {
        const s = []; for (let e = 0; e < r.length; ++e) r[e] && s.push({ s: e, f: r[e] }); const i = s.length,
            o = s.slice(); if (!i) return [R, 0]; if (1 == i) { const t = new e(s[0].s + 1); return t[s[0].s] = 1, [t, 1] }
        s.sort(((e, t) => e.f - t.f)), s.push({ s: -1, f: 25001 }); let a = s[0],
            l = s[1],
            f = 0,
            u = 1,
            c = 2; for (s[0] = { s: -1, f: a.f + l.f, l: a, r: l }; u != i - 1;) a = s[s[f].f < s[c].f ? f++ : c++], l = s[f != u && s[f].f < s[c].f ? f++ : c++], s[u++] = { s: -1, f: a.f + l.f, l: a, r: l }; let h = o[0].s; for (let e = 1; e < i; ++e) o[e].s > h && (h = o[e].s); const m = new t(h + 1); let d = U(s[u - 1], m, 0); if (d > n) {
                let e = 0,
                t = 0; const r = d - n,
                    s = 1 << r; for (o.sort(((e, t) => m[t.s] - m[e.s] || e.f - t.f)); e < i; ++e) {
                        const r = o[e].s; if (!(m[r] > n)) break;
                        t += s - (1 << d - m[r]), m[r] = n
                    } for (t >>>= r; t > 0;) {
                        const r = o[e].s;
                        m[r] < n ? t -= 1 << n - m[r]++ - 1 : ++e
                    } for (; e >= 0 && t; --e) {
                        const r = o[e].s;
                        m[r] == n && (--m[r], ++t)
                    }
                d = n
            } return [new e(m), d]
    },
    U = (e, t, r) => -1 == e.s ? Math.max(U(e.l, t, r + 1), U(e.r, t, r + 1)) : t[e.s] = r,
    A = e => {
        let r = e.length; for (; r && !e[--r];); const n = new t(++r); let s = 0,
            i = e[0],
            o = 1; const a = e => { n[s++] = e }; for (let t = 1; t <= r; ++t)
            if (e[t] == i && t != r) ++o;
            else {
                if (!i && o > 2) {
                    for (; o > 138; o -= 138) a(32754);
                    o > 2 && (a(o > 10 ? o - 11 << 5 | 28690 : o - 3 << 5 | 12305), o = 0)
                } else if (o > 3) {
                    for (a(i), --o; o > 6; o -= 6) a(8304);
                    o > 2 && (a(o - 3 << 5 | 8208), o = 0)
                } for (; o--;) a(i);
                o = 1, i = e[t]
            }
        return [n.subarray(0, s), r]
    },
    D = (e, t) => { let r = 0; for (let n = 0; n < t.length; ++n) r += e[n] * t[n]; return r },
    F = (e, t, r) => {
        const n = r.length,
        s = k(t + 2);
        e[s] = 255 & n, e[s + 1] = n >>> 8, e[s + 2] = 255 ^ e[s], e[s + 3] = 255 ^ e[s + 1]; for (let t = 0; t < n; ++t) e[s + t + 4] = r[t]; return 8 * (s + 4 + n)
    },
    V = (e, r, o, a, l, f, u, c, g, w, y) => {
        O(r, y++, o), ++l[256]; const [I, N] = S(l, 15), [k, T] = S(f, 15), [E, v] = A(I), [U, V] = A(k), L = new t(19); for (let e = 0; e < E.length; ++e) L[31 & E[e]]++; for (let e = 0; e < U.length; ++e) L[31 & U[e]]++; const [R, j] = S(L, 7); let x = 19; for (; x > 4 && !R[i[x - 1]]; --x); const M = w + 5 << 3,
            X = D(l, m) + D(f, d) + u,
            C = D(l, I) + D(f, k) + u + 14 + 3 * x + D(L, R) + (2 * L[16] + 3 * L[17] + 7 * L[18]); if (M <= X && M <= C) return F(r, y, e.subarray(g, g + w)); let K, $, G, J; if (O(r, y, 1 + (C < X)), y += 2, C < X) {
                K = h(I, N, 0), $ = I, G = h(k, T, 0), J = k; const e = h(R, j, 0);
                O(r, y, v - 257), O(r, y + 5, V - 1), O(r, y + 10, x - 4), y += 14; for (let e = 0; e < x; ++e) O(r, y + 3 * e, R[i[e]]);
                y += 3 * x; const t = [E, U]; for (let n = 0; n < 2; ++n) {
                    const s = t[n]; for (let t = 0; t < s.length; ++t) {
                        const n = 31 & s[t];
                        O(r, y, e[n]), y += R[n], n > 15 && (O(r, y, s[t] >>> 5 & 127), y += s[t] >>> 12)
                    }
                }
            } else K = p, $ = m, G = b, J = d; for (let e = 0; e < c; ++e)
            if (a[e] > 255) {
                const t = a[e] >>> 18 & 31;
                B(r, y, K[t + 257]), y += $[t + 257], t > 7 && (O(r, y, a[e] >>> 23 & 31), y += n[t]); const i = 31 & a[e];
                B(r, y, G[i]), y += J[i], i > 3 && (B(r, y, a[e] >>> 5 & 8191), y += s[i])
            } else B(r, y, K[a[e]]), y += $[a[e]];
        return B(r, y, K[256]), y + $[256]
    },
    L = new r([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]),
    R = new e(0),
    j = new Int32Array(4096);
for (let e = 0; e < 256; ++e) {
    let t = e,
    r = 9; for (; --r;) t = (1 & t && -306674912) ^ t >>> 1;
    j[e] = t
}
for (let e = 0; e < 256; ++e) { let t = j[e]; for (let r = 256; r < 4096; r += 256) t = j[e | r] = t >>> 8 ^ j[255 & t] }
const x = [];
for (let e = 0; e < 16;) x[e] = j.subarray(e << 8, ++e << 8);
const [M, X, C, K, $, G, J, Z, P, Y, W, _, q, z, H, Q] = x, ee = (i, o, a, f, c) => ((i, o, a, f, c, h) => {
    const m = i.length,
    d = new e(f + m + 5 * (1 + Math.ceil(m / 7e3)) + c),
    p = d.subarray(f, d.length - c); let g = 0; if (!o || m < 8)
        for (let e = 0; e <= m; e += 65535) {
            const t = e + 65535;
            t >= m && (p[g >> 3] = h), g = F(p, g + 1, i.subarray(e, t))
        } else {
            const e = L[o - 1],
            f = e >>> 13,
            c = 8191 & e,
            d = (1 << a) - 1,
            b = new t(32768),
            w = new t(d + 1),
            y = Math.ceil(a / 3),
            I = 2 * y,
            N = e => (i[e] ^ i[e + 1] << y ^ i[e + 2] << I) & d,
            k = new r(25e3),
            T = new t(288),
            E = new t(32); let v = 0,
                O = 0,
                B = 0,
                S = 0,
                U = 0,
                A = 0; for (; B < m; ++B) {
                    const e = N(B); let t = 32767 & B,
                        r = w[e]; if (b[t] = r, w[e] = t, U <= B) {
                            const o = m - B; if ((v > 7e3 || S > 24576) && o > 423) { g = V(i, p, 0, k, T, E, O, S, A, B - A, g), S = v = O = 0, A = B; for (let e = 0; e < 286; ++e) T[e] = 0; for (let e = 0; e < 30; ++e) E[e] = 0 } let a = 2,
                                h = 0,
                                d = c,
                                w = t - r & 32767; if (o > 2 && e == N(B - w)) {
                                    const e = Math.min(f, o) - 1,
                                    n = Math.min(32767, B),
                                    s = Math.min(258, o); for (; w <= n && --d && t != r;) {
                                        if (i[B + a] == i[B + a - w]) {
                                            let t = 0; for (; t < s && i[B + t] == i[B + t - w]; ++t); if (t > a) {
                                                if (a = t, h = w, t > e) break; const n = Math.min(w, t - 2); let s = 0; for (let e = 0; e < n; ++e) {
                                                    const t = B - w + e + 32768 & 32767,
                                                    n = t - b[t] + 32768 & 32767;
                                                    n > s && (s = n, r = t)
                                                }
                                            }
                                        }
                                        t = r, r = b[t], w += t - r + 32768 & 32767
                                    }
                                } if (h) {
                                    k[S++] = 268435456 | l[a] << 18 | u[h]; const e = 31 & l[a],
                                        t = 31 & u[h];
                                    O += n[e] + s[t], ++T[257 + e], ++E[t], U = B + a, ++v
                                } else k[S++] = i[B], ++T[i[B]]
                        }
                }
        g = V(i, p, h, k, T, E, O, S, A, B - A, g), !h && 7 & g && (g = F(p, g + 1, R))
    }
    return T(d, 0, f + k(g) + c)
})(i, null == o.level ? 6 : o.level, null == o.mem ? Math.ceil(1.5 * Math.max(8, Math.min(13, Math.log(i.length)))) : 12 + o.mem, a, f, !c), te = (e, t, r) => { for (; r; ++t) e[t] = r, r >>>= 8 };

function re(e, t) {
    t || (t = {}); const r = ((e, t) => { t = ~t; let r = 0; const n = e.length - 16; for (; r < n;) t = Q[e[r++] ^ 255 & t] ^ H[e[r++] ^ t >> 8 & 255] ^ z[e[r++] ^ t >> 16 & 255] ^ q[e[r++] ^ t >>> 24] ^ _[e[r++]] ^ W[e[r++]] ^ Y[e[r++]] ^ P[e[r++]] ^ Z[e[r++]] ^ J[e[r++]] ^ G[e[r++]] ^ $[e[r++]] ^ K[e[r++]] ^ C[e[r++]] ^ X[e[r++]] ^ M[e[r++]]; for (; r < e.length; ++r) t = M[255 & t ^ e[r]] ^ t >>> 8; return ~t })(e, 0),
        n = e.length,
        s = ee(e, t, 10 + ((o = t).filename && o.filename.length + 1 || 0), 8),
        i = s.length; var o; return ((e, t) => { const r = t.filename; if (e[0] = 31, e[1] = 139, e[2] = 8, e[8] = t.level < 2 ? 4 : 9 == t.level ? 2 : 0, e[9] = 3, 0 != t.mtime && te(e, 4, Math.floor(new Date(t.mtime || Date.now()) / 1e3)), r) { e[3] = 8; for (let t = 0; t <= r.length; ++t) e[t + 10] = r.charCodeAt(t) } })(s, t), te(s, i - 8, r), te(s, i - 4, n), s
}

function ne(t, r) {
    return ((t, r, o) => {
        const l = t.length; if (!l || o && o.f && !o.l) return r || new e(0); const u = !r || o,
            c = !o || o.i;
        o || (o = {}), r || (r = new e(3 * l)); const m = t => {
            let n = r.length; if (t > n) {
                const s = new e(Math.max(2 * n, t));
                s.set(r), r = s
            }
        }; let d = o.f || 0,
            p = o.p || 0,
            b = o.b || 0,
            E = o.l,
            O = o.d,
            B = o.m,
            S = o.n; const U = 8 * l;
        do {
            if (!E) {
                d = I(t, p, 1); const n = I(t, p + 1, 3); if (p += 3, !n) {
                    const e = k(p) + 4,
                    n = t[e - 4] | t[e - 3] << 8,
                    s = e + n; if (s > l) { c && v(0); break }
                    u && m(b + n), r.set(t.subarray(e, s), b), o.b = b += n, o.p = p = 8 * s, o.f = d; continue
                } if (1 == n) E = g, O = w, B = 9, S = 5;
                else if (2 == n) {
                    const r = I(t, p, 31) + 257,
                    n = I(t, p + 10, 15) + 4,
                    s = r + I(t, p + 5, 31) + 1;
                    p += 14; const o = new e(s),
                        a = new e(19); for (let e = 0; e < n; ++e) a[i[e]] = I(t, p + 3 * e, 7);
                    p += 3 * n; const l = y(a),
                        f = (1 << l) - 1,
                        u = h(a, l, 1); for (let e = 0; e < s;) {
                            const r = u[I(t, p, f)];
                            p += 15 & r; const n = r >>> 4; if (n < 16) o[e++] = n;
                            else {
                                let r = 0,
                                s = 0; for (16 == n ? (s = 3 + I(t, p, 3), p += 2, r = o[e - 1]) : 17 == n ? (s = 3 + I(t, p, 7), p += 3) : 18 == n && (s = 11 + I(t, p, 127), p += 7); s--;) o[e++] = r
                            }
                        } const c = o.subarray(0, r),
                            m = o.subarray(r);
                    B = y(c), S = y(m), E = h(c, B, 1), O = h(m, S, 1)
                } else v(1); if (p > U) { c && v(0); break }
            }
            u && m(b + 131072); const T = (1 << B) - 1,
                A = (1 << S) - 1; let D = p; for (; ; D = p) {
                    const e = E[N(t, p) & T],
                    i = e >>> 4; if (p += 15 & e, p > U) { c && v(0); break } if (e || v(2), i < 256) r[b++] = i;
                    else {
                        if (256 == i) { D = p, E = null; break } {
                            let e = i - 254; if (i > 264) {
                                const r = i - 257,
                                s = n[r];
                                e = I(t, p, (1 << s) - 1) + a[r], p += s
                            } const o = O[N(t, p) & A],
                                l = o >>> 4;
                            o || v(3), p += 15 & o; let h = f[l]; if (l > 3) {
                                const e = s[l];
                                h += N(t, p) & (1 << e) - 1, p += e
                            } if (p > U) { c && v(0); break }
                            u && m(b + 131072); const d = b + e; for (; b < d; b += 4) r[b] = r[b - h], r[b + 1] = r[b + 1 - h], r[b + 2] = r[b + 2 - h], r[b + 3] = r[b + 3 - h];
                            b = d
                        }
                    }
                }
            o.l = E, o.p = D, o.b = b, o.f = d, E && (d = 1, o.m = B, o.d = O, o.n = S)
        } while (!d); return b == r.length ? r : T(r, 0, b)
    })(t.subarray((e => {
        31 == e[0] && 139 == e[1] && 8 == e[2] || v(6, "invalid gzip data"); const t = e[3]; let r = 10;
        4 & t && (r += e[10] | 2 + (e[11] << 8)); for (let n = (t >> 3 & 1) + (t >> 4 & 1); n > 0; n -= !e[r++]); return r + (2 & t)
    })(t), -8), r || new e((e => { const t = e.length; return (e[t - 4] | e[t - 3] << 8 | e[t - 2] << 16 | e[t - 1] << 24) >>> 0 })(t)))
}
const gunzipSync = ne,
    gzipSync = re;
// https://github.com/avaer/text-encoder/blob/master/index.js
var se = ["utf8", "utf-8", "unicode-1-1-utf-8"];

function ie(e) {
    if (se.indexOf(e) < 0 && void 0 !== e && null != e) throw new RangeError("Invalid encoding type. Only utf-8 is supported");
    this.encoding = "utf-8", this.encode = function (e) {
        if ("string" != typeof e) throw new TypeError("passed argument must be of tye string"); var t = unescape(encodeURIComponent(e)),
            r = new Uint8Array(t.length); const n = t.split(""); for (let e = 0; e < n.length; e++) r[e] = n[e].charCodeAt(0); return r
    }
}

function oe(e) {
    if (se.indexOf(e) < 0 && void 0 !== e && null != e) throw new RangeError("Invalid encoding type. Only utf-8 is supported");
    this.encoding = "utf-8", this.decode = function (e, t) {
        if (void 0 === e) return ""; var r = void 0 !== t && r in t && t.stream; if ("boolean" != typeof r) throw new TypeError("stream option must be boolean"); if (ArrayBuffer.isView(e)) {
            var n = new Uint8Array(e.buffer, e.byteOffset, e.byteLength),
            s = new Array(n.length); for (let e = 0; e < n.length; e++) s[e] = String.fromCharCode(n[e]); return decodeURIComponent(escape(s.join("")))
        } throw new TypeError("passed argument must be an array buffer view")
    }
}
// const TextEncoder = ie,TextDecoder = oe;
// https://github.com/timostamm/protobuf-ts/tree/master/packages/runtime
var ae = Object.defineProperty,
    le = Object.defineProperties,
    fe = Object.getOwnPropertyDescriptors,
    ue = Object.getOwnPropertySymbols,
    ce = Object.prototype.hasOwnProperty,
    he = Object.prototype.propertyIsEnumerable,
    me = (e, t, r) => t in e ? ae(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r,
    de = (e, t) => {
        for (var r in t || (t = {})) ce.call(t, r) && me(e, r, t[r]); if (ue)
            for (var r of ue(t)) he.call(t, r) && me(e, r, t[r]); return e
    };

function pe(e) { let t = typeof e; if ("object" == t) { if (Array.isArray(e)) return "array"; if (null === e) return "null" } return t }

function ge(e) { return null !== e && "object" == typeof e && !Array.isArray(e) }
let be = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split(""),
    we = [];
for (let e = 0; e < be.length; e++) we[be[e].charCodeAt(0)] = e;

function ye() {
    let e = 0,
    t = 0; for (let r = 0; r < 28; r += 7) { let n = this.buf[this.pos++]; if (e |= (127 & n) << r, 0 == (128 & n)) return this.assertBounds(), [e, t] } let r = this.buf[this.pos++]; if (e |= (15 & r) << 28, t = (112 & r) >> 4, 0 == (128 & r)) return this.assertBounds(), [e, t]; for (let r = 3; r <= 31; r += 7) { let n = this.buf[this.pos++]; if (t |= (127 & n) << r, 0 == (128 & n)) return this.assertBounds(), [e, t] } throw new Error("invalid varint")
}

function Ie(e, t, r) {
    for (let n = 0; n < 28; n += 7) {
        const s = e >>> n,
        i = !(s >>> 7 == 0 && 0 == t),
        o = 255 & (i ? 128 | s : s); if (r.push(o), !i) return
    } const n = e >>> 28 & 15 | (7 & t) << 4,
        s = !(t >> 3 == 0); if (r.push(255 & (s ? 128 | n : n)), s) {
            for (let e = 3; e < 31; e += 7) {
                const n = t >>> e,
                s = !(n >>> 7 == 0),
                i = 255 & (s ? 128 | n : n); if (r.push(i), !s) return
            }
            r.push(t >>> 31 & 1)
        }
}
we["-".charCodeAt(0)] = be.indexOf("+"), we["_".charCodeAt(0)] = be.indexOf("/");

function Ne(e) {
    let t = "-" == e[0];
    t && (e = e.slice(1)); const r = 1e6; let n = 0,
        s = 0;

    function i(t, i) {
        const o = Number(e.slice(t, i));
        s *= r, n = n * r + o, n >= 4294967296 && (s += n / 4294967296 | 0, n %= 4294967296)
    } return i(-24, -18), i(-18, -12), i(-12, -6), i(-6), [t, n, s]
}

function ke(e, t) {
    if (t <= 2097151) return "" + (4294967296 * t + e); let r = (e >>> 24 | t << 8) >>> 0 & 16777215,
        n = t >> 16 & 65535,
        s = (16777215 & e) + 6777216 * r + 6710656 * n,
        i = r + 8147497 * n,
        o = 2 * n,
        a = 1e7;

    function l(e, t) { let r = e ? String(e) : ""; return t ? "0000000".slice(r.length) + r : r } return s >= a && (i += Math.floor(s / a), s %= a), i >= a && (o += Math.floor(i / a), i %= a), l(o, 0) + l(i, o) + l(s, 1)
}

function Te(e, t) {
    if (e >= 0) {
        for (; e > 127;) t.push(127 & e | 128), e >>>= 7;
        t.push(e)
    } else {
        for (let r = 0; r < 9; r++) t.push(127 & e | 128), e >>= 7;
        t.push(1)
    }
}

function Ee() {
    let e = this.buf[this.pos++],
    t = 127 & e; if (0 == (128 & e)) return this.assertBounds(), t; if (e = this.buf[this.pos++], t |= (127 & e) << 7, 0 == (128 & e)) return this.assertBounds(), t; if (e = this.buf[this.pos++], t |= (127 & e) << 14, 0 == (128 & e)) return this.assertBounds(), t; if (e = this.buf[this.pos++], t |= (127 & e) << 21, 0 == (128 & e)) return this.assertBounds(), t;
    e = this.buf[this.pos++], t |= (15 & e) << 28; for (let t = 5; 0 != (128 & e) && t < 10; t++) e = this.buf[this.pos++]; if (0 != (128 & e)) throw new Error("invalid varint"); return this.assertBounds(), t >>> 0
}
const ve = function () { const e = new DataView(new ArrayBuffer(8)); return void 0 !== globalThis.BigInt && "function" == typeof e.getBigInt64 && "function" == typeof e.getBigUint64 && "function" == typeof e.setBigInt64 && "function" == typeof e.setBigUint64 ? { MIN: BigInt("-9223372036854775808"), MAX: BigInt("9223372036854775807"), UMIN: BigInt("0"), UMAX: BigInt("18446744073709551615"), C: BigInt, V: e } : void 0 }();

function Oe(e) { if (!e) throw new Error("BigInt unavailable, see https://github.com/timostamm/protobuf-ts/blob/v1.0.8/MANUAL.md#bigint-support") }
const Be = /^-?[0-9]+$/;
class Se {
    constructor(e, t) { this.lo = 0 | e, this.hi = 0 | t }
    isZero() { return 0 == this.lo && 0 == this.hi }
    toNumber() { let e = 4294967296 * this.hi + (this.lo >>> 0); if (!Number.isSafeInteger(e)) throw new Error("cannot convert to safe number"); return e }
}
const Ue = class extends Se {
    static from(e) {
        if (ve) switch (typeof e) {
            case "string":
                if ("0" == e) return this.ZERO; if ("" == e) throw new Error("string is no integer");
                e = ve.C(e);
            case "number":
                if (0 === e) return this.ZERO;
                e = ve.C(e);
            case "bigint":
                if (!e) return this.ZERO; if (e < ve.UMIN) throw new Error("signed value for ulong"); if (e > ve.UMAX) throw new Error("ulong too large"); return ve.V.setBigUint64(0, e, !0), new Ue(ve.V.getInt32(0, !0), ve.V.getInt32(4, !0))
        } else switch (typeof e) {
            case "string":
                if ("0" == e) return this.ZERO; if (e = e.trim(), !Be.test(e)) throw new Error("string is no integer"); let [t, r, n] = Ne(e); if (t) throw new Error("signed value"); return new Ue(r, n);
            case "number":
                if (0 == e) return this.ZERO; if (!Number.isSafeInteger(e)) throw new Error("number is no integer"); if (e < 0) throw new Error("signed value for ulong"); return new Ue(e, e / 4294967296)
        }
        throw new Error("unknown value " + typeof e)
    }
    toString() { return ve ? this.toBigInt().toString() : ke(this.lo, this.hi) }
    toBigInt() { return Oe(ve), ve.V.setInt32(0, this.lo, !0), ve.V.setInt32(4, this.hi, !0), ve.V.getBigUint64(0, !0) }
};
let Ae = Ue;
Ae.ZERO = new Ue(0, 0);
const De = class extends Se {
    static from(e) {
        if (ve) switch (typeof e) {
            case "string":
                if ("0" == e) return this.ZERO; if ("" == e) throw new Error("string is no integer");
                e = ve.C(e);
            case "number":
                if (0 === e) return this.ZERO;
                e = ve.C(e);
            case "bigint":
                if (!e) return this.ZERO; if (e < ve.MIN) throw new Error("ulong too small"); if (e > ve.MAX) throw new Error("ulong too large"); return ve.V.setBigInt64(0, e, !0), new De(ve.V.getInt32(0, !0), ve.V.getInt32(4, !0))
        } else switch (typeof e) {
            case "string":
                if ("0" == e) return this.ZERO; if (e = e.trim(), !Be.test(e)) throw new Error("string is no integer"); let [t, r, n] = Ne(e), s = new De(r, n); return t ? s.negate() : s;
            case "number":
                if (0 == e) return this.ZERO; if (!Number.isSafeInteger(e)) throw new Error("number is no integer"); return e > 0 ? new De(e, e / 4294967296) : new De(-e, -e / 4294967296).negate()
        }
        throw new Error("unknown value " + typeof e)
    }
    isNegative() { return 0 != (2147483648 & this.hi) }
    negate() {
        let e = ~this.hi,
        t = this.lo; return t ? t = 1 + ~t : e += 1, new De(t, e)
    }
    toString() { if (ve) return this.toBigInt().toString(); if (this.isNegative()) { let e = this.negate(); return "-" + ke(e.lo, e.hi) } return ke(this.lo, this.hi) }
    toBigInt() { return Oe(ve), ve.V.setInt32(0, this.lo, !0), ve.V.setInt32(4, this.hi, !0), ve.V.getBigInt64(0, !0) }
};
let Fe = De;
Fe.ZERO = new De(0, 0);
class Ve {
    constructor(e, t) { this.varint64 = ye, this.uint32 = Ee, this.buf = e, this.len = e.length, this.pos = 0, this.view = new DataView(e.buffer, e.byteOffset, e.byteLength), this.textDecoder = null != t ? t : new oe("utf-8", { fatal: !0 }) }
    tag() {
        let e = this.uint32(),
        t = e >>> 3,
        r = 7 & e; if (t <= 0 || r < 0 || r > 5) throw new Error("illegal tag: field no " + t + " wire type " + r); return [t, r]
    }
    skip(e) {
        let t = this.pos; switch (e) {
            case $e.Varint:
                for (; 128 & this.buf[this.pos++];); break;
            case $e.Bit64:
                this.pos += 4;
            case $e.Bit32:
                this.pos += 4; break;
            case $e.LengthDelimited:
                let t = this.uint32();
                this.pos += t; break;
            case $e.StartGroup:
                let r; for (;
                    (r = this.tag()[1]) !== $e.EndGroup;) this.skip(r); break;
            default:
                throw new Error("cant skip wire type " + e)
        } return this.assertBounds(), this.buf.subarray(t, this.pos)
    }
    assertBounds() { if (this.pos > this.len) throw new RangeError("premature EOF") }
    int32() { return 0 | this.uint32() }
    sint32() { let e = this.uint32(); return e >>> 1 ^ -(1 & e) }
    int64() { return new Fe(...this.varint64()) }
    uint64() { return new Ae(...this.varint64()) }
    sint64() { let [e, t] = this.varint64(), r = -(1 & e); return e = (e >>> 1 | (1 & t) << 31) ^ r, t = t >>> 1 ^ r, new Fe(e, t) }
    bool() { let [e, t] = this.varint64(); return 0 !== e || 0 !== t }
    fixed32() { return this.view.getUint32((this.pos += 4) - 4, !0) }
    sfixed32() { return this.view.getInt32((this.pos += 4) - 4, !0) }
    fixed64() { return new Ae(this.sfixed32(), this.sfixed32()) }
    sfixed64() { return new Fe(this.sfixed32(), this.sfixed32()) }
    float() { return this.view.getFloat32((this.pos += 4) - 4, !0) }
    double() { return this.view.getFloat64((this.pos += 8) - 8, !0) }
    bytes() {
        let e = this.uint32(),
        t = this.pos; return this.pos += e, this.assertBounds(), this.buf.subarray(t, t + e)
    }
    string() { return this.textDecoder.decode(this.bytes()) }
}

function Le(e, t) { if (!e) throw new Error(t) }

function Re(e) { if ("number" != typeof e) throw new Error("invalid int 32: " + typeof e); if (!Number.isInteger(e) || e > 2147483647 || e < -2147483648) throw new Error("invalid int 32: " + e) }

function je(e) { if ("number" != typeof e) throw new Error("invalid uint 32: " + typeof e); if (!Number.isInteger(e) || e > 4294967295 || e < 0) throw new Error("invalid uint 32: " + e) }

function xe(e) { if ("number" != typeof e) throw new Error("invalid float 32: " + typeof e); if (Number.isFinite(e) && (e > 34028234663852886e22 || e < -34028234663852886e22)) throw new Error("invalid float 32: " + e) }
class Me {
    constructor(e) { this.stack = [], this.textEncoder = null != e ? e : new ie, this.chunks = [], this.buf = [] }
    finish() {
        this.chunks.push(new Uint8Array(this.buf)); let e = 0; for (let t = 0; t < this.chunks.length; t++) e += this.chunks[t].length; let t = new Uint8Array(e),
            r = 0; for (let e = 0; e < this.chunks.length; e++) t.set(this.chunks[e], r), r += this.chunks[e].length; return this.chunks = [], t
    }
    fork() { return this.stack.push({ chunks: this.chunks, buf: this.buf }), this.chunks = [], this.buf = [], this }
    join() {
        let e = this.finish(),
        t = this.stack.pop(); if (!t) throw new Error("invalid state, fork stack empty"); return this.chunks = t.chunks, this.buf = t.buf, this.uint32(e.byteLength), this.raw(e)
    }
    tag(e, t) { return this.uint32((e << 3 | t) >>> 0) }
    raw(e) { return this.buf.length && (this.chunks.push(new Uint8Array(this.buf)), this.buf = []), this.chunks.push(e), this }
    uint32(e) { for (je(e); e > 127;) this.buf.push(127 & e | 128), e >>>= 7; return this.buf.push(e), this }
    int32(e) { return Re(e), Te(e, this.buf), this }
    bool(e) { return this.buf.push(e ? 1 : 0), this }
    bytes(e) { return this.uint32(e.byteLength), this.raw(e) }
    string(e) { let t = this.textEncoder.encode(e); return this.uint32(t.byteLength), this.raw(t) }
    float(e) { xe(e); let t = new Uint8Array(4); return new DataView(t.buffer).setFloat32(0, e, !0), this.raw(t) }
    double(e) { let t = new Uint8Array(8); return new DataView(t.buffer).setFloat64(0, e, !0), this.raw(t) }
    fixed32(e) { je(e); let t = new Uint8Array(4); return new DataView(t.buffer).setUint32(0, e, !0), this.raw(t) }
    sfixed32(e) { Re(e); let t = new Uint8Array(4); return new DataView(t.buffer).setInt32(0, e, !0), this.raw(t) }
    sint32(e) { return Re(e), Te(e = (e << 1 ^ e >> 31) >>> 0, this.buf), this }
    sfixed64(e) {
        let t = new Uint8Array(8),
        r = new DataView(t.buffer),
        n = Fe.from(e); return r.setInt32(0, n.lo, !0), r.setInt32(4, n.hi, !0), this.raw(t)
    }
    fixed64(e) {
        let t = new Uint8Array(8),
        r = new DataView(t.buffer),
        n = Ae.from(e); return r.setInt32(0, n.lo, !0), r.setInt32(4, n.hi, !0), this.raw(t)
    }
    int64(e) { let t = Fe.from(e); return Ie(t.lo, t.hi, this.buf), this }
    sint64(e) {
        let t = Fe.from(e),
        r = t.hi >> 31; return Ie(t.lo << 1 ^ r, (t.hi << 1 | t.lo >>> 31) ^ r, this.buf), this
    }
    uint64(e) { let t = Ae.from(e); return Ie(t.lo, t.hi, this.buf), this }
}
var Xe;
! function (e) {
    e.symbol = Symbol.for("protobuf-ts/unknown"), e.onRead = (r, n, s, i, o) => {
        (t(n) ? n[e.symbol] : n[e.symbol] = []).push({ no: s, wireType: i, data: o })
    }, e.onWrite = (t, r, n) => {
        for (let { no: t, wireType: s, data: i }
            of e.list(r)) n.tag(t, s).raw(i)
    }, e.list = (r, n) => { if (t(r)) { let t = r[e.symbol]; return n ? t.filter((e => e.no == n)) : t } return [] }, e.last = (t, r) => e.list(t, r).slice(-1)[0]; const t = t => t && Array.isArray(t[e.symbol])
}(Xe || (Xe = {}));
const Ce = { readUnknownField: !0, readerFactory: e => new Ve(e) },
    Ke = { writeUnknownFields: !0, writerFactory: () => new Me };
var $e, Ge;
(Ge = $e || ($e = {}))[Ge.Varint = 0] = "Varint", Ge[Ge.Bit64 = 1] = "Bit64", Ge[Ge.LengthDelimited = 2] = "LengthDelimited", Ge[Ge.StartGroup = 3] = "StartGroup", Ge[Ge.EndGroup = 4] = "EndGroup", Ge[Ge.Bit32 = 5] = "Bit32";
const Je = { emitDefaultValues: !1, enumAsInteger: !1, useProtoFieldName: !1, prettySpaces: 0 },
    Ze = { ignoreUnknownFields: !1 };

function Pe(e) { return e ? de(de({}, Je), e) : Je }
const Ye = Symbol.for("protobuf-ts/message-type");

function We(e) { let t = !1; const r = []; for (let n = 0; n < e.length; n++) { let s = e.charAt(n); "_" == s ? t = !0 : /\d/.test(s) ? (r.push(s), t = !0) : t ? (r.push(s.toUpperCase()), t = !1) : 0 == n ? r.push(s.toLowerCase()) : r.push(s) } return r.join("") }
var _e, qe, ze, He, Qe, et;

function tt(e) { var t, r, n, s; return e.localName = null != (t = e.localName) ? t : We(e.name), e.jsonName = null != (r = e.jsonName) ? r : We(e.name), e.repeat = null != (n = e.repeat) ? n : 0, e.opt = null != (s = e.opt) ? s : !e.repeat && (!e.oneof && "message" == e.kind), e }

function rt(e) {
    if ("object" != typeof e || null === e || !e.hasOwnProperty("oneofKind")) return !1; switch (typeof e.oneofKind) {
        case "string":
            return void 0 !== e[e.oneofKind] && 2 == Object.keys(e).length;
        case "undefined":
            return 1 == Object.keys(e).length;
        default:
            return !1
    }
} (qe = _e || (_e = {}))[qe.DOUBLE = 1] = "DOUBLE", qe[qe.FLOAT = 2] = "FLOAT", qe[qe.INT64 = 3] = "INT64", qe[qe.UINT64 = 4] = "UINT64", qe[qe.INT32 = 5] = "INT32", qe[qe.FIXED64 = 6] = "FIXED64", qe[qe.FIXED32 = 7] = "FIXED32", qe[qe.BOOL = 8] = "BOOL", qe[qe.STRING = 9] = "STRING", qe[qe.BYTES = 12] = "BYTES", qe[qe.UINT32 = 13] = "UINT32", qe[qe.SFIXED32 = 15] = "SFIXED32", qe[qe.SFIXED64 = 16] = "SFIXED64", qe[qe.SINT32 = 17] = "SINT32", qe[qe.SINT64 = 18] = "SINT64", (He = ze || (ze = {}))[He.BIGINT = 0] = "BIGINT", He[He.STRING = 1] = "STRING", He[He.NUMBER = 2] = "NUMBER", (et = Qe || (Qe = {}))[et.NO = 0] = "NO", et[et.PACKED = 1] = "PACKED", et[et.UNPACKED = 2] = "UNPACKED";
class nt {
    constructor(e) {
        var t;
        this.fields = null != (t = e.fields) ? t : []
    }
    prepare() {
        if (this.data) return; const e = [],
            t = [],
            r = []; for (let n of this.fields)
            if (n.oneof) r.includes(n.oneof) || (r.push(n.oneof), e.push(n.oneof), t.push(n.oneof));
            else switch (t.push(n.localName), n.kind) {
                case "scalar":
                case "enum":
                    n.opt && !n.repeat || e.push(n.localName); break;
                case "message":
                    n.repeat && e.push(n.localName); break;
                case "map":
                    e.push(n.localName)
            }
        this.data = { req: e, known: t, oneofs: Object.values(r) }
    }
    is(e, t, r = !1) {
        if (t < 0) return !0; if (null == e || "object" != typeof e) return !1;
        this.prepare(); let n = Object.keys(e),
            s = this.data; if (n.length < s.req.length || s.req.some((e => !n.includes(e)))) return !1; if (!r && n.some((e => !s.known.includes(e)))) return !1; if (t < 1) return !0; for (const n of s.oneofs) { const s = e[n]; if (!rt(s)) return !1; if (void 0 === s.oneofKind) continue; const i = this.fields.find((e => e.localName === s.oneofKind)); if (!i) return !1; if (!this.field(s[s.oneofKind], i, r, t)) return !1 } for (const n of this.fields)
            if (void 0 === n.oneof && !this.field(e[n.localName], n, r, t)) return !1;
        return !0
    }
    field(e, t, r, n) {
        let s = t.repeat; switch (t.kind) {
            case "scalar":
                return void 0 === e ? t.opt : s ? this.scalars(e, t.T, n, t.L) : this.scalar(e, t.T, t.L);
            case "enum":
                return void 0 === e ? t.opt : s ? this.scalars(e, _e.INT32, n) : this.scalar(e, _e.INT32);
            case "message":
                return void 0 === e || (s ? this.messages(e, t.T(), r, n) : this.message(e, t.T(), r, n));
            case "map":
                if ("object" != typeof e || null === e) return !1; if (n < 2) return !0; if (!this.mapKeys(e, t.K, n)) return !1; switch (t.V.kind) {
                    case "scalar":
                        return this.scalars(Object.values(e), t.V.T, n, t.V.L);
                    case "enum":
                        return this.scalars(Object.values(e), _e.INT32, n);
                    case "message":
                        return this.messages(Object.values(e), t.V.T(), r, n)
                }
        } return !0
    }
    message(e, t, r, n) { return r ? t.isAssignable(e, n) : t.is(e, n) }
    messages(e, t, r, n) {
        if (!Array.isArray(e)) return !1; if (n < 2) return !0; if (r) {
            for (let r = 0; r < e.length && r < n; r++)
                if (!t.isAssignable(e[r], n - 1)) return !1
        } else
            for (let r = 0; r < e.length && r < n; r++)
                if (!t.is(e[r], n - 1)) return !1; return !0
    }
    scalar(e, t, r) {
        let n = typeof e; switch (t) {
            case _e.UINT64:
            case _e.FIXED64:
            case _e.INT64:
            case _e.SFIXED64:
            case _e.SINT64:
                switch (r) {
                    case ze.BIGINT:
                        return "bigint" == n;
                    case ze.NUMBER:
                        return "number" == n && !isNaN(e);
                    default:
                        return "string" == n
                }
            case _e.BOOL:
                return "boolean" == n;
            case _e.STRING:
                return "string" == n;
            case _e.BYTES:
                return e instanceof Uint8Array;
            case _e.DOUBLE:
            case _e.FLOAT:
                return "number" == n && !isNaN(e);
            default:
                return "number" == n && Number.isInteger(e)
        }
    }
    scalars(e, t, r, n) {
        if (!Array.isArray(e)) return !1; if (r < 2) return !0; if (Array.isArray(e))
            for (let s = 0; s < e.length && s < r; s++)
                if (!this.scalar(e[s], t, n)) return !1;
        return !0
    }
    mapKeys(e, t, r) {
        let n = Object.keys(e); switch (t) {
            case _e.INT32:
            case _e.FIXED32:
            case _e.SFIXED32:
            case _e.SINT32:
            case _e.UINT32:
                return this.scalars(n.slice(0, r).map((e => parseInt(e))), t, r);
            case _e.BOOL:
                return this.scalars(n.slice(0, r).map((e => "true" == e || "false" != e && e)), t, r);
            default:
                return this.scalars(n, t, r, ze.STRING)
        }
    }
}

function st(e, t) {
    switch (t) {
        case ze.BIGINT:
            return e.toBigInt();
        case ze.NUMBER:
            return e.toNumber();
        default:
            return e.toString()
    }
}
class it {
    constructor(e) { this.info = e }
    prepare() { var e; if (void 0 === this.fMap) { this.fMap = {}; const t = null != (e = this.info.fields) ? e : []; for (const e of t) this.fMap[e.name] = e, this.fMap[e.jsonName] = e, this.fMap[e.localName] = e } }
    assert(e, t, r) { if (!e) { let e = pe(r); throw "number" != e && "boolean" != e || (e = r.toString()), new Error(`Cannot parse JSON ${e} for ${this.info.typeName}#${t}`) } }
    read(e, t, r) {
        this.prepare(); const n = []; for (const [s, i] of Object.entries(e)) {
            const e = this.fMap[s]; if (!e) { if (!r.ignoreUnknownFields) throw new Error(`Found unknown field while reading ${this.info.typeName} from JSON format. JSON key: ${s}`); continue } const o = e.localName; let a; if (e.oneof) {
                if (n.includes(e.oneof)) throw new Error(`Multiple members of the oneof group "${e.oneof}" of ${this.info.typeName} are present in JSON.`);
                n.push(e.oneof), a = t[e.oneof] = { oneofKind: o }
            } else a = t; if ("map" == e.kind) {
                if (null === i) continue;
                this.assert(ge(i), e.name, i); const t = a[o]; for (const [n, s] of Object.entries(i)) {
                    let i; switch (this.assert(null !== s, e.name + " map value", null), e.V.kind) {
                        case "message":
                            i = e.V.T().internalJsonRead(s, r); break;
                        case "enum":
                            if (i = this.enum(e.V.T(), s, e.name, r.ignoreUnknownFields), !1 === i) continue; break;
                        case "scalar":
                            i = this.scalar(s, e.V.T, e.V.L, e.name)
                    }
                    this.assert(void 0 !== i, e.name + " map value", s); let o = n;
                    e.K == _e.BOOL && (o = "true" == o || "false" != o && o), o = this.scalar(o, e.K, ze.STRING, e.name).toString(), t[o] = i
                }
            } else if (e.repeat) {
                if (null === i) continue;
                this.assert(Array.isArray(i), e.name, i); const t = a[o]; for (const n of i) {
                    let s; switch (this.assert(null !== n, e.name, null), e.kind) {
                        case "message":
                            s = e.T().internalJsonRead(n, r); break;
                        case "enum":
                            if (s = this.enum(e.T(), n, e.name, r.ignoreUnknownFields), !1 === s) continue; break;
                        case "scalar":
                            s = this.scalar(n, e.T, e.L, e.name)
                    }
                    this.assert(void 0 !== s, e.name, i), t.push(s)
                }
            } else switch (e.kind) {
                case "message":
                    if (null === i && "google.protobuf.Value" != e.T().typeName) { this.assert(void 0 === e.oneof, e.name + " (oneof member)", null); continue }
                    a[o] = e.T().internalJsonRead(i, r, a[o]); break;
                case "enum":
                    let t = this.enum(e.T(), i, e.name, r.ignoreUnknownFields); if (!1 === t) continue;
                    a[o] = t; break;
                case "scalar":
                    a[o] = this.scalar(i, e.T, e.L, e.name)
            }
        }
    }
    enum(e, t, r, n) {
        if ("google.protobuf.NullValue" == e[0] && Le(null === t, `Unable to parse field ${this.info.typeName}#${r}, enum ${e[0]} only accepts null.`), null === t) return 0; switch (typeof t) {
            case "number":
                return Le(Number.isInteger(t), `Unable to parse field ${this.info.typeName}#${r}, enum can only be integral number, got ${t}.`), t;
            case "string":
                let s = t;
                e[2] && t.substring(0, e[2].length) === e[2] && (s = t.substring(e[2].length)); let i = e[1][s]; return (void 0 !== i || !n) && (Le("number" == typeof i, `Unable to parse field ${this.info.typeName}#${r}, enum ${e[0]} has no value for "${t}".`), i)
        }
        Le(!1, `Unable to parse field ${this.info.typeName}#${r}, cannot parse enum value from ${typeof t}".`)
    }
    scalar(e, t, r, n) {
        let s; try {
            switch (t) {
                case _e.DOUBLE:
                case _e.FLOAT:
                    if (null === e) return 0; if ("NaN" === e) return Number.NaN; if ("Infinity" === e) return Number.POSITIVE_INFINITY; if ("-Infinity" === e) return Number.NEGATIVE_INFINITY; if ("" === e) { s = "empty string"; break } if ("string" == typeof e && e.trim().length !== e.length) { s = "extra whitespace"; break } if ("string" != typeof e && "number" != typeof e) break; let n = Number(e); if (Number.isNaN(n)) { s = "not a number"; break } if (!Number.isFinite(n)) { s = "too large or small"; break } return t == _e.FLOAT && xe(n), n;
                case _e.INT32:
                case _e.FIXED32:
                case _e.SFIXED32:
                case _e.SINT32:
                case _e.UINT32:
                    if (null === e) return 0; let i; if ("number" == typeof e ? i = e : "" === e ? s = "empty string" : "string" == typeof e && (e.trim().length !== e.length ? s = "extra whitespace" : i = Number(e)), void 0 === i) break; return t == _e.UINT32 ? je(i) : Re(i), i;
                case _e.INT64:
                case _e.SFIXED64:
                case _e.SINT64:
                    if (null === e) return st(Fe.ZERO, r); if ("number" != typeof e && "string" != typeof e) break; return st(Fe.from(e), r);
                case _e.FIXED64:
                case _e.UINT64:
                    if (null === e) return st(Ae.ZERO, r); if ("number" != typeof e && "string" != typeof e) break; return st(Ae.from(e), r);
                case _e.BOOL:
                    if (null === e) return !1; if ("boolean" != typeof e) break; return e;
                case _e.STRING:
                    if (null === e) return ""; if ("string" != typeof e) { s = "extra whitespace"; break } try { encodeURIComponent(e) } catch (e) { e = "invalid UTF8"; break } return e;
                case _e.BYTES:
                    if (null === e || "" === e) return new Uint8Array(0); if ("string" != typeof e) break; return function (e) {
                        let t = 3 * e.length / 4; "=" == e[e.length - 2] ? t -= 2 : "=" == e[e.length - 1] && (t -= 1); let r, n = new Uint8Array(t),
                            s = 0,
                            i = 0,
                            o = 0; for (let t = 0; t < e.length; t++) {
                                if (r = we[e.charCodeAt(t)], void 0 === r) switch (e[t]) {
                                    case "=":
                                        i = 0;
                                    case "\n":
                                    case "\r":
                                    case "\t":
                                    case " ":
                                        continue;
                                    default:
                                        throw Error("invalid base64 string.")
                                }
                                switch (i) {
                                    case 0:
                                        o = r, i = 1; break;
                                    case 1:
                                        n[s++] = o << 2 | (48 & r) >> 4, o = r, i = 2; break;
                                    case 2:
                                        n[s++] = (15 & o) << 4 | (60 & r) >> 2, o = r, i = 3; break;
                                    case 3:
                                        n[s++] = (3 & o) << 6 | r, i = 0
                                }
                            } if (1 == i) throw Error("invalid base64 string."); return n.subarray(0, s)
                    }(e)
            }
        } catch (e) { s = e.message }
        this.assert(!1, n + (s ? " - " + s : ""), e)
    }
}
class ot {
    constructor(e) {
        var t;
        this.fields = null != (t = e.fields) ? t : []
    }
    write(e, t) {
        const r = {},
        n = e; for (const e of this.fields) {
            if (!e.oneof) {
                let s = this.field(e, n[e.localName], t);
                void 0 !== s && (r[t.useProtoFieldName ? e.name : e.jsonName] = s); continue
            } const i = n[e.oneof]; if (i.oneofKind !== e.localName) continue; const o = "scalar" == e.kind || "enum" == e.kind ? (s = de({}, t), le(s, fe({ emitDefaultValues: !0 }))) : t; let a = this.field(e, i[e.localName], o);
            Le(void 0 !== a), r[t.useProtoFieldName ? e.name : e.jsonName] = a
        } var s; return r
    }
    field(e, t, r) {
        let n; if ("map" == e.kind) {
            Le("object" == typeof t && null !== t); const s = {}; switch (e.V.kind) {
                case "scalar":
                    for (const [r, n] of Object.entries(t)) {
                        const t = this.scalar(e.V.T, n, e.name, !1, !0);
                        Le(void 0 !== t), s[r.toString()] = t
                    } break;
                case "message":
                    const n = e.V.T(); for (const [i, o] of Object.entries(t)) {
                        const t = this.message(n, o, e.name, r);
                        Le(void 0 !== t), s[i.toString()] = t
                    } break;
                case "enum":
                    const i = e.V.T(); for (const [n, o] of Object.entries(t)) {
                        Le(void 0 === o || "number" == typeof o); const t = this.enum(i, o, e.name, !1, !0, r.enumAsInteger);
                        Le(void 0 !== t), s[n.toString()] = t
                    }
            }(r.emitDefaultValues || Object.keys(s).length > 0) && (n = s)
        } else if (e.repeat) {
            Le(Array.isArray(t)); const s = []; switch (e.kind) {
                case "scalar":
                    for (let r = 0; r < t.length; r++) {
                        const n = this.scalar(e.T, t[r], e.name, e.opt, !0);
                        Le(void 0 !== n), s.push(n)
                    } break;
                case "enum":
                    const n = e.T(); for (let i = 0; i < t.length; i++) {
                        Le(void 0 === t[i] || "number" == typeof t[i]); const o = this.enum(n, t[i], e.name, e.opt, !0, r.enumAsInteger);
                        Le(void 0 !== o), s.push(o)
                    } break;
                case "message":
                    const i = e.T(); for (let n = 0; n < t.length; n++) {
                        const o = this.message(i, t[n], e.name, r);
                        Le(void 0 !== o), s.push(o)
                    }
            }(r.emitDefaultValues || s.length > 0 || r.emitDefaultValues) && (n = s)
        } else switch (e.kind) {
            case "scalar":
                n = this.scalar(e.T, t, e.name, e.opt, r.emitDefaultValues); break;
            case "enum":
                n = this.enum(e.T(), t, e.name, e.opt, r.emitDefaultValues, r.enumAsInteger); break;
            case "message":
                n = this.message(e.T(), t, e.name, r)
        }
        return n
    }
    enum(e, t, r, n, s, i) { if ("google.protobuf.NullValue" == e[0]) return null; if (void 0 !== t) { if (0 !== t || s || n) return Le("number" == typeof t), Le(Number.isInteger(t)), i || !e[1].hasOwnProperty(t) ? t : e[2] ? e[2] + e[1][t] : e[1][t] } else Le(n) }
    message(e, t, r, n) { return void 0 === t ? n.emitDefaultValues ? null : void 0 : e.internalJsonWrite(t, n) }
    scalar(e, t, r, n, s) {
        if (void 0 === t) return void Le(n); const i = s || n; switch (e) {
            case _e.INT32:
            case _e.SFIXED32:
            case _e.SINT32:
                return 0 === t ? i ? 0 : void 0 : (Re(t), t);
            case _e.FIXED32:
            case _e.UINT32:
                return 0 === t ? i ? 0 : void 0 : (je(t), t);
            case _e.FLOAT:
                xe(t);
            case _e.DOUBLE:
                return 0 === t ? i ? 0 : void 0 : (Le("number" == typeof t), Number.isNaN(t) ? "NaN" : t === Number.POSITIVE_INFINITY ? "Infinity" : t === Number.NEGATIVE_INFINITY ? "-Infinity" : t);
            case _e.STRING:
                return "" === t ? i ? "" : void 0 : (Le("string" == typeof t), t);
            case _e.BOOL:
                return !1 === t ? !i && void 0 : (Le("boolean" == typeof t), t);
            case _e.UINT64:
            case _e.FIXED64:
                Le("number" == typeof t || "string" == typeof t || "bigint" == typeof t); let e = Ae.from(t); if (e.isZero() && !i) return; return e.toString();
            case _e.INT64:
            case _e.SFIXED64:
            case _e.SINT64:
                Le("number" == typeof t || "string" == typeof t || "bigint" == typeof t); let r = Fe.from(t); if (r.isZero() && !i) return; return r.toString();
            case _e.BYTES:
                return Le(t instanceof Uint8Array), t.byteLength ? function (e) {
                    let t, r = "",
                    n = 0,
                    s = 0; for (let i = 0; i < e.length; i++) switch (t = e[i], n) {
                        case 0:
                            r += be[t >> 2], s = (3 & t) << 4, n = 1; break;
                        case 1:
                            r += be[s | t >> 4], s = (15 & t) << 2, n = 2; break;
                        case 2:
                            r += be[s | t >> 6], r += be[63 & t], n = 0
                    }
                    return n && (r += be[s], r += "=", 1 == n && (r += "=")), r
                }(t) : i ? "" : void 0
        }
    }
}

function at(e, t = ze.STRING) {
    switch (e) {
        case _e.BOOL:
            return !1;
        case _e.UINT64:
        case _e.FIXED64:
            return st(Ae.ZERO, t);
        case _e.INT64:
        case _e.SFIXED64:
        case _e.SINT64:
            return st(Fe.ZERO, t);
        case _e.DOUBLE:
        case _e.FLOAT:
            return 0;
        case _e.BYTES:
            return new Uint8Array(0);
        case _e.STRING:
            return "";
        default:
            return 0
    }
}
class lt {
    constructor(e) { this.info = e }
    prepare() {
        var e; if (!this.fieldNoToField) {
            const t = null != (e = this.info.fields) ? e : [];
            this.fieldNoToField = new Map(t.map((e => [e.no, e])))
        }
    }
    read(e, t, r, n) {
        this.prepare(); const s = void 0 === n ? e.len : e.pos + n; for (; e.pos < s;) {
            const [n, s] = e.tag(), i = this.fieldNoToField.get(n); if (!i) { let i = r.readUnknownField; if ("throw" == i) throw new Error(`Unknown field ${n} (wire type ${s}) for ${this.info.typeName}`); let o = e.skip(s); !1 !== i && (!0 === i ? Xe.onRead : i)(this.info.typeName, t, n, s, o); continue } let o = t,
                a = i.repeat,
                l = i.localName; switch (i.oneof && (o = o[i.oneof], o.oneofKind !== l && (o = t[i.oneof] = { oneofKind: l })), i.kind) {
                    case "scalar":
                    case "enum":
                        let t = "enum" == i.kind ? _e.INT32 : i.T,
                            n = "scalar" == i.kind ? i.L : void 0; if (a) { let r = o[l]; if (s == $e.LengthDelimited && t != _e.STRING && t != _e.BYTES) { let s = e.uint32() + e.pos; for (; e.pos < s;) r.push(this.scalar(e, t, n)) } else r.push(this.scalar(e, t, n)) } else o[l] = this.scalar(e, t, n); break;
                    case "message":
                        if (a) {
                            let t = o[l],
                            n = i.T().internalBinaryRead(e, e.uint32(), r);
                            t.push(n)
                        } else o[l] = i.T().internalBinaryRead(e, e.uint32(), r, o[l]); break;
                    case "map":
                        let [f, u] = this.mapEntry(i, e, r);
                        o[l][f] = u
                }
        }
    }
    mapEntry(e, t, r) {
        let n, s, i = t.uint32(),
        o = t.pos + i; for (; t.pos < o;) {
            let [i, o] = t.tag(); switch (i) {
                case 1:
                    n = e.K == _e.BOOL ? t.bool().toString() : this.scalar(t, e.K, ze.STRING); break;
                case 2:
                    switch (e.V.kind) {
                        case "scalar":
                            s = this.scalar(t, e.V.T, e.V.L); break;
                        case "enum":
                            s = t.int32(); break;
                        case "message":
                            s = e.V.T().internalBinaryRead(t, t.uint32(), r)
                    } break;
                default:
                    throw new Error(`Unknown field ${i} (wire type ${o}) in map entry for ${this.info.typeName}#${e.name}`)
            }
        } if (void 0 === n) {
            let t = at(e.K);
            n = e.K == _e.BOOL ? t.toString() : t
        } if (void 0 === s) switch (e.V.kind) {
            case "scalar":
                s = at(e.V.T, e.V.L); break;
            case "enum":
                s = 0; break;
            case "message":
                s = e.V.T().create()
        }
        return [n, s]
    }
    scalar(e, t, r) {
        switch (t) {
            case _e.INT32:
                return e.int32();
            case _e.STRING:
                return e.string();
            case _e.BOOL:
                return e.bool();
            case _e.DOUBLE:
                return e.double();
            case _e.FLOAT:
                return e.float();
            case _e.INT64:
                return st(e.int64(), r);
            case _e.UINT64:
                return st(e.uint64(), r);
            case _e.FIXED64:
                return st(e.fixed64(), r);
            case _e.FIXED32:
                return e.fixed32();
            case _e.BYTES:
                return e.bytes();
            case _e.UINT32:
                return e.uint32();
            case _e.SFIXED32:
                return e.sfixed32();
            case _e.SFIXED64:
                return st(e.sfixed64(), r);
            case _e.SINT32:
                return e.sint32();
            case _e.SINT64:
                return st(e.sint64(), r)
        }
    }
}
class ft {
    constructor(e) { this.info = e }
    prepare() {
        if (!this.fields) {
            const e = this.info.fields ? this.info.fields.concat() : [];
            this.fields = e.sort(((e, t) => e.no - t.no))
        }
    }
    write(e, t, r) {
        this.prepare(); for (const n of this.fields) {
            let s, i, o = n.repeat,
            a = n.localName; if (n.oneof) {
                const t = e[n.oneof]; if (t.oneofKind !== a) continue;
                s = t[a], i = !0
            } else s = e[a], i = !1; switch (n.kind) {
                case "scalar":
                case "enum":
                    let e = "enum" == n.kind ? _e.INT32 : n.T; if (o)
                        if (Le(Array.isArray(s)), o == Qe.PACKED) this.packed(t, e, n.no, s);
                        else
                            for (const r of s) this.scalar(t, e, n.no, r, !0);
                    else void 0 === s ? Le(n.opt) : this.scalar(t, e, n.no, s, i || n.opt); break;
                case "message":
                    if (o) { Le(Array.isArray(s)); for (const e of s) this.message(t, r, n.T(), n.no, e) } else this.message(t, r, n.T(), n.no, s); break;
                case "map":
                    Le("object" == typeof s && null !== s); for (const [e, i] of Object.entries(s)) this.mapEntry(t, r, n, e, i)
            }
        } let n = r.writeUnknownFields; !1 !== n && (!0 === n ? Xe.onWrite : n)(this.info.typeName, e, t)
    }
    mapEntry(e, t, r, n, s) {
        e.tag(r.no, $e.LengthDelimited), e.fork(); let i = n; switch (r.K) {
            case _e.INT32:
            case _e.FIXED32:
            case _e.UINT32:
            case _e.SFIXED32:
            case _e.SINT32:
                i = Number.parseInt(n); break;
            case _e.BOOL:
                Le("true" == n || "false" == n), i = "true" == n
        } switch (this.scalar(e, r.K, 1, i, !0), r.V.kind) {
            case "scalar":
                this.scalar(e, r.V.T, 2, s, !0); break;
            case "enum":
                this.scalar(e, _e.INT32, 2, s, !0); break;
            case "message":
                this.message(e, t, r.V.T(), 2, s)
        }
        e.join()
    }
    message(e, t, r, n, s) { void 0 !== s && (r.internalBinaryWrite(s, e.tag(n, $e.LengthDelimited).fork(), t), e.join()) }
    scalar(e, t, r, n, s) {
        let [i, o, a] = this.scalarInfo(t, n);
        a && !s || (e.tag(r, i), e[o](n))
    }
    packed(e, t, r, n) {
        if (!n.length) return;
        Le(t !== _e.BYTES && t !== _e.STRING), e.tag(r, $e.LengthDelimited), e.fork(); let [, s] = this.scalarInfo(t); for (let t = 0; t < n.length; t++) e[s](n[t]);
        e.join()
    }
    scalarInfo(e, t) {
        let r, n = $e.Varint,
        s = void 0 === t,
        i = 0 === t; switch (e) {
            case _e.INT32:
                r = "int32"; break;
            case _e.STRING:
                i = s || !t.length, n = $e.LengthDelimited, r = "string"; break;
            case _e.BOOL:
                i = !1 === t, r = "bool"; break;
            case _e.UINT32:
                r = "uint32"; break;
            case _e.DOUBLE:
                n = $e.Bit64, r = "double"; break;
            case _e.FLOAT:
                n = $e.Bit32, r = "float"; break;
            case _e.INT64:
                i = s || Fe.from(t).isZero(), r = "int64"; break;
            case _e.UINT64:
                i = s || Ae.from(t).isZero(), r = "uint64"; break;
            case _e.FIXED64:
                i = s || Ae.from(t).isZero(), n = $e.Bit64, r = "fixed64"; break;
            case _e.BYTES:
                i = s || !t.byteLength, n = $e.LengthDelimited, r = "bytes"; break;
            case _e.FIXED32:
                n = $e.Bit32, r = "fixed32"; break;
            case _e.SFIXED32:
                n = $e.Bit32, r = "sfixed32"; break;
            case _e.SFIXED64:
                i = s || Fe.from(t).isZero(), n = $e.Bit64, r = "sfixed64"; break;
            case _e.SINT32:
                r = "sint32"; break;
            case _e.SINT64:
                i = s || Fe.from(t).isZero(), r = "sint64"
        } return [n, r, s || i]
    }
}

function ut(e, t, r) {
    let n, s, i = r; for (let r of e.fields) {
        let e = r.localName; if (r.oneof) { const o = i[r.oneof]; if (void 0 === o) continue; if (n = o[e], s = t[r.oneof], s.oneofKind = o.oneofKind, void 0 === n) { delete s[e]; continue } } else if (n = i[e], s = t, void 0 === n) continue; switch (r.kind) {
            case "scalar":
            case "enum":
                r.repeat ? s[e] = n.concat() : s[e] = n; break;
            case "message":
                let t = r.T(); if (r.repeat)
                    for (let r = 0; r < n.length; r++) s[e][r] = t.create(n[r]);
                else void 0 === s[e] ? s[e] = t.create(n) : t.mergePartial(s[e], n); break;
            case "map":
                switch (r.V.kind) {
                    case "scalar":
                    case "enum":
                        Object.assign(s[e], n); break;
                    case "message":
                        let t = r.V.T(); for (let r of Object.keys(n)) s[e][r] = t.create(n[r])
                }
        }
    }
}
const ct = Object.values;

function ht(e, t, r) {
    if (t === r) return !0; if (e !== _e.BYTES) return !1; let n = t,
        s = r; if (n.length !== s.length) return !1; for (let e = 0; e < n.length; e++)
        if (n[e] != s[e]) return !1;
    return !0
}

function mt(e, t, r) {
    if (t.length !== r.length) return !1; for (let n = 0; n < t.length; n++)
        if (!ht(e, t[n], r[n])) return !1;
    return !0
}

function dt(e, t, r) {
    if (t.length !== r.length) return !1; for (let n = 0; n < t.length; n++)
        if (!e.equals(t[n], r[n])) return !1;
    return !0
}
class pt {
    constructor(e, t, r) { this.defaultCheckDepth = 16, this.typeName = e, this.fields = t.map(tt), this.options = null != r ? r : {}, this.refTypeCheck = new nt(this), this.refJsonReader = new it(this), this.refJsonWriter = new ot(this), this.refBinReader = new lt(this), this.refBinWriter = new ft(this) }
    create(e) {
        let t = function (e) {
            const t = {};
            Object.defineProperty(t, Ye, { enumerable: !1, value: e }); for (let r of e.fields) {
                let e = r.localName; if (!r.opt)
                    if (r.oneof) t[r.oneof] = { oneofKind: void 0 };
                    else if (r.repeat) t[e] = [];
                    else switch (r.kind) {
                        case "scalar":
                            t[e] = at(r.T, r.L); break;
                        case "enum":
                            t[e] = 0; break;
                        case "map":
                            t[e] = {}
                    }
            } return t
        }(this); return void 0 !== e && ut(this, t, e), t
    }
    clone(e) { let t = this.create(); return ut(this, t, e), t }
    equals(e, t) {
        return function (e, t, r) {
            if (t === r) return !0; if (!t || !r) return !1; for (let n of e.fields) {
                let e = n.localName,
                s = n.oneof ? t[n.oneof][e] : t[e],
                i = n.oneof ? r[n.oneof][e] : r[e]; switch (n.kind) {
                    case "enum":
                    case "scalar":
                        let e = "enum" == n.kind ? _e.INT32 : n.T; if (!(n.repeat ? mt(e, s, i) : ht(e, s, i))) return !1; break;
                    case "map":
                        if (!("message" == n.V.kind ? dt(n.V.T(), ct(s), ct(i)) : mt("enum" == n.V.kind ? _e.INT32 : n.V.T, ct(s), ct(i)))) return !1; break;
                    case "message":
                        let t = n.T(); if (!(n.repeat ? dt(t, s, i) : t.equals(s, i))) return !1
                }
            } return !0
        }(this, e, t)
    }
    is(e, t = this.defaultCheckDepth) { return this.refTypeCheck.is(e, t, !1) }
    isAssignable(e, t = this.defaultCheckDepth) { return this.refTypeCheck.is(e, t, !0) }
    mergePartial(e, t) { ut(this, e, t) }
    fromBinary(e, t) { let r = function (e) { return e ? de(de({}, Ce), e) : Ce }(t); return this.internalBinaryRead(r.readerFactory(e), e.byteLength, r) }
    fromJson(e, t) { return this.internalJsonRead(e, function (e) { return e ? de(de({}, Ze), e) : Ze }(t)) }
    fromJsonString(e, t) { let r = JSON.parse(e); return this.fromJson(r, t) }
    toJson(e, t) { return this.internalJsonWrite(e, Pe(t)) }
    toJsonString(e, t) { var r; let n = this.toJson(e, t); return JSON.stringify(n, null, null != (r = null == t ? void 0 : t.prettySpaces) ? r : 0) }
    toBinary(e, t) { let r = function (e) { return e ? de(de({}, Ke), e) : Ke }(t); return this.internalBinaryWrite(e, r.writerFactory(), r).finish() }
    internalJsonRead(e, t, r) { if (null !== e && "object" == typeof e && !Array.isArray(e)) { let n = null != r ? r : this.create(); return this.refJsonReader.read(e, n, t), n } throw new Error(`Unable to parse message ${this.typeName} from JSON ${pe(e)}.`) }
    internalJsonWrite(e, t) { return this.refJsonWriter.write(e, t) }
    internalBinaryWrite(e, t, r) { return this.refBinWriter.write(e, t, r), t }
    internalBinaryRead(e, t, r, n) { let s = null != n ? n : this.create(); return this.refBinReader.read(e, s, r, t), s }
}
const MESSAGE_TYPE = Ye,
    MessageType = pt,
    UnknownFieldHandler = Xe,
    WireType = $e,
    isJsonObject = ge,
    jsonWriteOptions = Pe,
    reflectionMergePartial = ut,
    typeofJsonValue = pe;
// eg: npx protoc --ts_out data --ts_opt output_javascript_es2015 --proto_path data data/dynamic/dynamic.proto
var DynamicType;
! function (e) { e[e.dyn_none = 0] = "dyn_none", e[e.forward = 1] = "forward", e[e.av = 2] = "av", e[e.pgc = 3] = "pgc", e[e.courses = 4] = "courses", e[e.fold = 5] = "fold", e[e.word = 6] = "word", e[e.draw = 7] = "draw", e[e.article = 8] = "article", e[e.music = 9] = "music", e[e.common_square = 10] = "common_square", e[e.common_vertical = 11] = "common_vertical", e[e.live = 12] = "live", e[e.medialist = 13] = "medialist", e[e.courses_season = 14] = "courses_season", e[e.ad = 15] = "ad", e[e.applet = 16] = "applet", e[e.subscription = 17] = "subscription", e[e.live_rcmd = 18] = "live_rcmd", e[e.banner = 19] = "banner", e[e.ugc_season = 20] = "ugc_season", e[e.subscription_new = 21] = "subscription_new" }(DynamicType || (DynamicType = {}));
class DynamicItem$Type extends MessageType {
    constructor() { super("b.DynamicItem", [{ no: 1, name: "card_type", kind: "enum", T: () => ["b.DynamicType", DynamicType] }]) }
    create(e) { const n = { cardType: 0 }; return globalThis.Object.defineProperty(n, MESSAGE_TYPE, { enumerable: !1, value: this }), void 0 !== e && reflectionMergePartial(this, n, e), n }
    internalBinaryRead(e, n, t, i) {
        let r = null != i ? i : this.create(),
        a = e.pos + n; for (; e.pos < a;) {
            let [n, i] = e.tag(); switch (n) {
                case 1:
                    r.cardType = e.int32(); break;
                default:
                    let a = t.readUnknownField; if ("throw" === a) throw new globalThis.Error(`Unknown field ${n} (wire type ${i}) for ${this.typeName}`); let o = e.skip(i); !1 !== a && (!0 === a ? UnknownFieldHandler.onRead : a)(this.typeName, r, n, i, o)
            }
        } return r
    }
    internalBinaryWrite(e, n, t) { 0 !== e.cardType && n.tag(1, WireType.Varint).int32(e.cardType); let i = t.writeUnknownFields; return !1 !== i && (1 == i ? UnknownFieldHandler.onWrite : i)(this.typeName, e, n), n }
}
const DynamicItem = new DynamicItem$Type;
class DynAllReply$Type extends MessageType {
    constructor() { super("b.DynAllReply", [{ no: 1, name: "dynamic_list", kind: "message", T: () => DynamicList }]) }
    create(e) { const n = {}; return globalThis.Object.defineProperty(n, MESSAGE_TYPE, { enumerable: !1, value: this }), void 0 !== e && reflectionMergePartial(this, n, e), n }
    internalBinaryRead(e, n, t, i) {
        let r = null != i ? i : this.create(),
        a = e.pos + n; for (; e.pos < a;) {
            let [n, i] = e.tag(); switch (n) {
                case 1:
                    r.dynamicList = DynamicList.internalBinaryRead(e, e.uint32(), t, r.dynamicList); break;
                default:
                    let a = t.readUnknownField; if ("throw" === a) throw new globalThis.Error(`Unknown field ${n} (wire type ${i}) for ${this.typeName}`); let o = e.skip(i); !1 !== a && (!0 === a ? UnknownFieldHandler.onRead : a)(this.typeName, r, n, i, o)
            }
        } return r
    }
    internalBinaryWrite(e, n, t) { e.dynamicList && DynamicList.internalBinaryWrite(e.dynamicList, n.tag(1, WireType.LengthDelimited).fork(), t).join(); let i = t.writeUnknownFields; return !1 !== i && (1 == i ? UnknownFieldHandler.onWrite : i)(this.typeName, e, n), n }
}
const DynAllReply = new DynAllReply$Type;
class DynamicList$Type extends MessageType {
    constructor() { super("b.DynamicList", [{ no: 1, name: "list", kind: "message", repeat: 1, T: () => DynamicItem }]) }
    create(e) { const n = { list: [] }; return globalThis.Object.defineProperty(n, MESSAGE_TYPE, { enumerable: !1, value: this }), void 0 !== e && reflectionMergePartial(this, n, e), n }
    internalBinaryRead(e, n, t, i) {
        let r = null != i ? i : this.create(),
        a = e.pos + n; for (; e.pos < a;) {
            let [n, i] = e.tag(); switch (n) {
                case 1:
                    r.list.push(DynamicItem.internalBinaryRead(e, e.uint32(), t)); break;
                default:
                    let a = t.readUnknownField; if ("throw" === a) throw new globalThis.Error(`Unknown field ${n} (wire type ${i}) for ${this.typeName}`); let o = e.skip(i); !1 !== a && (!0 === a ? UnknownFieldHandler.onRead : a)(this.typeName, r, n, i, o)
            }
        } return r
    }
    internalBinaryWrite(e, n, t) { for (let i = 0; i < e.list.length; i++) DynamicItem.internalBinaryWrite(e.list[i], n.tag(1, WireType.LengthDelimited).fork(), t).join(); let i = t.writeUnknownFields; return !1 !== i && (1 == i ? UnknownFieldHandler.onWrite : i)(this.typeName, e, n), n }
}
const DynamicList = new DynamicList$Type;
let body = $response.body;
// 解压 gzip
let data = gunzipSync(body.slice(5));
// 解码
let message = DynAllReply.fromBinary(data, { readUnknownField: true });
// 修改数据后编码
// console.log(message.dynamicList.list.length);
// 15 时候 i.toJSON().cardType 为 ad
message.dynamicList.list = message.dynamicList.list.filter(element => !(element.cardType === 15));
// console.log(message.dynamicList.list.length);
data = DynAllReply.toBinary(message);
// 压缩
let gzip_data = gzipSync(data, { level: 0, mtime: 0 }); // 速度最快；Uint8Array
// 校验
let gzip_data_len = gzip_data.length;
let new_body = new Uint8Array(5 + gzip_data_len);
new_body.set(Uint8Array.from([...body.slice(0, 2), (gzip_data_len >> 16) & 0xff, (gzip_data_len >> 8) & 0xff, gzip_data_len & 0xff]), 0);
new_body.set(gzip_data, 5);
$done({ body: new_body });