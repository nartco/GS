// services/geoNamesService.js
import axios from 'axios';

import axiosInstance from '../axiosInstance';

const username = 'godare_services'; // Remplacez par votre nom d'utilisateur GeoNames

const searchCity = async (countryCode, cityName, CodePostal) => {
  let url = `http://api.geonames.org/searchJSON?formatted=true&country=${countryCode}&name_startsWith=${cityName}&username=${username}&maxRows=1000&featureClass=P&style=SHORT`;

  if (CodePostal) {
    url = `http://api.geonames.org/postalCodeSearchJSON?formatted=true&country=${countryCode}&postalcode_startsWith=${CodePostal}&placename_startsWith=${cityName}&username=${username}&maxRows=500&featureClass=P&style=SHORT`;
  }

  try {
    const response = await axios.get(url);

    if (CodePostal) {
      return response.data.postalCodes;
    } else if (response.data.geonames) {
      return response.data.geonames;
    } else {
      throw new Error('Aucune donnée trouvée');
    }
  } catch (error) {
    console.error('error', error);
    throw new Error('Erreur lors de la recherche de la ville');
  }
};

const searchPostalCodes = async (countryCode, postalCode) => {
  const url = `http://api.geonames.org/postalCodeSearchJSON?formatted=true&country=${countryCode}&postalcode_startsWith=${postalCode}&username=${username}&maxRows=500&featureClass=P&style=SHORT`;

  try {
    const response = await axios.get(url);
    if (response.data.postalCodes) {
      return response.data.postalCodes;
    } else {
      throw new Error('Aucune donnée trouvée');
    }
  } catch (error) {
    console.error(error);
    throw new Error('Erreur lors de la recherche du code postal');
  }
};

const getCitiesByCountryCode = async (countryCode, start, max) => {
  try {
    start = start ? start : 0;
    max = max ? max : 150;

    const response = await axiosInstance.get(
      `https://nominatim.openstreetmap.org/search.php?q=cocody&countrycodes=${countryCode}&format=jsonv2`,
    );

    return response ? response.data : [];
  } catch (erreur) {
    console.log('getCitiesByCountryCode error', erreur);
  }
};

const normalizeString = str => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[œ]/g, 'oe') // Remplace œ par oe
    .replace(/[æ]/g, 'ae') // Remplace æ par ae
    .toLowerCase(); // Convertit en minuscules
};

const GOOGLE_API_KEY = 'AIzaSyAPWaKa1sbejn_WPGWO8MFsokdyAkAep7o'; // Remplacez par votre clé API Google

export const searchSpecificCity = async (partialCityName, countryCode) => {
  const baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
  const params = {
    address: `${partialCityName}`,
    components: `country:${countryCode}`,
    key: GOOGLE_API_KEY,
    language: 'fr',
  };

  console.log('Paramètres de recherche:', params);

  try {
    const response = await axios.get(baseUrl, {params});
    console.log('Réponse reçue:', JSON.stringify(response.data));

    if (response.data.status !== 'OK') {
      throw new Error(`Erreur Google Geocoding: ${response.data.status}`);
    }

    // Filtrer les résultats pour ne garder que ceux qui commencent par le terme de recherche
    const filteredResults = response.data.results;

    console.log(JSON.stringify(filteredResults));
    return filteredResults.map(result => ({
      name: result.formatted_address,
      subName: result.address_components[0].short_name,
      lat: result.geometry.location.lat,
      lon: result.geometry.location.lng,
      type: getLocationType(result),
      importance: getImportance(result),
      address: formatAddress(result),
    }));
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    throw error;
  }
};

const getSubName = result => {
  const adminArea = result.address_components.find(component =>
    component.types.includes('administrative_area_level_1'),
  );
  return adminArea ? adminArea.long_name : '';
};

const getLocationType = result => {
  const types = result.types;
  if (types.includes('locality')) return 'city';
  if (types.includes('administrative_area_level_2')) return 'town';
  if (types.includes('administrative_area_level_3')) return 'village';
  return 'unknown';
};

const getImportance = result => {
  const adminLevels = result.types.filter(type =>
    type?.startsWith('administrative_area_level_'),
  );
  return adminLevels.length > 0 ? parseInt(adminLevels[0].split('_').pop()) : 0;
};

