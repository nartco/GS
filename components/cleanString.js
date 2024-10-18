export function cleanString(str) {
  // Convertit en minuscules
  // Supprime les virgules, les espaces en début et fin, et les caractères non imprimables
  return str
    .toLowerCase()
    .replace(/,/g, '') // Supprime les virgules
    .replace(/^\s+|\s+$/g, '') // Supprime les espaces en début et fin
    .replace(/\s+/g, ' ') // Remplace les séquences d'espaces par un seul espace
    .replace(/[^\x20-\x7E]/g, ''); // Supprime les caractères non imprimables
}
