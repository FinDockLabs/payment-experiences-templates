# Lightning Out Flow

Runs a screen flow on an external website through Lightning Out 2.0.

Lightning Out 2.0 embeds Lightning web components, not flows. The flow container is a Lightning web component that runs a screen flow, so the flow can be placed on any website. It also keeps the iframe as tall as the flow, so the website shows no inner scrollbar as the payer moves between screens.

The container works with any screen flow: the FinDock donation and checkout flow templates, or a flow you build yourself.

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

Don't put `flex: 1` or a height `transition` on `c-lightning-out-flow-container`. `flex: 1` overrides the height the script sets, and a transition makes a scrollbar flash each time the flow grows.