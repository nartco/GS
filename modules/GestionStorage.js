import AsyncStorage from "@react-native-async-storage/async-storage";
import _ from "lodash";

/**
 * Sauvegarde les services dans AsyncStorage
 *
 * @param {array} remises
 * @throws {Error} si les services ne sont pas de type tableau
 *
 */
export async function saveRemises(remises) {
  if (!Array.isArray(remises)) {
    throw new Error("Remises doit être un tableau");
  }

  try {
    await AsyncStorage.setItem("remises", JSON.stringify(remises));
  } catch (error) {
    console.log("error", error);
  }
}

export async function saveConversationMessagesObject(messageObject) {
  try {
    await AsyncStorage.setItem(
      "conversationMessagesObject",
      JSON.stringify(messageObject)
    );
  } catch (error) {
    console.log("error", error);
  }
}

export const getConversationMessagesObject = async () => {
  try {
    let conversationMessagesObject = await AsyncStorage.getItem(
      "conversationMessagesObject"
    );
    conversationMessagesObject = JSON.parse(conversationMessagesObject);

    return conversationMessagesObject ? conversationMessagesObject : [];
  } catch (error) {
    console.log("error", error);
    return null;
  }
};

export async function savePlatformLanguage(language, isManualChange = false) {
  try {
    await AsyncStorage.setItem("platformLanguage", language);

    if (isManualChange) {
      await AsyncStorage.setItem("platformLanguageManually", language);
    }
  } catch (error) {
    console.log("error", error);
  }
}

export async function getPlatformLanguage() {
  try {
    let platformLanguage = await AsyncStorage.getItem("platformLanguage");

    platformLanguage = platformLanguage ? platformLanguage : "fr";

    return platformLanguage;
  } catch (error) {
    console.log("error", error);

    return "fr"; // Par défaut retourner le français
  }
}

export async function getPlatformLanguageManuallyChange() {
  try {
    let platformLanguage = await AsyncStorage.getItem(
      "platformLanguageManually"
    );

    return platformLanguage;
  } catch (error) {
    console.log("error", error);

    return null;
  }
}

export async function saveSelectedCountryProduct(paysLivraison) {
  try {
    await AsyncStorage.setItem(
      "paysLivraisonProduct",
      JSON.stringify(paysLivraison)
    );
  } catch (error) {
    console.log("error", error);
  }
}

export const getSelectedCountryProduct = async () => {
  try {
    let paysLivraison = await AsyncStorage.getItem("paysLivraisonProduct");
    paysLivraison = JSON.parse(paysLivraison);

    return paysLivraison;
  } catch (error) {
    console.log("error", error);
    return null;
  }
};

export async function saveSelectedServiceProduct(service) {
  try {
    await AsyncStorage.setItem("service_product", JSON.stringify(service));
  } catch (error) {
    console.log("error", error);
  }
}

/**
 * Retourne le pays selectionné dans AsyncStorage
 */
export const getSelectedServiceProduct = async () => {
  try {
    let service = await AsyncStorage.getItem("service_product");
    service = JSON.parse(service);

    return service;
  } catch (error) {
    console.log("error", error);
    return null;
  }
};

/**
 * Retourne le pays selectionné dans AsyncStorage
 *
 */
export const getAuth = async () => {
  try {
    let authStatusChecker = await AsyncStorage.getItem("authStatusChecker");

    return authStatusChecker;
  } catch (error) {
    console.log("error", error);
    return null;
  }
};

export const getAuthUserEmail = async () => {
  try {
    let authUserEmail = await AsyncStorage.getItem("authUserEmail");

    return authUserEmail;
  } catch (error) {
    console.log("error", error);
    return null;
  }
};

export async function saveMagasins(magasins) {
  try {
    await AsyncStorage.setItem("magasins", JSON.stringify(magasins));
  } catch (error) {
    console.log("error", error);
  }
}

export const getMagasins = async () => {
  try {
    let magasins = await AsyncStorage.getItem("magasins");
    magasins = JSON.parse(magasins);

    return magasins ? magasins : [];
  } catch (error) {
    console.log("error", error);
    return [];
  }
};

