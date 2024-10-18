// __tests__/ProductList.test.js

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProductList from '../screen/Shopping/ProductList';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  useRoute: () => ({ 
    params: { 
      category: { products: [] },
      PaysLivraison: {},
      Service: { code: 'test-service' },
      Language: 'en'
    } 
  }),
}));

describe('ProductList', () => {
  it('renders correctly', () => {
    const { getByText } = render(<ProductList />);
    expect(getByText('Trier')).toBeTruthy();
  });

  it('changes view mode when grid icon is pressed', () => {
    const { getByTestId } = render(<ProductList />);
    const gridIcon = getByTestId('grid-icon');
    fireEvent.press(gridIcon);
    // Add expectations based on how your UI changes
  });

  // Add more tests for sorting, filtering, etc.
});