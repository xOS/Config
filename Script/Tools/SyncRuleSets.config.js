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

const jobs = [
    {
        name: 'iCloud',
        output: join(__dirname, '../../RuleSet/iCloud.list'),
        sources: [
            'https://raw.githubusercontent.com/Loyalsoldier/surge-rules/release/ruleset/icloud.txt',
        ],
        // Keep upstream content as-is.
        transforms: [],
    },
    {
        name: 'AppleDirect',
        output: join(__dirname, '../../RuleSet/AppleDirect.list'),
        sources: [
            'https://raw.githubusercontent.com/Loyalsoldier/surge-rules/release/ruleset/apple.txt',
        ],
        // Keep upstream content as-is.
        transforms: [],
    },
    {
        name: 'Static',
        output: join(__dirname, '../../RuleSet/Static.list'),
        sources: [
            'https://ruleset.skk.moe/List/domainset/cdn.conf',
        ],
        transforms: removeSkkNoiseTransforms,
    },
    {
        name: 'Download',
        output: join(__dirname, '../../RuleSet/Download.list'),
        sources: [
            'https://ruleset.skk.moe/List/domainset/download.conf',
        ],
        transforms: removeSkkNoiseTransforms,
    },
    {
        name: 'DomesticIP',
        output: join(__dirname, '../../RuleSet/DomesticIP.list'),
        sources: [
            'https://ruleset.skk.moe/List/ip/china_ip.conf',
            'https://ruleset.skk.moe/List/ip/china_ip_ipv6.conf',
        ],
        transforms: removeSkkNoiseTransforms,
    },
    {
        name: 'AdIPRule',
        output: join(__dirname, '../../RuleSet/AdIPRule.list'),
        sources: [
            'https://ruleset.skk.moe/List/ip/reject.conf',
        ],
        transforms: removeSkkNoiseTransforms,
    },
]

module.exports = {
    jobs,
    removeSkkNoiseTransforms,
}
