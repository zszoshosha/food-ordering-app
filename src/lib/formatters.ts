/** Shared currency formatter instance — created once and reused. */
const CURRENCY_FORMATTER = new Intl.NumberFormat("en-us", {
  currency: "USD",
  style: "currency",
});

/**
 * Formats a number as USD currency.
 * @param {number} number - The number to format.
 * @returns {string} The formatted currency string.
 */
export const formatCurrency = (number: number) => {
  return CURRENCY_FORMATTER.format(number);
};
