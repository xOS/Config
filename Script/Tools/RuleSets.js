'use strict'

const https = require('https')
const fs = require('fs-extra')

const {
    customSection,
    generatedRuleExcludeKeywords,
    tasks,
} = require('./RuleSets.config')

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

function filterGeneratedRulesByMatchers(lines, matchers) {
    if (!Array.isArray(lines)) {
        return []
    }

    return lines
        .map((line) => (typeof line === 'string' ? line.trim() : ''))
        .filter((line) => (
            line && !shouldExcludeGeneratedRuleByMatchers(line, matchers)
        ))
}

const customSectionStart = customSection?.start
const customSectionEnd = customSection?.end

if (!customSectionStart || !customSectionEnd) {
    throw new Error('Invalid RuleSets config: missing custom section markers')
}

const supportedTransforms = {
    NormalizeNewlines: (text) => text.replace(/\r\n/g, '\n'),
    ExcludeMatchingLines: (text, options = {}) => {
        const patterns = Array.isArray(options.patterns) ? options.patterns : []
        const regexes = patterns.map((pattern) => new RegExp(pattern))

        return text
            .split(/\r?\n/)
            .filter((line) => !regexes.some((regex) => regex.test(line)))
            .join('\n')
    },
    RemoveComments: (text) => text
        .split(/\r?\n/)
        .filter((line) => !line.trim().startsWith('#'))
        .join('\n'),
    RemoveBlankLines: (text) => text
        .split(/\r?\n/)
        .filter((line) => line.trim() !== '')
        .join('\n'),
    Deduplicate: (text) => {
        const seen = new Set()

        return text
            .split(/\r?\n/)
            .filter((line) => {
                const key = line.trim()

                if (!key) {
                    return false
                }

                if (seen.has(key)) {
                    return false
                }

                seen.add(key)
                return true
            })
            .join('\n')
    },
    Sort: (text) => text
        .split(/\r?\n/)
        .filter((line) => line.trim() !== '')
        .sort((left, right) => left.localeCompare(right))
        .join('\n'),
    EnsureTrailingNewline: (text) => {
        const trimmed = text.replace(/\n*$/, '')

        return trimmed ? `${trimmed}\n` : ''
    },
}

function normalizeTransformSpec(transformSpec) {
    if (typeof transformSpec === 'string') {
        return {
            name: transformSpec,
            options: {},
        }
    }

    if (
        transformSpec &&
        typeof transformSpec === 'object' &&
        typeof transformSpec.name === 'string'
    ) {
        return {
            name: transformSpec.name,
            options: transformSpec.options || {},
        }
    }

    throw new Error(`Invalid transform spec: ${JSON.stringify(transformSpec)}`)
}

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

function stripInlineCommentAndTrim(rawLine) {
    return rawLine.split('#')[0].trim()
}

function collectRuleLines(text) {
    const rules = []

    for (const rawLine of text.split(/\r?\n/)) {
        const line = stripInlineCommentAndTrim(rawLine)

        if (!line) {
            continue
        }

        rules.push(line)
    }

    return rules
}

const normalizedGeneratedRuleExcludeMatchers = buildGeneratedRuleExcludeMatchers(
    generatedRuleExcludeKeywords,
)

function filterGeneratedRules(lines) {
    return filterGeneratedRulesByMatchers(lines, normalizedGeneratedRuleExcludeMatchers)
}

function trimTrailingEmptyLines(lines) {
    const next = [...lines]

    while (next.length > 0 && next[next.length - 1].trim() === '') {
        next.pop()
    }

    return next
}

function extractBypassRules(text) {
    const bypasses = new Set()
    let inBypassArea = false

    for (const rawLine of text.split(/\r?\n/)) {
        const trimmed = rawLine.trim()

        if (trimmed === '# === Bypass Area Start ===') {
            inBypassArea = true
            continue
        }

        if (trimmed === '# === Bypass Area End ===') {
            inBypassArea = false
            continue
        }

        if (inBypassArea && trimmed.startsWith('#')) {
            if (trimmed.startsWith('# ') || trimmed.startsWith('##')) {
                continue
            }

            const val = trimmed.substring(1)
            if (!val || val.includes(' ') || val.includes(',')) {
                continue
            }

            if (val.startsWith('.')) {
                const domain = val.substring(1)
                if (isConvertibleDomainToken(domain)) {
                    bypasses.add(`DOMAIN-SUFFIX,${domain}`)
                    bypasses.add(`.${domain}`)
                }
            } else {
                if (isConvertibleDomainToken(val)) {
                    bypasses.add(`DOMAIN,${val}`)
                    bypasses.add(val)
                }
            }
        }
    }
    return bypasses
}

