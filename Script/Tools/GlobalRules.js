'use strict'

const { join } = require('path')
const https = require('https')
const fs = require('fs-extra')

const globalListPath = join(__dirname, '../../RuleSet/Global.list')
const globalRuleListPath = join(__dirname, '../../RuleSet/GlobalRule.list')

const globalUpstreamUrl = 'https://ruleset.skk.moe/List/non_ip/global.conf'
const globalRuleUpstreamUrl = 'https://raw.githubusercontent.com/Loyalsoldier/surge-rules/release/proxy.txt'

const customSectionStart = '# === Custom Edit Area Start ==='
const customSectionEnd = '# === Custom Edit Area End ==='

const globalUpstreamSectionStart = '# === AUTO-GENERATED: GLOBAL UPSTREAM START ==='
const globalUpstreamSectionEnd = '# === AUTO-GENERATED: GLOBAL UPSTREAM END ==='

const globalMigratedSectionStart = '# === AUTO-GENERATED: GLOBAL MIGRATED START ==='
const globalMigratedSectionEnd = '# === AUTO-GENERATED: GLOBAL MIGRATED END ==='
const globalRuleUpstreamSectionStart = '# === AUTO-GENERATED: GLOBALRULE UPSTREAM START ==='
const globalRuleUpstreamSectionEnd = '# === AUTO-GENERATED: GLOBALRULE UPSTREAM END ==='

function normalizeDomain(domain) {
    return domain.trim().replace(/^\.+/, '').replace(/\.+$/, '').toLowerCase()
}

function isConvertibleDomainToken(value) {
    const domain = normalizeDomain(value)

    if (!domain || domain.includes('*') || domain.includes('/') || /\s/.test(domain)) {
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

        rules.push(line)
    }

    return rules
}

function trimTrailingEmptyLines(lines) {
    const next = [...lines]

    while (next.length > 0 && next[next.length - 1].trim() === '') {
        next.pop()
    }

    return next
}

