// __tests__/CalculPrix.test.js

import { calculFraisLivraison, calculProductPrices } from '../modules/CalculPrix';

describe('CalculPrix', () => {
  describe('calculFraisLivraison', () => {
    it('calculates shipping fees correctly', () => {
      const basketData = [
        { product: { productSpecificites: [{ livraison: { fraisLivraison: 5 } }] } },
        { product: { productSpecificites: [{ livraison: { fraisLivraison: 3 } }] } }
      ];
      expect(calculFraisLivraison(basketData)).toBe(8);
    });
  });

  describe('calculProductPrices', () => {
    it('calculates total price correctly with discounts', () => {
      const products = [
        { Price: 100, quantite: 2 },
        { Price: 50, quantite: 1 }
      ];
      const remiseValue = 10;
      const result = calculProductPrices(products, remiseValue);
      expect(result.totalPrix).toBe(225); // (100 * 2 + 50) - 10% discount
    });
  });
});