const searchCitiesByPartialName = async (partialCityName, countryCode) => {
  try {
    const response = await axiosInstance.post('/search/commune_code_postal', {
      pays: countryCode,
      commune: partialCityName,
      limite: 20,
    });

    console.log({countryCode}, {partialCityName});
    if (response && response.data) {
      // Filtrer les résultats pour ne garder que ceux qui commencent par le terme de recherche
      const filteredResults = response.data.filter(city =>
        city.commune.toLowerCase()?.startsWith(partialCityName.toLowerCase()),
      );

      // Modifier l'objet pour renommer les propriétés
      return filteredResults.map(result => ({
        name: result.commune,
        subName: result.commune,
        postalCode: result.codePostal,
        placeName: result.commune,
      }));
    }

    return [];
  } catch (error) {
    console.error('searchCitiesByPartialName error', error);
    throw error;
  }
};

const formatAddress = result => {
  const address = {};
  result.address_components.forEach(component => {
    component.types.forEach(type => {
      address[type] = component.long_name;
    });
  });
  return address;
};

// Exemple d'utilisation
searchSpecificCity('coco', 'CI')
  .then(results => console.log('Résultats:', results))
  .catch(error => console.error('Erreur:', error));

const getCitiesByCountryCodeAndSearchCity = async (
  countryCode,
  city,
  start,
  max,
) => {
  try {
    start = start ? start : 0;
    max = max ? max : 150;

    const response = await axiosInstance.get(
      `/geonames/city/${countryCode}/${city}?start=${start}&max=${max}`,
    );

    return response ? response.data : [];
  } catch (erreur) {
    console.log('getCitiesByCountryCodeAndSearchCity error', erreur);
  }
};

const getPostalCodeByCountryCode = async (countryCode, start, max) => {
  try {
    start = start ? start : 0;
    max = max ? max : 150;

    const response = await axiosInstance.get(
      `/geonames/postal_code/${countryCode}?start=${start}&max=${max}`,
    );

    return response ? response.data : [];
  } catch (erreur) {
    console.log('getPostalCodeByCountryCode error', erreur);
  }
};

const getCitiesByPostalCode = async (countryCode, postalCode, start, max) => {
  try {
    start = start ? start : 0;
    max = max ? max : 10;
    const response = await axiosInstance.get(
      `/geonames/city_by_postal_code/${countryCode}/${postalCode}?start=${start}&max=${max}`,
    );
    console.log(response.data);
    if (response && response.data) {
      // Grouper les résultats par code postal
      const groupedByPostalCode = response.data.reduce((acc, city) => {
        if (!acc[city.postalCode]) {
          acc[city.postalCode] = [];
        }
        acc[city.postalCode].push(city);
        return acc;
      }, {});

      // Pour chaque groupe, garder seulement la ville avec le nom le plus long
      const filteredData = Object.values(groupedByPostalCode).map(cities => {
        return cities.reduce((longest, current) => {
          return current.placeName.length > longest.placeName.length
            ? current
            : longest;
        });
      });

      return filteredData;
    }

    return [];
  } catch (erreur) {
    console.log('getCitiesByPostalCode error', erreur);
    return [];
  }
};

const searchCitiesByPostalCode = async (countryCode, postalCode) => {
  try {
    const response = await axiosInstance.post('/search/commune_code_postal', {
      pays: countryCode,
      codePostal: postalCode,
      limite: 20,
    });

    if (response && response.data) {
      // Grouper les résultats par code postal
      const groupedByPostalCode = response.data.reduce((acc, city) => {
        if (!acc[city.codePostal]) {
          acc[city.codePostal] = [];
        }
        acc[city.codePostal].push(city);
        return acc;
      }, {});

      const allCities = Object.values(groupedByPostalCode).flatMap(
        cities => cities,
      );
      // Si vous voulez conserver la structure par code postal :

      console.log({allCities});
      // Modifier l'objet pour renommer les propriétés
      return allCities.map(item => ({
        postalCode: item.codePostal,
        placeName: item.commune,
        libelleName: item.codePostal,
        name: item.commune,
      }));
    }

    return [];
  } catch (error) {
    console.log('searchCitiesByPostalCode error', error);
    return [];
  }
};

export {
  searchCity,
  searchPostalCodes,
  getCitiesByCountryCode,
  getCitiesByCountryCodeAndSearchCity,
  getPostalCodeByCountryCode,
  getCitiesByPostalCode,
  searchCitiesByPostalCode,
  searchCitiesByPartialName,
};
