import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Dimensions,
  ToastAndroid,
  Platform,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {HeaderEarth} from '../../components/Header';
import PhoneInput from 'react-native-international-phone-number';
import {useTranslation} from 'react-i18next';
import axiosInstance from '../../axiosInstance';
import Toast from 'react-native-toast-message';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {HeaderActions} from '../../components/HeaderActions';
import {Dropdown} from 'react-native-element-dropdown';
import {removeCountryCode} from '../../components/removeCountryCode';
import {getCountryCodeFromPhone} from '../../components/getCountryCode';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const EditAdressScreen = props => {
  const id = props.route.params;
  const {t, i18n} = useTranslation();

  const [Adresse, setAdresse] = useState(id.adresse);
  const [Pays, setPays] = useState('');
  const [Ville, setVille] = useState(id.ville);
  const [CodePostal, setCodePostal] = useState(id.codePostal);
  const [AdresseLibelle, setAdresseLibelle] = useState(id.libelle);
  const [AdresseNom, setAdresseNom] = useState(id.nom);
  const [AdresseTelephone, setAdresseTelephone] = useState(id.telephone);
  const [AdressePays, setAdressePays] = useState(id.pays);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState();
  const [count, setCount] = useState(0);

  const libelleItems = [
    {label: t('Domicile'), value: t('Domicile')},
    {label: t('Bureau'), value: t('Bureau')},
    {label: t('Autre'), value: t('Autre')},
  ];

  const email = id.client.email;

  const handlePhoneChange = text => {
    console.log({count});
    if (count > 0) {
      setAdresseTelephone(text);
    }
    setCount(count + 1);
  };

  async function UpdateNewAddress(identity) {
    if (Adresse === '' || Ville === '') {
      if (Platform.OS == 'ios') {
        Toast.show({
          type: 'error',
          text1: t('Ville et Adresse'),
          text2: t("La ville et l'adresse sont obligatoires !"),
        });
      } else {
        ToastAndroid.show(
          t("La ville et l'adresse sont obligatoires !"),
          ToastAndroid.SHORT,
        );
      }

      return;
    }

    if (AdressePays === '') {
      if (Platform.OS == 'ios') {
        Toast.show({
          type: 'error',
          text1: t('Pays'),
          text2: t('Le pays est obligatoire'),
        });
      } else {
        ToastAndroid.show(t('Le pays est obligatoire'), ToastAndroid.SHORT);
      }
      return;
    }
    let concatenedPhone =
      selectedCountry.callingCode + removeCountryCode(AdresseTelephone);

    axiosInstance
      .put('/adresses/' + identity, {
        libelle: AdresseLibelle,
        nom: AdresseNom,
        telephone: concatenedPhone,
        pays: AdressePays,
        ville: Ville,
        codePostal: CodePostal,
        adresse: Adresse,
      })
      .then(function (response) {
        if (Platform.OS == 'ios') {
          Toast.show({
            type: 'success',
            text1: t('Succés'),
            text2: t('Adresse modifiée'),
          });
        } else {
          ToastAndroid.show(t('Adresse modifiée'), ToastAndroid.SHORT);
        }

        props.navigation.navigate('AdresseScreen', {pageForm: 'updated'});
      })
      .catch(function (error) {});
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

  return (
    <View>
      <HeaderActions navigation={() => props.navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{flex: 1, marginBottom: windowWidth * 0.5}}>
          <View style={{marginTop: 30, marginBottom: 12}}>
            <Text
              style={{
                fontFamily: 'Poppins-SemiBold',
                fontSize: 16,
                color: '#000',
                textAlign: 'center',
              }}>
              {t('Veuillez créer un address')}
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder={t('Pays')}
              value={AdressePays}
              style={{
                borderWidth: 1,
                borderColor: '#AAB0B7',
                fontFamily: 'Poppins-Regular',
                fontSize: 14,
                color: '#000',
                paddingLeft: 15,
                borderRadius: 8,
                backgroundColor: '#fff',
                height: 45,
              }}
              placeholderTextColor="#B0B0C3"
              keyboardType="ascii-capable"
              keyboardAppearance={'default'}
              onChangeText={newText => setAdressePays(newText)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Dropdown
              style={[styles.dropdown]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              autoScroll
              iconStyle={styles.iconStyle}
              containerStyle={styles.containerDepotStyle}
              itemTextStyle={{color: '#000'}}
              data={libelleItems}
              maxHeight={450}
              labelField="label"
              valueField="value"
              placeholder={t('Libellé adresse')}
              value={AdresseLibelle}
              showsVerticalScrollIndicator={false}
              onFocus={() => setIsOpen(true)}
              onBlur={() => setIsOpen(false)}
              onChange={item => {
                setAdresseLibelle(item.value);
              }}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder={t('Prénom et Nom')}
              value={AdresseNom}
              style={{
                borderWidth: 1,
                borderColor: '#AAB0B7',
                fontFamily: 'Poppins-Regular',
                fontSize: 14,
                color: '#000',
                paddingLeft: 15,
                borderRadius: 8,
                backgroundColor: '#fff',
                height: 45,
              }}
              placeholderTextColor="#B0B0C3"
              keyboardType="ascii-capable"
              keyboardAppearance={'default'}
              onChangeText={newText => setAdresseNom(newText)}
            />
          </View>

          <View style={styles.inputContainer}>
            <PhoneInput
              language={i18n.language}
              containerStyle={styles.countryPickerContainerStyle}
              textInputStyle={styles.textInput}
              defaultCountry={getCountryCodeFromPhone(AdresseTelephone)}
              selectedCountry={selectedCountry}
              onChangeSelectedCountry={country => {
                setSelectedCountry(country);
              }}
              value={removeCountryCode(AdresseTelephone)}
              onChangePhoneNumber={handlePhoneChange}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder={t('Code postal')}
              value={CodePostal}
              style={{
                borderWidth: 1,
                borderColor: '#AAB0B7',
                fontFamily: 'Poppins-Regular',
                fontSize: 14,
                color: '#000',
                paddingLeft: 15,
                borderRadius: 8,
                backgroundColor: '#fff',
                height: 45,
              }}
              placeholderTextColor="#B0B0C3"
              keyboardType="ascii-capable"
              keyboardAppearance={'default'}
              onChangeText={newText => setCodePostal(newText)}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder={t('Ville *')}
              value={Ville}
              style={{
                borderWidth: 1,
                borderColor: '#AAB0B7',
                fontFamily: 'Poppins-Regular',
                fontSize: 14,
                color: '#000',
                paddingLeft: 15,
                borderRadius: 8,
                backgroundColor: '#fff',
                height: 45,
              }}
              placeholderTextColor="#B0B0C3"
              keyboardType="ascii-capable"
              keyboardAppearance={'default'}
              onChangeText={newText => setVille(newText)}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder={t('Adresse *')}
              value={Adresse}
              style={{
                borderWidth: 1,
                borderColor: '#AAB0B7',
                fontFamily: 'Poppins-Regular',
                fontSize: 14,
                color: '#000',
                paddingLeft: 15,
                borderRadius: 8,
                backgroundColor: '#fff',
                height: 45,
              }}
              placeholderTextColor="#B0B0C3"
              keyboardType="ascii-capable"
              keyboardAppearance={'default'}
              onChangeText={newText => setAdresse(newText)}
            />
          </View>

          <View
            style={{
              marginTop: 50,
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            {/* <Button title={t("Ajouter l'adresse")} onPress={AddNewAddress}/> */}
            <TouchableOpacity
              style={{
                paddingVertical: 8,
                paddingHorizontal: 22,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#4E8FDA',
                borderRadius: 25,
              }}
              onPress={() => UpdateNewAddress(id.id)}>
              <Text
                style={{
                  fontFamily: 'Poppins-Medium',
                  fontSize: 12,
                  color: '#fff',
                }}>
                {t('Modifier Address')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  ProviderStyle: {},
  containerStyle: {
    flex: 1,
  },
  spacerStyle: {
    marginBottom: 15,
  },
  safeContainerStyle: {
    marginTop: 20,
    width: '80%',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  ButtonContainer: {
    width: '80%',
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F7F7F7',
    marginTop: windowHeight * 0.02,
    alignSelf: 'center',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  ButtonText: {
    // marginLeft: '5%',
    width: '78%',
    color: '#042C5C',
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
  },
  dropContainerStyle: {
    justifyContent: 'center',
    // backgroundColor: 'tomato',
    width: windowWidth * 0.9,
    // borderRadius:0
    alignSelf: 'center',
    marginTop: windowHeight * 0.02,
    marginBottom: windowHeight * 0.01,
  },

  dropdown: {
    height: 50,
    borderRadius: 7,
    paddingHorizontal: 17,
    backgroundColor: 'rgba(173, 173, 173, 0.2)',
    // elevation: 1,
    width: windowWidth * 0.8,
    alignSelf: 'center',
  },
  placeholderStyle: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    color: '#14213D',
  },
  selectedTextStyle: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    color: '#14213D',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  containerrrrStyle: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    maxHeight: 100,
    elevation: 10,
  },
  inputContainer: {
    width: windowWidth * 0.8,
    backgroundColor: 'rgba(173, 173, 173, 0.2)',
    alignSelf: 'center',
    borderRadius: 6,
    marginTop: '3%',
  },
  inputPaysContainer: {
    width: windowWidth * 0.8,
    alignSelf: 'center',
    borderRadius: 6,
    marginTop: '3%',
  },
  inputStyled: {
    width: windowWidth * 0.75,
    marginLeft: windowWidth * 0.03,
    color: '#000',
    fontFamily: 'Roboto-Regular',
  },
  phoneContainer: {
    width: windowWidth * 0.7,
    height: 50,
    backgroundColor: '#fff',
    elevation: 0,
  },
  textInput: {
    paddingVertical: 0,
    // backgroundColor: 'gold',
    width: windowWidth * 0.6,
    backgroundColor: '#fff',
    fontFamily: 'Roboto-Regular',
    color: '#000',
  },
  codeTextStyle: {
    fontFamily: 'Roboto-Regular',
    fontSize: 15,
    width: 'auto',
  },
  countryPickerButtonStyle: {
    width: 70,
  },
  containerDepotStyle: {
    backgroundColor: '#fff',
    borderRadius: 8,
    maxHeight: 250,
    elevation: 10,
  },
  textInputStyle: {
    fontFamily: 'Roboto-Regular',
    color: '#000',
  },
});

export default EditAdressScreen;
