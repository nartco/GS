import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  ToastAndroid,
  Platform,
} from 'react-native';
import React, {useState, useEffect, useCallback, useRef} from 'react';
import {useIsFocused} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';

import styles from './styles';
import {useTranslation} from 'react-i18next';
import auth from '@react-native-firebase/auth';

import {
  getPanier,
  getSelectedService,
  getServices,
  saveSelectedService,
  saveValidatedPanier,
  removePanier,
  getSelectedCountry,
  getPlatformLanguage,
  savePanier,
  saveSelectedCountry,
  getCommand,
  saveCommand,
  savePaysLivraison,
  getSelectedCountryProduct,
  getSelectedServiceProduct,
} from '../../modules/GestionStorage';
import StepIndicator from 'react-native-step-indicator';
import {
  calculProductPrices,
  calculProductPricesCommand,
} from '../../modules/CalculPrix';
import axiosInstance from '../../axiosInstance';
import Button, {ButtonPrix} from '../../components/Button';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import ServiceHeader from '../../components/ServiceHeader';
import {HeaderEarth} from '../../components/Header';
import Stepper from '../Stepper';
import {useBag} from '../../modules/BagContext';
import {TextInputMask} from 'react-native-masked-text';
import CardTotal from '../../components/CardTotal';
import CardTotalCommand from '../../components/CartTotalCommand';
import RenderList from '../../components/RenderList';
import RenderCommandList from '../../components/RenderCommandList';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const createAttributeString = attributs => {
  if (!attributs || typeof attributs !== 'object') {
    return '';
  }

  // Obtenir toutes les valeurs de l'objet et les filtrer pour enlever les valeurs vides ou undefined
  const values = Object.values(attributs).filter(
    value => value && value.trim() !== '',
  );

  // Joindre toutes les valeurs avec un espace
  return values.join(', ');
};