export async function savePaysLivraison(paysLivraison) {
  try {
    await AsyncStorage.setItem("paysLivraison", JSON.stringify(paysLivraison));
  } catch (error) {
    console.log("error", error);
  }
}

export const getAuthentificationData = async () => {
  try {
    let authUserEmail = await AsyncStorage.getItem("authUserEmail");

    return authUserEmail;
  } catch (error) {
    console.log("error", error);
    return null;
  }
};

export async function saveAuthentificationData(email, uid = null) {
  try {
    await AsyncStorage.setItem("authStatusChecker", "login");
    if (email) {
      await AsyncStorage.setItem("authUserEmail", email);
    } else if (uid) {
      await AsyncStorage.setItem("authUserUid", uid);
    }
  } catch (error) {
    console.log("error", error);
  }
}

export async function removeAuthentificationData() {
  try {
    await AsyncStorage.removeItem("authStatusChecker");
    await AsyncStorage.removeItem("authUserEmail");
  } catch (error) {
    console.log("error", error);
  }
}

export const getPaysLivraison = async () => {
  try {
    let paysLivraison = await AsyncStorage.getItem("paysLivraison");

    return paysLivraison;
  } catch (error) {
    console.log("error", error);
    return null;
  }
};

export async function saveParametrages(parametrages) {
  try {
    await AsyncStorage.setItem("parametrages", JSON.stringify(parametrages));
  } catch (error) {
    console.log("error", error);
  }
}

export const getParametrages = async () => {
  try {
    let parametrages = await AsyncStorage.getItem("parametrages");
    parametrages = JSON.parse(parametrages);

    return parametrages;
  } catch (error) {
    console.log("error", error);
    return null;
  }
};

export async function saveConditionsMentions(conditionsMentionsLegales) {
  try {
    await AsyncStorage.setItem(
      "conditionsMentionsLegales",
      JSON.stringify(conditionsMentionsLegales)
    );
  } catch (error) {
    console.log("error", error);
  }
}

export const getConditionsMentionsLegales = async () => {
  try {
    let conditionsMentionsLegales = await AsyncStorage.getItem(
      "conditionsMentionsLegales"
    );
    conditionsMentionsLegales = JSON.parse(conditionsMentionsLegales);

    return conditionsMentionsLegales;
  } catch (error) {
    console.log("error", error);
    return null;
  }
};

export async function saveSelectedCountry(paysLivraison) {
  try {
    await AsyncStorage.setItem("paysLivraison", JSON.stringify(paysLivraison));
  } catch (error) {
    console.log("error", error);
  }
}

export const getSelectedCountry = async () => {
  try {
    let paysLivraison = await AsyncStorage.getItem("paysLivraison");
    paysLivraison = JSON.parse(paysLivraison);
    return paysLivraison;
  } catch (error) {
    console.log("error", error);
    return null;
  }
};

/**
 * Sauvegarde le service selectionné dans AsyncStorage
 *
 * @param {object} service
 */
export async function saveSelectedService(service) {
  try {
    await AsyncStorage.setItem("service", JSON.stringify(service));
  } catch (error) {
    console.log("error", error);
  }
}

/**
 * Retourne le pays selectionné dans AsyncStorage
 */
export const getSelectedService = async () => {
  try {
    let service = await AsyncStorage.getItem("service");
    service = JSON.parse(service);

    return service;
  } catch (error) {
    console.log("error", error);
    return null;
  }
};

export async function saveServices(services) {
  if (!Array.isArray(services)) {
    throw new Error("Services doit être un tableau");
  }

  try {
    await AsyncStorage.setItem("services", JSON.stringify(services));
  } catch (error) {
    console.log("error", error);
  }
}

export const getServices = async () => {
  try {
    let services = await AsyncStorage.getItem("services");
    services = JSON.parse(services);

    return services ? services : [];
  } catch (error) {
    console.log("error", error);
    return [];
  }
};

export async function saveValidatedPanier(
  RemiseCode,
  RemiseValue,
  RemiseProduct
) {
  try {
    if (RemiseCode) {
      await AsyncStorage.setItem("cart_remiseCode", JSON.stringify(RemiseCode));
    }

    if (RemiseValue) {
      await AsyncStorage.setItem("cart_remise", JSON.stringify(RemiseValue));
    }

    if (RemiseProduct) {
      await AsyncStorage.setItem(
        "cart_remiseProduct",
        JSON.stringify(RemiseProduct)
      );
    }

    // if (RemiseCode || RemiseValue || RemiseProduct) {
    await AsyncStorage.setItem("cart_validation", "true");
    // }
  } catch (error) {
    console.log("error", error);
  }
}

