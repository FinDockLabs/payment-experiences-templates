# Payment Link Flow

A screen flow for links to an existing FinDock record: pay an invoice or a payment link, or change the payment method of a recurring payment. One card with the amount, a short summary and the FinDock payment methods. The [Payment Link Site](../pay-link-site/) hosts it.

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

For an installment, the amount is its open amount, the memo its bank statement description, and the payer its contact (and account, if set). For a recurring payment, the page shows its amount, frequency, next collection date and current payment method.

The pay button reads "Pay" in every mode.


## Recurring object

The flow finds the recurring record in the element **Placeholder: get recurring record**. It reads a FinDock Recurring Payment, which every FinDock org has, so the template always deploys. If your recurring gifts are on another object, change it to match your data model:

| Data model | Object | GUID field | Amount, frequency and payment method |
|---|---|---|---|
| FinDock (default) | Recurring Payment (`cpm__Recurring_Payment__c`) | `cpm__GUID__c` | On the record (`cpm__Amount__c`, `cpm__Frequency__c`, `cpm__Payment_Method__c`) |
| NPSP | Recurring Donation (`npe03__Recurring_Donation__c`) | `npsp4hub__GUID__c` | On the record (`npe03__Amount__c`, `npsp4hub__Payment_Method__c`) |
| Nonprofit Cloud | Gift Commitment (`GiftCommitment`) | `fdff__GUID__c` | On its current schedule (`CurrentGiftCmtScheduleId`): add a second Get Records for the Gift Commitment Schedule |

In Flow Builder:
1. In **Placeholder: get recurring record**, change the object and the GUID filter.
2. Update the formulas and screen texts that use its fields (amount, currency, frequency, next payment date, current payment method, payer, reference).
3. Select the **Pay Button** on the Pay screen and set its recurring object type to the same object.
4. Create the guest user sharing rule (installation step 4) on that object.

## Installation
1. Deploy this package.
2. Open the flow in Flow Builder, select the **Payment Method Selector** on the Pay screen and choose the payment methods to offer (one-time and recurring). The template ships without this list because it depends on your payment extensions; without it the selector shows an error.
3. Assign the `FinDockLabs Payment Link Flow Guest Access` permission set and the `FinDock Payer` permission set group to the site guest user. Also assign the permission set to internal users who open the site while signed in to Salesforce: the flow only runs for users with access, so they see an access error instead of the card.
4. For recurring payment links: create a guest user sharing rule on your recurring object (Recurring Payment by default, see [Recurring object](#recurring-object); Setup › Sharing Settings) that shares records with the site's guest user, read only, e.g. for records where GUID is not blank. FinDock looks the recurring payment up as the guest user, and guests never see records through the organization-wide defaults; without the rule, changing the payment method fails with "Recurring record for the given Id/GUID could not be found". Installments don't need a rule.
5. Set the success and failure URLs. FinDock needs both for every payment, and the template ships with `https://www.example.com/success` and `https://www.example.com/failure`. In Flow Builder, select the **Pay Button** on the Pay screen and replace them with your own pages, e.g. `https://<your-domain>.my.site.com/<prefix>/success` and `.../failure`.
