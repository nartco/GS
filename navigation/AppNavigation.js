import React, {useEffect, useState, useMemo, useCallback} from 'react';
import {View, Text, Dimensions} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {BagProvider, useBag} from '../modules/BagContext';
import {navigationRef} from './RootNavigation';

// Import all your screens
import Splash from '../screen/Splash';
import HomeScreen from '../screen/HomeScreen/HomeScreen';
import PaysLivraison from '../screen/LivraisonScreen/PaysLivraison';
import MessageScreen from '../screen/ContactScreen/MessageScreen';
import ConversationList from '../screen/Conversation/ConversationList';
import ConversationDetails from '../screen/Conversation/ConversationDetails';
import ShoppingScreen from '../screen/Shopping/ShoppingScreen';
import Search from '../screen/Search/Search';
import ProfileScreen from '../screen/Profile/ProfileScreen';
import LoginScreen from '../screen/Login/LoginScreen';
import ProductList from '../screen/Shopping/ProductList';
import CartScreen from '../screen/CartScreen/CartScreen';
import DepotScreen1 from '../screen/DepotScreen/DepotScreen1';
import DepotScreen2 from '../screen/DepotScreen/DepotScreen2';
import DepotScreen3 from '../screen/DepotScreen/DepotScreen3';
import Livraison2 from '../screen/LivraisonScreen/Livraison2';
import Livraison1 from '../screen/LivraisonScreen/Livraison1';
import CheckoutScreen from '../screen/ChekoutScreen/CheckoutScreen';
import CheckoutScreenDemandeAchat from '../screen/ChekoutScreen/CheckoutScreenDemandeAchat';
import CheckoutResumeScreen from '../screen/ChekoutScreen/CheckoutResumeScreen';
import AddCardScreen from '../screen/CartScreen/AddCardScreen';
import ResumeCardScreen from '../screen/CartScreen/ResumeCardScreen';
import LanguageScreen from '../screen/Profile/LanguageScreen';
import CommandScreen from '../screen/Profile/CommandScreen';
import EditProfile from '../screen/Profile/EditProfile';
import RemiseAvoirScreen from '../screen/Profile/RemiseAvoirScreen';
import CartBancair from '../screen/CartScreen/CartBancair';
import CommandeDetail from '../screen/CommandCours/CommandeDetail';
import AdresseScreen from '../screen/Profile/AdresseScreen';
import AddAdressScreen from '../screen/Profile/AddAdressScreen';
import EditAdressScreen from '../screen/Profile/EditAdressScreen';
import EditCardBank from '../screen/CartScreen/EditCardBank';
import AddStripeUserCard from '../screen/Profile/AjouterCard';
import TermsConditions from '../screen/Terms&Condition';
import SignUpScreen from '../screen/Login/SignUpScreen';
import Signup from '../screen/Login/SignUp';
import CommandFacture from '../screen/CommandFacture';
import LegalNotice from '../screen/LegalNotice';
import ColiSuivi from '../screen/Coli/ColiSuivi';
import PasswordReturn from '../screen/Login/PasswordReturn';
import SupprimerCiompte from '../screen/Profile/SupprimerCiompte';
import verifTel from '../screen/Login/verifTel';
import {
  getCommand,
  getPanier,
  getSelectedCountry,
  getSelectedService,
  getServices,
  saveSelectedCountry,
  saveSelectedService,
} from '../modules/GestionStorage';
import axiosInstance from '../axiosInstance';