export const getRemiseUsed = async () => {
  try {
    let cartRemise = await AsyncStorage.getItem("cart_remise");
    cartRemise = JSON.parse(cartRemise);

    let cartRemiseCode = await AsyncStorage.getItem("cart_remiseCode");
    cartRemiseCode = JSON.parse(cartRemiseCode);

    let cartRemiseProduct = await AsyncStorage.getItem("cart_remiseProduct");
    cartRemiseProduct = JSON.parse(cartRemiseProduct);

    return {
      remiseValue: cartRemise ? cartRemise : 0,
      remiseCode: cartRemiseCode,
      remiseProduct: cartRemiseProduct,
    };
  } catch (error) {
    console.log("error", error);
    return {
      remiseValue: null,
      remiseCode: null,
      remiseProduct: null,
    };
  }
};

export const getNewAddedAddress = async () => {
  try {
    let newAddedAdresse = await AsyncStorage.getItem("newAddedAdresse");
    newAddedAdresse = JSON.parse(newAddedAdresse);
    return newAddedAdresse;
  } catch (error) {
    console.log("error", error);
    return null;
  }
};

export async function savePanier(data) {
  try {
    await AsyncStorage.setItem("cart_products", JSON.stringify(data));
  } catch (error) {
    console.log("error", error);
  }
}
export async function saveCommand(data) {
  try {
    await AsyncStorage.setItem("cart_command", JSON.stringify(data));
  } catch (error) {
    console.log("error", error);
  }
}

export async function saveCommandDemandeAchat(data) {
  try {
    await AsyncStorage.setItem(
      "cart_command_demande_achat",
      JSON.stringify(data)
    );
  } catch (error) {
    console.log("error", error);
  }
}

export const getCommandDemandeAchat = async () => {
  try {
    let panier = await AsyncStorage.getItem("cart_command_demande_achat");

    panier = JSON.parse(panier);

    panier = panier ? panier : null;

    return panier;
  } catch (error) {
    console.log("error", error);
    return null;
  }
};

export async function saveCommandProductsDemandeAchat(data) {
  try {
    await AsyncStorage.setItem(
      "cart_command_products_demande_achat",
      JSON.stringify(data)
    );
  } catch (error) {
    console.log("error", error);
  }
}

export const getCommandProductsDemandeAchat = async () => {
  try {
    let panier = await AsyncStorage.getItem(
      "cart_command_products_demande_achat"
    );

    panier = JSON.parse(panier);

    panier = panier ? panier : [];

    return panier;
  } catch (error) {
    console.log("error", error);
    return [];
  }
};

/**
 * Retourne le pays selectionné dans AsyncStorage
 *
 */
export const getPanier = async () => {
  try {
    let panier = await AsyncStorage.getItem("cart_products");

    panier = JSON.parse(panier);

    panier = panier ? panier : [];

    return panier;
  } catch (error) {
    console.log("error", error);
    return [];
  }
};
export const getCommand = async () => {
  try {
    let panier = await AsyncStorage.getItem("cart_command");

    panier = JSON.parse(panier);

    panier = panier ? panier : [];

    return panier;
  } catch (error) {
    console.log("error", error);
    return [];
  }
};

export const removePanier = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();

    let keysToRemove = [];
    keys.map((key) => {
      if (_?.startsWith(key, "cart")) {
        keysToRemove.push(key);
      }
    });

    if (keysToRemove.length > 0) {
      await AsyncStorage.multiRemove(keysToRemove);
    }
  } catch (error) {
    console.log("error", error);
  }
};
export const removeCommand = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();

    let keysToRemove = [];
    keys.map((key) => {
      if (_?.startsWith(key, "cart_command")) {
        keysToRemove.push(key);
      }
    });

    if (keysToRemove.length > 0) {
      await AsyncStorage.multiRemove(keysToRemove);
    }
  } catch (error) {
    console.log("error", error);
  }
};

