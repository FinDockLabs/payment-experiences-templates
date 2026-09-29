import { LightningElement, api } from 'lwc';
import ORG_CURRENCY from '@salesforce/i18n/currency';

/**
 * Displays a Flow amount in its payment currency, formatted for the viewer's locale.
 *
 * Pass currencyIsoCode when the payment currency can differ from the org currency —
 * in a multi-currency org that is the record's CurrencyIsoCode field. When it is left
 * empty the component falls back to the org currency, which is the only currency a
 * single-currency org has.
 */
export default class PaymentAmount extends LightningElement {
    @api amount;
    @api currencyIsoCode;

    get numericAmount() {
        if (this.amount == null || this.amount === '') {
            return null;
        }
        const cleaned = String(this.amount).replace(/[^0-9.-]/g, '');
        const num = Number(cleaned);

        return Number.isNaN(num) ? null : num;
    }

    get currency() {
        return this.currencyIsoCode || ORG_CURRENCY;
    }
}
