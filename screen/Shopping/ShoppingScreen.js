import {
  View,
  Text,
  Image,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
  Modal,
  StyleSheet,
} from 'react-native';
import React, {useState, useEffect, useCallback} from 'react';
import {HeaderEarth} from '../../components/Header';
import {
  getPlatformLanguage,
  getSelectedCountry,
  getSelectedService,
  saveSelectedCountry,
  saveSelectedService,
} from '../../modules/GestionStorage';
import axiosInstance from '../../axiosInstance';
import styles from './styles';
import PrivateSalesDetailComponent from './PrivateSalesDetailComponent';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';

import BuyingDemandDetailComponent from './BuyingDemandDetailComponent';
import ByPlaneDetailsComponent from './ByPlaneDetailsComponent';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Octicons from 'react-native-vector-icons/Octicons';
import ByPlaneDetailsComponentGrid from './ByPlaneDetailsComponentGrid';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
import MasonryList from '@react-native-seoul/masonry-list';
import BuyingDemandDetailComponentGrid from './BuyingDemandDetailComponentGrid';
import {useIsFocused} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {ScrollView} from 'react-native-virtualized-view';
import Categorie from '../../components/Categorie';
import SmallEarth from '../../assets/images/earth.png';
import Flag from 'react-native-flags';
import Feather from 'react-native-vector-icons/Feather';
import {Dropdown} from 'react-native-element-dropdown';
import AntDesign from 'react-native-vector-icons/AntDesign';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import CategorieAndroid from '../../components/CategorieAndroid';