export async function saveCreneaux(creneaux) {
  try {
    console.log(creneaux.length, "gestionSToage saveCreneaux");
    await AsyncStorage.setItem("creneaux", JSON.stringify(creneaux));
    console.log("good");
  } catch (error) {
    console.log("errodr", error);
  }
}

export const getCreneaux = async () => {
  try {
    let creneaux = await AsyncStorage.getItem("creneaux");
    creneaux = JSON.parse(creneaux);

    return creneaux;
  } catch (error) {
    console.log("error", error);
    return null;
  }
};

export async function saveDepotModeChoice(data) {
  try {
    await AsyncStorage.setItem("cart_depotModeChoice", data);
  } catch (error) {
    console.log("error", error);
  }
}

export const getDepotModeChoice = async () => {
  try {
    let depotModeChoice = await AsyncStorage.getItem("cart_depotModeChoice");

    return depotModeChoice;
  } catch (error) {
    console.log("error", error);
    return null;
  }
};

export async function saveDepotCreneau(data) {
  try {
    await AsyncStorage.setItem("cart_depotCreneau", JSON.stringify(data));

    if (data.fournisseurId) {
      await AsyncStorage.setItem(
        "cart_depotMagasinFournisseurId",
        JSON.stringify(data.fournisseurId)
      );
    }
  } catch (error) {
    console.log("error", error);
  }
}

export async function saveDepotMagasinId(magasinId) {
  try {
    await AsyncStorage.setItem("cart_depotMagasin", JSON.stringify(magasinId));
  } catch (error) {
    console.log("error", error);
  }
}

export async function saveDepotAdresseId(data) {
  try {
    await AsyncStorage.setItem("cart_depotAdresseId", JSON.stringify(data));
  } catch (error) {
    console.log("error", error);
  }
}

export async function saveDepotMagasinValues(
  UserMagasinChoix,
  UserMagasinId,
  fournisseurId
) {
  try {
    await AsyncStorage.setItem("cart_depotMode", "magasin");
    await AsyncStorage.setItem(
      "cart_depotMagasinAdresse",
      JSON.stringify(UserMagasinChoix)
    );
    await AsyncStorage.setItem(
      "cart_depotMagasinAdresseId",
      JSON.stringify(UserMagasinId)
    );

    if (fournisseurId) {
      await AsyncStorage.setItem(
        "cart_depotMagasinFournisseurId",
        JSON.stringify(fournisseurId)
      );
    }
  } catch (error) {
    console.log("error", error);
  }
}

export async function saveDepotMagasinSchedule(data) {
  try {
    console.log({ data }, "weewewew");
    await AsyncStorage.setItem(
      "cart_depotMagasinSchedule",
      JSON.stringify(data)
    );
  } catch (error) {
    console.log("error", error);
  }
}

export async function saveDepotValidation() {
  try {
    await AsyncStorage.setItem("cart_depotValidation", "true");
  } catch (error) {
    console.log("error", error);
  }
}

export async function saveDepotAdresseValues(
  NomContact,
  TelContact,
  UserDomicileChoixLabel,
  UserDomicileId,
  codePostal,
  ville
) {
  try {
    await AsyncStorage.setItem("cart_depotMode", "enlevement");
    console.log("44444");

    await AsyncStorage.setItem("cart_depotNom", JSON.stringify(NomContact));
    console.log("33333");

    await AsyncStorage.setItem(
      "cart_depotTelephone",
      JSON.stringify(TelContact)
    );
    console.log("222222");
    await AsyncStorage.setItem(
      "cart_depotEnlevementAdresse",
      JSON.stringify(UserDomicileChoixLabel)
    );
    console.log("1111111");
    await AsyncStorage.setItem(
      "cart_depotEnlevementAdresseId",
      JSON.stringify(UserDomicileId)
    );

    console.log("2333223323223");
    if (codePostal) {
      await AsyncStorage.setItem(
        "cart_depotCodePostal",
        JSON.stringify(codePostal)
      );
    }

    if (ville) {
      await AsyncStorage.setItem("cart_depotVille", JSON.stringify(ville));
    }
  } catch (error) {
    console.log("error", error);
  }
}

