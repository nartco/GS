export const removeCountryCode = phoneNumber => {
  if(!phoneNumber) return phoneNumber
  // Liste des indicatifs à supprimer
  const prefixes = [
    '+33', // France
    '+225', // Côte d'Ivoire
    '+352', // Luxembourg
    '+41', // Suisse
    '+32', // Belgique
  ];

  // Vérifier et supprimer le préfixe s'il existe
  for (let prefix of prefixes) {
    if (phoneNumber?.startsWith(prefix)) {
      // Supprimer le préfixe et le premier zéro s'il existe
      return phoneNumber.slice(prefix.length);
    }
  }

  // Si aucun préfixe n'est trouvé, retourner le numéro tel quel
  return phoneNumber;
};

// LOG  Côte d’Ivoire adressePays:  Pays: Côte d’Ivoire
// LOG  Côte d'Ivoire adressePays: Côte d'Ivoire Pays: CI