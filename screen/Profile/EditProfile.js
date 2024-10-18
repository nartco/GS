import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  ToastAndroid,
  Platform,
  Alert,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {HeaderEarth} from '../../components/Header';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import PhoneInput from 'react-native-international-phone-number';
import Button from '../../components/Button';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {getAuth, updateEmail} from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import firestore from '@react-native-firebase/firestore';
import {firebase_db} from '../../modules/FirebaseConfig';
import {useIsFocused} from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import DatePicker from 'react-native-date-picker';
import Toast from 'react-native-toast-message';
import AntDesign from 'react-native-vector-icons/AntDesign';
import auth from '@react-native-firebase/auth';
import IntlPhoneInput from 'react-native-intl-phone-input';

import {useTranslation} from 'react-i18next';
import {format} from 'date-fns';
import {HeaderActions} from '../../components/HeaderActions';
import {removeCountryCode} from '../../components/removeCountryCode';
import {getCountryCodeFromPhone} from '../../components/getCountryCode';
import {cleanPhoneNumber} from '../../components/cleanPhoneNumber';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const EditProfile = ({navigation}) => {
  var isFocused = useIsFocused();
  const [name, setName] = useState(undefined);
  const [id, setId] = useState(0);
  const [getData, setGetData] = useState([]);
  const [prename, setPrename] = useState([]);
  const [Email, setEmail] = useState(undefined);
  const [birthday, setBirthday] = useState(undefined);
  const [phoneNumber, setPhoneNumber] = useState(undefined);
  const [Activity, setActivity] = useState(true);
  const [date, setDate] = useState(new Date());
  const [isDate, setIsDate] = useState(new Date());
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);
  const [text, setText] = useState('');
  const [initializing, setInitializing] = useState(true);
  const [open, setOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectValue, setSelectValue] = useState('');
  const phoneInput = useRef(null);
  const [civilite, setCivilite] = useState('');
  const [isEditable1, setIsEditable1] = useState(true);
  const {t, i18n} = useTranslation();
  const [isEditable, setIsEditable] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [RefValue, setRefValue] = useState('');
  const [displayedDate, setDisplayedDate] = useState('');
  const [cleanTel, setCleanTel] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [count, setCount] = useState(0);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);

    let tempDate = new Date(currentDate);
    let fDate = `${tempDate.getDate()}/${
      tempDate.getMonth() + 1
    }/${tempDate.getFullYear()}`;

    setText(fDate);
  };

  const handlePhoneChange = text => {
    if (count > 0) {
      setPhoneNumber(text);
    }
    setCount(count + 1);
  };

  const showMode = currentMode => {
    setShow(true);
    setMode(currentMode);
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);

    let tempDate = new Date(currentDate);
    let fDate = `${tempDate.getDate()}/${
      tempDate.getMonth() + 1
    }/${tempDate.getFullYear()}`;

    settext(fDate);
  };

  useEffect(() => {
    fetchValue();
  }, [isFocused, navigation]);

  const fetchValue = async () => {
    setInitializing(true);
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        setEmail('');
        setPhoneNumber('');
        setBirthday('');
        setCivilite('');

        setGetData({});
        navigation.navigate('Login');
        throw new Error('Aucun utilisateur connecté');
      }

      // Récupérer les données de base de l'utilisateur depuis Firebase Auth
      const {uid, email, phoneNumber} = currentUser;
      setEmail(email);
      setPhoneNumber(phoneNumber || '');
      setCleanTel(removeCountryCode(phoneNumber));

      // Récupérer les données supplémentaires depuis Firestore
      const userDoc = await firestore().collection('users').doc(uid).get();

      if (userDoc.exists) {
        const userData = userDoc.data();

        setGetData(userData);
        setId(uid);
        setName(userData.name || '');
        setPrename(userData.prenom || '');
        setBirthday(userData.birthday || '');
        setCivilite(userData.civilite || '');

        // Si le numéro de téléphone n'est pas dans Auth, utilisez celui de Firestore

        if (!phoneNumber && userData.phone) {
          setPhoneNumber(userData.phone);
        }
      } else {
        console.log('Aucun document utilisateur trouvé dans Firestore');
      }
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des données utilisateur:',
        error,
      );
    } finally {
      setInitializing(false);
    }
  };

  const formatDate = inputDate => {
    // Parse the input date string
    const parsedDate = new Date(inputDate);

    // Format the date as per your desired output (MM/DD/YYYY)
    const formattedDate = format(parsedDate, 'dd/MM/yyyy');

    return formattedDate;
  };
  const inputDate = 'Wed Nov 08 2023 18:19:12 GMT+0100';
  const formattedDate = formatDate(isDate);

  async function updateUser() {
    try {
      // const auth = getAuth();
      const user = auth.currentUser;

      if (user && Email && Email !== user.email) {
        await updateEmail(user, Email);
      }
      let concatenedPhone =
        selectedCountry.callingCode + removeCountryCode(phoneNumber);
      const docRef = doc(firebase_db, 'users', id);
      await updateDoc(docRef, {
        name: !name ? getData.name : name,
        prenom: !prename ? getData.prenom : prename,
        email: !Email ? getData.email : Email,
        phone: !phoneNumber ? getData.phone : concatenedPhone,
        civilite: !civilite ? getData.civilite : civilite,
        birthday: !formattedDate ? getData.birthday : formattedDate,
      });

      if (Platform.OS == 'ios') {
        Toast.show({
          type: 'success',
          text1: t('Profil'),
          text2: t('Le profil a été modifié'),
        });
      } else {
        ToastAndroid.show(t('Le profil a été modifié'), ToastAndroid.SHORT);
      }
    } catch (error) {
      console.log('Error:', error);
    }
  }

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

  if (true == initializing) {
    return (
      <View style={{justifyContent: 'center', height: '80%'}}>
        <ActivityIndicator size="large" color="#3292E0" style={{}} />
      </View>
    );
  }
  const items = [
    {
      label: 'Mr',
      value: 'Mr',
    },
    {
      label: 'Mme',
      value: 'Mme',
    },
    {
      label: 'Autre',
      value: 'Autre',
    },
  ];

  const handleDisabeld = () => {
    setIsEditable(true);
    setIsEditable1(!isEditable1);
    setIsDisabled(false);
  };

  const handleDeas = () => {
    navigation.navigate('SupprimerCiompte');
  };
  return (
    <ScrollView
      style={{paddingBottom: 50}}
      showsVerticalScrollIndicator={false}>
      <View style={{flex: 1}}>
        <HeaderActions navigation={() => navigation.goBack()} />

        <View
          style={{
            marginTop: 30,
            marginBottom: 12,
            paddingHorizontal: 28,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <View style={{marginLeft: 'auto'}}>
            <Text
              style={{
                fontFamily: 'Poppins-SemiBold',
                fontSize: 16,
                color: '#000',
                textAlign: 'center',
              }}>
              {t('Mon profil')}
            </Text>
          </View>
          <View style={{marginLeft: 'auto'}}>
            <TouchableOpacity onPress={() => handleDisabeld()}>
              <MaterialCommunityIcons
                name="pencil-outline"
                size={28}
                color="#000"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{paddingHorizontal: 28}}>
          <View style={{marginTop: 12, position: 'relative', zIndex: 100}}>
            {/* <TextInput 
                        placeholder="Civilité"
                        style={{borderWidth: 1, borderColor: "#AAB0B7", paddingLeft: 15, borderRadius: 8,fontFamily: "Poppins-Regular", fontSize: 14, color: "#000", backgroundColor: "#fff"}}
                      /> */}
            <DropDownPicker
              disabled={isDisabled}
              items={items}
              open={open}
              setOpen={() => setOpen(!open)}
              value={civilite}
              setValue={val => setCivilite(val)}
              placeholder={getData.civilite}
              style={{position: 'relative', zIndex: 100}}
              onSelectItem={item => {
                setCivilite(item.value);
              }}
            />
          </View>
          <View style={{marginTop: 12, position: 'relative', zIndex: -100}}>
            <TextInput
              editable={isEditable}
              value={name}
              placeholder={getData.name}
              onChangeText={name => setName(name)}
              placeholderTextColor="#000"
              style={{
                borderWidth: 1,
                borderColor: '#AAB0B7',
                paddingLeft: 15,
                borderRadius: 8,
                fontFamily: 'Poppins-Regular',
                fontSize: 14,
                color: '#000',
                backgroundColor: '#fff',
                height: 50,
              }}
            />
          </View>
          <View style={{marginTop: 12, position: 'relative', zIndex: -100}}>
            <TextInput
              value={prename}
              editable={isEditable}
              placeholder={getData.prenom}
              placeholderTextColor="#000"
              onChangeText={prename => setPrename(prename)}
              style={{
                borderWidth: 1,
                borderColor: '#AAB0B7',
                fontFamily: 'Poppins-Regular',
                fontSize: 14,
                color: '#000',
                paddingLeft: 15,
                borderRadius: 8,
                backgroundColor: '#fff',
                height: 50,
              }}
            />
          </View>
          <View style={{marginTop: 12, flex: 1}}>
            <PhoneInput
              language={i18n.language}
              containerStyle={styles.countryPickerContainerStyle}
              textInputStyle={styles.textInput}
              defaultCountry={getCountryCodeFromPhone(phoneNumber)}
              selectedCountry={selectedCountry}
              onChangeSelectedCountry={country => {
                setSelectedCountry(country);
              }}
              placeholder={cleanTel}
              placeholderTextColor="#000"
              value={removeCountryCode(phoneNumber)}
              onChangePhoneNumber={handlePhoneChange}
              disabled={!isEditable}
            />
          </View>
          <View style={{marginTop: 12}}>
            <TextInput
              placeholderTextColor="#000"
              editable={isEditable}
              value={Email}
              placeholder={getData.email ? getData.email : 'Email'}
              onChangeText={Email => setEmail(Email)}
              style={{
                borderWidth: 1,
                borderColor: '#AAB0B7',
                fontFamily: 'Poppins-Regular',
                fontSize: 14,
                color: '#000',
                paddingLeft: 15,
                borderRadius: 8,
                backgroundColor: '#fff',
                height: 50,
              }}
            />
          </View>
          <View style={{marginTop: 12}}>
            <TextInput
              placeholder="*********"
              editable={isEditable}
              placeholderTextColor="#000"
              style={{
                borderWidth: 1,
                borderColor: '#AAB0B7',
                fontFamily: 'Poppins-Regular',
                fontSize: 14,
                color: '#000',
                paddingLeft: 15,
                borderRadius: 8,
                backgroundColor: '#fff',
                height: 50,
              }}
            />
          </View>
          <View style={{marginTop: 12}}>
            {/* <TextInput 
                        placeholder="04/10/1981"
                        placeholderTextColor="#000"
                        style={{borderWidth: 1, borderColor: "#AAB0B7",fontFamily: "Poppins-Regular", fontSize: 14, color: "#000", paddingLeft: 15, borderRadius: 8, backgroundColor: "#fff"}}
                      /> */}

            {/* <Text>{formattedDate}</Text> */}

            <TouchableOpacity
              style={[
                styles.inputCustomLogoContainer,
                styles.inputCustom,
                {justifyContent: 'end', marginTop: 0},
              ]}
              activeOpacity={0.7}
              editable={isEditable}
              onPress={() => {
                // showMode('date');
                if (isEditable == false) {
                  setOpen(false);
                } else {
                  setIsOpen(true);
                }
              }}>
              <Text style={{color: '#000'}}>
                {displayedDate == ''
                  ? getData.birthday
                    ? getData.birthday
                    : t('Date de naissance')
                  : displayedDate}
              </Text>

              {/*<TextInput
                                    placeholder={getData.birthday}
                                    placeholderTextColor={'#000'}
                                    keyboardType={'ascii-capable'}
                                    style={styles.inputCustom}
                                    value={formattedDate}
                                    onChange={e => {
                                    setText(e.nativeEvent.text.toString());
                                    }}
                                    onChangeText={onChange}
                                    editable={false}
                                />*/}

              <DatePicker
                modal
                mode="date"
                open={isOpen}
                locale={i18n.language == 'fr' ? 'fr' : 'en'}
                title={t('Select date')}
                confirmText={t('confirm')}
                cancelText={t('cancel')}
                date={isDate}
                onConfirm={date => {
                  setIsDate(date);
                  setDisplayedDate(formatDate(date));
                  setIsOpen(false);
                }}
                onCancel={() => {
                  setIsOpen(false);
                }}
              />
            </TouchableOpacity>
          </View>

          <View style={{marginTop: 50}}>
            <View
              style={{
                justifyContent: 'flex-end',
                alignItems: 'center',
                paddingBottom: 13,
              }}>
              <Button
                title={t('Valider les modifications')}
                bgColor={isEditable1}
                navigation={() => updateUser()}
              />
            </View>
            <View
              style={{
                justifyContent: 'flex-end',
                alignItems: 'center',
                paddingBottom: 120,
              }}>
              <Button
                // bgColor={isEditable1}
                title={t('Désactiver ou supprimer mon compte')}
                navigation={handleDeas}
              />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  inputCustomLogoContainer: {
    // backgroundColor: 'tomato',
    width: windowWidth * 0.8,
    height: windowHeight * 0.07,
    marginTop: 10,
    alignSelf: 'center',
    justifyContent: 'space-around',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputCustom: {
    // backgroundColor: 'tomato',
    borderWidth: 1,
    borderColor: '#AAB0B7',
    paddingLeft: 15,
    borderRadius: 8,
    fontFamily: 'Poppins-Regular',
    color: '#000',
    height: 54,
    width: windowWidth * 0.85,
    marginBottom: 12,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#fff',
  },
  countryPickerContainerStyle: {
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 3,
  },
  textInput: {
    paddingVertical: 0,

    width: windowWidth * 0.8,
    // backgroundColor: 'gold',
    backgroundColor: '#fff',
    fontFamily: 'Roboto-Regular',
    color: '#000',
  },
});
export default EditProfile;
