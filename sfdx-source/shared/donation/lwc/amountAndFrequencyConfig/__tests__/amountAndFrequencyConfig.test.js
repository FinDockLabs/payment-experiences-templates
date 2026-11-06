import { createElement } from 'lwc';
import AmountAndFrequencyConfig from 'c/amountAndFrequencyConfig';
import getActiveCurrencies from '@salesforce/apex/CurrencyPickerController.getActiveCurrencies';

jest.mock('@salesforce/i18n/currency', () => ({ default: 'EUR' }), { virtual: true });
jest.mock(
    '@salesforce/apex/CurrencyPickerController.getActiveCurrencies',
    () => ({ default: jest.fn() }),
    { virtual: true }
);

const flush = async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
};

function mount(values = {}) {
    const element = createElement('c-amount-and-frequency-config', { is: AmountAndFrequencyConfig });
    element.inputVariables = Object.entries(values).map(([name, value]) => ({
        name, value, valueDataType: 'String'
    }));
    const changes = [];
    element.addEventListener('configuration_editor_input_value_changed', event => changes.push(event));
    document.body.appendChild(element);
    return { element, changes };
}

const presets = element => [...element.shadowRoot.querySelectorAll('.preset-grid')]
    .map(grid => [...grid.querySelectorAll('input')]);
const minimum = element => element.shadowRoot.querySelector('input[aria-label="Minimum amount"]');
const maximum = element => element.shadowRoot.querySelector('input[aria-label="Maximum amount"]');
const currency = element => element.shadowRoot.querySelector('cpm-flow-variable-input');
const details = changes => changes.map(event => event.detail);

function edit(input, value, type = 'input') {
    input.value = value;
    input.dispatchEvent(new Event(type));
}

function toggle(element, index, checked) {
    const checkbox = element.shadowRoot.querySelectorAll('input[type="checkbox"]')[index];
    checkbox.checked = checked;
    checkbox.dispatchEvent(new Event('change'));
}

function chooseCurrency(element, value, valueDataType = 'String') {
    currency(element).dispatchEvent(new CustomEvent('valuechange', {
        detail: { newValue: value, newValueDataType: valueDataType }
    }));
}

beforeEach(() => {
    getActiveCurrencies.mockReset();
    getActiveCurrencies.mockResolvedValue(['EUR', 'USD']);
});

afterEach(() => {
    while (document.body.firstChild) document.body.removeChild(document.body.firstChild);
});

