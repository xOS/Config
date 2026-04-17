'use strict'

const https = require('https')
const fs = require('fs-extra')

const {
    coreRuleSets,
    coreTasks,
    customSection,
    jobs,
} = require('./RuleSets.config')

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

function buildGlobalListContent(customBlock, upstreamRules, upstreamSection) {
    const upstreamStart = upstreamSection?.start
    const upstreamEnd = upstreamSection?.end

    if (!upstreamStart || !upstreamEnd) {
        throw new Error('Missing upstream section markers')
    }

    const blocks = []

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

function buildGlobalRuleListContent(customBlock, sections, sectionMarkers) {
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

const sourceParsers = {
    domainRules: collectDomainRulesFromUpstream,
    globalLines: parseGlobalSourceLines,
}

function parseSourceWithConfig(text, parserName, ruleSetName) {
    const parser = sourceParsers[parserName]

    if (!parser) {
        throw new Error(`Unsupported source parser "${parserName}" for ${ruleSetName}`)
    }

    return parser(text)
}

function getCoreRuleSetConfigOrThrow(ruleSetKey, taskName) {
    const ruleSetConfig = coreRuleSets?.[ruleSetKey]

    if (!ruleSetConfig) {
        throw new Error(`Core task "${taskName}" references missing coreRuleSets.${ruleSetKey}`)
    }

    if (!ruleSetConfig.output || !ruleSetConfig.sourceUrl || !ruleSetConfig.sourceParser) {
        throw new Error(
            `Core task "${taskName}" has invalid coreRuleSets.${ruleSetKey} config: missing output/sourceUrl/sourceParser`,
        )
    }

    return ruleSetConfig
}

function getSectionOrThrow(ruleSetConfig, ruleSetKey, sectionKey, taskName) {
    const section = ruleSetConfig?.sections?.[sectionKey]

    if (!section?.start || !section?.end) {
        throw new Error(
            `Core task "${taskName}" has invalid section markers: coreRuleSets.${ruleSetKey}.sections.${sectionKey}`,
        )
    }

    return section
}

function getDefaultSectionedMarkers() {
    const defaultRuleSet = coreRuleSets?.globalRule

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

function resolveSectionedMarkersForJob(job) {
    const markers = job.sectionMarkers || getDefaultSectionedMarkers()

    if (
        !markers?.migrated?.start ||
        !markers?.migrated?.end ||
        !markers?.upstream?.start ||
        !markers?.upstream?.end
    ) {
        throw new Error(`Job "${job.name}" is sectioned but has invalid sectionMarkers`)
    }

    return markers
}

function buildSectionedJobContent(job, existingContent, upstreamRules) {
    const sectionMarkers = resolveSectionedMarkersForJob(job)
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
        job.customCommentLines || [
            '# Add or edit manual rules here.',
            '# DOMAIN => example.com ; DOMAIN-SUFFIX => .example.com',
        ],
    )

    return buildGlobalRuleListContent(nextCustomBlock, {
        migratedRules: [],
        upstreamRules: visibleUpstreamRules,
    }, sectionMarkers)
}

async function syncJob(job) {
    const rawContent = await buildJobContent(job)
    const currentContent = await fs.pathExists(job.output)
        ? await fs.readFile(job.output, 'utf8')
        : ''
    const sortedRules = sortAndDedupeDomainRules(collectRuleLines(rawContent))
    const writeMode = job.writeMode || 'replace'

    if (writeMode !== 'replace' && writeMode !== 'sectioned') {
        throw new Error(`Job "${job.name}" has unsupported writeMode: ${writeMode}`)
    }

    const nextContent = writeMode === 'sectioned'
        ? buildSectionedJobContent(job, currentContent, sortedRules)
        : formatRuleLines(sortedRules)

    if (currentContent === nextContent) {
        return false
    }

    await fs.outputFile(job.output, nextContent)
    return true
}

function normalizeTaskSteps(taskName, steps, defaultSteps) {
    const configured = Array.isArray(steps) && steps.length > 0
        ? steps
        : defaultSteps

    if (!Array.isArray(configured) || configured.length === 0) {
        throw new Error(`Core task "${taskName}" has invalid steps config`)
    }

    return configured.map((stepName) => {
        if (typeof stepName !== 'string' || stepName.trim() === '') {
            throw new Error(`Core task "${taskName}" has invalid step name`)
        }

        return stepName.trim()
    })
}

async function runTaskStepPipeline(taskName, context, steps, stepHandlers) {
    for (const stepName of steps) {
        const stepHandler = stepHandlers[stepName]

        if (!stepHandler) {
            throw new Error(`Core task "${taskName}" has unsupported step: ${stepName}`)
        }

        await stepHandler(context)
    }
}

async function globalPairStepFetchSources(context) {
    const [globalUpstreamText, globalRuleUpstreamText] = await Promise.all([
        fetchText(context.globalConfig.sourceUrl),
        fetchText(context.globalRuleConfig.sourceUrl),
    ])

    context.fetchedGlobalLines = parseSourceWithConfig(
        globalUpstreamText,
        context.globalConfig.sourceParser,
        context.globalKey,
    )
    context.fetchedGlobalRuleRules = sortAndDedupeDomainRules(
        parseSourceWithConfig(
            globalRuleUpstreamText,
            context.globalRuleConfig.sourceParser,
            context.globalRuleKey,
        ),
    )
}

async function globalPairStepLoadExisting(context) {
    context.existingGlobal = await fs.pathExists(context.globalConfig.output)
        ? await fs.readFile(context.globalConfig.output, 'utf8')
        : ''
    context.existingGlobalRule = await fs.pathExists(context.globalRuleConfig.output)
        ? await fs.readFile(context.globalRuleConfig.output, 'utf8')
        : ''
}

async function globalPairStepBuildGlobalOutput(context) {
    if (!Array.isArray(context.fetchedGlobalLines) || typeof context.existingGlobal !== 'string') {
        throw new Error(`Core task "${context.taskName}" step "buildGlobalOutput" requires fetched and loaded state`)
    }

    const existingGlobalCustomBlock = extractCustomEditBlock(context.existingGlobal)
    const existingGlobalManualRules = sortAndDedupeDomainRules(
        collectRuleLines(existingGlobalCustomBlock),
    )
    const globalUpstreamSectionData = extractRulesBetweenMarkers(
        context.existingGlobal,
        context.globalUpstreamMarkers.start,
        context.globalUpstreamMarkers.end,
    )
    const globalLegacyBodyRules = !globalUpstreamSectionData.found
        ? collectLegacyBodyRules(context.existingGlobal, existingGlobalCustomBlock, [
            [context.globalUpstreamMarkers.start, context.globalUpstreamMarkers.end],
        ])
        : []

    const globalUpstreamCandidates = globalUpstreamSectionData.rules
        .concat(globalLegacyBodyRules)
        .concat(context.fetchedGlobalLines)

    const manualMigration = extractDomainMigration(existingGlobalManualRules)
    const upstreamMigration = extractDomainMigration(globalUpstreamCandidates)
    const globalManualRules = sortAndDedupeDomainRules(manualMigration.remainingLines)
    const manualGlobalKeys = new Set(
        globalManualRules.map((line) => normalizeRuleKey(line)),
    )
    const globalUpstreamRules = dedupeUpstreamRules(
        sortAndDedupeDomainRules(upstreamMigration.remainingLines),
        manualGlobalKeys,
    )
    const nextGlobalCustomBlock = buildCustomEditBlock(
        existingGlobalCustomBlock,
        globalManualRules,
        context.globalConfig.customCommentLines || [
            '# Add or edit manual rules here.',
            '# DOMAIN / DOMAIN-SUFFIX rules in this block are migrated to GlobalRule.list.',
        ],
    )

    context.nextGlobalContent = buildGlobalListContent(
        nextGlobalCustomBlock,
        globalUpstreamRules,
        context.globalUpstreamMarkers,
    )
    context.migratedFromGlobal = sortAndDedupeDomainRules(
        manualMigration.migratedRules.concat(upstreamMigration.migratedRules),
    )
}

async function globalPairStepBuildGlobalRuleOutput(context) {
    if (
        !Array.isArray(context.fetchedGlobalRuleRules) ||
        !Array.isArray(context.migratedFromGlobal) ||
        typeof context.existingGlobalRule !== 'string'
    ) {
        throw new Error(`Core task "${context.taskName}" step "buildGlobalRuleOutput" requires fetched/migrated state`)
    }

    const existingGlobalRuleCustomBlock = extractCustomEditBlock(context.existingGlobalRule)
    const existingGlobalRuleManualRules = sortAndDedupeDomainRules(
        collectRuleLines(existingGlobalRuleCustomBlock),
    )
    const manualGlobalRuleKeys = new Set(
        existingGlobalRuleManualRules.map((line) => normalizeRuleKey(line)),
    )
    const globalMigratedSectionData = extractRulesBetweenMarkers(
        context.existingGlobalRule,
        context.globalMigratedMarkers.start,
        context.globalMigratedMarkers.end,
    )
    const globalRuleUpstreamSectionData = extractRulesBetweenMarkers(
        context.existingGlobalRule,
        context.globalRuleUpstreamMarkers.start,
        context.globalRuleUpstreamMarkers.end,
    )
    const globalRuleLegacyBodyRules = (!globalMigratedSectionData.found && !globalRuleUpstreamSectionData.found)
        ? collectLegacyBodyRules(context.existingGlobalRule, existingGlobalRuleCustomBlock, [
            [context.globalMigratedMarkers.start, context.globalMigratedMarkers.end],
            [context.globalRuleUpstreamMarkers.start, context.globalRuleUpstreamMarkers.end],
        ])
        : []

    const fetchedGlobalRuleKeys = new Set(
        context.fetchedGlobalRuleRules.map((line) => normalizeRuleKey(line)),
    )
    const bootstrapMigratedRules = (!globalMigratedSectionData.found && !globalRuleUpstreamSectionData.found)
        ? globalRuleLegacyBodyRules.filter((line) => !fetchedGlobalRuleKeys.has(normalizeRuleKey(line)))
        : []

    // Keep upstream section visible by giving it higher priority than migrated rules:
    // manual > upstream > migrated.
    const upstreamRules = dedupeUpstreamRules(
        context.fetchedGlobalRuleRules,
        manualGlobalRuleKeys,
    )
    const upstreamKeys = new Set(upstreamRules.map((line) => normalizeRuleKey(line)))
    const blockedMigratedKeys = new Set([
        ...manualGlobalRuleKeys,
        ...upstreamKeys,
    ])
    const migratedRules = sortAndDedupeDomainRules(
        globalMigratedSectionData.rules
            .concat(bootstrapMigratedRules)
            .concat(context.migratedFromGlobal),
    ).filter((line) => !blockedMigratedKeys.has(normalizeRuleKey(line)))
    const nextGlobalRuleCustomBlock = buildCustomEditBlock(
        existingGlobalRuleCustomBlock,
        existingGlobalRuleManualRules,
        context.globalRuleConfig.customCommentLines || [
            '# Add or edit manual rules here.',
            '# DOMAIN => example.com ; DOMAIN-SUFFIX => .example.com',
        ],
    )

    context.nextGlobalRuleContent = buildGlobalRuleListContent(
        nextGlobalRuleCustomBlock,
        {
            migratedRules,
            upstreamRules,
        },
        {
            migrated: context.globalMigratedMarkers,
            upstream: context.globalRuleUpstreamMarkers,
        },
    )
}

async function globalPairStepWriteOutputs(context) {
    if (
        typeof context.nextGlobalContent !== 'string' ||
        typeof context.nextGlobalRuleContent !== 'string'
    ) {
        throw new Error(`Core task "${context.taskName}" step "writeOutputs" requires built output content`)
    }

    const hasGlobalChanges = context.nextGlobalContent !== context.existingGlobal
    const hasGlobalRuleChanges = context.nextGlobalRuleContent !== context.existingGlobalRule

    if (hasGlobalChanges) {
        await fs.outputFile(context.globalConfig.output, context.nextGlobalContent)
        context.changed = true
    }

    if (hasGlobalRuleChanges) {
        await fs.outputFile(context.globalRuleConfig.output, context.nextGlobalRuleContent)
        context.changed = true
    }
}

const globalPairStepHandlers = {
    buildGlobalOutput: globalPairStepBuildGlobalOutput,
    buildGlobalRuleOutput: globalPairStepBuildGlobalRuleOutput,
    fetchSources: globalPairStepFetchSources,
    loadExisting: globalPairStepLoadExisting,
    writeOutputs: globalPairStepWriteOutputs,
}

const defaultGlobalPairSteps = [
    'fetchSources',
    'loadExisting',
    'buildGlobalOutput',
    'buildGlobalRuleOutput',
    'writeOutputs',
]

async function runGlobalPairMigrationTask(task) {
    const taskName = task.name || task.processor
    const globalKey = task.globalKey
    const globalRuleKey = task.globalRuleKey

    if (!globalKey || !globalRuleKey) {
        throw new Error(`Core task "${taskName}" requires globalKey and globalRuleKey`)
    }

    const globalConfig = getCoreRuleSetConfigOrThrow(globalKey, taskName)
    const globalRuleConfig = getCoreRuleSetConfigOrThrow(globalRuleKey, taskName)
    const context = {
        changed: false,
        globalConfig,
        globalKey,
        globalMigratedMarkers: getSectionOrThrow(globalRuleConfig, globalRuleKey, 'migrated', taskName),
        globalRuleConfig,
        globalRuleKey,
        globalRuleUpstreamMarkers: getSectionOrThrow(globalRuleConfig, globalRuleKey, 'upstream', taskName),
        globalUpstreamMarkers: getSectionOrThrow(globalConfig, globalKey, 'upstream', taskName),
        taskName,
    }
    const steps = normalizeTaskSteps(taskName, task.steps, defaultGlobalPairSteps)

    await runTaskStepPipeline(taskName, context, steps, globalPairStepHandlers)

    return context.changed
}

const coreTaskProcessors = {
    globalPairMigration: runGlobalPairMigrationTask,
}

async function syncCoreRuleSets() {
    const tasks = Array.isArray(coreTasks) ? coreTasks : []
    let updatedCount = 0

    for (const task of tasks) {
        const taskName = task?.name || task?.processor || 'unnamed-core-task'
        const processorName = task?.processor
        const processor = coreTaskProcessors[processorName]

        if (!processor) {
            throw new Error(`Core task "${taskName}" has unsupported processor: ${processorName}`)
        }

        const changed = await processor(task)

        if (changed) {
            updatedCount += 1
            console.log(`[update-rulesets] updated core task ${taskName}`)
        }
    }

    console.log(`[update-rulesets] synced ${updatedCount}/${tasks.length} core tasks`)
}

async function syncConfiguredRuleSets() {
    let updatedCount = 0

    for (const job of jobs) {
        const changed = await syncJob(job)

        if (changed) {
            updatedCount += 1
            console.log(`[update-rulesets] updated ${job.name}`)
        }
    }

    console.log(`[update-rulesets] synced ${updatedCount}/${jobs.length} configured ruleset files`)
}

async function main() {
    await syncCoreRuleSets()
    await syncConfiguredRuleSets()
}

if (require.main === module) {
    main().catch((err) => {
        console.error(err)
        process.exit(1)
    })
}

module.exports = {
    __internal: {
        globalPairStepWriteOutputs,
        normalizeTaskSteps,
        runTaskStepPipeline,
    },
    applyTransforms,
    buildJobContent,
    concatSources,
    extractDomainMigration,
    jobs,
    sortAndDedupeDomainRules,
}
