import axiosInstance from '../axiosInstance';
import {
  getPanier,
  getPaysLivraison,
  getPaysDepart,
  getParametrages,
  getCommand,
} from './GestionStorage';

/**
 * Permet de voir si on doit afficher un message pour les frais de douane
 *
 * @param {object} douane
 * @param {string} etatSelectionnee
 *
 * @returns {boolean}
 *
 */
export async function afficherMessageDouane(etatSelectionnee, douane) {
  if (!douane) {
    return false;
  }

  let parametrages = await getParametrages();

  if ('New' == etatSelectionnee) {
    if (!parametrages.messageFraisDouane) {
      return false;
    }

    if (douane.forfait > 0 || douane.coefficient > 0) {
      return parametrages.messageFraisDouane;
    }
  }

  if ('Used' == etatSelectionnee) {
    if (!parametrages.messageFraisUsageDouane) {
      return false;
    }

    if (
      douane.forfaitProduitOccasion > 0 ||
      douane.coefficientProduitOccasion > 0
    ) {
      return parametrages.messageFraisUsageDouane;
    }
  }

  return false;
}

export async function afficherMessageProduitServiceDifferent(
  productService,
  PaysLivraison,
) {
  let panier = await getPanier();

  if (panier.length < 1) {
    return false;
  }

  let cartHasProductFromAnotherService = false;
  panier.map(ls => {
    if (
      ls.service != productService ||
      ls.paysLivraison.id != PaysLivraison.id
    ) {
      cartHasProductFromAnotherService = true;
    }
  });

  return cartHasProductFromAnotherService;
}

export async function hasPanierHasProduitManuel() {
  let panier = await getPanier();

  if (panier.length < 1) {
    return false;
  }

  let panierHasProduitManuel = false;
  panier.map(item => {
    if (item.product && item.product.validationManuelle) {
      panierHasProduitManuel = true;
    }
  });

  return panierHasProduitManuel === true;
}

export async function hasPanierHasProduitNonManuel() {
  let panier = await getPanier();

  if (panier.length < 1) {
    return false;
  }

  let panierHasProduitManuel = false;
  panier.map(item => {
    if (item.product && item.product.validationManuelle) {
      panierHasProduitManuel = true;
    }
  });

  return panierHasProduitManuel !== true;
}

export async function afficherMessageProduitServiceDifferentCommand(
  productService,
  PaysLivraison,
) {
  let basketData = await getCommand();

  let PayLivraisonID = [];
  let Service = [];
  let Data = [];
  const response = await axiosInstance.get(
    '/pays/' + basketData[0].paysLivraison,
  );

  Data = response.data;
  PayLivraisonID.push(Data);
  Service.push(Data.service);
  console.log(
    'Pay Livraison :',
    PayLivraisonID[0].id,
    'Service :',
    Service[0].nom,
  );
  let cartHasProductFromAnotherService = false;

  if (
    Service[0].nom != productService ||
    PayLivraisonID[0].id != PaysLivraison
  ) {
    cartHasProductFromAnotherService = true;
  }

  return cartHasProductFromAnotherService;
}
