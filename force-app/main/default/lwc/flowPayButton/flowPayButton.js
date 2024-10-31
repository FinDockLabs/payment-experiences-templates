import { LightningElement, api } from "lwc";

export default class flowPayButton extends LightningElement {

  // --- Public Properties ---

  @api amountValue;

  // --- Getters ---

  get buttonText() {
    if (this.amountValue) {
      return `Pay ${this.amountValue}`;
    }
    return "Pay";
  }
}