const STORAGE_KEYS = {
  // Clés pour le dépôt magasin
  MAGASIN: {
    MODE: "cart_depotMode",
    ADRESSE: "cart_depotMagasinAdresse",
    ADRESSE_ID: "cart_depotMagasinAdresseId",
    FOURNISSEUR_ID: "cart_depotMagasinFournisseurId",
    SCHEDULE: "cart_depotMagasinSchedule",
    DEPOT: "cart_depotCreneau",
  },
  // Clés pour le dépôt à domicile
  DOMICILE: {
    NOM: "cart_depotNom",
    TELEPHONE: "cart_depotTelephone",
    ADRESSE: "cart_depotEnlevementAdresse",
    ADRESSE_ID: "cart_depotEnlevementAdresseId",
    CODE_POSTAL: "cart_depotCodePostal",
    VILLE: "cart_depotVille",
  },
  // Clés communes
  COMMON: {
    VALIDATION: "cart_depotValidation",
    CRENEAUX: "creneaux",
  },
};

/**
 * Réinitialise toutes les données de dépôt (magasin et domicile)
 */
export async function resetAllDepotStorage() {
  try {
    // Rassemble toutes les clés à supprimer
    const allKeys = [
      ...Object.values(STORAGE_KEYS.MAGASIN),
      ...Object.values(STORAGE_KEYS.DOMICILE),
      ...Object.values(STORAGE_KEYS.COMMON),
    ];

    // Supprime toutes les clés en parallèle
    await Promise.all(
      allKeys.map(async (key) => {
        try {
          await AsyncStorage.removeItem(key);
        } catch (error) {
          console.warn(`Erreur lors de la suppression de ${key}:`, error);
        }
      })
    );

    console.log(
      "Toutes les données de dépôt ont été réinitialisées avec succès"
    );
    return true;
  } catch (error) {
    console.error("Erreur lors de la réinitialisation des données:", error);
    return false;
  }
}

export async function resetDepotMagasinStorage() {
  // Liste de toutes les clés à supprimer
  const keysToRemove = [
    "cart_depotMode",
    "cart_depotMagasinAdresse",
    "cart_depotMagasinAdresseId",
    "cart_depotMagasinFournisseurId",
    "cart_depotMagasinSchedule",
    "cart_depotValidation",
  ];

  try {
    // Suppression de toutes les clés en parallèle
    await Promise.all(keysToRemove.map((key) => AsyncStorage.removeItem(key)));

    console.log("Toutes les données de dépôt ont été supprimées avec succès");
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression des données de dépôt:", error);
    return false;
  }
}

