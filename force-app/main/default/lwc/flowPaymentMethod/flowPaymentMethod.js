import { LightningElement, api } from "lwc";
import FindockAssets from "@salesforce/resourceUrl/findockAssets";
import { FlowAttributeChangeEvent } from "lightning/flowSupport";

export default class flowPaymentMethod extends LightningElement {
  @api paymentMethod;
  @api parameters;

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


  // --- Event Handlers ---

  handlePaymentMethod(event) {
    this.paymentMethod = event.target.value;
    const attributeChangeEvent = new FlowAttributeChangeEvent("paymentMethod", this.paymentMethod);
    this.dispatchEvent(attributeChangeEvent);
  }
}