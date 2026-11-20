import { createElement } from 'lwc';

// The component reads loAppOrigin from the URL when its module loads, so set the URL
// before requiring it (import would be hoisted above this line)
const HOST_ORIGIN = 'https://www.example.org';
window.history.replaceState({}, '', `/?loAppOrigin=${encodeURIComponent(HOST_ORIGIN)}`);
const LightningOutFlowContainer = require('c/lightningOutFlowContainer').default;

const SHRINK_DELAY_MS = 2000;

// jsdom has no ResizeObserver; this one lets a test trigger a resize
let resizeObservers;
class ResizeObserverMock {
    constructor(callback) {
        this.callback = callback;
        this.observe = jest.fn();
        resizeObservers.push(this);
    }
}

let bodyHeight;
let postMessage;

function render(properties = {}) {
    const element = createElement('c-lightning-out-flow-container', { is: LightningOutFlowContainer });
    element.flowApiName = 'Donation_Flow';
    Object.assign(element, properties);
    document.body.appendChild(element);
    return element;
}

function resize(height) {
    bodyHeight = height;
    resizeObservers[0].callback();
}

function changeScreen(element, height) {
    bodyHeight = height;
    element.shadowRoot.querySelector('lightning-flow').dispatchEvent(new CustomEvent('statuschange'));
}

const reportedHeights = () => postMessage.mock.calls.map(([message]) => message.height);

beforeEach(() => {
    jest.useFakeTimers();
    resizeObservers = [];
    global.ResizeObserver = ResizeObserverMock;
    bodyHeight = 0;
    jest.spyOn(document.body, 'getBoundingClientRect').mockImplementation(() => ({ height: bodyHeight }));
    postMessage = jest.spyOn(window.parent, 'postMessage').mockImplementation(() => {});
});

afterEach(() => {
    while (document.body.firstChild) document.body.removeChild(document.body.firstChild);
    document.head.querySelectorAll('style').forEach((style) => style.remove());
    jest.restoreAllMocks();
    jest.useRealTimers();
    delete global.ResizeObserver;
});

describe('flow', () => {
    it('runs the flow named by flow-api-name', () => {
        const element = render();
        expect(element.shadowRoot.querySelector('lightning-flow').flowApiName).toBe('Donation_Flow');
    });

    it('passes the success and failure URLs to the flow', () => {
        const element = render({
            successUrl: 'https://www.example.org/thank-you',
            failureUrl: 'https://www.example.org/try-again'
        });
        expect(element.shadowRoot.querySelector('lightning-flow').flowInputVariables).toEqual([
            { name: 'successUrl', type: 'String', value: 'https://www.example.org/thank-you' },
            { name: 'failureUrl', type: 'String', value: 'https://www.example.org/try-again' }
        ]);
    });

    it('passes only the URLs that are set, so flows without these inputs still start', () => {
        const withSuccessUrl = render({ successUrl: 'https://www.example.org/thank-you' });
        expect(withSuccessUrl.shadowRoot.querySelector('lightning-flow').flowInputVariables).toEqual([
            { name: 'successUrl', type: 'String', value: 'https://www.example.org/thank-you' }
        ]);

        const withoutUrls = render();
        expect(withoutUrls.shadowRoot.querySelector('lightning-flow').flowInputVariables).toEqual([]);
    });

    it('passes the inputs from input-variables to the flow', () => {
        const element = render({
            inputVariables: '{"id": "459c3102-3f92-3117-57bd-ed99cb65982a", "type": "link"}',
            successUrl: 'https://www.example.org/thank-you'
        });
        expect(element.shadowRoot.querySelector('lightning-flow').flowInputVariables).toEqual([
            { name: 'id', type: 'String', value: '459c3102-3f92-3117-57bd-ed99cb65982a' },
            { name: 'type', type: 'String', value: 'link' },
            { name: 'successUrl', type: 'String', value: 'https://www.example.org/thank-you' }
        ]);
    });

    it('ignores input-variables that are not valid JSON', () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
        const element = render({ inputVariables: '{id:' });
        expect(element.shadowRoot.querySelector('lightning-flow').flowInputVariables).toEqual([]);
        expect(consoleError).toHaveBeenCalled();
        consoleError.mockRestore();
    });
});

describe('setup inside Lightning Out', () => {
    it('lets the page take its content height', () => {
        render();
        const styles = [...document.head.querySelectorAll('style')].map((style) => style.textContent);
        expect(styles).toContain('html,body{height:auto!important;min-height:100%!important;}');
    });

    it('watches the whole page for size changes', () => {
        render();
        expect(resizeObservers).toHaveLength(1);
        expect(resizeObservers[0].observe).toHaveBeenCalledWith(document.body);
    });
});

describe('height messages', () => {
    it('posts the height, rounded up, only to the host website', () => {
        render();
        resize(512.4);
        expect(postMessage).toHaveBeenCalledWith({ type: 'flow:height', height: 513 }, HOST_ORIGIN);
    });

    it('posts a taller height at once', () => {
        render();
        resize(500);
        resize(800);
        expect(reportedHeights()).toEqual([500, 800]);
    });

    it('does not post the same height twice', () => {
        render();
        resize(500);
        resize(500);
        expect(reportedHeights()).toEqual([500]);
    });

    it('posts a shorter height after a screen change at once', () => {
        const element = render();
        resize(800);
        changeScreen(element, 400);
        expect(reportedHeights()).toEqual([800, 400]);
    });

    it('posts a shorter height within a screen only after it lasts', () => {
        render();
        resize(800);
        resize(400);
        jest.advanceTimersByTime(SHRINK_DELAY_MS - 1);
        expect(reportedHeights()).toEqual([800]);

        jest.advanceTimersByTime(1);
        expect(reportedHeights()).toEqual([800, 400]);
    });

    it('drops a pending shrink when the content grows back', () => {
        render();
        resize(800);
        resize(400);
        resize(800);
        jest.advanceTimersByTime(SHRINK_DELAY_MS);
        expect(reportedHeights()).toEqual([800]);
    });

    it('does not shrink to the spinner shown between screens', () => {
        const element = render();
        resize(800);
        resize(100);
        changeScreen(element, 600);
        jest.advanceTimersByTime(SHRINK_DELAY_MS);
        expect(reportedHeights()).toEqual([800, 600]);
    });
});
