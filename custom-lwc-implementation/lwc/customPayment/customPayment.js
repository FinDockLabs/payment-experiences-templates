import { api, LightningElement, track, wire } from "lwc";
import { CurrentPageReference } from "lightning/navigation";
import {FlowAttributeChangeEvent} from "lightning/flowSupport";

export default class CustomPayment extends LightningElement {
    @api recordId;
    @api screenMode = 'OneScreen'; // OneScreen | MultiScreen
    @track firstName = '';
    @track lastName = '';
    @track email = '';
    @track amountOneTime = null;
    @track amountRecurring = null;
    @track frequency = 'oneTime';
    @track selectedPaymentMethod = null;
    @track currentStep = 1;

    @wire(CurrentPageReference)
    currentPageReferenceWire;

    paymentMethodConfig = [
        {
            "key": "PaymentHub-Stripe-CreditCard",
            "name": "CreditCard",
            "processor": "PaymentHub-Stripe",
            "processorPrettyName": "Stripe",
            "processorFriendlyName": "Stripe",
            "active": true,
            "supportsRecurring": true,
            "displayLabel": "Credit Card",
            "enabledOneTime": true,
            "isDefaultOneTime": true,
            "enabledRecurring": true,
            "isDefaultRecurring": true,
            "merchantAccount": "stripe_merchant_account",
            "merchantAccountGroup": "static",
            "redirectInstruction": "",
            "target": "TestMerchant1",
            "parameters": null
        },
        {
            "key": "PaymentHub-Stripe-iDEAL",
            "name": "iDEAL",
            "processor": "PaymentHub-Stripe",
            "processorPrettyName": "Stripe",
            "processorFriendlyName": "Stripe",
            "active": true,
            "supportsRecurring": false,
            "displayLabel": "iDEAL",
            "enabledOneTime": true,
            "isDefaultOneTime": false,
            "enabledRecurring": false,
            "isDefaultRecurring": false,
            "merchantAccount": "stripe_merchant_account",
            "merchantAccountGroup": "static",
            "redirectInstruction": "You will be redirected to your bank to complete the payment.",
            "target": "TestMerchant1",
            "parameters": null
        }];

    @track paymentIntent = {};

    connectedCallback() {
        const attributeChangeEvent = new FlowAttributeChangeEvent('context', '{}');
        console.log(attributeChangeEvent);

        const ce = new CustomEvent('deploymentStarted', {
            bubbles: true,
            composed: true
        });

        console.log(ce);

    }
    handleFieldChange(event) {
        this[event.target.dataset.field] = event.detail.value;
        this._updatePaymentIntentContext();
    }
    handleAmountFrequencyChanged(event) {
        this.amountOneTime = event.detail.amountOneTime;
        this.amountRecurring = event.detail.amountRecurring;
        this.frequency = event.detail.frequency;
        this._updatePaymentIntentContext();
    }
    handlePaymentMethodChanged(event) {
        this.selectedPaymentMethod = event.detail;
        this._updatePaymentIntentContext();
    }
    // MultiScreen navigation
    get isMultiScreen() {
        return this.screenMode === 'MultiScreen';
    }
    get showAmountStep() {
        return !this.isMultiScreen || this.currentStep === 1;
    }
    get showPersonalInfoStep() {
        return !this.isMultiScreen || this.currentStep === 2;
    }
    get showPaymentStep() {
        return !this.isMultiScreen || this.currentStep === 3;
    }
    get isStep1NextDisabled() {
        const amount = this.frequency === 'recurring' ? this.amountRecurring : this.amountOneTime;
        return !(amount && Number(amount) > 0);
    }
    get isStep2NextDisabled() {
        return !(this.firstName && this.lastName && this.email);
    }
    handleNextStep() {
        if (this.currentStep < 3) {
            this.currentStep += 1;
        }
    }
    handlePreviousStep() {
        if (this.currentStep > 1) {
            this.currentStep -= 1;
        }
    }
    get isPayButtonDisabled() {
        const amount = this.frequency === 'recurring' ? this.amountRecurring : this.amountOneTime;
        return !(
            this.firstName &&
            this.lastName &&
            this.email &&
            amount &&
            Number(amount) > 0 &&
            this.selectedPaymentMethod
        );
    }
    _updatePaymentIntentContext() {
        const isRecurring = this.frequency === 'recurring';
        this.paymentIntent = {
            SuccessURL: 'https://example.com/success',
            FailureURL: 'https://example.com/failure',
            Payer: {
                Contact: {
                    SalesforceFields: {
                        FirstName: this.firstName,
                        LastName: this.lastName,
                        Email: this.email,
                    }
                }
            },
            ...(isRecurring ? {
                Recurring: {
                    Amount: this.amountRecurring,
                    CurrencyISOCode: 'EUR'
                }
            } : {
                OneTime: {
                    Amount: this.amountOneTime,
                    CurrencyISOCode: 'EUR'
                }
            }),
            PaymentMethod: {
                Name: this.selectedPaymentMethod?.name ?? 'CreditCard',
                Processor: this.selectedPaymentMethod?.processor ?? 'DummyExtension-PSP',
                Target: this.selectedPaymentMethod?.target ?? 'TestMerchant1'
            }
        };
    }
}