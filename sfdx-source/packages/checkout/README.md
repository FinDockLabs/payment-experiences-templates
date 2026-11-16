# Experience Cloud Checkout Flow
<!-- INSTALL_LINK:START -->
<a href="https://login.salesforce.com/packaging/installPackage.apexp?p0=04tP4000001lWVJIA2" target="_blank" rel="noopener noreferrer"><img alt="Install in a production or Developer org" src="https://img.shields.io/badge/Install-Production%20or%20Developer%20org-00A1E0?style=for-the-badge"></a>
<a href="https://test.salesforce.com/packaging/installPackage.apexp?p0=04tP4000001rFpyIAE" target="_blank" rel="noopener noreferrer"><img alt="Install in a sandbox" src="https://img.shields.io/badge/Install-Sandbox-6B7A8F?style=for-the-badge"></a>

Version 0.1.0-4
<!-- INSTALL_LINK:END -->

> **Compatibility:** Install only one template variant per org. See the [package compatibility notes](../../../README.md#package-compatibility).

This template contains a Flow template to help you get started with building digital payment experiences using Experience Cloud and FinDock Payment Experiences. The flow included is designed for commercial use cases such as invoices, subscriptions and recovering failed payments.

This template is meant to be customized and extended to fit specific use cases and requirements. For other options, see [Templates for FinDock Payment Experiences](https://github.com/FinDockLabs/payment-experiences-templates).

*Key features*
- Collect new one-time payments
- Set up new recurring payments

The flow only takes new payments. To pay an existing installment or update a recurring payment's method, use the [Payment Link Flow](../pay-link/).

## Success and failure URLs

FinDock needs a success and a failure URL for every payment. The flow uses `https://www.example.com/success` and `https://www.example.com/failure` unless the page passes the optional `successUrl` and `failureUrl` inputs (the Lightning Out embed does). Replace the example URLs in the `Success_URL` and `Failure_URL` formulas with your own pages, e.g. the checkout site's `https://<your-domain>.my.site.com/<prefix>/payment-received`.

## Order details
The flow shows example order details. The element **Placeholder: get order details** fills `amount`, `currency`, `reference`, `frequency` and the payer's `Contact` with example values, and the Pay screen's order summary lists example order lines. Replace that element with a Get Records element that reads the order to pay, for example the standard Order object (Orders must be enabled in Setup), an Opportunity or your own object. The flow's optional `id` input variable (`?id=` in the page URL) is there to find that record. Give the site guest user read access to the object and fields you read.

## Prerequisites
- FinDock is installed and configured.
- FinDock is the source of payments data ([FinDock Standalone](https://docs.findock.com/docs/source-connectors/findock-standalone)).
- At least one payment extension is installed and configured.
- Digital Experiences is enabled in the org.


## Installation
1. Install the package using the link above.
2. Assign the **FinDockLabs Checkout Flow Guest Access** permission set to your Experience Cloud site guest user. Also assign it to internal users who open the site while signed in to Salesforce: the flow only runs for users with access, so they see an access error instead of the form.
3. Complete the **FinDock Payer** permission set group assignment described in [Experience Cloud & Guest User Setup](https://github.com/FinDockLabs/payment-experiences-templates#experience-cloud--guest-user-setup).
4. Go to the checkout Flow -> Payment Screen -> Payment Method Selection component
   - configure at least one payment method
5. Configure the [payment intent](https://docs.findock.com/docs/payments/building-payment-experiences#using-pay-button-in-flows) (add at least success and failure URLs and verify the mapping matches your use case).
6. Activate your flow.
7. Go to the Experience Cloud Administration -> Preferences -> enable "Allow guest users to access public APIs".
8. Add the flow to your Experience Cloud site.
