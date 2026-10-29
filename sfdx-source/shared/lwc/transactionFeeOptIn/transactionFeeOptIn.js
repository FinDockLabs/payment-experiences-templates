import { LightningElement, api } from 'lwc';
import { FlowAttributeChangeEvent } from 'lightning/flowSupport';
import ORG_CURRENCY from '@salesforce/i18n/currency';
import { formatAmount } from 'c/currencyUtils';
import { calculateFee } from './feeCalculation';

/**
 * Cover Transaction Fees
 *
 * Lets the donor add a percentage of the donation to cover transaction fees. The fee is
 * calculated once and shown in the checkbox label, formatted like the FinDock Pay button.
 * Map feeAmount to the Pay button's Transaction Fee Amount and add it to the amounts the
 * Pay button charges, so the donor is charged exactly what the screen shows.
 */
export default class TransactionFeeOptIn extends LightningElement {
    @api amountOneTime;
    @api amountRecurring;
    @api currencyIsoCode;
    @api percentage;
    // Checkbox label; {0} is replaced by the formatted fee.
    @api label;
    @api value = false;
    @api feeAmount;

    _publishedFeeAmount;

    renderedCallback() {
        // Every input change re-renders the label, so this keeps feeAmount current.
        this.publishFeeAmount();
    }

    get currency() {
        return this.currencyIsoCode || ORG_CURRENCY;
    }

    get isRecurring() {
        return this.isBlank(this.amountOneTime) && !this.isBlank(this.amountRecurring);
    }

    // The selected donation amount; the flow sets only the one of the chosen frequency.
    get baseAmount() {
        return this.toNumber(this.isRecurring ? this.amountRecurring : this.amountOneTime);
    }

    get calculation() {
        return calculateFee(this.baseAmount, this.toNumber(this.percentage), this.currency);
    }

    get hasFee() {
        return this.calculation != null;
    }

    get isSelected() {
        return this.value === true && this.hasFee;
    }

    get checkboxLabel() {
        return (this.label ?? '').replace('{0}', formatAmount(this.calculation.fee, this.currency));
    }

    handleChange(event) {
        this.value = event.target.checked;
        this.dispatchEvent(new FlowAttributeChangeEvent('value', this.value));
    }

    // Publishes only on change, because renderedCallback runs after every render.
    publishFeeAmount() {
        const feeAmount = String(this.isSelected ? this.calculation.fee : 0);
        if (feeAmount === this._publishedFeeAmount) {
            return;
        }
        this._publishedFeeAmount = feeAmount;
        this.dispatchEvent(new FlowAttributeChangeEvent('feeAmount', feeAmount));
    }

    isBlank(value) {
        return value == null || value === '';
    }

    toNumber(value) {
        if (this.isBlank(value)) {
            return null;
        }
        const num = Number(String(value).replace(/[^0-9.-]/g, ''));
        return Number.isNaN(num) ? null : num;
    }
}
