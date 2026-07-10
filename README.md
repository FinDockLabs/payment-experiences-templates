# Templates for FinDock Payment Experiences

This repository is an overview of the templates we offer for building Salesforce-native digital experiences with [FinDock Payment Experiences.](https://docs.findock.com/docs/july-26/payments/findock-payment-experiences) There are three types of templates:

* **Site template**: a full Experience Cloud site template that that leverages our Flow templates (deployed separately) and managed Lighting Web Components (LWCs)   
* **Flow template**: a complete Flow for setting up a payment using our managed LWCs  
* **LWC template**: LWC template for building digital experiences without Flows

All templates are meant to be a starting point for your own configuration or custom development to fit specific use cases, branding, etc.

Out-of-the-box, all templates are:
- Accessible and WCAG compliant
- Fully localizable (language, currency, payment methods, etc.)
- Configurable to support multi-currency
- Configurable to support payment methods through FinDock native processing and integrated Payment Service Providers
- Fully extendable with Salesforce technology and clouds

If you prefer to build a fully custom implementation, on Salesforce or outside of Salesforce, please see our [custom Experience Cloud implementation repository](https://github.com/FinDockLabs/findock-experience-cloud-examples) or our [Payment API documentation](https://docs.findock.com/api/payment-api-v2).

## Available templates

**Membership, Subscription, Commerce, etc.**
- [Checkout flow](https://github.com/FinDockLabs/experience-cloud-checkout-flow): a simple Flow template for creating a payment form  
- [Checkout site](https://github.com/FinDockLabs/experience-cloud-checkout-site): Experience Cloud site template that implements the Checkout flow template

**Fundraising**
- [Donation flows for Fundraising](https://github.com/FinDockLabs/experience-cloud-donation-flows-fundraising): Multi-screen Flow template for collecting donations in orgs with Fundraising enabled (NPC, EDU)  
- [Donation flows for Fundraising UK](https://github.com/FinDockLabs/experience-cloud-donation-flows-fundraising-uk): Multi-screen Flow template for collecting donations and Gift Aid in orgs with Fundraising enabled (NPC, EDU)  
- [Donation flows for NPSP](https://github.com/FinDockLabs/experience-cloud-donation-flows-npsp): single and multi-screen Flow templates for collecting donations in orgs with NPSP
- [Donation site](https://github.com/FinDockLabs/experience-cloud-donation-site) Experience Cloud site template that implements the Donation flows for Fundraising and NPSP templates

**Any use-case**
- [LWC](https://github.com/FinDockLabs/experience-cloud-lwc): pro-code template for custom LWCs when you need full code control over layout, validation, navigation, etc. without using Flow. Components integrate with FinDock Payment API and are fully configurable.


## Experience Cloud & Guest User Setup

The steps below apply to every payment template in this project family — Flow-based or LWC-based — for any page that needs to accept payments from unauthenticated (guest) users. Each sub-repo's README links back here instead of repeating these steps.

1. Follow [these instructions](https://help.salesforce.com/s/articleView?id=experience.rss_flow_guestuser.htm&type=5) to set up Guest User access for your Experience Cloud site.
2. The **FinDock Experience Cloud permission set** must be assigned to the site's Guest User.
3. Go to Experience Cloud Administration → Preferences → enable **Allow guest users to access public APIs**.

If any of these are missing, guest-user payments will fail at runtime even though the page renders correctly.
