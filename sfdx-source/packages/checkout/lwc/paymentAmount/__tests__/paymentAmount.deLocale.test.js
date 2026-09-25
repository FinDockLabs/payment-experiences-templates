import { createElement } from 'lwc';
import PaymentAmount from 'c/paymentAmount';

jest.mock('@salesforce/i18n/locale', () => ({ default: 'de-DE' }), { virtual: true });

it('places the currency after the amount for a German locale', () => {
    const element = createElement('c-checkout-currency-amount', { is: PaymentAmount });
    element.amount = '167.50';
    element.currencyIsoCode = 'EUR';
    document.body.appendChild(element);

    expect(element.shadowRoot.querySelector('.amount').textContent).toBe('167,50 €');
});