describe('Flow configuration hydration', () => {
    it('shows both frequencies and default presets without emitting configuration changes', async () => {
        const { element, changes } = mount();
        await flush();
        expect(presets(element).map(group => group.map(input => input.value))).toEqual([
            ['25', '50', '100', '250', '500', '1000'],
            ['5', '10', '25', '60', '125', '250']
        ]);
        const combo = element.shadowRoot.querySelector('lightning-combobox');
        expect(combo.value).toBe('oneTime');
        expect(combo.options).toEqual([
            { label: 'One-time', value: 'oneTime' },
            { label: 'Monthly', value: 'recurring' }
        ]);
        expect(minimum(element).value).toBe('');
        expect(maximum(element).value).toBe('');
        expect(changes).toEqual([]);
    });

    it.each([
        [{ freq1Value: 'recurring', defaultFrequency: 'recurring' }, false, true, '5'],
        [{ freq2Value: 'none' }, true, false, '25']
    ])('restores a single-frequency configuration %p', (values, oneTime, monthly, firstPreset) => {
        const { element } = mount(values);
        const checkboxes = element.shadowRoot.querySelectorAll('input[type="checkbox"]');
        expect(checkboxes[0].checked).toBe(oneTime);
        expect(checkboxes[1].checked).toBe(monthly);
        expect(presets(element)).toHaveLength(1);
        expect(presets(element)[0][0].value).toBe(firstPreset);
        expect(element.shadowRoot.querySelector('lightning-combobox')).toBeNull();
    });

    it('restores limits, currency and presets while padding missing and rejecting invalid entries', () => {
        const { element } = mount({
            minAmount: 2.5, maxAmount: 100, currencyCode: 'USD',
            presetAmountsOneTime: '10,0,-5,nope,20.50,30,999',
            presetAmountsRecurring: '3,7'
        });
        expect(minimum(element).value).toBe('2.5');
        expect(maximum(element).value).toBe('100');
        expect(currency(element).value).toBe('USD');
        expect(presets(element).map(group => group.map(input => input.value))).toEqual([
            ['10', '', '', '', '20.5', '30'], ['3', '7', '', '', '', '']
        ]);
    });

    it('passes Flow resource references and builder context to the managed resource picker', () => {
        const element = createElement('c-amount-and-frequency-config', { is: AmountAndFrequencyConfig });
        const variables = Object.freeze([
            Object.freeze({ name: 'currencyCode', value: '{!currencyPicker.value}', valueDataType: 'reference' })
        ]);
        element.inputVariables = variables;
        element.builderContext = { variables: [{ name: 'currency' }] };
        element.automaticOutputVariables = [{ name: 'currencyPicker' }];
        document.body.appendChild(element);
        expect(element.inputVariables).toEqual(variables);
        expect(currency(element).value).toBe('{!currencyPicker.value}');
        expect(currency(element).valueType).toBe('reference');
        expect(currency(element).builderContext).toEqual(element.builderContext);
        expect(currency(element).automaticOutputVariables).toEqual(element.automaticOutputVariables);
    });

    it.each([null, undefined, {}])('renders safe defaults for malformed inputVariables %p', value => {
        const element = createElement('c-amount-and-frequency-config', { is: AmountAndFrequencyConfig });
        element.inputVariables = value;
        document.body.appendChild(element);
        expect(presets(element)[0][0].value).toBe('25');
        expect(currency(element).value).toBe('');
    });

    it('keeps local edits when Flow Builder supplies inputVariables again', async () => {
        const { element, changes } = mount({ minAmount: 5 });
        edit(minimum(element), '12', 'change');
        await flush();
        element.inputVariables = [{ name: 'minAmount', value: 5 }];
        await flush();
        expect(minimum(element).value).toBe('12');
        expect(details(changes)).toEqual([{ name: 'minAmount', newValue: 12, newValueDataType: 'Number' }]);
    });
});

describe('frequency configuration events', () => {
    it('switches the default to recurring when one-time is disabled', async () => {
        const { element, changes } = mount();
        toggle(element, 0, false);
        await flush();
        expect(details(changes)).toEqual([
            { name: 'freq1Value', newValue: 'recurring', newValueDataType: 'String' },
            { name: 'freq2Value', newValue: 'recurring', newValueDataType: 'String' },
            { name: 'showFrequencyToggle', newValue: false, newValueDataType: 'Boolean' },
            { name: 'defaultFrequency', newValue: 'recurring', newValueDataType: 'String' }
        ]);
        expect(presets(element)).toHaveLength(1);
        expect(element.shadowRoot.querySelector('lightning-combobox')).toBeNull();
    });

    it('switches the default to one-time when monthly is disabled', () => {
        const { element, changes } = mount({ defaultFrequency: 'recurring' });
        toggle(element, 1, false);
        expect(details(changes)).toEqual([
            { name: 'freq1Value', newValue: 'oneTime', newValueDataType: 'String' },
            { name: 'freq2Value', newValue: 'none', newValueDataType: 'String' },
            { name: 'showFrequencyToggle', newValue: false, newValueDataType: 'Boolean' },
            { name: 'defaultFrequency', newValue: 'oneTime', newValueDataType: 'String' }
        ]);
    });

    it('restores both frequency options without resetting the selected default', async () => {
        const { element, changes } = mount({ freq1Value: 'recurring', defaultFrequency: 'recurring' });
        toggle(element, 0, true);
        await flush();
        expect(details(changes)).toEqual([
            { name: 'freq1Value', newValue: 'oneTime', newValueDataType: 'String' },
            { name: 'freq2Value', newValue: 'recurring', newValueDataType: 'String' },
            { name: 'showFrequencyToggle', newValue: true, newValueDataType: 'Boolean' },
            { name: 'defaultFrequency', newValue: 'recurring', newValueDataType: 'String' }
        ]);
        expect(element.shadowRoot.querySelector('lightning-combobox').value).toBe('recurring');
        expect(presets(element)).toHaveLength(2);
    });

    it('shows an error when both frequencies are disabled and clears it when one is restored', async () => {
        const { element } = mount();
        toggle(element, 0, false);
        toggle(element, 1, false);
        await flush();
        expect(element.shadowRoot.querySelector('[role="alert"]').textContent).toBe('Enable at least one frequency.');
        expect(presets(element)).toHaveLength(0);
        toggle(element, 0, true);
        await flush();
        expect(element.shadowRoot.querySelector('[role="alert"]')).toBeNull();
        expect(presets(element)).toHaveLength(1);
    });

    it('emits a bubbling, composed event when the default frequency is changed', () => {
        const { element, changes } = mount();
        element.shadowRoot.querySelector('lightning-combobox').dispatchEvent(
            new CustomEvent('change', { detail: { value: 'recurring' } })
        );
        expect(changes).toHaveLength(1);
        expect(changes[0].detail).toEqual({ name: 'defaultFrequency', newValue: 'recurring', newValueDataType: 'String' });
        expect(changes[0].bubbles).toBe(true);
        expect(changes[0].composed).toBe(true);
    });
});

