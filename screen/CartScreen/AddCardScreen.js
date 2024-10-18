import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Alert,
  ToastAndroid,
} from 'react-native';
import React, {useEffect, useState} from 'react';

import {card_category} from '../../constant/data';

import PaymentCard from '../../components/PaymentCard';

import WavePaymen from '../../components/WavePaymen';

import {useTranslation} from 'react-i18next';
import auth from '@react-native-firebase/auth';

import {
  getAuthentificationData,
  getCartPrices,
  getCommand,
  getPanier,
  getPlatformLanguage,
  getSelectedCountry,
  getCommandProductsDemandeAchat,
  getSelectedService,
  getServices,
  removeCommand,
  removePanier,
  saveSelectedCountry,
  saveSelectedService,
} from '../../modules/GestionStorage';

import {useIsFocused} from '@react-navigation/native';

import ServiceHeader from '../../components/ServiceHeader';

import {getClientCards} from '../../modules/GestionStripe';

import {
  buildCommande,
  buildGetCommande,
} from '../../modules/GestionFinalisationPanier';

import axiosInstance from '../../axiosInstance';

import {useBag} from '../../modules/BagContext';

const windowWidth = Dimensions.get('window').width;

const windowHeight = Dimensions.get('window').height;

import {getImageType} from '../../modules/TraitementImage';
import Toast from 'react-native-toast-message';

