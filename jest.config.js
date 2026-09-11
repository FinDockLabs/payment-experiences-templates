const { jestConfig } = require('@salesforce/sfdx-lwc-jest/config');

// sfdx-lwc-jest discovers c/* modules under the packageDirectories listed in
// sfdx-project.json. The shared pool lives outside them, so map it here.
const SHARED_LWC = '<rootDir>/sfdx-source/shared/lwc';

// lwc-procode is not a package directory either — it is assembled at build time
// (see its shared.manifest), so its own c/* modules need mapping too.
const PROCODE_LWC = '<rootDir>/sfdx-source/packages/lwc-procode/lwc';

module.exports = {
    ...jestConfig,
    moduleNameMapper: {
        ...jestConfig.moduleNameMapper,

        // Shared pool
        '^c/amountAndFrequency$': `${SHARED_LWC}/amountAndFrequency/amountAndFrequency`,
        '^c/amountAndFrequencyConfig$': `${SHARED_LWC}/amountAndFrequencyConfig/amountAndFrequencyConfig`,
        '^c/currencyPicker$': `${SHARED_LWC}/currencyPicker/currencyPicker`,
        '^c/currencyPickerConfig$': `${SHARED_LWC}/currencyPickerConfig/currencyPickerConfig`,
        '^c/currencyUtils$': `${SHARED_LWC}/currencyUtils/currencyUtils`,
        '^c/experienceProgressStages$': `${SHARED_LWC}/experienceProgressStages/experienceProgressStages`,

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

    // Coverage for the shared pool, which sits outside the packageDirectories the
    // preset derives its pattern from.
    collectCoverageFrom: [
        ...(jestConfig.collectCoverageFrom ?? []),
        'sfdx-source/shared/lwc/**/*',
        'sfdx-source/packages/lwc-procode/lwc/**/*',
        '!**/*.html',
        '!**/*.css',
        '!**/__tests__/**',
    ],
};
