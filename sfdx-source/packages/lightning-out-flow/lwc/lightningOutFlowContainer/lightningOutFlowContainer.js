import { LightningElement, api } from 'lwc';

// Lightning Out passes the host website's origin as loAppOrigin; height messages are sent only there.
const PARENT_ORIGIN = new URLSearchParams(window.location.search).get('loAppOrigin');
// The site stretches html and body to the iframe height; unlock them so body can be measured
const UNLOCK_DOCUMENT_HEIGHT = 'html,body{height:auto!important;min-height:100%!important;}';
const SHRINK_DELAY_MS = 2000;
// Must match the host website's message listener
const HEIGHT_MESSAGE_TYPE = 'flow:height';

// Lightning Out passes attributes as strings, so input-variables arrives as JSON
function parseInputVariables(value) {
    if (typeof value !== 'string') {
        return value ?? {};
    }
    try {
        return JSON.parse(value);
    } catch (error) {
        console.error('lightningOutFlowContainer: input-variables is not valid JSON', error);
        return {};
    }
}

export default class LightningOutFlowContainer extends LightningElement {
    @api flowApiName;
    // Optional full URLs where the payer goes after a successful or a failed payment
    @api successUrl;
    @api failureUrl;
    // Optional other String inputs for the flow, as a JSON object, e.g. {"id": "<GUID>", "type": "link"}
    @api inputVariables;
    resizeObserver;
    shrinkTimeout;
    lastReportedHeight = 0;

    // The host website can't see the iframe content's height, so the component posts it.
    connectedCallback() {
        if (!PARENT_ORIGIN || this.resizeObserver) {
            return;
        }

        const unlockHeightStyle = document.createElement('style');
        unlockHeightStyle.textContent = UNLOCK_DOCUMENT_HEIGHT;
        document.head.appendChild(unlockHeightStyle);

        // Measure the whole page, not just the flow, because the site adds its own spacing around it
        this.resizeObserver = new ResizeObserver(() => this.reportHeight(false));
        this.resizeObserver.observe(document.body);
    }

    // Only the values the website sets are passed: a flow fails to start on an input variable it doesn't have
    get flowInputVariables() {
        const values = {
            ...parseInputVariables(this.inputVariables),
            successUrl: this.successUrl,
            failureUrl: this.failureUrl
        };
        return Object.entries(values)
            .filter(([, value]) => value)
            .map(([name, value]) => ({ name, type: 'String', value: String(value) }));
    }

    disconnectedCallback() {
        clearTimeout(this.shrinkTimeout);
    }

    handleStatusChange() {
        // Fires once the new screen has rendered, so its height is final and may shrink
        this.reportHeight(true);
    }

    // Growing is reported at once, so a scrollbar never appears. Shrinking is reported at once after
    // a screen change; otherwise only if it lasts SHRINK_DELAY_MS, to skip the spinner between screens.
    reportHeight(allowShrink) {
        const height = Math.ceil(document.body.getBoundingClientRect().height);

        clearTimeout(this.shrinkTimeout);
        if (height === this.lastReportedHeight) {
            return;
        }

        if (height > this.lastReportedHeight || allowShrink) {
            this.postHeight(height);
            return;
        }

        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.shrinkTimeout = setTimeout(() => this.postHeight(height), SHRINK_DELAY_MS);
    }

    postHeight(height) {
        this.lastReportedHeight = height;
        window.parent.postMessage({ type: HEIGHT_MESSAGE_TYPE, height }, PARENT_ORIGIN);
    }
}
