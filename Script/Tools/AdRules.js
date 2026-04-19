'use strict'

const compile = require('@adguard/hostlist-compiler')
const { join } = require('path')
const https = require('https')
const fs = require('fs-extra')

function normalizeGeneratedRuleExcludeKeywords(keywords) {
    if (!Array.isArray(keywords)) {
        return []
    }

    return [...new Set(keywords
        .filter((keyword) => typeof keyword === 'string')
        .map((keyword) => keyword.trim().toLowerCase())
        .filter((keyword) => keyword !== ''))]
}

function normalizeGeneratedRuleExcludeValue(value) {
    if (typeof value !== 'string') {
        return ''
    }

    return value.trim().toLowerCase()
}

function buildGeneratedRuleExcludeMatcher(pattern) {
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&')
    const wildcardAsRegex = escaped
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.')

    return new RegExp(wildcardAsRegex)
}

function buildGeneratedRuleExcludeMatchers(keywords) {
    return normalizeGeneratedRuleExcludeKeywords(keywords)
        .map((pattern) => buildGeneratedRuleExcludeMatcher(pattern))
}

function shouldExcludeGeneratedRuleByMatchers(value, matchers) {
    const normalized = normalizeGeneratedRuleExcludeValue(value)

    if (!normalized) {
        return false
    }

    const safeMatchers = Array.isArray(matchers) ? matchers : []

    return safeMatchers.some((matcher) => matcher.test(normalized))
}

const distDir = join(__dirname, '../../RuleSet/AdRules')
const advertisingListPath = join(__dirname, '../../RuleSet/Advertising.list')
const adRuleListPath = join(__dirname, '../../RuleSet/AdRule.list')
const wildcardSectionStart = '# === AUTO-GENERATED: ADRULES WILDCARD START ==='
const wildcardSectionEnd = '# === AUTO-GENERATED: ADRULES WILDCARD END ==='
const advertisingSectionStart = '# === AUTO-GENERATED: ADVERTISING MIGRATED START ==='
const advertisingSectionEnd = '# === AUTO-GENERATED: ADVERTISING MIGRATED END ==='
const upstreamSectionStart = '# === AUTO-GENERATED: UPSTREAM RULES START ==='
const upstreamSectionEnd = '# === AUTO-GENERATED: UPSTREAM RULES END ==='

const generatedRuleExcludeKeywords = [
    '*by_*-*.skk.moe',
]

const standardTransformations = [
    'RemoveComments',
    'RemoveModifiers',
    'Validate',
    'Deduplicate',
]

const hostsTransformations = [
    'RemoveComments',
    'RemoveModifiers',
    'Compress',
    'Validate',
    'Deduplicate',
]

const adguardFiltersBaseUrl =
    'https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/refs/heads/master/filters'

function buildAdguardFilterSource(filterId, filterName, isThirdParty = false) {
    const thirdPartyPath = isThirdParty ? 'ThirdParty/' : ''

    return `${adguardFiltersBaseUrl}/${thirdPartyPath}filter_${filterId}_${filterName}/filter.txt`
}

function createConfiguration({
    name,
    source,
    type,
    homepage,
    transformations = standardTransformations,
}) {
    const sourceEntry = { source }

    if (type) {
        sourceEntry.type = type
    }

    const config = {
        name,
        sources: [sourceEntry],
        transformations: [...transformations],
    }

    if (homepage) {
        config.homepage = homepage
    }

    return config
}

const thirdPartyAdguardFilterDefs = [
    { filterId: 101, filterName: 'EasyList', name: 'EasyList' },
    { filterId: 104, filterName: 'EasyListChina', name: 'EasyListChina' },
    { filterId: 219, filterName: 'ChinaListAndEasyList', name: 'ChinaListAndEasyList' },
    { filterId: 102, filterName: 'ABPindo', name: 'ABPindo' },
    { filterId: 120, filterName: 'AdBlockID', name: 'AdBlockID' },
    { filterId: 118, filterName: 'EasyPrivacy', name: 'EasyPrivacy' },
    { filterId: 209, filterName: 'ADgkMobileChinalist', name: 'ADgkMobileChinalist' },
]

