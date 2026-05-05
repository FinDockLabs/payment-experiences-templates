import { LightningElement, api } from 'lwc';
import { FlowAttributeChangeEvent } from 'lightning/flowSupport';

const DEFAULT_PRESET_AMOUNTS_ONE_TIME = [25, 50, 100, 250, 500, 1000];
const DEFAULT_PRESET_AMOUNTS_RECURRING = [5, 10, 25, 60, 125, 250];

export default class AmountAndFrequency extends LightningElement {
    _presetAmounts = null;
    _frequency = 'oneTime';
    _selectedPreset = null;
    _customAmount = '';

    @api
    get frequency() {
        return this._frequency;
    }
    set frequency(value) {
        this._frequency = value || 'oneTime';
    }

    @api
    get presetAmounts() {
        if (this._presetAmounts) {
            return this._presetAmounts;
        }
        return this._frequency === 'recurring'
            ? DEFAULT_PRESET_AMOUNTS_RECURRING
            : DEFAULT_PRESET_AMOUNTS_ONE_TIME;
    }
    set presetAmounts(value) {
      this._presetAmounts = Array.isArray(value) ? value : DEFAULT_PRESET_AMOUNTS_ONE_TIME;
    }

    @api
    get amount() {
        if (this._customAmount !== '') {
            return Number(this._customAmount);
        }
        return this._selectedPreset;
    }

    get isGiveOnce() {
        return this._frequency === 'oneTime';
    }

    get isMonthly() {
        return this._frequency === 'recurring';
    }

    get giveOnceAriaPressed() {
        return String(this.isGiveOnce);
    }

    get monthlyAriaPressed() {
        return String(this.isMonthly);
    }

    get giveOnceClass() {
        return `toggle-option${this.isGiveOnce ? ' toggle-option-active' : ''}`;
    }

    get monthlyClass() {
        return `toggle-option toggle-option-monthly${this.isMonthly ? ' toggle-option-active' : ''}`;
    }

    get presetAmountOptions() {
        return this.presetAmounts.map(amount => {
            const isSelected = this._selectedPreset === amount && this._customAmount === '';
            return {
                value: amount,
                label: `$${amount.toLocaleString()}`,
                ariaPressed: String(isSelected),
                buttonClass: `amount-option${isSelected ? ' amount-option-selected' : ''}`
            };
        });
    }

    handleFrequencyChange(event) {
        this._frequency = event.currentTarget.dataset.value;
        this.dispatchChange();
    }

    handlePresetAmountSelect(event) {
        this._selectedPreset = Number(event.currentTarget.dataset.value);
        this._customAmount = '';
        this.dispatchChange();
    }

    handleCustomAmountChange(event) {
        const val = event.detail.value;
        this._customAmount = val;
        if (val !== '') {
            this._selectedPreset = null;
        }
        this.dispatchChange();
    }

    dispatchChange() {
        this.dispatchEvent(new FlowAttributeChangeEvent('amount', this.amount));
        this.dispatchEvent(new FlowAttributeChangeEvent('frequency', this._frequency));
    }
}
