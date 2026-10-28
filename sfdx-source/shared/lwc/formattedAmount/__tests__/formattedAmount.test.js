import { createElement } from 'lwc';
import FormattedAmount from 'c/formattedAmount';

jest.mock('@salesforce/i18n/currency', () => ({ default: 'USD' }), { virtual: true });
jest.mock('@salesforce/i18n/locale', () => ({ default: 'en-US' }), { virtual: true });

function render(props) {
    const element = createElement('c-formatted-amount', { is: FormattedAmount });
    Object.assign(element, props);
    document.body.appendChild(element);
    return element;
}

function text(element) {
    return element.shadowRoot.querySelector('p')?.textContent;
}

function checkbox(element) {
    return element.shadowRoot.querySelector('lightning-input');
}

afterEach(() => {
    while (document.body.firstChild) document.body.removeChild(document.body.firstChild);
});

describe('heading (default)', () => {
    it('formats the amount in the payment currency like the Pay button', () => {
        const element = render({ amount: '167.5', currencyIsoCode: 'EUR' });
        expect(element.shadowRoot.querySelector('p.amount-heading').textContent).toBe('€167.50');
    });

    it('shows the decimal places of the currency', () => {
        expect(text(render({ amount: '167', currencyIsoCode: 'EUR' }))).toBe('€167.00');
        expect(text(render({ amount: '4000', currencyIsoCode: 'JPY' }))).toBe('¥4,000');
    });

    it('falls back to the org currency when no payment currency is passed', () => {
        expect(text(render({ amount: '25.5' }))).toBe('$25.50');
    });

    it('keeps a negative amount, as used for refunds', () => {
        expect(text(render({ amount: '-25.50', currencyIsoCode: 'EUR' }))).toBe('-€25.50');
    });

    it('strips grouping separators the flow added to the amount', () => {
        expect(text(render({ amount: '1,234.56', currencyIsoCode: 'EUR' }))).toBe('€1,234.56');
    });

    it.each([null, '', '12.34.56'])('renders nothing for the amount %p', (amount) => {
        expect(render({ amount, currencyIsoCode: 'EUR' }).shadowRoot.querySelector('p')).toBeNull();
    });

    it('updates when Flow changes the amount and currency', async () => {
        const element = render({ amount: '25.50', currencyIsoCode: 'EUR' });
        element.amount = '1000';
        element.currencyIsoCode = 'JPY';
        await Promise.resolve();
        expect(text(element)).toBe('¥1,000');
    });
});

describe('text', () => {
    it('places the formatted amount in the label', () => {
        const element = render({ amount: '25.5', currencyIsoCode: 'EUR', variant: 'text', label: 'Total {0}/month' });
        expect(element.shadowRoot.querySelector('p.amount-text').textContent).toBe('Total €25.50/month');
    });
});

describe('checkbox', () => {
    const props = { amount: '0.5', currencyIsoCode: 'EUR', variant: 'checkbox', label: 'Cover fees for this donation (+{0})' };

    it('shows the formatted amount in the checkbox label', () => {
        expect(checkbox(render(props)).label).toBe('Cover fees for this donation (+€0.50)');
    });

    it('updates the label when the amount changes on the same screen', async () => {
        const element = render(props);
        element.amount = '0.75';
        await Promise.resolve();
        expect(checkbox(element).label).toBe('Cover fees for this donation (+€0.75)');
    });

    it('publishes the checked state to the flow', () => {
        const element = render(props);
        const handler = jest.fn();
        element.addEventListener('flowattributechange', handler);

        const input = checkbox(element);
        input.checked = true;
        input.dispatchEvent(new CustomEvent('change'));

        expect(handler.mock.calls[0][0].detail).toEqual({ attributeName: 'value', attributeValue: true });
    });

    it('is hidden when there is no amount to opt into', () => {
        expect(checkbox(render({ ...props, amount: '0' }))).toBeNull();
    });
});
