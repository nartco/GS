import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {HeaderEarth} from '../../components/Header';
import styles from './styles';
import {
  getAuthentificationData,
  getDepotValues,
  getPlatformLanguage,
  saveSelectedService,
  saveServices,
} from '../../modules/GestionStorage';
import axiosInstance from '../../axiosInstance';
import _ from 'lodash';
import {useIsFocused} from '@react-navigation/native';
// const { width } = Dimensions.get('window');
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import auth from '@react-native-firebase/auth';

const HomeScreen = ({navigation}) => {
  var isFocused = useIsFocused();
  const [Services, setServices] = useState([]);
  const [ServicesRaw, setServicesRaw] = useState([]);
  const [Activity, setActivity] = useState(true);
  const [ActivityWave, setActivityWave] = useState(false);
  const [WaveSessionID, setWaveSessionID] = useState(null);
  const [loadLang, setLoadLang] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [userImage, setUserImage] = useState('');
  const [user, setUser] = useState(null);

  const handleQuantityChange = text => {
    setQuantity(text);
    calculateTotalAmount(text, unitPrice);
  };

  const handleUnitPriceChange = text => {
    setUnitPrice(text);
    calculateTotalAmount(quantity, text);
  };

  const calculateTotalAmount = (qty, price) => {
    const parsedQty = parseFloat(qty);
    const parsedPrice = parseFloat(price);

    if (!isNaN(parsedQty) && !isNaN(parsedPrice)) {
      const total = parsedQty * parsedPrice;
      setTotalAmount(total);
    }
  };

  useEffect(() => {
    if (!user) {
      setUser(auth().currentUser);
    }
    async function fetchServices() {
      setActivity(true);
      // Language
      const currentLanguage = await getPlatformLanguage();
      try {
        // let services = await getServices();

        // if (services.length < 1)
        // {
        const response = await axiosInstance.get('/service/');

        let services = response.data;

        // Sauvegarder
        await saveServices(response.data);
        // }

        setServicesRaw(services);

        let depotValues = await getDepotValues();

        let data = [];
        services.map(row => {
          let obj = {};
          obj.image = row.image;
          obj.id = row.id;
          obj.statut = row.statut;

          if ('fr' == currentLanguage) {
            obj.nom = row.nom;
            obj.message = row.message;
          } else {
            obj.nom = row.nomEN;
            obj.message = row.messageEN;
          }
          data.push(obj);
        });

        data = _.chunk(data, 2);

        setServices(data);
      } catch (erreur) {
        console.log('service fetch error', erreur, erreur.response);
      }

      setActivity(false);
    }

    async function requestUserPermission() {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        try {
          const token = await messaging().getToken();
        } catch (err) {
          console.log('the error ', err);
        }
      }
    }

    const getToken = async () => {
      try {
        const token = await messaging().getToken();
        console.log('233232324', token);
      } catch (err) {
        console.log('The error -> ', err);
      }
    };

    async function sendToken() {
      try {
        const Email = await getAuthentificationData();

        // Obtenez directement le token sans utiliser .then() sur messaging()
        const token = await messaging().getToken();

        // Envoyez le token au serveur
        await axiosInstance.post('/notification/register/device', {
          clientID: user?.uid,
          token: token,
        });
        console.log({token})
        console.log('Token envoyé avec succès');
      } catch (error) {
        console.log('The Error => ', error);
      }
    }

    // unsubscribeOnMessage()
    if (user) {
      getToken();
      requestUserPermission();
      sendToken();
    }
    fetchServices();

    if (Platform.OS == 'android') {
      StatusBar.setBackgroundColor('#2BA6E9');
      StatusBar.setBarStyle('light-content');
    }
    // gatLanguage()

    PushNotification.createChannel(
      {
        channelId: 'godareId', // (required)
        channelName: 'My channel', // (required)
        channelDescription: 'A channel to categorise your notifications', // (optional) default: undefined.
        playSound: false, // (optional) default: true
        vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
      },
      created => console.log(`createChannel returned '${created}'`), // (optional) callback returns whether the channel was created, false means it already existed.
    );
  }, [isFocused, user]);

  async function navigateToCountryDelivery(service) {
    if (service.statut) {
      let obj = null;

      ServicesRaw.map(row => {
        if (row.id == service.id) {
          obj = row;
        }
      });

      if (obj) {
        await saveSelectedService(obj);

        navigation.navigate('PaysLivraison');
      }
    }
  }

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      // Accessing the commandeId directly from the body of the notification
      const decodedData = remoteMessage.notification.body;
      const decodedTitle = remoteMessage.notification.title;
      const commandeId = remoteMessage.data.id;
      const paysLivraison = remoteMessage.data.paysLivraison;
      const type = remoteMessage.data.type;
      const message = remoteMessage.notification.body;
      const messageTitle = remoteMessage.notification.title;
      const data = remoteMessage.data;

      if (commandeId) {
        // })
        if (Platform.OS == 'ios') {
          PushNotificationIOS.addNotificationRequest({
            title: decodedData,
            body: decodedTitle,
            userInfo: {
              Command: commandeId,
              PayLivraison: paysLivraison,
              type: type,
            },
            id: 'usercommande',
          });
        } else {
          PushNotification.localNotification({
            channelId: 'godareId',
            title: messageTitle,
            message: message,
            data: data,
          });
        }
      }
    });

    return unsubscribe;
  }, []);

  if (Activity) {
    return (
      <View style={{flex: 1}}>
        <HeaderEarth />
        <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
          <ActivityIndicator size="large" color="#3292E0" style={{}} />
        </View>
      </View>
    );
  }

  const handleNotification = () => {
    PushNotificationIOS.presentLocalNotification({
      alertTitle: 'Test',
      alertBody: 'Message',
    });
  };

  return (
    <>
      <ScrollView
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
        style={{marginBottom: 50}}>
        <View style={{flex: 1}}>
          <HeaderEarth />
        </View>

        <View style={styles.superContainer}>
          {Services.map((row, index) => (
            <View style={styles.childContainer} key={index}>
              {row.map(service => (
                <TouchableOpacity
                  key={service.id}
                  style={styles.serviceContainer}
                  activeOpacity={0.7}
                  onPress={() => {
                    navigateToCountryDelivery(service);
                  }}>
                  <View>
                    <Text style={styles.textStylehead}>{service.nom}</Text>
                  </View>
                  <View>
                    <Image
                      source={{uri: service.image}}
                      resizeMode={'contain'}
                      style={styles.ImageStyle}
                    />
                  </View>
                  <View>
                    <Text style={styles.textStyletail}>{service.message}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  );
};

export default HomeScreen;
