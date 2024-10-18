//import liraries
import React, {useEffect, useRef, useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Alert,
  Image,
  ToastAndroid,
  Platform,
} from 'react-native';

import Carousel, {Pagination} from 'react-native-snap-carousel';
import {Dropdown} from 'react-native-element-dropdown';
import Modal from 'react-native-modal';
import {useTranslation} from 'react-i18next';
import Toast from 'react-native-toast-message';
import {
  afficherMessageProduitServiceDifferent,
  hasPanierHasProduitNonManuel,
  hasPanierHasProduitManuel,
} from '../../modules/RegleGestion';
import {
  removePanier,
  savePanier,
  getPanier,
  getParametrages,
  removeCommand,
  getCommand,
  saveSelectedCountryProduct,
  saveSelectedServiceProduct,
} from '../../modules/GestionStorage';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Feather from 'react-native-vector-icons/Feather';
import Button from '../../components/Button';
import auth from '@react-native-firebase/auth';
import {onAuthStateChanged} from 'firebase/auth';
import {useBag} from '../../modules/BagContext';
import CurrencyInput from 'react-native-currency-input';
// import ImageView from 'react-native-image-viewing';
// import ImageView from 'react-native-image-zoom-viewer'; // Change this import
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {ImageGallery} from '@georstat/react-native-image-gallery';

