# Experience Cloud Templates for FinDock
This repository contains an overview of the FinDock for Experience Cloud labs projects. These projects cover two approaches to building payment pages on Experience Cloud: a Flow-based approach using screen flow templates, and a code-first approach using LWC components. Both approaches rely on the same FinDock managed components for payment method selection and PaymentIntent submission, but differ in how the form is assembled. All projects are meant to be a starting point and can be further customized to fit specific use cases.

Additionally an example Experience Cloud site that demonstrates how an Experience Cloud site could be set up to serve as a donations page in a non-profit use case. The site includes a donation flow that utilizes the provided flow templates.

## Project overview
- [flow-templates](https://github.com/FinDockLabs/experience-cloud-flow-templates): This repository contains Flow-based templates to get you started with building payment flows for Experience Cloud using FinDock. The templates include a multi-screen and single-screen donation flow. Use this repo when you prefer configuring your payment form through Salesforce Flow rather than writing LWC code.
- [donation-page](https://github.com/FinDockLabs/experience-cloud-donation-template): This repository contains an example Experience Cloud site that can serve as a starting point for building a donation page using Experience Cloud and FinDock. The site includes space for a donation screen flow as well as additional content.
- [experience-cloud-lwc](https://github.com/FinDockLabs/experience-cloud-lwc): This repository contains LWC components for building payment pages on Experience Cloud without using Flow. Use this repo when you need full code control over your form's UX — layout, validation, field composition — while still relying on FinDock's managed `cpm-payment-method-selector` and `cpm-pay-button` components for payment method selection and PaymentIntent submission. This is the code-first alternative to the flow-templates repo; both use the same managed components, but here the form is assembled entirely in LWC.

## Experience Cloud & Guest User Setup

The steps below apply to every payment template in this project family — Flow-based or LWC-based — for any page that needs to accept payments from unauthenticated (guest) users. Each sub-repo's README links back here instead of repeating these steps.

1. Follow [these instructions](https://help.salesforce.com/s/articleView?id=experience.rss_flow_guestuser.htm&type=5) to set up Guest User access for your Experience Cloud site.
2. **FinDock | ProcessingHub must be installed AND connected** (from FinDock Setup). Installing alone is not enough — the connection step designates an integration user that handles async processing for guest-user payments.
3. **The FinDock Integration User permission set group must be assigned to the ProcessingHub integration user.**
4. **The FinDock Experience Cloud permission set must be assigned to the site's Guest User.**
5. Go to Experience Cloud Administration → Preferences → enable **Allow guest users to access public APIs**.

If any of these are missing, guest-user payments will fail at runtime even though the page renders correctly.
