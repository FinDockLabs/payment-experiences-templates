import { createElement } from 'lwc';
import PaymentAmount from 'c/paymentAmount';

jest.mock('@salesforce/i18n/currency', () => ({ default: 'USD' }), { virtual: true });

function render(amount, currencyIsoCode) {
    const element = createElement('c-payment-amount', { is: PaymentAmount });
    element.amount = amount;
    element.currencyIsoCode = currencyIsoCode;
    document.body.appendChild(element);
    return element;
}

/**
 * The formatting itself is done by lightning-formatted-number, which is a stub in
 * jest and renders no text. These tests therefore assert the values the component
 * hands to it — the amount it parsed and the currency it resolved. The rendered
 * result per locale is platform behaviour and is verified in an org.
 */
function formattedNumber(element) {
    return element.shadowRoot.querySelector('lightning-formatted-number');
}

afterEach(() => {
    document.body.innerHTML = '';
});

it('formats as currency, in the viewer locale the platform applies', () => {
    expect(formattedNumber(render('167.50', 'EUR')).formatStyle).toBe('currency');
});

it('passes the payment currency instead of the org currency', () => {
    expect(formattedNumber(render('167.50', 'EUR')).currencyCode).toBe('EUR');
});

it('falls back to the org currency when no payment currency is passed', () => {
    expect(formattedNumber(render('167.50', null)).currencyCode).toBe('USD');
});

it('parses the amount the flow passed as a string', () => {
    expect(formattedNumber(render('167.50', 'EUR')).value).toBe(167.5);
});

it('keeps a negative amount, as used for refunds', () => {
    expect(formattedNumber(render('-25.50', 'EUR')).value).toBe(-25.5);
});

it('strips grouping separators the flow added to the amount', () => {
    expect(formattedNumber(render('1,234.56', 'EUR')).value).toBe(1234.56);
});

it('renders nothing when the flow passes no amount', () => {
    expect(formattedNumber(render(null, 'EUR'))).toBeNull();
});

it('renders nothing when the amount has no numeric value', () => {
    expect(formattedNumber(render('', 'EUR'))).toBeNull();
});
