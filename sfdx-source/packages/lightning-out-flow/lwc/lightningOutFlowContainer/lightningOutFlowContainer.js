import { LightningElement, api } from 'lwc';

// Lightning Out passes the host website's origin as loAppOrigin; height messages are sent only there.
const PARENT_ORIGIN = new URLSearchParams(window.location.search).get('loAppOrigin');
// The site stretches html and body to the iframe height; unlock them so body can be measured
const UNLOCK_DOCUMENT_HEIGHT = 'html,body{height:auto!important;min-height:100%!important;}';
const SHRINK_DELAY_MS = 2000;
// Must match the host website's message listener
const HEIGHT_MESSAGE_TYPE = 'flow:height';

export default class LightningOutFlowContainer extends LightningElement {
    @api flowApiName;
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
