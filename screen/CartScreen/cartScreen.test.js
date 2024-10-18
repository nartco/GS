// __tests__/CartScreen.test.js

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CartScreen from '../screen/CartScreen/CartScreen';
import * as GestionStorage from '../modules/GestionStorage';

jest.mock('../modules/GestionStorage');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  useIsFocused: () => true,
}));

describe('CartScreen', () => {
  beforeEach(() => {
    GestionStorage.getPanier.mockResolvedValue([
      { id: 1, product: { name: 'Test Product' }, quantite: 1, Price: 10 }
    ]);
  });

  it('renders cart items correctly', async () => {
    const { findByText } = render(<CartScreen />);
    const productName = await findByText('Test Product');
    expect(productName).toBeTruthy();
  });

  it('updates total price when quantity changes', async () => {
    const { findByText, getByTestId } = render(<CartScreen />);
    const increaseButton = await getByTestId('increase-quantity-1');
    fireEvent.press(increaseButton);
    const totalPrice = await findByText('20.00 €');
    expect(totalPrice).toBeTruthy();
  });
});