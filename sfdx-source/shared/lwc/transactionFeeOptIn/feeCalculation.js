import { currencyDecimals } from 'c/currencyUtils';

// Percentages are supported up to 4 decimal places, e.g. 2.9125.
const PERCENTAGE_SCALE = 10000;

/**
 * Calculate a fee as a percentage of an amount that does not include it yet, in the currency's
 * minor units with half-up rounding, e.g. 2.9% of EUR 20.00 is 0.58 and 1% of EUR 14.50 is 0.15.
 * Returns { fee, total }, or null when the amount or the percentage is not positive.
 */
export function calculateFee(amount, percentage, code) {
    if (!(amount > 0) || !(percentage > 0)) {
        return null;
    }
    const scale = 10 ** currencyDecimals(code);
    const amountUnits = Math.round(amount * scale);
    const percentageUnits = Math.round(percentage * PERCENTAGE_SCALE);
    const divisor = 100 * PERCENTAGE_SCALE;
    const feeUnits = Math.floor((amountUnits * percentageUnits + divisor / 2) / divisor);
    return { fee: feeUnits / scale, total: (amountUnits + feeUnits) / scale };
}
