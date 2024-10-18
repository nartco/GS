//import liraries
import React, {useEffect, useRef, useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  TextInput,
  ToastAndroid,
  Alert,
  Keyboard,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Modal from 'react-native-modal';
import {useTranslation} from 'react-i18next';
import Toast from 'react-native-toast-message';
import {
  removePanier,
  getPanier,
  savePanier,
  getCommand,
  removeCommand,
  saveSelectedCountryProduct,
  saveSelectedServiceProduct,
} from '../../modules/GestionStorage';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Button from '../../components/Button';
import auth from '@react-native-firebase/auth';

import {onAuthStateChanged} from 'firebase/auth';
import {useBag} from '../../modules/BagContext';
import Feather from 'react-native-vector-icons/Feather';
import {afficherMessageProduitServiceDifferent} from '../../modules/RegleGestion';
import CurrencyInput from 'react-native-currency-input';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

import {ImageGallery} from '@georstat/react-native-image-gallery';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

// create a component
const BuyingDemandDetailComponent = props => {
  const {setBagCount, bagCount} = useBag();
  const [productValue, setProductValue] = useState(null);
  // Donnée statique
  const Navigation = props.navigation;
  const Service = props.service;
  const PaysLivraison = props.paysLivraison;
  const Language = props.language;
  const ServiceSelected = props.selectedService;
  const Product = props.data;
  const Images = Product.productImages;

  const productSpecificites = Product.productSpecificites
    ? Product.productSpecificites[0]
    : null;

  const douane = productSpecificites ? productSpecificites.douane : null;

  const livraison = productSpecificites ? productSpecificites.livraison : null;

  const expedition = productSpecificites
    ? productSpecificites.expedition
    : null;

  const quantiteMax = productSpecificites
    ? productSpecificites.quantiteMax
    : 400;

  // Translation
  const {t, i18n} = useTranslation();

  // Donnée dynamique
  const [active, setActive] = useState(0);
  const [userImage, setUserImage] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [selectedProductValues, setSelectedProductValues] = useState({});
  const [descriptionModalVisible, setDescriptionModalVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [StateValue, setStateValue] = useState(null);
  const [user, setUser] = useState([]);
  const [urlValue, setUrlValue] = useState('');
  const [infoComple, setInfoComple] = useState('');
  const isCarousel = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpenModal, setIsOpenModal] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const openGallery = () => setIsOpen(true);
  const closeGallery = () => setIsOpen(false);
  // Quantité
  const arrayOFF = Array.from(Array(quantiteMax).keys());

  const sweeterArray = arrayOFF.map(arrayOFF => {
    return {label: arrayOFF + 1, value: arrayOFF + 1};
  });

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setIsKeyboardOpen(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardOpen(false);
      },
    );

    const requestCameraPermission = async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app requires access to your camera to take photos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        } else {
        }
      } catch (err) {
        console.warn(err);
      }
    };
    requestCameraPermission();
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    const currentUser = auth().currentUser;
    setUser(currentUser);
  }, []);

  // Scroll
  const Change = nativeEvent => {
    const slide = Math.ceil(
      nativeEvent.contentOffset.x / nativeEvent.layoutMeasurement.width,
    );
    if (slide !== active) {
      setActive(slide);
    }
  };

  // Modal
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleModalOpen = () => {
    setDescriptionModalVisible(true);
  };

  const handleModalClose = () => {
    setDescriptionModalVisible(false);
  };

  const handleModalSave = () => {
    handleModalClose();
  };

  // Choix attribut
  const handleAttributeChange = (product, attributeId, value) => {
    const newSelectedAttributes = {...selectedAttributes, [attributeId]: value};
    setSelectedAttributes(newSelectedAttributes);

    if (!selectedProductValues[product.id]) {
      selectedProductValues[product.id] = {};
    }

    if (!selectedProductValues[product.id]['attributes']) {
      selectedProductValues[product.id]['attributes'] = {};
    }

    selectedProductValues[product.id]['attributes'][attributeId] = value;
    setSelectedProductValues(selectedProductValues);

    setSelectedProduct(product);
  };

  // Quantité
  const handleQuantiteChange = (product, quantite) => {
    let productId = product.id;

    setSelectedProduct(product);

    if (!selectedProductValues[product.id]) {
      selectedProductValues[product.id] = {quantite: {}};
    }

    if (!selectedProductValues[product.id]) {
      selectedProductValues[product.id] = {};
    }

    if (!selectedProductValues[product.id]['quantite']) {
      selectedProductValues[product.id]['quantite'] = {};
    }

    selectedProductValues[productId]['quantite'] = quantite;

    setSelectedProductValues(selectedProductValues);
  };

  // Info supplementaire
  const handleInfosChange = (product, infos) => {
    let productId = product.id;

    setSelectedProduct(product);

    if (!selectedProductValues[product.id]) {
      selectedProductValues[product.id] = {infos: {}};
    }

    if (!selectedProductValues[product.id]) {
      selectedProductValues[product.id] = {};
    }

    if (!selectedProductValues[product.id]['infos']) {
      selectedProductValues[product.id]['infos'] = {};
    }

    selectedProductValues[productId]['infos'] = infos;

    setSelectedProductValues(selectedProductValues);
  };

  // URL
  const handleURLChange = (product, url) => {
    let productId = product.id;

    setSelectedProduct(product);

    if (!selectedProductValues[product.id]) {
      selectedProductValues[product.id] = {};
    }

    if (!selectedProductValues[product.id]['url']) {
      selectedProductValues[product.id]['url'] = {};
    }

    selectedProductValues[productId]['url'] = url;

    setSelectedProductValues(selectedProductValues);
  };

  // Prix d'achat
  const handleAchatChange = (product, prixAchat) => {
    let productId = product.id;

    setSelectedProduct(product);

    if (!selectedProductValues[product.id]) {
      selectedProductValues[product.id] = {};
    }

    if (!selectedProductValues[product.id]['prix']) {
      selectedProductValues[product.id]['prix'] = {};
    }

    selectedProductValues[productId]['prix'] = prixAchat;

    setSelectedProductValues(selectedProductValues);
  };
  const IOSPLAt = Platform.OS;

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

  const openCameraForPicture = () => {
    let options = {
      width: 300,
      height: 400,
      storageOptions: {
        path: 'image',
      },
    };
    launchCamera(options, response => {
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

  // Gestion panier
  const handleCartLogin = async product => {
    // let productValues = selectedProductValues[product.id];
    let quantite = StateValue;

    let url = urlValue;

    let prixAchat = productValue;

    if (!quantite) {
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
    if (!url) {
      if (IOSPLAt == 'ios') {
        Toast.show({
          type: 'error',
          text1: t('URL'),
          text2: t('Le nom du produit est obligatoire !'),
        });
      } else {
        ToastAndroid.show(
          t('Le nom du produit est obligatoire !'),
          ToastAndroid.SHORT,
        );
      }

      return;
    }

    try {
      let basketData = await getPanier();

      let cartHasProductFromAnotherService = false;

      basketData.map(ls => {
        if (ls.Service != Service || ls.paysLivraison.id != PaysLivraison.id) {
          cartHasProductFromAnotherService = true;
        }
      });
      let BasketCommand = await getCommand();

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
                handleCartRemove(product);
                return;
              },
            },
          ],
        );
      }
      let isProductFromDifferentService =
        await afficherMessageProduitServiceDifferent(Service, PaysLivraison);

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
                handleCartRemove(product);
                return;
              },
            },
          ],
        );
      }
      await removeCommand();
      let reponse = handleCart(product);
      console.log('xxxxx');
      reponse.then(() => {
        if (isSuccess) {
          // Not Login
          if (user === null) {
            Navigation.navigate('Login', {fromCart: 'cart'});
            return; //should never reach
          }
        }
      });
    } catch (e) {}
  };

  const handleCartRemove = async product => {
    await removePanier();
    await removeCommand();

    let reponse = handleCart(product);

    reponse.then(() => {
      if (isSuccess) {
        // Not Login
        if (!user?.uid) {
          Navigation.navigate('Login', {fromCart: 'cart'});
          return; //should never reach
        }
      }
    });
  };

  const handleCart = async product => {
    await saveSelectedCountryProduct(PaysLivraison);
    await saveSelectedServiceProduct(ServiceSelected);
    let CatProducts = [];

    let selectedValues = selectedProductValues[product.id];

    let prix = selectedValues ? selectedValues['prix'] : 0;
    let url = selectedValues ? selectedValues['url'] : null;
    let infos = selectedValues ? selectedValues['infos'] : null;
    let quantite = StateValue;
    let attributes = selectedValues ? selectedValues['attributes'] : {};

    const obj = {
      ID: (Math.random() + 1).toString(36).substring(7),
      product: product,
      ProductId: product.id,
      discount: product.discount,
      ProductImage: product.productImages,
      quantiteMax: quantiteMax,
      quantite: quantite,
      service: Service,
      image: userImage,
      paysLivraison: PaysLivraison,
      Price: prix,
      attributes: attributes,
      url: url,
      informationsComplementaires: infos,
    };

    CatProducts.push(obj);

    let basketData = await getPanier();

    if (basketData.length == 0) {
      await savePanier(CatProducts);

      await savePanier(CatProducts);
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

      setBagCount(prev => prev + 1);

      return true;
    }

    basketData.push(obj);

    await savePanier(basketData);

    // await savePanier(CatProducts);
    if (IOSPLAt == 'ios') {
      Toast.show({
        type: 'success',
        text1: t('Succès'),
        text2: t('Ajouter au panier avec succès'),
      });
    } else {
      ToastAndroid.show(t('Ajouter au panier avec succès'), ToastAndroid.SHORT);
    }
    setBagCount(prev => prev + 1);

    return true;
  };

  const formatCurrency = value => {
    // Ensure the input is numeric and remove any non-digit characters
    const numericValue = parseFloat((value || '').replace(/[^0-9]/g, ''));

    // Check if the numericValue is NaN or not a finite number
    if (isNaN(numericValue) || !isFinite(numericValue)) {
      return ''; // Return an empty string if not a valid numeric value
    }
    // Format the numeric value as currency with 2 decimal places and € symbol
    const formattedValue = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: numericValue % 1 !== 0 ? 2 : 0, // Minimum fraction digits (can be set to 2 for always showing 2 decimals)
      maximumFractionDigits: 2, // Maximum fraction digits
    }).format(numericValue / 100); // Assuming the input is in cents

    return formattedValue ? formattedValue : '';
  };
  // const handlePriceChange = (text) => {
  //   // Remove non-numeric characters from the input
  //   const numericValue = text.replace(/[^0-9.]/g, '');

  //   // Format the numeric value as a currency
  //   const formattedPrice = new Intl.NumberFormat('en-US', {
  //     style: 'currency',
  //     currency: 'USD', // Change this to your desired currency code
  //   }).format(parseFloat(numericValue));

  //   setProductValue(formattedPrice);
  // };

  const handleAmountChange = input => {
    // Remove non-numeric characters
    const numericInput = input.replace(/[^0-9]/g, '');

    // Ensure at least two characters for cents
    const cents = numericInput.slice(-2).padStart(2, '0');

    // Get the dollars (excluding cents)
    const dollars = numericInput.slice(0, -2) || '0';

    // Format the input as dollars and cents
    const formattedAmount = `${dollars}.${cents}`;

    setProductValue(formattedAmount);
  };

  const handleValueChange = value => {
    // Your custom logic here
    setProductValue(value);
  };

  const RenderQuantite = props => {
    // const StateValue = selectedProductValues[props.product.id] ? selectedProductValues[props.product.id]['quantite'] : null;

    return (
      <View style={[styles.inputContainer, {marginTop: 10}]}>
        <TextInput
          placeholder={t('Quantity')}
          keyboardType="numeric"
          placeholderTextColor={'#14213D'}
          value={StateValue}
          style={styles.inputStyle}
          onChangeText={text => {
            setStateValue(text);
          }}
        />
      </View>
    );
  };
  const [currentImageIndex, setCurrentImageIndex] = useState({});

  const openImageView = (productIndex, imageIndex) => {
    setIsOpenModal(prev => ({...prev, [productIndex]: true}));
    setCurrentImageIndex(prev => ({...prev, [productIndex]: imageIndex}));
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
        onPress={openGallery}>
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
  return (
    <View style={{backgroundColor: '#fff', margin: 5}}>
      <View
        style={{
          paddingTop: 25,
          paddingBottom: 12,
          borderRadius: 12,
          paddingHorizontal: 12,
        }}>
        <Text
          style={{
            fontFamily: 'Poppins-Medium',
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
            containerStyle={{
              position: 'absolute',
              bottom: 20,
              width: windowWidth * 0.3,
              alignSelf: 'center',
            }}
            dotColor={'rgba(255, 255, 255, 0.92)'}
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
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}>
          <View style={styles.inputContainer}>
            <TextInput
              key={'url' + Product.id}
              placeholder={t('Nom du produit')}
              keyboardType="ascii-capable"
              placeholderTextColor={'#14213D'}
              style={styles.inputStyle}
              value={urlValue}
              onChangeText={text => {
                handleURLChange(Product, text);
                setUrlValue(text);
              }}
            />
          </View>

          <View style={styles.dropDownscontainer}>
            {Product.attributs.map((attribute, index) => {
              const product = Product;
              let prevChoice = selectedProductValues[product.id];

              prevChoice = prevChoice ? prevChoice['attributes'] : null;
              const selectedValue = prevChoice
                ? prevChoice[attribute.attribut.id]
                : null;

              return (
                <View key={index} style={styles.inputContainer}>
                  <TextInput
                    key={attribute.id}
                    placeholder={attribute.attribut.name}
                    keyboardType="ascii-capable"
                    placeholderTextColor={'#14213D'}
                    style={styles.inputStyle}
                    value={selectedValue}
                    onChangeText={text => {
                      handleAttributeChange(
                        product,
                        attribute.attribut.name,
                        text,
                      );
                    }}
                  />
                </View>
              );
            })}

            <View style={[styles.inputContainer, {marginTop: 10}]}>
              <TextInput
                placeholder={t('quantité')}
                keyboardType="ascii-capable"
                placeholderTextColor={'#14213D'}
                value={StateValue}
                style={styles.inputStyle}
                onChangeText={text => {
                  setStateValue(text);
                }}
              />
            </View>

            <View
              style={[
                styles.inputContainer,
                {marginTop: 10, flexDirection: 'row'},
              ]}>
              <CurrencyInput
                value={productValue}
                placeholder={t("Prix d'achat total") + ' (€)'}
                placeholderTextColor={'#000'}
                suffix={Language == 'fr' ? '€' : ''}
                prefix={Language == 'fr' ? '' : '€'}
                delimiter={Language == 'fr' ? ' ' : ','}
                precision={2}
                separator={Language == 'fr' ? ',' : '.'}
                style={{color: '#000', paddingLeft: 15}}
              />
              <TextInput
                value={productValue}
                onChangeText={text => {
                  handleAchatChange(Product, text);
                  setProductValue(text);
                }}
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
                marginTop: 12,
                width: '100%',
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
                width: '100%',
                position: 'relative',
                zIndex: -10,
              }}>
              <Button
                title={t('ajouter au panier')}
                navigation={() => {
                  handleCartLogin(Product);
                }}
              />
            </View>
          </View>

          <View style={styles.bottomTextContainer}>
            <TouchableOpacity onPress={handleModalOpen}>
              <Text
                style={
                  infoComple == ''
                    ? {color: '#BCB8B1', marginRight: 20}
                    : {color: '#000', marginRight: 20}
                }>
                {infoComple == ''
                  ? t('informations complémentaires')
                  : infoComple}
              </Text>
            </TouchableOpacity>
          </View>

          <Modal
            isVisible={descriptionModalVisible}
            animationInTiming={1}
            animationOutTiming={1}
            useNativeDriver={true}>
            <View style={styles.ModalInfosContainer}>
              <View
                style={[
                  isKeyboardOpen && Platform.OS == 'android'
                    ? {marginTop: windowHeight * 0.5}
                    : {marginTop: windowHeight * 0.25},
                  isKeyboardOpen && Platform.OS == 'ios'
                    ? {marginBottom: windowHeight * 0.4}
                    : {marginBottom: windowHeight * 0.025},
                  styles.infosComplementaires,
                ]}>
                <TextInput
                  style={styles.modalInput}
                  placeholderTextColor={'#6666'}
                  placeholder={t('informations complémentaires')}
                  value={
                    selectedProductValues[Product.id]
                      ? selectedProductValues[Product.id]['infos']
                      : infoComple
                  }
                  onChangeText={text => {
                    handleInfosChange(Product, text);
                    setInfoComple(text);
                  }}
                  multiline
                />
              </View>
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#ff726f',
                    height: 50,
                    width: windowWidth * 0.8,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 10,
                  }}
                  onPress={handleModalSave}>
                  <Text style={styles.buttonText}>{t('OK')}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.cancelButtonModal}
                onPress={() => handleModalClose()}>
                <Feather name="x" color="#000" size={30} />
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
      </View>
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  DetailsContainer: {
    backgroundColor: '#F4F6F8',
    width: windowWidth * 0.95,
    height: windowHeight * 0.6,
    marginTop: windowHeight * 0.03,
    borderRadius: 28,
    elevation: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalInput: {
    height: 200,
    width: '100%',
    borderColor: 'gray',
    color: '#000',
    borderWidth: 1,
    padding: 10,
    textAlignVertical: 'top',
  },
  modalButtonContainer: {
    marginTop: 10,
    width: '50%',
  },

  safeContainerStyle: {
    justifyContent: 'center',
    // backgroundColor: 'tomato',
    // marginTop: 10,
    width: windowWidth * 0.48,
    // borderRadius:0
  },
  cancelButtonModal: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    position: 'absolute',
    top: windowWidth * 0.1,
    right: windowWidth * 0.05,
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
    // backgroundColor: 'green',
    width: windowWidth * 0.4,
    height: windowHeight * 0.33,
  },
  imageSwiper: {
    // backgroundColor: 'gold',
    width: windowWidth * 0.32,
    height: windowHeight * 0.25,
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
    width: windowWidth * 0.48,
    alignItems: 'center',
    marginBottom: 15,
  },
  inputContainer: {
    backgroundColor: '#F5F5F5',
    width: windowWidth * 0.48,
    height: 50,
    borderRadius: 10,
    marginBottom: 10,
  },
  inputStyle: {
    padding: 10,
    paddingTop: 15,
    color: '#14213D',
    fontFamily: 'Roboto-Regular',
    marginLeft: 10,
    fontSize: 16,
  },
  buttonContainers: {
    backgroundColor: '#1A6CAF',
    height: windowHeight * 0.04,
    width: windowWidth * 0.45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
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
    fontSize: 10,
    color: '#fff',
    fontFamily: 'Roboto-Regular',
  },
  dropdown: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 17,
    backgroundColor: '#d5d6d7',
    elevation: 1,
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
  containerStyle: {
    backgroundColor: '#d5d6d7',
    borderRadius: 8,
    maxHeight: 100,
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
  ModalInfosContainer: {
    width: windowWidth * 1.0,
    height: windowHeight,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-around',
    bottom: -windowWidth * 0.05,
    position: 'absolute',
  },
  infosComplementaires: {
    alignItems: 'center',
    justifyContent: 'space-around',
    width: windowWidth * 0.8,
    // marginTop: windowHeight * 0.35,
    alignSelf: 'center',
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
    justifyContent: 'space-around',
    width: windowWidth * 0.8,
    height: 40,
    alignSelf: 'center',
  },
  uploadText: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
    fontFamily: 'Roboto-Bold',
  },
  uploadSubText: {
    color: '#cccccc',
    textAlign: 'center',
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
    flex: 1,
    width: windowWidth * 0.9,
    marginTop: 5,
  },
  bottomText: {
    fontFamily: 'Roboto-Regular',
    color: '#BCB8B1',
    fontSize: 14,
    margin: 10,
  },
  commentInput: {
    // backgroundColor: 'tomato',
    width: windowWidth * 0.5,
    color: '#000',
    fontFamily: 'Roboto-Regular',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
  },
});

//make this component available to the app
export default BuyingDemandDetailComponent;
