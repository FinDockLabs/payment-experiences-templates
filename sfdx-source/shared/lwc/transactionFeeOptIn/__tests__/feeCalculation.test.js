import { calculateFee } from '../feeCalculation';

describe('calculateFee', () => {
    it.each([
        [20, 2.9, 'EUR', 0.58, 20.58],
        [14.5, 1, 'EUR', 0.15, 14.65],
        [10.5, 5, 'EUR', 0.53, 11.03],
        [1010, 2.9, 'JPY', 29, 1039]
    ])('calculates %p at %p%% in %s as fee %p and total %p', (amount, percentage, code, fee, total) => {
        expect(calculateFee(amount, percentage, code)).toEqual({ fee, total });
    });

    it('rounds half up in minor units for every cent amount', () => {
        for (let cents = 100; cents <= 100000; cents++) {
            const expectedCents = Math.floor((cents * 29 + 500) / 1000);
            expect(calculateFee(cents / 100, 2.9, 'EUR').fee).toBe(expectedCents / 100);
        }
    });

    it.each([[0, 3], [null, 3], [20, 0], [20, null], [20, -1]])(
        'returns null for amount %p and percentage %p', (amount, percentage) => {
            expect(calculateFee(amount, percentage, 'EUR')).toBeNull();
        });
});
