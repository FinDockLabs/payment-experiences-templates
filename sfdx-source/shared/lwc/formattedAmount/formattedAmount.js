import { LightningElement, api } from 'lwc';
import { FlowAttributeChangeEvent } from 'lightning/flowSupport';
import ORG_CURRENCY from '@salesforce/i18n/currency';
import { formatAmount } from 'c/currencyUtils';

const VARIANTS = new Set(['heading', 'text', 'checkbox']);

/**
 * Displays a Flow amount in its payment currency, formatted for the viewer's locale
 * the same way as the FinDock Pay button, so every amount on a payment screen matches.
 *
 * - heading (default): the amount on its own, large.
 * - text: the amount inside a sentence, for example a "Total {0}" line.
 * - checkbox: an opt-in with the amount in its label, for example a cover fee;
 *   the checked state is the value output. Unlike a standard Flow checkbox label,
 *   the label follows the amount when it changes on the same screen.
 *
 * Pass currencyIsoCode when the payment currency can differ from the org currency.
 * When it is left empty the component falls back to the org currency.
 */
export default class FormattedAmount extends LightningElement {
    @api amount;
    @api currencyIsoCode;
    // Text around the amount; {0} is replaced by the formatted amount.
    @api label;
    @api variant;
    @api value = false;

    get numericAmount() {
        if (this.amount == null || this.amount === '') {
            return null;
        }
        const num = Number(String(this.amount).replace(/[^0-9.-]/g, ''));
        return Number.isNaN(num) ? null : num;
    }

    get displayText() {
        const formatted = formatAmount(this.numericAmount, this.currencyIsoCode || ORG_CURRENCY);
        return (this.label || '{0}').replace('{0}', formatted);
    }

    get currentVariant() {
        return VARIANTS.has(this.variant) ? this.variant : 'heading';
    }

    get hasAmount() {
        return this.numericAmount != null;
    }

    get isHeading() {
        return this.currentVariant === 'heading';
    }

    get isText() {
        return this.currentVariant === 'text';
    }

    // An opt-in for nothing, such as a fee of 0, is not shown.
    get isCheckbox() {
        return this.currentVariant === 'checkbox' && this.numericAmount > 0;
    }

    handleCheckboxChange(event) {
        this.value = event.target.checked;
        this.dispatchEvent(new FlowAttributeChangeEvent('value', this.value));
    }
}
