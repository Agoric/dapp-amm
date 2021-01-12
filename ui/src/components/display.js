// @ts-check

// Mostly copied from dapp-svelte-wallet/ui/src/display.js
import { assert, details } from '@agoric/assert';
import { MathKind } from '@agoric/ertp';

const CONVENTIONAL_DECIMAL_PLACES = 2;

/**
 * @typedef {{ amountMathKind?: AmountMathKind } & DisplayInfo} AmountDisplayInfo
 */

/**
 *
 * @param {string} str
 * @param {AmountDisplayInfo} displayInfo
 */
export function parseValue(str, displayInfo) {
  console.log('PARSE_VALUE_STR', str);
  const { amountMathKind = MathKind.NAT, decimalPlaces = 0 } =
    displayInfo || {};

  assert.typeof(str, 'string', details`valueString ${str} is not a string`);

  if (amountMathKind !== MathKind.NAT) {
    // Punt to JSON5 parsing.
    return JSON.parse(str);
  }

  // Parse the string as a number.
  const match = str.match(/^0*(\d+)(\.(\d*[1-9])?0*)?$/);
  assert(match, details`${str} must be a non-negative decimal number`);

  const unitstr = match[1];
  const dec0str = match[3] || '';
  const dec0str0 = dec0str.padEnd(decimalPlaces, '0');
  assert(
    dec0str0.length <= decimalPlaces,
    details`${str} exceeds ${decimalPlaces} decimal places`,
  );

  return parseInt(`${unitstr}${dec0str0}`, 10);
}

/**
 *
 * @param {any} value
 * @param {AmountDisplayInfo} [displayInfo]
 * @returns {string}
 */
export function stringifyValue(value, displayInfo = undefined) {
  const { amountMathKind = MathKind.NAT, decimalPlaces = 0 } =
    displayInfo || {};

  if (amountMathKind !== MathKind.NAT) {
    // Just return the size of the set.
    return `${value.length}`;
  }

  const bValue = BigInt(value);
  if (!decimalPlaces) {
    // Nothing else to do.
    return `${bValue}`;
  }

  const bScale = BigInt(10) ** BigInt(decimalPlaces);

  // Take integer division of the value by the scale.
  const unitstr = `${bValue / bScale}`;

  // Find the remainder of the value divided by the scale.
  const bDecimals = BigInt(bValue % bScale);

  // Create the decimal string.
  const decstr = `${bDecimals}`
    // Convert 100 to '0000100'.
    .padStart(decimalPlaces, '0')
    // Trim off trailing zeros.
    .replace(/0+$/, '')
    // Ensure we have at least CONVENTIONAL_DECIMAL_PLACES.
    .padEnd(CONVENTIONAL_DECIMAL_PLACES, '0');

  if (!decstr) {
    // No decimals to display.
    return `${unitstr}`;
  }

  // Display a decimal point with the units and decimals.
  return `${unitstr}.${decstr}`;
}

export const stringifyPurseValue = purse => {
  if (!purse) {
    return '0';
  }
  return stringifyValue(purse.value, purse.displayInfo);
};
