import { LightningElement, api } from 'lwc';

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

const BROWSER_VENDORS = { Edge: 'Microsoft', Opera: 'Opera', Firefox: 'Mozilla', Chrome: 'Google', Safari: 'Apple' };
const OS_VENDORS = { Windows: 'Microsoft', iOS: 'Apple', Android: 'Google', macOS: 'Apple' };
const APPLE_DEVICE_MODELS = ['iPhone', 'iPad', 'Mac'];

const findFirstMatch = (userAgent, patternsByName) => {
    for (const [name, pattern] of patternsByName) {
        const match = userAgent.match(pattern);
        if (match) {
            return { name, version: match[1]?.replace(/_/g, '.') ?? '' };
        }
    }
    return { name: 'Unknown', version: '' };
};

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

// Flow local action: runs in the browser, with no Apex call
export default class GetUserAgentInfo extends LightningElement {
    // Keys must match the @AuraEnabled fields of the UserAgentInfo Apex class
    @api userAgentInfo;

    @api invoke() {
        this.userAgentInfo = {
            ...parseUserAgent(navigator.userAgent ?? '', navigator.maxTouchPoints ?? 0),
            locale: navigator.language ?? ''
        };
    }
}
