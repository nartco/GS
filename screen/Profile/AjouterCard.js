import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ToastAndroid,
  Platform,
} from 'react-native';
import {getAuthentificationData} from '../../modules/GestionStorage';
import {useNavigation} from '@react-navigation/native';
import {CardField, createPaymentMethod} from '@stripe/stripe-react-native';
import Toast from 'react-native-toast-message';
import {saveCard} from '../../modules/GestionStripe';
import {useTranslation} from 'react-i18next';
import {HeaderEarth} from '../../components/Header';
import auth from '@react-native-firebase/auth';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const AddStripeUserCard = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();

  const [nom, setNom] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState({});

  useEffect(() => {
    async function fetchUser() {
      const email = await getAuthentificationData();
      setUserEmail(email);
    }
    fetchUser();
  }, []);

  const validateName = name => {
    const nameParts = name.trim().split(' ');
    return nameParts.length >= 2 && nameParts.every(part => part.length > 0);
  };

  const showToast = (message, type = 'error') => {
    if (Platform.OS === 'ios') {
      Toast.show({
        type: type,
        text1: t(type === 'error' ? 'Erreur' : 'Succès'),
        text2: message,
      });
    } else {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    }
  };

  const enregistrerCarte = async () => {
    if (!validateName(nom)) {
      showToast(t('Veuillez entrer un nom et un prénom valides'));
      return;
    }

    if (!cardDetails.complete) {
      showToast(t("La carte n'est pas valide !"));
      return;
    }

    setLoading(true);

    try {
      const {paymentMethod, error} = await createPaymentMethod({
        paymentMethodType: 'Card',
        paymentMethodData: {
          billingDetails: {
            name: nom,
          },
        },
      });

      if (error) {
        showToast(t('Erreur lors de la sauvegarde de la carte !'));
        setLoading(false);
        return;
      }

      const user = auth().currentUser;
      await saveCard(user.uid, nom, paymentMethod.id, user.phoneNumber);
      showToast(t('Carte enregistrée'), 'success');

      setTimeout(() => {
        navigation.navigate('CartBancair', {newCard: true});
      }, 3000);
    } catch (error) {
      console.log(error.response.data);
      showToast(t('Erreur lors de la sauvegarde de la carte !'));
    }

    setLoading(false);
  };

  return (
    <View style={{flex: 1}}>
      <View>
        <HeaderEarth />

        <View style={{marginTop: 27}}>
          <Text style={styles.titleText}>{t('Ajouter Cart Bancaire')}</Text>
        </View>

        <View style={styles.PaymentInputsContainer}>
          <View style={{width: '100%', marginBottom: 20}}>
            <Text style={styles.labelText}>
              {t('Nom et prénom du titulaire')}
            </Text>

            <TextInput
              value={nom}
              onChangeText={text => setNom(text)}
              placeholder="Samuel Witwicky"
              placeholderTextColor="#626262"
              style={styles.input}
            />
          </View>
          <Text style={styles.labelText}>{t('Numéro carte bancaire')}</Text>

          <CardField
            postalCodeEnabled={false}
            placeholder={{
              number: '4242 4242 4242 4242',
            }}
            cardStyle={styles.cardFieldStyle}
            style={styles.cardField}
            onCardChange={cardDetails => setCardDetails(cardDetails)}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={enregistrerCarte}
            disabled={loading}>
            <Text style={styles.buttonText}>{t('Enregistrer La Carte')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.goBack()}
            disabled={loading}>
            <Text style={styles.buttonText}>{t('Retour')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && <ActivityIndicator />}
    </View>
  );
};

const styles = StyleSheet.create({
  PaymentInputsContainer: {
    height: windowHeight * 0.22,
    width: windowWidth * 0.83,
    alignSelf: 'center',
    marginHorizontal: 'auto',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: windowWidth * 0.3,
  },
  titleText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#000',
    textAlign: 'center',
  },
  labelText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#000',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    width: '100%',
    height: 54,
    borderColor: '#AAB0B7',
    paddingLeft: 20,
    borderRadius: 8,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#000',
    backgroundColor: '#fff',
  },
  cardFieldStyle: {
    backgroundColor: '#FFFFFF',
    placeholderColor: '#999999',
    textColor: '#000000',
    borderColor: '#AAB0B7',
    borderWidth: 1,
    borderRadius: 8,
  },
  cardField: {
    width: '100%',
    height: 54,
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
    width: windowWidth * 0.5,
    alignSelf: 'center',
    backgroundColor: '#4E8FDA',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  buttonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
});

export default AddStripeUserCard;
