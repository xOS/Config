'use strict'

const compile = require('@adguard/hostlist-compiler')
const { join } = require('path')
const https = require('https')
const fs = require('fs-extra')
//const slugify = require('@sindresorhus/slugify')

const distDir = join(__dirname, '../../RuleSet/AdRules')
const advertisingListPath = join(__dirname, '../../RuleSet/Advertising.list')
const wildcardSectionStart = '# === AUTO-GENERATED: ADRULES WILDCARD START ==='
const wildcardSectionEnd = '# === AUTO-GENERATED: ADRULES WILDCARD END ==='
const configurations = [{
    name: 'Adaway',
    homepage: 'https://adaway.org',
    sources: [{
        source: 'https://adaway.org/hosts.txt',
        type: 'hosts',
    },],
    transformations: [
        'RemoveComments',
        'RemoveModifiers',
        'Compress',
        'Validate',
        'Deduplicate',
    ],
},
{
    name: 'neohosts',
    homepage: 'https://github.com/neoFelhz/neohosts',
    sources: [{
        source: 'https://cdn.jsdelivr.net/gh/neoFelhz/neohosts@gh-pages/basic/hosts',
        type: 'hosts',
    },],
    transformations: [
        'RemoveComments',
        'RemoveModifiers',
        'Compress',
        'Validate',
        'Deduplicate',
    ],
},
{
    name: 'TrackingProtection',
    sources: [{
        source: 'https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/filter_3_Spyware/filter.txt',
    },],
    transformations: [
        'RemoveComments',
        'RemoveModifiers',
        'Validate',
        'Deduplicate',
    ],
},
{
    name: 'Chinese',
    sources: [{
        source: 'https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/filter_224_Chinese/filter.txt',
    },],
    transformations: [
        'RemoveComments',
        'RemoveModifiers',
        'Validate',
        'Deduplicate',
    ],
},
{
    name: 'Annoyances',
    sources: [{
        source: 'https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/filter_14_Annoyances/filter.txt',
    },],
    transformations: [
        'RemoveComments',
        'RemoveModifiers',
        'Validate',
        'Deduplicate',
    ],
},
{
    name: 'Base',
    sources: [{
        source: 'https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/filter_2_Base/filter.txt',
    },],
    transformations: [
        'RemoveComments',
        'RemoveModifiers',
        'Validate',
        'Deduplicate',
    ],
},
{
    name: 'SocialMedia',
    sources: [{
        source: 'https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/filter_4_Social/filter.txt',
    },],
    transformations: [
        'RemoveComments',
        'RemoveModifiers',
        'Validate',
        'Deduplicate',
    ],
},
{
    name: 'DNS',
    sources: [{
        source: 'https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/filter_15_DnsFilter/filter.txt',
    },],
    transformations: [
        'RemoveComments',
        'RemoveModifiers',
        'Validate',
        'Deduplicate',
    ],
},
{
    name: 'EasyList',
    sources: [{
        source: 'https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/ThirdParty/filter_101_EasyList/filter.txt',
    },],
    transformations: [
        'RemoveComments',
        'RemoveModifiers',
        'Validate',
        'Deduplicate',
    ],
},
{
    name: 'EasyListChina',
    sources: [{
        source: 'https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/ThirdParty/filter_104_EasyListChina/filter.txt',
    },],
    transformations: [
        'RemoveComments',
        'RemoveModifiers',
        'Validate',
        'Deduplicate',
    ],
},
{
    name: 'EasyPrivacy',
    sources: [{
        source: 'https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/ThirdParty/filter_118_EasyPrivacy/filter.txt',
    },],
    transformations: [
        'RemoveComments',
        'RemoveModifiers',
        'Validate',
        'Deduplicate',
    ],
},
{
    name: 'AdBlockID',
    sources: [{
        source: 'https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/ThirdParty/filter_120_AdBlockID/filter.txt',
    },],
    transformations: [
        'RemoveComments',
        'RemoveModifiers',
        'Validate',
        'Deduplicate',
    ],
},
{
    name: 'ChinaListAndEasyList',
    sources: [{
        source: 'https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/ThirdParty/filter_219_ChinaListAndEasyList/filter.txt',
    },],
    transformations: [
        'RemoveComments',
        'RemoveModifiers',
        'Validate',
        'Deduplicate',
    ],
},
{
    name: 'FanboysAnnoyances',
    sources: [{
        source: 'https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/ThirdParty/filter_122_FanboysAnnoyances/filter.txt',
    },],
    transformations: [
        'RemoveComments',
        'RemoveModifiers',
        'Validate',
        'Deduplicate',
    ],
},
{
    name: 'CJXsAnnoyanceList',
    sources: [{
        source: 'https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/ThirdParty/filter_220_CJXsAnnoyanceList/filter.txt',
    },],
    transformations: [
        'RemoveComments',
        'RemoveModifiers',
        'Validate',
        'Deduplicate',
    ],
},
]

const cosmeticMarkers = ['##', '#@#', '#?#', '#$#', '#%#']

