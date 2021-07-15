function setDefaultsImpl({ allowIcannDomains = true, allowPrivateDomains = false, detectIp = true, extractHostname = true, mixedInputs = true, validHosts = null, validateHostname = true, }) {
    return {
        allowIcannDomains,
        allowPrivateDomains,
        detectIp,
        extractHostname,
        mixedInputs,
        validHosts,
        validateHostname,
    };
}
const DEFAULT_OPTIONS = setDefaultsImpl({});
export function setDefaults(options) {
    if (options === undefined) {
        return DEFAULT_OPTIONS;
    }
    return setDefaultsImpl(options);
}
//# sourceMappingURL=options.js.map