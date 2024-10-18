import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getPanier,
  getDepotValues,
  getLivraisonValues,
  getRemiseUsed,
  getAdresseIdFacturation,
  getCartPrices,
  getCommand,
  getCommandProductsDemandeAchat,
} from './GestionStorage';
import {products} from '../constant/data';

export const buildCommande = async type => {
  try {
    // Depot
    let depotValues = await getDepotValues();

    let depotMode = depotValues.depotMode;
    let depotNom = depotValues.depotNom;
    let depotTelephone = depotValues.depotTelephone;
    let depotCreneau = depotValues.depotCreneau;

    let depotAdresse = depotValues.depotEnlevementAdresse;
    if ('magasin' == depotMode) {
      depotAdresse = depotValues.depotMagasinAdresse;
    }

    let depot = {};
    depot.mode = depotMode;
    depot.adresse = depotAdresse;
    depot.magasinId = depotValues.depotMagasin;

    if ('enlevement' == depotMode) {
      depot.nom = depotNom;
      depot.telephone = depotTelephone;
      if (depotCreneau) {
        depot.creneau = {
          id: depotCreneau.id,
          codePostal: depotCreneau.codePostal,
          ville: depotCreneau.ville,
        };
      }
    }

    // Livraison
    let livraisonValues = await getLivraisonValues();

    let livraison = {};
    livraison.mode = livraisonValues.livraisonMode;
    livraison.adresse = livraisonValues.livraisonAdresse;
    livraison.nom = livraisonValues.livraisonNom;
    livraison.telephone = livraisonValues.livraisonTelephone;
    livraison.livraisonRelaisId = livraisonValues.livraisonRelaisId;
    livraison.livraisonAdresseId = livraisonValues.livraisonAdresseId;

    // Adresse facturation
    let adresseFacturationValue = await getAdresseIdFacturation();

    // Commande
    let prixTotalLivraison = livraisonValues.prixTotalLivraison;

    // Remise
    let remiseData = await getRemiseUsed();

    let remise = {};
    remise.value = remiseData.remiseValue;
    remise.code = remiseData.remiseCode;

    // commande
    let sommeFraisDouane = livraisonValues.sommeFraisDouane;

    // Total  price without discount
    let cartPrices = await getCartPrices();

    let cartFinalPriceWithoutAvoirRemise =
      cartPrices.finalPriceWithoutAvoirRemise;
    let tva = cartPrices.tvaTotal;

    let commande = {};

    commande.totalPrice = cartFinalPriceWithoutAvoirRemise;
    commande.prixLivraison = prixTotalLivraison;
    commande.fraisDouane = sommeFraisDouane ? sommeFraisDouane : 0;
    commande.tva = tva;

    // Product
    let basketData = await getPanier();
    if (type && 'demandes-d-achat' == type) {
      basketData = await getCommandProductsDemandeAchat();
    }

    let obj = {};
    let commandeProducts = [];
    let productImages = [];
    basketData.forEach(function (item) {
      obj = {
        quantite: item.quantite,
        productId: item.ProductId,
        prixAchat: 'demandes-d-achat' == item.service ? item.Price : null,
        informationsComplementaire: item.informationsComplementaires,
        prix: item.Price,
        attributs: item.attributes,
        url: item.url,
        etat: item.stateValue,
        valeur: item.productValue,
        productImage: item.ProductImage,
        image: item.image,
        stockId: item.stockId,
      };

      commandeProducts.push(obj);

      productImages.push({
        productId: item.ProductId,
        image: item.image,
      });
    });

    return {
      depot: depot,
      livraison: livraison,
      remise: remise,
      commande: commande,
      products: commandeProducts,
      productImages: productImages,
      fraisDouane: sommeFraisDouane ? sommeFraisDouane : 0,
      adresseFacturation: adresseFacturationValue.adresseIdFacturation,
      adresseFacturationType: adresseFacturationValue.adresseFacturationType,
      facturationNom: adresseFacturationValue.facturationNom,
    };
  } catch (error) {
    console.log('error', error);
    return null;
  }
};

