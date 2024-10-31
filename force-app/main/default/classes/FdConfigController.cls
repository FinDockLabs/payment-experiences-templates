public without sharing class FdConfigController {
    @AuraEnabled(Cacheable=true)
    public static List<FdPickList> getCurrencyPicklist() {
        ConnectApi.OrganizationSettings orgSettings = ConnectApi.Organization.getSettings();
        System.debug(orgSettings.userSettings.currencySymbol);
        System.debug(orgSettings.features.defaultCurrencyIsoCode);

        if (UserInfo.isMultiCurrencyOrganization()) {
            List<FdPickList> picklistValues = new List<FdPickList>();
            // TODO: Need to prevent errors when Multi-Currency isn't set up.
            List<sObject> currencyTypeList = Database.query ( 'select Id, IsoCode from CurrencyType where IsActive=true');
            for (sObject currencyType : currencyTypeList) {
                FdPickList value = new FdPickList(
                (String) currencyType.get('IsoCode'),
                (String) currencyType.get('IsoCode')
                );
                picklistValues.add(value);
            }
            return picklistValues;
        }

        return null;
    }

    @AuraEnabled(Cacheable=true)
    public static List<FdPickList> getObjects() {
        List<FdPickList> picklistValues = new List<FdPickList>();
        for (Schema.SObjectType objTyp : Schema.getGlobalDescribe().values()) {
            String name = objTyp.getDescribe().getName();
            String label = objTyp.getDescribe().getLabel();
            if (
                !name.containsIgnoreCase('history') &&
                !name.containsIgnoreCase('tag') &&
                !name.containsIgnoreCase('share') &&
                !name.containsIgnoreCase('feed') &&
                !name.containsIgnoreCase('group') &&
                !name.containsIgnoreCase('public') &&
                !objTyp.getDescribe().isCustomSetting() &&
                objTyp.getDescribe().isCreateable() &&
                objTyp.getDescribe().getRecordTypeInfos().size() > 0
            ) {
                FdPickList value = new FdPickList(label, name);
                picklistValues.add(value);
            }
        }
        System.debug(picklistValues);
        if (picklistValues != null && picklistValues.size() > 0) {
            return picklistValues;
        } else {
            return null;
        }
    }

    @AuraEnabled(Cacheable=true)
    public static List<FdPickList> getFields(String objectApiName) {
        if (String.isNotBlank(objectApiName)) {
            List<FdPickList> picklistValues = new List<FdPickList>();
            Map<String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
            Map<String, Schema.SObjectField> fieldMap = schemaMap.get(objectApiName)
                .getDescribe()
                .fields.getMap();
            for (String fieldName : fieldMap.keySet()) {
                FdPickList value = new FdPickList(
                fieldMap.get(fieldName).getDescribe().getLabel(),
                fieldMap.get(fieldName).getDescribe().getName()
                );
                picklistValues.add(value);
            }
            if (picklistValues != null && picklistValues.size() > 0) {
                return picklistValues;
            }
        }
        return null;
    }

    public class FdPickList {
        @AuraEnabled
        public String label { get; set; }
        @AuraEnabled
        public String value { get; set; }

        public FdPickList(String label, String value) {
        this.label = label;
        this.value = value;
        }
    }
}
