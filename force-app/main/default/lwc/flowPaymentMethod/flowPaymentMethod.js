import { LightningElement } from "lwc";
import FindockAssets from "@salesforce/resourceUrl/findockAssets";
import { FlowAttributeChangeEvent } from "lightning/flowSupport";

export default class flowPaymentMethod extends LightningElement {

  // --- Private Properties ---

  paymentOptions = [
    {
      key: "payOption1",
      label: "Credit Card",
      value: "credit-card",
      icon: `${FindockAssets}/icons/credit-card.svg`,
      checked: false
    },
    {
      key: "payOption2",
      label: "iDEAL",
      value: "ideal",
      icon: `${FindockAssets}/icons/ideal.svg`,
      checked: false
    }
  ];

  paymentValue;

  // --- Event Handlers ---

  handlePaymentMethod(event) {
    this.paymentValue = event.target.value;
    const attributeChangeEvent = new FlowAttributeChangeEvent("paymentValue", this.paymentValue);
    this.dispatchEvent(attributeChangeEvent);
  }
}