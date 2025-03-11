public class FinDockPaymentIntentInvocable {
    @InvocableMethod(label='Create Payment Intent' description='Create a Payment Intent in FinDock' category='FinDock')
    public static List<FinDockPaymentIntentInvocableOutput> createPaymentIntent(List<FinDockPaymentIntentInvocableInput> inputs) {
        return new List<FinDockPaymentIntentInvocableOutput>{new FinDockPaymentIntentInvocableOutput('a0H1v00000L6Y8CEAV', 'https://example.com')};
    }
    

    public class FindockPaymentIntentInvocableInput {
        @InvocableVariable(label='Payment Intent Request' description='A Payment Intent Request built in a Transform step' required=true)
        public FinDockPaymentIntentRequest paymentIntentRequest;
    }

    public class FinDockPaymentIntentInvocableOutput {
        FinDockPaymentIntentInvocableOutput(Id id, String redirectUrl) {
            this.id = id;
            this.redirectUrl = redirectUrl;
        }

        @InvocableVariable(label='Id' description='The Payment Intent Id. Can also be found on the Inbound Report record in Salesforce.')
        public Id id;

        @InvocableVariable(label='RedirectUrl' description='URL where the user should be redirected to so additional information can be provided to complete the payment. This is primarily used for hosted payment forms of PSPs.')
        public String redirectUrl;
    }
}