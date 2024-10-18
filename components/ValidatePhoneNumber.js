import { parsePhoneNumber } from 'libphonenumber-js';

export function validatePhoneNumber(phoneNumber) {
  if (!phoneNumber || phoneNumber.trim() === '') {
    return { isValid: false, errorMessage: "Le numéro de téléphone est requis." };
  }

  // Nettoyage du numéro de téléphone
  const cleanedNumber = phoneNumber.replace(/\s+/g, '');

  // Expressions régulières pour chaque pays
  const countryPatterns = [
    { country: 'FR', regex: /^(?:(?:\+|00)33|0)[1-9](?:[\s.-]*\d{2}){4}$/ }, // France
    { country: 'LU', regex: /^(?:(?:\+|00)352|0)[1-9]\d{1,8}$/ }, // Luxembourg
    { country: 'CH', regex: /^(?:(?:\+|00)41|0)[1-9]\d{1,9}$/ }, // Suisse
    { country: 'BE', regex: /^(?:(?:\+|00)32|0)[1-9]\d{1,9}$/ }, // Belgique
    { country: 'CI', regex: /^(?:(?:\+|00)225|0)[1-9]\d{7,8}$/ } // Côte d'Ivoire
  ];

  // Vérification avec les regex
  for (const { country, regex } of countryPatterns) {
    if (regex.test(cleanedNumber)) {
      return { isValid: true, country, errorMessage: null };
    }
  }

  // Si aucune regex ne correspond, on essaie avec libphonenumber-js
  try {
    const parsedNumber = parsePhoneNumber(cleanedNumber);
    
    if (parsedNumber && parsedNumber.isValid()) {
      return { isValid: true, country: parsedNumber.country, errorMessage: null };
    }
  } catch (error) {
    console.error("Erreur lors de la validation du numéro de téléphone:", error);
  }

  // Si toutes les validations échouent
  return { isValid: false, errorMessage: "Le numéro de téléphone n'est pas valide ou n'est pas reconnu." };
}