export const getDepotValues = async () => {
  try {
    let depotMode = await AsyncStorage.getItem("cart_depotMode");

    let depotMagasin = await AsyncStorage.getItem("cart_depotMagasin");
    depotMagasin = JSON.parse(depotMagasin);

    let depotMagasinAdresse = await AsyncStorage.getItem(
      "cart_depotMagasinAdresse"
    );
    depotMagasinAdresse = JSON.parse(depotMagasinAdresse);

    let depotMagasinAdresseId = await AsyncStorage.getItem(
      "cart_depotMagasinAdresseId"
    );
    depotMagasinAdresseId = JSON.parse(depotMagasinAdresseId);

    let depotAdresseId = await AsyncStorage.getItem("cart_depotAdresseId");
    depotAdresseId = JSON.parse(depotAdresseId);

    let depotNom = await AsyncStorage.getItem("cart_depotNom");
    depotNom = JSON.parse(depotNom);

    let depotTelephone = await AsyncStorage.getItem("cart_depotTelephone");
    depotTelephone = JSON.parse(depotTelephone);

    let depotEnlevementAdresse = await AsyncStorage.getItem(
      "cart_depotEnlevementAdresse"
    );
    depotEnlevementAdresse = JSON.parse(depotEnlevementAdresse);

    let depotEnlevementAdresseId = await AsyncStorage.getItem(
      "cart_depotEnlevementAdresseId"
    );
    depotEnlevementAdresseId = JSON.parse(depotEnlevementAdresseId);

    let depotCodePostal = await AsyncStorage.getItem("cart_depotCodePostal");
    depotCodePostal = JSON.parse(depotCodePostal);

    let depotVille = await AsyncStorage.getItem("cart_depotVille");
    depotVille = JSON.parse(depotVille);

    let depotCreneau = await AsyncStorage.getItem("cart_depotCreneau");
    depotCreneau = JSON.parse(depotCreneau);

    let depotMagasinSchedule = await AsyncStorage.getItem(
      "cart_depotMagasinSchedule"
    );
    depotMagasinSchedule = JSON.parse(depotMagasinSchedule);

    let depotMagasinFournisseurId = await AsyncStorage.getItem(
      "cart_depotMagasinFournisseurId"
    );
    depotMagasinFournisseurId = JSON.parse(depotMagasinFournisseurId);

    return {
      depotMode: depotMode,
      depotAdresseId: depotAdresseId,
      depotMagasin: depotMagasin,
      depotNom: depotNom,
      depotTelephone: depotTelephone,
      depotEnlevementAdresse: depotEnlevementAdresse,
      depotCodePostal: depotCodePostal,
      depotVille: depotVille,
      depotMagasinAdresse: depotMagasinAdresse,
      depotMagasinAdresseId: depotMagasinAdresseId,
      depotCreneau: depotCreneau,
      depotEnlevementAdresseId: depotEnlevementAdresseId,
      depotMagasinSchedule: depotMagasinSchedule,
      depotMagasinFournisseurId: depotMagasinFournisseurId,
    };
  } catch (error) {
    console.log("error", error);
    return {
      depotMode: null,
      depotAdresseId: null,
      depotMagasin: null,
      depotNom: null,
      depotTelephone: null,
      depotEnlevementAdresse: null,
      depotDepartement: null,
      depotVille: null,
      depotMagasinAdresse: null,
      depotMagasinAdresseId: null,
      depotEnlevementAdresseId: null,
      depotMagasinFournisseurId: null,
    };
  }
};

export async function saveLivraisonAdresseId(adresseId) {
  try {
    await AsyncStorage.setItem(
      "cart_livraisonAdresseId",
      JSON.stringify(adresseId)
    );
  } catch (error) {
    console.log("error", error);
  }
}

export async function saveLivraisonMode(livraisonMode) {
  try {
    await AsyncStorage.setItem("cart_livraisonMode", livraisonMode);
  } catch (error) {
    console.log("error", error);
  }
}

export async function saveLivraisonRelaisId(UserMagasinId) {
  try {
    await AsyncStorage.setItem(
      "cart_livraisonRelaisId",
      JSON.stringify(UserMagasinId)
    );
  } catch (error) {
    console.log("error", error);
  }
}

export async function saveLivraisonPrices(
  prixTotalLivraison,
  totalPrixAvecDouaneRemiseAvoir,
  sommeFraisDouane
) {
  try {
    await AsyncStorage.setItem(
      "cart_livraisonPrice",
      JSON.stringify(prixTotalLivraison)
    );
    await AsyncStorage.setItem(
      "cart_livraisonTotalPrixAvecDouaneRemiseAvoir",
      JSON.stringify(totalPrixAvecDouaneRemiseAvoir)
    );
    await AsyncStorage.setItem(
      "cart_sommeFraisDouane",
      JSON.stringify(sommeFraisDouane)
    );
  } catch (error) {
    console.log("error", error);
  }
}

export async function saveFraisPrices(fraisExpedition, fraisCommission) {
  try {
    if (fraisExpedition) {
      await AsyncStorage.setItem(
        "cart_ExpeditionPrice",
        JSON.stringify(prixTotalLivraison)
      );
    }

    if (fraisCommission) {
      await AsyncStorage.setItem(
        "cart_CommissionPrice",
        JSON.stringify(fraisCommission)
      );
    }
  } catch (error) {
    console.log("error", error);
  }
}

export async function saveLivraisonMagasinData(
  UserMagasinLabel,
  UserMagasinId,
  NomContact,
  TelContact
) {
  try {
    if (UserMagasinLabel) {
      await AsyncStorage.setItem("cart_livraisonAdresse", UserMagasinLabel);
    }

    await AsyncStorage.setItem(
      "cart_livraisonRelaisId",
      JSON.stringify(UserMagasinId)
    );
    await AsyncStorage.setItem("cart_livraisonMode", "relais");
    await AsyncStorage.setItem("cart_livraisonNom", NomContact);
    await AsyncStorage.setItem(
      "cart_livraisonTelephone",
      JSON.stringify(TelContact)
    );

    await AsyncStorage.setItem("cart_deliveryValidation", "true");
  } catch (error) {
    console.log("error", error);
  }
}

