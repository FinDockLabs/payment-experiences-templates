import { createElement } from 'lwc';
import PaymentAmount from 'c/paymentAmount';

jest.mock('@salesforce/i18n/locale', () => ({ default: 'en-US' }), { virtual: true });
jest.mock('@salesforce/i18n/currency', () => ({ default: 'USD' }), { virtual: true });

function render(amount, currencyIsoCode) {
    const element = createElement('c-payment-amount', { is: PaymentAmount });
    element.amount = amount;
    element.currencyIsoCode = currencyIsoCode;
    document.body.appendChild(element);
    return element;
}

function textOf(element) {
    const amount = element.shadowRoot.querySelector('.amount');
    return amount === null ? null : amount.textContent;
}

afterEach(() => {
    document.body.innerHTML = '';
});

it('formats the payment currency instead of the org currency', () => {
    expect(textOf(render('167.50', 'EUR'))).toBe('€167.50');
});

it('falls back to the org currency when no payment currency is passed', () => {
    expect(textOf(render('167.50', null))).toBe('$167.50');
});

it('keeps a negative amount, as used for refunds', () => {
    expect(textOf(render('-25.50', 'EUR'))).toBe('-€25.50');
});

it('strips grouping separators the flow added to the amount', () => {
    expect(textOf(render('1,234.56', 'EUR'))).toBe('€1,234.56');
});

it('applies the currency own precision instead of always showing two decimals', () => {
    expect(textOf(render('167', 'JPY'))).toBe('¥167');
});

it('shows trailing zeroes for a whole amount in a two-decimal currency', () => {
    expect(textOf(render('167', 'EUR'))).toBe('€167.00');
});

it('renders nothing when the flow passes no amount', () => {
    expect(textOf(render(null, 'EUR'))).toBeNull();
});

it('renders nothing when the amount has no numeric value', () => {
    expect(textOf(render('', 'EUR'))).toBeNull();
});

it('renders nothing for an unusable currency code', () => {
    expect(textOf(render('167.50', 'not-a-currency'))).toBeNull();
});
