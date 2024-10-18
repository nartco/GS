import {
  View,
  Text,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Dimensions,
} from 'react-native';
import React, {useRef, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import France from '../../assets/images/france.png';
import Feather from 'react-native-vector-icons/Feather';
import CoteIvoire from '../../assets/images/cote_ivoire.png';
import SmallEarth from '../../assets/images/small_earth.png';
import DropDownPicker from 'react-native-dropdown-picker';
import Button from '../../components/Button';
// import Stepper from '../Stepper';
import PhoneInput from 'react-native-international-phone-number';
import DropDown from '../../components/DropDown';
import {ScrollView} from 'react-native-virtualized-view';
import IntlPhoneInput from 'react-native-intl-phone-input';
import {useTranslation} from 'react-i18next';
import {removeCountryCode} from '../../components/removeCountryCode';
import { getCountryCodeFromPhone } from '../../components/getCountryCode';
const windowWidth = Dimensions.get('window').width;

const DepotScreen2 = ({navigation}) => {
  const {i18n} = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [current, setCurrent] = useState();
  const [current2, setCurrent2] = useState();
  const [phoneNumber, setPhoneNumber] = useState('');
  const phoneInput = useRef(null);
  const [value, setValue] = useState('');
  const [cleanTel, setCleanTel] = useState('');
  const [formattedValue, setFormattedValue] = useState('');

  const items = [
    {
      label: 'France',
      value: 'france',
    },
    {
      label: 'France',
      value: 'germany',
    },
    {
      label: 'France',
      value: 'italy',
    },
  ];
  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView
        style={{paddingBottom: 25}}
        showsVerticalScrollIndicator={false}>
        <View style={{flex: 1}}>
          <View
            style={{
              position: 'relative',
              alignItems: 'center',
              backgroundColor: '#2BA6E9',
              justifyContent: 'center',
              height: hp(12),
            }}>
            <Text
              style={{fontSize: 14, color: '#fff', fontFamily: 'Roboto-Bold'}}>
              Fret par avoin
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                marginTop: 10,
              }}>
              <View
                style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                <Image source={France} />
                <Text
                  style={{
                    fontSize: 14,
                    color: '#fff',
                    fontFamily: 'Roboto-Regular',
                  }}>
                  France
                </Text>
                <Feather name="arrow-up-right" color="#fff" size={22} />
              </View>
              <View
                style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                <Image source={CoteIvoire} />
                <Text
                  style={{
                    fontSize: 14,
                    color: '#fff',
                    fontFamily: 'Roboto-Regular',
                  }}>
                  Côte d'ivoire
                </Text>
                <Feather name="arrow-up-right" color="#fff" size={22} />
              </View>
            </View>

            <View style={{position: 'absolute', top: 15, right: 10}}>
              <Image source={SmallEarth} />
              <Text
                style={{
                  fontSize: 14,
                  color: '#fff',
                  fontFamily: 'Roboto-Bold',
                  textAlign: 'center',
                  marginTop: 4,
                }}>
                GS
              </Text>
            </View>
          </View>

          {/* <View>
              <Stepper position={1}/>
            </View> */}

          <View style={{marginTop: 28, paddingHorizontal: 16}}>
            <DropDown />
            <View style={{marginTop: 10}}>
              <Text
                style={{
                  fontFamily: 'Poppins-Regular',
                  fontSize: 10,
                  color: '#000',
                }}>
                *Livrasion 72h aprés la prise en charge
              </Text>
            </View>
          </View>

          <View style={{marginTop: 10, paddingHorizontal: 16}}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'position' : 'height'}
              style={{
                backgroundColor: '#fff',
                paddingVertical: 22,
                paddingHorizontal: 14,
                borderRadius: 10,
              }}>
              <Text
                style={{
                  fontFamily: 'Poppins-Medium',
                  fontSize: 14,
                  color: '#000',
                }}>
                Adresse d'enlèvement
              </Text>
              <View style={{marginTop: 10}}>
                <DropDownPicker
                  items={items}
                  open={isOpen2}
                  setOpen={() => setIsOpen2(!isOpen2)}
                  value={current2}
                  setValue={val => setCurrent2(val)}
                  dropDownContainerStyle={{
                    backgroundColor: '#fff',
                    borderColor: '#000',
                    fontSize: 54,
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    borderColor: '#000',
                    fontSize: 54,
                  }}
                  listItemContainerStyle={{borderBottomColor: '#000'}}
                  placeholder="Choisir une adresse existane"
                  placeholderStyle={{
                    fontFamily: 'Poppins-Regular',
                    fontSize: 16,
                    color: '#AFAFAF',
                  }}
                  textStyle={{
                    fontFamily: 'Poppins-Regular',
                    fontSize: 14,
                    color: '#000',
                  }}
                />
              </View>
              <View style={{marginTop: 16}}>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#000',
                    fontSize: 15,
                    fontFamily: 'Poppins-Medium',
                    borderRadius: 8,
                    paddingVertical: 14,
                    paddingLeft: 20,
                  }}
                  placeholder="Ajouter une nouvelle adresse"
                  placeholderTextColor={{color: '#000'}}
                />
              </View>
            </KeyboardAvoidingView>
          </View>

          <View
            style={{
              marginTop: 10,
              marginBottom: 20,
              paddingHorizontal: 16,
              position: 'relative',
              zIndex: -1000,
            }}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'position' : 'height'}
              style={{
                backgroundColor: '#fff',
                paddingVertical: 22,
                paddingHorizontal: 14,
                borderRadius: 10,
              }}>
              <Text
                style={{
                  fontFamily: 'Poppins-Medium',
                  fontSize: 14,
                  color: '#000',
                }}>
                Les coordonnées de la personne à contacter
              </Text>

              <View style={{marginTop: 8}}>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#000',
                    fontSize: 15,
                    fontFamily: 'Poppins-Medium',
                    borderRadius: 8,
                    paddingVertical: 14,
                    paddingLeft: 20,
                  }}
                  placeholder="Nom de la personne à contacter"
                  placeholderTextColor={{color: '#000'}}
                />
              </View>

              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 10,
                  marginBottom: 10,
                }}>
                <PhoneInput
                  language={i18n.language}
                  containerStyle={styles.countryPickerContainerStyle}
                  textInputStyle={styles.textInput}
                  defaultCountry={getCountryCodeFromPhone(value)}
                  selectedCountry={selectedCountry}
                  onChangeSelectedCountry={country => {
                    setSelectedCountry(country);
                  }}
                  value={cleanTel}
                  onChangePhoneNumber={text => {
                    setValue(text);
                  }}

                />
              </View>
            </KeyboardAvoidingView>
          </View>

          <View
            style={{
              flex: 1,
              justifyContent: 'flex-end',
              alignItems: 'center',
              paddingBottom: 72,
            }}>
            <Button
              title="Valider dépot au magasin"
              navigation={() => navigation.navigate('DepotScreen3')}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DepotScreen2;

const styles = StyleSheet.create({
  countryPickerContainerStyle: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 3,
  },
  textInput: {
    backgroundColor: 'transparent',
    padding: 0,
    // backgroundColor: 'gold',
    width: windowWidth * 0.6,
    color: '#000',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
});
