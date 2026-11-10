# Experience Cloud Donation Site Template
<!-- INSTALL_LINK:START -->
<a href="https://login.salesforce.com/packaging/installPackage.apexp?p0=04tP4000001hYQrIAM" target="_blank" rel="noopener noreferrer"><img alt="Install in a production or Developer org" src="https://img.shields.io/badge/Install-Production%20or%20Developer%20org-00A1E0?style=for-the-badge"></a>
<a href="https://test.salesforce.com/packaging/installPackage.apexp?p0=04tP4000001hYQrIAM" target="_blank" rel="noopener noreferrer"><img alt="Install in a sandbox" src="https://img.shields.io/badge/Install-Sandbox-6B7A8F?style=for-the-badge"></a>

Version 0.1.0-3
<!-- INSTALL_LINK:END -->

This Experience Cloud site template serves as a starting point for building a donation page using Experience Cloud and FinDock. The site is a simple single page that uses one of the Donation Flows.

The site is meant to be customized and extended to fit the specific use case and requirements of your site. For other options, see [the main Experience Cloud repository](../../../README.md).

*Key features*
- Collect new one-time payments
- Set up new recurring donations


## Prerequisites
- FinDock is installed and configured.
- At least one payment extension is installed and configured.
- One of the [Donation Flow templates](../../../README.md#available-templates) is deployed. The site's home page references a flow named `Donation_Flow`; the template deploys without it, but the site cannot be *published* until it exists.
- Digital Experiences is enabled in the org.

## Installation
1. Create a new Experience Cloud site with the *Build your own (LWR)* option and name it `Donation Page`.
2. Press the button above to install the site template to your org.
3. Customize the page in the Experience Cloud builder.
4. Publish the Experience Cloud site.

The installation will ask you to approve three trusted sites: external.findock.com (icons and pictures), and fonts.googleapis.com and fonts.gstatic.com (the site's web fonts).

> The site itself is not part of this package. `Network` and `CustomSite` are deliberately excluded in `.forceignore` because they embed the creating user's email address and the org subdomain, which are not portable between orgs. This is why the site has to be created before the template is deployed.


## Styling

The design reads the Experience Builder **Theme** panel, so you can rebrand without editing CSS:

| Theme panel setting | Drives |
|---|---|
| Brand colour | Buttons, selected states, step indicator, and the light tints derived from it |
| Background | Page background and header |
| Text colours | Body copy and captions |
| Fonts | Body and heading fonts |
| Button and form element radius | Pills, tiles and fields |

- Layout and component overrides live in the `canopyStyles` static resource, loaded from the page's Head Markup.
- The accent colour, which has no Theme panel setting, is one `:root` line in Head Markup.
- Replace the logo and images in the static resources, or point the components at your own files.
- See [Payment Experiences styling](https://docs.findock.com/docs/november-26/payments/payment-experiences-styling) for the styling hooks.
