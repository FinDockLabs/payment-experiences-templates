@IsTest
private class CurrencyPickerControllerTest {
    @IsTest
    static void getActiveCurrenciesReturnsCodes() {
        Test.startTest();
        List<String> currencies = CurrencyPickerController.getActiveCurrencies();
        Test.stopTest();

        Assert.isNotNull(currencies, 'currencies should never be null');
        if (!UserInfo.isMultiCurrencyOrganization()) {
            Assert.areEqual(1, currencies.size(), 'Single-currency org should return one code');
            Assert.areEqual(UserInfo.getDefaultCurrency(), currencies[0], 'Single-currency org should return the user default');
        }
    }

    @IsTest
    static void getCheckoutDetailsResolvesInstallmentByGuid() {
        cpm__Installment__c installment = new cpm__Installment__c(cpm__Amount__c = 25, cpm__Amount_Open__c = 25);
        insert installment;
        String guid = [SELECT cpm__GUID__c FROM cpm__Installment__c WHERE Id = :installment.Id].cpm__GUID__c;

        Test.startTest();
        CurrencyPickerController.CheckoutDetails details = CurrencyPickerController.getCheckoutDetails(new List<String> {guid})[0];
        Test.stopTest();

        Assert.isTrue(details.found, 'The installment should be resolved from its GUID');
        Assert.isFalse(details.isRecurring, 'A plain installment is a one-time payment');
        Assert.areEqual(installment.Id, details.recordId, 'The flow pays this installment');
        Assert.areEqual(25, details.amount, 'The open amount drives what the payer is shown');
        Assert.isNotNull(details.currencyIsoCode, 'Currency must resolve in single- and multi-currency orgs alike');
    }

    @IsTest
    static void getCheckoutDetailsPrefersRecurringPaymentOverInstallment() {
        cpm__Recurring_Payment__c recurring = new cpm__Recurring_Payment__c(cpm__Amount__c = 10);
        insert recurring;
        String guid = [SELECT cpm__GUID__c FROM cpm__Recurring_Payment__c WHERE Id = :recurring.Id].cpm__GUID__c;

        Test.startTest();
        CurrencyPickerController.CheckoutDetails details = CurrencyPickerController.getCheckoutDetails(new List<String> {guid})[0];
        Test.stopTest();

        Assert.isTrue(details.found, 'The recurring payment should be resolved from its GUID');
        Assert.isTrue(details.isRecurring, 'The schedule drives the amount and frequency shown');
        Assert.areEqual(recurring.Id, details.recurringId, 'The flow sets up this recurring payment');
        Assert.areEqual(10, details.amount, 'The recurring amount is what the payer is shown');
    }

    @IsTest
    static void getCheckoutDetailsReportsUnknownGuidInsteadOfFailing() {
        Test.startTest();
        List<CurrencyPickerController.CheckoutDetails> details =
            CurrencyPickerController.getCheckoutDetails(new List<String> {'no-such-guid', null});
        Test.stopTest();

        Assert.isFalse(details[0].found, 'An unknown GUID must be reported so the flow can explain it');
        Assert.isNull(details[0].recordId, 'Nothing should be payable for an unknown GUID');
        Assert.isFalse(details[1].found, 'A blank GUID must not query or throw');
    }
}
