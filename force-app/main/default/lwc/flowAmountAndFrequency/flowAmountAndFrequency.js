import { api, LightningElement, track } from "lwc";
import { FlowAttributeChangeEvent } from "lightning/flowSupport";

/**
 * @typedef {import("../flowAmountAndFrequency/typedefs").CpePayPeriod} CpePayPeriod
 */

export default class flowAmountAndFrequency extends LightningElement {

  // --- Private Properties ---

  rendered = false;
  _frequencyValue = "0";
  _amountValue = "";

  @track paymentConfigData = {};
  @track customFields = [];

  // --- Public Properties ---

  @api
  set amountValue(str) {
    this._amountValue = str;
  }

  get amountValue() {
    return this._amountValue;
  }

  @api
  set frequencyValue(str) {
    this._frequencyValue = str;
  }

  get frequencyValue() {
    return this._frequencyValue;
  }

  /** @type {CpePayPeriod} */
  @api paymentConfig = "";

  // --- Lifecycle Hooks ---

  connectedCallback() {
    this.paymentConfigData = JSON.parse(this.paymentConfig);
  }

  renderedCallback() {
    if (!this.rendered) {
      this.rendered = true;
      this.setDefaultPayPeriod();
    }
  }

  // --- Private Methods ---

  setDefaultPayPeriod() {
    this._frequencyValue = this.paymentConfigData.defaultPayPeriod;
  }

  getPayPeriod(frequency) {
    switch (frequency) {
      case "Yearly":
        return "3";
      case "Monthly":
        return "2";
      default:
        return "1";
    }
  }

  getCurrency(currency, amount) {
    switch (currency) {
      case "CAD":
      case "USD":
        return `$${amount}`;
      case "CHF":
        return `${amount} CHF`;
      case "GBP":
        return `£${amount}`;
      case "PLN":
        return `${amount} zł`;
      case "SEK":
        return `${amount} kr`;
      default:
        return `€${amount}`;
    }
  }

  // --- Getters ---

  get periodOptions() {
    const { payPeriod1Label, payPeriod2Label, payPeriod3Label } = this.paymentConfigData;
    const data = [];
    if (payPeriod1Label) {
      data.push({ label: payPeriod1Label, value: "One-Time" });
    }
    if (payPeriod2Label) {
      data.push({ label: payPeriod2Label, value: "Monthly" });
    }
    if (payPeriod3Label) {
      data.push({ label: payPeriod3Label, value: "Yearly" });
    }
    return data;
  }

  get presetOptions() {
    const period = this.getPayPeriod(this.frequencyValue);
    const options = [];
    const presets = parseInt(this.paymentConfigData[`payPeriod${period}Presets`], 10) || 1;
    for (let i = 1; i <= presets; i++) {
      const preset = this.paymentConfigData[`payPeriod${period}Preset${i}`];
      if (preset) {
        const obj = {
          key: `amount-${i}`,
          label: this.getCurrency(this.paymentConfigData?.currency, preset),
          value: preset,
          impact: this.paymentConfigData[`payPeriod${period}Preset${i}Impact`],
          impactImage: this.paymentConfigData[`payPeriod${period}Preset${i}ImpactImage`],
          selected: this.amountValue === `${preset}`
        };
        options.push(obj);
      }
    }
    return options;
  }

  // --- Event Handlers ---

  handleFrequencySelect(event) {
    this._frequencyValue = event.target.value;
    const attributeChangeEvent = new FlowAttributeChangeEvent("frequencyValue", this.frequencyValue);
    this.dispatchEvent(attributeChangeEvent);
  }

  handleAmount(event) {
    this._amountValue = event.target.value;
    const attributeChangeEvent = new FlowAttributeChangeEvent("amountValue", this.amountValue);
    this.dispatchEvent(attributeChangeEvent);
  }

  handleCustomAmount(event) {
    this.refs.customAmount.checked = true;
    this._amountValue = event.target.value;
    const attributeChangeEvent = new FlowAttributeChangeEvent("amountValue", this.amountValue);
    this.dispatchEvent(attributeChangeEvent);
  }

  handleCustomAmountFocus() {
    this.refs.customAmount.checked = true;
  }

}