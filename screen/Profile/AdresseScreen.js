import {
  StatusBar,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
  ToastAndroid,
  Platform,
} from 'react-native';
import React, {useState, useEffect, useCallback} from 'react';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {HeaderEarth} from '../../components/Header';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {adress} from '../../constant/data';
import Icon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTranslation} from 'react-i18next';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
import {useNavigation} from '@react-navigation/native';

import axiosInstance from '../../axiosInstance';
import {ScrollView} from 'react-native-virtualized-view';
import Feather from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {useFocusEffect} from '@react-navigation/native'; // Import useFocusEffect
import {HeaderActions} from '../../components/HeaderActions';
import auth from '@react-native-firebase/auth';

const AdresseScreen = props => {
  let returnButt = props.route.params;
  returnButt = returnButt ? returnButt.pageForm : false;

  const {t, i18n} = useTranslation();
  const [isFocus, setIsFocus] = useState(false);
  const [value, setValue] = useState(null);
  const [RefValue, setRefValue] = useState('');
  const [NewAddress, setNewAddress] = useState('');
  const [Pays, setPays] = useState('');
  const [Ville, setVille] = useState('');
  const [CodePostal, setCodePostal] = useState('');
  const [data, setdata] = useState([]);
  const [Arraydata, setArraydata] = useState([]);
  const [Addressdata, setAddressdata] = useState([]);
  const [Adresses, setAdresses] = useState([]);
  const [Loader, setLoader] = useState(true);

  const navigation = useNavigation();
  useFocusEffect(
    useCallback(() => {
      if (returnButt === 'updated') {
        setLoader(true);
        fetchValue();
      } else {
        fetchValue();
      }
    }, []),
  );
  async function fetchValue() {
    const user = auth().currentUser;

    setLoader(true);



    try {
      const response = await axiosInstance.get('adresses/user/' + user.uid );

      setAdresses(response.data);
      console.log(response.data, user);
      setLoader(false);
    } catch (erreur) {
      console.log('adresse fetch error', erreur);
    }
  }

  const DeletePost = async id => {
    try {
      const response = await axiosInstance.delete('adresses/' + id );
      if (response) {
        setLoader(true);

        if (Platform.OS == 'ios') {
          Toast.show({
            type: 'success',
            text1: t('Succès'),
            text2: t("L'adresse été supprimée"),
          });
        } else {
          ToastAndroid.show(t("L'adresse été supprimée"), ToastAndroid.SHORT);
        }
        fetchValue();
      }
    } catch (err) {
      console.log('error :', err);
    }
    setLoader(false);
  };

  const RemoveAlert = item => {
    return Alert.alert(
      t('Information'),
      t('êtes-vous sûr de vouloir supprimer cette adresse'),
      [
        {
          text: t('Non'),
          style: 'cancel',
        },
        {
          text: t('Oui'),
          onPress: () => {
            DeletePost(item);
            return;
          },
        },
      ],
    );
  };

  const AddAddress = () => {
    navigation.navigate('AddAdresseScreen', {
      pageFrom: 'carnetAdresse',
      uuid: auth().currentUser.uid,
    });
  };

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

  const Item = ({item}) => (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginBottom: 16,
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Text
          style={{color: '#000', fontSize: 16, fontFamily: 'Poppins-Medium'}}>
          {item.libelle}
        </Text>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditAdresseScreen', item)}>
            <MaterialCommunityIcons
              name="pencil-outline"
              size={20}
              color="#000"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => RemoveAlert(item.id)}>
            <Icon name="trash-2" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={{
          paddingTop: 16,
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 10,
        }}>
        <View>
          <Icon name="map-pin" size={20} color="#2BA6E9" />
        </View>
        <View style={{maxWidth: '70%'}}>
          <Text
            style={{
              fontFamily: 'Poppins-Regular',
              fontSize: 16,
              color: '#718096',
            }}>
            {item.nom}
          </Text>

          <Text
            style={{
              fontFamily: 'Poppins-Regular',
              fontSize: 16,
              color: '#718096',
            }}>
            {t(item.adresse)}
          </Text>

          <Text
            style={{
              fontFamily: 'Poppins-Regular',
              fontSize: 16,
              color: '#718096',
            }}>
            {item.codePostal} {item.ville} {item.pays}
          </Text>

          <Text
            style={{
              fontFamily: 'Poppins-Regular',
              fontSize: 16,
              color: '#718096',
            }}>
            Tél: {item.telephone}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderItem = ({item}) => <Item item={item} key={item.id} />;

  if (true === Loader) {
    return (
      <View style={{justifyContent: 'center', height: '80%'}}>
        <ActivityIndicator size={'large'} color="#3292E0" />
      </View>
    );
  }
  return (
    <View style={{flex: 1}}>
      <HeaderActions navigation={() => props.navigation.goBack()} />
      <ScrollView>
        <View style={{flex: 1, marginBottom: 10}}>
          <View style={{marginTop: 24, marginBottom: 12}}>
            <Text
              style={{
                fontFamily: 'Poppins-SemiBold',
                fontSize: 16,
                color: '#000',
                textAlign: 'center',
              }}>
              {t('Mon carnet d’adresses')}
            </Text>
          </View>

          <View style={{paddingHorizontal: 12}}>
            <TouchableOpacity
              onPress={AddAddress}
              style={{
                backgroundColor: '#fff',
                paddingVertical: 14,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 12,
                borderWidth: 1.2,
                borderStyle: 'dashed',
                borderColor: '#CDD6D7',
              }}>
              <View
                style={{
                  backgroundColor: '#34CAA5',
                  padding: 12,
                  borderRadius: 50,
                  marginBottom: 10,
                }}>
                <Ionicons name="add" size={20} color="#fff" />
              </View>
              <Text
                style={{
                  color: '#747681',
                  fontSize: 13,
                  fontFamily: 'Poppins-Medium',
                }}>
                {t('Ajouter une nouvelle adresse')}
              </Text>
            </TouchableOpacity>
          </View>

          {Adresses.length > 0 ? (
            <>
              <View
                style={{
                  paddingHorizontal: 12,
                  marginTop: 25,
                  paddingBottom: 50,
                }}>
                <FlatList
                  showsVerticalScrollIndicator={false}
                  scrollEnabled
                  data={Adresses}
                  renderItem={renderItem}
                  keyExtractor={item => item.id}
                  contentContainerStyle={styles.containerFlatelist}
                />
              </View>
            </>
          ) : (
            <>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text>{t('noAdress')}</Text>
              </View>
            </>
          )}
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
  orderDetailsContainer: {
    backgroundColor: '#fff',
    width: windowWidth * 0.9,
    height: 'auto',
    alignSelf: 'center',
    elevation: 3,
    borderRadius: 10,
    justifyContent: 'space-around',
    marginTop: windowHeight * 0.03,
  },
  AllTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 'auto',
  },
  TextContainer: {
    height: 'auto',
    alignItems: 'flex-start',
    marginTop: 10,
  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  titleText: {
    color: '#000',
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
  },
  titleContainer: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginTop: windowHeight * 0.03,
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
  NameTxt: {
    fontFamily: 'Roboto-Regular',
    fontSize: 12,
    color: '#000',
    marginTop: 5,
    alignContent: 'flex-start',
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
  inputStyled: {
    width: windowWidth * 0.75,
    marginLeft: windowWidth * 0.03,
    color: '#000',
    fontFamily: 'Roboto-Regular',
  },
});

export default AdresseScreen;
