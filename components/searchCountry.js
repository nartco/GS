export const searchCountry = (countries, searchTerm) => {
  if (!countries || !searchTerm) return null;
  // Normaliser le terme de recherche
  const normalizedSearchTerm = searchTerm
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/’/g, "'")
    .trim();
  // Fonction pour normaliser le nom du pays
  const normalizeName = name =>
    name.toLowerCase().replace(/[''`]/g, "'").trim();

  console.log(normalizeName("cote d'ivoir"), 'ici2', normalizedSearchTerm);
  // Rechercher le pays
  const foundCountry = countries.find(country =>
    normalizeName(country.name).includes(normalizedSearchTerm),
  );
  console.log({foundCountry}, 'ici3');
  return foundCountry || null;
};
