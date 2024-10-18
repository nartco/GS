import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  StatusBar,
  TouchableOpacity,
  ToastAndroid,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styles from './style';
import Logo from '../../assets/images/LOGO_GS.png';
import user from '../../assets/images/profil.png';
import {
  getIdToken,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { auth } from '../../modules/FirebaseConfig';
import Feather from 'react-native-vector-icons/Feather';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

const PasswordReturn = props => {
  const [showPass, setshowPass] = useState('eye-with-line');
  const [Email, setEmail] = useState('');
  const [Password, setPassword] = useState();
  const { t, i18n } = useTranslation();
  const [userAdmin, setUserAdmin] = useState(null);
  const [tokenUser, setTokenUser] = useState('');
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: { Email: '', Password: '' },
  });

  useEffect(() => {
    onAuthStateChanged(auth, user => {
      setUserAdmin(user);
      if (user) {
        getIdToken(user)
          .then(token => {
            setTokenUser(token);
          })
          .catch(error => {
            console.error('Error getting authentication token:', error);
          });
      }
    });
  }, []);

  const changeIcon = () => {
    setshowPass(showPass === 'eye' ? 'eye-with-line' : 'eye');
  };

  const navigateToSignup = () => {
    props.navigation.navigate('Signup');
  };

  const checkEmailExists = async email => {
    try {
      const usersRef = firestore().collection('users');
      const lowercaseEmail = email.toLowerCase();
      const snapshot = await usersRef.where('email', '==', lowercaseEmail).get();

      if (!snapshot.empty) {
        return true;
      }

      const allUsersSnapshot = await usersRef.get();
      const emailExists = allUsersSnapshot.docs.some(
        doc => doc.data().email.toLowerCase() === lowercaseEmail,
      );

      return emailExists;
    } catch (error) {
      console.error("Erreur lors de la vérification de l'email:", error);
      return false;
    }
  };

  const handleForgotPassword = async () => {
    try {
      const emailExists = await checkEmailExists(Email);

      if (emailExists) {
        await sendPasswordResetEmail(auth, Email);

        if (Platform.OS === 'ios') {
          Toast.show({
            type: 'success',
            text1: t('Succès'),
            text2: t("Le lien pour réinitialiser votre mot de passe vient d'être envoyé par mail"),
          });
        } else {
          ToastAndroid.show(
            t("Le lien pour réinitialiser votre mot de passe vient d'être envoyé par mail"),
            ToastAndroid.SHORT,
          );
        }

        setShowCreateAccount(false);
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();

        setTimeout(() => {
          props.navigation.goBack();
        }, 2000);
      } else {
        setShowCreateAccount(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
        throw new Error('Email non trouvé');
      }
    } catch (error) {
      if (Platform.OS === 'ios') {
        Toast.show({
          type: 'error',
          text1: t('Erreur'),
          text2: t("L'email n'est pas enregistré dans notre base de données"),
        });
      } else {
        ToastAndroid.show(
          t("L'email n'est pas enregistré dans notre base de données"),
          ToastAndroid.SHORT,
        );
      }
    }
  };

  return (
    <LinearGradient
      colors={['#3885DA', '#29A9EA', '#3A7FD8']}
      style={{
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        position: 'relative',
      }}>
      <StatusBar backgroundColor="#3885DA" barStyle="auto" />

      <TouchableOpacity
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 10,
          position: 'absolute',
          top: windowWidth * 0.15,
          right: windowWidth * 0.05,
        }}
        onPress={() => props.navigation.goBack()}>
        <Feather name="x" color="#fff" size={30} />
      </TouchableOpacity>

      <View
        style={{
          width: windowWidth * 0.22,
          height: windowHeight * 0.12,
          justifyContent: 'space-around',
          alignItems: 'center',
          flexDirection: 'row',
          alignSelf: 'center',
          marginTop: windowWidth * 0.18,
        }}>
        <Image
          style={{
            width: windowWidth * 0.13,
            height: windowWidth * 0.13,
            objectFit: 'cover',
          }}
          source={Logo}
        />
        <Text style={{ fontFamily: 'Roboto-Bold', fontSize: 18, color: '#fff' }}>
          GS
        </Text>
      </View>

      <View
        style={{
          width: windowWidth * 0.8,
          justifyContent: 'center',
          alignItems: 'center',
          gap: windowWidth * 0.03,
          flexDirection: 'column',
          alignSelf: 'center',
        }}>
        <Text
          style={{
            fontFamily: 'Roboto-Medium',
            fontSize: windowWidth * 0.05,
            color: '#fff',
            textAlign: 'center',
          }}>
          {t('Mot de passe oublié ?')}
        </Text>
        <Text
          style={{
            fontFamily: 'Roboto-Medium',
            fontSize: windowWidth * 0.03,
            color: '#fff',
            textAlign: 'center',
            opacity: 0.8,
          }}>
          {t("Pour réinitialiser votre mot de passe, renseignez l'adresse email avec laquelle vous vous êtes inscrit.")}
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Controller
          name="Email"
          control={control}
          rules={{ required: t("L'e-mail est requis"), pattern: EMAIL_REGEX }}
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
            return (
              <>
                <View
                  style={[
                    styles.inputNumbCustom,
                    {
                      borderColor: error ? 'red' : '#fff',
                      borderWidth: error ? 1 : 0,
                    },
                  ]}>
                  <Image style={styles.profileLogo} source={user} />
                  <TextInput
                    placeholder={t('E-mail')}
                    style={styles.inputNumbStyled}
                    placeholderTextColor="#B0B0C3"
                    keyboardType="ascii-capable"
                    keyboardAppearance="default"
                    autoCapitalize="none"
                    focusable={true}
                    value={value}
                    onChange={valueInput => {
                      setEmail(valueInput.nativeEvent.text.toString());
                    }}
                    onChangeText={onChange}
                  />
                </View>
                {error && (
                  <Text style={styles.errorMessageTextStyle}>
                    {error.message || t("L'email n'est pas valide")}
                  </Text>
                )}
              </>
            );
          }}
        />
      </View>

      <View style={{ marginTop: 10 }}>
        <TouchableOpacity
          style={styles.Auth1}
          activeOpacity={0.7}
          onPress={handleForgotPassword}>
          <Text style={styles.AuthButtonText}>
            {t('Reinitialiser votre mot de passe')}
          </Text>
        </TouchableOpacity>

        <Animated.View style={{ opacity: fadeAnim }}>
          {showCreateAccount && (
            <TouchableOpacity
              style={[styles.Auth1, { marginTop: 10 }]}
              activeOpacity={0.7}
              onPress={navigateToSignup}>
              <Text style={styles.AuthButtonText}>{t('Créer un compte')}</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </LinearGradient>
  );
};

export default PasswordReturn;