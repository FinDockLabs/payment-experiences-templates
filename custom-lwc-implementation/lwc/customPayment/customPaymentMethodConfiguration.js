export const PAYMENT_METHOD_CONFIG = [
    {
        "key": "PaymentHub-Stripe-CreditCard",
        "name": "CreditCard",
        "processor": "PaymentHub-Stripe",
        "processorPrettyName": "Stripe",
        "processorFriendlyName": "Stripe",
        "active": true,
        "supportsRecurring": true,
        "displayLabel": "Credit Card",
        "enabledOneTime": true,
        "isDefaultOneTime": true,
        "enabledRecurring": true,
        "isDefaultRecurring": true,
        "merchantAccount": "TestMerchant1",
        "merchantAccountGroup": "static",
        "redirectInstruction": "You will be redirected to your bank to complete the payment.",
        "target": "TestMerchant1",
        "parameters": [{
            "name": "description",
            "data_type": "String",
            "required": false,
            "description": "Description of the payment for the payer’s bank.",
            "visibleToCustomer": false,
            "displayLabel": "Description",
            "value": "This is a description"
        }]
    },
    {
        "key": "PaymentHub-Stripe-iDEAL",
        "name": "iDEAL",
        "processor": "PaymentHub-Stripe",
        "processorPrettyName": "Stripe",
        "processorFriendlyName": "Stripe",
        "active": true,
        "supportsRecurring": false,
        "displayLabel": "iDEAL",
        "enabledOneTime": true,
        "isDefaultOneTime": false,
        "enabledRecurring": false,
        "isDefaultRecurring": false,
        "merchantAccount": "TestMerchant1",
        "merchantAccountGroup": "static",
        "redirectInstruction": "You will be redirected to your bank to complete the payment.",
        "target": "TestMerchant1",
        "parameters": [{
            "name": "description",
            "data_type": "String",
            "required": false,
            "description": "Description of the payment for the payer’s bank.",
            "visibleToCustomer": false,
            "displayLabel": "Description",
            "value": "This is a description"
        }]
    }
]


/**
 * The `parameters` field is an optional array on each entry in PAYMENT_METHOD_CONFIG that
 * lets you pass additional, payment-method-specific inputs to the processor.
 * Set it to `null` when no extra parameters are needed (as shown in the entries above).
 *
 * When a payment method supports extra inputs, replace `null` with an array of parameter
 * objects. Each object has the following fields:
 *
 *   @property {string}   name              - The parameter key expected by the processor (e.g. "issuer", "brand").
 *   @property {string}   data_type         - The value type: "String", "Enum", "Boolean", or "Number".
 *   @property {boolean}  required          - Whether the processor requires this parameter to be provided.
 *   @property {boolean}  visibleToCustomer - When true, the parameter is rendered as an input field in the
 *                                            payment form so the customer can supply the value directly.
 *                                            When false, the value must be set programmatically before submission.
 *   @property {string}   description       - Human-readable explanation of what the parameter controls.
 *   @property {string}   [displayLabel]    - Label shown to the customer in the payment form when
 *                                            visibleToCustomer is true. Falls back to `name` if omitted.
 *   @property {*}        [value]           - A pre-set value for the parameter. Use this to supply a default
 *                                            or fixed value programmatically (e.g. when visibleToCustomer is
 *                                            false). Should match the type defined by `data_type`.
 *   @property {Array}    [enum]            - (Enum only) List of allowed value objects, each containing:
 *                                              { value, label, image?: { svg } }
 *                                            Use these to render a selection UI (e.g. a bank picker or card-brand picker).
 *   @property {string[]} [literals]        - (Enum only) Flat list of the allowed values, mirroring the `value`
 *                                            fields from `enum`. Useful for quick client-side validation.
 *
 * Example — an Enum parameter (iDEAL bank picker) and a String parameter (payment description):
 *
 *   "parameters": [
 *     {
 *       "name": "issuer",
 *       "data_type": "Enum",
 *       "required": false,
 *       "description": "The issuing bank. Skips the bank-selection screen and redirects the user straight to their bank.",
 *       "enum": [
 *         { "value": "abnamro", "label": "ABN AMRO", "image": { "svg": "https://external.findock.com/icon/payment-methods/ideal/abnamro.svg" } },
 *         { "value": "ing",     "label": "ING",      "image": { "svg": "https://external.findock.com/icon/payment-methods/ideal/ing.svg" } }
 *         // ... add more options as needed
 *       ],
 *       "literals": ["abnamro", "ing"]
 *     },
 *     {
 *       "name": "description",
 *       "data_type": "String",
 *       "required": false,
 *       "description": "Description of the payment shown on the payer's bank statement."
 *     }
 *   ]
 */

