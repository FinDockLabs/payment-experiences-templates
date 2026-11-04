import { LightningElement, api } from 'lwc';

// ----- Patterns -----

// Checked in order, first match wins: Edge and Opera user agents also contain "Chrome",
// and Chrome's also contains "Safari". The capture group is the version.
const BROWSER_PATTERNS = [
    ['Edge', /Edg\w*\/([\d.]+)/],
    ['Opera', /OPR\/([\d.]+)/],
    ['Firefox', /(?:Firefox|FxiOS)\/([\d.]+)/],
    ['Chrome', /(?:Chrome|CriOS)\/([\d.]+)/],
    ['Safari', /Version\/([\d.]+).*Safari/]
];
// Checked in order, first match wins: iOS user agents also contain "Mac OS X",
// and Android's also contains "Linux". Apple versions use underscores (17_4).
const OS_PATTERNS = [
    ['Windows', /Windows NT ([\d.]+)/],
    ['iOS', /OS ([\d_]+) like Mac/],
    ['Android', /Android ([\d.]+)/],
    ['macOS', /Mac OS X ([\d_.]+)/],
    ['Linux', /Linux/]
];
const MOBILE_PATTERN = /Mobi|Android|iPhone/i;
// Android places the device model after its version, e.g. "Android 14; Pixel 8)".
// Chrome's reduced user agent replaces the model with "K", which is treated as unknown.
const ANDROID_MODEL_PATTERN = /Android [\d.]+; ([^;)]+?)(?: Build\/[^;)]*)?\)/;
const REDUCED_ANDROID_MODEL = 'K';

// ----- Vendors by the browser and OS names above -----

const BROWSER_VENDORS = { Edge: 'Microsoft', Opera: 'Opera', Firefox: 'Mozilla', Chrome: 'Google', Safari: 'Apple' };
const OS_VENDORS = { Windows: 'Microsoft', iOS: 'Apple', Android: 'Google', macOS: 'Apple' };
const APPLE_DEVICE_MODELS = ['iPhone', 'iPad', 'Mac'];

// ----- Helpers -----

// Returns the name and version of the first matching pattern, or "Unknown" if none matches
const findFirstMatch = (userAgent, patternsByName) => {
    for (const [name, pattern] of patternsByName) {
        const match = userAgent.match(pattern);
        if (match) {
            return { name, version: match[1]?.replace(/_/g, '.') ?? '' };
        }
    }
    return { name: 'Unknown', version: '' };
};

// Returns "iPhone", "iPad", "Mac" or the Android model, or an empty string if the user agent doesn't name it
const findDeviceModel = (userAgent, osName, isIpad) => {
    if (/iPhone/.test(userAgent)) {
        return 'iPhone';
    }
    if (isIpad) {
        return 'iPad';
    }
    if (osName === 'macOS') {
        return 'Mac';
    }
    const androidModel = userAgent.match(ANDROID_MODEL_PATTERN)?.[1];
    return androidModel && androidModel !== REDUCED_ANDROID_MODEL ? androidModel : '';
};

// ----- Parser -----

/**
 * Parses browser, OS and device details from a user agent string.
 * Returns empty values if the user agent is unavailable, so the flow still receives the variable.
 *
 * @param {string} userAgent navigator.userAgent
 * @param {number} maxTouchPoints navigator.maxTouchPoints, used to tell an iPad from a Mac
 */
const parseUserAgent = (userAgent, maxTouchPoints) => {
    if (!userAgent) {
        return {
            browserName: '',
            browserVersion: '',
            browserVendor: '',
            osName: '',
            osVersion: '',
            osVendor: '',
            deviceType: '',
            deviceModel: '',
            deviceVendor: '',
            isMobile: false
        };
    }

    const browser = findFirstMatch(userAgent, BROWSER_PATTERNS);
    const os = findFirstMatch(userAgent, OS_PATTERNS);
    const isMobile = MOBILE_PATTERN.test(userAgent);
    // iPadOS reports itself as macOS; only the touch screen tells an iPad apart from a Mac
    const isIpad = /iPad/.test(userAgent) || (os.name === 'macOS' && maxTouchPoints > 1);
    // Android phones add "Mobile" to the user agent, Android tablets don't
    const isAndroidTablet = os.name === 'Android' && !/Mobile/.test(userAgent);
    let deviceType = isMobile ? 'Mobile' : 'Desktop';
    if (isIpad || isAndroidTablet) {
        deviceType = 'Tablet';
    }
    const deviceModel = findDeviceModel(userAgent, os.name, isIpad);

    return {
        browserName: browser.name,
        browserVersion: browser.version,
        browserVendor: BROWSER_VENDORS[browser.name] ?? '',
        osName: os.name,
        osVersion: os.version,
        osVendor: OS_VENDORS[os.name] ?? '',
        deviceType,
        deviceModel,
        // Only Apple devices can be attributed to a vendor from the user agent
        deviceVendor: APPLE_DEVICE_MODELS.includes(deviceModel) ? 'Apple' : '',
        isMobile
    };
};

/**
 * Screen flow local action (Action element → Get User Agent Info).
 * Reads the payer's browser, OS and device details from navigator.userAgent, plus the browser locale,
 * and returns them to the flow as one Apex-defined UserAgentInfo value. Runs in the browser, with no Apex call.
 * If the user agent is unavailable the fields are empty, so the action never stops the flow.
 */
export default class GetUserAgentInfo extends LightningElement {
    // Browser, OS, device and locale details; keys match the @AuraEnabled fields of the UserAgentInfo Apex class
    @api userAgentInfo;

    // Called by the flow when it runs this component as a local action
    @api invoke() {
        this.userAgentInfo = {
            ...parseUserAgent(navigator.userAgent ?? '', navigator.maxTouchPoints ?? 0),
            // Browser's preferred language as a BCP 47 tag, e.g. "en-US"
            locale: navigator.language ?? ''
        };
    }
}
