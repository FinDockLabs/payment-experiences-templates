import { createElement } from 'lwc';
import FormattedAmount from 'c/formattedAmount';

// toBeAccessible() is registered globally by jest.setup.a11y.js via @sa11y/jest setup().

function createComponent(props) {
    const element = createElement('c-formatted-amount', { is: FormattedAmount });
    Object.assign(element, props);
    document.body.appendChild(element);
    return element;
}

describe('c-formatted-amount WCAG 2.2 AA accessibility', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it.each(['heading', 'text', 'checkbox'])('passes axe scan for the %s variant', async (variant) => {
        const element = createComponent({ amount: '0.5', currencyIsoCode: 'EUR', variant, label: 'Cover fees for this donation (+{0})' });
        await Promise.resolve();
        await expect(element).toBeAccessible();
    });
});