const ShoppingScreen = props => {
  var isFocused = useIsFocused();
  const {t, i18n} = useTranslation();
  const {params} = useRoute();

  const [ActivityIndicatorVar, setActivityIndicatorVar] = useState(true);
  const [ActivityIndicatorProduct, setActivityIndicatorProduct] =
    useState(true);
  const [Categories, setCategories] = useState([]);
  const [SelectedCategorieId, setSelectedCategorieId] = useState(
    params?.SelectedCategorieId || '',
  );
  const [products, setProducts] = useState([]);
  const [CategoriesProducts, setCategoriesProducts] = useState([]);
  const [Language, setLanguage] = useState('fr');
  const [activeFilter, setActiveFilter] = useState(0);
  const [Loader, setLoader] = useState(false);
  const [Filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  // Par défaut le service Expéditions par avion sera selectionné (donc les sous categories seront chargées)
  const [Service, setService] = useState(null);

  const [PaysLivraison, setPaysLivraison] = useState(null);

  const SortData = [
    {
      label: t('Prix'),
      value: 'Prix ASC',
      filter: 'price',
      sort: 'ASC',
    },
    {
      label: t('Prix'),
      value: 'Prix DESC',
      filter: 'price',
      sort: 'DESC',
    },
  ];

  useEffect(() => {
    let isMounted = true;
    const fetchInitialData = async () => {
      try {
        setLoader(true);
        setActivityIndicatorVar(true);

        const [selectedService, currentLanguage, paysLivraison] =
          await Promise.all([
            getSelectedService(),
            getPlatformLanguage(),
            getSelectedCountry(),
          ]);

        if (!isMounted) return;

        if (!selectedService) {
          props.navigation.navigate('HomeScreen');
          return;
        }
        setService(selectedService);
        setLanguage(currentLanguage);
        setPaysLivraison(paysLivraison);

        const response = await axiosInstance.get(
          `/categories/actif/${selectedService.code}/${paysLivraison.id}`,
        );
        if (!isMounted) return;

        if (response.data) {
          setCategories(response.data);
          setSelectedCategorieId(
            params?.SelectedCategorieId || response.data[0]?.id || '',
          );
        }
      } catch (error) {
        console.error('Initial data fetch error:', error);
      } finally {
        if (isMounted) {
          setLoader(false);
          setActivityIndicatorVar(false);
          setActivityIndicatorProduct(false);
        }
      }
    };

    fetchInitialData();
    StatusBar.setBarStyle('light-content');

    return () => {
      isMounted = false;
    };
  }, []);

  // Fonction pour trier les produits localement
  const sortProducts = useCallback((productsToSort, field, direction) => {
    console.log(JSON.stringify(productsToSort), 'productsToSort');
    return [...productsToSort].sort((a, b) => {
      console.log(a, b);
      if (field === 'price') {
        const priceA = parseFloat(a.productSpecificites[0].prix);
        const priceB = parseFloat(b.productSpecificites[0].prix);
        return direction === 'ASC' ? priceA - priceB : priceB - priceA;
      }
      // Ajoutez d'autres cas de tri ici si nécessaire
      return 0;
    });
  }, []);

  useEffect(() => {
    if (Service && SelectedCategorieId) {
      fetchSubcategoryProducts();
    }
  }, [fetchSubcategoryProducts, Service, SelectedCategorieId]);

  // Fonction pour gérer le changement de tri
  const handleSortChange = useCallback(
    item => {
      setSortField(item.filter);
      setSortDirection(item.sort);
      const sortedProducts = sortProducts(products, item.filter, item.sort);
      setProducts(sortedProducts);
    },
    [products, sortProducts],
  );
  // Recuperer les produits
  const constructUrl = (
    Service,
    SelectedCategorieId,
    PaysLivraison,
    Filter,
    sortBy,
  ) => {
    let baseUrl = '';
    let params = [];

    if (Service.code === 'ventes-privees') {
      baseUrl = '/categories/subcategories/products/actif';
      params = [SelectedCategorieId, PaysLivraison?.id].filter(Boolean);
    } else {
      baseUrl = '/products/categories/actif';
      params = [SelectedCategorieId, PaysLivraison?.id, Filter, sortBy].filter(
        Boolean,
      );
    }

    return `${baseUrl}${params.length > 0 ? '/' : ''}${params.join('/')}`;
  };

  // Exemple d'utilisation

  const fetchSubcategoryProducts = useCallback(async () => {
    setActivityIndicatorProduct(true);
    try {
      const url = constructUrl(Service, SelectedCategorieId, PaysLivraison);
      console.log('Fetching products with URL:', url);
      const response = await axiosInstance.get(url);

      if (Array.isArray(response.data)) {
        const sortedProducts = sortProducts(
          response.data,
          sortField,
          sortDirection,
        );
        setProducts(sortedProducts);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('fetchSubcategoryProducts error:', error);
      setProducts([]);
    } finally {
      setActivityIndicatorProduct(false);
    }
  }, [
    Service,
    SelectedCategorieId,
    PaysLivraison,
    sortField,
    sortDirection,
    sortProducts,
  ]);

  const renderSortItem = useCallback(
    item => (
      <View style={styles.sortItemContainer}>
        <Text>{item.label}</Text>
        <Feather
          name={
            item.value === 'Prix DESC' ? 'arrow-down-right' : 'arrow-up-right'
          }
          color="#000"
          size={22}
        />
      </View>
    ),
    [],
  );

  // Service display

  const renderByPlaneItem = useCallback(
    ({item}) => (
      <ByPlaneDetailsComponent
        service={Service?.code}
        data={item}
        navigation={props.navigation}
        paysLivraison={PaysLivraison}
        language={Language}
        selectedService={Service}
      />
    ),
    [Service, PaysLivraison, Language, props.navigation],
  );

  const renderByPlaneGridItem = useCallback(
    ({item}) => (
      <ByPlaneDetailsComponentGrid
        service={Service.code}
        data={item}
        navigation={props.navigation}
        paysLivraison={PaysLivraison}
        language={Language}
        selectedService={Service}
      />
    ),
    [Service, PaysLivraison, Language, props.navigation],
  );

  const renderDemandItem = useCallback(
    ({item}) => (
      <BuyingDemandDetailComponent
        service={Service.code}
        data={item}
        navigation={props.navigation}
        paysLivraison={PaysLivraison}
        language={Language}
        selectedService={Service}
      />
    ),
    [Service, PaysLivraison, Language, props.navigation],
  );

  const renderDemandItemGrid = useCallback(
    ({item}) => (
      <BuyingDemandDetailComponentGrid
        service={Service.code}
        data={item}
        navigation={props.navigation}
        paysLivraison={PaysLivraison}
        language={Language}
        selectedService={Service}
      />
    ),
    [Service, PaysLivraison, Language, props.navigation],
  );

  const CustomStatuBar = ({backgroundColor, barStyle = 'light-content'}) => {
    const inset = useSafeAreaInsets();
    return (
      <View style={{height: inset.top, backgroundColor}}>
        <StatusBar
          animated={true}
          backgroundColor={backgroundColor}
          barStyle={barStyle}
        />
      </View>
    );
  };
  const renderPrivateSaleItem = useCallback(
    ({item}) => (
      <PrivateSalesDetailComponent
        service={Service}
        data={item}
        navigation={props.navigation}
        paysLivraison={PaysLivraison}
        language={Language}
        selectedService={Service}
        SelectedCategorieId={SelectedCategorieId}
      />
    ),
    [
      Service,
      PaysLivraison,
      Language,
      props.navigation,
      SelectedCategorieId,
      params?.SelectedCategorieId,
    ],
  );

  if (!Service || !PaysLivraison || ActivityIndicatorVar) {
    return (
      <View style={{flex: 1}}>
        <HeaderEarth />

        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <View style={{justifyContent: 'center'}}>
            <ActivityIndicator size={'large'} color="#3292E0" />
          </View>
        </View>
      </View>
    );
  }
  if (Loader) {
    return (
      <View style={{justifyContent: 'center', height: '80%'}}>
        <ActivityIndicator size={'large'} color="#3292E0" />
      </View>
    );
  }

  let height = 0;
  if (windowHeight == 667) {
    height = hp(13);
  } else if (windowHeight >= 772) {
    height = hp(10);
  } else {
    height = hp(12);
  }

  return (
    <View style={{marginBottom: 85}}>
      {Platform.OS == 'ios' ? (
        <>
          <CustomStatuBar backgroundColor="#2BA6E9" />

          <View
            style={{
              position: 'relative',
              alignItems: 'center',
              backgroundColor: '#2BA6E9',
              justifyContent: 'center',
              height: height,
            }}>
            <View
              style={{
                position: 'relative',
                alignItems: 'center',
                backgroundColor: '#2BA6E9',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontSize: 14,
                  color: '#fff',
                  fontFamily: 'Roboto-Bold',
                }}>
                {Service
                  ? 'fr' == Language
                    ? Service.nom
                    : Service.nomEN
                  : ''}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 10,
                }}>
                {Service.code == 'ventes-privees' ||
                Service.code == 'demandes-d-achat' ? (
                  <>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                      }}>
                      <Flag
                        size={24}
                        code={PaysLivraison.drapeauDestination}
                        type="flat"
                      />
                      <Text
                        style={{
                          fontSize: 14,
                          color: '#fff',
                          fontFamily: 'Roboto-Regular',
                        }}>
                        {PaysLivraison.libelleDestination}
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                      }}>
                      <Flag
                        size={24}
                        code={PaysLivraison.drapeauDepart}
                        type="flat"
                      />
                      <Text
                        style={{
                          fontSize: 14,
                          color: '#fff',
                          fontFamily: 'Roboto-Regular',
                        }}>
                        {PaysLivraison.libelleDepart}
                      </Text>
                      <Feather name="arrow-up-right" color="#fff" size={22} />
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                      }}>
                      <Flag
                        size={24}
                        code={PaysLivraison.drapeauDestination}
                        type="flat"
                      />
                      <Text
                        style={{
                          fontSize: 14,
                          color: '#fff',
                          fontFamily: 'Roboto-Regular',
                        }}>
                        {PaysLivraison.libelleDestination}
                      </Text>
                      <Feather name="arrow-down-right" color="#fff" size={22} />
                    </View>
                  </>
                )}
              </View>
            </View>
            <View style={{position: 'absolute', top: 15, left: 10}}>
              <TouchableOpacity
                onPress={() => props.navigation.goBack()}
                style={{
                  marginLeft: 10,
                  marginTop: 10,
                  padding: 2.5,
                  borderRadius: 8,
                  backgroundColor: '#fff',
                  maxWidth: windowWidth * 0.1,
                }}>
                <AntDesign name="arrowleft" color="#2BA6E9" size={22} />
              </TouchableOpacity>
            </View>
            <View
              style={{
                position: 'absolute',
                top: windowWidth * 0.04,
                right: 10,
              }}>
              <Image
                source={SmallEarth}
                style={{width: wp(7), height: wp(7)}}
              />
              <Text
                style={{
                  fontSize: 14,
                  color: '#fff',
                  fontFamily: 'Roboto-Bold',
                  textAlign: 'center',
                  marginTop: 4,
                }}>
                GS
              </Text>
            </View>
          </View>
        </>
      ) : (
        <View
          style={{
            position: 'relative',
            alignItems: 'center',
            backgroundColor: '#2BA6E9',
            justifyContent: 'center',
            height: hp(12),
          }}>
          <Text
            style={{fontSize: 14, color: '#fff', fontFamily: 'Roboto-Bold'}}>
            {Service ? ('fr' == Language ? Service.nom : Service.nomEN) : ''}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              marginTop: 10,
            }}>
            {Service.code == 'ventes-privees' ||
            Service.code == 'demandes-d-achat' ? (
              <>
                <View
                  style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                  <Flag
                    size={24}
                    code={PaysLivraison.drapeauDestination}
                    type="flat"
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      color: '#fff',
                      fontFamily: 'Roboto-Regular',
                    }}>
                    {PaysLivraison.libelleDestination}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View
                  style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                  <Flag
                    size={24}
                    code={PaysLivraison.drapeauDepart}
                    type="flat"
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      color: '#fff',
                      fontFamily: 'Roboto-Regular',
                    }}>
                    {PaysLivraison.libelleDepart}
                  </Text>
                  <Feather name="arrow-up-right" color="#fff" size={22} />
                </View>
                <View
                  style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                  <Flag
                    size={24}
                    code={PaysLivraison.drapeauDestination}
                    type="flat"
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      color: '#fff',
                      fontFamily: 'Roboto-Regular',
                    }}>
                    {PaysLivraison.libelleDestination}
                  </Text>
                  <Feather name="arrow-down-right" color="#fff" size={22} />
                </View>
              </>
            )}
          </View>

          <View style={{position: 'absolute', top: 20, left: 10}}>
            <TouchableOpacity
              onPress={() => props.navigation.goBack()}
              style={{
                marginLeft: 10,
                marginTop: 10,
                padding: 2.5,
                borderRadius: 8,
                backgroundColor: '#fff',
                maxWidth: windowWidth * 0.1,
              }}>
              <AntDesign name="arrowleft" color="#2BA6E9" size={22} />
            </TouchableOpacity>
          </View>

          <View style={{position: 'absolute', top: 15, right: 10}}>
            <Image source={SmallEarth} style={{width: wp(7), height: wp(7)}} />
            <Text
              style={{
                fontSize: 14,
                color: '#fff',
                fontFamily: 'Roboto-Bold',
                textAlign: 'center',
                marginTop: 4,
              }}>
              GS
            </Text>
          </View>
        </View>
      )}

      {Platform.OS == 'ios' ? (
        <Categorie
          Categories={Categories}
          styles={styles}
          Language={Language}
          SelectedCategorieId={SelectedCategorieId}
          setSelectedCategorieId={setSelectedCategorieId}
        />
      ) : (
        <CategorieAndroid
          Categories={Categories}
          Language={Language}
          SelectedCategorieId={SelectedCategorieId}
          setSelectedCategorieId={setSelectedCategorieId}
        />
      )}

      {
        <>
          {ActivityIndicatorProduct ? (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                flexGrow: 1,
              }}>
              <ActivityIndicator size={'large'} color="#3292E0" />
            </View>
          ) : (
            <>
              {Service.code == 'ventes-privees' ||
              'demandes-d-achat' == Service.code ? (
                <></>
              ) : (
                <View style={{marginTop: 10, paddingHorizontal: 5}}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTopLeftRadius: 28,
                      borderTopRightRadius: 28,
                      backgroundColor: '#fff',
                      paddingVertical: 15,
                      paddingLeft: 15,
                      paddingRight: 23,
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 10,
                      }}>
                      <Dropdown
                        data={SortData}
                        style={{
                          height: 10,
                          width: windowWidth * 0.2,
                          borderRadius: 8,
                          backgroundColor: '#FFF',
                        }}
                        labelField="label"
                        valueField="value"
                        placeholder={t('Trier')}
                        selectedTextStyle={{
                          fontFamily: 'Poppins-Medium',
                          fontSize: wp(3.1),
                          color: '#376AED',
                        }}
                        iconColor="#376AED"
                        itemTextStyle={{fontSize: wp(3.35)}}
                        itemContainerStyle={{
                          height: 50,
                          width: windowWidth * 1,
                        }}
                        placeholderStyle={{
                          fontFamily: 'Poppins-Medium',
                          fontSize: wp(3.1),
                          color: '#376AED',
                        }}
                        showsVerticalScrollIndicator={false}
                        containerStyle={{elevation: 0}}
                        searchPlaceholder="Search..."
                        onChange={handleSortChange}
                        value={`${sortField}${sortDirection}`}
                        renderItem={renderSortItem}
                      />
                      {'fret-par-bateau' == Service.code && (
                        <TouchableOpacity
                          onPress={() => setIsModalVisible(true)}
                          style={{
                            backgroundColor: '#2BA6E9',
                            borderRadius: 30,
                            marginLeft: '10%',
                          }}>
                          <Text
                            style={{
                              color: 'white',
                              padding: 5,
                              paddingHorizontal: 10,
                            }}>
                            {t('redirectButton')}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 10,
                      }}>
                      {activeFilter === 0 ? (
                        <TouchableOpacity onPress={() => setActiveFilter(1)}>
                          <Ionicons
                            name="grid-outline"
                            color="#00000033"
                            size={wp(5.2)}
                          />
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity onPress={() => setActiveFilter(0)}>
                          <Ionicons
                            name="grid-outline"
                            color="#376AED"
                            size={wp(5.2)}
                          />
                        </TouchableOpacity>
                      )}
                      {activeFilter === 1 ? (
                        <TouchableOpacity onPress={() => setActiveFilter(0)}>
                          <Octicons
                            name="list-unordered"
                            color="#00000033"
                            size={wp(5.2)}
                          />
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity onPress={() => setActiveFilter(1)}>
                          <Octicons
                            name="list-unordered"
                            color="#376AED"
                            size={wp(5.2)}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              )}

              <ScrollView
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
                scrollEnabled={true}>
                <View
                  style={{
                    flex: 1,
                    marginBottom:
                      Platform.OS === 'ios'
                        ? windowWidth * 0.8
                        : windowWidth * 0.5,
                  }}>
                  {'fret-par-avion' == Service.code ? (
                    <>
                      {activeFilter === 0 ? (
                        <View>
                          <FlatList
                            showsVerticalScrollIndicator={false}
                            data={products}
                            renderItem={renderByPlaneItem}
                            keyExtractor={item => item.id}
                            nestedScrollEnabled={true}
                          />
                          {Platform.OS === 'ios' ? (
                            <KeyboardSpacer topSpacing={-100} />
                          ) : (
                            <></>
                          )}
                        </View>
                      ) : (
                        //   <FlatList
                        //   key={'#'}
                        //   showsVerticalScrollIndicator={false}
                        //   data={products}
                        //   renderItem={renderByPlaneGridItem}
                        //   keyExtractor={item => "#" + item.id}
                        //   numColumns={2}
                        // />
                        <View>
                          <MasonryList
                            data={products}
                            keyExtractor={item => item.id}
                            numColumns={2}
                            showsVerticalScrollIndicator={false}
                            renderItem={renderByPlaneGridItem}
                            onEndReachedThreshold={0.1}
                            nestedScrollEnabled={true}
                          />
                          {Platform.OS === 'ios' ? (
                            <KeyboardSpacer topSpacing={-100} />
                          ) : (
                            <></>
                          )}
                        </View>
                      )}
                    </>
                  ) : null}

                  {'fret-par-bateau' == Service.code ? (
                    <>
                      {activeFilter === 0 ? (
                        <View>
                          <FlatList
                            showsVerticalScrollIndicator={false}
                            data={products}
                            renderItem={renderByPlaneItem}
                            keyExtractor={item => item.id}
                          />
                          {Platform.OS === 'ios' ? (
                            <KeyboardSpacer topSpacing={-100} />
                          ) : (
                            <></>
                          )}
                        </View>
                      ) : (
                        <View>
                          <MasonryList
                            data={products}
                            keyExtractor={item => item.id}
                            numColumns={2}
                            showsVerticalScrollIndicator={false}
                            renderItem={renderByPlaneGridItem}
                            onEndReachedThreshold={0.1}
                          />
                          {Platform.OS === 'ios' ? (
                            <KeyboardSpacer topSpacing={-100} />
                          ) : (
                            <></>
                          )}
                        </View>
                      )}
                    </>
                  ) : null}

                  {'demandes-d-achat' == Service.code ? (
                    <>
                      {activeFilter === 0 ? (
                        <>
                          <FlatList
                            showsVerticalScrollIndicator={false}
                            data={products}
                            renderItem={renderDemandItem}
                            keyExtractor={item => item.id}
                          />
                          {Platform.OS === 'ios' ? (
                            <KeyboardSpacer topSpacing={-100} />
                          ) : (
                            <></>
                          )}
                        </>
                      ) : (
                        <View>
                          <MasonryList
                            data={products}
                            keyExtractor={item => item.id}
                            numColumns={2}
                            showsVerticalScrollIndicator={false}
                            renderItem={renderDemandItemGrid}
                            onEndReachedThreshold={0.1}
                          />
                          {Platform.OS === 'ios' ? (
                            <KeyboardSpacer topSpacing={-100} />
                          ) : (
                            <></>
                          )}
                        </View>
                      )}
                    </>
                  ) : null}

                  {'ventes-privees' == Service.code ? (
                    <View>
                      <FlatList
                        showsVerticalScrollIndicator={false}
                        data={products}
                        renderItem={renderPrivateSaleItem}
                        keyExtractor={item => item.id}
                      />
                      {Platform.OS === 'ios' ? (
                        <KeyboardSpacer topSpacing={-100} />
                      ) : (
                        <></>
                      )}
                    </View>
                  ) : null}
                </View>
                <Modal
                  visible={isModalVisible}
                  transparent={true}
                  animationType="fade">
                  <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                      <Text style={styles.modalText}>{t('redirect')}</Text>
                      <View style={styles.buttonContainer}>
                        <TouchableOpacity
                          style={[styles.button, styles.continueButton]}
                          onPress={() => setIsModalVisible(false)}>
                          <Text style={styles.buttonText}>{t('Cancel')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.button, styles.continueButton]}
                          onPress={async () => {
                            await saveSelectedCountry({
                              depart: 'France',
                              departEn: 'France',
                              destination: 'France',
                              destinationEn: 'France',
                              drapeauDepart: null,
                              drapeauDestination: 'FR',
                              id: 11,
                              label: 'France',
                              libelleDepart: 'France',
                              libelleDestination: 'France',
                              value: 11,
                            });
                            await saveSelectedService({
                              code: 'ventes-privees',
                              id: 4,
                              image:
                                'https://recette.godaregroup.com/api/fichiers/service/cfc7cd9b-995d-49f7-a546-5233e19455c8.png',
                              message: 'Le comptoir des grandes marques',
                              messageEN: 'The branch of the big brands',
                              nom: 'Ventes Privées',
                              nomEN: 'Private sales',
                              pays: [[Object], [Object]],
                              position: 3,
                              statut: true,
                            });
                            setIsModalVisible(false);
                            props.navigation.push('ShoppingScreen'); // Assurez-vous que 'navigation' est disponible dans ce composant
                          }}>
                          <Text style={styles.buttonText}>{t('Continue')}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Modal>
              </ScrollView>
            </>
          )}
        </>
      }
    </View>
  );
};

export default ShoppingScreen;