export async function saveLivraisonmagasinSchedule(data) {
  try {
    await AsyncStorage.setItem(
      "cart_livraisonMagasinSchedule",
      JSON.stringify(data)
    );
  } catch (error) {
    console.log("error", error);
  }
}

export async function saveLivraisonDomicileData(
  UserDomicileLabel,
  UserDomicileId,
  NomContact,
  TelContact
) {
  try {
    await AsyncStorage.setItem("cart_livraisonMode", "domicile");
    await AsyncStorage.setItem("cart_livraisonNom", NomContact);
    await AsyncStorage.setItem(
      "cart_livraisonTelephone",
      JSON.stringify(TelContact)
    );
    if (UserDomicileLabel) {
      await AsyncStorage.setItem("cart_livraisonAdresse", UserDomicileLabel);
    }

    await AsyncStorage.setItem(
      "cart_livraisonAdresseId",
      JSON.stringify(UserDomicileId)
    );

    await AsyncStorage.setItem("cart_deliveryValidation", "true");
  } catch (error) {
    console.log("error", error);
  }
}

export const getLivraisonValues = async () => {
  try {
    let livraisonMode = await AsyncStorage.getItem("cart_livraisonMode");

    let livraisonNom = await AsyncStorage.getItem("cart_livraisonNom");

    let livraisonTelephone = await AsyncStorage.getItem(
      "cart_livraisonTelephone"
    );
    livraisonTelephone = JSON.parse(livraisonTelephone);

    let livraisonAdresse = await AsyncStorage.getItem("cart_livraisonAdresse");

    let prixTotalLivraison = await AsyncStorage.getItem("cart_livraisonPrice");
    prixTotalLivraison = JSON.parse(prixTotalLivraison);

    let livraisonRelaisId = await AsyncStorage.getItem(
      "cart_livraisonRelaisId"
    );
    livraisonRelaisId = JSON.parse(livraisonRelaisId);

    let adresseId = await AsyncStorage.getItem("cart_livraisonAdresseId");
    adresseId = JSON.parse(adresseId);

    let livraisonTotalPrixAvecDouaneRemiseAvoir = await AsyncStorage.getItem(
      "cart_livraisonTotalPrixAvecDouaneRemiseAvoir"
    );
    livraisonTotalPrixAvecDouaneRemiseAvoir = JSON.parse(
      livraisonTotalPrixAvecDouaneRemiseAvoir
    );

    let sommeFraisDouane = await AsyncStorage.getItem("cart_sommeFraisDouane");
    sommeFraisDouane = JSON.parse(sommeFraisDouane);

    let fraisExpedition = await AsyncStorage.getItem("cart_ExpeditionPrice");
    fraisExpedition = JSON.parse(fraisExpedition);

    let fraisCommission = await AsyncStorage.getItem("cart_CommissionPrice");
    fraisCommission = JSON.parse(fraisCommission);

    let livraisonMagasinSchedule = await AsyncStorage.getItem(
      "cart_livraisonMagasinSchedule"
    );

    livraisonMagasinSchedule = JSON.parse(livraisonMagasinSchedule);
    return {
      livraisonMode: livraisonMode,
      livraisonNom: livraisonNom,
      livraisonTelephone: livraisonTelephone,
      livraisonAdresse: livraisonAdresse,
      prixTotalLivraison: prixTotalLivraison,
      livraisonRelaisId: livraisonRelaisId,
      livraisonAdresseId: adresseId,
      livraisonTotalPrixAvecDouaneRemiseAvoir:
        livraisonTotalPrixAvecDouaneRemiseAvoir,
      sommeFraisDouane: sommeFraisDouane,
      fraisExpedition: fraisExpedition,
      fraisCommission: fraisCommission,
      livraisonMagasinSchedule: livraisonMagasinSchedule,
    };
  } catch (error) {
    return {
      livraisonMode: null,
      livraisonNom: null,
      livraisonTelephone: null,
      livraisonAdresse: null,
      prixTotalLivraison: null,
      livraisonRelaisId: null,
      livraisonAdresseId: null,
      livraisonTotalPrixAvecDouaneRemiseAvoir: null,
      sommeFraisDouane: null,
      fraisExpedition: null,
      fraisCommission: null,
    };
  }
};

