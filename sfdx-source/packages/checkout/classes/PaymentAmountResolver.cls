/**
 * Returns the amount and currency of an existing checkout record for the Flow screen.
 */
public with sharing class PaymentAmountResolver {
    /**
     * Resolves the payment amount and currency for each Checkout flow interview.
     * @param requests Existing checkout records already loaded by the flow.
     * @return One display result per request, in the same order.
     */
    @InvocableMethod(Label='Resolve Payment Amount' Description='Reads the amount and currency of an existing payment record for display.' Category='FinDock Experience Cloud')
    public static List<Result> resolve(List<Request> requests) {
        List<Result> results = new List<Result>();
        if (requests == null) {
            return results;
        }

        for (Request request : requests) {
            results.add(resolveOne(request));
        }
        return results;
    }

    private static Result resolveOne(Request request) {
        Result result = new Result();
        if (request == null) {
            return result;
        }

        SObject record = null;
        if (request.recurringPayment != null) {
            record = request.recurringPayment;
            result.amount = request.recurringPayment.cpm__Amount__c;
        } else if (request.installment != null) {
            record = request.installment;
            result.amount = request.installment.cpm__Amount_Open__c;
        }

        result.currencyIsoCode = record == null ? null : currencyOf(record);
        return result;
    }

    private static String currencyOf(SObject record) {
        if (!UserInfo.isMultiCurrencyOrganization()) {
            return UserInfo.getDefaultCurrency();
        }
        return (String) record.get('CurrencyIsoCode');
    }

    /**
     * Existing checkout records.
     */
    public class Request {
        @InvocableVariable(Label='Installment')
        public cpm__Installment__c installment;

        @InvocableVariable(Label='Recurring Payment')
        public cpm__Recurring_Payment__c recurringPayment;
    }

    /**
     * Values used only to render the Checkout screen.
     */
    public class Result {
        @InvocableVariable(Label='Amount')
        public Decimal amount;

        @InvocableVariable(Label='Currency ISO code')
        public String currencyIsoCode;
    }
}
