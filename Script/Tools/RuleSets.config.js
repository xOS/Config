'use strict'

const { join } = require('path')

const generatedRuleExcludeKeywords = [
    '*by_*-*.skk.moe',
]

const customSection = {
    start: '# === Custom Edit Area Start ===',
    end: '# === Custom Edit Area End ===',
}

const tasks = [
    {
        name: 'GlobalPair',
        processor: 'pairMigration',
        primary: {
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
        secondary: {
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
    },
    {
        name: 'iCloud',
        output: join(__dirname, '../../RuleSet/iCloud.list'),
        sources: [
            'https://raw.githubusercontent.com/Loyalsoldier/surge-rules/release/ruleset/icloud.txt',
        ],
        writeMode: 'replace',
    },
    {
        name: 'AppleDirect',
        output: join(__dirname, '../../RuleSet/AppleDirect.list'),
        sources: [
            'https://raw.githubusercontent.com/Loyalsoldier/surge-rules/release/ruleset/apple.txt',
            'https://ruleset.skk.moe/List/non_ip/apple_cn.conf',
        ],
        writeMode: 'replace',
    },
    {
        name: 'Microsoft',
        output: join(__dirname, '../../RuleSet/Microsoft.list'),
        sources: [
            'https://ruleset.skk.moe/List/non_ip/microsoft.conf',
        ],
        writeMode: 'replace',
    },
    {
        name: 'Static',
        output: join(__dirname, '../../RuleSet/Static.list'),
        sources: [
            'https://ruleset.skk.moe/List/domainset/cdn.conf',
        ],
        writeMode: 'replace',
    },
    {
        name: 'Download',
        output: join(__dirname, '../../RuleSet/Download.list'),
        sources: [
            'https://ruleset.skk.moe/List/domainset/download.conf',
        ],
        writeMode: 'replace',
    },
    {
        name: 'Domestic',
        output: join(__dirname, '../../RuleSet/Domestic.list'),
        sources: [
            'https://ruleset.skk.moe/List/non_ip/domestic.conf',
        ],
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
        writeMode: 'replace',
    },
    {
        name: 'AdIPRule',
        output: join(__dirname, '../../RuleSet/AdIPRule.list'),
        sources: [
            'https://ruleset.skk.moe/List/ip/reject.conf',
        ],
        writeMode: 'replace',
    },
]

module.exports = {
    customSection,
    generatedRuleExcludeKeywords,
    tasks,
}
