import { createElement } from 'lwc';
import PaymentAmount from 'c/paymentAmount';

jest.mock('@salesforce/i18n/locale', () => ({ default: 'en-US' }), { virtual: true });

function render(amount, currencyIsoCode) {
    const element = createElement('c-checkout-currency-amount', { is: PaymentAmount });
    element.amount = amount;
    element.currencyIsoCode = currencyIsoCode;
    document.body.appendChild(element);
    return element;
}

afterEach(() => {
    document.body.innerHTML = '';
});

it('formats the chosen currency instead of the user currency', () => {
    const element = render('167.50', 'EUR');
    expect(element.shadowRoot.querySelector('.amount').textContent).toBe('€167.50');
});

it('does not show an amount without a payment currency', () => {
    const element = render('167.50', null);
    expect(element.shadowRoot.querySelector('.amount')).toBeNull();
});
