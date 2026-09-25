@IsTest
private class PaymentAmountResolverTest {
    @IsTest
    static void resolvesInstallmentCurrency() {
        PaymentAmountResolver.Request request = new PaymentAmountResolver.Request();
        request.installment = new cpm__Installment__c(cpm__Amount_Open__c = 25.50);
        String expected = UserInfo.getDefaultCurrency();
        if (UserInfo.isMultiCurrencyOrganization()) {
            request.installment.put('CurrencyIsoCode', expected);
        }

        Test.startTest();
        List<PaymentAmountResolver.Result> results =
            PaymentAmountResolver.resolve(new List<PaymentAmountResolver.Request> {request});
        Test.stopTest();

        Assert.areEqual(1, results.size(), 'The action returns one result per request');
        Assert.areEqual(expected, results[0].currencyIsoCode, 'The displayed currency matches the record');
        Assert.areEqual(Decimal.valueOf('25.50'), results[0].amount, 'The open amount comes from the Installment');
    }

    @IsTest
    static void prefersRecurringPaymentWhenBothRecordsExist() {
        PaymentAmountResolver.Request request = new PaymentAmountResolver.Request();
        request.installment = new cpm__Installment__c(cpm__Amount_Open__c = 25);
        request.recurringPayment = new cpm__Recurring_Payment__c(cpm__Amount__c = 10);
        String expected = UserInfo.getDefaultCurrency();
        if (UserInfo.isMultiCurrencyOrganization()) {
            request.installment.put('CurrencyIsoCode', 'USD');
            request.recurringPayment.put('CurrencyIsoCode', expected);
        }

        Test.startTest();
        List<PaymentAmountResolver.Result> results =
            PaymentAmountResolver.resolve(new List<PaymentAmountResolver.Request> {request});
        Test.stopTest();

        Assert.areEqual(expected, results[0].currencyIsoCode, 'Recurring Payment determines the displayed currency');
        Assert.areEqual(Decimal.valueOf('10'), results[0].amount,
            'Recurring Payment also determines the displayed amount');
    }

    @IsTest
    static void returnsBlankForMissingRecordWithoutLeakingAnotherCurrency() {
        PaymentAmountResolver.Request request = new PaymentAmountResolver.Request();

        Test.startTest();
        List<PaymentAmountResolver.Result> results =
            PaymentAmountResolver.resolve(new List<PaymentAmountResolver.Request> {request});
        Test.stopTest();

        Assert.isNull(results[0].currencyIsoCode, 'A missing checkout record has no display currency');
        Assert.isNull(results[0].amount, 'A missing checkout record has no amount to display');
    }

    @IsTest
    static void preservesResultOrderForBulkFlowExecution() {
        List<PaymentAmountResolver.Request> requests = new List<PaymentAmountResolver.Request>();
        for (Integer index = 0; index < 251; index++) {
            PaymentAmountResolver.Request request = new PaymentAmountResolver.Request();
            if (index != 1) {
                request.installment = new cpm__Installment__c(cpm__Amount_Open__c = 1);
                if (UserInfo.isMultiCurrencyOrganization()) {
                    request.installment.put('CurrencyIsoCode', UserInfo.getDefaultCurrency());
                }
            }
            requests.add(request);
        }

        Test.startTest();
        List<PaymentAmountResolver.Result> results = PaymentAmountResolver.resolve(requests);
        Test.stopTest();

        Assert.areEqual(requests.size(), results.size(), 'Every Flow request receives a result');
        Assert.areEqual(UserInfo.getDefaultCurrency(), results[0].currencyIsoCode, 'First record keeps its currency');
        Assert.isNull(results[1].currencyIsoCode, 'Missing second record stays blank');
        Assert.areEqual(UserInfo.getDefaultCurrency(), results[250].currencyIsoCode, 'Last record keeps its currency');
    }
}
