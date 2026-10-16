import { LightningElement, api } from 'lwc';

export default class PayButton extends LightningElement {
    @api paymentIntent;
    @api disabled;
    @api paymentGroupId;
    // Inputs asserted by the donation wrapper tests; payment execution stays mocked.
    @api installment;
    @api successUrl;
    @api sourceConnector;
    @api recurringObject;
    @api giftAidEnabled;
    @api giftAidFirstName;
    @api giftAidPostalCode;
    @api giftTributeEnabled;
    @api giftTributeHonoreeName;
    // Display inputs the real button uses to render its "Pay <amount>" label.
    @api amountOneTime;
    @api currencyOneTime;
    @api amountRecurring;
    @api currencyRecurring;
}
