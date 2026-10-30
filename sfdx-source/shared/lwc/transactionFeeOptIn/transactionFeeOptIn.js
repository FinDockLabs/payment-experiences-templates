import { LightningElement, api } from 'lwc';
import { FlowAttributeChangeEvent } from 'lightning/flowSupport';
import ORG_CURRENCY from '@salesforce/i18n/currency';
import { currencyDecimals, formatAmount } from 'c/currencyUtils';

/**
 * Cover Transaction Fees
 *
 * Lets the donor add a transaction fee to the donation. The flow calculates the fee, for example
 * as a percentage of the amount; the component shows it in the checkbox label, formatted like the
 * FinDock Pay button, and returns it as addedFee once the donor opts in. Add addedFee to the
 * amounts and map it to the Pay button's Transaction Fee Amount, so the donor is charged exactly
 * the fee shown.
 */
export default class TransactionFeeOptIn extends LightningElement {
    @api fee;
    @api currencyIsoCode;
    // Checkbox label; {0} is replaced by the formatted fee.
    @api label;
    @api helpText;
    @api value = false;
    @api addedFee;

    _publishedAddedFee;

    renderedCallback() {
        // A new fee or selection re-renders the label or the checkbox, so this keeps addedFee current.
        this.publishAddedFee();
    }

    get currency() {
        return this.currencyIsoCode || ORG_CURRENCY;
    }

    get feeNumber() {
        // Flow passes a plain decimal with a dot. Anything else is rejected rather than
        // reinterpreted, so "0,58" never becomes 58.
        const raw = String(this.fee ?? '').trim();
        return /^\d+(\.\d+)?$/.test(raw) ? Number(raw) : null;
    }

    get hasFee() {
        const fee = this.feeNumber;
        // Offer only a fee the currency can show exactly (e.g. no 2.90 in JPY), so the donor is
        // never charged an amount other than the one in the label. The flow owns the rounding.
        return fee > 0 && Number(fee.toFixed(currencyDecimals(this.currency))) === fee;
    }

    get isSelected() {
        return this.value === true && this.hasFee;
    }

    get checkboxLabel() {
        const formattedFee = formatAmount(this.feeNumber, this.currency);
        return (this.label ?? '').replace('{0}', formattedFee);
    }

    handleChange(event) {
        this.value = event.target.checked;
        this.dispatchEvent(new FlowAttributeChangeEvent('value', this.value));
    }

    // Publishes only on change, because renderedCallback runs after every render.
    publishAddedFee() {
        const addedFee = String(this.isSelected ? this.feeNumber : 0);
        if (addedFee === this._publishedAddedFee) {
            return;
        }
        this._publishedAddedFee = addedFee;
        this.dispatchEvent(new FlowAttributeChangeEvent('addedFee', addedFee));
    }
}
