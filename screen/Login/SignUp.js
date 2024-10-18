//import liraries
import React, {Component, useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  StatusBar,
  Modal,
  Dimensions,
  ScrollView,
  ToastAndroid,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
import {useForm, Controller} from 'react-hook-form';
import styles from './SignUpStyle';
import axiosInstance from '../../axiosInstance';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {HeaderEarth} from '../../components/Header';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import {auth, firebase_db} from '../../modules/FirebaseConfig';
import {addDoc, collection, setDoc, doc} from 'firebase/firestore';
import DropDownPicker from 'react-native-dropdown-picker';
import Button from '../../components/Button';
import DatePicker from 'react-native-date-picker';
import {format} from 'date-fns';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Checkbox from 'expo-checkbox';
import Pdf from 'react-native-pdf';
import {
  getConditionsMentionsLegales,
  getPlatformLanguage,
} from '../../modules/GestionStorage';
import PhoneInput from 'react-native-international-phone-number';
import {removeCountryCode} from '../../components/removeCountryCode';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

// create a component
const Signup = props => {
  const [modalVisible, setModalVisible] = useState(true);
  const [modalVisibleTerm, setModalVisibleTerm] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [ActivityMentionsConditions, setActivityMentionsConditions] =
    useState(true);
  const [ConditionsMentionsLegales, setConditionsMentionsLegales] = useState(
    {},
  );
  const [language, setLanguage] = useState('');
  const [credential, setCredential] = useState({});
  const [usePhoneAuth, setUsePhoneAuth] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState();
  const [{showError}, setShowError] = useState(false);

  useEffect(() => {
    reset(
      {Name: '', Phone: '', Password: '', Email: ''},
      {
        keepErrors: true,
        keepDirty: true,
        keepIsSubmitted: false,
        keepTouched: false,
        keepIsValid: false,
        keepSubmitCount: false,
      },
    );
  }, [reset]);

  useEffect(() => {
    if (Platform.OS != 'ios') {
      StatusBar.setBackgroundColor('#2BA6E9');
      StatusBar.setBarStyle('light-content');
    }

    async function fetchValue() {
      // Mentions légales
      setActivityMentionsConditions(true);
      const currentLanguage = await getPlatformLanguage();
      setLanguage(currentLanguage);
      let mentionsConditions = await getConditionsMentionsLegales();

      // Check if mentionsConditions exist and if it contains the desired code
      if (
        mentionsConditions &&
        mentionsConditions.hasOwnProperty('conditions_legales')
      ) {
        // Accessing the conditions_legales object from mentionsConditions
        let conditionsLegalesData = mentionsConditions['conditions_legales'];

        // You can then push this data wherever you need it
        // For example, if you want to push it into an array, you can do something like this
        let conditionsLegalesArray = [];
        conditionsLegalesArray.push(conditionsLegalesData);

        conditionsLegalesArray.forEach(item => {
          setConditionsMentionsLegales(item);
        });
        // Set the state with the data
      }
      setActivityMentionsConditions(false);
      if (!mentionsConditions) {
        axiosInstance
          .get('/conditions/mentions/legales/')
          .then(response => {
            if (response.data) {
              let obj = {};

              response.data.map(row => {
                obj[row.code] = row;
              });

              setConditionsMentionsLegales(obj);

              saveConditionsMentions(obj);

              setActivityMentionsConditions(false);
            }
          })
          .catch(function (error) {
            setActivityMentionsConditions(false);
          });
      }
      // else
      // {
      //   setConditionsMentionsLegales(mentionsConditions);
      //   setActivityMentionsConditions(false);
      // }
    }

    fetchValue();
  }, []);

  function generateRandomPassword(length = 12) {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    const allChars =
      uppercaseChars + lowercaseChars + numberChars + specialChars;

    let password = '';

    // Assurer au moins un caractère de chaque type
    password +=
      uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
    password +=
      lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
    password += numberChars[Math.floor(Math.random() * numberChars.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];

    // Remplir le reste du mot de passe
    for (let i = password.length; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * allChars.length);
      password += allChars[randomIndex];
    }

    // Mélanger le mot de passe
    return password
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
  }

  // Exemple d'utilisation

  const [Name, setName] = useState('');
  const [FirstName, setFirstName] = useState('');
  const [Email, setEmail] = useState('');
  const [Password, setPassword] = useState();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [civilite, setCivilite] = useState('');
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);
  const [text, settext] = useState('');
  const [isCheckedTwo, setIsCheckedTwo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [yesDate, setYesDate] = useState(false);

  const [displayedDate, setDisplayedDate] = useState('');
  const IosPlat = Platform.OS;

  const {t, i18n} = useTranslation();
  const [Datopen, setDateOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: {errors},
    reset,
    register,
    setValue,
  } = useForm();

  function calculateAge(dateISO) {
    var dateNaissance = new Date(dateISO);

    var diff = Date.now() - dateNaissance.getTime();

    var ageDt = new Date(diff);

    var age = Math.abs(ageDt.getUTCFullYear() - 1970);

    return age;
  }

  const formatDate = inputDate => {
    // Parse the input date string
    const parsedDate = new Date(inputDate);

    // Format the date as per your desired output (MM/DD/YYYY)
    const formattedDate = format(parsedDate, 'dd/MM/yyyy');

    return formattedDate;
  };
  const inputDate = 'Wed Nov 08 2023 18:19:12 GMT+0100';
  let formattedDate = formatDate(date);
  if (!yesDate) {
    formattedDate = null;
  }

  /* navigate to term and use */
  const navigateToTermsOfUse = () => {
    props.navigation.navigate('TermsAndConditionsScreen', {fromSign: 'signup'});
  };
  const NavigateToMain = () => {
    props.navigation.navigate('LoginScreen');
  };
  /* when user click on register it will trigger below function */
  const handleSignup = async () => {
    let Array = {
      Name: Name,
      FirstName: FirstName,
      Email: Email,
      DateOfBirth: date,
      Password: Password,
    };

    if (!date) {
      let message = t('La date de naissance est obligatoire');

      if (IosPlat != 'ios') {
        ToastAndroid.show(message, ToastAndroid.SHORT);
      } else {
        Toast.show({
          type: 'success',
          text1: t('Information'),
          text2: message,
        });
      }

      return;
    }

    let age = calculateAge(date);

    if (age && age < 12) {
      let message = t('Vous devez avoir au moins') + ' ' + 12 + t('ans');

      if (IosPlat != 'ios') {
        ToastAndroid.show(message, ToastAndroid.SHORT);
      } else {
        Toast.show({
          type: 'success',
          text1: t('Information'),
          text2: message,
        });
      }

      return;
    }

    setIsLoading(true);
    try {
      let cred;
      let pass;
      if (!Password && usePhoneAuth) {
        pass = generateRandomPassword(16);
      }
      if (Email.length > 2) {
        await createUserWithEmailAndPassword(
          auth,
          Email,
          Password?.length > 0 ? Password : pass,
        )
          .then(userCredential => {
            try {
              cred = userCredential;
              sendEmailVerification(userCredential.user);
            } catch (error) {
              console.log('sendEmailVerification:', error);
            }

            let message = t(
              'Compte utilisateur créé. Vous avez reçu un mail, veuillez confirmer votre email afin de pouvoir vous connecter',
            );
            if (IosPlat != 'ios') {
              ToastAndroid.show(message, ToastAndroid.SHORT);
            } else {
              Toast.show({
                type: 'success',
                text1: t('Succés'),
                text2: message,
              });
            }
            try {
              let concatenedPhone =
                selectedCountry.callingCode + removeCountryCode(phoneNumber);

              setDoc(doc(firebase_db, 'users', userCredential.user.uid), {
                uuid: cred.user.uid,
                name: Name,
                prenom: FirstName,
                phone: concatenedPhone,
                email: Email,
                birthday: formattedDate,
                civilite: civilite,
              });
            } catch (error) {
              console.log('Error adding document: ', error);
            }
            let concatenedPhone =
              selectedCountry.callingCode + removeCountryCode(phoneNumber);

            console.log(concatenedPhone, 'concatenedPhone');
            axiosInstance
              .post('/clients/new', {
                uuid: cred.user.uid,
                nom: Name,
                prenom: FirstName,
                email: Email,
                telephone: concatenedPhone,
                birthday: formattedDate,
                civilite: civilite,
              })
              .then(function (response) {})
              .catch(function (error) {
                console.log(error);
              });

            if (usePhoneAuth) {
              let concatenedPhone =
                selectedCountry.callingCode + removeCountryCode(phoneNumber);
              props.navigation.navigate('Verification', {
                phoneNumber: concatenedPhone,
                email: Email,
                password: Password.length > 0 ? Password : pass,
                userCredential: cred,
              });
            } else {
              setTimeout(() => {
                // alert('Register!'),
                NavigateToMain();
              }, 500);
            }
          })
          .catch(error => {
            if (error.code === 'auth/email-already-in-use') {
              if (IosPlat == 'ios') {
                Toast.show({
                  type: 'error',
                  text1: t('Erreur'),
                  text2: t('Cette adresse email est déjà utilisée!'),
                });
              } else {
                ToastAndroid.show(
                  t('Cette adresse email est déjà utilisée!'),
                  ToastAndroid.SHORT,
                );
              }
            }
            if (error.code === 'auth/invalid-email') {
              if (IosPlat == 'ios') {
                Toast.show({
                  type: 'error',
                  text1: t('Email invalide!'),
                  text2: t("L'e-mail fourni n'est pas valide !"),
                });
              } else {
                ToastAndroid.show(
                  t("L'e-mail fourni n'est pas valide !"),
                  ToastAndroid.SHORT,
                );
              }
            }

            setIsLoading(false);
          });
      } else {
        if (usePhoneAuth) {
          let concatenedPhone =
            selectedCountry.callingCode + removeCountryCode(phoneNumber);
          console.log(phoneNumber, 'phoneNumber');

          props.navigation.navigate('Verification', {
            phoneNumber: concatenedPhone,
            password: Password,
            userData: {
              name: Name,
              prenom: FirstName,
              phone: concatenedPhone,
              email: Email,
              birthday: formattedDate,
              civilite: civilite,
            },
          });
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const toggleCheckboxTwo = () => {
    setIsCheckedTwo(!isCheckedTwo); // Toggle checkbox state
  };

  const items = [
    {
      label: 'Homme',
      value: 'Homme',
    },
    {
      label: 'Femme',
      value: 'Femme',
    },
    {
      label: 'Autre',
      value: 'Autre',
    },
  ];

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
  const ShowTerms = () => {
    return (
      <>
        {modalVisibleTerm && (
          <>
            {/* <HeaderEarth /> */}
            <Modal visible={modalVisibleTerm} animationType="slide">
              <View style={{flex: 1}}>
                {Platform.OS == 'ios' ? (
                  <CustomStatuBar backgroundColor="#2BA6E9" />
                ) : (
                  <></>
                )}
                <TouchableOpacity onPress={() => setModalVisibleTerm(false)}>
                  <Text
                    style={{
                      color: 'blue',
                      paddingLeft: 10,
                      paddingTop: 15,
                      fontSize: 25,
                    }}>
                    X
                  </Text>
                </TouchableOpacity>
                <Pdf
                  key={'pdfView'}
                  trustAllCerts={false}
                  source={{
                    uri:
                      language == 'fr'
                        ? ConditionsMentionsLegales.fichier
                        : ConditionsMentionsLegales.fichierEN,
                  }}
                  style={{flex: 1, width: '100%', height: '100%'}}
                  onLoadComplete={() => console.log('PDF chargé')}
                  onError={error =>
                    console.log('Erreur de chargement du PDF', error)
                  }
                />
              </View>
            </Modal>
          </>
        )}
      </>
    );
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'position' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? -200 : 100}
      style={{flex: 1}}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeaderEarth />
        <View style={{flex: 1, alignItems: 'center', marginBottom: 80}}>
          <View style={{marginTop: 30, marginBottom: 12}}>
            <Text
              style={{
                fontFamily: 'Poppins-SemiBold',
                fontSize: 16,
                color: '#000',
                textAlign: 'center',
                marginBottom: 10,
              }}>
              {t('Veuillez créer un compte')}
            </Text>
          </View>

          <View
            style={{
              position: 'absolute',
              top: windowWidth * 0.04,
              right: windowWidth * 0.04,
            }}>
            <TouchableOpacity onPress={() => props.navigation.goBack()}>
              <AntDesign name="close" size={30} color="#000" />
            </TouchableOpacity>
          </View>
          <View style={styles.signupView}>
            <Controller
              control={control}
              name="Name"
              rules={{
                required: t('Le nom est requis'),
                minLength: {
                  value: 3,
                  message: t('Le nom doit comporter 3 caractères'),
                },
              }}
              render={({
                field: {onChange, onBlur, value},
                fieldState: {error},
              }) => {
                return (
                  <>
                    <View
                      style={{
                        borderBottomColor: error ? 'red' : '#E6E6E6',
                        zIndex: 100,
                      }}>
                      <DropDownPicker
                        zIndex={3000}
                        zIndexInverse={1000}
                        items={items}
                        open={isOpen}
                        setOpen={() => setIsOpen(!isOpen)}
                        value={civilite}
                        setValue={val => setCivilite(val)}
                        placeholder={t('Civilite')}
                        dropDownContainerStyle={{
                          width: windowWidth * 0.8,
                          borderColor: '#AAB0B7',
                          zIndex: 103330,
                        }}
                        style={{
                          position: 'relative',
                          zIndex: 100333,
                          borderWidth: 1,
                          borderColor: '#AAB0B7',
                          paddingLeft: 15,
                          borderRadius: 8,
                          fontFamily: 'Poppins-Regular',
                          color: '#000',
                          width: windowWidth * 0.8,
                          marginBottom: 12,
                          height: 54,
                          fontSize: 14,
                          color: '#000',
                          backgroundColor: '#fff',
                        }}
                        placeholderStyle={{color: '#AAB0B7'}}
                        onSelectItem={item => {
                          setCivilite(item.value);
                        }}
                      />
                    </View>
                    {error && (
                      <Text style={styles.errorMessageTextStyle}>
                        {error.message || t('Erreur')}
                      </Text>
                    )}
                  </>
                );
              }}
            />
            <Controller
              control={control}
              name="Name"
              rules={{
                required: t('Le nom est requis'),
                minLength: {
                  value: 3,
                  message: t('Le nom doit comporter 3 caractères'),
                },
              }}
              render={({
                field: {onChange, onBlur, value},
                fieldState: {error},
              }) => {
                return (
                  <>
                    <View
                      style={{
                        borderBottomColor: error ? 'red' : '#E6E6E6',
                        borderBottomWidth: 1,
                        borderBottomColor: error ? 'red' : '#E6E6E6',
                        borderBottomWidth: 0,
                        position: 'relative',
                        zIndex: -100,
                      }}>
                      <TextInput
                        placeholder={t('Nom')}
                        placeholderTextColor={'#BCB8B1'}
                        keyboardType={'ascii-capable'}
                        onBlur={onBlur}
                        autoFocus={true}
                        focusable={true}
                        style={styles.inputCustom}
                        value={value}
                        onChange={valueInput => {
                          setName(valueInput.nativeEvent.text.toString());
                        }}
                        onChangeText={onChange}
                      />
                    </View>
                    {error && (
                      <Text style={styles.errorMessageTextStyle}>
                        {error.message || t('Erreur')}
                      </Text>
                    )}
                  </>
                );
              }}
            />
            <Controller
              control={control}
              name="Prénom"
              rules={{
                required: t('Le prénom est requis'),
                minLength: {
                  value: 3,
                  message: t('Le prénom doit comporter 3 caractères'),
                },
              }}
              render={({
                field: {onChange, onBlur, value},
                fieldState: {error},
              }) => {
                return (
                  <>
                    <View
                      style={{
                        borderBottomColor: error ? 'red' : '#E6E6E6',
                        borderBottomWidth: 0,
                        position: 'relative',
                        zIndex: -100,
                      }}>
                      <TextInput
                        placeholder={t('Prénom')}
                        placeholderTextColor={'#BCB8B1'}
                        keyboardType={'ascii-capable'}
                        onBlur={onBlur}
                        style={styles.inputCustom}
                        value={value}
                        onChange={valueInput => {
                          setFirstName(valueInput.nativeEvent.text.toString());
                        }}
                        onChangeText={onChange}
                      />
                    </View>
                    {error && (
                      <Text style={styles.errorMessageTextStyle}>
                        {error.message || t('Erreur')}
                      </Text>
                    )}
                  </>
                );
              }}
            />
            <Controller
              control={control}
              name="Phone"
              rules={{
                required: t('Le téléphone est requis'),
                minLength: {
                  value: 6,
                  message: t('Le téléphone doit comporter 6 caractères'),
                },
              }}
              render={({
                field: {onChange, onBlur, value},
                fieldState: {error},
              }) => {
                return (
                  <>
                    <View style={styles.inputCountryCustomContainer}>
                      <PhoneInput
                        language={i18n.language}
                        containerStyle={styles.countryPickerContainerStyle}
                        textInputStyle={styles.textInput}
                        defaultCountry={'fr'}
                        selectedCountry={selectedCountry}
                        onChangeSelectedCountry={country => {
                          setSelectedCountry(country);
                        }}
                        value={phoneNumber}
                        onChangePhoneNumber={e => {
                          onChange(e);
                          setPhoneNumber(e);
                        }}
                      />
                    </View>
                    {error && (
                      <Text
                        style={[
                          styles.errorMessageTextStyle,
                          {textAlign: 'right'},
                        ]}>
                        {error.message || t('Erreur')}
                      </Text>
                    )}
                  </>
                );
              }}
            />
            <View style={styles.checkboxContainer}>
              <Checkbox
                value={usePhoneAuth}
                onValueChange={setUsePhoneAuth}
                style={styles.checkbox}
              />
              <Text style={styles.label}>
                {t("Utiliser l'authentification par téléphone")}
              </Text>
            </View>
            <Controller
              control={control}
              name="Email"
              rules={{
                // required: t('Email is required'),
                pattern: EMAIL_REGEX,
              }}
              render={({
                field: {onChange, onBlur, value},
                fieldState: {error},
              }) => {
                return (
                  <>
                    <View
                      style={{
                        borderBottomColor: error ? 'red' : '#E6E6E6',
                        borderBottomWidth: 0,
                        position: 'relative',
                        zIndex: -100,
                      }}>
                      <TextInput
                        placeholder={t('E-mail')}
                        placeholderTextColor={'#BCB8B1'}
                        keyboardType={'email-address'}
                        style={styles.inputCustom}
                        value={value}
                        onChange={valueInput => {
                          setEmail(valueInput.nativeEvent.text.toString());
                        }}
                        onChangeText={onChange}
                      />
                    </View>
                    {error && (
                      <Text style={styles.errorMessageTextStyle}>
                        {error.message || t('Email is not Valid')}
                      </Text>
                    )}
                  </>
                );
              }}
            />

            {Email.length > 0 && (
              <Controller
                control={control}
                name="Password"
                rules={{
                  // required: t('Mot de passe requis'),
                  minLength: {
                    value: 6,
                    message: t('Le mot de passe doit comporter 6 caractères'),
                  },
                }}
                render={({
                  field: {onChange, onBlur, value},
                  fieldState: {error},
                }) => {
                  return (
                    <>
                      <View
                        style={{
                          borderBottomColor: error ? 'red' : '#E6E6E6',
                          borderBottomWidth: 0,
                          position: 'relative',
                          zIndex: -100,
                        }}>
                        <TextInput
                          placeholder={t('Mot de passe')}
                          placeholderTextColor={'#BCB8B1'}
                          keyboardType={'ascii-capable'}
                          secureTextEntry={true}
                          style={styles.inputCustom}
                          value={Password}
                          onChange={valueInput => {
                            setPassword(valueInput.nativeEvent.text.toString());
                          }}
                          onChangeText={onChange}
                        />
                      </View>
                      {error && (
                        <Text style={styles.errorMessageTextStyle}>
                          {error.message || t('Erreur')}
                        </Text>
                      )}
                    </>
                  );
                }}
              />
            )}
            <Controller
              name="Date"
              control={control}
              //rules={{required: t('La date de naissance est obligatoire') }}
              render={({
                field: {onChange, onBlur, value},
                fieldState: {error},
              }) => {
                return (
                  <>
                    <TouchableOpacity
                      style={{
                        width: windowWidth * 0.7,
                        height: windowHeight * 0.07,
                        alignSelf: 'center',
                        justifyContent: 'end',
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: '#AAB0B7',
                        paddingLeft: 15,
                        borderRadius: 8,
                        fontFamily: 'Poppins-Regular',
                        color: '#000',
                        height: 54,
                        width: windowWidth * 0.8,
                        marginBottom: 12,
                        fontSize: 14,
                        color: '#000',
                        backgroundColor: '#fff',
                      }}
                      activeOpacity={0.7}
                      onPress={() => {
                        setDateOpen(true);
                      }}>
                      <Text
                        style={
                          displayedDate == ''
                            ? {color: '#BCB8B1'}
                            : {color: '#000'}
                        }>
                        {displayedDate == ''
                          ? t('Date de naissance')
                          : displayedDate}
                      </Text>

                      <DatePicker
                        modal
                        mode="date"
                        open={Datopen}
                        locale={i18n.language == 'fr' ? 'fr' : 'en'}
                        title={t('Select date')}
                        confirmText={t('confirm')}
                        cancelText={t('cancel')}
                        date={date}
                        onConfirm={date => {
                          setDate(date);
                          setDateOpen(false);
                          setDisplayedDate(formatDate(date));
                          setYesDate(true);
                        }}
                        onCancel={() => {
                          setDateOpen(false);
                        }}
                      />
                    </TouchableOpacity>
                    {error && (
                      <Text style={styles.errorMessageTextStyle}>
                        {error.message || 'error'}
                      </Text>
                    )}
                  </>
                );
              }}
            />

            <View style={styles.agreeTermTextContainer}>
              <Checkbox
                value={isCheckedTwo}
                onValueChange={toggleCheckboxTwo}
                color={isCheckedTwo && '#3292E0'}
                style={{elevation: 0, borderWidth: 1}}
              />
              {/*  J’atteste avoir lu vos conditions générales d’utilisation et les accepte */}
              <View style={styles.agreeMax}>
                <Text style={styles.agreeTermText}>
                  {t('Vous acceptez nos')}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    // navigateToTermsOfUse();
                    setModalVisibleTerm(true);
                  }}>
                  <Text style={styles.agreeTermUSeText}>
                    {' '}
                    {t('conditions générales d’utilisation')}
                  </Text>
                </TouchableOpacity>

                {/* <Text style={[styles.agreeTermText, {paddingLeft: 7}]}>{t('et les accepte')}</Text> */}
              </View>
            </View>
            <View style={{marginTop: 27, marginBottom: 20}}>
              <View
                style={{
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                }}>
                {/* <Button title={t("s'inscrire")} navigation={handleSubmit(handleSignup)} /> */}
                <TouchableOpacity
                  onPress={handleSubmit(handleSignup)}
                  disabled={!isCheckedTwo}
                  style={{
                    paddingVertical: 8,
                    width: windowWidth * 0.5,
                    paddingHorizontal: 22,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: !isCheckedTwo ? '#666' : '#4E8FDA',
                    borderRadius: 25,
                  }}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text
                      style={{
                        fontFamily: 'Poppins-Medium',
                        fontSize: 12,
                        color: '#fff',
                      }}>
                      {t("s'inscrire")}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        <ShowTerms />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

//make this component available to the app
export default Signup;
