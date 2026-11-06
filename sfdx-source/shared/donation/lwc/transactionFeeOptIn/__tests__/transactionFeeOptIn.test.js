import { createElement } from 'lwc';
import TransactionFeeOptIn from 'c/transactionFeeOptIn';

jest.mock('@salesforce/i18n/currency', () => ({ default: 'USD' }), { virtual: true });
jest.mock('@salesforce/i18n/locale', () => ({ default: 'en-US' }), { virtual: true });

const LABEL = 'Cover fees for this donation (+{0})';
const HELP_TEXT = 'Add a small amount so 100% of your gift supports the mission.';
const PROPS = { fee: '0.58', currencyIsoCode: 'EUR', label: LABEL, helpText: HELP_TEXT };

function render(props) {
    const element = createElement('c-transaction-fee-opt-in', { is: TransactionFeeOptIn });
    Object.assign(element, props);
    const published = [];
    element.addEventListener('flowattributechange', (event) => published.push(event.detail));
    document.body.appendChild(element);
    return { element, published };
}

const checkbox = (element) => element.shadowRoot.querySelector('lightning-input');
const helpText = (element) => element.shadowRoot.querySelector('.help-text')?.textContent;
const lastAddedFee = (published) => published.filter(d => d.attributeName === 'addedFee').pop()?.attributeValue;

function toggle(element, checked) {
    const input = checkbox(element);
    input.checked = checked;
    input.dispatchEvent(new CustomEvent('change'));
}

afterEach(() => {
    while (document.body.firstChild) document.body.removeChild(document.body.firstChild);
});

describe('checkbox', () => {
    it('shows the fee from the flow in the label, formatted like the Pay button', () => {
        expect(checkbox(render(PROPS).element).label).toBe('Cover fees for this donation (+€0.58)');
    });

    it('falls back to the org currency', () => {
        const { element } = render({ ...PROPS, currencyIsoCode: undefined });
        expect(checkbox(element).label).toBe('Cover fees for this donation (+$0.58)');
    });

    it('follows the fee when the flow recalculates it on the same screen', async () => {
        const { element } = render(PROPS);
        element.fee = '1.45';
        await Promise.resolve();
        expect(checkbox(element).label).toBe('Cover fees for this donation (+€1.45)');
    });

    it.each(['', '0', null])('is hidden, with its help text, when the fee is %p', (fee) => {
        const { element } = render({ ...PROPS, fee });
        expect(checkbox(element)).toBeNull();
        expect(helpText(element)).toBeUndefined();
    });
});

describe('help text', () => {
    it('shows the help text under the checkbox', () => {
        expect(helpText(render(PROPS).element)).toBe(HELP_TEXT);
    });

    it('leaves it out when empty', () => {
        expect(helpText(render({ ...PROPS, helpText: '' }).element)).toBeUndefined();
    });
});

describe('addedFee', () => {
    it('publishes 0 until the donor opts in', async () => {
        const { published } = render(PROPS);
        await Promise.resolve();
        expect(lastAddedFee(published)).toBe('0');
    });

    it('publishes the fee and the selection when the donor opts in', async () => {
        const { element, published } = render(PROPS);
        toggle(element, true);
        await Promise.resolve();
        expect(published).toContainEqual({ attributeName: 'value', attributeValue: true });
        expect(lastAddedFee(published)).toBe('0.58');
    });

    it('publishes 0 again when the donor opts out', async () => {
        const { element, published } = render({ ...PROPS, value: true });
        toggle(element, false);
        await Promise.resolve();
        expect(lastAddedFee(published)).toBe('0');
    });

    it('publishes the new fee when the flow recalculates it after opting in', async () => {
        const { element, published } = render({ ...PROPS, value: true });
        element.fee = '1.45';
        await Promise.resolve();
        expect(lastAddedFee(published)).toBe('1.45');
    });

    it('keeps a selection the flow passes back, for example after Back and Next', async () => {
        const { element, published } = render({ ...PROPS, value: true });
        await Promise.resolve();
        expect(checkbox(element).checked).toBe(true);
        expect(lastAddedFee(published)).toBe('0.58');
    });
});

describe('fee contract', () => {
    it.each(['0,58', '€0.58', '1,234.56', '-0.58', ' '])(
        'rejects malformed fee %p instead of changing it into another amount', (fee) => {
            const { element, published } = render({ ...PROPS, value: true, fee });
            expect(checkbox(element)).toBeNull();
            expect(lastAddedFee(published)).toBe('0');
        }
    );

    it.each([['JPY', '3', '¥3'], ['KWD', '0.725', 'KWD']])(
        'shows and publishes the same fee for %s', (currencyIsoCode, fee, display) => {
            const { element, published } = render({ ...PROPS, currencyIsoCode, fee, value: true });
            expect(checkbox(element).label).toContain(display);
            expect(lastAddedFee(published)).toBe(fee);
        }
    );

    it.each([['JPY', '2.90'], ['EUR', '0.001']])(
        'does not offer a fee with more decimals than %s has', (currencyIsoCode, fee) => {
            const { element, published } = render({ ...PROPS, currencyIsoCode, fee, value: true });
            expect(checkbox(element)).toBeNull();
            expect(lastAddedFee(published)).toBe('0');
        }
    );
});
