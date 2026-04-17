'use strict'

const { join } = require('path')

const removeSkkNoiseTransforms = [
    'NormalizeNewlines',
    {
        name: 'ExcludeMatchingLines',
        options: {
            patterns: ['#', 'skk\\.moe', '^\\s*$'],
        },
    },
    'EnsureTrailingNewline',
]

const customSection = {
    start: '# === Custom Edit Area Start ===',
    end: '# === Custom Edit Area End ===',
}

const coreRuleSets = {
    global: {
        output: join(__dirname, '../../RuleSet/Global.list'),
        sourceUrl: 'https://ruleset.skk.moe/List/non_ip/global.conf',
        sourceParser: 'globalLines',
        customCommentLines: [
            '# Add or edit manual rules here.',
            '# DOMAIN / DOMAIN-SUFFIX rules in this block are migrated to GlobalRule.list.',
        ],
        sections: {
            upstream: {
                start: '# === AUTO-GENERATED: GLOBAL UPSTREAM START ===',
                end: '# === AUTO-GENERATED: GLOBAL UPSTREAM END ===',
            },
        },
    },
    globalRule: {
        output: join(__dirname, '../../RuleSet/GlobalRule.list'),
        sourceUrl: 'https://raw.githubusercontent.com/Loyalsoldier/surge-rules/release/proxy.txt',
        sourceParser: 'domainRules',
        customCommentLines: [
            '# Add or edit manual rules here.',
            '# DOMAIN => example.com ; DOMAIN-SUFFIX => .example.com',
        ],
        sections: {
            migrated: {
                start: '# === AUTO-GENERATED: GLOBAL MIGRATED START ===',
                end: '# === AUTO-GENERATED: GLOBAL MIGRATED END ===',
            },
            upstream: {
                start: '# === AUTO-GENERATED: GLOBALRULE UPSTREAM START ===',
                end: '# === AUTO-GENERATED: GLOBALRULE UPSTREAM END ===',
            },
        },
    },
}

const coreTasks = [
    {
        name: 'GlobalPair',
        processor: 'globalPairMigration',
        globalKey: 'global',
        globalRuleKey: 'globalRule',
        steps: [
            'fetchSources',
            'loadExisting',
            'buildGlobalOutput',
            'buildGlobalRuleOutput',
            'writeOutputs',
        ],
    },
]

const jobs = [
    {
        name: 'iCloud',
        output: join(__dirname, '../../RuleSet/iCloud.list'),
        sources: [
            'https://raw.githubusercontent.com/Loyalsoldier/surge-rules/release/ruleset/icloud.txt',
        ],
        // Keep upstream content as-is.
        transforms: [],
        writeMode: 'replace',
    },
    {
        name: 'AppleDirect',
        output: join(__dirname, '../../RuleSet/AppleDirect.list'),
        sources: [
            'https://raw.githubusercontent.com/Loyalsoldier/surge-rules/release/ruleset/apple.txt',
        ],
        // Keep upstream content as-is.
        transforms: [],
        writeMode: 'replace',
    },
    {
        name: 'Static',
        output: join(__dirname, '../../RuleSet/Static.list'),
        sources: [
            'https://ruleset.skk.moe/List/domainset/cdn.conf',
        ],
        transforms: removeSkkNoiseTransforms,
        writeMode: 'replace',
    },
    {
        name: 'Download',
        output: join(__dirname, '../../RuleSet/Download.list'),
        sources: [
            'https://ruleset.skk.moe/List/domainset/download.conf',
        ],
        transforms: removeSkkNoiseTransforms,
        writeMode: 'replace',
    },
    {
        name: 'Domestic',
        output: join(__dirname, '../../RuleSet/Domestic.list'),
        sources: [
            'https://ruleset.skk.moe/List/non_ip/domestic.conf',
        ],
        // Keep upstream content as-is.
        transforms: [],
        writeMode: 'sectioned',
        sectionMarkers: {
            upstream: {
                start: '# === AUTO-GENERATED: DOMESTIC UPSTREAM START ===',
                end: '# === AUTO-GENERATED: DOMESTIC UPSTREAM END ===',
            },
        },
        customCommentLines: [
            '# Add or edit manual rules here.',
        ],
    },
    {
        name: 'DomesticIP',
        output: join(__dirname, '../../RuleSet/DomesticIP.list'),
        sources: [
            'https://ruleset.skk.moe/List/ip/china_ip.conf',
            'https://ruleset.skk.moe/List/ip/china_ip_ipv6.conf',
        ],
        transforms: removeSkkNoiseTransforms,
        writeMode: 'replace',
    },
    {
        name: 'AdIPRule',
        output: join(__dirname, '../../RuleSet/AdIPRule.list'),
        sources: [
            'https://ruleset.skk.moe/List/ip/reject.conf',
        ],
        transforms: removeSkkNoiseTransforms,
        writeMode: 'replace',
    },
]

module.exports = {
    coreRuleSets,
    coreTasks,
    customSection,
    jobs,
    removeSkkNoiseTransforms,
}
