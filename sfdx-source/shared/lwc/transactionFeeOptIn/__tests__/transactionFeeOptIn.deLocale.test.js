import { createElement } from 'lwc';
import TransactionFeeOptIn from 'c/transactionFeeOptIn';

jest.mock('@salesforce/i18n/locale', () => ({ default: 'de-DE' }), { virtual: true });

afterEach(() => {
    while (document.body.firstChild) document.body.removeChild(document.body.firstChild);
});

it('formats the placeholder in the site locale while returning a plain decimal to Flow', () => {
    const element = createElement('c-transaction-fee-opt-in', { is: TransactionFeeOptIn });
    Object.assign(element, {
        fee: '0.58', currencyIsoCode: 'EUR', value: true,
        label: 'Gebühren übernehmen (+{0})', helpText: 'Helfen Sie uns.'
    });
    const published = [];
    element.addEventListener('flowattributechange', (event) => published.push(event.detail));
    document.body.appendChild(element);
    const input = element.shadowRoot.querySelector('lightning-input');
    expect(input.label).toMatch(/^Gebühren übernehmen \(\+0,58\s€\)$/);
    expect(element.shadowRoot.querySelector('.help-text').textContent).toBe('Helfen Sie uns.');
    expect(published).toContainEqual({ attributeName: 'addedFee', attributeValue: '0.58' });
});