const AddCardScreen = props => {
  const {t} = useTranslation();

  let pageFrom = props.route.params;

  let commandeId = props.route.params;

  pageFrom = pageFrom ? pageFrom.pageFrom : false;

  commandeId = commandeId ? commandeId.commandeId : false;

  const [activeCard, setActiveCard] = useState(0);

  var isFocused = useIsFocused();

  const [Service, setService] = useState(null);

  const [paysLivraisonObject, setPaysLivraisonObject] = useState(null);

  const [Language, setLanguage] = useState('fr');

  const [DepotMode, setDeoptMode] = useState({});

  const [Activity, setActivity] = useState(true);

  const [ClientEmail, setClientEmail] = useState([]);

  const [Cards, setCards] = useState([]);

  const [LoadingPayment, setLoadingPayment] = useState(false);
  const [user, setUser] = useState(null);

  const {setBagCount} = useBag();

  useEffect(() => {
    const user = auth().currentUser;
    setUser(user);
    async function fetchData() {
      setActivity(true);

      // Get pays de livraison

      let paysLivraisonObject = await getSelectedCountry();

      setPaysLivraisonObject(paysLivraisonObject);

      // Language

      const currentLanguage = await getPlatformLanguage();

      setLanguage(currentLanguage);

      // Get service

      let service = await getSelectedService();

      let BasketCommand = await getCommand();
      console.log(BasketCommand, 'BasketCommand');

      if (
        'CheckoutScreenDemandeAchat' == pageFrom ||
        'CheckoutResumeScreen' == pageFrom
      ) {
        BasketCommand = await getCommandProductsDemandeAchat();
      }

      let Data = [];
      if (BasketCommand.length > 0) {
        const response = await axiosInstance.get(
          '/pays/' + BasketCommand[0].paysLivraison,
        );

        Data = response.data;
      }

      // Get panier

      let basketData = await getPanier();

      if (basketData.length > 0) {
        // Prend tjr le service du panier

        let cartService = basketData[0].service;

        if (cartService != service?.code) {
          let services = await getServices();

          var newData = services.filter(ls => {
            if (ls?.code == cartService) {
              return ls;
            }
          });

          service = newData[0];

          saveSelectedService(newData[0]);
        }

        // prendre tjr le pays de livraison du panier

        let cartPaysLivraison = basketData[0].paysLivraison;

        if (paysLivraisonObject.id != cartPaysLivraison.id) {
          paysLivraisonObject = cartPaysLivraison;

          setPaysLivraisonObject(paysLivraisonObject);

          await saveSelectedCountry(paysLivraisonObject);
        }
      } else {
        console.log('No Basket Data');
        let cartService = Data.service;

        if (cartService?.code != service?.code) {
          let services = await getServices();
          var newData = services.filter(ls => {
            if (ls?.code == cartService?.code) {
              return ls;
            }
          });

          service = newData[0];

          saveSelectedService(newData[0]);
        }

        // if()

        // prendre tjr le pays de livraison du panier

        let cartPaysLivraison = Data;

        if (paysLivraisonObject.id != cartPaysLivraison.id) {
          paysLivraisonObject = cartPaysLivraison;

          setPaysLivraisonObject(paysLivraisonObject);

          await saveSelectedCountry(paysLivraisonObject);
        }
      }

      // setService(service);

      const userEmail = await getAuthentificationData();

      setClientEmail(user.uid);

      const cartPrices = await getCartPrices();

      // Commande

      let type =
        'CheckoutScreenDemandeAchat' == pageFrom ? 'demandes-d-achat' : null;

      let data = await buildCommande(type);

      const userCards = await getClientCards(user.uid);

      setCards(userCards?.data ? userCards.data : []);

      setDeoptMode(data);
      setService(service);

      setActivity(false);
    }

    async function fetchDataSuivi() {
      setActivity(true);

      // Get pays de livraison

      let paysLivraisonObject = await getSelectedCountry();

      setPaysLivraisonObject(paysLivraisonObject);

      // Language

      const currentLanguage = await getPlatformLanguage();

      setLanguage(currentLanguage);

      // Get service
      setService(service);

      const userEmail = await getAuthentificationData();

      setClientEmail(userEmail);

      const cartPrices = await getCartPrices();

      const userCards = await getClientCards(user.uid);

      setCards(userCards.data);

      setDeoptMode([{test: 'test'}]);

      setActivity(false);
    }

    if (pageFrom == 'coliSuivi') {
      fetchDataSuivi();
    } else {
      fetchData();
    }
  }, [isFocused]);

  async function navigateDepot() {
    setLoadingPayment(true);

    if (DepotMode.depot.mode == 'magasin') {
      return Alert.alert(
        t('Succès'),

        t('Voulez-vous payer au dépôt'),

        [
          {
            text: 'OK',

            onPress: () => {
              validateCommande();

              console.log('Succes');
            },
          },

          {
            text: t('Non'),

            style: 'cancel',

            onPress: () => {
              setLoadingPayment(false);
            },
          },
        ],
      );
    } else {
      return Alert.alert(
        t('Succès'),

        t("Voulez-vous payer à l'enlèvement"),

        [
          {
            text: 'OK',

            onPress: () => {
              validateCommande();

              console.log('Succes');
            },
          },

          {
            text: t('Non'),

            style: 'cancel',

            onPress: () => {
              setLoadingPayment(false);
            },
          },
        ],
      );
    }
  }

  // Valider la commande

  async function validateCommande() {
    console.log('Test');

    setLoadingPayment(true);

    // get prices

    const cartPrices = await getCartPrices();

    let remiseTotal = cartPrices.remiseTotal;

    remiseTotal = remiseTotal ? remiseTotal : 0;


    let avoir = 0;

    let AvoirValue = cartPrices.avoirValue;

    if (AvoirValue) {
      let remain = cartPrices.finalPriceWithoutAvoirRemise - AvoirValue;

      if (remain < 0) {
        avoir = cartPrices.finalPriceWithoutAvoirRemise;
      } else {
        avoir = AvoirValue;
      }
    }



    let data = [];

    let basket = await getPanier();

    let BasketCommand = await getCommand();

    if (basket.length == 0) {
      data = await buildGetCommande();
    } else {
      data = await buildCommande();
    }



    let DataProduct = [];

    BasketCommand.forEach(item => {
      DataProduct.push(item.product[0].product);
    });

    data.commande.statut = 'A payer';

    data.commande.totalPrice = cartPrices.finalPriceWithoutAvoirRemise;

    if (AvoirValue != null) {
      data.commande.totalPaye = AvoirValue;
    } else {
      data.commande.totalPaye = 0;
    }



    const formData = new FormData();

    formData.append('livraison', JSON.stringify(data.livraison));

    formData.append('depot', JSON.stringify(data.depot));

    formData.append('remise', JSON.stringify(data.remise));

    formData.append('paysLivraison', paysLivraisonObject.id);

    formData.append('service', Service.id);

    formData.append('avoir', avoir);

    formData.append('client', user.uid);

    formData.append('commande', JSON.stringify(data.commande));

    formData.append('products', JSON.stringify(data.products));

    formData.append('adresseFacturation', data.adresseFacturation);

    formData.append('adresseFacturationType', data.adresseFacturationType);

    formData.append('facturationNom', data.NomFacturation);



    let index = 0;
    data.productImages.forEach(productImage => {
      let productId = productImage.productId;

      let image = productImage.image;

      if (image) {
        formData.append('image_' + productId + '_' + index, {
          uri: image,

          type: getImageType(image),

          name: 'image_' + productId,
        });

        index++;
      }
    });


    try {
      const response = await axiosInstance.post('/commandes/new', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      removePanier();

      removeCommand();

      setBagCount(0);

      props.navigation.navigate('CommandeScreen', {pageForm: 'updated'});
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code

        // that falls out of the range of 2xx
        console.log('Error response', error.response.data);
        console.log('Error response', error.response.data);

        console.log('Error response', error.response.status);

        console.log('Error response', error.response.headers);

        if (Platform.OS == 'ios') {
          Toast.show({
            type: 'error',
            text1: t('Error'),
            text2: error.response.data.title,
          });
        } else {

          ToastAndroid.show(
            t('Commande non enregistrée, veuillez reessayer.'),
            ToastAndroid.SHORT,
          );
        }
      } else if (error.request) {
        // The request was made but no response was received

        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of

        // http.ClientRequest in node.js

        console.log('request', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error

        console.log('Error', error.message);
      }

      console.log(error.config);
    }

    setLoadingPayment(false);
  }

  if (!Service) {
    return (
      <View style={{justifyContent: 'center', height: '80%'}}>
        <ActivityIndicator size="large" color="#3292E0" style={{}} />
      </View>
    );
  }

  return (
    <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
      <View style={{flex: 1}}>
        <ServiceHeader
          navigation={props.navigation}
          service={Service}
          paysLivraison={paysLivraisonObject}
          language={Language}
        />

        <View style={{marginTop: 24, marginBottom: 12}}>
          <Text
            style={{
              fontFamily: 'Poppins-SemiBold',

              fontSize: 16,

              color: '#000',

              textAlign: 'center',
            }}>
            {t('Mode de paiement')}
          </Text>
        </View>

        {Service?.code == 'ventes-privees' ||
        Service?.code == 'demand-d-achat' ||
        Service?.code == 'demandes-d-achat' ? (
          <>
            <View
              style={{
                flexDirection: 'row',
                gap: 10,
                alignItems: 'center',
                width: windowWidth * 0.75,
                alignSelf: 'center',
              }}>
              {card_category.slice(0, 2).map((item, index) => (
                <View key={index} style={{marginBottom: 25}}>
                  <TouchableOpacity
                    onPress={() => {
                      item.title == '' ? setActiveCard(index) : navigateDepot();
                    }}
                    style={[
                      activeCard === index
                        ? styles.backgroundColorActive
                        : styles.backgroundColor,
                      {
                        justifyContent: 'center',
                        borderRadius: 20,
                        alignItems: 'center',
                        paddingHorizontal: 50,
                        alignSelf: 'center',
                        height: 56,
                        borderWidth: 1.2,
                        borderColor: '#2196F3',
                      },
                    ]}>
                    <View style={{display: item.imgDisplay}}>
                      {activeCard === index ? item.imgActive : item.img}
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            <ScrollView
              horizontal
              style={{paddingLeft: 10}}
              showsHorizontalScrollIndicator={false}>
              {card_category.slice(0, 3).map((item, index) => (
                <View key={index} style={{marginRight: 5, marginBottom: 25}}>
                  <TouchableOpacity
                    onPress={() => {
                      item.title == '' ? setActiveCard(index) : navigateDepot();
                    }}
                    disabled={LoadingPayment}
                    style={[
                      activeCard === index
                        ? styles.backgroundColorActive
                        : styles.backgroundColor,
                      LoadingPayment && index == 2
                        ? {backgroundColor: '#2196F3'}
                        : {},
                      {
                        borderColor: '#2196F3',
                        justifyContent: 'center',
                        borderRadius: 20,
                        alignItems: 'center',
                        paddingHorizontal: item.paddingHorrizontal,
                        height: 56,
                        borderWidth: 1.2,
                      },
                    ]}>
                    <View style={{display: item.imgDisplay}}>
                      {activeCard === index ? item.imgActive : item.img}
                    </View>

                    {DepotMode.depot.mode == 'magasin' ? (
                      <Text
                        style={[
                          activeCard === index
                            ? styles.textActive
                            : styles.textColor,
                          {
                            display: item.titledisplay,
                            fontFamily: 'Poppins-Medium',
                            fontSize: 16,
                          },
                        ]}>
                        {LoadingPayment && index == 2 ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          t('Payer au dépot')
                        )}
                      </Text>
                    ) : (
                      <Text
                        style={[
                          activeCard === index
                            ? styles.textActive
                            : styles.textColor,
                          {
                            display: item.titledisplay,
                            fontFamily: 'Poppins-Medium',
                            fontSize: 16,
                          },
                        ]}>
                        {LoadingPayment && index == 2 ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          t('Payer à l’enlèvement')
                        )}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </>
        )}

        {activeCard == 0 ? <PaymentCard commandId={commandeId} /> : null}

        {activeCard == 1 ? <WavePaymen /> : null}

        {activeCard == 2 ? (
          <View style={styles.container}>
            <View style={styles.textHeadingContainer}>
              {/* <Text style={styles.textHeading}>{t('Commande enregistrée')}</Text> */}

              <Text>Payr au dépot</Text>
            </View>

            <TouchableOpacity
              style={styles.btnContainer}
              onPress={() =>
                props.navigation.navigate(Navigationstrings.WeightCal)
              }>
              <Text style={styles.btnText}>{t('Revenir à l’accueil')}</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  backgroundColorActive: {
    backgroundColor: '#2196F3',
  },

  backgroundColor: {
    backgroundColor: '#fff',
  },

  textActive: {
    color: '#fff',
  },

  textColor: {
    color: '#000',
  },

  container: {
    flex: 1,

    //     justifyContent: 'center',

    alignItems: 'center',

    backgroundColor: '#fff',
  },

  btnContainer: {
    backgroundColor: '#3292E0',

    alignItems: 'center',

    justifyContent: 'center',

    marginTop: windowHeight * 0.02,

    width: windowWidth * 0.7,

    height: windowHeight * 0.07,

    borderRadius: 40,
  },

  btnText: {
    color: '#fff',

    fontSize: 14,
  },

  textHeading: {
    fontSize: 18,

    color: '#1C1939',
  },

  textHeadingContainer: {
    marginTop: windowHeight * 0.03,
  },
});

export default AddCardScreen;