export async function savePrixFinalPanier(
  totalPrice,
  CartTotalPriceSansRemiseAvoir,
  remiseTotal,
  tva
) {
  try {
    await AsyncStorage.setItem("cart_finalPrice", JSON.stringify(totalPrice));
    await AsyncStorage.setItem(
      "cart_finalPriceWithoutAvoirRemise",
      JSON.stringify(CartTotalPriceSansRemiseAvoir)
    );
    await AsyncStorage.setItem("cart_tvaTotal", JSON.stringify(tva));

    if (remiseTotal) {
      await AsyncStorage.setItem(
        "cart_remiseTotal",
        JSON.stringify(remiseTotal)
      );
    }
  } catch (error) {
    console.log("error", error);
  }
}

export async function saveCartAvoir(AvoirValue) {
  try {
    AsyncStorage.setItem("cart_avoirValue", JSON.stringify(AvoirValue));
  } catch (error) {
    console.log("error", error);
  }
}

export const getCartPrices = async () => {
  try {
    let finalPrice = await AsyncStorage.getItem("cart_finalPrice");
    finalPrice = JSON.parse(finalPrice);

    let finalPriceWithoutAvoirRemise = await AsyncStorage.getItem(
      "cart_finalPriceWithoutAvoirRemise"
    );
    finalPriceWithoutAvoirRemise = JSON.parse(finalPriceWithoutAvoirRemise);

    let avoirValue = await AsyncStorage.getItem("cart_avoirValue");
    avoirValue = JSON.parse(avoirValue);

    let remiseTotal = await AsyncStorage.getItem("cart_remiseTotal");
    remiseTotal = JSON.parse(remiseTotal);

    let tvaTotal = await AsyncStorage.getItem("cart_tvaTotal");
    tvaTotal = JSON.parse(tvaTotal);

    return {
      finalPrice: finalPrice,
      finalPriceWithoutAvoirRemise: finalPriceWithoutAvoirRemise,
      avoirValue: avoirValue,
      remiseTotal: remiseTotal,
      tvaTotal: tvaTotal,
    };
  } catch (error) {
    console.log("error", error);
    return {
      finalPrice: null,
      finalPriceWithoutAvoirRemise: null,
      avoirValue: null,
      remiseTotal: null,
      tvaTotal: null,
    };
  }
};

export async function saveAdresseIdFacturation(
  addressId,
  NomFacturation,
  type
) {
  try {
    await AsyncStorage.setItem(
      "cart_adresseFacturationId",
      JSON.stringify(addressId)
    );
    await AsyncStorage.setItem("cart_adresseFacturationType", type);
    await AsyncStorage.setItem("cart_facturationNom", NomFacturation);
  } catch (error) {
    console.log("error", error);
  }
}

export const getAdresseIdFacturation = async () => {
  try {
    let adresseIdFacturation = await AsyncStorage.getItem(
      "cart_adresseFacturationId"
    );
    adresseIdFacturation = JSON.parse(adresseIdFacturation);

    let adresseFacturationType = await AsyncStorage.getItem(
      "cart_adresseFacturationType"
    );

    let facturationNom = await AsyncStorage.getItem("cart_facturationNom");

    return {
      adresseIdFacturation: adresseIdFacturation,
      adresseFacturationType: adresseFacturationType,
      facturationNom: facturationNom,
    };
  } catch (error) {
    return {
      adresseIdFacturation: null,
      adresseFacturationType: null,
      facturationNom: null,
    };
  }
};

export async function saveResumeCommande(commande) {
  try {
    await AsyncStorage.setItem("commande_resume", JSON.stringify(commande));
  } catch (error) {
    console.log("error", error);
  }
}

export const getResumeCommande = async () => {
  try {
    let commande = await AsyncStorage.getItem("commande_resume");
    commande = JSON.parse(commande);

    return commande;
  } catch (error) {
    return null;
  }
};
