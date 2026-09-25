import { LightningElement, api } from 'lwc';
import LOCALE from '@salesforce/i18n/locale';

/** Displays a Flow amount in its payment currency using the viewer's locale. */
export default class PaymentAmount extends LightningElement {
    @api amount;
    @api currencyIsoCode;

    get formattedAmount() {
        if (this.amount === null || this.amount === undefined || this.amount === '' || !this.currencyIsoCode) {
            return null;
        }

        const cleaned = String(this.amount).replace(/[^0-9.]/g, '');
        const amount = cleaned === '' ? NaN : Number(cleaned);
        if (!Number.isFinite(amount)) {
            return null;
        }

        try {
            return new Intl.NumberFormat(LOCALE ? LOCALE.replace(/_/g, '-') : 'en-US', {
                style: 'currency',
                currency: this.currencyIsoCode,
                currencyDisplay: 'narrowSymbol',
                minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
                maximumFractionDigits: 2
            }).format(amount);
        } catch {
            return null;
        }
    }
}