export const buildGetCommande = async type => {
  try {
    // Depot
    let depotValues = await getDepotValues();

    let depotMode = depotValues.depotMode;
    let depotNom = depotValues.depotNom;
    let depotTelephone = depotValues.depotTelephone;
    let depotCreneau = depotValues.depotCreneau;

    let depotAdresse = depotValues.depotEnlevementAdresse;
    if ('magasin' == depotMode) {
      depotAdresse = depotValues.depotMagasinAdresse;
    }

    let depot = {};
    depot.mode = depotMode;
    depot.adresse = depotAdresse;
    depot.magasinId = depotValues.depotMagasin;

    if ('enlevement' == depotMode) {
      depot.nom = depotNom;
      depot.telephone = depotTelephone;
      if (depotCreneau) {
        depot.creneau = {
          id: depotCreneau.id,
          codePostal: depotCreneau.codePostal,
          ville: depotCreneau.ville,
        };
      }
    }

    // Livraison
    let livraisonValues = await getLivraisonValues();

    let livraison = {};
    livraison.mode = livraisonValues.livraisonMode;
    livraison.adresse = livraisonValues.livraisonAdresse;
    livraison.nom = livraisonValues.livraisonNom;
    livraison.telephone = livraisonValues.livraisonTelephone;
    livraison.livraisonRelaisId = livraisonValues.livraisonRelaisId;
    livraison.livraisonAdresseId = livraisonValues.livraisonAdresseId;

    // Adresse facturation
    let adresseFacturationValue = await getAdresseIdFacturation();

    // Commande
    let prixTotalLivraison = livraisonValues.prixTotalLivraison;

    // Remise
    let remiseData = await getRemiseUsed();

    let remise = {};
    remise.value = remiseData.remiseValue;
    remise.code = remiseData.remiseCode;

    // commande
    let sommeFraisDouane = livraisonValues.sommeFraisDouane;

    // Total  price without discount
    let cartPrices = await getCartPrices();

    let cartFinalPriceWithoutAvoirRemise =
      cartPrices.finalPriceWithoutAvoirRemise;
    let tva = cartPrices.tvaTotal;

    let commande = {};

    commande.totalPrice = cartFinalPriceWithoutAvoirRemise;
    commande.prixLivraison = prixTotalLivraison;
    commande.fraisDouane = sommeFraisDouane ? sommeFraisDouane : 0;
    commande.tva = tva;

    // Product
    let basketData = await getCommand();
    if (type && 'demandes-d-achat' == type) {
      basketData = await getCommandProductsDemandeAchat();
    }

    console.log('Get Command =>', basketData[0].product);
    let DataProduct = [];

    let obj = {};
    let commandeProducts = [];
    let productImages = [];

    basketData.forEach(item => {
      console.log('Prduct form The Baskot of Command =>', item.product);
      DataProduct.push(item.product);
    });

    basketData.forEach(item => {
      // Iterate through each element in the 'product' array
      console.log('The Dated Of All => ', item);
      item.product.forEach(productItem => {
        console.log('Products =>', [
          productItem.attributs,
          productItem.quantite,
          productItem.product.id,
          productItem.product.service,
          productItem.product.productImages,
        ]);
        obj = {
          quantite: productItem.quantite,
          productId: productItem.product.id,
          prixAchat:
            'demandes-d-achat' == productItem.product.service
              ? productItem.prixAchat
              : null,
          informationsComplementaire: productItem.informationsComplementaires,
          prix: productItem.product.productSpecificites[0].prix,
          attributs:
            'ventes-privees' == productItem.product.service
              ? productItem.attributs
              : productItem.attributes,
          url: productItem.url,
          etat: productItem.etat,
          valeur: productItem.valeur,
          productImage: productItem.product.productImages,
          image: productItem.image,
          stockId: productItem.stockId,
        };

        commandeProducts.push(obj);
        productImages.push({
          productId: productItem.product.id,
          image: productItem.photo,
        });
      });
    });

    return {
      depot: depot,
      livraison: livraison,
      remise: remise,
      commande: commande,
      products: commandeProducts,
      productImages: productImages,
      adresseFacturation: adresseFacturationValue.adresseIdFacturation,
      adresseFacturationType: adresseFacturationValue.adresseFacturationType,
      facturationNom: adresseFacturationValue.facturationNom,
    };
  } catch (error) {
    console.log('error', error);
    return null;
  }
};
