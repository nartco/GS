import { formatEuroPrice } from '../modules/DateFinanceUtils';

describe('formatEuroPrice', () => {
  it('formats price correctly for FR locale', () => {
    expect(formatEuroPrice('1000.50', 'fr')).toBe('1 000,50 €');
  });

  it('formats price correctly for EN locale', () => {
    expect(formatEuroPrice('1000.50', 'en')).toBe('€ 1,000.50');
  });

  it('handles integer values', () => {
    expect(formatEuroPrice('1000', 'fr')).toBe('1 000,00 €');
  });
});