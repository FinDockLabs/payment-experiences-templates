import { LightningElement, api } from 'lwc';

// Lightning Out adds the host website's origin to the iframe URL as loAppOrigin.
// Height messages are sent only to this origin, so no other site receives them.
// On the Experience Cloud site itself it is absent and auto-sizing stays off.
const PARENT_ORIGIN = new URLSearchParams(window.location.search).get('loAppOrigin');
// The site stretches html and body to the iframe height; this lets body take its content height so it can be measured
const UNLOCK_DOCUMENT_HEIGHT = 'html,body{height:auto!important;min-height:100%!important;}';
// How long a smaller height must persist within a screen before it is reported
const SHRINK_DELAY_MS = 2000;
// Message type the host website listens for; it must match the website's message listener
const HEIGHT_MESSAGE_TYPE = 'flow:height';

export default class LightningOutFlowContainer extends LightningElement {
    // API name of the screen flow to run, set by the host website (flow-api-name attribute)
    @api flowApiName;
    resizeObserver;
    shrinkTimeout;
    lastReportedHeight = 0;

    // Lightning Out shows the flow in an iframe, and the host website can't see how tall its content is.
    // The component measures the page and posts its height; the website sets the iframe to that height.
    // Website-side setup: TODO add docs link
    connectedCallback() {
        // Not running inside Lightning Out, or already set up
        if (!PARENT_ORIGIN || this.resizeObserver) {
            return;
        }

        // Let the page grow and shrink with its content instead of filling the iframe
        const unlockHeightStyle = document.createElement('style');
        unlockHeightStyle.textContent = UNLOCK_DOCUMENT_HEIGHT;
        document.head.appendChild(unlockHeightStyle);

        // Measure the whole page, not just the flow, because the site adds its own spacing around it
        this.resizeObserver = new ResizeObserver(() => this.reportHeight(false));
        this.resizeObserver.observe(document.body);
    }

    disconnectedCallback() {
        clearTimeout(this.shrinkTimeout);
    }

    handleStatusChange() {
        // Fires once the new screen has rendered, so its height is final and may shrink
        this.reportHeight(true);
    }

    // Taller: report at once, so a scrollbar never appears.
    // Shorter after a screen change: report at once, the new screen is complete.
    // Shorter at any other time: report only if it stays shorter for SHRINK_DELAY_MS.
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

        // While loading the next screen the flow shows only a spinner; statuschange reports the new
        // screen, so this delayed shrink only applies to content shrinking within a screen
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.shrinkTimeout = setTimeout(() => this.postHeight(height), SHRINK_DELAY_MS);
    }

    postHeight(height) {
        this.lastReportedHeight = height;
        window.parent.postMessage({ type: HEIGHT_MESSAGE_TYPE, height }, PARENT_ORIGIN);
    }
}
