/**
 * Currency helpers for the payment templates.
 *
 * getActiveCurrencies backs currencyPicker's auto-detect mode (used when the component has
 * no explicit allow-list configured). getCheckoutDetails backs the "pay an existing record"
 * branch of the Checkout flow, which needs the amount and currency of a record it only knows
 * by GUID.
 *
 * In a multi-currency org the active codes are every active CurrencyType;
 * in a single-currency org it's just the org's default currency.
 */
public with sharing class CurrencyPickerController {
    @AuraEnabled(Cacheable=true)
    public static List<String> getActiveCurrencies() {
        if (!UserInfo.isMultiCurrencyOrganization()) {
            String defaultCurrency = UserInfo.getDefaultCurrency();
            return String.isNotBlank(defaultCurrency) ? new List<String> {
                defaultCurrency
            } : new List<String>();
        }

        List<String> codes = new List<String>();
        for (SObject ct : Database.query(
            'SELECT IsoCode FROM CurrencyType WHERE IsActive = TRUE ORDER BY IsoCode',
            System.AccessLevel.SYSTEM_MODE)) {
            codes.add((String) ct.get('IsoCode'));
        }
        return codes;
    }

    /**
     * Looks up the Installment or Recurring Payment a checkout link points at and returns only
     * what the payment screen needs. Replaces two Get Records elements in the flow so the
     * "record not found" case is answerable before the screen renders, and so the currency is
     * read the same way in single- and multi-currency orgs.
     *
     * Runs in system mode on purpose: a guest paying their own link is not given read access to
     * the payment objects, and the GUID in the link is the authorisation. Only the five fields
     * below ever leave this method.
     */
    @InvocableMethod(Label='Get FinDock Checkout Details' Description='Resolves the amount, currency and reference of the Installment or Recurring Payment behind a checkout GUID.' category='FinDock')
    public static List<CheckoutDetails> getCheckoutDetails(List<String> guids) {
        List<CheckoutDetails> results = new List<CheckoutDetails>();
        for (String guid : guids) {
            results.add(resolveCheckoutDetails(guid));
        }
        return results;
    }

    private static CheckoutDetails resolveCheckoutDetails(String guid) {
        CheckoutDetails details = new CheckoutDetails();
        if (String.isBlank(guid)) {
            return details;
        }

        String currencyField = UserInfo.isMultiCurrencyOrganization() ? ', CurrencyIsoCode' : '';

        for (SObject installment : Database.query(
            'SELECT Id, cpm__Amount_Open__c, cpm__Final_Payment_Reference__c' + currencyField +
            ' FROM cpm__Installment__c WHERE cpm__GUID__c = :guid LIMIT 1',
            System.AccessLevel.SYSTEM_MODE)) {
            details.found = true;
            details.isRecurring = false;
            details.recordId = (Id) installment.get('Id');
            details.amount = (Decimal) installment.get('cpm__Amount_Open__c');
            details.reference = (String) installment.get('cpm__Final_Payment_Reference__c');
            details.currencyIsoCode = currencyIsoCodeOf(installment);
        }

        for (SObject recurring : Database.query(
            'SELECT Id, cpm__Amount__c, cpm__Frequency__c, cpm__Final_Payment_Reference__c' + currencyField +
            ' FROM cpm__Recurring_Payment__c WHERE cpm__GUID__c = :guid LIMIT 1',
            System.AccessLevel.SYSTEM_MODE)) {
            // A recurring payment wins: its schedule drives the amount and frequency shown,
            // and the API derives the payment currency from it.
            details.found = true;
            details.isRecurring = true;
            details.recurringId = (Id) recurring.get('Id');
            details.amount = (Decimal) recurring.get('cpm__Amount__c');
            details.frequency = (String) recurring.get('cpm__Frequency__c');
            details.currencyIsoCode = currencyIsoCodeOf(recurring);
            if (String.isBlank(details.reference)) {
                details.reference = (String) recurring.get('cpm__Final_Payment_Reference__c');
            }
        }

        return details;
    }

    private static String currencyIsoCodeOf(SObject record) {
        return UserInfo.isMultiCurrencyOrganization()
            ? (String) record.get('CurrencyIsoCode')
            : UserInfo.getDefaultCurrency();
    }

    /**
     * What the payment screen needs to show and pay a record it only knows by GUID.
     * When found is false the flow shows its not-found screen and never reaches the Pay Button.
     */
    public class CheckoutDetails {
        @InvocableVariable(Label='Record found')
        public Boolean found = false;

        @InvocableVariable(Label='Is recurring')
        public Boolean isRecurring = false;

        @InvocableVariable(Label='Installment Id')
        public Id recordId;

        @InvocableVariable(Label='Recurring Payment Id')
        public Id recurringId;

        @InvocableVariable(Label='Amount')
        public Decimal amount;

        @InvocableVariable(Label='Currency ISO code')
        public String currencyIsoCode;

        @InvocableVariable(Label='Payment reference')
        public String reference;

        @InvocableVariable(Label='Frequency')
        public String frequency;
    }
}