function fetchText(sourceUrl) {
    return new Promise((resolve, reject) => {
        https
            .get(sourceUrl, (res) => {
                const { statusCode, headers } = res

                if (statusCode >= 300 && statusCode < 400 && headers.location) {
                    const redirectUrl = new URL(headers.location, sourceUrl).href

                    res.resume()
                    resolve(fetchText(redirectUrl))
                    return
                }

                if (statusCode !== 200) {
                    res.resume()
                    reject(new Error(`Failed to fetch ${sourceUrl}: ${statusCode}`))
                    return
                }

                res.setEncoding('utf8')

                let body = ''

                res.on('data', (chunk) => {
                    body += chunk
                })

                res.on('end', () => {
                    resolve(body)
                })
            })
            .on('error', reject)
    })
}

function normalizeDomain(domain) {
    return domain.trim().replace(/^\.+/, '').replace(/\.+$/, '').toLowerCase()
}

function isIpAddress(value) {
    return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(value) || value.includes(':')
}

function extractRuleDomain(rule) {
    if (!rule.startsWith('||')) {
        return null
    }

    const match = rule.slice(2).match(/^[^/^$*|?]+/)

    if (!match) {
        return null
    }

    const domain = normalizeDomain(match[0])

    if (!domain) {
        return null
    }

    return domain
}

function collectDomainsFromHosts(text) {
    const domains = new Set()

    for (const rawLine of text.split(/\r?\n/)) {
        const line = rawLine.split('#')[0].trim()

        if (!line) {
            continue
        }

        const parts = line.split(/\s+/).filter(Boolean)

        if (parts.length < 2) {
            const host = normalizeDomain(parts[0])

            if (host && !isIpAddress(host)) {
                domains.add(host)
            }

            continue
        }

        for (const host of parts.slice(1)) {
            const normalized = normalizeDomain(host)

            if (normalized && !isIpAddress(normalized)) {
                domains.add(normalized)
            }
        }
    }

    return domains
}

function collectDomainsFromFilters(text) {
    const domains = new Set()

    for (const rawLine of text.split(/\r?\n/)) {
        const line = rawLine.trim()

        if (
            !line ||
            line.startsWith('!') ||
            line.startsWith('#') ||
            line.startsWith('[') ||
            line.startsWith('@@') ||
            cosmeticMarkers.some((marker) => line.includes(marker))
        ) {
            continue
        }

        const domain = extractRuleDomain(line)

        if (domain) {
            domains.add(domain)
        }
    }

    return domains
}

async function collectAllowedDomains(config) {
    const domains = new Set()
    const sourceTexts = await Promise.all(
        config.sources.map((source) => fetchText(source.source)),
    )

    for (let index = 0; index < config.sources.length; index += 1) {
        const source = config.sources[index]
        const text = sourceTexts[index]
        const sourceDomains = source.type === 'hosts'
            ? collectDomainsFromHosts(text)
            : collectDomainsFromFilters(text)

        for (const domain of sourceDomains) {
            domains.add(domain)
        }
    }

    return domains
}

function formatRule(rule) {
    const reg = /^\|\|([^/^$*|?]+)\^$/

    if (!reg.test(rule)) {
        return
    }

    const domain = normalizeDomain(rule.match(reg)[1])

    return '.' + domain
}

function formatWildcardRule(rule) {
    const reg = /^\|\|([^/^$|?]*\*[^/^$|?]*)\^$/

    if (!reg.test(rule)) {
        return
    }

    const domain = normalizeDomain(rule.match(reg)[1])

    return domain || undefined
}

async function updateAdvertisingWildcardRules(wildcardDomains) {
    const wildcardLines = [...wildcardDomains]
        .sort((a, b) => a.localeCompare(b))
        .map((domain) => `DOMAIN-WILDCARD,${domain}`)

    const sectionBody = wildcardLines.join('\n')
    const section = [
        wildcardSectionStart,
        sectionBody,
        wildcardSectionEnd,
    ]
        .filter(Boolean)
        .join('\n')

    const current = await fs.readFile(advertisingListPath, 'utf8')
    const escapedStart = wildcardSectionStart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const escapedEnd = wildcardSectionEnd.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const sectionReg = new RegExp(`${escapedStart}[\\s\\S]*?${escapedEnd}`, 'm')

    let next

    if (sectionReg.test(current)) {
        next = current.replace(sectionReg, section)
    }
    else {
        const lines = current.split(/\r?\n/)

        lines.splice(1, 0, section, '')
        next = lines.join('\n').replace(/\n*$/, '\n')
    }

    await fs.writeFile(advertisingListPath, next)
}

async function outputCompiled(config, compiled, allowedDomains, wildcardDomains) {
    const fileName = `${config.name}.list`
    const dest = join(distDir, fileName)
    const lines = []

    for (const rule of compiled) {
        const wildcardDomain = formatWildcardRule(rule)

        if (wildcardDomain) {
            wildcardDomains.add(wildcardDomain)
        }

        const formatted = formatRule(rule)

        if (formatted && allowedDomains.has(formatted.slice(1))) {
            lines.push(formatted)
        }
    }

    await fs.outputFile(dest, lines.length ? `${lines.join('\n')}\n` : '')
}

async function main() {
    const wildcardDomains = new Set()

    for (const config of configurations) {
        const [compiled, allowedDomains] = await Promise.all([
            compile(config),
            collectAllowedDomains(config),
        ])

        await outputCompiled(config, compiled, allowedDomains, wildcardDomains)
    }

    await updateAdvertisingWildcardRules(wildcardDomains)
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})