import { createElement } from 'lwc';
import GetUserAgentInfo from 'c/getUserAgentInfo';

const EMPTY_INFO = {
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

// Overrides the navigator values the action reads; undefined simulates a browser that doesn't provide one
function setNavigator(navigatorValues) {
    // Spread, not default parameters, so an explicit undefined is kept
    const { userAgent, maxTouchPoints, language } = { maxTouchPoints: 0, language: 'en-US', ...navigatorValues };
    Object.defineProperty(window.navigator, 'userAgent', { value: userAgent, configurable: true });
    Object.defineProperty(window.navigator, 'maxTouchPoints', { value: maxTouchPoints, configurable: true });
    Object.defineProperty(window.navigator, 'language', { value: language, configurable: true });
}

function invokeAction(navigatorValues) {
    setNavigator(navigatorValues);
    const element = createElement('c-get-user-agent-info', { is: GetUserAgentInfo });
    document.body.appendChild(element);
    element.invoke();
    return element.userAgentInfo;
}

afterEach(() => {
    while (document.body.firstChild) document.body.removeChild(document.body.firstChild);
});

describe('browser', () => {
    it.each([
        [
            'Chrome',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            { browserName: 'Chrome', browserVersion: '124.0.0.0', browserVendor: 'Google' }
        ],
        [
            'Edge, although its user agent also names Chrome',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.2478.80',
            { browserName: 'Edge', browserVersion: '124.0.2478.80', browserVendor: 'Microsoft' }
        ],
        [
            'Opera, although its user agent also names Chrome',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0',
            { browserName: 'Opera', browserVersion: '106.0.0.0', browserVendor: 'Opera' }
        ],
        [
            'Firefox',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
            { browserName: 'Firefox', browserVersion: '125.0', browserVendor: 'Mozilla' }
        ],
        [
            'Safari, although Chrome user agents also name Safari',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
            { browserName: 'Safari', browserVersion: '17.4', browserVendor: 'Apple' }
        ],
        [
            'Chrome on iOS',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/124.0.6367.88 Mobile/15E148 Safari/604.1',
            { browserName: 'Chrome', browserVersion: '124.0.6367.88', browserVendor: 'Google' }
        ],
        [
            'Firefox on iOS',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/125.0 Mobile/15E148 Safari/605.1.15',
            { browserName: 'Firefox', browserVersion: '125.0', browserVendor: 'Mozilla' }
        ],
        [
            'Unknown for an unrecognised browser',
            'curl/8.4.0',
            { browserName: 'Unknown', browserVersion: '', browserVendor: '' }
        ]
    ])('detects %s', (_, userAgent, expected) => {
        expect(invokeAction({ userAgent })).toMatchObject(expected);
    });
});

describe('operating system', () => {
    it.each([
        [
            'Windows',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            { osName: 'Windows', osVersion: '10.0', osVendor: 'Microsoft' }
        ],
        [
            'macOS, with the version in dots',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
            { osName: 'macOS', osVersion: '10.15.7', osVendor: 'Apple' }
        ],
        [
            'iOS, although its user agent also names Mac OS X',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
            { osName: 'iOS', osVersion: '17.4', osVendor: 'Apple' }
        ],
        [
            'Android, although its user agent also names Linux',
            'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Mobile Safari/537.36',
            { osName: 'Android', osVersion: '14', osVendor: 'Google' }
        ],
        [
            'Linux, without a version or vendor',
            'Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0',
            { osName: 'Linux', osVersion: '', osVendor: '' }
        ],
        [
            'Unknown for an unrecognised OS',
            'curl/8.4.0',
            { osName: 'Unknown', osVersion: '', osVendor: '' }
        ]
    ])('detects %s', (_, userAgent, expected) => {
        expect(invokeAction({ userAgent })).toMatchObject(expected);
    });
});

describe('device', () => {
    const MAC_SAFARI =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15';

    it('detects an iPhone', () => {
        const userAgent =
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
        expect(invokeAction({ userAgent })).toMatchObject({
            deviceType: 'Mobile',
            deviceModel: 'iPhone',
            deviceVendor: 'Apple',
            isMobile: true
        });
    });

    it('detects a Mac when there is no touch screen', () => {
        expect(invokeAction({ userAgent: MAC_SAFARI, maxTouchPoints: 0 })).toMatchObject({
            deviceType: 'Desktop',
            deviceModel: 'Mac',
            deviceVendor: 'Apple',
            isMobile: false
        });
    });

    it('detects an iPad that reports itself as macOS by its touch screen', () => {
        expect(invokeAction({ userAgent: MAC_SAFARI, maxTouchPoints: 5 })).toMatchObject({
            osName: 'macOS',
            deviceType: 'Tablet',
            deviceModel: 'iPad',
            deviceVendor: 'Apple'
        });
    });

    it('detects an iPad that names itself in the user agent', () => {
        const userAgent =
            'Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1';
        expect(invokeAction({ userAgent })).toMatchObject({
            osName: 'iOS',
            deviceType: 'Tablet',
            deviceModel: 'iPad',
            deviceVendor: 'Apple'
        });
    });

    it('detects an Android phone and its model', () => {
        const userAgent =
            'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Mobile Safari/537.36';
        expect(invokeAction({ userAgent })).toMatchObject({
            deviceType: 'Mobile',
            deviceModel: 'Pixel 8',
            deviceVendor: '',
            isMobile: true
        });
    });

    it('detects an Android tablet and drops the build from its model', () => {
        const userAgent =
            'Mozilla/5.0 (Linux; Android 13; SM-X710 Build/TP1A.220624.014) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
        expect(invokeAction({ userAgent })).toMatchObject({
            deviceType: 'Tablet',
            deviceModel: 'SM-X710',
            deviceVendor: ''
        });
    });

    it('leaves the model empty when Chrome hides it behind "K"', () => {
        const userAgent =
            'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36';
        expect(invokeAction({ userAgent }).deviceModel).toBe('');
    });

    it('reports a Windows computer as a desktop without a model', () => {
        const userAgent =
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
        expect(invokeAction({ userAgent })).toMatchObject({
            deviceType: 'Desktop',
            deviceModel: '',
            deviceVendor: '',
            isMobile: false
        });
    });
});

describe('locale', () => {
    it("returns the browser's preferred language", () => {
        expect(invokeAction({ userAgent: 'curl/8.4.0', language: 'nl-NL' }).locale).toBe('nl-NL');
    });
});

describe('unavailable values', () => {
    it('returns empty values when the browser provides no user agent or language', () => {
        expect(
            invokeAction({ userAgent: undefined, maxTouchPoints: undefined, language: undefined })
        ).toEqual({ ...EMPTY_INFO, locale: '' });
    });

    it('returns empty values for an empty user agent', () => {
        expect(invokeAction({ userAgent: '', language: 'en-US' })).toEqual({ ...EMPTY_INFO, locale: 'en-US' });
    });
});