function extractBypassBlockText(text) {
    const markerReg = new RegExp(
        '# === Bypass Area Start ===[\\s\\S]*?# === Bypass Area End ===',
        'm',
    )
    const match = text.match(markerReg)
    if (match) {
        return match[0]
    }
    return ''
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

function buildUpstreamListContent(bypassBlock, customBlock, upstreamRules, upstreamSection) {
    const upstreamStart = upstreamSection?.start
    const upstreamEnd = upstreamSection?.end

    if (!upstreamStart || !upstreamEnd) {
        throw new Error('Missing upstream section markers')
    }

    const blocks = []

    if (bypassBlock) {
        blocks.push(bypassBlock.replace(/\n*$/, ''))
    }

    if (customBlock) {
        blocks.push(customBlock.replace(/\n*$/, ''))
    }

    blocks.push([
        upstreamStart,
        ...upstreamRules,
        upstreamEnd,
    ].join('\n'))

    return `${blocks.join('\n\n')}\n`
}

function buildMigratedUpstreamListContent(bypassBlock, customBlock, sections, sectionMarkers) {
    const migratedRules = sections.migratedRules || []
    const upstreamRules = sections.upstreamRules || []
    const migratedStart = sectionMarkers?.migrated?.start
    const migratedEnd = sectionMarkers?.migrated?.end
    const upstreamStart = sectionMarkers?.upstream?.start
    const upstreamEnd = sectionMarkers?.upstream?.end

    if (!migratedStart || !migratedEnd || !upstreamStart || !upstreamEnd) {
        throw new Error('Missing migrated/upstream section markers')
    }

    const blocks = []

    if (bypassBlock) {
        blocks.push(bypassBlock.replace(/\n*$/, ''))
    }

    if (customBlock) {
        blocks.push(customBlock.replace(/\n*$/, ''))
    }

    blocks.push([
        migratedStart,
        ...migratedRules,
        migratedEnd,
    ].join('\n'))

    blocks.push([
        upstreamStart,
        ...upstreamRules,
        upstreamEnd,
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

function collectDomainRulesFromUpstream(text) {
    const rules = []

    for (const rawLine of text.split(/\r?\n/)) {
        const line = stripInlineCommentAndTrim(rawLine)

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

const sourceParsers = {
    domainRules: collectDomainRulesFromUpstream,
    globalLines: collectRuleLines,
}

function parseSourceWithConfig(text, parserName, ruleSetName) {
    const parser = sourceParsers[parserName]

    if (!parser) {
        throw new Error(`Unsupported source parser "${parserName}" for ${ruleSetName}`)
    }

    return parser(text)
}

function getPairConfigOrThrow(config, configName, taskName) {
    if (!config || typeof config !== 'object') {
        throw new Error(`Task "${taskName}" is missing ${configName} config`)
    }

    if (!config.output || !config.sourceUrl || !config.sourceParser) {
        throw new Error(
            `Task "${taskName}" has invalid ${configName} config: missing output/sourceUrl/sourceParser`,
        )
    }

    return config
}

function getSectionOrThrow(ruleSetConfig, configName, sectionKey, taskName) {
    const section = ruleSetConfig?.sections?.[sectionKey]

    if (!section?.start || !section?.end) {
        throw new Error(
            `Task "${taskName}" has invalid section markers: ${configName}.sections.${sectionKey}`,
        )
    }

    return section
}

function getDefaultSectionedMarkers() {
    const pairMigrationTask = Array.isArray(tasks)
        ? tasks.find((task) => task?.primary && task?.secondary)
        : null
    const defaultRuleSet = pairMigrationTask?.secondary

    return {
        migrated: defaultRuleSet?.sections?.migrated,
        upstream: defaultRuleSet?.sections?.upstream,
    }
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

function applyTransforms(text, transforms) {
    let next = text

    for (const transformSpec of transforms || []) {
        const { name, options } = normalizeTransformSpec(transformSpec)
        const transform = supportedTransforms[name]

        if (!transform) {
            throw new Error(`Unsupported transform: ${name}`)
        }

        next = transform(next, options)
    }

    return next
}

function concatSources(chunks, separator = '\n') {
    if (chunks.length === 0) {
        return ''
    }

    if (chunks.length === 1) {
        return chunks[0]
    }

    const normalized = chunks.map((chunk) => chunk.replace(/\n*$/, ''))

    return `${normalized.join(separator)}\n`
}

async function buildJobContent(job, fetcher = fetchText) {
    const sources = Array.isArray(job.sources) ? job.sources : []

    if (sources.length === 0) {
        throw new Error(`Job "${job.name}" has no sources configured`)
    }

    const chunks = []

    for (const source of sources) {
        const sourceConfig = typeof source === 'string'
            ? { url: source }
            : source
        const sourceUrl = sourceConfig.url

        if (!sourceUrl) {
            throw new Error(`Job "${job.name}" has a source without url`)
        }

        const sourceText = await fetcher(sourceUrl)
        const transforms = sourceConfig.transforms || job.transforms || []
        const transformedText = applyTransforms(sourceText, transforms)

        chunks.push(transformedText)
    }

    return concatSources(chunks, job.separator || '\n')
}

function formatRuleLines(lines) {
    return lines.length > 0
        ? `${lines.join('\n')}\n`
        : ''
}

function resolveSectionedMarkersForTask(task) {
    const markers = task.sectionMarkers || getDefaultSectionedMarkers()
    const hasMigratedStart = Boolean(markers?.migrated?.start)
    const hasMigratedEnd = Boolean(markers?.migrated?.end)
    const taskName = task.name || task.processor || 'unnamed-task'

    if (!markers?.upstream?.start || !markers?.upstream?.end) {
        throw new Error(`Task "${taskName}" is sectioned but has invalid sectionMarkers`)
    }

    if (hasMigratedStart !== hasMigratedEnd) {
        throw new Error(`Task "${taskName}" has invalid migrated markers in sectionMarkers`)
    }

    return {
        migrated: hasMigratedStart ? markers.migrated : null,
        upstream: markers.upstream,
    }
}

function buildSectionedJobContent(task, existingContent, upstreamRules) {
    const sectionMarkers = resolveSectionedMarkersForTask(task)
    const bypassBlock = extractBypassBlockText(existingContent)
    const existingCustomBlock = extractCustomEditBlock(existingContent)
    const manualRules = sortAndDedupeDomainRules(
        collectRuleLines(existingCustomBlock),
    )
    const manualRuleKeys = new Set(
        manualRules.map((line) => normalizeRuleKey(line)),
    )
    const visibleUpstreamRules = dedupeUpstreamRules(upstreamRules, manualRuleKeys)
    const nextCustomBlock = buildCustomEditBlock(
        existingCustomBlock,
        manualRules,
        task.customCommentLines || [
            '# Add or edit manual rules here.',
        ],
    )

    if (sectionMarkers.migrated) {
        return buildMigratedUpstreamListContent(bypassBlock, nextCustomBlock, {
            migratedRules: [],
            upstreamRules: visibleUpstreamRules,
        }, sectionMarkers)
    }

    return buildUpstreamListContent(
        bypassBlock,
        nextCustomBlock,
        visibleUpstreamRules,
        sectionMarkers.upstream,
    )
}

async function runRulesetSyncTask(task) {
    const rawContent = await buildJobContent(task)
    const currentContent = await fs.pathExists(task.output)
        ? await fs.readFile(task.output, 'utf8')
        : ''
    const bypasses = extractBypassRules(currentContent)
    const rawLines = collectRuleLines(rawContent).filter(line => !bypasses.has(line))
    const sortedRules = sortAndDedupeDomainRules(
        filterGeneratedRules(rawLines),
    )
    const writeMode = task.writeMode || 'replace'

    if (writeMode !== 'replace' && writeMode !== 'sectioned') {
        throw new Error(`Task "${task.name}" has unsupported writeMode: ${writeMode}`)
    }

    let nextContent = formatRuleLines(sortedRules)

    if (writeMode === 'sectioned') {
        nextContent = buildSectionedJobContent(task, currentContent, sortedRules)
    } else {
        const bypassBlock = extractBypassBlockText(currentContent)
        if (bypassBlock) {
            nextContent = `${bypassBlock}\n\n${nextContent}`
        }
    }

    if (currentContent === nextContent) {
        return false
    }

    await fs.outputFile(task.output, nextContent)
    return true
}

function normalizeTaskSteps(taskName, steps, defaultSteps) {
    const configured = Array.isArray(steps) && steps.length > 0
        ? steps
        : defaultSteps

    if (!Array.isArray(configured) || configured.length === 0) {
        throw new Error(`Task "${taskName}" has invalid steps config`)
    }

    return configured.map((stepName) => {
        if (typeof stepName !== 'string' || stepName.trim() === '') {
            throw new Error(`Task "${taskName}" has invalid step name`)
        }

        return stepName.trim()
    })
}

async function runTaskStepPipeline(taskName, context, steps, stepHandlers) {
    for (const stepName of steps) {
        const stepHandler = stepHandlers[stepName]

        if (!stepHandler) {
            throw new Error(`Task "${taskName}" has unsupported step: ${stepName}`)
        }

        await stepHandler(context)
    }
}

async function pairMigrationStepFetchSources(context) {
    const [primaryUpstreamText, secondaryUpstreamText] = await Promise.all([
        fetchText(context.primaryConfig.sourceUrl),
        fetchText(context.secondaryConfig.sourceUrl),
    ])

    context.fetchedPrimaryLines = filterGeneratedRules(
        parseSourceWithConfig(
            primaryUpstreamText,
            context.primaryConfig.sourceParser,
            `${context.taskName}.primary`,
        ),
    )
    context.fetchedSecondaryRules = sortAndDedupeDomainRules(
        filterGeneratedRules(
            parseSourceWithConfig(
                secondaryUpstreamText,
                context.secondaryConfig.sourceParser,
                `${context.taskName}.secondary`,
            ),
        ),
    )
}

async function pairMigrationStepLoadExisting(context) {
    context.existingPrimary = await fs.pathExists(context.primaryConfig.output)
        ? await fs.readFile(context.primaryConfig.output, 'utf8')
        : ''
    context.existingSecondary = await fs.pathExists(context.secondaryConfig.output)
        ? await fs.readFile(context.secondaryConfig.output, 'utf8')
        : ''
}

async function pairMigrationStepBuildPrimaryOutput(context) {
    if (!Array.isArray(context.fetchedPrimaryLines) || typeof context.existingPrimary !== 'string') {
        throw new Error(`Task "${context.taskName}" step "buildPrimaryOutput" requires fetched and loaded state`)
    }

    const primaryBypasses = extractBypassRules(context.existingPrimary)
    const existingPrimaryCustomBlock = extractCustomEditBlock(context.existingPrimary)
    const existingPrimaryManualRules = sortAndDedupeDomainRules(
        collectRuleLines(existingPrimaryCustomBlock),
    )
    const primaryUpstreamSectionData = extractRulesBetweenMarkers(
        context.existingPrimary,
        context.primaryUpstreamMarkers.start,
        context.primaryUpstreamMarkers.end,
    )
    const primaryLegacyBodyRules = !primaryUpstreamSectionData.found
        ? collectLegacyBodyRules(context.existingPrimary, existingPrimaryCustomBlock, [
            [context.primaryUpstreamMarkers.start, context.primaryUpstreamMarkers.end],
        ])
        : []

    const primaryUpstreamCandidates = primaryUpstreamSectionData.rules
        .concat(primaryLegacyBodyRules)
        .concat(context.fetchedPrimaryLines)
        .filter(line => !primaryBypasses.has(line))
    const filteredPrimaryUpstreamCandidates = filterGeneratedRules(primaryUpstreamCandidates)

    const manualMigration = extractDomainMigration(existingPrimaryManualRules)
    const upstreamMigration = extractDomainMigration(filteredPrimaryUpstreamCandidates)
    const primaryManualRules = sortAndDedupeDomainRules(manualMigration.remainingLines)
    const manualPrimaryKeys = new Set(
        primaryManualRules.map((line) => normalizeRuleKey(line)),
    )
    const primaryUpstreamRules = dedupeUpstreamRules(
        sortAndDedupeDomainRules(upstreamMigration.remainingLines),
        manualPrimaryKeys,
    )
    const nextPrimaryCustomBlock = buildCustomEditBlock(
        existingPrimaryCustomBlock,
        primaryManualRules,
        context.primaryConfig.customCommentLines || [
            '# Add or edit manual rules here.',
            '# DOMAIN / DOMAIN-SUFFIX rules in this block are migrated to secondary list.',
        ],
    )

    const bypassBlock = extractBypassBlockText(context.existingPrimary)
    context.nextPrimaryContent = buildUpstreamListContent(
        bypassBlock,
        nextPrimaryCustomBlock,
        primaryUpstreamRules,
        context.primaryUpstreamMarkers,
    )
    context.migratedFromPrimary = sortAndDedupeDomainRules(
        manualMigration.migratedRules.concat(upstreamMigration.migratedRules),
    )
}

async function pairMigrationStepBuildSecondaryOutput(context) {
    if (
        !Array.isArray(context.fetchedSecondaryRules) ||
        !Array.isArray(context.migratedFromPrimary) ||
        typeof context.existingSecondary !== 'string'
    ) {
        throw new Error(`Task "${context.taskName}" step "buildSecondaryOutput" requires fetched/migrated state`)
    }

    const secondaryBypasses = extractBypassRules(context.existingSecondary)
    const existingSecondaryCustomBlock = extractCustomEditBlock(context.existingSecondary)
    const existingSecondaryManualRules = sortAndDedupeDomainRules(
        collectRuleLines(existingSecondaryCustomBlock),
    )
    const manualSecondaryKeys = new Set(
        existingSecondaryManualRules.map((line) => normalizeRuleKey(line)),
    )
    const secondaryMigratedSectionData = extractRulesBetweenMarkers(
        context.existingSecondary,
        context.secondaryMigratedMarkers.start,
        context.secondaryMigratedMarkers.end,
    )
    const secondaryUpstreamSectionData = extractRulesBetweenMarkers(
        context.existingSecondary,
        context.secondaryUpstreamMarkers.start,
        context.secondaryUpstreamMarkers.end,
    )
    const secondaryLegacyBodyRules = (!secondaryMigratedSectionData.found && !secondaryUpstreamSectionData.found)
        ? collectLegacyBodyRules(context.existingSecondary, existingSecondaryCustomBlock, [
            [context.secondaryMigratedMarkers.start, context.secondaryMigratedMarkers.end],
            [context.secondaryUpstreamMarkers.start, context.secondaryUpstreamMarkers.end],
        ])
        : []
    const filteredSecondaryLegacyBodyRules = filterGeneratedRules(secondaryLegacyBodyRules)

    const fetchedRules = context.fetchedSecondaryRules.filter(line => !secondaryBypasses.has(line))
    const fetchedSecondaryKeys = new Set(
        fetchedRules.map((line) => normalizeRuleKey(line)),
    )
    const bootstrapMigratedRules = (!secondaryMigratedSectionData.found && !secondaryUpstreamSectionData.found)
        ? filteredSecondaryLegacyBodyRules.filter((line) => !fetchedSecondaryKeys.has(normalizeRuleKey(line)))
        : []

    // Keep upstream section visible by giving it higher priority than migrated rules:
    // manual > upstream > migrated.
    const upstreamRules = dedupeUpstreamRules(
        fetchedRules,
        manualSecondaryKeys,
    )
    const upstreamKeys = new Set(upstreamRules.map((line) => normalizeRuleKey(line)))
    const blockedMigratedKeys = new Set([
        ...manualSecondaryKeys,
        ...upstreamKeys,
    ])
    const migratedRules = sortAndDedupeDomainRules(
        filterGeneratedRules(
            secondaryMigratedSectionData.rules
                .concat(bootstrapMigratedRules)
                .concat(context.migratedFromPrimary),
        ),
    ).filter((line) => !blockedMigratedKeys.has(normalizeRuleKey(line)))
    const nextSecondaryCustomBlock = buildCustomEditBlock(
        existingSecondaryCustomBlock,
        existingSecondaryManualRules,
        context.secondaryConfig.customCommentLines || [
            '# Add or edit manual rules here.',
            '# DOMAIN => example.com ; DOMAIN-SUFFIX => .example.com',
        ],
    )

    const bypassBlock = extractBypassBlockText(context.existingSecondary)
    context.nextSecondaryContent = buildMigratedUpstreamListContent(
        bypassBlock,
        nextSecondaryCustomBlock,
        {
            migratedRules,
            upstreamRules,
        },
        {
            migrated: context.secondaryMigratedMarkers,
            upstream: context.secondaryUpstreamMarkers,
        },
    )
}

async function pairMigrationStepWriteOutputs(context) {
    if (
        typeof context.nextPrimaryContent !== 'string' ||
        typeof context.nextSecondaryContent !== 'string'
    ) {
        throw new Error(`Task "${context.taskName}" step "writeOutputs" requires built output content`)
    }

    const hasPrimaryChanges = context.nextPrimaryContent !== context.existingPrimary
    const hasSecondaryChanges = context.nextSecondaryContent !== context.existingSecondary

    if (hasPrimaryChanges) {
        await fs.outputFile(context.primaryConfig.output, context.nextPrimaryContent)
        context.changed = true
    }

    if (hasSecondaryChanges) {
        await fs.outputFile(context.secondaryConfig.output, context.nextSecondaryContent)
        context.changed = true
    }
}

const pairMigrationStepHandlers = {
    buildPrimaryOutput: pairMigrationStepBuildPrimaryOutput,
    buildSecondaryOutput: pairMigrationStepBuildSecondaryOutput,
    fetchSources: pairMigrationStepFetchSources,
    loadExisting: pairMigrationStepLoadExisting,
    writeOutputs: pairMigrationStepWriteOutputs,
}

const defaultPairMigrationSteps = [
    'fetchSources',
    'loadExisting',
    'buildPrimaryOutput',
    'buildSecondaryOutput',
    'writeOutputs',
]

async function runPairMigrationTask(task) {
    const taskName = task.name || task.processor
    const primaryConfigName = 'primary'
    const secondaryConfigName = 'secondary'
    const primaryConfig = getPairConfigOrThrow(task.primary, primaryConfigName, taskName)
    const secondaryConfig = getPairConfigOrThrow(task.secondary, secondaryConfigName, taskName)
    const context = {
        changed: false,
        primaryConfig,
        primaryUpstreamMarkers: getSectionOrThrow(primaryConfig, primaryConfigName, 'upstream', taskName),
        secondaryConfig,
        secondaryMigratedMarkers: getSectionOrThrow(secondaryConfig, secondaryConfigName, 'migrated', taskName),
        secondaryUpstreamMarkers: getSectionOrThrow(secondaryConfig, secondaryConfigName, 'upstream', taskName),
        taskName,
    }
    const steps = normalizeTaskSteps(taskName, task.steps, defaultPairMigrationSteps)

    await runTaskStepPipeline(taskName, context, steps, pairMigrationStepHandlers)

    return context.changed
}

const taskProcessors = {
    pairMigration: runPairMigrationTask,
    rulesetSync: runRulesetSyncTask,
}

function resolveTaskProcessorName(task) {
    const configuredProcessor = typeof task?.processor === 'string'
        ? task.processor.trim()
        : ''

    if (configuredProcessor) {
        return configuredProcessor
    }

    if (task?.primary && task?.secondary) {
        return 'pairMigration'
    }

    return 'rulesetSync'
}

async function syncTasks() {
    const configuredTasks = Array.isArray(tasks) ? tasks : []
    let updatedCount = 0

    for (const task of configuredTasks) {
        const processorName = resolveTaskProcessorName(task)
        const taskName = task?.name || processorName || 'unnamed-task'
        const processor = taskProcessors[processorName]

        if (!processor) {
            throw new Error(`Task "${taskName}" has unsupported processor: ${processorName}`)
        }

        const changed = await processor(task)

        if (changed) {
            updatedCount += 1
            console.log(`[update-rulesets] updated ${taskName}`)
        }
    }

    console.log(`[update-rulesets] synced ${updatedCount}/${configuredTasks.length} tasks`)
}

async function main() {
    await syncTasks()
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
        filterGeneratedRules,
        pairMigrationStepWriteOutputs,
        normalizeTaskSteps,
        runTaskStepPipeline,
    },
    applyTransforms,
    buildJobContent,
    concatSources,
    extractDomainMigration,
    tasks,
    sortAndDedupeDomainRules,
}
