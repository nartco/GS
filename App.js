import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  View,
  FlatList,
  Dimensions,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import AppNavigation from './navigation/AppNavigation';

import Toast, {BaseToast, ErrorToast} from 'react-native-toast-message';
import {I18nextProvider, useTranslation} from 'react-i18next';
import axiosInstance from './axiosInstance';
import {

  getPanier,
  getSelectedCountry,
  getSelectedService,
  getServices,
  saveConditionsMentions,
  saveParametrages,
  saveSelectedCountry,
  saveSelectedService,
} from './modules/GestionStorage';
import auth from '@react-native-firebase/auth';

import {GetPlatformLanguageAndSavedInStorage} from './modules/DeviceSettings';
import {StripeProvider} from '@stripe/stripe-react-native';
import React, {useEffect, useState} from 'react';
import {Dropdown} from 'react-native-element-dropdown';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
import {savePlatformLanguage} from './modules/GestionStorage';
import i18next, {languageResources} from './language/i18n';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

const App = () => {
  const {t, i18n} = useTranslation();
  const [Loader, setLoader] = useState(false);
  const [Remises, setRemises] = useState([]);
  const [CartProducts, setCartProducts] = useState([]);
  const [RemiseLoader, setRemiseLoader] = useState(true);
  const [Service, setService] = useState(null);
  const [paysLivraison, setPaysLivraison] = useState('');
  const [BasketClasseRegroupement, setBasketClasseRegroupement] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('fr');
  const [isFocus, setIsFocus] = useState(false);
  const iosPlat = Platform.OS;

  

  useEffect(() => {
    let mounted = true;

    async function fetchParametrageAndConditionsLegales() {
      let deviceLanguage = await GetPlatformLanguageAndSavedInStorage();

      try {
        const response = await axiosInstance.get('/parametrages/');

        if (response.data) {
          let obj = {};

          response.data.map(row => {
            obj[row.code] =
              'fr' == deviceLanguage ? row.message : row.messageEN;
          });

          // Sauvegarder
          saveParametrages(obj);
        }
      } catch (erreur) {
        console.log('parametrages fetch error', erreur);
      }

      try {
        const response = await axiosInstance.get(
          '/conditions/mentions/legales/',
        );

        if (response.data) {
          let obj = {};

          response.data.map(row => {
            obj[row.code] = row;
          });

          // Sauvegarder
          saveConditionsMentions(obj);
        }
      } catch (erreur) {
        console.log('conditions et mentions legales fetch error', erreur);
      }
    }

    async function getLanguageAndSetI18n() {
      let deviceLanguage = await GetPlatformLanguageAndSavedInStorage();

      try {
        const response = await i18n.changeLanguage(deviceLanguage);
      } catch (erreur) {
        console.log('change language error', erreur);
      }
    }

    async function fetchValue() {
      try {
        // Information de connexion

        // Recuperer le service
        let service = await getSelectedService();
        setService(service);

        // Recuperer le pays de livraison
        let selectedPaysLivraison = await getSelectedCountry();
        setPaysLivraison(selectedPaysLivraison);

        // Recuperer le panier
        let basketData = await getPanier();

        if (basketData.length > 0) {
          // Prend tjr le service du panier
          let cartService = basketData[0].service;
          if (cartService != service.code) {
            let services = await getServices();

            var newData = services.filter(ls => {
              if (ls.code == cartService) {
                return ls;
              }
            });

            service = newData[0];

            setService(service);

            await saveSelectedService(service);
          }

          // prendre tjr le pays de livraison du panier
          let cartPaysLivraison = basketData[0].paysLivraison;
          if (selectedPaysLivraison.id != cartPaysLivraison.id) {
            selectedPaysLivraison = cartPaysLivraison;

            setPaysLivraison(selectedPaysLivraison);

            await saveSelectedCountry(selectedPaysLivraison);
          }

          // Si vente privées recuperer la classe de regroupement (pour determiner si avion ou bateau)
          if ('ventes-privees' == service.code) {
            let classeRegroupement = null;

            basketData.map(ls => {
              let productSpecificites = ls.product.productSpecificites
                ? ls.product.productSpecificites[0]
                : null;

              let classeRegroupements = productSpecificites
                ? productSpecificites.livraison
                  ? productSpecificites.livraison.classeRegroupement
                  : []
                : [];

              if (classeRegroupements && classeRegroupements.length == 1) {
                classeRegroupement = classeRegroupements[0].type;
              }
            });

            // Probablement en face d'un type avec 2 classes de livraison, on ne prend que l'avion
            if (!classeRegroupement) {
              basketData.map(ls => {
                let productSpecificites = ls.product.productSpecificites
                  ? ls.product.productSpecificites[0]
                  : null;

                let classeRegroupements = productSpecificites
                  ? productSpecificites.livraison
                    ? productSpecificites.livraison.classeRegroupement
                    : []
                  : [];

                if (classeRegroupements && classeRegroupements.length == 2) {
                  // Juste pour s'assurer qu'on a bien defini le type de livraison
                  classeRegroupement = 'avion';
                }
              });
            }

            setBasketClasseRegroupement(classeRegroupement);
          }

          setCartProducts(basketData);
        }

        if (!service) {
          return;
        }

        // Recuperer les remises
        const user = auth().currentUser;
        axiosInstance
          .get(
            '/remises/active/all/' +
              user.uid +
              '/' +
              service.code +
              '/' +
              selectedPaysLivraison.id,
          )
          .then(response => {
            if (response.data) {
              setRemises(response.data);
              setRemiseLoader(false);
            }
          })
          .catch(function (error) {
            setRemiseLoader(false);
          });

        setLoader(false);
      } catch (error) {
        console.log('error', error);

        setLoader(false);
        setRemiseLoader(false);
      }
    }

    fetchValue();

    // Récuperer la langue du téléphone et la sauvegarder
    getLanguageAndSetI18n();
    if (iosPlat != 'ios') {
      StatusBar.setBackgroundColor('#2BA6E9');
      StatusBar.setBarStyle('light-content');
    }
    // Recuperer les parametrages
    fetchParametrageAndConditionsLegales();
    return mounted => (mounted = false);
  }, []);

  const [value, setValue] = useState(null);

  const [visible, setVisible] = useState(false);

  const Stack = createNativeStackNavigator();

  const toastConfig = {
    error: props => (
      <ErrorToast
        {...props}
        text1Style={{
          fontSize: 13,
        }}
        text2Style={{
          fontSize: 9,
        }}
      />
    ),
  };
  return (
    <>
      {iosPlat != 'ios' ? (
        <I18nextProvider i18n={i18n}>
          <StripeProvider publishableKey="pk_live_51MP1s8H53XOlotVAh1G56yNXSMnT0d19Ysu4UgZIVet1xL4hY7U5NfgWyqvTxKiTlpAGyzIFn4wl8DHCw33RyIib00Ofcs3qRZ">
            <SafeAreaView style={{flex: 1}}>
              <AppNavigation />
            </SafeAreaView>
          </StripeProvider>
        </I18nextProvider>
      ) : (
        <>
          <StripeProvider publishableKey="pk_live_51MP1s8H53XOlotVAh1G56yNXSMnT0d19Ysu4UgZIVet1xL4hY7U5NfgWyqvTxKiTlpAGyzIFn4wl8DHCw33RyIib00Ofcs3qRZ">
            <AppNavigation />
            <Toast
              position="bottom"
              bottomOffset={20}
              visibilityTime={3000}
              config={toastConfig}
            />
          </StripeProvider>
        </>
      )}
    </>
  );
};

export default App;
