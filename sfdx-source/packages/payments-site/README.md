# Experience Cloud Payment Pages Site Template

One Experience Cloud site with two pages, in the neutral "Your company" brand of the checkout and Payment Link templates:

| Page | URL | Flow |
|---|---|---|
| Checkout (Home) | `/<prefix>/` | [Checkout Flow](../checkout/): payment on the left, the order summary on the right |
| Payment Link | `/<prefix>/paylink?id=<installment GUID>` | [Payment Link Flow](../pay-link/): one card for an invoice, a payment link or a recurring payment's method |
| Payment received | `/<prefix>/payment-received` | The checkout's thank-you page |

Both pages share the header, footer, logo, theme and one style sheet. Use it instead of the separate [checkout site](../checkout-site/) and [Payment Link site](../pay-link-site/) when you want both in one install.

Payment Link URLs take the same parameters as the Payment Link site:

```
https://<your-domain>.my.site.com/<prefix>/paylink?id=<installment GUID>
https://<your-domain>.my.site.com/<prefix>/paylink?id=<installment GUID>&type=link
https://<your-domain>.my.site.com/<prefix>/paylink?id=<installment GUID>&invoice=<PDF url>
```

> After a payment the Payment Link Flow sends the payer to `https://www.example.com/success` (or `/failure`). Replace these in the flow with this site's pages, e.g. `https://<your-domain>.my.site.com/<prefix>/payment-received`; see step 5 of the [Payment Link Flow installation](../pay-link/#installation).


## Prerequisites
- FinDock is installed and configured, with at least one payment extension.
- The [Checkout Flow](../checkout/) and the [Payment Link Flow](../pay-link/) are deployed.
- Digital Experiences is enabled in the org.


## Installation
1. Create a new Experience Cloud site with the *Build your own (LWR)* option, named `Payment Pages`. The name must match exactly; the URL is up to you.
2. Deploy this package.
3. Assign these to the site guest user: the `FinDockLabs Checkout Flow Guest Access` and `FinDockLabs Payment Link Flow Guest Access` permission sets and the `FinDock Payer` permission set group. Assign the two permission sets to internal users who open the site while signed in to Salesforce too, or they see an access error instead of the flow.
4. In Administration › Preferences, enable **Allow guest users to access public APIs** (the Payment Link page returns a 401 without it).
5. In Experience Builder, set the company name in the header and footer, and check the theme.
6. Publish the site.

The installation asks you to approve three trusted sites: external.findock.com (payment method icons), and fonts.googleapis.com and fonts.gstatic.com (the web font).

> `Network` and `CustomSite` are not part of the package, for the same reason as the [checkout site](../checkout-site/): they hold org-specific values. Create the site first.


## Styling

The pages read the Experience Builder **Theme** panel:

| Theme panel setting | Drives |
|---|---|
| Brand colour | Pay buttons, selected payment method, company name on the Payment Link page |
| Background | The checkout page background (the Payment Link page keeps a light grey behind its card) |
| Text colours | Body text and the grey labels |
| Fonts | All text |

- Layout overrides live in the `paymentsStyles` static resource, loaded from the site's Head Markup. Its first part styles the shared header and footer and the checkout; the Payment Link part is scoped with `body:has(.paylink)`.
- The logo is the `paymentsLogo` static resource. Replace it with your own (square SVG or PNG).
- Both pages use the checkout's page layout (header with the logo and "Secure checkout", footer). Theme layouts can't be created by a metadata deploy, so the Payment Link page doesn't get a layout of its own.
- The flows mark texts with inline styles that the style sheet keys off; keep them when you edit the flows' texts.