describe('preset amounts and currency precision', () => {
    it.each([
        [0, 'presetAmountsOneTime'], [1, 'presetAmountsRecurring']
    ])('edits preset group %i without losing empty positions', (groupIndex, name) => {
        const { element, changes } = mount({ presetAmountsOneTime: '10,,30', presetAmountsRecurring: '10,,30' });
        edit(presets(element)[groupIndex][1], ' $12,345 ');
        expect(presets(element)[groupIndex][1].value).toBe('12.34');
        expect(details(changes)).toEqual([{ name, newValue: '10,12.34,30', newValueDataType: 'String' }]);
    });

    it('removes trailing empty preset slots while preserving internal gaps', () => {
        const { element, changes } = mount({ presetAmountsOneTime: '10,,30' });
        edit(presets(element)[0][2], '');
        expect(details(changes)).toEqual([
            { name: 'presetAmountsOneTime', newValue: '10', newValueDataType: 'String' }
        ]);
    });

    it.each([
        ['JPY', '12.99', '12'], ['BHD', '12.3456', '12.345'], ['EUR', '12.345', '12.34']
    ])('applies the minor units of literal currency %s to edited presets', (code, input, expected) => {
        const { element, changes } = mount({ currencyCode: code, presetAmountsOneTime: '10' });
        edit(presets(element)[0][0], input);
        expect(details(changes)).toEqual([
            { name: 'presetAmountsOneTime', newValue: expected, newValueDataType: 'String' }
        ]);
    });

    it.each([
        [['USD', 'EUR'], '€'], [['USD', 'USD', '', 'Euro'], '$'], [[], ''], [null, '']
    ])('resolves the preview from the active org currencies %p', async (codes, symbol) => {
        getActiveCurrencies.mockResolvedValue(codes);
        const { element, changes } = mount();
        await flush();
        expect(getActiveCurrencies).toHaveBeenCalledTimes(1);
        expect(element.shadowRoot.querySelector('.amount-symbol').textContent).toBe(symbol);
        expect(changes).toEqual([]);
    });

    it('uses org currency precision for an unresolved Flow currency reference', async () => {
        getActiveCurrencies.mockResolvedValue(['JPY']);
        const { element, changes } = mount();
        await flush();
        chooseCurrency(element, '{!currencyPicker.value}', 'reference');
        await flush();
        edit(presets(element)[0][0], '100.50');
        expect(currency(element).value).toBe('{!currencyPicker.value}');
        expect(element.shadowRoot.querySelector('.amount-symbol').textContent).toBe('¥');
        expect(details(changes)).toContainEqual({ name: 'presetAmountsOneTime', newValue: '100,50,100,250,500,1000', newValueDataType: 'String' });
    });

    it('keeps the editor usable when active currencies cannot be loaded', async () => {
        getActiveCurrencies.mockRejectedValue(new Error('Access denied'));
        const { element, changes } = mount();
        await flush();
        expect(element.shadowRoot.querySelector('.amount-symbol').textContent).toBe('');
        edit(minimum(element), '2.50', 'change');
        expect(details(changes)).toEqual([{ name: 'minAmount', newValue: 2.5, newValueDataType: 'Number' }]);
    });
});

