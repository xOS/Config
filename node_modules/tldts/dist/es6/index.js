import { getEmptyResult, parseImpl, resetResult } from 'tldts-core';
import suffixLookup from './src/suffix-trie';
// For all methods but 'parse', it does not make sense to allocate an object
// every single time to only return the value of a specific attribute. To avoid
// this un-necessary allocation, we use a global object which is re-used.
const RESULT = getEmptyResult();
export function parse(url, options = {}) {
    return parseImpl(url, 5 /* ALL */, suffixLookup, options, getEmptyResult());
}
export function getHostname(url, options = {}) {
    resetResult(RESULT);
    return parseImpl(url, 0 /* HOSTNAME */, suffixLookup, options, RESULT).hostname;
}
export function getPublicSuffix(url, options = {}) {
    resetResult(RESULT);
    return parseImpl(url, 2 /* PUBLIC_SUFFIX */, suffixLookup, options, RESULT).publicSuffix;
}
export function getDomain(url, options = {}) {
    resetResult(RESULT);
    return parseImpl(url, 3 /* DOMAIN */, suffixLookup, options, RESULT).domain;
}
export function getSubdomain(url, options = {}) {
    resetResult(RESULT);
    return parseImpl(url, 4 /* SUB_DOMAIN */, suffixLookup, options, RESULT).subdomain;
}
export function getDomainWithoutSuffix(url, options = {}) {
    resetResult(RESULT);
    return parseImpl(url, 5 /* ALL */, suffixLookup, options, RESULT).domainWithoutSuffix;
}
//# sourceMappingURL=index.js.map