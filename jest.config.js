const { jestConfig } = require('@salesforce/sfdx-lwc-jest/config');

// sfdx-lwc-jest discovers c/* modules under the packageDirectories listed in
// sfdx-project.json. The shared pools (general, donation) live outside them, so map them here.
const GENERAL_LWC = '<rootDir>/sfdx-source/shared/general/lwc';
const DONATION_LWC = '<rootDir>/sfdx-source/shared/donation/lwc';

// lwc-procode is not a package directory either — it ships as source only, so its
// own c/* modules need mapping too.
const PROCODE_LWC = '<rootDir>/sfdx-source/packages/lwc-procode/lwc';

module.exports = {
    ...jestConfig,
    moduleNameMapper: {
        ...jestConfig.moduleNameMapper,

        // Shared pool
        '^c/amountAndFrequency$': `${DONATION_LWC}/amountAndFrequency/amountAndFrequency`,
        '^c/amountAndFrequencyConfig$': `${DONATION_LWC}/amountAndFrequencyConfig/amountAndFrequencyConfig`,
        '^c/currencyPicker$': `${DONATION_LWC}/currencyPicker/currencyPicker`,
        '^c/currencyPickerConfig$': `${DONATION_LWC}/currencyPickerConfig/currencyPickerConfig`,
        '^c/currencyUtils$': `${DONATION_LWC}/currencyUtils/currencyUtils`,
        '^c/experienceProgressStages$': `${DONATION_LWC}/experienceProgressStages/experienceProgressStages`,
        '^c/getUserAgentInfo$': `${GENERAL_LWC}/getUserAgentInfo/getUserAgentInfo`,
        '^c/transactionFeeOptIn$': `${DONATION_LWC}/transactionFeeOptIn/transactionFeeOptIn`,

        // Pro-code pool
        '^c/paymentForm$': `${PROCODE_LWC}/paymentForm/paymentForm`,
        '^c/paymentSelector$': `${PROCODE_LWC}/paymentSelector/paymentSelector`,

        // Stubs in jest-mocks/:
        //   lightning/flowSupport    — Flow-only module, no stub in sfdx-lwc-jest
        //   lightning/messageService — publish() delivers to subscribers, so LMS
        //                              round-trips are testable
        //   cpm/*                    — components from the FinDock Core managed package
        '^lightning/flowSupport$': '<rootDir>/jest-mocks/lightning/flowSupport',
        '^lightning/messageService$': '<rootDir>/jest-mocks/lightning/messageService',
        '^cpm/(.+)$': '<rootDir>/jest-mocks/cpm/$1/$1',
    },

    // LWC preset setup, plus toBeAccessible() from @sa11y/jest for *.a11y.test.js
    setupFilesAfterEnv: [
        ...(jestConfig.setupFilesAfterEnv ?? []),
        '<rootDir>/jest.setup.a11y.js',
    ],

    modulePathIgnorePatterns: ['<rootDir>/_to_delete/'],
    testPathIgnorePatterns: ['/node_modules/', '<rootDir>/_to_delete/'],

    // Coverage for the shared pools, which sit outside the packageDirectories the
    // preset derives its pattern from.
    collectCoverageFrom: [
        ...(jestConfig.collectCoverageFrom ?? []),
        'sfdx-source/shared/*/lwc/**/*',
        'sfdx-source/packages/lwc-procode/lwc/**/*',
        '!**/*.html',
        '!**/*.css',
        '!**/__tests__/**',
    ],
};
