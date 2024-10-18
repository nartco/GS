export const getCountryCodeFromPhone = phoneNumber => {
  // Objet associant les indicatifs aux codes pays
  const prefixToCountry = {
    '+33': 'FR', // France
    '+225': 'CI', // Côte d'Ivoire
    '+352': 'LU', // Luxembourg
    '+41': 'CH', // Suisse
    '+32': 'BE', // Belgique
    '+1': 'US', // États-Unis et Canada
    '+44': 'GB', // Royaume-Uni
    '+49': 'DE', // Allemagne
    '+39': 'IT', // Italie
    '+34': 'ES', // Espagne
    '+31': 'NL', // Pays-Bas
    '+351': 'PT', // Portugal
    '+30': 'GR', // Grèce
    '+46': 'SE', // Suède
    '+47': 'NO', // Norvège
    '+45': 'DK', // Danemark
    '+358': 'FI', // Finlande
    '+43': 'AT', // Autriche
    '+48': 'PL', // Pologne
    '+420': 'CZ', // République Tchèque
    '+36': 'HU', // Hongrie
    // Ajoutez d'autres pays selon vos besoins
  };

  // Vérifier les préfixes
  for (const [prefix, countryCode] of Object.entries(prefixToCountry)) {
    if (phoneNumber?.startsWith(prefix)) {
      return countryCode;
    }
  }

  // Si aucun préfixe correspondant n'est trouvé, retourner null ou un code par défaut
  return null; // ou 'UNKNOWN' si vous préférez une valeur par défaut
};