const {width: windowWidth, height: windowHeight} = Dimensions.get('window');

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AppNavigation = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async firebaseUser => {
      if (firebaseUser) {
        console.log('Utilisateur connecté:', firebaseUser);
        setUser(firebaseUser);
        await AsyncStorage.setItem('userData', JSON.stringify(firebaseUser));
      } else {
        console.log('Utilisateur déconnecté');
        setUser(null);
        await AsyncStorage.removeItem('userData');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const AuthStack = useMemo(
    () => (
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="PasswordReturn" component={PasswordReturn} />
        <Stack.Screen name="Verification" component={verifTel} />
      </Stack.Navigator>
    ),
    [],
  );

  const MainStack = useMemo(
    () => (
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="BottomTab" component={BottomTabNavigate} />
      </Stack.Navigator>
    ),
    [],
  );

  if (isLoading) {
    return <Splash />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <BagProvider>{MainStack}</BagProvider>
    </NavigationContainer>
  );
};

const BottomTabNavigate = () => {
  const [user, setUser] = useState(null);
  const [Service, setService] = useState(null);
  const [Loader, setLoader] = useState(false);
  const [Remises, setRemises] = useState([]);
  const [CartProducts, setCartProducts] = useState([]);
  const [RemiseLoader, setRemiseLoader] = useState(true);
  const [paysLivraison, setPaysLivraison] = useState('');
  const [count, setCount] = useState(0);
  const [BasketClasseRegroupement, setBasketClasseRegroupement] = useState('');
  const {setBagCount, bagCount} = useBag();

  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        left: 0,
        elevation: 0,
        height: windowHeight * 0.085,
        backgroundColor: '#fff',
      },
    }),
    [],
  );

  useEffect(() => {
    const user = auth().currentUser;
    if (user) {
    }
    setUser(user);
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        console.log('Utilisateur connecté:', user);
        setUser(user);
      } else {
        console.log('Utilisateur déconnecté');
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let mounted = true;

    setLoader(true);
    setRemiseLoader(true);
    setCartProducts([]);

    async function fetchValue() {
      try {
        // Recuperer le service
        let service = await getSelectedService();
        console.log('xxx');
        setService(service);

        // Recuperer le pays de livraison
        let selectedPaysLivraison = await getSelectedCountry();
        setPaysLivraison(selectedPaysLivraison);
        // Recuperer le panier
        let basketData = await getPanier();
        let basketCommand = await getCommand();
        console.log(basketData, 'basketData');
        if (basketData.length == 0) {
          setBagCount(0);
        } else {
          setBagCount(basketData.length);
        }

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

            // ... (le reste du code pour déterminer classeRegroupement)

            setBasketClasseRegroupement(classeRegroupement);
          }

          setCartProducts(basketData);
        }

        if (!service) {
          return;
        }

        // Recuperer les remises
        const user = auth().currentUser;
        if (user) {
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
              if (response.data && mounted) {
                setRemises(response.data);
                setRemiseLoader(false);
              }
            })
            .catch(function (error) {
              if (mounted) {
                setRemiseLoader(false);
              }
            });
        }

        if (mounted) {
          setLoader(false);
        }
      } catch (error) {
        console.log('error', error);
        if (mounted) {
          setLoader(false);
          setRemiseLoader(false);
        }
      }
    }

    fetchValue();

    return () => {
      mounted = false;
    };
  }, []);

  const HomeStack = useCallback(
    () => (
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="PaysLivraison" component={PaysLivraison} />
        <Stack.Screen name="ShoppingScreen" component={ShoppingScreen} />
        <Stack.Screen name="Login" component={ProfileStack} />
        <Stack.Screen name="ProductList" component={ProductList} />
        <Stack.Screen name="DepotScreen1" component={DepotScreen1} />
        <Stack.Screen name="DepotScreen2" component={DepotScreen2} />
        <Stack.Screen name="DepotScreen3" component={DepotScreen3} />
        <Stack.Screen name="Livraison1" component={Livraison1} />
        <Stack.Screen name="Livraison2" component={Livraison2} />
        <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
        <Stack.Screen
          name="CheckoutScreenDemandeAchat"
          component={CheckoutScreenDemandeAchat}
        />
        <Stack.Screen
          name="CheckoutResumeScreen"
          component={CheckoutResumeScreen}
        />
        <Stack.Screen name="AddCardScreen" component={AddCardScreen} />
        <Stack.Screen name="ResumeCardScreen" component={ResumeCardScreen} />
        <Stack.Screen name="AddAdresseScreen" component={AddAdressScreen} />
        <Stack.Screen name="CartBag" component={CartScreen} />
        <Stack.Screen name="CommandeScreen" component={CommandScreen} />
        <Stack.Screen name="CommandFacture" component={CommandFacture} />

        <Stack.Screen name="DetailCommandeScreen" component={CommandeDetail} />
        <Stack.Screen name="ColiSuivi" component={ColiSuivi} />
      </Stack.Navigator>
    ),
    [],
  );

  const MessageStack = useCallback(
    () => (
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="MessageScreen" component={MessageScreen} />
        <Stack.Screen name="Conversation" component={ConversationList} />
        <Stack.Screen
          name="ConversationDetails"
          component={ConversationDetails}
        />
      </Stack.Navigator>
    ),
    [],
  );

  const CartStack = useCallback(
    () => (
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {user ? (
          <Stack.Screen name="CartBag" component={CartScreen} />
        ) : (
          <Stack.Screen name="Login" component={ProfileStack} />
        )}
        {/* <Stack.Screen name="HomeScreen" component={HomeScreen} /> */}
        <Stack.Screen name="PasswordReturn" component={PasswordReturn} />
      </Stack.Navigator>
    ),
    [user],
  );

  const ProfileStack = useCallback(
    () => (
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {user ? (
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        ) : (
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
        )}
        <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
        {!user && <Stack.Screen name="Signup" component={Signup} />}
        <Stack.Screen name="Verification" component={verifTel} />
        <Stack.Screen name="PasswordReturn" component={PasswordReturn} />

        <Stack.Screen name="Homescreen" component={HomeStack} />
        <Stack.Screen name="CartBancair" component={CartBancair} />
        <Stack.Screen name="AddCardScreen" component={AddCardScreen} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="RemiseAvoir" component={RemiseAvoirScreen} />
        <Stack.Screen name="LanguageScreen" component={LanguageScreen} />
        <Stack.Screen name="CommandeScreen" component={CommandScreen} />
        <Stack.Screen name="DetailCommandeScreen" component={CommandeDetail} />
        <Stack.Screen name="AdresseScreen" component={AdresseScreen} />
        <Stack.Screen name="AddAdresseScreen" component={AddAdressScreen} />
        <Stack.Screen name="EditAdresseScreen" component={EditAdressScreen} />
        <Stack.Screen name="AddStripeUserCard" component={AddStripeUserCard} />
        <Stack.Screen name="EditCardBank" component={EditCardBank} />
        <Stack.Screen
          name="TermsAndConditionsScreen"
          component={TermsConditions}
        />
        <Stack.Screen name="CommandFacture" component={CommandFacture} />
        <Stack.Screen name="LegalNotice" component={LegalNotice} />
        <Stack.Screen name="ColiSuivi" component={ColiSuivi} />
        <Stack.Screen name="SupprimerCiompte" component={SupprimerCiompte} />
      </Stack.Navigator>
    ),
    [user],
  );

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({focused}) => (
            <MaterialCommunityIcons
              name="home-outline"
              size={24}
              color={focused ? '#2BA6E9' : '#2BA6E9'}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={Search}
        options={{
          tabBarIcon: ({focused}) => (
            <MaterialIcons
              name="search"
              size={24}
              color={focused ? '#2BA6E9' : '#2BA6E9'}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Message"
        component={MessageStack}
        options={{
          tabBarIcon: ({focused}) => (
            <Entypo
              name="mail"
              size={24}
              color={focused ? '#2BA6E9' : '#2BA6E9'}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartStack}
        options={{
          tabBarIcon: ({focused}) => (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}>
              <SimpleLineIcons
                name="handbag"
                size={24}
                color={focused ? '#2BA6E9' : '#2BA6E9'}
              />

              <View
                style={{
                  position: 'absolute',
                  top: -5,
                  right: -5,
                  backgroundColor: '#F4951A',
                  width: 20,
                  height: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 50,
                }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: 'Poppins-Medium',
                    color: '#fff',
                  }}>
                  {bagCount}
                </Text>
              </View>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          unmountOnBlur: true, // Ajoutez cette ligne
          tabBarIcon: ({focused}) => (
            <Feather
              name="user"
              size={24}
              color={focused ? '#2BA6E9' : '#2BA6E9'}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigation;
