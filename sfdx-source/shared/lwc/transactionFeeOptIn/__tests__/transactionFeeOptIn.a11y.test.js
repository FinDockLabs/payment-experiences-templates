import { createElement } from 'lwc';
import TransactionFeeOptIn from 'c/transactionFeeOptIn';

// toBeAccessible() is registered globally by jest.setup.a11y.js via @sa11y/jest setup().

describe('c-transaction-fee-opt-in WCAG 2.2 AA accessibility', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it.each([false, true])('passes axe scan with the checkbox selected: %p', async (value) => {
        const element = createElement('c-transaction-fee-opt-in', { is: TransactionFeeOptIn });
        Object.assign(element, { amountOneTime: '20', currencyIsoCode: 'EUR', percentage: '2.9', label: 'Cover fees for this donation (+{0})', value });
        document.body.appendChild(element);
        await Promise.resolve();
        await expect(element).toBeAccessible();
    });
});
