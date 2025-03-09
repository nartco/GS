import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import Toast from 'react-native-toast-message';
import React, {useEffect, useState, useCallback} from 'react';
import {HeaderEarth} from '../../components/Header';
import Feather from 'react-native-vector-icons/Feather';
import {useTranslation} from 'react-i18next';
import axiosInstance from '../../axiosInstance';
import {Dropdown} from 'react-native-element-dropdown';
import {
  getPlatformLanguage,
  getSelectedService,
  getSelectedCountry,
  getPanier,
  getCommand,
  savePanier,
  removeCommand,
  removePanier,
} from '../../modules/GestionStorage';
import Button from '../../components/Button';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import PhotoZoomer from '../../components/PhotoZoomer';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useBag} from '../../modules/BagContext';
import Modal from 'react-native-modal';

import CurrencyInput from 'react-native-currency-input';
import {useIsFocused} from '@react-navigation/native';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const Search = () => {
  var isFocused = useIsFocused();

  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const {t} = useTranslation();
  const [Language, setLanguage] = useState('fr');
  const [isSearching, setIsSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);

  const [StateValue, setStateValue] = useState(null);

  const [productValue, setProductValue] = useState(null);

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedProductValues, setSelectedProductValues] = useState({});
  const [descriptionModalVisible, setDescriptionModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [infoComple, setInfoComple] = useState('');

  const [countryServiceRequired, setCountryServiceRequired] = useState(true);
  const {setBagCount, bagCount} = useBag();

  useEffect(() => {
    let mounted = true;

    const checkServiceAndPaysLivraison = async () => {
      try {
        setIsLoading(true);
        const [selectedCountry, selectedService] = await Promise.all([
          getSelectedCountry(),
          getSelectedService(),
        ]);

        if (mounted) {
          setCountryServiceRequired(!selectedCountry || !selectedService);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking service and country:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkServiceAndPaysLivraison();

    return () => {
      mounted = false;
    };
  }, [isFocused]);

  useEffect(() => {
    const fetchData = async () => {
      if (!searchQuery.trim()) {
        setData([]);
        setNoResults(false);
        return;
      }

      setIsSearching(true);
      setNoResults(false);

      try {
        const currentLanguage = await getPlatformLanguage();
        setLanguage(currentLanguage);

        const apiUrl = `https://recette.godaregroup.com/api/search/products/${encodeURIComponent(
          searchQuery,
        )}`;
        const response = await axiosInstance.get(apiUrl);

        if (Array.isArray(response.data) && response.data.length > 0) {
          const processedData = response.data.map(product => {
            const productSpecificites = product.productSpecificites?.[0];
            const libelleService = productSpecificites
              ? currentLanguage === 'fr'
                ? productSpecificites.pays.service.nom
                : productSpecificites.pays.service.nomEN
              : product.service;
            return {...product, libelleService};
          });
          setData(processedData);
          setNoResults(false);
        } else {
          setData([]);
          setNoResults(true);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setData([]);
        setNoResults(true);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchData();
    }, 300); // Délai de 300ms pour éviter trop d'appels API

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const dataEtat = [
    {label: t('Neuf'), value: 'New'},
    {label: t('Usagé'), value: 'Used'},
  ];

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  // Choix image
  const selectImageFromGallery = () => {
    /*ImagePicker.openPicker({
      
    }).then(image => {
      setUserImage(image.path);

      ToastAndroid.show("Image ajoutée",ToastAndroid.SHORT)
      setModalVisible(!isModalVisible);
    });*/
  };

  // Prendre une photo ou selectionner une image
  const openCameraForPicture = () => {
    /*ImagePicker.openCamera({
      width: 300,
      height: 400,
      cropping: true,
    }).then(image => {
      setUserImage(image.path);

      ToastAndroid.show("Image ajoutée",ToastAndroid.SHORT)


      setModalVisible(!isModalVisible);
    });*/
  };

  // Info supplementaire

  const handleModalOpen = () => {
    setDescriptionModalVisible(true);
  };

  // URL

  // VALEUR

  // Etat

  const handleModalClose = () => {
    setDescriptionModalVisible(false);
  };

  const handleModalSave = () => {
    handleModalClose();
  };

  const handleChange = useCallback((product, field, value) => {
    setSelectedProductValues(prev => {
      const productValues = prev[product.id] || {};
      return {
        ...prev,
        [product.id]: {
          ...productValues,
          [field]:
            typeof value === 'object' && value !== null
              ? {...(productValues[field] || {}), ...value}
              : value,
        },
      };
    });
    setSelectedProduct(product);
  }, []);

  const handleVALEURChange = useCallback(
    (product, valeur) => {
      handleChange(product, 'valeur', valeur);
    },
    [handleChange],
  );

  const handleEtatChange = useCallback(
    (product, etat) => {
      handleChange(product, 'etat', etat);
    },
    [handleChange],
  );

  const handleAchatChange = useCallback(
    (product, prix) => {
      handleChange(product, 'prix', prix);
    },
    [handleChange],
  );

  const handleQuantitChange = useCallback(
    (product, value) => {
      handleChange(product, 'quantite', value);
    },
    [handleChange],
  );

  const handleInfosChange = useCallback(
    (product, infos) => {
      handleChange(product, 'infos', infos);
    },
    [handleChange],
  );

  const handleURLChange = useCallback(
    (product, url) => {
      handleChange(product, 'url', url);
    },
    [handleChange],
  );

  const handleAttributeChange = useCallback(
    (product, attributeId, value) => {
      handleChange(product, 'attributes', {[attributeId]: value});
    },
    [handleChange],
  );

  const RenderQuantiFretParAvionBateaux = useCallback(
    ({item}) => {
      const productSpecificites = item.productSpecificites?.[0];
      const quantiteMax = productSpecificites?.quantiteMax || 400;
      const sweeterArray = [...Array(quantiteMax)].map((_, index) => ({
        label: `${index + 1} ${item.unite?.valeur || ''}`,
        value: index + 1,
      }));

      return (
        <View style={styles.safeContainerStyle}>
          <TextInput
            placeholder={t('quantité')}
            keyboardType="numeric"
            placeholderTextColor={'#14213D'}
            value={selectedProductValues[item.id]?.quantite?.toString() || ''}
            style={styles.inputStyle}
            onChangeText={text => {
              handleQuantitChange(item, text);
            }}
          />
        </View>
      );
    },
    [selectedProductValues, t, handleQuantitChange],
  );

  const RenderPrix = ({item}) => {
    const productSpecificites = item.productSpecificites
      ? item.productSpecificites[0]
      : null;
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          marginTop: 8,
        }}>
        <Text
          style={{fontSize: 13, fontFamily: 'Poppins-Medium', color: '#000'}}>
          {productSpecificites ? productSpecificites.prix : 0}€/
          {item.unite ? item.unite.valeur : ''}
        </Text>
        {productSpecificites && productSpecificites.prixAncien ? (
          <Text
            style={{
              fontSize: 13,
              fontFamily: 'Poppins-Medium',
              color: '#000',
              textDecorationLine: 'line-through',
            }}>
            {productSpecificites.prixAncien}€/
            {item.unite ? item.unite.valeur : ''}
          </Text>
        ) : (
          <></>
        )}
      </View>
    );
  };

  const IOSPLAt = Platform.OS;

  const handleCartLogin = async product => {
    let quantite = selectedProductValues[product.id]?.quantite;
    let url = selectedProductValues[product.id]?.url;
    let prixAchat = selectedProductValues[product.id]?.prix;

    if (!quantite) {
      Toast.show({
        type: 'error',
        text1: t('Quantity'),
        text2: t('La quantité est obligatoire !'),
      });
      return;
    }

    if (product.service === 'demandes-d-achat' && !url) {
      Toast.show({
        type: 'error',
        text1: t('URL'),
        text2: t('Le nom du produit est obligatoire !'),
      });
      return;
    }
    try {
      let basketData = await getPanier();
      let BasketCommand = await getCommand();

      // Vérifiez si le panier contient des produits d'un autre service
      if (BasketCommand.length > 0 || basketData.length > 0) {
        Alert.alert(
          t('Information'),
          t(
            "Votre panier contient des produits d'un autre service. Voulez-vous le vider et ajouter ce produit ?",
          ),
          [
            {text: t('Non'), style: 'cancel'},
            {
              text: t('Oui'),
              onPress: async () => {
                setBagCount(0);
                await removePanier();
                await removeCommand();
                await handleCart(product);
              },
            },
          ],
        );
      } else {
        await handleCart(product);
      }
    } catch (e) {
      console.error("Erreur lors de l'ajout au panier:", e);
      Toast.show({
        type: 'error',
        text1: t('Erreur'),
        text2: t("Une erreur est survenue lors de l'ajout au panier"),
      });
    }
  };

  const handleCart = async product => {
    const productValues = selectedProductValues[product.id];
    const cartItem = {
      ID: Math.random().toString(36).substr(2, 9),
      product: product,
      quantite: productValues.quantite,
      service: product.service,
      paysLivraison: product.productSpecificites[0]?.pays,
      Price: productValues.prix || product.productSpecificites[0]?.prix,
      attributes: productValues.attributes,
      url: productValues.url,
      etat: productValues.etat,
      valeur: productValues.valeur,
      informationsComplementaires: productValues.infos,
    };

    let basketData = await getPanier();
    basketData.push(cartItem);
    await savePanier(basketData);

    Toast.show({
      type: 'success',
      text1: t('Succès'),
      text2: t('Produit ajouté au panier avec succès'),
    });

    // Mettez à jour le compteur du panier
    setBagCount(prevCount => prevCount + 1);
  };
  const RenderItemAvionBateau = ({item}) => {
    return (
      <View style={{backgroundColor: '#fff', margin: 5}} key={item.id}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingVertical: 12,
            paddingLeft: 22,
          }}>
          <View>
            <ScrollView
              pagingEnabled
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imageSwiper}>
              {item.productImages.map((image, index) => (
                <PhotoZoomer
                  key={index}
                  image={image}
                  windowWidth={wp(29)}
                  windowHeight={hp(40)}
                />
              ))}
            </ScrollView>
            {/* <Image source={{ uri: item.productIma.url}} style={{width: windowWidth * 0.5, height: windowHeight * 0.5}}/> */}
          </View>

          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
            }}>
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 12,
                justifyContent: 'center',
                alignItems: 'center',
                maxWidth: 250,
              }}>
              <Text
                style={{
                  fontFamily: 'Poppins-Medium',
                  fontSize: 12.5,
                  textAlign: 'center',
                  maxWidth: 180,
                  color: '#666',
                }}>
                {item.libelleService} -{' '}
                {'fr' == Language ? item.name : item.nameEN}
              </Text>
            </View>

            <RenderPrix item={item} />

            <View style={styles.safeContainerStyle}>
              <Dropdown
                data={dataEtat}
                value={selectedProductValues[item.id]?.etat || null}
                placeholder={t('etat')}
                maxHeight={100}
                autoScroll
                style={styles.dropdown}
                iconStyle={styles.iconStyle}
                containerStyle={styles.containerStyle}
                labelField="label"
                valueField="value"
                showsVerticalScrollIndicator={false}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                onChange={text => {
                  // showDouaneMessage(item.value);
                  handleEtatChange(item, text.value);
                }}
              />
            </View>

            <RenderQuantiFretParAvionBateaux item={item} />

            <View
              style={[
                styles.inputContainer,
                {position: 'relative', zIndex: -10},
              ]}>
              {/* <TextInput
                    placeholder={t('valeur')}
                    keyboardType="numeric"
                    placeholderTextColor={'#14213D'}
                    style={styles.inputStyle}
                    value={productValue}
                    onChangeText={text => handleVALEURChange(item, text)}
                  /> */}
              <CurrencyInput
                value={
                  selectedProductValues[item.id]?.valeur *
                    selectedProductValues[item.id]?.quantite ||
                  item?.productSpecificites[0]?.prix *
                    selectedProductValues[item.id]?.quantite ||
                  null
                }
                style={styles.inputStyle}
                onChangeValue={text => {
                  handleVALEURChange(item, text);
                }}
                disabled={true}
                placeholder={t('valeur')}
                placeholderTextColor={'#000'}
                suffix={'.00 €'}
                delimiter=","
                precision={0}
                separator="."
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
                          <Feather name="x" size={20} />
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
                navigation={() => {
                  handleCartLogin(item);
                }}
              />
            </View>
          </View>
        </View>
      </View>
    );
  };

  const RenderItemDemande = ({item}) => {
    return (
      <View style={{backgroundColor: '#fff', margin: 5}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingVertical: 12,
            paddingLeft: 22,
          }}>
          <View></View>
          <View style={{width: wp(29)}}></View>
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
            }}>
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 12,
                justifyContent: 'center',
                alignItems: 'center',
                maxWidth: 250,
              }}>
              <Text
                style={{
                  fontFamily: 'Poppins-Medium',
                  fontSize: 12.5,
                  textAlign: 'center',
                  maxWidth: 180,
                }}>
                {item.libelleService} -{' '}
                {'fr' == Language ? item.name : item.nameEN}
              </Text>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                key={'url' + item.id}
                placeholder="URL"
                keyboardType="ascii-capable"
                placeholderTextColor={'#14213D'}
                style={styles.inputStyle}
                value={selectedProductValues[item.id]?.url || ''}
                onChangeText={text => {
                  handleURLChange(item, text);
                }}
              />
            </View>

            <View style={styles.dropDownscontainer}>
              {item.attributs.map(attribute => {
                const product = item;
                let prevChoice = selectedProductValues[product.id];

                prevChoice = prevChoice ? prevChoice['attributes'] : null;
                const selectedValue = prevChoice
                  ? prevChoice[attribute.attribut.id]
                  : null;

                return (
                  <View style={styles.inputContainer}>
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
                  keyboardType="numeric"
                  placeholderTextColor={'#14213D'}
                  value={StateValue}
                  style={styles.inputStyle}
                  onChangeText={text => {
                    setStateValue(text);
                  }}
                />
              </View>

              <View style={[styles.inputContainer, {marginTop: 10}]}>
                <TextInput
                  placeholder={t('prix achat')}
                  keyboardType="numeric"
                  placeholderTextColor={'#14213D'}
                  style={styles.inputStyle}
                  value={selectedProductValues[item.id]?.prix?.toString() || ''}
                  onChangeText={text => {
                    handleAchatChange(item, text);
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
                            <Feather name="x" size={20} />
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
                  width: windowWidth * 0.42,
                  position: 'relative',
                  zIndex: -10,
                }}>
                <Button
                  title={t('ajouter au panier')}
                  navigation={() => {
                    handleCartLogin(productValue);
                  }}
                />
              </View>
              {/* <TouchableOpacity style={styles.buttonCartContainers}>
                 <Text style={styles.buttonText} onPress={() => { handleCartLogin(Product);}}>{t('Ajouter au panier')}</Text>
              </TouchableOpacity> */}
            </View>

            <View style={styles.bottomTextContainer}>
              <TextInput
                placeholder={t('informations complémentaires')}
                placeholderTextColor={'#BCB8B1'}
                multiline={true}
                style={{
                  fontSize: 12,
                  fontFamily: 'Poppins-Regular',
                  width: windowWidth * 0.55,
                  borderRadius: 8,
                  paddingVertical: 5,
                  paddingLeft: 12,
                }}
                value={selectedProductValues[item.id]?.infos || ''}
                onChangeText={text => {
                  handleInfosChange(item, text);
                  setInfoComple(text);
                }}
                onFocus={handleModalOpen}
              />
            </View>

            <Modal
              isVisible={descriptionModalVisible}
              backdropOpacity={0.4}
              animationIn={'fadeInUp'}
              animationInTiming={600}
              animationOut={'fadeOutDown'}
              animationOutTiming={600}
              useNativeDriver={true}>
              <View style={styles.ModalInfosContainer}>
                <View style={styles.infosComplementaires}>
                  <TextInput
                    style={styles.modalInput}
                    placeholder={t('Informations complémentaires')}
                    value={
                      selectedProductValues[item.id]
                        ? selectedProductValues[item.id]['infos']
                        : infoComple
                    }
                    onChangeText={text => {
                      handleInfosChange(item, text);
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
              </View>
            </Modal>
          </View>
        </View>
      </View>
    );
  };

  const renderItem = ({item}) => (
    <>
      {item.service == 'fret-par-bateau' || item.service == 'fret-par-avion' ? (
        <RenderItemAvionBateau key={item.id} item={item} />
      ) : (
        <></>
      )}

      {item.service == 'demandes-d-achat' ? (
        <RenderItemDemande key={item.id} item={item} />
      ) : (
        <></>
      )}
    </>
  );

  if (isLoading) {
    return (
      <View style={{justifyContent: 'center', height: '80%'}}>
        <ActivityIndicator size={'large'} color="#3292E0" />
      </View>
    );
  }

  if (countryServiceRequired) {
    return (
      <View style={{backgroundColor: '#fff', height: '100%'}}>
        <ScrollView>
          <HeaderEarth />
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <View>
              <View style={styles.requiredCountry}>
                <Text style={styles.WeightCalText}>
                  {t(
                    'Veuillez choisir un service (page des services) et un pays de livraison',
                  )}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView
      style={{flex: 1, paddingBottom: 50}}
      showsVerticalScrollIndicator={false}>
      <View style={{flex: 1, marginBottom: 50}}>
        <HeaderEarth />

        <View style={{marginTop: 24, marginBottom: 12}}>
          <Text
            style={{
              fontFamily: 'Poppins-SemiBold',
              fontSize: 16,
              color: '#000',
              textAlign: 'center',
            }}>
            {t('Recherche des Produits')}
          </Text>
        </View>

        <View style={{paddingHorizontal: 25}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              backgroundColor: '#fff',
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#626262',
              paddingHorizontal: 16,
            }}>
            <TouchableOpacity>
              <Feather name="search" size={24} color={'#626262'} />
            </TouchableOpacity>

            <TextInput
              value={searchQuery}
              onChangeText={text => setSearchQuery(text)}
              clearButtonMode="always"
              autoCapitalize="none"
              placeholder={t('Recherche...')}
              placeholderTextColor="#999"
              style={{
                fontFamily: 'Poppins-Medium',
                fontSize: 14,
                width: '95%',
                backgroundColor: 'transparent',
                textDecorationLine: 'none',
                color: '#000',
              }}
            />
          </View>
        </View>

        {isSearching && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3292E0" />
            <Text style={styles.loadingText}>{t('Recherche en cours...')}</Text>
          </View>
        )}

        {!isSearching && noResults && (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>
              {t('Aucun résultat trouvé')}
            </Text>
          </View>
        )}

        {!isSearching && !noResults && data.length > 0 && (
          <FlatList
            data={data}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={renderItem}
          />
        )}

        {!isSearching &&
          !noResults &&
          data.length === 0 &&
          searchQuery.trim() === '' && (
            <View style={styles.initialSearchContainer}>
              <Text style={styles.initialSearchText}>
                {t('Rechercher un produit')}
              </Text>
            </View>
          )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  imageSwiper: {
    // backgroundColor: 'gold',
    width: windowWidth * 0.32,
    height: windowHeight * 0.25,
    borderRadius: 10,
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
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
    fontSize: 16,
  },
  safeContainerStyle: {
    justifyContent: 'center',
    // backgroundColor: 'tomato',
    width: windowWidth * 0.46,
    // borderRadius:0
    marginTop: 5,
  },
  placeholderStyle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#14213D',
  },
  dropdown: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
    marginBottom: 5,
  },
  selectedTextStyle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#14213D',
  },
  containerStyle: {
    backgroundColor: '#F5F5F5',
    marginTop: -1,
    borderRadius: 8,
    maxHeight: 100,
    elevation: 0,
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
  buttonsContainer: {
    // backgroundColor: 'tomato',
    width: windowWidth * 0.7,
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
    marginTop: 50,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    position: 'absolute',
    top: 10,
    right: 10,
  },
  requiredCountry: {
    alignSelf: 'center',
    height: windowHeight * 0.3,
    width: windowWidth * 0.95,
    borderTopLeftRadius: 30,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginTop: windowHeight * 0.03,
  },
  WeightCalText: {
    color: '#000',
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  noResultsText: {
    fontSize: 16,
    color: '#333',
  },
  initialSearchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: windowWidth * 0.5,
  },
  initialSearchText: {
    fontSize: 16,
    color: '#333',
  },
});
export default Search;