function extractCustomEditBlock(text) {
    const markerReg = new RegExp(
        `${escapeRegExp(customSectionStart)}[\\s\\S]*?${escapeRegExp(customSectionEnd)}`,
        'm',
    )
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

function extractCustomCommentLines(block) {
    if (!block) {
        return []
    }

    const lines = block.split(/\r?\n/)
    const startIndex = lines.findIndex((line) => line.trim() === customSectionStart)
    const endIndex = lines.findIndex((line) => line.trim() === customSectionEnd)
    const commentLines = []

    if (startIndex !== -1 && endIndex > startIndex) {
        const innerLines = lines.slice(startIndex + 1, endIndex)

        for (const line of innerLines) {
            const trimmed = line.trim()

            if (trimmed === '' || trimmed.startsWith('#')) {
                commentLines.push(line)
            }
        }

        return trimTrailingEmptyLines(commentLines)
    }

    for (const line of lines) {
        const trimmed = line.trim()

        if (trimmed === '' || trimmed.startsWith('#')) {
            commentLines.push(line)
        }
    }

    return trimTrailingEmptyLines(commentLines)
}

function buildCustomEditBlock(existingBlock, rules, defaultCommentLines) {
    const commentLines = extractCustomCommentLines(existingBlock)
    const lines = [
        customSectionStart,
        ...(commentLines.length ? commentLines : defaultCommentLines),
        ...rules,
        customSectionEnd,
    ]

    return `${lines.join('\n')}\n`
}

function buildGlobalListContent(customBlock, upstreamRules) {
    const blocks = []

    if (customBlock) {
        blocks.push(customBlock.replace(/\n*$/, ''))
    }

    blocks.push([
        globalUpstreamSectionStart,
        ...upstreamRules,
        globalUpstreamSectionEnd,
    ].join('\n'))

    return `${blocks.join('\n\n')}\n`
}

function buildGlobalRuleListContent(customBlock, sections) {
    const migratedRules = sections.migratedRules || []
    const upstreamRules = sections.upstreamRules || []
    const blocks = []

    if (customBlock) {
        blocks.push(customBlock.replace(/\n*$/, ''))
    }

    blocks.push([
        globalMigratedSectionStart,
        ...migratedRules,
        globalMigratedSectionEnd,
    ].join('\n'))

    blocks.push([
        globalRuleUpstreamSectionStart,
        ...upstreamRules,
        globalRuleUpstreamSectionEnd,
    ].join('\n'))

    return `${blocks.join('\n\n')}\n`
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

function collectLegacyBodyRules(text, customBlock, sections) {
    let bodyText = text

    if (customBlock) {
        bodyText = bodyText.replace(customBlock, '')
    }

    for (const section of sections) {
        bodyText = removeSection(bodyText, section[0], section[1])
    }

    return collectRuleLines(bodyText)
}

function parseGlobalSourceLines(text) {
    const lines = []

    for (const rawLine of text.split(/\r?\n/)) {
        const line = rawLine.split('#')[0].trim()

        if (!line || /skk\.moe/i.test(line)) {
            continue
        }

        lines.push(line)
    }

    return lines
}

function collectDomainRulesFromUpstream(text) {
    const rules = []

    for (const rawLine of text.split(/\r?\n/)) {
        const line = rawLine.split('#')[0].trim()

        if (!line) {
            continue
        }

        const typedMatch = line.match(/^(DOMAIN|DOMAIN-SUFFIX),([^,]+)(?:,.*)?$/i)

        if (typedMatch) {
            const domain = normalizeDomain(typedMatch[2])

            if (!isConvertibleDomainToken(domain) || isIpAddress(domain)) {
                continue
            }

            rules.push(
                typedMatch[1].toUpperCase() === 'DOMAIN'
                    ? domain
                    : `.${domain}`,
            )
            continue
        }

        // Loyalsoldier proxy list is plain domain-per-line; treat it as suffix rule.
        const plainDomain = normalizeDomain(line)

        if (!isConvertibleDomainToken(plainDomain) || isIpAddress(plainDomain)) {
            continue
        }

        rules.push(`.${plainDomain}`)
    }

    return rules
}

function sortAndDedupeGlobalLines(lines) {
    const seen = new Set()
    const unique = []

    for (const rawLine of lines) {
        const line = rawLine.trim()

        if (!line || line.startsWith('#') || seen.has(line)) {
            continue
        }

        seen.add(line)
        unique.push(line)
    }

    const nonIp = []
    const ip = []

    for (const line of unique) {
        if (/^IP-CIDR6?,/i.test(line)) {
            ip.push(line)
        } else {
            nonIp.push(line)
        }
    }

    nonIp.sort((left, right) => left.localeCompare(right))
    ip.sort((left, right) => left.localeCompare(right))

    return nonIp.concat(ip)
}

function extractDomainMigration(lines) {
    const migratedRules = []
    const remainingLines = []

    for (const rawLine of lines) {
        const line = rawLine.trim()
        const match = line.match(/^(DOMAIN|DOMAIN-SUFFIX),([^,]+)(?:,.*)?$/i)

        if (!line) {
            continue
        }

        if (!match) {
            remainingLines.push(line)
            continue
        }

        const domain = normalizeDomain(match[2])

        if (!isConvertibleDomainToken(domain) || isIpAddress(domain)) {
            remainingLines.push(line)
            continue
        }

        migratedRules.push(
            match[1].toUpperCase() === 'DOMAIN'
                ? domain
                : `.${domain}`,
        )
    }

    return {
        remainingLines,
        migratedRules,
    }
}

function sortAndDedupeDomainRules(lines) {
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

async function main() {
    const [globalUpstreamText, globalRuleUpstreamText] = await Promise.all([
        fetchText(globalUpstreamUrl),
        fetchText(globalRuleUpstreamUrl),
    ])

    const fetchedGlobalLines = parseGlobalSourceLines(globalUpstreamText)
    const fetchedGlobalRuleRules = sortAndDedupeDomainRules(
        collectDomainRulesFromUpstream(globalRuleUpstreamText),
    )

    const existingGlobal = await fs.pathExists(globalListPath)
        ? await fs.readFile(globalListPath, 'utf8')
        : ''
    const existingGlobalRule = await fs.pathExists(globalRuleListPath)
        ? await fs.readFile(globalRuleListPath, 'utf8')
        : ''

    const existingGlobalCustomBlock = extractCustomEditBlock(existingGlobal)
    const existingGlobalManualRules = collectRuleLines(existingGlobalCustomBlock)
    const globalUpstreamSection = extractRulesBetweenMarkers(
        existingGlobal,
        globalUpstreamSectionStart,
        globalUpstreamSectionEnd,
    )
    const globalLegacyBodyRules = !globalUpstreamSection.found
        ? collectLegacyBodyRules(existingGlobal, existingGlobalCustomBlock, [
            [globalUpstreamSectionStart, globalUpstreamSectionEnd],
        ])
        : []

    const globalUpstreamCandidates = globalUpstreamSection.rules
        .concat(globalLegacyBodyRules)
        .concat(fetchedGlobalLines)

    const manualMigration = extractDomainMigration(existingGlobalManualRules)
    const upstreamMigration = extractDomainMigration(globalUpstreamCandidates)

    const globalManualRules = sortAndDedupeGlobalLines(manualMigration.remainingLines)
    const manualGlobalSet = new Set(globalManualRules)
    const globalUpstreamRules = sortAndDedupeGlobalLines(
        upstreamMigration.remainingLines,
    ).filter((line) => !manualGlobalSet.has(line))

    const nextGlobalCustomBlock = buildCustomEditBlock(
        existingGlobalCustomBlock,
        globalManualRules,
        [
            '# Add or edit manual rules here.',
            '# DOMAIN / DOMAIN-SUFFIX rules in this block are migrated to GlobalRule.list.',
        ],
    )
    const nextGlobalContent = buildGlobalListContent(
        nextGlobalCustomBlock,
        globalUpstreamRules,
    )

    if (nextGlobalContent !== existingGlobal) {
        await fs.outputFile(globalListPath, nextGlobalContent)
    }

    const migratedFromGlobal = sortAndDedupeDomainRules(
        manualMigration.migratedRules.concat(upstreamMigration.migratedRules),
    )

    const existingGlobalRuleCustomBlock = extractCustomEditBlock(existingGlobalRule)
    const existingGlobalRuleManualRules = collectRuleLines(existingGlobalRuleCustomBlock)
    const manualGlobalRuleKeys = new Set(
        existingGlobalRuleManualRules.map((line) => normalizeRuleKey(line)),
    )

    const globalMigratedSection = extractRulesBetweenMarkers(
        existingGlobalRule,
        globalMigratedSectionStart,
        globalMigratedSectionEnd,
    )
    const globalRuleUpstreamSection = extractRulesBetweenMarkers(
        existingGlobalRule,
        globalRuleUpstreamSectionStart,
        globalRuleUpstreamSectionEnd,
    )

    const globalRuleLegacyBodyRules = (!globalMigratedSection.found && !globalRuleUpstreamSection.found)
        ? collectLegacyBodyRules(existingGlobalRule, existingGlobalRuleCustomBlock, [
            [globalMigratedSectionStart, globalMigratedSectionEnd],
            [globalRuleUpstreamSectionStart, globalRuleUpstreamSectionEnd],
        ])
        : []

    const fetchedGlobalRuleKeys = new Set(
        fetchedGlobalRuleRules.map((line) => normalizeRuleKey(line)),
    )
    const bootstrapMigratedRules = (!globalMigratedSection.found && !globalRuleUpstreamSection.found)
        ? globalRuleLegacyBodyRules.filter((line) => !fetchedGlobalRuleKeys.has(normalizeRuleKey(line)))
        : []

    // Keep upstream section visible by giving it higher priority than migrated rules:
    // manual > upstream > migrated.
    const upstreamRules = dedupeUpstreamRules(
        fetchedGlobalRuleRules,
        manualGlobalRuleKeys,
    )
    const upstreamKeys = new Set(upstreamRules.map((line) => normalizeRuleKey(line)))
    const blockedMigratedKeys = new Set([
        ...manualGlobalRuleKeys,
        ...upstreamKeys,
    ])
    const migratedRules = sortAndDedupeDomainRules(
        globalMigratedSection.rules
            .concat(bootstrapMigratedRules)
            .concat(migratedFromGlobal),
    ).filter((line) => !blockedMigratedKeys.has(normalizeRuleKey(line)))

    const nextGlobalRuleCustomBlock = buildCustomEditBlock(
        existingGlobalRuleCustomBlock,
        existingGlobalRuleManualRules,
        [
            '# Add or edit manual rules here.',
            '# DOMAIN => example.com ; DOMAIN-SUFFIX => .example.com',
        ],
    )
    const nextGlobalRuleContent = buildGlobalRuleListContent(
        nextGlobalRuleCustomBlock,
        {
            migratedRules,
            upstreamRules,
        },
    )

    if (nextGlobalRuleContent !== existingGlobalRule) {
        await fs.outputFile(globalRuleListPath, nextGlobalRuleContent)
    }
}

if (require.main === module) {
    main().catch((err) => {
        console.error(err)
        process.exit(1)
    })
}

module.exports = {
    extractDomainMigration,
    sortAndDedupeGlobalLines,
    sortAndDedupeDomainRules,
}