const coreAdguardFilterDefs = [
    { filterId: 11, filterName: 'Mobile', name: 'Mobile' },
    { filterId: 14, filterName: 'Annoyances', name: 'Annoyances' },
    { filterId: 15, filterName: 'DnsFilter', name: 'DNS' },
    { filterId: 20, filterName: 'Annoyances_MobileApp', name: 'AnnoyancesMobileApp' },
    { filterId: 21, filterName: 'Annoyances_Other', name: 'AnnoyancesOther' },
    { filterId: 224, filterName: 'Chinese', name: 'Chinese' },
    { filterId: 2, filterName: 'Base', name: 'Base' },
    { filterId: 3, filterName: 'Spyware', name: 'Spyware' },
    { filterId: 4, filterName: 'Social', name: 'SocialMedia' },
    { filterId: 17, filterName: 'TrackParam', name: 'TrackParam' },
]

const configurations = [
    createConfiguration({
        name: 'Adaway',
        homepage: 'https://adaway.org',
        source: 'https://adaway.org/hosts.txt',
        type: 'hosts',
        transformations: hostsTransformations,
    }),
    createConfiguration({
        name: 'AdblockPlusEasylistChina',
        source: 'https://easylist-downloads.adblockplus.org/easylistchina+easylist.txt',
    }),
    createConfiguration({
        name: 'SomeoneWhoCares',
        source: 'https://someonewhocares.org/hosts/hosts',
        type: 'hosts',
        transformations: hostsTransformations,
    }),
    ...thirdPartyAdguardFilterDefs.map((def) => createConfiguration({
        name: def.name,
        source: buildAdguardFilterSource(def.filterId, def.filterName, true),
    })),
    ...coreAdguardFilterDefs.map((def) => createConfiguration({
        name: def.name,
        source: buildAdguardFilterSource(def.filterId, def.filterName),
    })),
    createConfiguration({
        name: 'AntiAdBlock',
        source: 'https://easylist-downloads.adblockplus.org/antiadblockfilters.txt',
    }),
    createConfiguration({
        name: 'uBlockOrigin',
        source: 'https://ublockorigin.github.io/uAssetsCDN/filters/filters.min.txt',
    }),
    createConfiguration({
        name: 'uBlockOriginEasylistAnnoyances',
        source: 'https://ublockorigin.github.io/uAssetsCDN/thirdparties/easylist-annoyances.txt',
    }),
]