import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
// create a component
const ByPlaneDetailsComponent = props => {
  const {setBagCount, bagCount} = useBag();
  // Donnée statique
  const navigation = props.navigation;
  const Service = props.service;
  const ServiceSelected = props.selectedService;
  const PaysLivraison = props.paysLivraison;
  const Language = props.language;
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeIndexModal, setActiveIndexModal] = useState(0);
  const Product = props.data;

  const Images = Product.productImages;
  const [user, setUser] = useState([]);
  const [ispenModal, setOpenModal] = useState(false);
  const [value, setValue] = useState('');
  const isCarousel = useRef(0);
  const isCarouselModal = useRef(0);

  const productSpecificites = Product.productSpecificites
    ? Product.productSpecificites[0]
    : null;

  const douane = productSpecificites ? productSpecificites.douane : null;

  const quantiteMax = productSpecificites
    ? productSpecificites.quantiteMax
    : 400;

  // Pour la gestion de la langue
  const {t} = useTranslation();

  const data = [
    {label: t('Neuf'), value: 'New'},
    {label: t('Usagé'), value: 'Used'},
  ];

  useEffect(() => {
    const currentUser = auth().currentUser;
    setUser(currentUser);
  }, []);

  // Donnée dynamique
  const [StateValue, setStateValue] = useState(null);
  const [QuantitySelected, setQuantitySelected] = useState(null);
  const [productValue, setProductValue] = useState('');
  const [userImage, setUserImage] = useState('');
  const [active, setActive] = useState(0);
  const [isModalVisible, setModalVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState({});
  const [open2, setOpen2] = useState(false);
  const [modalVisiblePhoto, setModalVisiblePhoto] = useState(false);
  const [amount, setAmount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const IOSPLAt = Platform.OS;
  const openGallery = () => setIsOpen(true);
  const closeGallery = () => setIsOpen(false);

  // Gestion du scroll
  const Change = nativeEvent => {
    const slide = Math.ceil(
      nativeEvent.contentOffset.x / nativeEvent.layoutMeasurement.width,
    );
    if (slide !== active) {
      setActive(slide);
    }
  };

  // Build quantity label

  const arrayOFF = Array.from(Array(quantiteMax).keys());

  const sweeterArray = arrayOFF.map(arrayOFF => {
    let label = arrayOFF + 1;

    if (Product.unite && Product.unite.valeur.toLowerCase() != 'unité') {
      if (label > 1) {
        label =
          label +
          ' ' +
          ('fr' == Language
            ? Product.unite.valeurPluriel
            : Product.unite.valeurPlurielEN);
      } else {
        label =
          label +
          ' ' +
          ('fr' == Language ? Product.unite.valeur : Product.unite.valeurEN);
      }
    } else {
      label = label.toString();
    }

    return {label: label, value: arrayOFF + 1};
  });

  // Modal
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  // Camera
  const selectImageFromGallery = () => {
    let options = {
      storageOptions: {
        path: 'image',
      },
    };

    launchImageLibrary(options, response => {
      if (response.didCancel == true) {
        setUserImage('');
      } else {
        setUserImage(response.assets[0].uri);
        if (IOSPLAt == 'ios') {
          Toast.show({
            type: 'success',
            text1: t('Image'),
            text2: t('Image ajoutée'),
          });
        } else {
          ToastAndroid.show(t('Image ajoutée'), ToastAndroid.SHORT);
        }
        setModalVisible(!isModalVisible);
      }
    });
  };

  const openCameraForPicture = async () => {
    let options = {
      width: 300,
      height: 400,
      storageOptions: {
        path: 'image',
      },
    };

    /*
if (Platform.OS === 'android') {
try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'App Camera Permission',
        message:
          'App needs access to your camera',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('You can use the camera');
      launchCamera(options, response => {
	  if(response.didCancel == true)
	  {
	   setUserImage('')
		  }else if (response.errorCode) {
		console.log('ImagePicker Error: ', response);
	      }else{
	    setUserImage(response.assets[0].uri);
	    if(IOSPLAt == 'ios')
	    {
	      Toast.show({
		type: 'success',
		text1: t('Image'),
		text2: t('Image ajoutée'),
	      });
	    }
	    else{
	      ToastAndroid.show("Image ajoutée", ToastAndroid.SHORT)
	    }
	    setModalVisible(!isModalVisible);
	  }
	})
    } else {
      console.log('Camera permission denied');
    }
  } catch (err) {
    console.warn(err);
  }
  
}
else
{

}
*/

    launchCamera(options, response => {
      if (response.didCancel == true) {
        setUserImage('');
      } else if (response.errorCode) {
      } else {
        setUserImage(response.assets[0].uri);
        if (IOSPLAt == 'ios') {
          Toast.show({
            type: 'success',
            text1: t('Image'),
            text2: t('Image ajoutée'),
          });
        } else {
          ToastAndroid.show(t('Image ajoutée'), ToastAndroid.SHORT);
        }
        setModalVisible(!isModalVisible);
      }
    });
  };

  openModal = () => {
    setModalVisiblePhoto(true);
  };

  closeModal = () => {
    setModalVisiblePhoto(false);
  };

  // Afficher un message des frais de douane à prevoir
  const showDouaneMessage = async item => {
    if (!douane) {
      return false;
    }

    let parametrages = await getParametrages();

    if ('New' == item) {
      if (!parametrages.messageFraisDouane) {
        return console.log('Nothing');
      }

      if (douane.forfait > 0 || douane.coefficient > 0) {
        if (IOSPLAt == 'ios') {
          return Toast.show({
            type: 'info',
            text1: t('Information'),
            text2: parametrages.messageFraisDouane,
          });
        } else {
          return ToastAndroid.show(
            parametrages.messageFraisDouane,
            ToastAndroid.SHORT,
          );
        }
      }
    }

    if ('Used' == item) {
      if (!parametrages.messageFraisUsageDouane) {
        return console.log('Nothing Used');
      }

      if (
        douane.forfaitProduitOccasion > 0 ||
        douane.coefficientProduitOccasion > 0
      ) {
        if (IOSPLAt == 'ios') {
          return Toast.show({
            type: 'info',
            text1: t('Information'),
            text2: parametrages.messageFraisUsageDouane,
          });
        } else {
          return ToastAndroid.show(
            parametrages.messageFraisUsageDouane,
            ToastAndroid.SHORT,
          );
        }
      }
    }

    return false;
  };

  // Vider le panier
  const handleCartRemove = async () => {
    await removePanier();
    await removeCommand();
    handleCart();
  };

  // Ajouter les produits au panier
  const handleCartLogin = async () => {
    if (!QuantitySelected) {
      if (IOSPLAt == 'ios') {
        Toast.show({
          type: 'error',
          text1: t('Quantity'),
          text2: t('La quantité est obligatoire !'),
        });
      } else {
        ToastAndroid.show(
          t('La quantité est obligatoire !'),
          ToastAndroid.SHORT,
        );
      }

      return;
    }

    if (!StateValue) {
      if (IOSPLAt == 'ios') {
        Toast.show({
          type: 'error',
          text1: t('Etat'),
          text2: t("L'état du produit est obligatoire !"),
        });
      } else {
        ToastAndroid.show(
          t("L'état du produit est obligatoire !"),
          ToastAndroid.SHORT,
        );
      }
      return;
    }

    if (douane) {
      let coefficientDouane =
        'New' == StateValue
          ? douane.coefficient
          : douane.coefficientProduitOccasion;

      if (coefficientDouane && !productValue) {
        if (IOSPLAt == 'ios') {
          Toast.show({
            type: 'error',
            text1: t('Valeur'),
            text2: t('La valeur est obligatoire !'),
          });
        } else {
          ToastAndroid.show(
            t('La valeur est obligatoire !'),
            ToastAndroid.SHORT,
          );
        }

        return;
      }
    }

    try {
      let BasketCommand = await getCommand();

      let isProductFromDifferentService =
        await afficherMessageProduitServiceDifferent(Service, PaysLivraison);

      if (BasketCommand.length > 0) {
        return Alert.alert(
          t('Information'),
          t(
            "Votre panier contient des produits d'un autre service (ou pays de départ ou pays de destination). Vous perdrez votre panier si vous continuez. Voulez-vous continuer ?",
          ),
          [
            {
              text: t('Non'),
              style: 'cancel',
            },
            {
              text: t('Oui'),
              onPress: () => {
                setBagCount(0);
                handleCartRemove();
                return;
              },
            },
          ],
        );
      }

      if (isProductFromDifferentService) {
        return Alert.alert(
          t('Information'),
          t(
            "Votre panier contient des produits d'un autre service (ou pays de départ ou pays de destination). Vous perdrez votre panier si vous continuez. Voulez-vous continuer ?",
          ),
          [
            {
              text: t('Non'),
              style: 'cancel',
            },
            {
              text: t('Oui'),
              onPress: () => {
                setBagCount(0);

                handleCartRemove();
                return;
              },
            },
          ],
        );
      }

      let panierHasProduitNonManuelOrProduitManuel = false;
      let message = '';
      if (Product && Product.validationManuelle) {
        panierHasProduitNonManuelOrProduitManuel =
          await hasPanierHasProduitNonManuel();
        message = t('qui ne nécessitent pas une quotation manuelle');
      } else {
        panierHasProduitNonManuelOrProduitManuel =
          await hasPanierHasProduitManuel();
        message = t('qui nécessitent une quotation manuelle');
      }

      if (panierHasProduitNonManuelOrProduitManuel) {
        return Alert.alert(
          t('Information'),
          t('Votre panier contient des produits') +
            ' ' +
            message +
            '.' +
            t(
              'Vous perdrez votre panier si vous continuez. Voulez-vous continuer ?',
            ),
          [
            {
              text: t('Non'),
              style: 'cancel',
            },
            {
              text: t('Oui'),
              onPress: () => {
                setBagCount(0);

                handleCartRemove();
                return;
              },
            },
          ],
        );
      }

      await removeCommand();

      // Sauvegarder dans le panier
      handleCart();
    } catch (e) {
      console.log('add cart error', e);
    }
  };

  // Ajout au panier
  const handleCart = async () => {
    await saveSelectedCountryProduct(PaysLivraison);
    await saveSelectedServiceProduct(ServiceSelected);

    let CatProducts = [];

    let match = false;

    const obj = {
      ID: (Math.random() + 1).toString(36).substring(7),
      product: Product,
      ProductId: Product.id,
      ProductImage: Product.productImages,
      discount: Product.discount,
      stateValue: StateValue,
      quantiteMax: quantiteMax,
      quantite: QuantitySelected,
      productValue: productValue,
      service: Service,
      image: userImage,
      paysLivraison: PaysLivraison,
      Price: productSpecificites ? productSpecificites.prix : null,
    };

    CatProducts.push(obj);

    let basketData = await getPanier();

    let success = false;

    let validationManuelleMessage = t(
      'Avec ce produit votre commande nécessitera une quotation manuelle',
    );

    if (basketData.length == 0) {
      await savePanier(CatProducts);

      if (!Product.validationManuelle) {
        if (IOSPLAt == 'ios') {
          Toast.show({
            type: 'success',
            text1: t('Succès'),
            text2: t('Ajouter au panier avec succès'),
          });
        } else {
          ToastAndroid.show(
            t('Ajouter au panier avec succès'),
            ToastAndroid.SHORT,
          );
        }
      } else {
        if (IOSPLAt == 'ios') {
          Toast.show({
            type: 'success',
            text1: t('Information'),
            text2: validationManuelleMessage,
          });
        } else {
          ToastAndroid.show(validationManuelleMessage, ToastAndroid.SHORT);
        }
      }

      setBagCount(prev => prev + 1);
      success = true;
    } else {
      basketData.map(ls => {
        if (
          ls.product.name === obj.product.name &&
          ls.product.productCategories[0].name ===
            obj.product.productCategories[0].name &&
          ls.stateValue === obj.stateValue
        ) {
          match = true;
        }
      });

      if (match === true) {
        if (IOSPLAt == 'ios') {
          Toast.show({
            type: 'error',
            text1: t('Info'),
            text2: t('Ce produit a déjà été ajouté'),
          });
        } else {
          ToastAndroid.show(
            t('Ce produit a déjà été ajouté'),
            ToastAndroid.SHORT,
          );
        }
      } else {
        basketData.push(obj);

        await savePanier(basketData);

        if (!Product.validationManuelle) {
          if (IOSPLAt == 'ios') {
            Toast.show({
              type: 'success',
              text1: t('Succés'),
              text2: t('Ajouter au panier avec succès'),
            });
          } else {
            ToastAndroid.show(
              t('Ajouter au panier avec succès'),
              ToastAndroid.SHORT,
            );
          }
        } else {
          if (IOSPLAt == 'ios') {
            Toast.show({
              type: 'success',
              text1: t('Information'),
              text2: validationManuelleMessage,
            });
          } else {
            ToastAndroid.show(validationManuelleMessage, ToastAndroid.SHORT);
          }
        }

        setBagCount(prev => prev + 1);
        success = true;
      }
    }

    if (success) {
      // Not Login
      if (user === null) {
        navigation.navigate('Login', {fromCart: 'cart'});
        return; //should never reach
      }
    }
  };

  const handleInputChange = text => {
    const montantNumerique = parseFloat(text);

    if (!isNaN(montantNumerique)) {
      setProductValue(
        montantNumerique.toLocaleString('fr-FR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      );
    } else {
      setProductValue('');
    }
  };

  const inputRef = React.createRef();

  const formatPrice = price => {
    const priceStr = price.toString();

    const [dollars, cents] = priceStr.split('.');

    const formattedDollars = parseInt(dollars, 10)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    let formattedCents = 0;
    if (Language == 'fr') {
      formattedCents = cents ? `,${cents}` : '';
    } else {
      formattedCents = cents ? `.${cents}` : '';
    }

    const formattedPrice = `${formattedDollars}${formattedCents}`;

    return formattedPrice;
  };

  const [currentImageIndex, setCurrentImageIndex] = useState({});

  const openImageView = (productIndex, imageIndex) => {
    setIsOpenModal(prev => ({...prev, [productIndex]: true}));
    setCurrentImageIndex(prev => ({...prev, [productIndex]: imageIndex}));
  };

  const renderItem = ({item, index}, productIndex) => {
    return (
      <TouchableOpacity
        key={index}
        style={{
          borderRadius: 5,
          padding: 50,
          marginLeft: 25,
          marginRight: 25,
        }}
        onPress={openGallery}
        // onPress={() => openGallery(productIndex, index)}
      >
        <Image
          source={{uri: item.url}}
          style={{
            height: wp(40),
            borderRadius: 22,
            width: wp(50),
            justifyContent: 'center',
            alignSelf: 'center',
          }}
          resizeMode={'contain'}
        />
      </TouchableOpacity>
    );
  };

  const renderHeader = () => {
    return (
      <View
        style={{
          position: 'absolute',
          top: windowWidth * 0.15,
          right: windowWidth * 0.09,
        }}>
        <TouchableOpacity onPress={closeGallery}>
          <FontAwesome6 name="x" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  const handleInputChangeThird = text => {
    const parsedValue = parseFloat(text);

    // Check if the value is a valid number
    if (!isNaN(parsedValue)) {
      // If the value is a whole number, add ".00"
      const formattedValue =
        parsedValue % 1 === 0
          ? parsedValue.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : text; // For decimal numbers, keep the original input

      // Update the state with the formatted value
      setProductValue(formattedValue);
    } else {
      // Clear the input if it's not a valid number
      setProductValue('');
    }
  };

  const ImageFooter = ({imageIndex, images, onPressThumbnail}) => (
    <View style={styles.root}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          justifyContent: 'center',
        }}>
        {images.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => onPressThumbnail(idx)}
            style={styles.thumbnailWrapper}>
            <Image
              key={idx}
              source={{uri: item.url}}
              style={[
                idx === imageIndex
                  ? {borderColor: 'red'}
                  : {borderColor: 'transparent'},
                {
                  height: wp(15),
                  borderWidth: 3,
                  borderRadius: 10,
                  width: wp(15),
                },
              ]}
              resizeMode={'cover'}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  function formatValue(value, locale) {
    const number = Number(value.replace(/[^0-9.]/g, ''));
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  }

  return (
    <>
      <View style={{backgroundColor: '#fff', margin: 5}}>
        <View
          style={{
            paddingHorizontal: 12,
            paddingTop: 25,
            paddingBottom: 12,
            borderRadius: 12,
          }}>
          <Text
            style={{
              fontFamily: 'Poppins-SemiBold',
              fontSize: 13.5,
              textAlign: 'left',
              color: '#60be74',
            }}>
            {'fr' == Language ? Product.name : Product.nameEN}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingTop: 0,
            paddingBottom: 12,
            paddingLeft: 22,
          }}>
          <View>
            <Carousel
              layout={'default'}
              ref={isCarousel}
              style={styles.imageSwiper}
              data={Images}
           
              sliderWidth={windowWidth * 0.4}
              itemWidth={windowWidth * 0.4}
              renderItem={item => renderItem(item, Product.id)}
              onSnapToItem={index => setActiveIndex(index)}
            />
            <Pagination
              dotsLength={Images.length}
              activeDotIndex={activeIndex}
              dotColor={'#60be74'}
              inactiveDotColor={'#fff'}
              containerStyle={{
                position: 'absolute',
                bottom: 20,
                width: windowWidth * 0.3,
                alignSelf: 'center',
              }}
              // inactiveDotColor={'rgba(255, 255, 255, 1)'}
              dotStyle={{
                width: 10,
                height: 10,
                borderRadius: 8,
                backgroundColor: '#000',
              }}
              inactiveDotStyle={{
                width: 8,
                height: 8,
                borderRadius: 8,
                backgroundColor: '#000',
              }}
              carouselRef={isCarousel}
            />

            <ImageGallery
              close={closeGallery}
              images={Images}
              isOpen={isOpen}
              resizeMode="contain"
              renderHeaderComponent={renderHeader}
            />
          </View>

          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                marginTop: 8,
              }}>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: 'Poppins-SemiBold',
                  color: '#000',
                }}>
                {('en' == Language ? '€ ' : '') +
                  (productSpecificites
                    ? formatPrice(productSpecificites.prix)
                    : 0) +
                  ('fr' == Language ? ' €' : '')}
                /
                {Product.unite
                  ? 'fr' == Language
                    ? Product.unite.valeur
                    : Product.unite.valeurEN
                  : ''}
              </Text>
              {productSpecificites && productSpecificites.prixAncien ? (
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: 'Poppins-SemiBold',
                    color: '#000',
                    textDecorationLine: 'line-through',
                  }}>
                  {('en' == Language ? '€ ' : '') +
                    productSpecificites.prixAncien +
                    ('fr' == Language ? ' €' : '')}
                  /
                  {Product.unite
                    ? 'fr' == Language
                      ? Product.unite.valeur
                      : Product.unite.valeurEN
                    : ''}
                </Text>
              ) : (
                <></>
              )}
            </View>

            <View
              style={[
                styles.safeContainerStyle,
                {position: 'relative', zIndex: 1000},
              ]}>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                autoScroll
                iconStyle={styles.iconStyle}
                iconColor="#000"
                containerStyle={styles.containerStyle}
                itemContainerStyle={styles.itemStyle}
                itemTextStyle={{color: '#000', fontSize: 13}}
                labelField="label"
                valueField="value"
                value={StateValue}
                placeholder={t('etat')}
                searchPlaceholder="Search..."
                showsVerticalScrollIndicator={false}
                data={data}
                onChange={item => {
                  // handleQuantiteChange(product, item.value);
                  showDouaneMessage(item.value);
                  setStateValue(item.value);
                }}
              />
            </View>
            <View
              style={[
                styles.safeContainerStyle,
                {position: 'relative', zIndex: 10},
              ]}>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                autoScroll
                iconStyle={styles.iconStyle}
                iconColor="#000"
                containerStyle={styles.containerStyle}
                itemContainerStyle={styles.itemStyle}
                itemTextStyle={{color: '#000', fontSize: 13}}
                labelField="label"
                valueField="value"
                value={QuantitySelected}
                placeholder={t('Quantité')}
                searchPlaceholder="Search..."
                showsVerticalScrollIndicator={false}
                data={sweeterArray}
                onChange={item => {
                  // handleQuantiteChange(product, item.value);
                  setQuantitySelected(item.value);
                }}
              />
            </View>

            <View
              style={[
                styles.inputContainer,
                {position: 'relative', zIndex: -10, flexDirection: 'row'},
              ]}>
              <CurrencyInput
                value={productValue.toString()}
                placeholder={t('valeur') + ' (€)'}
                placeholderTextColor={'#000'}
                suffix={'€'}
                delimiter={Language == 'fr' ? ' ' : ','}
                precision={2}
                separator={Language == 'fr' ? ',' : '.'}
                // separator={"."}
                style={{color: '#000', paddingLeft: 15}}
              />
              <TextInput
                value={productValue.toString()}
                maxLength={6}
                onChangeText={setProductValue}
                keyboardType="numbers-and-punctuation"
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: '100%',
                  color: 'transparent',
                  backgroundColor: 'transparent',
                  paddingHorizontal: 15,
                }}
              />
            </View>
            <View
              style={{
                marginTop: 8,
                width: windowWidth * 0.46,
                position: 'relative',
                zIndex: -10,
              }}>
              <TouchableOpacity
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 22,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  backgroundColor: 'transparent',
                  borderWidth: 1,
                  borderColor: '#4E8FDA',
                  color: '#4E8FDA',
                  borderRadius: 25,
                }}
                onPress={toggleModal}>
                <View>
                  <FontAwesome5 name="camera" size={15} color="#4E8FDA" />
                </View>
                <Text
                  style={{
                    fontFamily: 'Poppins-Medium',
                    fontSize: 12,
                    color: '#4E8FDA',
                  }}>
                  {t('prendre photo')}
                </Text>
                {
                  <View>
                    <Modal
                      isVisible={isModalVisible}
                      backdropOpacity={0.4}
                      animationIn={'fadeInUp'}
                      animationInTiming={600}
                      animationOut={'fadeOutDown'}
                      animationOutTiming={600}
                      useNativeDriver={true}>
                      <View style={styles.ModalContainer}>
                        <View style={styles.buttonsContainer}>
                          <TouchableOpacity
                            style={{
                              paddingVertical: 8,
                              width: '100%',
                              paddingHorizontal: 22,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 10,
                              backgroundColor: 'transparent',
                              borderWidth: 1,
                              borderColor: '#4E8FDA',
                              color: '#4E8FDA',
                              borderRadius: 25,
                            }}
                            onPress={() => {
                              selectImageFromGallery();
                            }}>
                            <FontAwesome5
                              name="image"
                              size={20}
                              color="#4E8FDA"
                            />
                            <Text
                              style={{
                                fontFamily: 'Poppins-Medium',
                                fontSize: 12,
                                color: '#4E8FDA',
                              }}>
                              {t('Choisir une image dans la galerie')}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{
                              paddingVertical: 8,
                              width: '100%',
                              paddingHorizontal: 22,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 10,
                              backgroundColor: 'transparent',
                              borderWidth: 1,
                              borderColor: '#4E8FDA',
                              color: '#4E8FDA',
                              borderRadius: 25,
                            }}
                            onPress={() => {
                              openCameraForPicture();
                            }}>
                            <FontAwesome5
                              name="camera"
                              size={20}
                              color="#4E8FDA"
                            />
                            <Text
                              style={{
                                fontFamily: 'Poppins-Medium',
                                fontSize: 12,
                                color: '#4E8FDA',
                              }}>
                              {t('Ouvrir la caméra')}
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                          style={styles.cancelButton}
                          onPress={toggleModal}>
                          <Feather name="x" color={'#000'} size={20} />
                        </TouchableOpacity>
                      </View>
                    </Modal>
                  </View>
                }
              </TouchableOpacity>
            </View>

            <View
              style={{
                marginTop: 8,
                width: windowWidth * 0.46,
                position: 'relative',
                zIndex: -10,
              }}>
              <Button
                title={t('ajouter au panier')}
                navigation={() => handleCartLogin()}
              />
            </View>
          </View>
        </View>
      </View>
    </>
  );
};

