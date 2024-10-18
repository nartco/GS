// __tests__/CheckoutScreen.test.js

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CheckoutScreen from '../screen/ChekoutScreen/CheckoutScreen';
import * as GestionStorage from '../modules/GestionStorage';

jest.mock('../modules/GestionStorage');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  useIsFocused: () => true,
}));

describe('CheckoutScreen', () => {
  beforeEach(() => {
    GestionStorage.getSelectedService.mockResolvedValue({ code: 'test-service' });
    GestionStorage.getSelectedCountry.mockResolvedValue({ id: 1, name: 'Test Country' });
    GestionStorage.getPlatformLanguage.mockResolvedValue('en');
    GestionStorage.getPanier.mockResolvedValue([]);
  });

  it('renders correctly', async () => {
    const { getByText } = render(<CheckoutScreen />);
    await waitFor(() => {
      expect(getByText('Mode de livraison')).toBeTruthy();
    });
  });

  it('displays error when trying to navigate without selecting delivery mode', async () => {
    const { getByText } = render(<CheckoutScreen />);
    await waitFor(() => {
      const validateButton = getByText('Valider la commande');
      fireEvent.press(validateButton);
      expect(getByText("Vous devez choisir un créneau")).toBeTruthy();
    });
  });
});