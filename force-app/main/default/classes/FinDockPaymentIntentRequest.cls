public class FinDockPaymentIntentRequest {
    @AuraEnabled public String successUrl;

    @AuraEnabled public String failureUrl;

    @AuraEnabled public FinDockPaymentIntentPayerRequest payer;

    @AuraEnabled public FinDockPaymentIntentPaymentMethodRequest paymentMethod;

    @AuraEnabled public FinDockPaymentIntentNewPaymentRequest oneTime;
}
