import { api, wire } from "lwc";
import LightningModal from "lightning/modal";
import getObjects from "@salesforce/apex/FdConfigController.getObjects";
import getFields from "@salesforce/apex/FdConfigController.getFields";

export default class FdObjectFieldCpe extends LightningModal {
  // --- Private Properties

  objectsOptions = [];
  fieldsOptions = [];
  fieldConditionOptions = [
    { label: "Amount", value: "amount" }
  ];
  conditionOptions = [
    { label: "Equal To", value: "equalTo" },
    { label: "Greater Than", value: "greaterThan" },
    { label: "Less Than", value: "lessThan" }
  ];
  object;
  field;
  fieldLabel;
  conditionOperator;
  conditionValue;

  // --- Public Properties ---

  @api label;
  @api values = {};

  // --- Wire Methods/Properties ---

  @wire(getObjects)
  objectsWire({ data, error }) {
    if (data) {
      const objectsOptions = [...data];
      objectsOptions
        .sort((a, b) => this.sortText(a.label, b.label))
        .unshift({ label: "", value: "" });
      this.objectsOptions = [...objectsOptions];
    } else if (error) {
      console.error(error);
    }
  }

  @wire(getFields, { objectApiName: "$object" })
  fieldsWire({ data, error }) {
    if (data) {
      const fieldsOptions = [...data];
      fieldsOptions
        .sort((a, b) => this.sortText(a.label, b.label))
        .unshift({ label: "", value: "" });
      this.fieldsOptions = [...fieldsOptions];
    } else if (error) {
      console.error(error);
    }
  }

  // --- Lifecycle Hooks ---

  connectedCallback() {
    this.object = this.values?.object || "";
    this.field = this.values?.field || "";
    this.fieldLabel = this.values?.fieldLabel || "";
    this.conditionOperator = this.values?.conditionOperator || "";
    this.conditionValue = this.values?.conditionValue || "";
  }

  // --- Private Methods ---

  sortText(a, b) {
    const nameA = a?.toUpperCase();
    const nameB = b?.toUpperCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    return 0;
  }

  // --- Getters ---

  get disableField() {
    return !this.object && this.fieldsOptions?.length <= 0;
  }

  // --- Event Handlers ---

  handleSelectObject(event) {
    const { value } = event.target;
    this.object = value;
    this.field = null;
  }

  handleInputChange(event) {
    const { value, name } = event.target;
    this[name] = value;
  }

  handleCancel() {
    this.close("cancel");
  }

  handleSubmit(event) {
    event.preventDefault();
    const values = {};
    values.index = this.values.index;
    values.object = this.object || "";
    values.field = this.field || "";
    values.fieldLabel = this.fieldLabel || "";
    values.conditionOperator = this.conditionOperator || "";
    values.conditionValue = this.conditionValue || "";
    const json = JSON.stringify(values);
    this.close(json);
  }

}