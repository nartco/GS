import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {ButtonPrix} from '../../components/Button';
import {
  getPlatformLanguage,
  saveResumeCommande,
} from '../../modules/GestionStorage';
import {useTranslation} from 'react-i18next';
import styles from './styles';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import {formatEuroPrice} from '../../modules/DateFinanceUtils';
import auth from '@react-native-firebase/auth';

import axiosInstance from '../../axiosInstance';
import {HeaderActions} from '../../components/HeaderActions';
import {
  calculFraisLivraisonContent,
  calculProductPricesContent,
  calculCommandeDemandeAchatPrices,
} from '../../modules/CalculPrix';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const ColiSuivi = ({navigation, route}) => {
  const {commandeId, PayLivraisonId} = route.params;
  const [Commande, setCommande] = useState(null);
  const [Loader, setLoader] = useState(true);
  const [Language, setLanguage] = useState('fr');
  const [AvoirValue, setAvoirValue] = useState(0);
  const [prixTotalLivraison, setPrixTotalLivraison] = useState(0);
  const [sommeFraisDouane, setSommeFraisDouane] = useState(0);
  const [paysLivraion, setPaysLivraion] = useState(null);
  const [service, setService] = useState([]);
  const [CartTotalPriceSansRemiseAvoir, setCartTotalPriceSansRemiseAvoir] =
    useState(0);
  const [TVA, setTVA] = useState(0);
  const [CommandeResteApayer, setCommandeResteApayer] = useState(0);

  const [CommandeHasManualValidation, setCommandeHasManualValidation] =
    useState(false);
  const [LivraisonData, setLivraisonData] = useState();
  const {t} = useTranslation();
  useEffect(() => {
    fetchCommande();
    fetchPayes();
  }, []);

  const getAttributeImages = commandeProduct => {
    const {product, attributs} = commandeProduct;

    if (!product.attributs || product.attributs.length === 0) {
      return product.productImages ? [{url: product.productImages[0].url}] : [];
    }

    let matchingImages = [];

    Object.entries(attributs).forEach(([attributId, selectedValue]) => {
      const attr = product.attributs.find(
        a => a.attribut.id.toString() === attributId,
      );
      if (attr) {
        const matchingAttributeValue = attr.attributValues.find(
          val => val.valeur === selectedValue || val.valeurEN === selectedValue,
        );
        if (matchingAttributeValue && matchingAttributeValue.attributImages) {
          matchingImages = matchingImages.concat(
            matchingAttributeValue.attributImages.map(img => ({
              url: `https://godaregroup.com/api/fichiers/attribut/description/${img.reference}`,
            })),
          );
        }
      }
    });

    return matchingImages.length > 0
      ? matchingImages
      : product.productImages
      ? [{url: product.productImages[0].url}]
      : [];
  };

  const fetchCommande = async () => {
    let validationManuelle = false;

    setLoader(true);

    try {
      const currentLanguage = await getPlatformLanguage();
      setLanguage(currentLanguage);
      const user = auth().currentUser;
      const response = await axiosInstance.get(
        '/commandes/' + commandeId + '/' + user.uid,
      );

      if (response.data && 'en' == currentLanguage) {
        response.data.createdAt = formatDate(response.data.createdAt);
      }

      if (
        response.data &&
        response.data.statut &&
        response.data.statut.toLowerCase() == 'cotation commande manuelle'
      ) {
        validationManuelle = true;
      }

      setCommandeHasManualValidation(validationManuelle);

      console.log(response.data, 'commande');
      setCommande(response.data);

      let commandeProducts = response.data
        ? response.data.commandeProducts[0]
        : null;

      let product = commandeProducts ? commandeProducts.product : null;
      let productSpecificites = product ? product.productSpecificites : null;
      let productService = response.data ? response.data.service : null;
      if (productSpecificites) {
        pays = productSpecificites[0] ? productSpecificites[0].pays : null;

        if (pays) {
          productService = pays.service.nomEN;
        }
      }

      response.data['serviceEN'] = productService;

      if (!validationManuelle) {
        let prixLivraison = calculFraisLivraisonContent(response.data);

        setPrixTotalLivraison(prixLivraison);
      }

      setAvoirValue(Commande.avoir);
    } catch (erreur) {
      console.log('commande error', erreur);
    }

    setLoader(false);
  };

  function formatDate(dateString) {
    if (!dateString) {
      return dateString;
    }

    let arr = dateString.split('/');

    return `${arr[1]}/${arr[0]}/${arr[2]}`;
  }

  const fetchPayes = async () => {
    setLoader(true);

    try {
      const response = await axiosInstance.get('/pays/' + PayLivraisonId);
      const Dates = response.data;

      setPaysLivraion(response.data);
      setService(response.data?.service);
    } catch (erreur) {
      console.log('commande error', erreur);
    }

    setLoader(false);
  };

  if (true === Loader || !Commande) {
    return (
      <View style={{justifyContent: 'center', height: '80%'}}>
        <ActivityIndicator size={'large'} color="#3292E0" />
      </View>
    );
  }

  async function NavigateToPayment() {
    await saveResumeCommande(Commande);

    navigation.navigate('CheckoutResumeScreen');
  }

  const RenderAttribute = ({product, service}) => {
    let attributeValues = [];

    const values = Object.values(product.attributs);
    attributeValues.push(values);

    if ('Ventes Privées' == service || "Demandes d'achat" == service) {
      // const attributeValues = DataVlues;

      return (
        <View>
          <Text style={styles.WeightCalText}>
            {attributeValues.flat().join(', ')}
          </Text>
          {"Demandes d'achat" == service ? (
            <>
              <Text style={[{marginBottom: 5}, styles.WeightCalText]}>
                {product.url == null ? (
                  <></>
                ) : product.url.length > 30 ? (
                  product.url.substring(0, 30 - 3) + '...'
                ) : (
                  product.url
                )}
              </Text>
              {/* {
                product.attributes == null
                ?
                <></>
                :
                <Text style={{marginBottom: 5}}>{product.attributes.name}: { product.url }</Text>
              } */}
              {product.informationsComplementaires && (
                <Text style={[{maxWidth: 250}, styles.WeightCalText]}>
                  {t('Infos complementaires')}:{' '}
                  {product.informationsComplementaires}
                </Text>
              )}
            </>
          ) : (
            <></>
          )}
        </View>
      );
    }

    return (
      <View>
        <Text style={styles.WeightCalText}>
          {t('Etat')} : {'Used' == product.etat ? t('Occasion') : t('Neuf')}{' '}
          {product.valeur
            ? ' - ' +
              t('Valeur') +
              ' : ' +
              formatEuroPrice(product.valeur, Language)
            : ''}
        </Text>

        {product.informationsComplementaires && (
          <Text style={[{maxWidth: 250}, styles.WeightCalText]}>
            {t('Infos complementaires')}: {product.informationsComplementaires}
          </Text>
        )}
      </View>
    );
  };
  const createAttributeString = attributs => {
    if (!attributs || typeof attributs !== 'object') {
      return '';
    }
    const values = Object.values(attributs).filter(
      value => value && value.trim() !== '',
    );
    return values.join(', ');
  };

  const RenderItem = ({commandeProduct, index}) => {
    const [images, setImages] = useState([]);

    useEffect(() => {
      if (Commande.service === 'Ventes Privées') {
        const attributeImages = getAttributeImages(commandeProduct);

        setImages(attributeImages);
      }
    }, [commandeProduct]);

    let ItemCommandPrice = createAttributeString(commandeProduct.attributs);
    console.log({ItemCommandPrice}, 'ItemCommandPrice');

    let stock = [];
    stock.push(commandeProduct.product.stocks);
    let prix = 0;

    let quantiteCommande = isNaN(parseInt(commandeProduct.quantite))
      ? 0
      : parseInt(commandeProduct.quantite);

    if ('Ventes Privées' == Commande.service) {
      // console.log(commandeProduct, '2332');
      // stock.forEach(item => {
      //   item.map(obj => {
      //     // Fonction pour normaliser et diviser une chaîne en ensemble de mots
      //     const normalizeAndSplit = str => {
      //       return new Set(
      //         str
      //           .toLowerCase()
      //           .replace(/,/g, '')
      //           .split(' ')
      //           .filter(word => word.trim() !== ''),
      //       );
      //     };

      //     // Normaliser et diviser obj.combinaison et ItemCommandPrice
      //     const combinaisonSet = normalizeAndSplit(obj.combinaison);
      //     const itemCommandPriceSet = normalizeAndSplit(ItemCommandPrice);
      //     console.log(obj, 'objt');
      //     // Vérifier si les ensembles sont égaux
      //     const setsAreEqual = (a, b) =>
      //       a.size === b.size && [...a].every(value => b.has(value));

      //     if (setsAreEqual(combinaisonSet, itemCommandPriceSet)) {
      //       prix = parseFloat(obj.prix);
      //     }
      //   });
      // });
      prix = parseFloat(commandeProduct.prix);
      prix = prix * commandeProduct.quantite;
    } else if ("Demandes d'achat" == Commande.service) {
      prix = parseFloat(commandeProduct.prixAchat);
      quantiteCommande = commandeProduct.quantite;
    } else {
      let quantite = isNaN(parseInt(commandeProduct.quantite))
        ? 0
        : parseInt(commandeProduct.quantite);

      prix =
        parseFloat(commandeProduct.prix) *
        quantite;
    }

    prix = isNaN(prix) ? 0 : prix;

    return (
      <View
        key={index}
        style={{
          backgroundColor: '#fff',
          paddingLeft: 28,
          paddingVertical: 12,
          marginBottom: 16,
          borderRadius: 18,
        }}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 20}}>
          {/* First Row */}
          <View style={{position: 'relative'}}>
            {'Ventes Privées' == Commande.service ? (
              <View>
                {images.length > 0 ? (
                  <Image
                    source={{uri: images[0].url}}
                    resizeMode="contain"
                    style={{width: wp(18), height: wp(28)}}
                  />
                ) : commandeProduct.product.productImages ? (
                  <Image
                    source={{
                      uri: commandeProduct.product.productImages[0].url,
                    }}
                    resizeMode="contain"
                    style={{width: wp(18), height: wp(28)}}
                  />
                ) : (
                  <Text>Pas d'image disponible</Text>
                )}
              </View>
            ) : (
              <View>
                {commandeProduct.photo != null ? (
                  <Image
                    source={{uri: commandeProduct.photo}}
                    resizeMode="contain"
                    style={{width: wp(18), height: wp(28)}}
                  />
                ) : (
                  <View style={{width: wp(10), height: wp(28)}}></View>
                )}
              </View>
            )}
          </View>

          {/* second Row */}
          <View style={styles.secondRow}>
            <View>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: 'Poppins-Regular',
                  color: '#000',
                  maxWidth: 190,
                }}>
                {'fr' == Language
                  ? commandeProduct.nomEnProduit
                  : commandeProduct.nomEnProduit}
              </Text>

              {Commande.service == 'Fret par avion' ||
              Commande.service == 'Fret par bateau' ? (
                <View
                  style={{
                    flexDirection: 'column',
                    gap: 10,
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}>
                  <RenderAttribute
                    service={Commande.service}
                    product={commandeProduct}
                  />

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 2,
                    }}>
                    <ButtonPrix title={prix.toFixed(2)} language={Language} />

                    <Text
                      style={{
                        minWidth: 90,
                        height: 42,
                        flexDirection: 'row',
                        paddingVertical: 8,
                        paddingHorizontal: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#EFEFEF',
                        borderRadius: 25,
                        fontFamily: 'Poppins-Medium',
                        fontSize: 17,
                        color: '#343434',
                      }}>
                      {quantiteCommande}{' '}
                      {commandeProduct.product.unite
                        ? 'fr' == Language
                          ? quantiteCommande > 1
                            ? commandeProduct.product.unite.valeurPluriel
                            : commandeProduct.product.unite.valeur
                          : quantiteCommande > 1
                          ? commandeProduct.product.unite.valeurPlurielEN
                          : commandeProduct.product.unite.valeurEN
                        : ''}
                    </Text>
                  </View>
                </View>
              ) : (
                <View
                  style={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 10,
                  }}>
                  <RenderAttribute
                    service={Commande.service}
                    product={commandeProduct}
                  />

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 2,
                    }}>
                    <ButtonPrix title={prix.toFixed(2)} language={Language} />
                    <Text
                      style={{
                        minWidth: 70,
                        textAlign: 'center',
                        height: 42,
                        flexDirection: 'row',
                        paddingVertical: 8,
                        paddingHorizontal: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#EFEFEF',
                        borderRadius: 25,
                        fontFamily: 'Poppins-Medium',
                        fontSize: 17,
                        color: '#343434',
                      }}>
                      {quantiteCommande}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const toValidNumber = value => {
    const number = parseFloat(value);
    return isNaN(number) ? 0 : number;
  };

  const RenderTotal = ({data}) => {
    let prices = calculProductPricesContent(
      data,
      0,
      0,
      CommandeHasManualValidation,
    );
    console.log({prices}, '3223323232323');
    let remiseTotal = prices.remiseTotal;

    let totalPrixAvecDouaneRemiseAvoir = prices.totalPrixAvecDouaneRemiseAvoir;

    let TotalWithLivraison = totalPrixAvecDouaneRemiseAvoir + 0;
    TotalWithLivraison = isNaN(parseFloat(TotalWithLivraison))
      ? 0
      : parseFloat(TotalWithLivraison);

    let subTotal = prices.totalPrix - prices.sommeFraisDouane;
    let priceWithTva = 0;

    let resteApayer = 0;
    let resteAvoir = 0;
    let apreRemise = 0;
    let calcuteRemise = 0;

    if ("Demandes d'achat" == Commande.service) {
      let valuesDemandeAchat = calculCommandeDemandeAchatPrices(Commande);

      prices.sommeFraisDouane = valuesDemandeAchat.fraisDouane;
      prices.totalPrix = valuesDemandeAchat.prix;
      prices.totalPrixAvecDouaneRemiseAvoir = valuesDemandeAchat.prixTotal;
      prices.remiseTotal = valuesDemandeAchat.remise;
      prices.prixQuantite = valuesDemandeAchat.prix;
      prices.fraisExpedition = valuesDemandeAchat.fraisExpedition;
      prices.fraisCommission = valuesDemandeAchat.fraisCommission;
      prices.prixTotalSansRemise = valuesDemandeAchat.prixTotalSansRemise;
      prices.prixTotal = valuesDemandeAchat.prixTotal;

      TotalWithLivraison = valuesDemandeAchat.prixTotal;

      setPrixTotalLivraison(valuesDemandeAchat.fraisLivraison);

      remiseTotal = valuesDemandeAchat.remise;

      subTotal = valuesDemandeAchat.prix;
    } else {
      priceWithTva = isNaN(priceWithTva) ? 0 : priceWithTva;

      TotalWithLivraison = TotalWithLivraison + priceWithTva;

      TotalWithLivraison = TotalWithLivraison.toFixed(2);
      calcuteRemise = (TotalWithLivraison * remiseTotal) / 100;
    }

    apreRemise = subTotal - remiseTotal;
    apreRemise = apreRemise.toFixed(2);

    setSommeFraisDouane(prices.sommeFraisDouane);

    if (AvoirValue > TotalWithLivraison) {
      resteAvoir = AvoirValue - TotalWithLivraison;
      resteAvoir = resteAvoir.toFixed(2);
    } else {
      resteApayer = TotalWithLivraison - AvoirValue;
    }

    let montantApayer = 0;
    if ("Demandes d'achat" == Commande.service) {
      montantApayer = prices.prixTotal;
    } else {
      montantApayer =
        toValidNumber(apreRemise) +
        toValidNumber(prixTotalLivraison) +
        toValidNumber(sommeFraisDouane);

      montantApayer = isNaN(parseFloat(montantApayer))
        ? 0
        : parseFloat(montantApayer);
      montantApayer = montantApayer.toFixed(2);
    }

    resteApayer = montantApayer;

    if (AvoirValue) {
      // saveCartAvoir(AvoirValue);
      resteApayer = (resteApayer - AvoirValue).toFixed(2);
    }

    let resteApayerFloat = parseFloat(resteApayer);

    if (!isNaN(resteApayerFloat)) {
      setCommandeResteApayer(resteApayerFloat);
    }

    console.log(Commande.depot, '2323232323232');

    return (
      <View>
        <View style={{marginTop: 13, paddingHorizontal: 12}}>
          <View
            style={{
              backgroundColor: '#fff',
              paddingTop: 22,
              paddingHorizontal: 13,
              paddingBottom: 30,
              borderRadius: 8,
            }}>
            {
              <>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: 15,
                    borderBottomWidth: 1,
                    borderColor: '#E9E9E9',
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Poppins-Regular',
                      fontSize: 12,
                      color: '#000',
                      letterSpacing: 0.8,
                    }}>
                    {t('Sous Total')}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Poppins-Medium',
                      fontSize: 14,
                      color: '#262A2B',
                      letterSpacing: 0.8,
                    }}>
                    {('en' == Language ? '€ ' : '') +
                      subTotal.toFixed(2) +
                      ('fr' == Language ? ' €' : '')}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: 15,
                    paddingTop: 19,
                    borderBottomWidth: 1,
                    borderColor: '#E9E9E9',
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Poppins-Regular',
                      fontSize: 12,
                      color: '#ACB2B2',
                      letterSpacing: 0.8,
                    }}>
                    {t('Montant remise')}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Poppins-Medium',
                      fontSize: 14,
                      color: '#262A2B',
                      letterSpacing: 0.8,
                    }}>
                    {('en' == Language ? '€ ' : '') +
                      (remiseTotal == 0.0
                        ? Commande.remise > 0
                          ? Commande.remise
                          : '"-"'
                        : '-' + remiseTotal) +
                      ('fr' == Language ? ' €' : '')}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: 15,
                    paddingTop: 19,
                    borderBottomWidth: 1,
                    borderColor: '#E9E9E9',
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Poppins-Regular',
                      fontSize: 12,
                      color: '#000',
                      letterSpacing: 0.8,
                    }}>
                    {t('Sous-Total aprés remise')}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Poppins-Medium',
                      fontSize: 14,
                      color: '#262A2B',
                      letterSpacing: 0.8,
                    }}>
                    {('en' == Language ? '€ ' : '') +
                      apreRemise +
                      ('fr' == Language ? ' €' : '')}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 19,
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Poppins-Regular',
                      fontSize: 12,
                      color: '#ACB2B2',
                      letterSpacing: 0.8,
                    }}>
                    {t('fais douane')}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Poppins-Medium',
                      fontSize: 14,
                      color: '#262A2B',
                      letterSpacing: 0.8,
                    }}>
                    {CommandeHasManualValidation
                      ? t('à définir')
                      : ('en' == Language ? '€ ' : '') +
                        sommeFraisDouane +
                        ('fr' == Language ? ' €' : '')}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Poppins-Regular',
                      fontSize: 12,
                      color: '#ACB2B2',
                      letterSpacing: 0.8,
                    }}>
                    {t('Frais livraison')}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Poppins-Medium',
                      fontSize: 14,
                      color: '#262A2B',
                      letterSpacing: 0.8,
                    }}>
                    {CommandeHasManualValidation
                      ? t('à définir')
                      : ('en' == Language ? '€ ' : '') +
                        (isNaN(prixTotalLivraison) ? 0 : prixTotalLivraison) +
                        ('fr' == Language ? ' €' : '')}
                  </Text>
                </View>
                {"Demandes d'achat" == Commande.service && (
                  <>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                      <Text
                        style={{
                          fontFamily: 'Poppins-Regular',
                          fontSize: 12,
                          color: '#ACB2B2',
                          letterSpacing: 0.8,
                        }}>
                        {t("Frais d'expédition")}
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'Poppins-Medium',
                          fontSize: 14,
                          color: '#262A2B',
                          letterSpacing: 0.8,
                        }}>
                        {('en' == Language ? '€ ' : '') +
                          (isNaN(prices.fraisExpedition)
                            ? 0
                            : prices.fraisExpedition) +
                          ('fr' == Language ? ' €' : '')}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                      <Text
                        style={{
                          fontFamily: 'Poppins-Regular',
                          fontSize: 12,
                          color: '#ACB2B2',
                          letterSpacing: 0.8,
                        }}>
                        {t('Commission')}
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'Poppins-Medium',
                          fontSize: 14,
                          color: '#262A2B',
                          letterSpacing: 0.8,
                        }}>
                        {('en' == Language ? '€ ' : '') +
                          (isNaN(prices.fraisCommission)
                            ? 0
                            : prices.fraisCommission) +
                          ('fr' == Language ? ' € ' : '')}
                      </Text>
                    </View>
                  </>
                )}

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: 15,
                    paddingTop: 19,
                    marginTop: 15,
                    borderBottomWidth: 1,
                    borderTopWidth: 1,
                    borderColor: '#E9E9E9',
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Poppins-Regular',
                      fontSize: 12,
                      color: '#000',
                      letterSpacing: 0.8,
                    }}>
                    {t('Montant à payer')}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Poppins-Medium',
                      fontSize: 14,
                      color: '#262A2B',
                      letterSpacing: 0.8,
                    }}>
                    {('en' == Language ? '€ ' : '') +
                      montantApayer +
                      ('fr' == Language ? ' €' : '')}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: 15,
                    paddingTop: 19,
                    borderBottomWidth: 1,
                    borderColor: '#E9E9E9',
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Poppins-Regular',
                      fontSize: 12,
                      color: '#000',
                      letterSpacing: 0.8,
                    }}>
                    {t('Montant avoir')}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                    }}>
                    <Entypo name="check" color="#01962A" size={15} />
                    <Feather name="x" color="#E10303" size={15} />
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 19,
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Poppins-SemiBold',
                      fontSize: 12,
                      color: '#000',
                      letterSpacing: 0.8,
                    }}>
                    {t('Reste à payer')}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Poppins-Medium',
                      fontSize: 14,
                      color: '#262A2B',
                      letterSpacing: 0.8,
                    }}>
                    {('en' == Language ? '€ ' : '') +
                      (Commande.statut &&
                      Commande.statut.toLowerCase() == 'a payer'
                        ? resteApayer
                        : 0) +
                      ('fr' == Language ? ' € ' : '')}
                  </Text>
                </View>
              </>
            }
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{flex: 1}}>
      <HeaderActions navigation={() => navigation.goBack()} />
      <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
        <View style={{flex: 1, marginBottom: 60}}>
          <View style={{marginTop: 24, marginBottom: 12}}>
            <Text
              style={{
                fontFamily: 'Poppins-SemiBold',
                fontSize: 16,
                color: '#000',
                textAlign: 'center',
              }}>
              {t('Détail de la commande')}
            </Text>
          </View>
          <View>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <View style={styles.superCartContainer}>
                <View style={styles.firstContainerInformation}>
                  <View>
                    <View style={{flexDirection: 'column', paddingLeft: 10}}>
                      <Text style={styles.WeightCalText}>
                        {t('Service')} :{' '}
                        {Commande.service
                          ? 'fr' == Language
                            ? Commande.service
                            : Commande.serviceEN
                          : ''}
                      </Text>
                      <Text style={styles.WeightCalText}>
                        {t('Pays de départ')} :{' '}
                        {paysLivraion
                          ? t('LG') === 'FR'
                            ? paysLivraion.depart
                            : paysLivraion.departEn
                          : ''}
                      </Text>
                      <Text style={styles.WeightCalText}>
                        {t('Pays de destination')} :{' '}
                        {paysLivraion
                          ? t('LG') === 'FR'
                            ? paysLivraion.destination
                            : paysLivraion.destinationEn
                          : ''}
                      </Text>

                      <Text style={styles.WeightCalText}>
                        {t('Prix total')} :{' '}
                        {('en' == Language ? '€ ' : '') +
                          parseFloat(Commande.totalPrice).toFixed(2) +
                          ('fr' == Language ? ' €' : '')}
                      </Text>

                      <Text style={styles.WeightCalText}>
                        {t('Numéro de la commande')} :{' '}
                        {Commande.uuid ? Commande.uuid : ''}
                      </Text>

                      <Text style={styles.WeightCalText}>
                        {t('Date de la commande')} : {Commande.createdAt}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <View style={styles.superCartContainer}>
                <View style={styles.firstContainerInformation}>
                  <View>
                    <View style={{flexDirection: 'column', paddingLeft: 10}}>
                      <Text style={styles.WeightCalText}>
                        {t('Statut')} : {t(Commande.statut)}
                      </Text>

                      <Text style={styles.WeightCalText}>
                        {t('Mode paiement')} : {t(Commande.modePaiement)}
                      </Text>

                      {Commande?.avoir && Commande?.avoir > 0 && (
                        <Text style={styles.WeightCalText}>
                          {t('Avoir')} : {Commande?.avoir}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <View
              style={{
                marginTop: 15,
                paddingVertical: 12,
                marginBottom: 16,
                borderRadius: 18,
              }}>
              <View>
                <Text
                  style={[
                    styles.WeightCalText,
                    {textAlign: 'center', marginBottom: 15},
                  ]}>
                  {t('Produits')}
                </Text>
              </View>

              <View>
                {Commande.commandeProducts.map((commandeProduct, index) => (
                  <RenderItem commandeProduct={commandeProduct} index={index} />
                ))}
              </View>
            </View>

            {(Commande.service == 'Fret par avion' ||
              Commande.service == 'Fret par bateau') &&
            Commande.depot ? (
              <>
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                  <View style={styles.superCartContainer}>
                    <View style={styles.firstContainerInformation}>
                      <View>
                        <View
                          style={{flexDirection: 'column', paddingLeft: 10}}>
                          <View>
                            <Text
                              style={[
                                styles.WeightCalText,
                                {
                                  textAlign: 'center',
                                  textTransform: 'uppercase',
                                  marginBottom: 10,
                                  fontSize: 19,
                                  fontWeight: 600,
                                },
                              ]}>
                              {'enlevement' == Commande.depot?.mode
                                ? t('Enlèvement à domicile')
                                : t('Dépôt au magasin')}
                            </Text>
                          </View>

                          <View>
                            {Commande.depot.nom && (
                              <Text style={styles.WeightCalText}>
                                {Commande.depot.nom}
                              </Text>
                            )}

                            <Text style={styles.WeightCalText}>
                              {t('Adresse')} : {Commande.depot.adresse}
                            </Text>

                            {!('enlevement' == Commande.depot?.mode) && (
                              <Text style={styles.WeightCalText}>
                                {t("Horaires d'ouverture")} : {'\n'}
                                {
                                  Commande.depot?.commandeMagasin?.magasin
                                    .horaireOuverture
                                }
                              </Text>
                            )}
                            {'enlevement' == Commande.depot?.mode && (
                              <Text style={styles.WeightCalText}>
                                {t('Téléphone')} : {Commande.depot.telephone}
                              </Text>
                            )}

                            {Commande.depot?.commandeMagasin?.magasin
                              .telephone && (
                              <Text style={styles.WeightCalText}>
                                {
                                  Commande.depot?.commandeMagasin?.magasin
                                    .telephone
                                }
                              </Text>
                            )}

                            {Commande.depot.creneauEnlevementPlage && (
                              <Text style={styles.WeightCalText}>
                                {t("Date d'enlèvement")} :{' '}
                                {Commande.depot.creneauEnlevementPlage.date +
                                  t(' entre ') +
                                  Commande.depot.creneauEnlevementPlage
                                    .horaireDebut +
                                  t(' et ') +
                                  Commande.depot.creneauEnlevementPlage
                                    .horaireFin}
                              </Text>
                            )}
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </>
            ) : (
              <></>
            )}

            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <View style={styles.superCartContainer}>
                <View style={styles.firstContainerInformation}>
                  <View>
                    <View style={{flexDirection: 'column', paddingLeft: 10}}>
                      <View>
                        <Text
                          style={[
                            styles.WeightCalText,
                            {
                              textAlign: 'center',
                              textTransform: 'uppercase',
                              marginBottom: 10,
                              fontSize: 19,
                              fontWeight: 600,
                            },
                          ]}>
                          {'relais' == Commande.livraison?.mode
                            ? t('Retrait en point relais')
                            : t('Livraison à domicile')}
                        </Text>
                      </View>

                      <View>
                        <Text style={styles.WeightCalText}>
                          {t('TelRecipe')} : {Commande.livraison.telephone}
                        </Text>
                        <Text style={styles.WeightCalText}>
                          {t('Nom')} : {Commande.livraison.nom}
                        </Text>

                        <Text style={styles.WeightCalText}>
                          {t('Adresse')} : {Commande.livraison.adresse}
                        </Text>
                        {'domicile' !== Commande.livraison?.mode && (
                          <Text style={styles.WeightCalText}>
                            {t("Horaires d'ouverture")} : {'\n'}
                            {
                              Commande.livraison?.commandeMagasin?.magasin
                                .horaireOuverture
                            }
                          </Text>
                        )}
                        {'domicile' !== Commande.livraison?.mode && (
                          <Text style={styles.WeightCalText}>
                            {t('TelShop')} : {'\n'}
                            {
                              Commande.livraison?.commandeMagasin?.magasin
                                .telephone
                            }
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View
            style={{
              marginTop: 10,
              marginBottom: windowWidth * 0.1,
              width: windowWidth * 1,
              alignSelf: 'center',
            }}>
            {"Demandes d'achat" == Commande.service &&
            Commande.statut.toLowerCase() == 'cotation demandée' ? (
              <></>
            ) : (
              <RenderTotal data={Commande.commandeProducts} />
            )}
          </View>
          <View style={{marginBottom: windowWidth * 0.1}}>
            {Commande.showPaiementButton &&
              Commande.statut.toLowerCase() == 'a payer' &&
              CommandeResteApayer > 0 && (
                <TouchableOpacity
                  onPress={NavigateToPayment}
                  style={{
                    paddingVertical: 8,
                    // width: 170,
                    alignSelf: 'center',
                    paddingHorizontal: 22,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#4E8FDA',
                    borderRadius: 25,
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Poppins-Medium',
                      fontSize: 12,
                      color: '#fff',
                    }}>
                    {t('confirmer la cotation')}
                  </Text>
                </TouchableOpacity>
              )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ColiSuivi;
