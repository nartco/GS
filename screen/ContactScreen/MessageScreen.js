import {
  View,
  Text,
  TextInput,
  Alert,
  ToastAndroid,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {HeaderEarth} from '../../components/Header';
import DropDownPicker from 'react-native-dropdown-picker';
import Textarea from 'react-native-textarea';
import {
  getAuthUserEmail,
  getPlatformLanguage,
  saveConversationMessagesObject,
} from '../../modules/GestionStorage';
import axiosInstance from '../../axiosInstance';
import styles from './styles';
import {useTranslation} from 'react-i18next';
import PhoneInput from 'react-native-phone-number-input';
import {onAuthStateChanged} from 'firebase/auth';
import auth from '@react-native-firebase/auth';

import Toast from 'react-native-toast-message';
import {HeaderActions} from '../../components/HeaderActions';
import {useIsFocused} from '@react-navigation/native';
import {getEnglishDateFormat} from '../../modules/DateFinanceUtils';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const MessageScreen = props => {
  const [isOpen2, setIsOpen2] = useState(false);
  const [current2, setCurrent2] = useState();
  const {t, i18n} = useTranslation();
  const [isFocus, setIsFocus] = useState(false);
  const [value, setValue] = useState(null);
  const [Name, setName] = useState('');
  const [Email, setEmail] = useState('');
  const [Message, setMessage] = useState('');
  const [phoneNumber, setphoneNumber] = useState('');
  const [ConversationMessageObjects, setConversationMessageObjects] = useState(
    [],
  );
  const [MessageObjectsLoader, setMessageObjectsLoader] = useState(true);
  const [IsClient, setIsClient] = useState(false);
  const [ClientEmail, setClientEmail] = useState(null);
  const [Language, setLanguage] = useState('fr');
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  let returnButt = props.route.params;
  returnButt = returnButt ? returnButt.fromSetting : false;

  const navigateToConversationScreen = conversationID => {
    if (returnButt == 'setting') {
      props.navigation.navigate('Conversation', {fromMsg: 'migrate'});
    } else if (conversationID) {
      props.navigation.navigate('Conversation', {
        conversationID: conversationID,
      });
    } else {
      props.navigation.navigate('Conversation');
    }
  };

  var isFocused = useIsFocused();

  useEffect(() => {
    const currentUser = auth().currentUser;
    setUser(currentUser);

    if (isFocused == true) {
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [user]);

  useEffect(() => {
    async function fetchData() {
      setMessageObjectsLoader(true);

      const email = await getAuthUserEmail();
      // setClientEmail(user);

      // Language
      const currentLanguage = await getPlatformLanguage();
      setLanguage(currentLanguage);

      setIsClient(null === user ? false : true);

      // let conversationMessagesObject = await getConversationMessagesObject();
      let conversationMessagesObject = [];

      // if (conversationMessagesObject.length < 1)
      // {
      axiosInstance
        .get('/conversations/parametrages/objets')
        .then(response => {
          if (response.data) {
            let objectNonClient = [];
            let objectClient = [];

            response.data.forEach(function (item) {
              if (item.type == 'NON_CLIENT') {
                objectNonClient.push(item);
              } else {
                objectClient.push(item);
              }
            });

            let messageObjects = [];
            if (user || null !== email) {
              messageObjects = objectClient;
            } else {
              messageObjects = objectNonClient;
            }

            let formatted = messageObjects.map(ls => {
              let libelle = 'fr' == currentLanguage ? ls.libelle : ls.libelleEN;
              return {id: ls.id, label: libelle, value: libelle};
            });

            setConversationMessageObjects(formatted);

            saveConversationMessagesObject(response.data);

            setMessageObjectsLoader(false);
          }
        })
        .catch(function (error) {
          setMessageObjectsLoader(false);
        });
    }

    fetchData();

    fetchConversations();
  }, [isFocused]);

  const fetchConversations = async () => {
    try {
      const email = await getAuthUserEmail();
      const currentLanguage = await getPlatformLanguage();

      const response = await axiosInstance.get(
        'conversations/clients/' + user?.uid,
      );

      if (response.data) {
        response.data.forEach(function (item) {
          if ('en' == currentLanguage) {
            item.createdAt = getEnglishDateFormat(item.createdAt);
          }

          item.messages.forEach(function (message) {
            item.unreadMessage = 'NON_LU' === message.statusUser;
          });
        });
      }

      setConversations(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des conversations :', error);
    }
  };

  function formatDate(dateString) {
    if (!dateString) {
      return dateString;
    }

    let arr = dateString.split('/');

    return `${arr[1]}/${arr[0]}/${arr[2]}`;
  }

  const navigateToCofirmSentScreen = () => {
    let conversation = {};
    let url = '/conversations/clients/create';

    if (null === user) {
      if (Email === '') {
        if (Platform.OS == 'ios') {
          Toast.show({
            type: 'error',
            text1: t('Email'),
            text2: t("L'email est obligatoire"),
          });
        } else {
          ToastAndroid.show(t("L'email est obligatoire"), ToastAndroid.SHORT);
        }
        return;
      }

      if (Name === '') {
        if (Platform.OS == 'ios') {
          Toast.show({
            type: 'error',
            text1: t('Nom'),
            text2: t('Le nom est obligatoire'),
          });
        } else {
          ToastAndroid.show(t('Le nom est obligatoire'), ToastAndroid.SHORT);
        }
        return;
      }

      url = '/conversations/non/clients/create';

      conversation.nom = Name;
      conversation.email = Email;
      conversation.telephone = phoneNumber;
    } else {
      conversation.uuid = user.uid;
    }

    if (value === '') {
      if (Platform.OS == 'ios') {
        Toast.show({
          type: 'error',
          text1: t('objet'),
          text2: t("L'objet est obligatoire"),
        });
      } else {
        ToastAndroid.show(t("L'objet est obligatoire"), ToastAndroid.SHORT);
      }
      return;
    }
    if (Message === '') {
      if (Platform.OS == 'ios') {
        Toast.show({
          type: 'error',
          text1: t('Message'),
          text2: t('Le message est obligatoire'),
        });
      } else {
        ToastAndroid.show(t('Le message est obligatoire'), ToastAndroid.SHORT);
      }
      return;
    }

    conversation.subject = value;
    conversation.message = Message;

    axiosInstance
      .post(url, conversation)
      .then(function (response) {
        setEmail('');
        setName('');
        setMessage('');
        setValue(null);

        return Alert.alert(t('Succès'), t('Votre message a été envoyé'), [
          {
            text: 'OK',
          },
        ]);
      })
      .catch(error => {
        if (Platform.OS == 'ios') {
          console.log(error.response.data);
          Toast.show({
            type: 'error',
            text1: t('Contact'),
            text2: t("Erreur lors de l'envoi du message"),
          });
        } else {
          ToastAndroid.show(
            t("Erreur lors de l'envoi du message"),
            ToastAndroid.SHORT,
          );
        }
      });
  };
  console.log({user});
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

  if (true === MessageObjectsLoader) {
    return (
      <View style={{justifyContent: 'center', height: '80%'}}>
        <ActivityIndicator size={'large'} color="#3292E0" />
      </View>
    );
  }

  if (true === isLoading) {
    return (
      <View style={{justifyContent: 'center', height: '80%'}}>
        <ActivityIndicator size={'large'} color="#3292E0" />
      </View>
    );
  }
  return (
    <ScrollView
      style={{marginBottom: 20, flex: 1}}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled={true}>
      <View style={{flex: 1}}>
        {returnButt == 'setting' ? (
          <HeaderActions navigation={() => props.navigation.goBack()} />
        ) : (
          <HeaderEarth />
        )}
        <View style={{paddingHorizontal: 28}}>
          {null != user ? (
            <>
              <View style={{marginTop: 24, marginBottom: 12}}>
                <Text
                  style={{
                    fontFamily: 'Poppins-SemiBold',
                    fontSize: 16,
                    color: '#000',
                    textAlign: 'center',
                  }}>
                  {t('Mes échanges précédents')}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 10,
                  width: windowWidth * 0.85,
                  alignSelf: 'center',
                }}>
                {conversations.length > 0 &&
                  conversations.slice(0, 3).map(conversation => (
                    <TouchableOpacity
                      onPress={() => {
                        navigateToConversationScreen(conversation.id);
                      }}>
                      <View
                        key={conversation.id}
                        style={{
                          paddingHorizontal: 15,
                          paddingVertical: 20,
                          borderBottomWidth: 1,
                          borderBottomColor: '#E9E9E9',
                          justifyContent: 'space-between',
                          flexDirection: 'row',
                        }}>
                        <Text
                          style={{
                            fontSize: 12,
                            color: '#000',
                            fontFamily: 'Poppins-Regular',
                            letterSpacing: 1,
                          }}>
                          {conversation.subject}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: '#000',
                            fontFamily: 'Poppins-Regular',
                            letterSpacing: 1,
                          }}>
                          {conversation.createdAt}
                        </Text>

                        {conversation.unreadMessage && (
                          <View
                            style={{
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative',
                            }}>
                            <View
                              style={{
                                position: 'absolute',
                                top: -5,
                                right: -5,
                                backgroundColor: '#F4951A',
                                width: 25,
                                height: 25,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: 50,
                              }}>
                              <Text
                                style={{
                                  fontSize: 18,
                                  fontFamily: 'Poppins-Medium',
                                  color: '#fff',
                                }}>
                                1
                              </Text>
                            </View>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
              </View>
              <TouchableOpacity
                onPress={() => {
                  navigateToConversationScreen();
                }}
                style={{
                  justifyContent: 'flex-end',
                  width: '100%',
                  alignItems: 'flex-end',
                  paddingTop: 5,
                }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: 'Roboto-Regular',
                    color: '#2BA6E9',
                  }}>
                  {t('Voir tous les échanges')}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <></>
          )}
          <View style={{marginTop: 24, marginBottom: 12}}>
            <Text
              style={{
                fontFamily: 'Poppins-SemiBold',
                fontSize: 16,
                color: '#000',
                textAlign: 'center',
              }}>
              {t('Envoyez un nouveau message')}
            </Text>
          </View>
          {null === user ? (
            <>
              <View style={{marginTop: 12}}>
                <TextInput
                  value={Name}
                  onChangeText={newText => setName(newText)}
                  placeholder={t('Nom')}
                  placeholderTextColor="#AAB0B7"
                  keyboardType="ascii-capable"
                  style={{
                    borderWidth: 1,
                    borderColor: '#AAB0B7',
                    height: windowWidth * 0.12,
                    paddingLeft: 15,
                    borderRadius: 8,
                    fontFamily: 'Poppins-Regular',
                    fontSize: 14,
                    color: '#000',
                    backgroundColor: '#fff',
                  }}
                />
              </View>
              <View style={{marginTop: 12}}>
                <TextInput
                  value={Email}
                  onChangeText={newText => setEmail(newText)}
                  placeholderTextColor="#AAB0B7"
                  placeholder="Email*"
                  style={{
                    borderWidth: 1,
                    borderColor: '#AAB0B7',
                    paddingLeft: 15,
                    height: windowWidth * 0.12,
                    borderRadius: 8,
                    fontFamily: 'Poppins-Regular',
                    fontSize: 14,
                    color: '#000',
                    backgroundColor: '#fff',
                  }}
                />
              </View>
              <View style={{marginTop: 12}}>
                <PhoneInput
                  defaultValue={phoneNumber}
                  defaultCode="FR"
                  layout="first"
                  containerStyle={styles.phoneContainer}
                  textContainerStyle={styles.textInput}
                  codeTextStyle={styles.codeTextStyle}
                  countryPickerButtonStyle={styles.countryPickerButtonStyle}
                  textInputProps={{
                    placeholderTextColor: '#BCB8B1',
                    maxLength: 12,
                  }}
                  textInputStyle={styles.textInputStyle}
                  onChangeFormattedText={text => {
                    setphoneNumber(text);
                  }}
                  value={phoneNumber}
                  placeholder={t('Téléphone')}
                  style={{
                    borderWidth: 1,
                    borderColor: '#AAB0B7',
                    fontFamily: 'Poppins-Regular',
                    fontSize: 14,
                    color: '#000',
                    paddingLeft: 15,
                    borderRadius: 8,
                    backgroundColor: '#fff',
                  }}
                />
              </View>
            </>
          ) : (
            <></>
          )}

          <View style={{marginTop: 12}}>
            <DropDownPicker
              items={ConversationMessageObjects}
              open={isOpen2}
              setOpen={() => setIsOpen2(!isOpen2)}
              value={value}
              listMode="SCROLLVIEW"
              scrollViewProps={{
                nestedScrollEnabled: true,
              }}
              setValue={val => setValue(val)}
              dropDownContainerStyle={{
                backgroundColor: '#fff',
                borderColor: '#AAB0B7',
                fontSize: 54,
              }}
              style={{
                backgroundColor: '#fff',
                borderColor: '#000',
                fontSize: 54,
                position: 'relative',
                zIndex: 1000,
              }}
              listItemContainerStyle={{borderBottomColor: '#000'}}
              placeholder={t('Objet') + '*'}
              onChangeValue={value => setValue(value)}
              placeholderStyle={{
                fontFamily: 'Poppins-Regular',
                fontSize: 16,
                color: '#000',
              }}
              textStyle={{
                fontFamily: 'Poppins-Regular',
                fontSize: 14,
                color: '#000',
              }}
            />
          </View>

          <View style={{marginTop: 12, position: 'relative', zIndex: -1000}}>
            <Textarea
              containerStyle={{
                height: 180,
                backgroundColor: '#fff',
                borderWidth: 1,
                borderColor: '#AAB0B7',
                borderRadius: 8,
                paddingLeft: 10,
              }}
              style={{
                backgroundColor: '#fff',
                fontSize: 14,
                fontFamily: 'Poppins-Regular',
                color: '#000',
              }}
              maxLength={120}
              value={Message}
              placeholder={'Message'}
              placeholderTextColor={'#AAB0B7'}
              underlineColorAndroid={'transparent'}
              onChangeText={newText => setMessage(newText)}
            />
          </View>
          <View style={{marginTop: 50}}>
            <View
              style={{
                justifyContent: 'flex-end',
                alignItems: 'center',
                paddingBottom: 72,
              }}>
              <TouchableOpacity
                style={styles.ButtonContainer}
                onPress={() => {
                  navigateToCofirmSentScreen();
                }}>
                <Text style={styles.ButtonText}>{t('Envoyer')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default MessageScreen;
