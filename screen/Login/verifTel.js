import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ToastAndroid,
  Platform,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import Toast from 'react-native-toast-message';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {saveAuthentificationData} from '../../modules/GestionStorage';
import axiosInstance from '../../axiosInstance';
import {ActivityIndicator} from 'react-native-paper';

const VerifTel = ({navigation, route}) => {
  const {t} = useTranslation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [userCredential, setUserCredential] = useState(null);
  const [password, setPassword] = useState(null);
  const [email, setEmail] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (route.params?.phoneNumber) {
      setPhoneNumber(route.params.phoneNumber);
    }
    if (route.params?.password) {
      setPassword(route.params.password);
    }
    if (route.params?.email) {
      setEmail(route.params.email);
    }
    if (route.params?.userData) {
      setUserData(route.params.userData);
    }
  }, [route.params]);

  const showToast = (message, type = 'success') => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(t(message), ToastAndroid.SHORT);
    } else {
      Toast.show({
        type: type,
        text1: t(type === 'success' ? 'Succès' : 'Erreur'),
        text2: t(message),
      });
    }
  };

  const sendVerificationCode = async () => {
    setLoading(true);
    try {
      const formattedPhoneNumber = phoneNumber?.startsWith('+')
        ? phoneNumber
        : `+${phoneNumber}`;
      const confirmationResult = await auth().signInWithPhoneNumber(
        formattedPhoneNumber,
      );
      setConfirmation(confirmationResult);
      setCodeSent(true);
      showToast('Code de vérification envoyé');
    } catch (error) {
      console.error("Erreur lors de l'envoi du code:", error);
      showToast("Erreur lors de l'envoi du code: " + error.message, 'error');
    }
    setLoading(false);
  };

  const verifyCode = async () => {
    if (!confirmation) {
      showToast("Veuillez d'abord envoyer le code de vérification", 'error');
      return;
    }

    try {
      const phoneCredential = auth.PhoneAuthProvider.credential(
        confirmation.verificationId,
        verificationCode,
      );

      let userCredential;
      let newUser = false;

      if (email && password) {
        // Si l'email et le mot de passe sont fournis, lier le numéro de téléphone au compte existant
        userCredential = await auth()
          .signInWithEmailAndPassword(email, password)
          .then(cred => cred.user.linkWithCredential(phoneCredential));
        showToast('Numéro de téléphone lié avec succès au compte email');
      } else {
        newUser = true;
        // Si pas d'email, créer un nouveau compte avec le numéro de téléphone
        userCredential = await auth().signInWithCredential(phoneCredential);

        showToast('Nouveau compte créé avec le numéro de téléphone');
      }

      // Enregistrer les données utilisateur dans Firestore
      if (userData && newUser) {
        console.log('userData', userData);
        try {
          try {
            await firestore()
              .collection('users')
              .doc(userCredential.user.uid)
              .set({
                uuid: userCredential.user.uid,
                phone: phoneNumber,
                name: userData.name,
                prenom: userData.prenom,
                email: userData.email,
                birthday: userData.birthday,
                civilite: userData.civilite,
              });
          } catch (error) {
            console.log({error}, 'firestore');
          }

          console.log(
            '****************************',
            userCredential.user.uid,
            userData.name,
            userData.prenom,
            userData.email,
            phoneNumber,
            userData.birthday,
            '****************************',
          );
          const response = await axiosInstance
            .post('/clients/new', {
              uuid: userCredential.user.uid,
              nom: userData.name,
              prenom: userData.prenom,
              email: userData.email,
              telephone: phoneNumber,
              birthday: userData.birthday,
              civilite: userData.civilite,
            })
            .then(function (response) {})
            .catch(function (error) {
              console.log(error, error.response.data);
            });

          console.log(JSON.stringify(response));
        } catch (error) {
          console.log(error);
        }
      } else if (!newUser && userData) {
        await firestore()
          .collection('users')
          .doc(userCredential.user.uid)
          .set({
            uuid: userCredential.user.uid,
            phone: phoneNumber,
            ...userData,
          });
      }

      await saveAuthentificationData(phoneNumber);
      navigation.navigate('Login');
    } catch (error) {
      console.error('Erreur lors de la vérification du code:', error);
      if (error.code === 'auth/invalid-verification-code') {
        showToast('Code de vérification incorrect', 'error');
      } else if (error.code === 'auth/provider-already-linked') {
        showToast('Ce numéro de téléphone est déjà lié à un compte', 'warning');
      } else {
        showToast('Erreur lors de la vérification: ' + error.message, 'error');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {t('Vérification du numéro de téléphone')}
      </Text>
      <Text style={styles.phoneNumber}>{phoneNumber}</Text>

      {!codeSent ? (
        <TouchableOpacity
          style={styles.button}
          onPress={sendVerificationCode}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{t('Envoyer le code')}</Text>
          )}
        </TouchableOpacity>
      ) : (
        <View>
          <TextInput
            style={styles.input}
            placeholder={t('Entrez le code de vérification')}
            value={verificationCode}
            onChangeText={setVerificationCode}
            keyboardType="number-pad"
          />
          <TouchableOpacity style={styles.button} onPress={verifyCode}>
            <Text style={styles.buttonText}>{t('Vérifier le code')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  phoneNumber: {
    fontSize: 18,
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4E8FDA',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VerifTel;
