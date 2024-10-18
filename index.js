import { AppRegistry, Platform } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import * as RootNavigation from './navigation/RootNavigation';

// Configuration de PushNotification
PushNotification.configure({
  onRegister: function (token) {
    console.log('TOKEN:', token);
  },
  onNotification: function (notification) {
    console.log('NOTIFICATION:', notification);
    
    // Gestion des notifications quand l'app est ouverte
    if (notification.userInteraction) {
      handleNotificationNavigation(notification);
    }

    // Requis pour iOS
    notification.finish(PushNotificationIOS.FetchResult.NoData);
  },
  onAction: function (notification) {
    console.log('ACTION:', notification.action);
    console.log('NOTIFICATION:', notification);
  },
  onRegistrationError: function(err) {
    console.error(err.message, err);
  },
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },
  popInitialNotification: true,
  requestPermissions: true,
});

// Fonction pour gérer la navigation basée sur les notifications
function handleNotificationNavigation(notification) {
  const data = Platform.OS === 'ios' ? notification.data : notification;
  
  if (data.typeNotification === 'commande') {
    RootNavigation.navigate('ColiSuivi', {
      commandeId: data.Command || data.id,
      PayLivraisonId: data.PayLivraison || data.paysLivraison,
    });
  } else if (data.typeNotification === 'conversation') {
    RootNavigation.navigate('Conversation');
  }
}

// Gestion des messages en premier plan
messaging().onMessage(async remoteMessage => {
  console.log('Message reçu en premier plan:', remoteMessage);
  
  // Afficher une notification locale
  PushNotification.localNotification({
    title: remoteMessage.notification.title,
    message: remoteMessage.notification.body,
    data: remoteMessage.data,
  });
});

// Gestion des messages en arrière-plan
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message géré en arrière-plan:', remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);