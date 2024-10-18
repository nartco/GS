import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {Dropdown} from 'react-native-element-dropdown';
import PhoneInput from 'react-native-international-phone-number';
import {useTranslation} from 'react-i18next';
import {useIsFocused} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {calculFraisLivraison} from '../../modules/CalculPrix';
import {
  getLivraisonValues,
  getMagasins,
  getNewAddedAddress,
  getPlatformLanguage,
  getPanier,
  getRemiseUsed,
  getSelectedCountry,
  getSelectedService,
  getServices,
  saveLivraisonAdresseId,
  saveLivraisonDomicileData,
  saveLivraisonMagasinData,
  saveLivraisonMode,
  saveLivraisonPrices,
  saveLivraisonRelaisId,
  saveSelectedService,
  saveMagasins,
  saveSelectedCountry,
} from '../../modules/GestionStorage';
import axiosInstance from '../../axiosInstance';
import ServiceHeader from '../../components/ServiceHeader';
import auth from '@react-native-firebase/auth';
import IntlPhoneInput from 'react-native-intl-phone-input';
import {removeCountryCode} from '../../components/removeCountryCode';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

function DeliveryMethodsU(props) {
  var isFocused = useIsFocused();

  const {t, i18n} = useTranslation();
  const [isFocus, setIsFocus] = useState(false);
  const [isFocus1, setIsFocus1] = useState(false);
  const [isFocusModeLivraison, setIsFocusModeLivraison] = useState(false);

  const [Activity, setActivity] = useState(true);
  const [ActivityMagasin, setActivityMagasin] = useState(true);
  const [MagasinsLivraison, setMagasinsLivraison] = useState([]);
  const [adresses, setAdresses] = useState([]);
  const [NomContact, setNomContact] = useState('');
  const [TelContact, setTelContact] = useState('');
  const phoneInput = useRef(null);
  const [UserMagasinChoix, setUserMagasinChoix] = useState('');
  const [UserDomicileChoix, setUserDomicileChoix] = useState('');
  const [Products, setProducts] = useState([]);
  const [cleanTel, setCleanTel] = useState('');
  const [PrixTotalLivraison, setPrixTotalLivraison] = useState(0);
  const [actionTriggered, setActionTriggered] = useState({}); // to make modal dynamic
  const [modalVisible, setModalVisible] = useState(false);
  const [showRelais, setShowRelais] = useState(false);
  const [showLivraisonDomicile, setShowLivraisonDomicile] = useState(false);
  const [modeLivraisonChoice, setModeLivraisonChoice] = useState('');
  const [MagasinsLivraisonRawValues, setMagasinsLivraisonRawValues] = useState(
    [],
  );
  const [magasinLivraisonUserChoix, setMagasinLivraisonUserChoix] =
    useState(null);
  const [UserLivraisonDomicileChoix, setUserLivraisonDomicileChoix] =
    useState('');
  const [Service, setService] = useState(null);
  const [paysLivraisonObject, setPaysLivraisonObject] = useState(null);
  const [Language, setLanguage] = useState('fr');
  const [selectedCountry, setSelectedCountry] = useState();

  let isNewAddressAdded = props.route.params;
  isNewAddressAdded = isNewAddressAdded
    ? isNewAddressAdded.newAddressAdded
    : false;

  const items = [
    {label: t('Retrait en point relais'), value: 'relais'},
    {label: t('Livraison à domicile'), value: 'domicile'},
  ];

  useEffect(() => {
    async function fetchData() {
      setActivity(true);

      // get language
      const currentLanguage = await getPlatformLanguage();
      setLanguage(currentLanguage);

      // Get pays de livraison
      let paysLivraisonObject = await getSelectedCountry();
      setPaysLivraisonObject(paysLivraisonObject);

      // Get service
      let service = await getSelectedService();

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

          await saveSelectedService(service);
        }

        // prendre tjr le pays de livraison du panier
        let cartPaysLivraison = basketData[0].paysLivraison;
        if (paysLivraisonObject.id != cartPaysLivraison.id) {
          paysLivraisonObject = cartPaysLivraison;

          setPaysLivraisonObject(paysLivraisonObject);

          await saveSelectedCountry(paysLivraisonObject);
        }
      }

      setService(service);

      // Calculer le prix de livraison
      let prixLivraison = calculFraisLivraison(basketData);
      setPrixTotalLivraison(prixLivraison);

      // get magasins
      setActivityMagasin(true);

      let fournisseurs = [];

      await axiosInstance
        .get(
          '/magasins/' +
            service.code +
            '/' +
            paysLivraisonObject.depart +
            '/' +
            paysLivraisonObject.destination,
        )
        .then(response => {
          if (response.data) {
            fournisseurs = response.data;
          }
        })
        .catch(function (error) {});

      let data = [];
      let rawData = [];
      fournisseurs.forEach(function (fournisseur) {
        let addFournisseur = false;
        fournisseur.magasins.forEach(function (magasin) {
          let found = false;
          magasin.types.forEach(function (type) {
            if (
              !found &&
              'Livraison' == type &&
              paysLivraisonObject.destination.toLowerCase() ==
                magasin.pays.toLowerCase()
            ) {
              data.push(magasin);
              found = true;
              addFournisseur = true;
            }
          });
        });

        if (addFournisseur) {
          rawData.push(fournisseur);
        }
      });

      let formatted = data.map(ls => {
        return {
          id: ls.id,
          label:
            ls.pays +
            ', ' +
            (ls.codePostal ? ls.codePostal + ', ' : '') +
            ls.ville +
            ', ' +
            ls.adresse,
          value: ls.id,
        };
      });

      setMagasinsLivraison(formatted);
      setMagasinsLivraisonRawValues(rawData);

      setActivityMagasin(false);

      // get user address
      let formattedUserAdresses = [];
      try {
        const user = auth().currentUser;
        let response = await axiosInstance.get(
          '/adresses/user/destination/' +
            user.uid +
            '/' +
            paysLivraisonObject.id +
            '/',
        );

        formattedUserAdresses = response.data.map(ls => {
          return {
            id: ls.id,
            label:
              ls.adresse + ' ' + ls.codePostal + ' ' + ls.ville + ' ' + ls.pays,
            value: ls.id,
          };
        });

        setAdresses(formattedUserAdresses);
      } catch (error) {
        console.error('get user address', error);
      }

      // Get livraison mode
      let livraisonValues = await getLivraisonValues();
      let choice = livraisonValues.livraisonMode;

      if (choice) {
        setModeLivraisonChoice(choice);

        let nomContact = livraisonValues.livraisonNom;

        if (nomContact) {
          setNomContact(nomContact);
        }

        let telephoneContact = livraisonValues.livraisonTelephone;

        if (telephoneContact) {
          setTelContact(telephoneContact);
          setCleanTel(removeCountryCode(telephoneContact));
        }

        if ('relais' == choice) {
          setShowRelais(true);
          setShowLivraisonDomicile(false);

          let magasinId = livraisonValues.livraisonRelaisId;

          if (magasinId) {
            setMagasinLivraisonUserChoix(magasinId);

            var newData = formatted.filter(ls => {
              if (ls.id == magasinId) {
                return ls;
              }
            });

            setUserMagasinChoix(newData[0]);
          }
        } else {
          setShowLivraisonDomicile(true);
          setShowRelais(false);

          let adresseId = livraisonValues.livraisonAdresseId;

          if (adresseId) {
            var newData = formattedUserAdresses.filter(ls => {
              if (ls.id == adresseId) {
                return ls;
              }
            });

            setUserDomicileChoix(newData[0]);
            setUserLivraisonDomicileChoix(adresseId);
            // setNomContact(newData[0].nom);
            // setTelContact(newData[0].telephone);
          }
        }
      }

      // Added new address or previous address choice
      if (isNewAddressAdded) {
        let adresse = await getNewAddedAddress();

        if (adresse) {
          var newData = adresses.filter(ls => {
            if (ls.id == adresse.id) {
              return ls;
            }
          });

          setUserDomicileChoix(newData[0]);
          setUserLivraisonDomicileChoix(adresse.id);
          setStorageLIvraisonChoiceAdresse(adresse);
          // setNomContact(adresse.nom);
          // setTelContact(adresse.telephone);
        }
      }

      setActivity(false);
    }

    fetchData();
  }, [isFocused]);

  // Sauvegarder l'adresse
  async function setStorageLIvraisonChoiceAdresse(item) {
    await saveLivraisonAdresseId(item.id);
  }

  // Sauvegarder le choix
  async function setStorageLivraisonChoiceMode(item) {
    await saveLivraisonMode(item);
  }

  const NavigateToUserAddress = () => {
    props.navigation.navigate(Navigationstrings.AddAddress, {
      pageFrom: 'livraison',
      paysDepartLivraison: paysLivraisonObject.destination,
      paysDepartLivraisonEN: paysLivraisonObject.destinationEn,
    });
  };

  // Sauvegarder les choix magasin
  async function NavigateToMagasin() {
    if (NomContact === '') {
      Toast.show({
        type: 'error',
        text1: t('Nom de contact'),
        text2: t(
          'Le nom de la personne qui récupère la commande est obligatoire',
        ),
      });

      return;
    }

    if (TelContact === '') {
      Toast.show({
        type: 'error',
        text1: t('Téléphone'),
        text2: t(
          'Le téléphone de la personne qui récupère la commande est obligatoire',
        ),
      });

      return;
    }

    if (UserMagasinChoix === '' || !UserMagasinChoix) {
      Toast.show({
        type: 'error',
        text1: t('Magasin'),
        text2: t('Le magasin est obligatoire'),
      });

      return;
    }

    let concatenedPhone =
      selectedCountry.callingCode + removeCountryCode(TelContact);

    await saveLivraisonMagasinData(
      UserMagasinChoix.label,
      UserMagasinChoix.id,
      NomContact,
      concatenedPhone,
    );

    props.navigation.navigate(Navigationstrings.Summary);
  }

  // Sauvegarder les choix domicile
  async function NavigateToDomicile() {
    if (NomContact === '') {
      Toast.show({
        type: 'error',
        text1: t('Nom de contact'),
        text2: t(
          'Le nom de la personne qui récupère la commande est obligatoire',
        ),
      });

      return;
    }

    if (TelContact === '') {
      Toast.show({
        type: 'error',
        text1: t('Téléphone'),
        text2: t(
          'Le téléphone de la personne qui récupère la commande est obligatoire',
        ),
      });

      return;
    }

    if (UserDomicileChoix === '') {
      Toast.show({
        type: 'error',
        text1: t('Adresse'),
        text2: t("L'adresse est obligatoire"),
      });

      return;
    }

    let concatenedPhone =
      selectedCountry.callingCode + removeCountryCode(TelContact);

    await saveLivraisonDomicileData(
      UserDomicileChoix.label,
      UserDomicileChoix.id,
      NomContact,
      concatenedPhone,
    );

    props.navigation.navigate(Navigationstrings.Summary);
  }

  // si le magasin change
  const OnChangeMagasinValue = magasinChoice => {
    let newArr = null;
    let magasinFound = false;
    MagasinsLivraisonRawValues.forEach(function (fournisseur) {
      fournisseur.magasins.forEach(function (magasin) {
        if (!magasinFound && magasin.id == magasinChoice.id) {
          newArr = magasin;
          magasinFound = true;
        }
      });
    });

    setActionTriggered(newArr);
    setModalVisible(true);
  };

  // Confirmation du magasin
  async function ConfirmationChoixMagasin(magasin) {
    var newData = MagasinsLivraison.filter(ls => {
      if (ls.id == magasin.id) {
        return ls;
      }
    });

    setMagasinLivraisonUserChoix(magasin.id);
    setUserMagasinChoix(newData[0]);
    setModalVisible(!modalVisible);

    await saveLivraisonRelaisId(magasin.id);
  }

  // Deselectionner le magasin
  async function unSetChoixRelais() {
    setModalVisible(!modalVisible);
    setMagasinLivraisonUserChoix(null);
  }

  // setter le numero de telephone
  function setNomTelephone(adresse) {
    setNomContact(adresse.nom);
    setTelContact(adresse.telephone);
  }

  if (!Service) {
    return (
      <View style={{justifyContent: 'center', height: '80%'}}>
        <ActivityIndicator size="large" color="#3292E0" style={{}} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ServiceHeader
        navigation={props.navigation}
        service={Service}
        paysLivraison={paysLivraisonObject}
        language={Language}
      />

      {Activity === true || ActivityMagasin === true ? (
        <View style={{justifyContent: 'center', height: '80%'}}>
          <ActivityIndicator size="large" color="#3292E0" style={{}} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.containerStyle}>
          <View style={styles.dropContainerStyle}>
            <Dropdown
              style={[styles.dropdown]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              autoScroll
              iconStyle={styles.iconStyle}
              containerStyle={styles.containerrrrStyle}
              data={items}
              maxHeight={220}
              labelField="label"
              valueField="value"
              placeholder={
                !isFocusModeLivraison ? t('Mode de livraison') : '...'
              }
              value={modeLivraisonChoice}
              showsVerticalScrollIndicator={false}
              onFocus={() => setIsFocusModeLivraison(true)}
              onBlur={() => setIsFocusModeLivraison(false)}
              onChange={item => {
                if ('relais' == item.value) {
                  setShowRelais(true);
                  setShowLivraisonDomicile(false);
                } else {
                  setShowLivraisonDomicile(true);
                  setShowRelais(false);
                }

                setModeLivraisonChoice(item.value);
                setStorageLivraisonChoiceMode(item.value);
                setIsFocusModeLivraison(false);
              }}
            />
          </View>

          {showLivraisonDomicile && (
            <>
              <View style={styles.dropContainerStyle}>
                <Dropdown
                  style={[styles.dropdown]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  autoScroll
                  iconStyle={styles.iconStyle}
                  containerStyle={styles.containerrrrStyle}
                  data={adresses}
                  maxHeight={120}
                  labelField="label"
                  valueField="value"
                  placeholder={
                    !isFocus1 ? t('Choisir une adresse existante') : '...'
                  }
                  value={UserLivraisonDomicileChoix}
                  showsVerticalScrollIndicator={false}
                  onFocus={() => setIsFocus1(true)}
                  onBlur={() => setIsFocus1(false)}
                  onChange={item => {
                    setUserDomicileChoix(item);
                    setUserLivraisonDomicileChoix(item.id);
                    setIsFocus1(false);
                    setNomTelephone(item);
                  }}
                />
              </View>

              <TouchableOpacity
                style={styles.ButtonContainer}
                onPress={() => {
                  NavigateToUserAddress();
                }}>
                <Text style={styles.ButtonText}>
                  {t('(ou) Ajouter une nouvelle adresse')}
                </Text>
                <Icon
                  name="plus"
                  size={23}
                  color="#000"
                  style={{marginTop: 13}}
                />
              </TouchableOpacity>
            </>
          )}

          {(showRelais || showLivraisonDomicile) && (
            <>
              <View style={styles.inputCountryCustomContainer}>
                <TextInput
                  layout="first"
                  containerStyle={styles.phoneContainer}
                  textContainerStyle={styles.textInput}
                  codeTextStyle={styles.codeTextStyle}
                  countryPickerButtonStyle={styles.countryPickerButtonStyle}
                  placeholder={t('Nom de la personne qui récupère la commande')}
                  textInputProps={{placeholderTextColor: '#BCB8B1'}}
                  textInputStyle={styles.textInputStyle}
                  value={NomContact}
                  onChangeText={text => {
                    setNomContact(text);
                  }}
                />
              </View>

              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 10,
                  marginBottom: 10,
                }}>
                <PhoneInput
                  language={i18n.language}
                  containerStyle={styles.countryPickerContainerStyle}
                  textInputStyle={styles.textInput}
                  defaultCountry={getCountryCodeFromPhone(TelContact)}
                  selectedCountry={selectedCountry}
                  onChangeSelectedCountry={country => {
                    setSelectedCountry(country);
                  }}
                  value={cleanTel}
                  onChangePhoneNumber={text => {
                    setTelContact(text);
                  }}
                />
              </View>
            </>
          )}

          {showLivraisonDomicile && (
            <>
              {'demandes-d-achat' == Service.code ? (
                <View style={styles.TotalContainer}>
                  <Text>{t('Frais livraison à prévoir')}</Text>
                </View>
              ) : (
                <View style={styles.TotalContainer}>
                  <Text style={styles.TotalText}>{t('Frais livraison')}</Text>
                  <Text style={styles.PriceText}>
                    {PrixTotalLivraison > 0
                      ? PrixTotalLivraison + '€'
                      : t('Offert')}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.ButtonStyle, {width: '75%', marginTop: 10}]}
                onPress={() => {
                  NavigateToDomicile();
                }}>
                <Text style={styles.ButtonStyleText}>
                  {t('Valider livraison à domicile')}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {showRelais && (
            <>
              <View style={styles.dropContainerStyle}>
                <Dropdown
                  style={[styles.dropdown]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  autoScroll
                  iconStyle={styles.iconStyle}
                  containerStyle={styles.containerrrrStyle}
                  data={MagasinsLivraison}
                  value={magasinLivraisonUserChoix}
                  maxHeight={220}
                  labelField="label"
                  valueField="value"
                  placeholder={
                    MagasinsLivraison.length > 0
                      ? t('Choisir le point relais')
                      : t('Pas de points relais disponible')
                  }
                  showsVerticalScrollIndicator={false}
                  onFocus={() => setIsFocus(true)}
                  onBlur={() => setIsFocus(false)}
                  onChange={item => {
                    OnChangeMagasinValue(item);
                    setIsFocus(false);
                  }}
                />
              </View>

              <TouchableOpacity
                style={styles.ButtonStyle}
                onPress={() => {
                  NavigateToMagasin();
                }}>
                <Text style={styles.ButtonStyleText}>
                  {t('Valider livraison au point relais')}
                </Text>
              </TouchableOpacity>
            </>
          )}

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(!modalVisible);
            }}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.Heading}>{t("Horaires d'ouverture")}</Text>
                <Text style={styles.modalText}>
                  {actionTriggered.horaireOuverture}
                </Text>
                <Text style={styles.modalText}>
                  {actionTriggered.adresse +
                    ', ' +
                    (actionTriggered.codePostal
                      ? actionTriggered.codePostal + ' '
                      : '') +
                    actionTriggered.ville +
                    ' ' +
                    actionTriggered.pays}
                </Text>
                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => unSetChoixRelais()}>
                  <Text style={styles.textStyle}>{t('Fermer')}</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.buttonOpen]}
                  onPress={() => ConfirmationChoixMagasin(actionTriggered)}>
                  <Text style={styles.textStyle}>
                    {t('Sélectionner le magasin')}
                  </Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </ScrollView>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerSafee: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 20,
  },
  containerStyle: {
    width: '100%',
    backgroundColor: '#fff',
    marginTop: windowHeight * 0.05,
  },
  spacerStyle: {},
  safeContainerStyle: {
    width: '80%',
    alignSelf: 'center',
    justifyContent: 'center',
    // backgroundColor: 'tomato',
    marginBottom: windowHeight * 0.1,
  },
  inputCustomDropdownContainer: {
    width: windowWidth * 0.8,
    alignSelf: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  ButtonContainer: {
    width: '80%',
    height: 50,
    borderRadius: 8,
    backgroundColor: 'rgba(173, 173, 173, 0.2)',
    marginTop: windowHeight * 0.015,
    alignSelf: 'center',
    marginBottom: 10,
    flexDirection: 'row',
  },
  ButtonText: {
    marginLeft: '5%',
    width: '78%',
    color: '#042C5C',
    fontSize: 15,
    marginTop: 17,
  },
  CountrySelect: {
    width: '80%',
    alignSelf: 'center',
    height: 48,
    borderColor: '#DADAED',
    borderWidth: 1,
    backgroundColor: '#fff',
    marginTop: 5,
    borderRadius: 7,
    flexDirection: 'row',
    marginBottom: 30,
  },
  InputNam: {
    marginLeft: '3%',
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    width: windowWidth * 0.65,
    // backgroundColor: 'gold',
    flex: 1,
    color: '#000',
  },
  ButtonStyle: {
    width: '80%',
    height: 45,
    borderRadius: 60,
    justifyContent: 'center',
    backgroundColor: '#3292E0',
    marginTop: 10,
    alignSelf: 'center',
    marginBottom: 20,
  },
  ButtonStyleText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
  TotalContainer: {
    flexDirection: 'row',
    width: windowWidth * 0.8,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-around',
    // backgroundColor: 'tomato',
    marginBottom: windowHeight * 0.02,
  },
  TotalText: {
    width: '30%',
    fontSize: 18,
    fontFamily: 'Roboto-Regular',
    color: '#1C1939',
  },
  PriceText: {
    width: '68%',
    fontSize: 18,
    fontFamily: 'Roboto-Regular',
    textAlign: 'right',
    color: '#1C1939',
  },
  domicileStyle: {
    fontFamily: 'Roboto-Regular',
    fontSize: 18,
    textAlign: 'center',
    color: '#1C1939',
  },
  Heading: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
    textAlign: 'center',
    color: '#1C1939',
  },
  SecondHeading: {
    fontSize: 18,
    fontFamily: 'Roboto-Regular',
    textAlign: 'center',
    color: '#1C1939',
  },
  Heading: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
    textAlign: 'center',
    color: '#1C1939',
  },
  inputCountryCustomContainer: {
    backgroundColor: '#fff',
    width: windowWidth * 0.8,
    height: 60,
    alignSelf: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#DADAED',
    borderRadius: 7,
  },
  phoneContainer: {
    // width: '75%',
    width: windowWidth * 0.7,
    height: 50,
    backgroundColor: '#fff',
    elevation: 0,
    // backgroundColor: 'tomato',
  },
  textInput: {
    paddingVertical: 0,
    // backgroundColor: 'gold',
    width: windowWidth * 0.6,
    backgroundColor: '#fff',
    fontFamily: 'Roboto-Regular',
    color: '#000',
  },
  codeTextStyle: {
    fontFamily: 'Roboto-Regular',
    fontSize: 15,
    // backgroundColor: 'green',
    width: 'auto',
  },
  countryPickerButtonStyle: {
    // backgroundColor: 'gold',
    width: 70,
  },
  textInputStyle: {
    fontFamily: 'Roboto-Regular',
    color: '#000',
  },
  dropContainerStyle: {
    justifyContent: 'center',
    // backgroundColor: 'tomato',
    width: windowWidth * 0.9,
    // borderRadius:0
    alignSelf: 'center',
    marginTop: windowHeight * 0.02,
    marginBottom: windowHeight * 0.01,
  },

  dropdown: {
    height: 50,
    borderRadius: 7,
    paddingHorizontal: 17,
    backgroundColor: 'rgba(173, 173, 173, 0.2)',
    // elevation: 1,
    width: windowWidth * 0.8,
    // borderWidth: 1,
    // borderColor: '#DADAED',
    alignSelf: 'center',
  },
  placeholderStyle: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    color: '#14213D',
  },
  selectedTextStyle: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    color: '#14213D',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  containerrrrStyle: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    maxHeight: 100,
    elevation: 10,
  },

  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    width: windowWidth * 0.9,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  countryPickerContainerStyle: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 3,
  },
});
export default DeliveryMethodsU;
