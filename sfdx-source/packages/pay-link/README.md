# Pay Link Flow

A screen flow for links to an existing FinDock record: pay an invoice or a payment link, or change the payment method of a recurring payment. One card with the amount, a short summary and the FinDock payment methods. The [Pay Link Site](../pay-link-site/) hosts it.

*Key features*
- Pay an existing one-time installment, found by its GUID
- Invoice mode: To, From, Invoice number and Memo, with an optional invoice PDF
- Payment link mode: From and For
- Overdue badge when the due date has passed
- Collected installments show a paid confirmation instead of the payment methods, so an old link stays safe to open
- Recurring mode: when the id belongs to a recurring payment, the payer picks a new payment method for future payments (like FinDock PayLinks)
- An unknown or missing id shows a "not valid" message

The flow looks the id up as an installment and as a recurring payment, then shows one of three screens: pay, paid or not valid. The pay screen covers invoices, payment links and recurring payments with formulas instead of extra branches.


## Prerequisites
- FinDock is installed and configured, with at least one payment extension.
- The installments you link to have a GUID (`cpm__GUID__c`).


## Inputs

| Variable | Purpose |
|---|---|
| `id` | GUID of the installment to pay, or of the recurring payment to update. Required. |
| `type` | `invoice` (default) or `link`. Ignored for recurring payments. |
| `invoiceUrl` | Optional link to the invoice PDF, shown as a document thumbnail in invoice mode. |
| `merchantName` | Name shown as From. Defaults to the org name. |
| `successUrl`, `failureUrl` | Where the payer returns after paying. When empty, FinDock's defaults apply. |

For an installment, the amount is its open amount, the memo its bank statement description, and the payer its contact (and account, if set). For a recurring payment, the page shows its amount, frequency, next collection date and current payment method.

The pay button reads "Pay" in every mode.


## Installation
1. Deploy this package.
2. Open the flow in Flow Builder, select the **Payment Method Selector** on the Pay screen and choose the payment methods to offer (one-time and recurring). The template ships without this list because it depends on your payment extensions; without it the selector shows an error.
3. Assign the `FinDockLabs Pay Link Flow Guest Access` permission set and the `FinDock Payer` permission set group to the site guest user.