describe('limits and currency validation', () => {
    it.each([
        [minimum, 'minAmount'], [maximum, 'maxAmount']
    ])('normalizes a limit input, emits a number on change, and resets on clear', async (select, name) => {
        const { element, changes } = mount({ currencyCode: 'EUR' });
        const input = select(element);
        edit(input, '€ 2,567');
        expect(input.value).toBe('2.56');
        expect(changes).toEqual([]);
        input.dispatchEvent(new Event('change'));
        await flush();
        expect(details(changes)).toEqual([{ name, newValue: 2.56, newValueDataType: 'Number' }]);
        edit(input, '', 'change');
        await flush();
        expect(details(changes)[1]).toEqual({ name, newValue: 0, newValueDataType: 'Number' });
        expect(select(element).value).toBe('');
    });

    it.each(['not-a-number', '-5'])('does not overwrite configured limits with %s', async value => {
        const { element, changes } = mount({ minAmount: 5, maxAmount: 50 });
        edit(minimum(element), value, 'change');
        edit(maximum(element), value, 'change');
        await flush();
        expect(changes).toEqual([]);
        // A valid later edit demonstrates that the rejected value did not replace the other limit.
        edit(minimum(element), '10', 'change');
        await flush();
        expect(element.shadowRoot.querySelector('[role="alert"]')).toBeNull();
        expect(maximum(element).value).toBe('50');
    });

    it('shows reversed limits and clears the error when the maximum is repaired or removed', async () => {
        const { element } = mount({ minAmount: 10, maxAmount: 5 });
        expect(element.shadowRoot.querySelector('[role="alert"]').textContent).toBe('Minimum cannot be greater than maximum.');
        edit(maximum(element), '10', 'change');
        await flush();
        expect(element.shadowRoot.querySelector('[role="alert"]')).toBeNull();
        edit(minimum(element), '20', 'change');
        await flush();
        expect(element.shadowRoot.querySelector('[role="alert"]')).not.toBeNull();
        edit(maximum(element), '', 'change');
        await flush();
        expect(element.shadowRoot.querySelector('[role="alert"]')).toBeNull();
    });

    it('normalizes literal currency codes, reports invalid values, and clears the error after correction', async () => {
        const { element, changes } = mount();
        chooseCurrency(element, ' euro ');
        await flush();
        expect(element.shadowRoot.querySelector('[role="alert"]').textContent).toContain('"EURO" is not a valid ISO 4217 currency code.');
        chooseCurrency(element, ' usd ');
        await flush();
        expect(currency(element).value).toBe('USD');
        expect(currency(element).valueType).toBe('String');
        expect(element.shadowRoot.querySelector('[role="alert"]')).toBeNull();
        expect(details(changes)).toEqual([
            { name: 'currencyCode', newValue: 'EURO', newValueDataType: 'String' },
            { name: 'currencyCode', newValue: 'USD', newValueDataType: 'String' }
        ]);
    });

    it('accepts clearing the literal currency to use the org default', async () => {
        const { element, changes } = mount({ currencyCode: 'USD' });
        chooseCurrency(element, '');
        await flush();
        expect(currency(element).value).toBe('');
        expect(element.shadowRoot.querySelector('[role="alert"]')).toBeNull();
        expect(details(changes)).toEqual([{ name: 'currencyCode', newValue: '', newValueDataType: 'String' }]);
    });
});
