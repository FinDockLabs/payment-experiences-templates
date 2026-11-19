# Lightning Out Flow
<!-- INSTALL_LINK:START -->
<a href="https://login.salesforce.com/packaging/installPackage.apexp?p0=04tP4000001qWknIAE" target="_blank" rel="noopener noreferrer"><img alt="Install in a production or Developer org" src="https://img.shields.io/badge/Install-Production%20or%20Developer%20org-00A1E0?style=for-the-badge"></a>
<a href="https://test.salesforce.com/packaging/installPackage.apexp?p0=04tP4000001sg89IAA" target="_blank" rel="noopener noreferrer"><img alt="Install in a sandbox" src="https://img.shields.io/badge/Install-Sandbox-6B7A8F?style=for-the-badge"></a>

Version 1.0.0-1 (production) · 1.0.0-2 (sandbox)
<!-- INSTALL_LINK:END -->

Runs a screen flow on an external website through Lightning Out 2.0.

Lightning Out 2.0 embeds Lightning Web Components, not Flows. The Flow container is a Lightning web component that runs a screen flow, so the Flow can be placed on any website. It also keeps the iframe as tall as the Flow, so the website shows no inner scrollbar as the payer moves between screens.

The container works with any screen flow. You can use the FinDock donation and checkout Flow templates, or a flow you build yourself.

For further information about using Lightning Out, see [Payment Experiences with Lightning Out 2.0](https://docs.findock.com/docs/payments/payment-experiences-with-lightning-out-2-0).

## Lightning Out app components

Lightning Out only loads components that are on your Lightning Out app's list, including the ones a flow uses inside it. Add the container (`c-lightning-out-flow-container`) and the components of the flow you embed, then publish the Lightning Out site. A missing component stops the flow with an unhandled fault.

| Flow | Components to add |
|---|---|
| [Checkout Flow](../checkout/#lightning-out) | `c-get-user-agent-info`, `cpm-pay-button`, `cpm-payment-method-selector` |
| [Payment Link Flow](../payment-link/#lightning-out) | `cpm-pay-button`, `cpm-payment-method-selector` |
| [Donation Flow for NPSP](../donation-npsp/#lightning-out) | `c-amount-and-frequency`, `c-currency-picker`, `c-experience-progress-stages`, `c-get-user-agent-info`, `cpm-pay-button`, `cpm-payment-method-selector` |
| [Donation Flow for Fundraising](../donation-fundraising/#lightning-out) | `c-amount-and-frequency`, `c-currency-picker`, `c-experience-progress-stages`, `c-get-user-agent-info`, `c-transaction-fee-opt-in`, `cpm-pay-button`, `cpm-payment-method-selector` |
| [One Screen Donation Flow](../donation-fundraising/#lightning-out) | `c-amount-and-frequency`, `c-currency-picker`, `cpm-pay-button`, `cpm-payment-method-selector` |
| [Donation Flow for Fundraising UK](../donation-fundraising-uk/#lightning-out) | `c-amount-and-frequency`, `c-experience-progress-stages`, `c-get-user-agent-info`, `c-transaction-fee-opt-in`, `cpm-pay-button`, `cpm-payment-method-selector` |

## Website: success and failure URLs

FinDock sends the payer to a success or a failure URL after the payment. Set them on the container with the optional `success-url` and `failure-url` attributes (or as Custom Properties in Lightning Out 2.0 App Manager):

```html
<c-lightning-out-flow-container
    flow-api-name="Checkout_Flow"
    success-url="https://www.example.org/thank-you"
    failure-url="https://www.example.org/payment-failed">
</c-lightning-out-flow-container>
```

The container passes each URL that is set to the flow's `successUrl` or `failureUrl` input variable. All FinDock flow templates have these inputs and use `https://www.example.com/success` and `/failure` without them. For your own flow, add String input variables with these names before you set the attributes, or the flow doesn't start.

## Website: auto-sizing the flow

The container sends its height to the website as a `flow:height` message; this script applies it. Add it to the website page, after the Lightning Out markup:

```html
<script>
    const flowOrigin = new URL(document.querySelector('lightning-out-application').getAttribute('org-url')).origin;
    const flowContainer = document.querySelector('c-lightning-out-flow-container');

    window.addEventListener('message', (event) => {
        if (event.origin === flowOrigin && event.data?.type === 'flow:height') {
            flowContainer.style.height = `${event.data.height}px`;
        }
    });
</script>
```

- `flowOrigin` is the site's address, read from the `org-url` attribute. Messages from any other address are ignored.
- `type === 'flow:height'` skips Lightning Out's own messages.
- The iframe fills `<c-lightning-out-flow-container>`, so setting the container's height sizes the iframe.

Do not use `flex: 1` or a height `transition` on `c-lightning-out-flow-container`. Using `flex: 1` overrides the height the script sets, and a transition makes a scrollbar flash each time the Flow screen grows.