function sanitizeListBaseName(value) {
    if (!value) {
        return null
    }

    const withoutPrefix = value.trim().replace(/^filter_\d+_/i, '')
    const cleaned = withoutPrefix.replace(/[\\/:*?"<>|]/g, '_')

    return cleaned || null
}

function extractFilterNameFromUrl(sourceUrl) {
    let pathname = ''

    try {
        pathname = new URL(sourceUrl).pathname
    } catch (error) {
        return null
    }

    const match = pathname.match(/\/filter_\d+_([^/]+)\/filter\.txt$/i)

    if (!match) {
        return null
    }

    try {
        return sanitizeListBaseName(decodeURIComponent(match[1]))
    } catch (error) {
        return sanitizeListBaseName(match[1])
    }
}

function resolveListBaseName(configName, sourceUrl) {
    const upstreamName = extractFilterNameFromUrl(sourceUrl)

    if (upstreamName) {
        return upstreamName
    }

    const fromConfig = sanitizeListBaseName(configName)

    if (fromConfig) {
        return fromConfig
    }

    let pathname = ''

    try {
        pathname = new URL(sourceUrl).pathname
    } catch (error) {
        return null
    }

    const segments = pathname.split('/').filter(Boolean)

    if (segments.length === 0) {
        return null
    }

    const lastSegment = segments[segments.length - 1]

    if (/\.txt$/i.test(lastSegment)) {
        return sanitizeListBaseName(lastSegment.replace(/\.txt$/i, ''))
    }

    return sanitizeListBaseName(lastSegment)
}

function buildCompilationConfigs() {
    const listNameToSource = new Map()
    const expandedConfigs = []

    for (const config of configurations) {
        const sourceEntries = Array.isArray(config.sources) ? config.sources : []

        for (const source of sourceEntries) {
            const listName = resolveListBaseName(config.name, source.source)

            if (!listName) {
                throw new Error(`Unable to derive list file name from source: ${source.source}`)
            }

            const existingSource = listNameToSource.get(listName)

            if (existingSource) {
                throw new Error(
                    `Duplicate output list name "${listName}" detected for sources:\n- ${existingSource}\n- ${source.source}`,
                )
            }

            listNameToSource.set(listName, source.source)

            expandedConfigs.push({
                ...config,
                name: listName,
                sources: [source],
            })
        }
    }

    return expandedConfigs
}

async function pruneGeneratedListFiles(compilationConfigs) {
    const expectedListFiles = new Set(
        compilationConfigs.map((config) => `${config.name}.list`),
    )

    expectedListFiles.add('Bypass.list')

    const entries = await fs.readdir(distDir)
    const staleFiles = entries.filter((entry) => (
        entry.endsWith('.list') &&
        !expectedListFiles.has(entry)
    ))

    await Promise.all(
        staleFiles.map((fileName) => fs.remove(join(distDir, fileName))),
    )
}

const cosmeticMarkers = ['##', '#@#', '#?#', '#$#', '#%#']

const unsupportedConversionModifiers = new Set([
    'popup',
    'cname',
    'third-party',
    'domain=',
])

function splitRule(rule) {
    const trimmed = rule.trim()
    const dollarIndex = trimmed.indexOf('$')

    if (dollarIndex === -1) {
        return {
            body: trimmed,
            options: '',
        }
    }

    return {
        body: trimmed.slice(0, dollarIndex),
        options: trimmed.slice(dollarIndex + 1),
    }
}

function hasUnsupportedConversionModifiers(options) {
    if (!options) {
        return false
    }

    return options
        .split(',')
        .map((option) => option.trim().toLowerCase())
        .some((option) =>
            unsupportedConversionModifiers.has(option) ||
            option.startsWith('domain='),
        )
}

function canUseWhitelistAsDomainBlock(options) {
    if (!options) {
        return true
    }

    return options
        .split(',')
        .map((option) => option.trim().toLowerCase())
        .every((option) => option === 'document')
}

function extractRuleTarget(rule) {
    const { body } = splitRule(rule)

    if (body.startsWith('||')) {
        const match = body.slice(2).match(/^[^/^$*|?]+/)

        if (!match) {
            return null
        }

        const domain = normalizeDomain(match[0])
        const rest = body.slice(2 + match[0].length)

        if (!domain || domain.includes('*') || (rest && rest !== '^')) {
            return null
        }

        return {
            domain,
            type: 'suffix',
        }
    }

    const schemeIndex = body.indexOf('://')

    if (schemeIndex === -1) {
        return null
    }

    const hostPart = body.slice(schemeIndex + 3)
    const match = hostPart.match(/^[^/^$*|?]+/)

    if (!match) {
        return null
    }

    const domain = normalizeDomain(match[0])
    const rest = hostPart.slice(match[0].length)

    if (!domain || domain.includes('*') || rest) {
        return null
    }

    return {
        domain,
        type: 'host',
    }
}

function isBlockedByWhitelist(domain, blockedDomains) {
    for (const blockedDomain of blockedDomains) {
        if (domain === blockedDomain || domain.endsWith(`.${blockedDomain}`)) {
            return true
        }
    }

    return false
}

function isWhitelistRule(rule) {
    return rule.trim().startsWith('@@')
}

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

function stripInlineCommentAndTrim(rawLine) {
    return rawLine.split('#')[0].trim()
}

const normalizedGeneratedRuleExcludeMatchers = buildGeneratedRuleExcludeMatchers(
    generatedRuleExcludeKeywords,
)

function shouldExcludeGeneratedRule(value) {
    return shouldExcludeGeneratedRuleByMatchers(value, normalizedGeneratedRuleExcludeMatchers)
}

function isRealDomainLike(value) {
    const domain = normalizeDomain(value)

    if (!domain || !domain.includes('.')) {
        return false
    }

    return domain.split('.').every((label) => (
        label.length > 0 &&
        label.length <= 63 &&
        /^[a-z0-9-]+$/.test(label) &&
        !label.startsWith('-') &&
        !label.endsWith('-')
    ))
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

function collectDomainsFromHosts(text, blockedDomains) {
    const domains = new Set()

    for (const rawLine of text.split(/\r?\n/)) {
        const line = stripInlineCommentAndTrim(rawLine)

        if (!line) {
            continue
        }

        if (shouldExcludeGeneratedRule(line)) {
            continue
        }

        const parts = line.split(/\s+/).filter(Boolean)

        if (parts.length < 2) {
            const host = normalizeDomain(parts[0])

            if (host && !isIpAddress(host) && !shouldExcludeGeneratedRule(host)) {
                domains.add(host)
            }

            continue
        }

        for (const host of parts.slice(1)) {
            const normalized = normalizeDomain(host)

            if (
                normalized &&
                !isIpAddress(normalized) &&
                !isBlockedByWhitelist(normalized, blockedDomains) &&
                !shouldExcludeGeneratedRule(normalized)
            ) {
                domains.add(normalized)
            }
        }
    }

    return domains
}

function collectDomainsFromFilters(text, blockedDomains) {
    const domains = new Set()

    for (const rawLine of text.split(/\r?\n/)) {
        const line = rawLine.trim()
        const rule = line.startsWith('@@') ? line.slice(2) : line
        const { options } = splitRule(rule)

        if (
            !line ||
            line.startsWith('!') ||
            line.startsWith('#') ||
            line.startsWith('[') ||
            cosmeticMarkers.some((marker) => line.includes(marker))
        ) {
            continue
        }

        if (shouldExcludeGeneratedRule(line)) {
            continue
        }

        const target = extractRuleTarget(rule)

        if (!target) {
            continue
        }

        if (isWhitelistRule(line)) {
            if (canUseWhitelistAsDomainBlock(options) && !shouldExcludeGeneratedRule(target.domain)) {
                blockedDomains.add(target.domain)
            }

            continue
        }

        if (
            hasUnsupportedConversionModifiers(options) ||
            isBlockedByWhitelist(target.domain, blockedDomains) ||
            shouldExcludeGeneratedRule(target.domain)
        ) {
            continue
        }

        domains.add(target.domain)
    }

    return domains
}

async function collectAllowedDomains(config) {
    const domains = new Set()
    const blockedDomains = new Set()
    const sourceTexts = await Promise.all(
        config.sources.map((source) => fetchText(source.source)),
    )

    for (let index = 0; index < config.sources.length; index += 1) {
        const source = config.sources[index]
        const text = sourceTexts[index]
        const sourceDomains = source.type === 'hosts'
            ? collectDomainsFromHosts(text, blockedDomains)
            : collectDomainsFromFilters(text, blockedDomains)

        for (const domain of sourceDomains) {
            domains.add(domain)
        }
    }

    return domains
}

function formatRule(rule, sourceType) {
    const suffixReg = /^\|\|([^/^$*|?]+)\^?$/

    if (suffixReg.test(rule)) {
        const domain = normalizeDomain(rule.match(suffixReg)[1])

        if (!isRealDomainLike(domain)) {
            return
        }

        if (shouldExcludeGeneratedRule(domain)) {
            return
        }

        if (sourceType === 'hosts') {
            return {
                domain,
                output: domain,
            }
        }

        return {
            domain,
            output: `.${domain}`,
        }
    }

    const exactReg = /:\/\/([^/^$*|?]+)\/?$/

    if (!exactReg.test(rule)) {
        return
    }

    const domain = rule.match(exactReg)[1]

    if (!isRealDomainLike(domain)) {
        return
    }

    if (shouldExcludeGeneratedRule(domain)) {
        return
    }

    return {
        domain: normalizeDomain(domain),
        output: normalizeDomain(domain),
    }
}

function formatWildcardRule(rule) {
    const reg = /^\|\|([^/^$|?]*\*[^/^$|?]*)\^$/

    if (!reg.test(rule)) {
        return
    }

    const domain = normalizeDomain(rule.match(reg)[1])

    if (!domain || shouldExcludeGeneratedRule(domain)) {
        return undefined
    }

    return domain
}

function collectAdvertisingRules(text) {
    const rules = new Set()

    for (const rawLine of text.split(/\r?\n/)) {
        const line = stripInlineCommentAndTrim(rawLine)

        if (!line) {
            continue
        }

        if (shouldExcludeGeneratedRule(line)) {
            continue
        }

        const match = line.match(/^(DOMAIN|DOMAIN-SUFFIX),(.+)$/)

        if (!match) {
            continue
        }

        const domain = normalizeDomain(match[2])

        if (!isRealDomainLike(domain) || isIpAddress(domain)) {
            continue
        }

        if (shouldExcludeGeneratedRule(domain)) {
            continue
        }

        rules.add(match[1] === 'DOMAIN' ? domain : `.${domain}`)
    }

    return [...rules].sort((left, right) => left.localeCompare(right))
}

function collectAndPruneAdvertisingRules(text) {
    const migratedRules = []
    const nextLines = []
    let removedCount = 0

    for (const rawLine of text.split(/\r?\n/)) {
        const line = stripInlineCommentAndTrim(rawLine)
        const match = line.match(/^(DOMAIN|DOMAIN-SUFFIX),(.+)$/)

        if (!match) {
            nextLines.push(rawLine)
            continue
        }

        if (shouldExcludeGeneratedRule(line)) {
            removedCount += 1
            continue
        }

        const domain = normalizeDomain(match[2])

        if (!isRealDomainLike(domain) || isIpAddress(domain)) {
            nextLines.push(rawLine)
            continue
        }

        if (shouldExcludeGeneratedRule(domain)) {
            removedCount += 1
            continue
        }

        migratedRules.push(match[1] === 'DOMAIN' ? domain : `.${domain}`)
        removedCount += 1
    }

    return {
        migratedRules: sortAndDedupeAdRuleLines(migratedRules),
        cleanedText: removedCount > 0 ? normalizeWhitespace(nextLines.join('\n')) : text,
        removedCount,
    }
}

function normalizeRuleKey(line) {
    return line.replace(/^\./, '')
}

function collectRuleLines(text) {
    const rules = []

    for (const rawLine of text.split(/\r?\n/)) {
        const line = rawLine.trim()

        if (!line || line.startsWith('#')) {
            continue
        }

        if (shouldExcludeGeneratedRule(line)) {
            continue
        }

        rules.push(line)
    }

    return rules
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function extractRulesBetweenMarkers(text, startMarker, endMarker) {
    const markerReg = new RegExp(
        `${escapeRegExp(startMarker)}[\\s\\S]*?${escapeRegExp(endMarker)}`,
        'm',
    )
    const match = text.match(markerReg)

    if (!match) {
        return {
            found: false,
            rules: [],
        }
    }

    const section = match[0]
        .replace(startMarker, '')
        .replace(endMarker, '')

    return {
        found: true,
        rules: collectRuleLines(section),
    }
}

function removeSection(text, startMarker, endMarker) {
    const sectionReg = new RegExp(
        `${escapeRegExp(startMarker)}[\\s\\S]*?${escapeRegExp(endMarker)}\\n?`,
        'g',
    )

    return text.replace(sectionReg, '')
}

function collectLegacyBodyRules(text, customBlock) {
    let bodyText = text

    if (customBlock) {
        bodyText = bodyText.replace(customBlock, '')
    }

    bodyText = removeSection(bodyText, advertisingSectionStart, advertisingSectionEnd)
    bodyText = removeSection(bodyText, upstreamSectionStart, upstreamSectionEnd)

    return collectRuleLines(bodyText)
}

function dedupeUpstreamRules(lines, blockedKeys) {
    const result = []
    const keyIndexMap = new Map()

    for (const rawLine of lines) {
        const line = rawLine.trim()

        if (!line) {
            continue
        }

        const key = normalizeRuleKey(line)

        if (blockedKeys.has(key)) {
            continue
        }

        const existingIndex = keyIndexMap.get(key)

        if (existingIndex === undefined) {
            keyIndexMap.set(key, result.length)
            result.push(line)
            continue
        }

        const existing = result[existingIndex]

        if (!existing.startsWith('.') && line.startsWith('.')) {
            result[existingIndex] = line
        }
    }

    return result
}

async function collectBypassKeys() {
    const bypassPath = join(distDir, 'Bypass.list')
    const bypassKeys = new Set()

    if (!(await fs.pathExists(bypassPath))) {
        return bypassKeys
    }

    const bypassText = await fs.readFile(bypassPath, 'utf8')

    for (const rawLine of bypassText.split(/\r?\n/)) {
        const line = rawLine.trim()

        if (!line || line.startsWith('#')) {
            continue
        }

        bypassKeys.add(normalizeRuleKey(line))
    }

    return bypassKeys
}

function sortAndDedupeAdRuleLines(lines) {
    const selected = new Map()

    for (const rawLine of lines) {
        const line = rawLine.trim()

        if (!line) {
            continue
        }

        const key = normalizeRuleKey(line)
        const existing = selected.get(key)

        if (!existing) {
            selected.set(key, line)
            continue
        }

        const existingPrefers = existing.startsWith('.')
        const nextPrefers = line.startsWith('.')

        if (!existingPrefers && nextPrefers) {
            selected.set(key, line)
        }
    }

    return [...selected.values()].sort((left, right) => {
        const leftKey = normalizeRuleKey(left)
        const rightKey = normalizeRuleKey(right)

        if (leftKey !== rightKey) {
            return leftKey.localeCompare(rightKey)
        }

        if (left.startsWith('.') !== right.startsWith('.')) {
            return left.startsWith('.') ? -1 : 1
        }

        return left.localeCompare(right)
    })
}

function extractCustomEditBlock(text) {
    const markerReg = /# === Custom Edit Area Start ===[\s\S]*?# === Custom Edit Area End ===/
    const match = text.match(markerReg)

    if (match) {
        return match[0].replace(/\n*$/, '\n')
    }

    const lines = text.split(/\r?\n/)
    const headerLines = []
    let hasComment = false

    for (const line of lines) {
        const trimmed = line.trim()

        if (trimmed.startsWith('#')) {
            headerLines.push(line)
            hasComment = true
            continue
        }

        if (trimmed === '' && hasComment) {
            headerLines.push(line)
            continue
        }

        break
    }

    while (headerLines.length > 0 && headerLines[headerLines.length - 1].trim() === '') {
        headerLines.pop()
    }

    return headerLines.join('\n')
}

function buildAdRuleListContent(existingContent, rules) {
    if (Array.isArray(rules)) {
        const header = extractCustomEditBlock(existingContent)
        const body = rules.length ? rules.join('\n') : ''

        if (header && body) {
            return `${header}\n\n${body}\n`
        }

        if (header) {
            return `${header}\n`
        }

        if (body) {
            return `${body}\n`
        }

        return ''
    }

    const header = extractCustomEditBlock(existingContent)
    const sections = rules || {}
    const advertisingRules = sections.advertisingRules || []
    const upstreamRules = sections.upstreamRules || []
    const blocks = []

    if (header) {
        blocks.push(header.replace(/\n*$/, ''))
    }

    blocks.push([
        advertisingSectionStart,
        ...advertisingRules,
        advertisingSectionEnd,
    ].join('\n'))

    blocks.push([
        upstreamSectionStart,
        ...upstreamRules,
        upstreamSectionEnd,
    ].join('\n'))

    return `${blocks.join('\n\n')}\n`
}

async function collectMergedAdRuleLines(compilationConfigs = buildCompilationConfigs()) {
    const entries = await fs.readdir(distDir)
    const expectedListFiles = new Set(
        compilationConfigs.map((config) => `${config.name}.list`),
    )
    const listFiles = entries
        .filter((entry) => expectedListFiles.has(entry))
        .sort((left, right) => left.localeCompare(right))
    const bypassKeys = await collectBypassKeys()

    const seen = new Set()
    const rules = []

    for (const fileName of listFiles) {
        const filePath = join(distDir, fileName)
        const text = await fs.readFile(filePath, 'utf8')

        for (const rawLine of text.split(/\r?\n/)) {
            const line = rawLine.trim()

            if (!line || line.startsWith('#') || line.includes('*')) {
                continue
            }

            if (shouldExcludeGeneratedRule(line)) {
                continue
            }

            const key = normalizeRuleKey(line)

            if (bypassKeys.has(key) || seen.has(line)) {
                continue
            }

            seen.add(line)
            rules.push(line)
        }
    }

    return rules
}

function normalizeWhitespace(content) {
    const lines = content.split(/\r?\n/)
    const result = []
    let lastWasEmpty = false

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const trimmed = line.trim()
        const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : ''
        const nextIsComment = nextLine.startsWith('#')

        if (trimmed === '') {
            // Current line is empty
            if (nextIsComment && !lastWasEmpty) {
                // Next line is a comment, keep one blank line
                result.push('')
                lastWasEmpty = true
            }
            // Skip other blank lines
        } else {
            // Current line is not empty
            result.push(line)
            lastWasEmpty = false
        }
    }

    return result.join('\n').replace(/\n*$/, '\n')
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

    // Always relocate the auto-generated wildcard block before URL/IP sections,
    // so IP-CIDR rules stay at the very bottom of Advertising.list.
    const contentWithoutSection = current
        .replace(sectionReg, '')
        .replace(/\n{3,}/g, '\n\n')

    const lines = contentWithoutSection.split(/\r?\n/)
    
    // Find the first line that STARTS with IP-CIDR (excluding DOMAIN-WILDCARD lines that may appear after IP-CIDR)
    let insertionIndex = -1
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (line.startsWith('IP-CIDR,') || line.startsWith('IP-CIDR6,')) {
            insertionIndex = i
            break
        }
    }

    const targetIndex = insertionIndex >= 0 ? insertionIndex : lines.length

    lines.splice(targetIndex, 0, section, '')

    const unformatted = lines.join('\n').replace(/\n*$/, '\n')
    const next = normalizeWhitespace(unformatted)

    await fs.writeFile(advertisingListPath, next)
}

async function outputAdvertisingRules(compilationConfigs = buildCompilationConfigs()) {
    const advertisingText = await fs.readFile(advertisingListPath, 'utf8')
    const {
        migratedRules,
        cleanedText,
        removedCount,
    } = collectAndPruneAdvertisingRules(advertisingText)

    if (removedCount > 0) {
        await fs.writeFile(advertisingListPath, cleanedText)
    }

    const mergedRules = await collectMergedAdRuleLines(compilationConfigs)
    const bypassKeys = await collectBypassKeys()

    const existingAdRule = await fs.pathExists(adRuleListPath)
        ? await fs.readFile(adRuleListPath, 'utf8')
        : ''
    const header = extractCustomEditBlock(existingAdRule)
    const manualKeys = new Set(collectRuleLines(header).map((line) => normalizeRuleKey(line)))
    const mergedKeys = new Set(mergedRules.map((line) => normalizeRuleKey(line)))
    const advertisingSection = extractRulesBetweenMarkers(
        existingAdRule,
        advertisingSectionStart,
        advertisingSectionEnd,
    )
    const upstreamSection = extractRulesBetweenMarkers(
        existingAdRule,
        upstreamSectionStart,
        upstreamSectionEnd,
    )
    const bootstrapAdvertisingRules = (!advertisingSection.found && !upstreamSection.found)
        ? collectLegacyBodyRules(existingAdRule, header)
            .filter((line) => !mergedKeys.has(normalizeRuleKey(line)))
        : []
    const advertisingRules = sortAndDedupeAdRuleLines(
        advertisingSection.rules
            .concat(bootstrapAdvertisingRules)
            .concat(migratedRules),
    ).filter((line) => {
        const key = normalizeRuleKey(line)

        return !manualKeys.has(key) && !bypassKeys.has(key)
    })
    const blockedKeys = new Set([
        ...manualKeys,
        ...bypassKeys,
        ...advertisingRules.map((line) => normalizeRuleKey(line)),
    ])
    const upstreamRules = dedupeUpstreamRules(mergedRules, blockedKeys)
    const content = buildAdRuleListContent(existingAdRule, {
        advertisingRules,
        upstreamRules,
    })

    if (content !== existingAdRule) {
        await fs.outputFile(adRuleListPath, content)
    }
}

async function outputCompiled(config, compiled, allowedDomains, wildcardDomains) {
    const fileName = `${config.name}.list`
    const dest = join(distDir, fileName)
    const lines = []
    const sourceType = config.sources[0] && config.sources[0].type

    for (const rule of compiled) {
        const wildcardDomain = formatWildcardRule(rule)

        if (wildcardDomain) {
            wildcardDomains.add(wildcardDomain)
        }

        const formatted = formatRule(rule, sourceType)

        if (formatted && allowedDomains.has(formatted.domain)) {
            lines.push(formatted.output)
        }
    }

    await fs.outputFile(dest, lines.length ? `${lines.join('\n')}\n` : '')
}

async function main() {
    const wildcardDomains = new Set()
    const compilationConfigs = buildCompilationConfigs()

    await fs.ensureDir(distDir)
    await pruneGeneratedListFiles(compilationConfigs)

    for (const config of compilationConfigs) {
        const [compiled, allowedDomains] = await Promise.all([
            compile(config),
            collectAllowedDomains(config),
        ])

        await outputCompiled(config, compiled, allowedDomains, wildcardDomains)
    }

    await updateAdvertisingWildcardRules(wildcardDomains)
    await outputAdvertisingRules(compilationConfigs)
}

if (require.main === module) {
    main().catch((err) => {
        console.error(err)
        process.exit(1)
    })
}

module.exports = {
    __internal: {
        buildGeneratedRuleExcludeMatcher,
        shouldExcludeGeneratedRule,
    },
    buildAdRuleListContent,
    collectAdvertisingRules,
    sortAndDedupeAdRuleLines,
    formatRule,
}