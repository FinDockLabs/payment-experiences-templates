import { LightningElement, api } from 'lwc';
import { FlowAttributeChangeEvent } from 'lightning/flowSupport';
import ORG_CURRENCY from '@salesforce/i18n/currency';
import { formatAmount } from 'c/currencyUtils';

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

    get feeNumber() {
        if (this.fee == null || this.fee === '') {
            return null;
        }
        const num = Number(String(this.fee).replace(/[^0-9.-]/g, ''));
        return Number.isNaN(num) ? null : num;
    }

    get hasFee() {
        return this.feeNumber > 0;
    }

    get isSelected() {
        return this.value === true && this.hasFee;
    }

    get checkboxLabel() {
        const formattedFee = formatAmount(this.feeNumber, this.currencyIsoCode || ORG_CURRENCY);
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
