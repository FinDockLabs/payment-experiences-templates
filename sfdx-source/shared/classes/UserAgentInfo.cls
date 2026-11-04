/**
 * Browser, OS and device details parsed from the user agent, plus the browser locale. Returned to the flow by the
 * getUserAgentInfo local action as one Apex-defined variable (userAgentInfo).
 */
public with sharing class UserAgentInfo {
    @AuraEnabled
    public String browserName;

    @AuraEnabled
    public String browserVersion;

    @AuraEnabled
    public String browserVendor;

    @AuraEnabled
    public String osName;

    @AuraEnabled
    public String osVersion;

    @AuraEnabled
    public String osVendor;

    @AuraEnabled
    public String deviceType;

    @AuraEnabled
    public String deviceModel;

    @AuraEnabled
    public String deviceVendor;

    @AuraEnabled
    public Boolean isMobile;

    @AuraEnabled
    public String locale;
}
