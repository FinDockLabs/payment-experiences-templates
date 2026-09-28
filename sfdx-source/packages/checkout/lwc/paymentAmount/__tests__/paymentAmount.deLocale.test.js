import { createElement } from 'lwc';
import PaymentAmount from 'c/paymentAmount';

jest.mock('@salesforce/i18n/locale', () => ({ default: 'de-DE' }), { virtual: true });
jest.mock('@salesforce/i18n/currency', () => ({ default: 'USD' }), { virtual: true });

it('places the currency after the amount for a German locale', () => {
    const element = createElement('c-payment-amount', { is: PaymentAmount });
    element.amount = '167.50';
    element.currencyIsoCode = 'EUR';
    document.body.appendChild(element);

    // Intl separates the amount and the symbol with a non-breaking space (U+00A0).
    expect(element.shadowRoot.querySelector('.amount').textContent).toBe('167,50 €');
});
