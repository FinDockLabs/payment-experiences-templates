@IsTest
private class CurrencyPickerControllerTest {
    @IsTest
    static void getActiveCurrenciesShouldReturnDefaultCurrencyInSingleCurrencyOrg() {
        List<String> currencies = getActiveCurrenciesFrom(new OrgCurrenciesStub(false, 'EUR', new List<String> {'GBP', 'USD'}));

        Assert.areEqual(new List<String> {'EUR'}, currencies, 'Return only the default currency');
    }

    @IsTest
    static void getActiveCurrenciesShouldReturnEmptyListWhenDefaultCurrencyIsNull() {
        List<String> currencies = getActiveCurrenciesFrom(new OrgCurrenciesStub(false, null, new List<String> {'GBP'}));

        Assert.areEqual(new List<String>(), currencies, 'A missing default must return an empty list');
    }

    @IsTest
    static void getActiveCurrenciesShouldReturnEmptyListWhenDefaultCurrencyIsEmpty() {
        List<String> currencies = getActiveCurrenciesFrom(new OrgCurrenciesStub(false, '', new List<String> {'GBP'}));

        Assert.areEqual(new List<String>(), currencies, 'An empty default must return an empty list');
    }

    @IsTest
    static void getActiveCurrenciesShouldReturnEmptyListWhenDefaultCurrencyIsWhitespace() {
        List<String> currencies = getActiveCurrenciesFrom(new OrgCurrenciesStub(false, '   ', new List<String> {'GBP'}));

        Assert.areEqual(new List<String>(), currencies, 'Whitespace must not become a currency code');
    }

    @IsTest
    static void getActiveCurrenciesShouldReturnActiveIsoCodesInMultiCurrencyOrg() {
        List<String> currencies = getActiveCurrenciesFrom(new OrgCurrenciesStub(true, 'CHF', new List<String> {'EUR', 'GBP', 'USD'}));

        Assert.areEqual(new List<String> {'EUR', 'GBP', 'USD'}, currencies, 'Return all active currency codes');
    }

    @IsTest
    static void getActiveCurrenciesShouldReturnEmptyListWhenNoCurrencyIsActive() {
        List<String> currencies = getActiveCurrenciesFrom(new OrgCurrenciesStub(true, 'CHF', new List<String>()));

        Assert.areEqual(new List<String>(), currencies, 'No active currencies must return an empty list');
    }

    @IsTest
    static void getActiveCurrenciesShouldMatchOrgCurrencySettings() {
        Test.startTest();
        List<String> currencies = CurrencyPickerController.getActiveCurrencies();
        Test.stopTest();

        Assert.areEqual(getExpectedOrgCurrencies(), currencies, 'Return the currencies available in this org, in ISO code order');
    }

    @IsTest
    static void getActiveIsoCodesShouldThrowQueryExceptionInSingleCurrencyOrg() {
        if (UserInfo.isMultiCurrencyOrganization()) {
            return; // the real query is verified by getActiveCurrenciesShouldMatchOrgCurrencySettings
        }

        Test.startTest();
        try {
            new CurrencyPickerController.OrgCurrencies().getActiveIsoCodes();
            Assert.fail('CurrencyType should not be queryable without multi-currency');
        } catch (QueryException e) {
            Assert.isTrue(e.getMessage().contains('CurrencyType'), 'Exception should name the missing CurrencyType object');
        }
        Test.stopTest();
    }

    @IsTest
    static void getActiveCurrenciesShouldReturnOrgCurrenciesForSiteGuestUser() {
        User guestUser = getGuestSiteUser();
        if (guestUser == null) {
            return;
        }

        List<String> currencies;
        List<String> expected;
        System.runAs(guestUser) {
            expected = getExpectedOrgCurrencies();
            Test.startTest();
            currencies = CurrencyPickerController.getActiveCurrencies();
            Test.stopTest();
        }

        Assert.areEqual(expected, currencies, 'A site guest must get the same currencies as the org offers');
    }

    private static List<String> getActiveCurrenciesFrom(OrgCurrenciesStub source) {
        CurrencyPickerController.orgCurrencies = source;
        Test.startTest();
        List<String> currencies = CurrencyPickerController.getActiveCurrencies();
        Test.stopTest();
        return currencies;
    }

    private static List<String> getExpectedOrgCurrencies() {
        List<String> expected = new List<String>();
        if (UserInfo.isMultiCurrencyOrganization()) {
            for (SObject currencyType : Database.query(
                'SELECT IsoCode FROM CurrencyType WHERE IsActive = TRUE ORDER BY IsoCode',
                System.AccessLevel.SYSTEM_MODE)) {
                expected.add((String) currencyType.get('IsoCode'));
            }
        } else if (String.isNotBlank(UserInfo.getDefaultCurrency())) {
            expected.add(UserInfo.getDefaultCurrency());
        }
        return expected;
    }

    private static User getGuestSiteUser() {
        List<Site> sites = [SELECT GuestUserId FROM Site WHERE Name IN ('Donation_Page1', 'Checkout_Page1') AND GuestUserId != NULL ORDER BY Name LIMIT 1];
        if (sites.isEmpty()) {
            return null;
        }
        return [SELECT Id FROM User WHERE Id = :sites[0].GuestUserId];
    }

    private class OrgCurrenciesStub extends CurrencyPickerController.OrgCurrencies {
        private final Boolean multiCurrency;
        private final String defaultCurrency;
        private final List<String> activeIsoCodes;

        OrgCurrenciesStub(Boolean multiCurrency, String defaultCurrency, List<String> activeIsoCodes) {
            this.multiCurrency = multiCurrency;
            this.defaultCurrency = defaultCurrency;
            this.activeIsoCodes = activeIsoCodes;
        }

        public override Boolean isMultiCurrency() {
            return multiCurrency;
        }

        public override String getDefaultCurrency() {
            return defaultCurrency;
        }

        public override List<String> getActiveIsoCodes() {
            return activeIsoCodes;
        }
    }
}
