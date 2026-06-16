import { LightningElement, api } from 'lwc';
import { FlowAttributeChangeEvent } from 'lightning/flowSupport';
import { labels } from './amountAndFrequencyLabels';

const DEFAULT_PRESET_AMOUNTS_ONE_TIME = [25, 50, 100, 250, 500, 1000];
const DEFAULT_PRESET_AMOUNTS_RECURRING = [5, 10, 25, 60, 125, 250];
// Module-level counter ensures unique DOM IDs/radio names when multiple instances render on the same page.
let _nextInstanceId = 0;

export default class AmountAndFrequency extends LightningElement {
    _instanceId = ++_nextInstanceId;
    _presetAmounts = null;
    _frequency = 'oneTime';
    _selectedPreset = null;
    _customAmount = '';

    labels = labels;

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
    get amountOneTime() {
        if (this._frequency !== 'oneTime') return null;
        if (this._customAmount !== '') return Number(this._customAmount);
        return this._selectedPreset;
    }

    @api
    get amountRecurring() {
        if (this._frequency !== 'recurring') return null;
        if (this._customAmount !== '') return Number(this._customAmount);
        return this._selectedPreset;
    }

    get frequencyGroupName(){
        return `frequency-${this._instanceId}`;
    }

    get presetName() {
        return `presetAmount-${this._instanceId}`;
    }

    get frequencyOnceId() {
        return `freq-once-${this._instanceId}`;
    }

    get frequencyMonthlyId() {
        return `freq-monthly-${this._instanceId}`;
    }

    get isGiveOnce() {
        return this._frequency === 'oneTime';
    }

    get isMonthly() {
        return this._frequency === 'recurring';
    }

    get presetAmountOptions() {
        return this.presetAmounts.map(amount => {
            const isSelected = this._selectedPreset === amount && this._customAmount === '';
            return {
                value: amount,
                label: `$${amount.toLocaleString()}`,
                inputId: `${this._instanceId}-preset-${amount}`,
                isSelected
            };
        });
    }

    handleFrequencyChange(event) {
        this._frequency = event.target.value;
        this.dispatchChange();
    }

    handlePresetAmountSelect(event) {
        this._selectedPreset = Number(event.target.value);
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
        this.dispatchEvent(new FlowAttributeChangeEvent('amountOneTime', this.amountOneTime));
        this.dispatchEvent(new FlowAttributeChangeEvent('amountRecurring', this.amountRecurring));
        this.dispatchEvent(new FlowAttributeChangeEvent('frequency', this._frequency));
    }
}
