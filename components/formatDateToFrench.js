import { Platform } from 'react-native';

export const formatDateToFrench = (dateString) => {
  try {
    const date = new Date(dateString);
    
    if (Platform.OS === 'android') {
      // Sur Android, nous devons utiliser une approche différente
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('fr-FR', options);
    } else {
      // Sur iOS, nous pouvons utiliser Intl.DateTimeFormat
      const formatter = new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      return formatter.format(date);
    }
  } catch (error) {
    console.error('Erreur de formatage de date:', error);
    return dateString; // Retourne la chaîne originale en cas d'erreur
  }
};

