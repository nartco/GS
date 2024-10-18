import {
  View,
  Text,
  ScrollView,
  Dimensions,
  Alert,
  Platform,
  ToastAndroid,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {HeaderActions} from '../../components/HeaderActions';
import Button from '../../components/Button';
import {useTranslation} from 'react-i18next';
import {RadioButton} from 'react-native-paper';
const windowWidth = Dimensions.get('window').width;
// const { width } = Dimensions.get('window');
import Toast from 'react-native-toast-message';
import axiosInstance from '../../axiosInstance';
import {
  getAuthentificationData,
  removeAuthentificationData,
  getPlatformLanguage,
} from '../../modules/GestionStorage';
import {useIsFocused} from '@react-navigation/native';
// import RadioGroup from 'react-native-radio-buttons-group';
// import RadioButtonsGroup, { RadioButton } from 'react-native-radio-buttons-group';
import Modal from 'react-native-modal';
import DropDownPicker from 'react-native-dropdown-picker';
import {signOut} from 'firebase/auth';
import auth from '@react-native-firebase/auth';

const windowHeight = Dimensions.get('window').height;
const SupprimerCiompte = ({navigation}) => {
  const [checked, setChecked] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const {t, i18n} = useTranslation();
  const [isModalVisible, setModalVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState();

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  var isFocused = useIsFocused();
  useEffect(() => {
    const fetchValue = async () => {
      setLoading(true);
      try {
        const currentLanguage = await getPlatformLanguage();

        const res = await getAuthentificationData();

        const response = await axiosInstance.get('/clients/reasons');
        let data = response.data;

        let formatted = [];
        data.forEach(function (item) {
          let label = 'fr' == currentLanguage ? item.reason : item.reasonEN;

          let obj = {label: label, value: item.id};
          formatted.push(obj);
        });
        setItems(formatted);
        console.log(res);
        if (res) {
          setEmail(res);
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch (err) {
        setLoading(false);
        console.log(err.response.data);
        console.log('The error => ', err);
      }
    };

    fetchValue();
  }, [isFocused]);

  const [selectedId, setSelectedId] = useState();
  const logout = async () => {
    try {
      // Supprimer les données d'authentification locales
      await removeAuthentificationData();

      // Déconnexion de Firebase
      await auth().signOut();

      // Afficher le message de succès
      if (Platform.OS === 'ios') {
        Toast.show({
          type: 'success',
          text1: t('Profil'),
          text2: t("L'utilisateur a été déconnecté!"),
        });
      } else {
        ToastAndroid.show(
          t("L'utilisateur a été déconnecté!"),
          ToastAndroid.SHORT,
        );
      }

      // Rediriger vers l'écran de connexion

      navigation.navigate('LoginScreen');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);

      // Afficher le message d'erreur
      if (Platform.OS === 'ios') {
        Toast.show({
          type: 'error',
          text1: t('Profil'),
          text2: t("L'utilisateur ne peut pas se déconnecter!"),
        });
      } else {
        ToastAndroid.show(
          t("L'utilisateur ne peut pas se déconnecter!"),
          ToastAndroid.SHORT,
        );
      }
    }
  };

  const handleDes = async () => {
    try {
      const user = auth().currentUser;
      const res = await axiosInstance.post('/clients/disable/' + user.uid);
      if (res) {
        logout();
      }
    } catch (err) {
      console.log('The Error => ', err);
    }
  };

  const handleSup = async () => {
    try {
      const user = auth().currentUser;

      const res = await axiosInstance.post('/clients/resiliation/' + user.uid, {
        motif: value ? value : '',
      });
      if (res) {
        console.log(res);
        logout();
      }
    } catch (err) {
      console.log('The Error => ', err);
    }
  };

  const handleDeas = () => {
    return Alert.alert(
      t('Désactiver le compte'),
      t('Voulez-vous vraiment désactiver votre compte ?'),
      [
        {
          text: t('Non'),
          style: 'cancel',
        },
        {
          text: t('Oui'),
          onPress: () => {
            handleDes();
            Alert.alert(
              t('Désactiver le compte'),
              t(
                'Votre compte sera désactivé dans les 48h et une confirmation vous sera envoyée par email',
              ),
              [
                {
                  text: t('Ok'),
                  style: 'cancel',
                },
              ],
            );
            return;
          },
        },
      ],
    );
  };

  const handleSupprimer = () => {
    return Alert.alert(
      t('Supprimer le compte'),
      t('Voulez-vous vraiment Supprimer votre compte ?'),
      [
        {
          text: t('Non'),
          style: 'cancel',
        },
        {
          text: t('Oui'),
          onPress: () => {
            handleSup();
            Alert.alert(
              t('Supprimer le compte'),
              t(
                'Votre compte sera supprimé dans les 48h et une confirmation vous sera envoyée par email',
              ),
              [
                {
                  text: t('Ok'),
                  style: 'cancel',
                },
              ],
            );
            return;
          },
        },
      ],
    );
  };

  const handleAlert = () => {
    if (checked == 'first') {
      handleDeas();
    } else if (checked == 'second') {
      // handleSupprimer()
      setModalVisible(!isModalVisible);
    } else {
      if (Platform.OS != 'ios') {
        ToastAndroid.show(
          t('Veuillez choisir une des options'),
          ToastAndroid.SHORT,
        );
      } else {
        Toast.show({
          type: 'info',
          text1: t('Info'),
          text2: t('Veuillez choisir une des options'),
        });
      }
    }
  };

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size={'large'} color={'#4E8FDA'} />
      </View>
    );
  }
  return (
    <>
      <ScrollView
        style={{paddingBottom: 50}}
        showsVerticalScrollIndicator={false}>
        <View style={{flex: 1}}>
          <HeaderActions navigation={() => navigation.goBack()} />

          <View
            style={{
              maxWidth: windowWidth * 0.9,
              alignSelf: 'center',
              marginTop: windowWidth * 0.1,
            }}>
            {/* <RadioGroup 
            radioButtons={radioButtons} 
            onPress={setSelectedId}
            selectedId={selectedId}
        /> */}

            <View style={{flexDirection: 'column', gap: windowWidth * 0.03}}>
              <View
                style={{
                  borderBottomWidth: 1,
                  borderColor: '#aaa',
                  paddingBottom: windowWidth * 0.03,
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: windowWidth * 0.03,
                }}>
                {Platform.OS == 'ios' ? (
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: checked === 'first' ? '#4E8FDA' : '#999',
                      borderRadius: 50,
                    }}>
                    <RadioButton
                      value="first"
                      status={checked === 'first' ? 'checked' : 'unchecked'}
                      onPress={() => {
                        setChecked('first');
                      }}
                      color="#4E8FDA"
                    />
                  </View>
                ) : (
                  <RadioButton
                    value="first"
                    status={checked === 'first' ? 'checked' : 'unchecked'}
                    onPress={() => {
                      setChecked('first');
                    }}
                    color="#4E8FDA"
                  />
                )}
                <View style={{width: windowWidth * 0.75}}>
                  <Text
                    style={{
                      fontFamily: 'Roboto-Medium',
                      color: '#000',
                      fontSize: windowWidth * 0.04,
                      marginBottom: windowWidth * 0.01,
                    }}>
                    {t('Désactiver mon compte')}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Roboto-Regular',
                      color: '#888',
                      fontSize: windowWidth * 0.035,
                      lineHeight: windowWidth * 0.048,
                      marginBottom: windowWidth * 0.03,
                    }}>
                    {t(
                      "En désactivant votre compte, rassurez-vous, toutes vos informations seront  conservées et vous pourrez le réactiver à tout moment, Notez que vos bons d'achat et promotions peuvent néanmains expirer entre-temps",
                    )}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: windowWidth * 0.03,
                }}>
                {Platform.OS == 'ios' ? (
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: checked === 'second' ? '#4E8FDA' : '#999',
                      borderRadius: 50,
                    }}>
                    <RadioButton
                      value="second"
                      status={checked === 'second' ? 'checked' : 'unchecked'}
                      onPress={() => {
                        setChecked('second');
                      }}
                      color="#4E8FDA"
                    />
                  </View>
                ) : (
                  <RadioButton
                    value="second"
                    status={checked === 'second' ? 'checked' : 'unchecked'}
                    onPress={() => {
                      setChecked('second');
                    }}
                    color="#4E8FDA"
                  />
                )}
                <View style={{width: windowWidth * 0.75}}>
                  <Text
                    style={{
                      fontFamily: 'Roboto-Medium',
                      color: '#000',
                      fontSize: windowWidth * 0.04,
                      marginBottom: windowWidth * 0.01,
                    }}>
                    {t('Suprimer définitivement mon compte')}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Roboto-Regular',
                      color: '#888',
                      fontSize: windowWidth * 0.035,
                      lineHeight: windowWidth * 0.048,
                      marginBottom: windowWidth * 0.03,
                    }}>
                    {t(
                      "En Supprimant votre compte, vous perdrez l'accés à vos anciennes commandes, factures, bons d'achat et vos informations personnelles seront supprimées",
                    )}
                  </Text>
                </View>
              </View>
            </View>

            <View style={{marginTop: windowWidth * 0.4}}>
              <View
                style={{
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  paddingBottom: 13,
                }}>
                <Button
                  title={t('Continuer')}
                  navigation={() => handleAlert()}
                />
              </View>
              <View
                style={{
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  paddingBottom: 120,
                }}>
                <Button
                  title={t('Non, Retour')}
                  navigation={() => navigation.goBack()}
                />
              </View>
            </View>
          </View>
          <View></View>
        </View>
      </ScrollView>
      <Modal isVisible={isModalVisible}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <View
            style={{
              backgroundColor: 'white',
              width: windowWidth * 0.8,
              height: windowHeight * 0.25,
              borderRadius: 25,
            }}>
            <Text
              style={{
                textAlign: 'center',
                paddingTop: windowHeight * 0.012,
                textTransform: 'uppercase',
              }}>
              Choose The Reasone
            </Text>
            <View
              style={{
                justifyContent: 'center',
                alignSelf: 'center',
                alignItems: 'center',
                width: windowWidth * 0.7,
                flex: 1,
              }}>
              <DropDownPicker
                open={open}
                value={value}
                items={items}
                setOpen={setOpen}
                setValue={setValue}
                setItems={setItems}
                placeholder={'Choose a Reason.'}
              />
            </View>
            <View
              style={{
                width: windowWidth * 0.5,
                alignSelf: 'center',
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingBottom: windowWidth * 0.05,
                position: 'relative',
                zIndex: -100,
              }}>
              <Button
                title={t('Continuer')}
                navigation={() => handleSupprimer()}
              />
              <Button
                title={t('Fermer')}
                navigation={() => setModalVisible(!isModalVisible)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default SupprimerCiompte;
