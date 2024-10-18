import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  StatusBar,
  TouchableOpacity,
  ToastAndroid,
  Platform,
  Switch,
  Animated,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import firestore from '@react-native-firebase/firestore';

import PhoneInput from 'react-native-international-phone-number';

import {saveAuthentificationData} from '../../modules/GestionStorage';
import {Controller, useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styles from './style';
import Lock from 'react-native-vector-icons/Fontisto';
import Eye from 'react-native-vector-icons/Entypo';
import Icon from 'react-native-vector-icons/Ionicons';
import Logo from '../../assets/images/LOGO_GS.png';
import user from '../../assets/images/profil.png';
import auth from '@react-native-firebase/auth';

import axiosInstance from '../../axiosInstance';
import {getCountryCodeFromPhone} from '../../components/getCountryCode';
import {cleanPhoneNumber} from '../../components/cleanPhoneNumber';
import {removeCountryCode} from '../../components/removeCountryCode';

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const windowWidth = Dimensions.get('window').width;

const LoginScreen = props => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const IorPlat = Platform.OS;
  const [showPass, setshowPass] = useState('eye-with-line');
  const [Email, setEmail] = useState('');
  const [Password, setPassword] = useState('');
  const [isPhoneAuth, setIsPhoneAuth] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const {t, i18n} = useTranslation();
  const [userAdmin, setUserAdmin] = useState(null);
  const [tokenUser, setTokenUser] = useState('');
  const [selectedCountry, setSelectedCountry] = useState();

  const [phone, setPhone] = useState('');
  const [confirmResult, setConfirmResult] = useState(null);
  const [userId, setUserId] = useState('');
  const {control, handleSubmit} = useForm({
    defaultValues: {Email: '', Password: ''},
  });

  const phoneInput = useRef(null);
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  //////////////////////AUTH FIRE BASE TELEPHONE ////////////////////////

  const validatePhoneNumber = () => {
    let concatenedPhone = cleanPhoneNumber(
      selectedCountry.callingCode + removeCountryCode(phone),
    );

    console.log(concatenedPhone);
    const regexp = /^\+[0-9]?()[0-9](\s|\S)(\d[0-9]{8,16})$/;
    return regexp.test(concatenedPhone);
  };

  const checkPhoneNumberExists = async phoneNumber => {
    try {
      const usersRef = firestore().collection('users');
      const snapshot = await usersRef.where('phone', '==', phoneNumber).get();
      return !snapshot.empty;
    } catch (error) {
      console.error(
        'Erreur lors de la vérification du numéro de téléphone:',
        error,
      );
      return false;
    }
  };

  const handleSendCode = async () => {
    let concatenedPhone =
      selectedCountry.callingCode + removeCountryCode(phone);
    const phoneNumberExists = await checkPhoneNumberExists(concatenedPhone);
    console.log(validatePhoneNumber(), phoneNumberExists);
    if (validatePhoneNumber() && phoneNumberExists) {
      try {
        const confirmation = await auth().signInWithPhoneNumber(
          concatenedPhone,
        );
        console.log({confirmation}, 'confirmation');
        setConfirmResult(confirmation);
        showToast('Code envoyé');
      } catch (error) {
        console.error(error);
        showToast("Erreur lors de l'envoi du code", 'error');
      }
    } else {
      showToast(
        'Le numéro de téléphone n’est pas dans notre base de données',
        'error',
      );
    }
  };

  const showToast = (message, type = 'success') => {
    if (IorPlat === 'android') {
      ToastAndroid.show(t(message), ToastAndroid.SHORT);
    } else {
      Toast.show({
        type: type,
        text1: t(type === 'success' ? 'Succès' : 'Erreur'),
        text2: t(message),
      });
    }
  };

  const handleVerifyCode = async () => {
    try {
      console.log('121112212121');
      const confirm = await confirmResult.confirm(verificationCode);

      showToast('Connexion réussie');
      saveAuthentificationData(confirm.user.email);
      NavigateToMain();
    } catch (error) {
      console.error(error);
      showToast('Code de vérification incorrect', 'error');
    }
  };
  //////////////////////AUTH FIRE BASE TELEPHONE ////////////////////////

  const animateTransition = toEmail => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      setIsPhoneAuth(toEmail);
    }, 150);
  };

  useEffect(() => {
    checkCurrentUser();

    StatusBar.setBackgroundColor('#3885DA');
    StatusBar.setBarStyle('light-content');
  }, []);

  const checkCurrentUser = async () => {
    try {
      const user = auth().currentUser;
      setUserAdmin(user);
      if (user) {
        const token = await user.getIdToken();
        setTokenUser(token);
        NavigateToMain();
      }
    } catch (error) {
      console.error('Error checking current user:', error);
    } finally {
      // setIsLoading(false);
    }
  };
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(user => {
      if (user) {
        NavigateToMain();
      }
    });

    // Unsubscribe on unmount
    return () => subscriber();
  }, []);

  const changeIcon = () => {
    setshowPass(showPass === 'eye' ? 'eye-with-line' : 'eye');
  };

  const navigateToSignup = () => {
    props.navigation.navigate('Signup');
  };

  const NavigateToMain = () => {
    if (props.route && props.route.params && props.route.params.fromCart) {
      props.navigation.navigate('CartBag', {screen: 'WeightCal'});
      return;
    } else {
      props.navigation.navigate('HomeScreen');
      return;
    }
  };

  const handleSignin = async () => {
    const IorPlat = Platform.OS;

    if (!Email.trim() || !Password.trim()) {
      showToast(
        t("L'email et le mot de passe ne peuvent pas être vides"),
        'error',
      );

      return;
    }

    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        Email.trim(),
        Password.trim(),
      );

      // Sauvegarder l'email
      saveAuthentificationData(Email);

      if (IorPlat === 'ios') {
        Toast.show({
          type: 'success',
          text1: t('Succès'),
          text2: t('Connexion réussie'),
        });
      } else {
        ToastAndroid.show(t('Connexion réussie'), ToastAndroid.SHORT);
      }
      console.log(userCredential.user.uid, '23324iu23983382u239328u33');

      setTimeout(() => {
        axiosInstance
          .post('/notification/register/device', {
            clientID: userCredential.user.uid,
            token: tokenUser,
          })
          .then(function () {})
          .catch(function (error) {
            console.log(error);
          });

        // Aller sur la page d'accueil
        NavigateToMain();
      }, 200);
    } catch (error) {
      let errorMessage = '';

      switch (error.code) {
        case 'auth/wrong-password':
          errorMessage = 'Le mot de passe que vous saisissez est erroné';
          break;
        case 'auth/user-not-found':
          errorMessage =
            "Il n'y a pas d'utilisateur existant correspondant aux informations d'identification !";
          break;
        case 'auth/invalid-email':
          errorMessage = "L'e-mail fourni n'est pas valide !";
          break;
        case 'auth/invalid-password':
          errorMessage = "Le mot de passe fourni n'est pas valide !";
          break;
        case 'auth/invalid-login-credentials':
        case 'auth/invalid-credential':
          errorMessage = 'Mot de passe ou email incorrect, veuillez vérifier';
          break;
        default:
          errorMessage = "Une erreur s'est produite lors de la connexion";
      }

      if (IorPlat === 'ios') {
        Toast.show({
          type: 'error',
          text1: t('Erreur'),
          text2: t(errorMessage),
        });
      } else {
        ToastAndroid.show(t(errorMessage), ToastAndroid.SHORT);
      }

      console.log('Error code:', error.code);
      console.log('Error message:', error.message);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <LinearGradient
        colors={['#3885DA', '#29A9EA', '#3A7FD8']}
        style={styles.container}>
        <StatusBar backgroundColor="#3885DA" barStyle="auto" />

        <View style={styles.INContainer}>
          {Platform.OS == 'ios' ? (
            <Image style={styles.imageStyler} source={Logo} />
          ) : (
            <Image
              style={styles.imageStyler}
              source={Logo}
              resizeMode="center"
            />
          )}
          <Text style={styles.mainTextStyle}>GS</Text>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>{t('Email')}</Text>
            <Switch
              trackColor={{false: 'rgba(0,0,0.2)', true: 'rgba(0,0,0.2)'}}
              thumbColor="white"
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => animateTransition(!isPhoneAuth)}
              value={isPhoneAuth}
            />
            <Text style={styles.switchLabel}>{t('Téléphone')}</Text>
          </View>

          <Animated.View
            style={[styles.authMethodContainer, {opacity: fadeAnim}]}>
            {!isPhoneAuth ? (
              <>
                <Controller
                  name="Email"
                  control={control}
                  rules={{
                    required: t("L'e-mail est requis"),
                    pattern: EMAIL_REGEX,
                  }}
                  render={({field: {onChange, value}, fieldState: {error}}) => (
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
                          keyboardType="email-address"
                          autoCapitalize="none"
                          value={value}
                          onChangeText={text => {
                            onChange(text);
                            setEmail(text);
                          }}
                        />
                      </View>
                      {error && (
                        <Text style={styles.errorMessageTextStyle}>
                          {error.message || t("L'email n'est pas valide")}
                        </Text>
                      )}
                    </>
                  )}
                />

                <Controller
                  control={control}
                  name="Password"
                  render={({field: {onChange, value}, fieldState: {error}}) => (
                    <>
                      <View style={styles.inputCustom}>
                        <Lock name="locked" color={'#042C5C'} size={20} />
                        <TextInput
                          placeholder={t('Mot de passe')}
                          style={styles.inputStyled}
                          placeholderTextColor="#B0B0C3"
                          secureTextEntry={showPass === 'eye-with-line'}
                          value={value}
                          onChangeText={text => {
                            onChange(text);
                            setPassword(text);
                          }}
                        />
                        <Eye
                          name={showPass}
                          color={'#042C5C'}
                          size={20}
                          onPress={changeIcon}
                        />
                      </View>
                    </>
                  )}
                />
              </>
            ) : (
              <View style={styles.phoneAuthContainer}>
                {/* <View style={styles.inputCustom}> */}
                {/* <Telephone name="telephone" color={'#042C5C'} size={20} />
                <TextInput
                  placeholder={t('Numéro de téléphone')}
                  style={styles.inputStyled}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                /> */}

                <PhoneInput
                  language={i18n.language}
                  phoneInputStyles={{
                    container: {
                      marginHorizontal: 20,
                      width: windowWidth * 0.8,
                    },
                    input: {
                      width: windowWidth * 0.8,
                    },
                  }}
                  placeholder={t('Phone')}
                  textInputStyle={styles.textInput}
                  defaultCountry={'fr'}
                  selectedCountry={selectedCountry}
                  onChangeSelectedCountry={country => {
                    setSelectedCountry(country);
                  }}
                  value={phone}
                  onChangePhoneNumber={text => {
                    setPhone(text);
                  }}
                />
                {/* </View> */}
                {confirmResult ? (
                  <View style={styles.inputCustom}>
                    <Lock name="locked" color={'#042C5C'} size={20} />
                    <TextInput
                      placeholder={t('Code de vérification')}
                      style={styles.inputStyled}
                      value={verificationCode}
                      onChangeText={setVerificationCode}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                    <Icon
                      name={'reload-circle'}
                      color={'#042C5C'}
                      size={20}
                      onPress={() => setConfirmResult(null)}
                    />
                  </View>
                ) : null}
                {!confirmResult && isPhoneAuth && (
                  <TouchableOpacity
                    style={styles.Auth1}
                    onPress={confirmResult ? handleVerifyCode : handleSendCode}>
                    <Text style={styles.AuthButtonText}>
                      {confirmResult
                        ? t('Vérifier le code')
                        : t('Envoyer le code')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </Animated.View>
        </View>

        {!isPhoneAuth && (
          <TouchableOpacity
            onPress={() => props.navigation.navigate('PasswordReturn')}
            style={styles.forgotPassContainer}
            activeOpacity={0.7}>
            <Text style={styles.forgotText}>{t('Mot de passe oublié ?')}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.mainAuthBContain}>
          <TouchableOpacity
            style={styles.Auth1}
            activeOpacity={0.7}
            onPress={
              confirmResult
                ? handleVerifyCode
                : () => {
                    if (Email.trim() && Password.trim()) {
                      handleSubmit(handleSignin)();
                    } else {
                      showToast(
                        t(
                          "L'email et le mot de passe ne peuvent pas être vides",
                        ),
                        'error',
                      );
                    }
                  }
            }>
            <Text style={styles.AuthButtonText}>
              {confirmResult ? t('Vérifier le code') : t('Se connecter')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.Auth1}
            activeOpacity={0.7}
            onPress={navigateToSignup}>
            <Text style={styles.AuthButtonText}>
              {t("Pas de compte ? S'inscrire")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.Auth1}
            activeOpacity={0.7}
            onPress={() => props.navigation.navigate('HomeScreen')}>
            <Text style={styles.AuthButtonText}>
              {t("Passer l'identification")}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;
