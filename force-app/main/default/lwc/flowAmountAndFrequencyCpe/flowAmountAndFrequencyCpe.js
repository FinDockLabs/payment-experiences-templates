import { api, LightningElement, track, wire } from "lwc";
import getCurrencyPicklist from "@salesforce/apex/FdConfigController.getCurrencyPicklist";
import { DefaultConfig, InputConfig } from "./constants";

/**
 * @typedef {import("./typedefs").CpePayPeriod} CpePayPeriod
 */

export default class flowAmountAndFrequencyCpe extends LightningElement {

  // --- Private Properties ---

  currencyOptions = [];

  payPeriodStyle = [
    { label: "Radio", value: "radio" },
    { label: "Button", value: "button" }
  ];

  payPeriodOptions = [
    { label: "One-Time", value: "One-Time" },
    { label: "Monthly", value: "Monthly" },
    { label: "Yearly", value: "Yearly" }
  ];

  numberOfPresetsOptions = [
    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
    { label: "4", value: "4" },
    { label: "5", value: "5" },
    { label: "6", value: "6" }
  ];

  /** @type {string} */
  _value = DefaultConfig;

  /** @type {FlowInputVariables[]} */
  _inputVariables = [];

  /** @type {CpePayPeriod} */
  @track config = {};

  // --- Public Properties ---

  // Experience Cloud CPE Values
  @api
  get value() {
    return this._value;
  }

  set value(jsonStr) {
    this._value = jsonStr;
    this.convertStringToData(this._value);
  }

  // Flow CPE Values
  @api
  get inputVariables() {
    return this._inputVariables;
  }

  set inputVariables(variables) {
    this._inputVariables = variables?.length > 0 ? variables : [{ name: InputConfig, value: DefaultConfig }];
    const param = this._inputVariables.find(({ name }) => name === InputConfig);
    if (param && param.value) {
      this.convertStringToData(param.value);
    }
  }

  @wire(getCurrencyPicklist)
  currencyWire({ data, error }) {
    if (data) {
      this.currencyOptions = [...data];
    } else if (error) {
      console.error(error);
    }
  }

  // --- Private Methods ---

  /**
   * Convert String to JSON
   * @param {string} jsonStr
   */
  convertStringToData(jsonStr) {
    try {
      if (jsonStr) {
        const data = JSON.parse(jsonStr);
        const keys = Object.keys(data);
        keys.forEach((key) => {
          this.config[key] = data[key];
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Stringify values and dispatch events to DXP and Flows components.
   */
  updateConfigEvent() {
    this._value = JSON.stringify(this.config);
    this.dispatchEvent(new CustomEvent("valuechange", { detail: { value: this._value } }));
    this.dispatchEvent(new CustomEvent("configuration_editor_input_value_changed", {
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: {
        name: InputConfig,
        newValue: this._value,
        newValueDataType: "String"
      }
    }));
  }

  // --- Getters ---

  /**
   * Get the value of the Flow input variable.
   * @returns {string} JSON String
   */
  get paymentConfig() {
    const param = this._inputVariables.find(({ name }) => name === InputConfig);
    this.convertStringToData(param.value);
    return param && param.value;
  }

  get showPayPeriod1Preset2() {
    const num = parseInt(this.config?.payPeriod1Presets, 10);
    return num >= 2;
  }

  get showPayPeriod1Preset3() {
    const num = parseInt(this.config?.payPeriod1Presets, 10);
    return num >= 3;
  }

  get showPayPeriod1Preset4() {
    const num = parseInt(this.config?.payPeriod1Presets, 10);
    return num >= 4;
  }

  get showPayPeriod1Preset5() {
    const num = parseInt(this.config?.payPeriod1Presets, 10);
    return num >= 5;
  }

  get showPayPeriod1Preset6() {
    const num = parseInt(this.config?.payPeriod1Presets, 10);
    return num >= 6;
  }

  get showPayPeriod2Preset2() {
    const num = parseInt(this.config?.payPeriod2Presets, 10);
    return num >= 2;
  }

  get showPayPeriod2Preset3() {
    const num = parseInt(this.config?.payPeriod2Presets, 10);
    return num >= 3;
  }

  get showPayPeriod2Preset4() {
    const num = parseInt(this.config?.payPeriod2Presets, 10);
    return num >= 4;
  }

  get showPayPeriod2Preset5() {
    const num = parseInt(this.config?.payPeriod2Presets, 10);
    return num >= 5;
  }

  get showPayPeriod2Preset6() {
    const num = parseInt(this.config?.payPeriod2Presets, 10);
    return num >= 6;
  }

  get showPayPeriod3Preset2() {
    const num = parseInt(this.config?.payPeriod3Presets, 10);
    return num >= 2;
  }

  get showPayPeriod3Preset3() {
    const num = parseInt(this.config?.payPeriod3Presets, 10);
    return num >= 3;
  }

  get showPayPeriod3Preset4() {
    const num = parseInt(this.config?.payPeriod3Presets, 10);
    return num >= 4;
  }

  get showPayPeriod3Preset5() {
    const num = parseInt(this.config?.payPeriod3Presets, 10);
    return num >= 5;
  }

  get showPayPeriod3Preset6() {
    const num = parseInt(this.config?.payPeriod3Presets, 10);
    return num >= 6;
  }

  // --- Event Handlers ---

  handleChange(event) {
    const { checked, name, value } = event.target;
    this.config[name] = value || checked;
    this.updateConfigEvent();
  }
}