const CartScreen = props => {
  var isFocused = useIsFocused();

  const {t, i18n} = useTranslation();
  const [Loader, setLoader] = useState(false);
  const [LocalStorage, setLocalStorage] = useState(null);
  const [paysLivraison, setPaysLivraison] = useState('');
  const [Remises, setRemises] = useState([]);
  const [codePromo, setCodePromo] = useState(undefined);
  const [RemiseValue, setRemiseValue] = useState(0);
  const [RemiseProduct, setRemiseProduct] = useState(null);
  const [RemiseCode, setRemiseCode] = useState('');
  const [CartProducts, setCartProducts] = useState([]);
  const [RemiseLoader, setRemiseLoader] = useState(true);
  const [Service, setService] = useState(null);
  const [paysLivraisonObject, setPaysLivraisonObject] = useState(null);
  const [BasketClasseRegroupement, setBasketClasseRegroupement] = useState('');
  const [Language, setLanguage] = useState('fr');
  const [couponShow, setCouponShow] = useState(false);
  const [CartCommand, setCartCommand] = useState([]);
  const [paysCommand, setPayCommand] = useState([]);
  const [CommandBasket, setCommandBasket] = useState([]);
  const [ServiceCommand, setServiceCommand] = useState([]);
  const [user, setUser] = useState(null);
  const [excludedSupplierIds, setExcludedSupplierIds] = useState([]);
  let OtherCommand = [];

  const {setBagCount, bagCount} = useBag();

  useEffect(() => {
    const user = auth().currentUser;
    setUser(user);
    // Pour eviter un probleme de memoire, il faut ajouter un cleanup
    let mounted = true;

    setLoader(true);
    setRemiseLoader(true);
    setCartProducts([]);
    if (CartProducts.length == 0) {
      setCouponShow(false);
      setRemiseCode('');
    }

    async function fetchValue() {
      try {
        // Language
        const currentLanguage = await getPlatformLanguage();
        setLanguage(currentLanguage);

        // Information de connexion

        setLocalStorage(user.uid);

        if (null === user.uid) {
          setLoader(false);
          setRemiseLoader(false);

          props.navigation.navigate('Login', {fromCart: 'cart'});
          return;
        }

        // Recuperer le service
        // let service = await getSelectedService();
        let service = await getSelectedServiceProduct();
        setService(service);

        // Recuperer le pays de livraison
        // let selectedPaysLivraison = await getSelectedCountry();
        let selectedPaysLivraison = await getSelectedCountryProduct();
        setPaysLivraison(selectedPaysLivraison);

        // Recuperer le panier
        let basketData = await getPanier();

        if (basketData.length == 0) {
          setCouponShow(false);
          setRemiseCode('');
        }

        if (basketData.length > 1) {
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
        }
        setCartProducts(basketData);

        const excludedIds = new Set();
        basketData.forEach(item => {
          if (item.product && item.product.fournisseursExclure) {
            item.product.fournisseursExclure.forEach(fournisseur => {
              if (fournisseur.fournisseur && fournisseur.fournisseur.id) {
                excludedIds.add(parseInt(fournisseur.fournisseur.id));
              }
            });
          }
        });

        // Convertir le Set en tableau et le stocker dans l'état
        setExcludedSupplierIds(Array.from(excludedIds));

        // if (!service && !ServiceCommand) {
        //   props.navigation.navigate('HomeScreen');
        //   return;
        // }

        // Recuperer les Product de Comand

        let basketCommnd = await getCommand();
        console.log(JSON.stringify(basketCommnd),'JSON.stringify(basketCommnd)')
        if (basketCommnd.length > 0) {
          basketCommnd.forEach(item => {
            setCartCommand(item.product);
          });

          const response = await axiosInstance.get(
            '/pays/' + basketCommnd[0].paysLivraison,
          );

          let Data = [];
          Data = response.data;
          setServiceCommand(Data.service);
          setService(Data.service);
          setPayCommand(Data);
          setPaysLivraison(Data);
          setCommandBasket(basketCommnd);

          await saveSelectedService(ServiceCommand);
          await saveSelectedCountry(paysCommand);
        }

        // Recuperer les remises
        if (service) {
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
        } else {
          setRemiseLoader(false);
        }

        setLoader(false);
      } catch (error) {
        console.log('error', error);

        setLoader(false);
        setRemiseLoader(false);
      }
    }

    fetchValue();

    return mounted => (mounted = false);
  }, [isFocused]);

  // // Reduire ou augmenter la quantité

  const func = async (item, operation) => {
    let quantity = item.quantite;

    if (quantity) {
      quantity =
        operation === 'increment' ? Number(quantity) + 1 : Number(quantity) - 1;

      if (quantity <= 0) {
        quantity = 1;
      } else if (quantity > item.quantiteMax) {
        quantity = item.quantiteMax;
        if (Platform.OS == 'ios') {
          Toast.show({
            type: 'error',
            text1: t('Quantity'),
            text2: t('Vous avez atteint la quantité maximum'),
          });
        } else {
          ToastAndroid.show(
            t('Vous avez atteint la quantité maximum'),
            ToastAndroid.SHORT,
          );
        }
      }

      saveProductNewQuantity(item, quantity);
    }
  };

  const funcQuantity = async (item, operation) => {
    let quantity = item.quantite;

    if (quantity) {
      quantity =
        operation === 'increment' ? Number(quantity) + 1 : Number(quantity) - 1;

      if (quantity <= 0) {
        quantity = 1;
      } else if (quantity > item.quantiteMax) {
        quantity = item.quantiteMax;
      }

      saveProductNewQuantityCommand(item, quantity);
    }
  };

  // Aller au dépot
  async function navigateToDepotMethod() {
    // Sauvegarder les elements du panier
    await saveValidatedPanier(RemiseCode, RemiseValue, RemiseProduct);

    console.log(Service.code, 'Service.code');
    let prices = calculProductPrices(CartProducts, RemiseValue, RemiseProduct);
    // Si c'est un produit de vente privées ou demande d'achat, il faut aller à la livraison
    if (
      'ventes-privees' == Service.code ||
      'demandes-d-achat' == Service.code
    ) {
      props.navigation.navigate('Livraison1', {
        excludedSupplierIds: excludedSupplierIds,
        prices: prices,
      });

      return; // should not be reached
    }

    console.log({excludedSupplierIds}, {prices}, 'excludedSupplierIds');
    props.navigation.navigate('DepotScreen1', {
      excludedSupplierIds: excludedSupplierIds,
      prices: prices,
    });
  }

  async function navigateToDepotMethodCommand() {
    // Sauvegarder les elements du panier
    await saveValidatedPanier(RemiseCode, RemiseValue, RemiseProduct);
    await saveSelectedService(ServiceCommand);
    await savePaysLivraison(paysCommand);
    let prices = calculProductPricesCommand(
      CartCommand,
      RemiseValue,
      RemiseProduct,
    );
    console.log(prices, 'pricewewewewes', CartCommand);
    // Si c'est un produit de vente privées ou demande d'achat, il faut aller à la livraison
    if (
      'ventes-privees' == ServiceCommand.code ||
      'demandes-d-achat' == ServiceCommand.code
    ) {
      props.navigation.navigate('Livraison1', {
        excludedSupplierIds: excludedSupplierIds,
        prices: prices,
      });

      return; // should not be reached
    }

    props.navigation.navigate('DepotScreen1', {
      excludedSupplierIds: excludedSupplierIds,
      prices: prices,
    });
  }

  // Verifier la remise
  const handleChangeRemise = item => {
    let found = false;
    Remises.map(function (remise) {
      if (remise.code.toLowerCase() == item.toLowerCase()) {
        // le produit n'est pas vide
        if (remise.produit) {
          CartProducts.forEach(function (produit) {
            if (produit.ProductId == remise.produit.id) {
              found = true;
              setRemiseValue(remise.valeur);
              setRemiseCode(item);
              setRemiseProduct(produit.ProductId);
            }
          });
        } else {
          found = true;
          setRemiseValue(remise.valeur);
          setRemiseCode(item);
          setRemiseProduct('');
        }
      }
    });

    if (!found) {
      setRemiseValue(0);
      setRemiseCode('');
      setRemiseProduct('');
    }
  };

  // Sauvegarder la nouvelle quantité
  const saveProductNewQuantity = async (item, quantity) => {
    var newData = CartProducts.filter(ls => {
      if (ls.ID == item.ID) {
        ls.quantite = quantity;
      }

      return ls;
    });

    setCartProducts(newData);
    await savePanier(newData);
  };

  const saveProductNewQuantityCommand = async (item, quantity) => {
    let basketCommnd = await getCommand();

    var newsData = CartCommand.filter(ls => {
      if (ls.id == item.id) {
        ls.quantite = quantity;
      }

      return ls;
    });

    let CatProducts = [];
    const obj = {
      ID: basketCommnd[0].ID,
      product: newsData,
      paysLivraison: basketCommnd[0].paysLivraison,
    };

    CatProducts.push(obj);

    setCartCommand(newsData);
    await saveCommand(CatProducts);
  };

  // Supprimer un produit
  async function removeProductFromCart(item) {
    var newData = CartProducts.filter(ls => {
      if (ls.ID != item.ID) {
        return ls;
      }
    });
    var newsData = CartCommand.filter(ls => {
      if (ls.id != item.id) {
        return ls;
      }
    });

    setBagCount(prev => prev - 1);

    setCartProducts(newData);
    setCartCommand(newsData);

    await savePanier(newData);
    await saveCommand(newsData);

    if (Platform.OS == 'ios') {
      Toast.show({
        type: 'success',
        text1: t('Supprimé'),
        text2: t('Produit supprimé du panier'),
      });
    } else {
      ToastAndroid.show(t('Produit supprimé du panier'), ToastAndroid.SHORT);
    }
  }
  const findMatchingCombination = (combinations, attributeString) => {
    // Normaliser la chaîne d'attributs en triant ses éléments
    const normalizedAttributeString = attributeString
      .split(', ')
      .sort()
      .join(', ');

    // Rechercher la combinaison correspondante
    return combinations.find(item => {
      const normalizedCombination = item.combinaison
        .split(', ')
        .sort()
        .join(', ');
      return normalizedCombination === normalizedAttributeString;
    });
  };

  // Afficher les attributs (dans le cas de vente privée et demande d'achat)
  const RenderAttribute = props => {
    const service = props.service;

    const product = props.product;

    console.log('prod2323232332323232323232233232323232uct', {product});

    if (
      'ventes-privees' == service.code ||
      'demandes-d-achat' == service.code
    ) {
      console.log('product', product.attributes);
      const attributeValues = createAttributeString(product.attributes);
      const matchingCombination = findMatchingCombination(
        product.product.stocks,
        attributeValues,
      );

      console.log({matchingCombination}, {attributeValues});
      return (
        <View>
          <Text style={styles.WeightCalSubText}>{attributeValues}</Text>
          {'demandes-d-achat' == service.code ? (
            <>
              <Text style={{marginBottom: 5}}>
                {product.url == null
                  ? ''
                  : product.url.length > 30
                  ? product.url.substring(0, 30 - 3) + '...'
                  : product.url}
              </Text>
              {/* {
                product.attributes == null
                ?
                <></>
                :
                <Text style={{marginBottom: 5}}>{product.attributes.name}: { product.url }</Text>
              } */}
              <Text style={{maxWidth: 250}}>
                {t('Infos complementaires')}:{' '}
                {product.informationsComplementaires}
              </Text>
            </>
          ) : (
            <></>
          )}
        </View>
      );
    }

    let result;
    if (product.productValue % 1 !== 0) {
      result =
        t('Valeur') +
        ' : ' +
        ('en' == Language ? '€ ' : '') +
        parseFloat(product.productValue).toFixed(2) +
        ('fr' == Language ? ' €' : '');
    } else {
      result =
        t('Valeur') +
        ' : ' +
        ('en' == Language ? '€ ' : '') +
        parseInt(product.productValue) +
        '.00' +
        ('fr' == Language ? ' €' : '');
    }
    return (
      <>
        <Text style={styles.WeightCalSubText}>
          {t('etat')} : {'Used' == product.stateValue ? t('Used') : t('Neuf')}
        </Text>
        <Text style={[styles.WeightCalSubText, {marginTop: 8}]}>
          {product.productValue ? result : ''}
        </Text>
      </>
    );
  };

  // Afficher les attributs (dans le cas de vente privée et demande d'achat)
  const RenderAttributeCommand = props => {
    const service = props.service;
    const product = props.product;
    console.log('prod2323232332323232323232233232323232uct', {product});

    if (
      'ventes-privees' == service.code ||
      'demandes-d-achat' == service.code
    ) {
      const attributeValues = createAttributeString(product.attributes);
      const matchingCombination = findMatchingCombination(
        product.product.stocks,
        attributeValues,
      );

      console.log({matchingCombination}, {attributeValues});

      return (
        <View>
          <Text style={styles.WeightCalSubText}>{attributeValues}</Text>
          {'demandes-d-achat' == service.code ? (
            <>
              <Text style={{marginBottom: 5}}>
                {product.url == null
                  ? ''
                  : product.url.length > 30
                  ? product.url.substring(0, 30 - 3) + '...'
                  : product.url}
              </Text>
              <Text style={{maxWidth: 250}}>
                {t('Infos complementaires')}:{' '}
                {product.informationsComplementaires}
              </Text>
            </>
          ) : null}
        </View>
      );
    }

    let result;
    if (product.valeur % 1 !== 0) {
      result =
        t('Valeur') +
        ' : ' +
        ('en' == Language ? '€ ' : '') +
        parseFloat(product.valeur).toFixed(2) +
        ('fr' == Language ? ' €' : '');
    } else {
      result =
        t('Valeur') +
        ' : ' +
        ('en' == Language ? '€ ' : '') +
        product.valeur +
        '.00' +
        ('fr' == Language ? ' €' : '');
    }

    return (
      <>
        <Text style={styles.WeightCalSubText}>
          {t('etat')} : {'Used' == product.etat ? t('Used') : t('Neuf')}
        </Text>
        <Text style={[styles.WeightCalSubText, {marginTop: 8}]}>
          {product.valeur ? result : ''}
        </Text>
      </>
    );
  };

  const handleQuantiteChange = (item, text) => {
    const updateProduct = CartProducts.map(cart => {
      if (cart.id === item.id) {
        return {...cart, quantite: text};
      }
      return cart;
    });
    saveProductNewQuantity(item, text);
  };

  // Afficher le produit
  const RenderItem = ({item}) => {
    let prix = parseFloat(item.Price);
    prix = isNaN(prix) ? 0 : prix;

    let quantite = parseInt(item.quantite);
    quantite = isNaN(quantite) ? 0 : quantite;

    let totalPrice = prix * quantite;

    if (CartProducts.length < 1) {
      setRemiseCode('');
    }

    return (
      <>
        <View
          style={{
            backgroundColor: '#fff',
            paddingVertical: 12,
            marginBottom: 16,
            borderRadius: 18,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 20,
              width: windowWidth * 0.85,
              alignSelf: 'center',
            }}>
            {'ventes-privees' == Service.code ? (
              <View>
                {item.ProductImage ? (
                  <Image
                    source={{uri: item.ProductImage[0].url}}
                    resizeMode="contain"
                    style={{width: wp(18), height: wp(28)}}
                  />
                ) : (
                  <Text></Text>
                )}
              </View>
            ) : (
              <View>
                {item.image !== '' ? (
                  <Image
                    source={{uri: item.image}}
                    resizeMode="contain"
                    style={{width: wp(18), height: wp(28)}}
                  />
                ) : (
                  <>
                    <View style={{width: wp(10), height: wp(28)}}></View>
                  </>
                )}
              </View>
            )}
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: wp(10),
                }}>
                <View>
                  <Text
                    style={{
                      fontSize: 12,
                      textAlign: 'left',
                      maxWidth: 180,
                      fontFamily: 'Poppins-Regular',
                      color: '#000',
                    }}>
                    {'fr' == Language ? item.product.name : item.product.nameEN}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    removeProductFromCart(item);
                  }}>
                  <Feather name="trash-2" color="#E10303" size={25} />
                </TouchableOpacity>
              </View>
              <View style={{marginTop: 8}}>
                <RenderAttribute service={Service} product={item} />
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  marginTop: 12,
                }}>
                <ButtonPrix title={item.Price} language={Language} />
                {'demandes-d-achat' == Service.code ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 25,
                      backgroundColor: '#EFEFEF',
                      borderRadius: 18,
                      width: windowWidth * 0.35,
                      paddingVertical: 5,
                    }}>
                    {/* <TouchableOpacity
                            onPress={() => {
                              func(item, 'decrement');
                            }}>
                              <Feather name="minus" color="#000" size={25}/>
                          </TouchableOpacity>

                          <View style={{flexDirection: "row", alignItems: "center", gap: 2}}>
                            <Text style={{fontFamily: "Poppind-Regular", color: "#343434", fontSize: 20}}>{ item.quantite }</Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => {
                              func(item, 'increment');
                            }}>
                              <Feather name="plus" color="#000" size={22}/>
                          </TouchableOpacity> */}
                    <TextInput
                      placeholder={item.quantite}
                      value={item.quantite}
                      style={{
                        width: '100%',
                        paddingLeft: 13,
                        paddingVertical: 2,
                        fontSize: 18,
                      }}
                      onChangeText={text => saveProductNewQuantity(item, text)}
                    />
                  </View>
                ) : (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 25,
                      backgroundColor: '#EFEFEF',
                      borderRadius: 18,
                      width: windowWidth * 0.35,
                      paddingVertical: 5,
                    }}>
                    <TouchableOpacity
                      onPress={() => {
                        func(item, 'decrement');
                      }}>
                      <Feather name="minus" color="#000" size={25} />
                    </TouchableOpacity>

                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 2,
                      }}>
                      <Text
                        style={{
                          fontFamily: 'Poppind-Regular',
                          color: '#343434',
                          fontSize: 20,
                        }}>
                        {item.quantite}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        func(item, 'increment');
                      }}>
                      <Feather name="plus" color="#000" size={22} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </>
    );
  };

  const RenderItemCommand = ({item}) => {
    let prix = 0;

    let ItemCommandPrice = item.attributs['4'] + ', ' + item.attributs['6'];
    let stock = [];
    stock.push(item.product.stocks);

    if (item.product.service == 'demandes-d-achat') {
      prix = parseFloat(item.prixAchat);
    } else if (item.product.service == 'ventes-privees') {
      stock.forEach(item => {
        item.map(obj => {
          if (obj.combinaison == ItemCommandPrice) {
            prix = parseFloat(obj.prix);
          }
        });
      });
    } else {
      prix = parseFloat(item.product.productSpecificites[0].prix);
    }
    prix = isNaN(prix) ? 0 : prix;

    let quantite = parseInt(item.quantite);
    quantite = isNaN(quantite) ? 0 : quantite;

    let totalPrice = prix * quantite;

    if (CartCommand.length < 1) {
      setRemiseCode('');
    }
    return (
      <View
        style={{
          backgroundColor: '#fff',
          paddingVertical: 12,
          marginBottom: 16,
          borderRadius: 18,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 20,
            width: windowWidth * 0.85,
            alignSelf: 'center',
          }}>
          {
            <View>
              {'ventes-privees' == item.product.service ? (
                <>
                  {item.product.productImages != null ? (
                    <Image
                      source={{uri: item.product.productImages[0].url}}
                      resizeMode="contain"
                      style={{width: wp(18), height: wp(28)}}
                    />
                  ) : (
                    <>
                      <View style={{width: wp(10), height: wp(28)}}></View>
                    </>
                  )}
                </>
              ) : (
                <View style={{width: wp(10), height: wp(28)}}></View>
              )}
            </View>
          }
          <View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: wp(10),
              }}>
              <View>
                <Text
                  style={{
                    fontSize: 12,
                    textAlign: 'left',
                    maxWidth: 180,
                    fontFamily: 'Poppins-Regular',
                    color: '#000',
                  }}>
                  {item.product.name}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  removeProductFromCart(item);
                }}>
                <Feather name="trash-2" color="#E10303" size={25} />
              </TouchableOpacity>
            </View>
            <View style={{marginTop: 8}}>
              <RenderAttributeCommand service={ServiceCommand} product={item} />
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                marginTop: 12,
              }}>
              <ButtonPrix title={prix} language={Language} />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 25,
                  backgroundColor: '#EFEFEF',
                  borderRadius: 18,
                  width: windowWidth * 0.35,
                  paddingVertical: 5,
                }}>
                {ServiceCommand.code == 'demandes-d-achat' ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 25,
                      backgroundColor: '#EFEFEF',
                      borderRadius: 18,
                      width: windowWidth * 0.35,
                      paddingVertical: 2,
                    }}>
                    <TextInput
                      placeholder={
                        item.quantite == '' ? 'Enter Quantity' : item.quantite
                      }
                      value={item.quantite}
                      style={{
                        width: '100%',
                        paddingLeft: 13,
                        paddingVertical: 2,
                        fontSize: 15,
                      }}
                      onChangeText={text =>
                        saveProductNewQuantityCommand(item, text)
                      }
                    />
                  </View>
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={() => {
                        funcQuantity(item, 'decrement');
                      }}>
                      <Feather name="minus" color="#000" size={25} />
                    </TouchableOpacity>

                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 2,
                      }}>
                      <Text
                        style={{
                          fontFamily: 'Poppind-Regular',
                          color: '#343434',
                          fontSize: 20,
                        }}>
                        {item.quantite}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        funcQuantity(item, 'increment');
                      }}>
                      <Feather name="plus" color="#000" size={22} />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const removeItem = index => {
    // Create a copy of the array
    const newData = [...RemiseCode];

    // Remove the item at the specified index
    newData.splice(index, 1);

    // Update the state with the new array
    setRemiseCode(newData);
    setCouponShow(false);
  };

  const handleRemiseText = text => {
    setRemiseCode(text);
  };

  const handleEndEditing = () => {
    // Check if the entered value is a valid number
    const numericValue = parseFloat(RemiseCode);

    if (isNaN(numericValue)) {
      // If not a valid number, handle it accordingly (here, setting to 0)
      setRemiseCode('0');
    } else {
      // If a valid number, update the state with the parsed value
      setRemiseCode(numericValue.toString());
    }
  };

  const textInputRef = useRef(null);

  const handleFocus = () => {
    if (textInputRef.current) {
      textInputRef.current.focus();
    }
  };

  if (Loader || RemiseLoader) {
    return (
      <View style={{justifyContent: 'center', height: '80%'}}>
        <ActivityIndicator size={'large'} color="#3292E0" />
      </View>
    );
  }

  /*if(!ServiceCommand || !paysCommand || !Service )
  {
    return(
      <View style={{justifyContent: 'center', height: '80%'}}><ActivityIndicator size={'large'} color="#3292E0" /></View>
    )
  }
  */
  console.log(JSON.stringify(CartCommand), 'CartCommand');
  if (!Service && !paysCommand && !ServiceCommand) {
    return (
      <View style={{backgroundColor: '#fff', height: '100%'}}>
        <ScrollView>
          <HeaderEarth />
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <View>
              <View style={styles.panierVide}>
                <Text style={styles.WeightCalText}>{t('Panier vide')}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (
    null === LocalStorage ||
    !Array.isArray(CartCommand) ||
    (CartProducts.length < 1 && CartCommand.length < 1)
  ) {
    return (
      <View style={{height: '100%'}}>
        <ScrollView>
          {CommandBasket.length > 1 ? (
            <ServiceHeader
              navigation={props.navigation}
              service={ServiceCommand}
              paysLivraison={paysCommand}
              language={Language}
            />
          ) : (
            <ServiceHeader
              navigation={props.navigation}
              // service={Service}
              paysLivraison={paysLivraison}
              language={Language}
            />
          )}

          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <View>
              <View style={styles.panierVide}>
                <Text style={styles.WeightCalText}>{t('Panier vide')}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  console.log(JSON.stringify(CartCommand), 'CartCommand');

  return (
    <>
      {bagCount == 0 ? (
        <View style={{height: '100%'}}>
          <ScrollView>
            {CommandBasket.length > 1 ? (
              <ServiceHeader
                navigation={props.navigation}
                service={ServiceCommand}
                paysLivraison={paysCommand}
                language={Language}
              />
            ) : (
              <ServiceHeader
                navigation={props.navigation}
                service={Service}
                paysLivraison={paysLivraison}
                language={Language}
              />
            )}

            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <View>
                <View style={styles.panierVide}>
                  <Text style={styles.WeightCalText}>{t('Panier vide')}</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      ) : (
        <>
          {CartProducts.length != 0 ? (
            <View style={{height: '100%'}}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{flex: 1, marginBottom: 70}}>
                  <ServiceHeader
                    navigation={props.navigation}
                    service={Service}
                    paysLivraison={paysLivraison}
                    language={Language}
                  />

                  <Stepper position={0} Service={Service.code} />

                  <View style={{marginTop: 32}}>
                    {CartProducts.length > 0 ? (
                      <>
                        {CartProducts.map((item, index) => (
                          <RenderList
                            item={item}
                            key={index}
                            ButtonPrix={ButtonPrix}
                            Language={Language}
                            RenderAttribute={RenderAttribute}
                            Service={Service}
                            removeProductFromCart={removeProductFromCart}
                            saveProductNewQuantity={saveProductNewQuantity}
                            wp={wp}
                            windowWidth={windowWidth}
                            func={func}
                          />
                        ))}
                        <CardTotal
                          data={CartProducts}
                          handleChangeRemise={handleChangeRemise}
                          setCouponShow={setCouponShow}
                          navigateToDepotMethod={navigateToDepotMethod}
                          removeItem={removeItem}
                          RemiseCode={RemiseCode}
                          setRemiseCode={setRemiseCode}
                          couponShow={couponShow}
                          Service={Service}
                          windowWidth={windowWidth}
                          wp={wp}
                          RemiseValue={RemiseValue}
                          t={t}
                          RemiseProduct={RemiseProduct}
                          Language={Language}
                          PaysLivraison={paysLivraison}
                        />
                      </>
                    ) : (
                      <></>
                    )}
                  </View>
                </View>
              </ScrollView>
            </View>
          ) : (
            <View style={{height: '100%'}}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{flex: 1, marginBottom: 70}}>
                  <ServiceHeader
                    navigation={props.navigation}
                    service={ServiceCommand}
                    paysLivraison={paysCommand}
                    language={Language}
                  />
                  <Stepper position={0} Service={ServiceCommand.code} />

                  <View style={{marginTop: 32}}>
                    {Array.isArray(CartCommand) &&
                      CartCommand.map((item, index) => (
                        <RenderCommandList
                          ButtonPrix={ButtonPrix}
                          RenderAttributeCommand={RenderAttributeCommand}
                          ServiceCommand={ServiceCommand}
                          funcQuantity={funcQuantity}
                          item={item}
                          removeProductFromCart={removeProductFromCart}
                          saveProductNewQuantityCommand={
                            saveProductNewQuantityCommand
                          }
                          windowWidth={windowWidth}
                          CartCommand={CartCommand}
                          wp={wp}
                          key={index}
                          language={Language}
                        />
                      ))}
                  </View>

                  <CardTotalCommand
                    data={CartCommand}
                    handleChangeRemise={handleChangeRemise}
                    setCouponShow={setCouponShow}
                    navigateToDepotMethodCommand={navigateToDepotMethodCommand}
                    removeItem={removeItem}
                    RemiseCode={RemiseCode}
                    setRemiseCode={setRemiseCode}
                    couponShow={couponShow}
                    Service={ServiceCommand}
                    windowWidth={windowWidth}
                    wp={wp}
                    RemiseValue={RemiseValue}
                    t={t}
                    RemiseProduct={RemiseProduct}
                  />
                </View>
              </ScrollView>
            </View>
          )}
        </>
      )}
    </>
  );
};

export default CartScreen;
