import { createElement } from 'lwc';
import TransactionFeeOptIn from 'c/transactionFeeOptIn';

jest.mock('@salesforce/i18n/currency', () => ({ default: 'USD' }), { virtual: true });
jest.mock('@salesforce/i18n/locale', () => ({ default: 'en-US' }), { virtual: true });

const LABEL = 'Cover fees for this donation (+{0})';
const ONE_TIME = { amountOneTime: '20', currencyIsoCode: 'EUR', percentage: '2.9', label: LABEL };

function render(props) {
    const element = createElement('c-transaction-fee-opt-in', { is: TransactionFeeOptIn });
    Object.assign(element, props);
    const published = [];
    element.addEventListener('flowattributechange', (event) => published.push(event.detail));
    document.body.appendChild(element);
    return { element, published };
}

const checkbox = (element) => element.shadowRoot.querySelector('lightning-input');
const lastFeeAmount = (published) => published.filter(d => d.attributeName === 'feeAmount').pop()?.attributeValue;

function toggle(element, checked) {
    const input = checkbox(element);
    input.checked = checked;
    input.dispatchEvent(new CustomEvent('change'));
}

afterEach(() => {
    while (document.body.firstChild) document.body.removeChild(document.body.firstChild);
});

describe('checkbox', () => {
    it('shows the calculated fee in the label, formatted like the Pay button', () => {
        expect(checkbox(render(ONE_TIME).element).label).toBe('Cover fees for this donation (+€0.58)');
    });

    it('uses a custom label', () => {
        const { element } = render({ ...ONE_TIME, label: 'Add {0} to cover fees' });
        expect(checkbox(element).label).toBe('Add €0.58 to cover fees');
    });

    it('calculates the fee from the recurring amount for a monthly donation', () => {
        const { element } = render({ amountRecurring: '10', currencyIsoCode: 'EUR', percentage: '2.9', label: LABEL });
        expect(checkbox(element).label).toBe('Cover fees for this donation (+€0.29)');
    });

    it('follows the amount when it changes on the same screen', async () => {
        const { element } = render(ONE_TIME);
        element.amountOneTime = '50';
        await Promise.resolve();
        expect(checkbox(element).label).toBe('Cover fees for this donation (+€1.45)');
    });

    it.each([
        [{ ...ONE_TIME, percentage: '' }],
        [{ ...ONE_TIME, percentage: '0' }],
        [{ ...ONE_TIME, amountOneTime: '' }]
    ])('is hidden when there is no fee to add: %p', (props) => {
        expect(checkbox(render(props).element)).toBeNull();
    });
});

describe('feeAmount', () => {
    it('publishes 0 until the donor opts in', async () => {
        const { published } = render(ONE_TIME);
        await Promise.resolve();
        expect(lastFeeAmount(published)).toBe('0');
    });

    it('publishes the fee and the selection when the donor opts in', async () => {
        const { element, published } = render(ONE_TIME);
        toggle(element, true);
        await Promise.resolve();
        expect(published).toContainEqual({ attributeName: 'value', attributeValue: true });
        expect(lastFeeAmount(published)).toBe('0.58');
    });

    it('publishes the new fee when the amount changes after opting in', async () => {
        const { element, published } = render({ ...ONE_TIME, value: true });
        element.amountOneTime = '50';
        await Promise.resolve();
        expect(lastFeeAmount(published)).toBe('1.45');
    });

    it('keeps a selection the flow passes back, for example after Back and Next', async () => {
        const { element, published } = render({ ...ONE_TIME, value: true });
        await Promise.resolve();
        expect(checkbox(element).checked).toBe(true);
        expect(lastFeeAmount(published)).toBe('0.58');
    });
});
