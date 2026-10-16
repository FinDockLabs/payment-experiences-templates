/**
 * Returns the org's active ISO currency codes for currencyPicker's auto-detect mode
 * (used when the component has no explicit allow-list configured).
 *
 * In a multi-currency org this is every active CurrencyType;
 * in a single-currency org it's just the org's default currency.
 */
public with sharing class CurrencyPickerController {
    @TestVisible
    private static OrgCurrencies orgCurrencies = new OrgCurrencies();

    @AuraEnabled(Cacheable=true)
    public static List<String> getActiveCurrencies() {
        if (!orgCurrencies.isMultiCurrency()) {
            String defaultCurrency = orgCurrencies.getDefaultCurrency();
            return String.isNotBlank(defaultCurrency) ? new List<String> {
                defaultCurrency
            } : new List<String>();
        }
        return orgCurrencies.getActiveIsoCodes();
    }

    public virtual with sharing class OrgCurrencies {
        public virtual Boolean isMultiCurrency() {
            return UserInfo.isMultiCurrencyOrganization();
        }

        public virtual String getDefaultCurrency() {
            return UserInfo.getDefaultCurrency();
        }

        public virtual List<String> getActiveIsoCodes() {
            List<String> codes = new List<String>();
            for (SObject ct : Database.query(
                'SELECT IsoCode FROM CurrencyType WHERE IsActive = TRUE ORDER BY IsoCode',
                System.AccessLevel.SYSTEM_MODE)) {
                codes.add((String) ct.get('IsoCode'));
            }
            return codes;
        }
    }
}