// define your styles
const styles = StyleSheet.create({
  DetailsContainer: {
    backgroundColor: '#F4F6F8',
    width: windowWidth * 0.95,
    height: windowHeight * 0.5,
    marginTop: windowHeight * 0.03,
    borderRadius: 28,
    elevation: 1,
  },
  safeContainerStyle: {
    justifyContent: 'center',
    // backgroundColor: 'tomato',
    width: windowWidth * 0.46,
    // borderRadius:0
    marginTop: 5,
  },
  upperRow: {
    // backgroundColor: 'green',
    flexDirection: 'row',
    height: windowHeight * 0.1,
    width: windowWidth * 0.95,
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: windowHeight * 0.03,
  },
  detailTextContainer: {
    flexDirection: 'row',
    // backgroundColor: 'tomato',
    height: windowHeight * 0.08,
    width: windowWidth * 0.8,
    alignItems: 'flex-start',
    justifyContent: 'space-around',
  },
  detailNameText: {
    color: '#000',
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    // backgroundColor: 'tomato',
    margin: 2,
    marginLeft: '10%',
    width: windowWidth * 0.6,
  },
  discountPriceText: {
    color: '#000',
    fontFamily: 'Roboto-Regular',
    fontSize: 13,
    // backgroundColor: 'tomato',
    margin: 2,
  },
  priceText: {
    color: '#000',
    fontFamily: 'Roboto-Regular',
    fontSize: 13,
    textDecorationLine: 'line-through',
    // backgroundColor: 'tomato',
    margin: 2,
  },

  counterTExt: {
    fontSize: 30,
    color: '#000',
  },
  counterButton: {
    width: 50,
    height: 50,
    borderRadius: 100,
    backgroundColor: '#DFE8F2',
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonText: {
    color: '#A1B0C1',
    fontSize: 20,
  },
  downRow: {
    // backgroundColor: 'tomato',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: windowWidth * 0.9,
    height: windowHeight * 0.35,
    alignSelf: 'center',
  },
  dropDowncontainer: {
    // backgroundColor: 'tomato',
    width: windowWidth * 0.4,
    height: windowHeight * 0.3,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  imageSwiper: {
    // backgroundColor: 'gold',
    width: windowWidth * 0.32,
    height: windowHeight * 0.25,
    borderRadius: 10,
  },
  imageSwipergGrid: {
    // backgroundColor: 'gold',
    width: windowWidth * 0.12,
    height: windowHeight * 0.15,
    borderRadius: 10,
  },
  dotStyle: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: windowHeight * 0.06,
    alignSelf: 'center',
    justifyContent: 'space-around',
    // backgroundColor: 'tomato',
    width: windowWidth * 0.1,
    color: 'dodgeblue',
  },
  pagingText: {
    color: '#888',
    fontSize: 16,
    opacity: 0.1,
  },
  pagingActiveText: {
    color: '#14213D',
    fontSize: 16,
  },
  dropDownscontainer: {
    // backgroundColor: 'green',
    width: windowWidth * 0.4,
    height: windowHeight * 0.33,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  inputContainer: {
    backgroundColor: '#F5F5F5',
    width: windowWidth * 0.46,
    height: 40,
    borderRadius: 10,
    marginTop: 8,
  },
  inputStyle: {
    padding: 10,
    color: '#000',
    fontFamily: 'Roboto-Regular',
    marginLeft: 10,
    fontSize: 14,
  },
  buttonContainers: {
    backgroundColor: '#3292E0',
    height: windowHeight * 0.04,
    width: windowWidth * 0.45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  buttonUploadContainers: {
    backgroundColor: '#1A6CAF',
    height: windowHeight * 0.04,
    width: windowWidth * 0.45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    // marginTop:10
  },
  buttonCartContainers: {
    backgroundColor: '#3292E0',
    height: windowHeight * 0.04,
    width: windowWidth * 0.4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  buttonText: {
    fontSize: 11,
    color: '#fff',
    fontFamily: 'Roboto-Regular',
    // backgroundColor: 'tomato',
    width: windowWidth * 0.4,
    textAlign: 'center',
  },
  dropdown: {
    height: 45,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
  },
  placeholderStyle: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    color: '#14213D',
  },
  selectedTextStyle: {
    fontSize: 13,
    fontFamily: 'Roboto-Regular',
    color: '#14213D',
  },
  iconStyle: {
    width: 22,
    height: 22,
    color: '#000',
  },
  containerStyle: {
    backgroundColor: '#F5F5F5',
    borderTopEndRadius: 0,
    borderTopStartRadius: 0,
    borderbottomEndRadius: 8,
    borderbottomStartRadius: 8,
    elevation: 0,
    maxHeight: 110,
  },
  ModalContainer: {
    width: windowWidth * 1.0,
    height: windowHeight * 0.3,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignSelf: 'center',
    alignItems: 'center',
    paddingTop: 20,
    // justifyContent: 'space-around',
    bottom: 0,
    position: 'absolute',
  },
  cameraGallerybuttons: {
    backgroundColor: '#1A6CAF',
    height: 50,
    width: windowWidth * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    position: 'absolute',
    top: 10,
    right: 10,
  },
  uploadContainer: {
    // backgroundColor: 'tomato',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  uploadText: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  uploadSubText: {
    color: '#cccccc',
    textAlign: 'center',
    fontFamily: 'Roboto-Regular',
  },
  itemStyle: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginVertical: -windowWidth * 0.02,
    marginHorizontal: 0,
    borderBottomWidth: 0,
    borderColor: 'transparent',
  },
  buttonsContainer: {
    // backgroundColor: 'tomato',
    width: windowWidth * 0.7,
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
    marginTop: 50,
  },
  bottomTextContainer: {
    // backgroundColor: 'gold',
    width: windowWidth * 0.9,
    height: windowHeight * 0.1,
    alignSelf: 'center',
  },
  bottomText: {
    fontFamily: 'Roboto-Regular',
    color: '#BCB8B1',
    fontSize: 14,
    margin: 10,
  },
  commentInput: {
    // backgroundColor: 'tomato',
    alignSelf: 'center',
    width: windowWidth * 0.85,
    height: windowHeight * 0.1,
    textAlignVertical: 'top',
    color: '#000',
    fontFamily: 'Roboto-Regular',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
});

//make this component available to the app
export default ByPlaneDetailsComponent;
