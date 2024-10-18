import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  KeyboardAvoidingView,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Image,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {

  getPlatformLanguage,
} from '../../modules/GestionStorage';
import axiosInstance from '../../axiosInstance';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/Octicons';
import {onAuthStateChanged} from 'firebase/auth';
import auth from '@react-native-firebase/auth';
import HeaderEarthImage from '../../assets/images/earth.png';
import {HeaderActions} from '../../components/HeaderActions';
import {getEnglishDateFormat} from '../../modules/DateFinanceUtils';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const ConversationList = ({navigation, route}) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [activeBackground, setActiveBackground] = useState(0);
  const [activeMessage, setActiveMessage] = useState(false);
  const [conversationId, setConversationId] = useState([]);
  const [user, setUser] = useState(null);
  let returnButt = route.params;

  let conversationSelectedId = route.params?.conversationID;

  returnButt = returnButt ? returnButt.fromMsg : false;

  const {t, i18n} = useTranslation();
  useEffect(() => {
    fetchConversations();
  }, [user]);

  useEffect(() => {
    const currentUser = auth().currentUser;
    setUser(currentUser);
  }, []);

  const fetchConversations = async () => {
    try {


      const currentLanguage = await getPlatformLanguage();

      const response = await axiosInstance.get(
        'conversations/clients/' + user.uid  ,
      );

      let conversation = null;
      if (response.data) {
        response.data.forEach(function (item) {
          if ('en' == currentLanguage) {
            item.createdAt = getEnglishDateFormat(item.createdAt);
          }

          item.messages.forEach(function (message) {
            item.unreadMessage = 'NON_LU' === message.statusUser;
          });

          if (conversationSelectedId == item.id) {
            conversation = item;
          }
        });
      }

      setConversations(response.data);

      if (conversation) {
        handletab(conversation);
        handleConversationClick(conversation.id);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des conversations :', error);
    }
  };

  const [conversation, setConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [Loader, setLoader] = useState(true);

  const handleConversationClick = async (conversationId) => {
    try {
      const response = await axiosInstance.put(
        '/conversations/messages/' + conversationId + '/statut/' + user.uid ,
      );
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log('Error response', error.response.data);
        console.log('Error response', error.response.status);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log('request', error.request);
      }
    }
  };

  const fetchMessages = async conversation => {
    setLoader(true);

    try {
      const response = await axiosInstance.get(
        '/conversations/' + conversation + '/messages',
      );

      setConversation(response.data);
    } catch (erreur) {
      console.log('commande conversation error', erreur);
    }

    setLoader(false);
  };

  const handleSendMessage = async () => {
    setLoader(true);

    try {
      const response = await axiosInstance.post(
        '/conversations/' + conversationId + '/messages/reply/' + user.uid ,
        {message: newMessage},
      );

      setConversation(response.data);

      setNewMessage('');
    } catch (erreur) {
      console.log('creation message  error', erreur);
    }

    setLoader(false);
  };

  const handletab = conversation => {
    setActiveBackground(conversation.id);
    setActiveMessage(true);
    // handleSendMessage(conversation.id)
    setConversationId(conversation.id);
    fetchMessages(conversation.id);
  };

  return (
    <View style={{flex: 1}}>
      <HeaderActions navigation={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{
            flex: 1,
            position: 'relative',
            paddingBottom: windowWidth * 0.02,
          }}>
          <View style={{marginVertical: 29}}>
            <Text
              style={{
                textAlign: 'center',
                fontFamily: 'Poppins-SemiBold',
                fontSize: 16,
                color: '#000',
              }}>
              {t('Mes échanges précédents')}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 10,
              width: windowWidth * 0.8,
              alignSelf: 'center',
            }}>
            {conversations.map(conversation => (
              <TouchableOpacity
                key={conversation.id}
                style={[
                  activeBackground === conversation.id
                    ? {backgroundColor: '#2BA6E9'}
                    : {backgroundColor: 'transparent'},
                  {
                    paddingHorizontal: 15,
                    paddingVertical: 20,
                    borderBottomWidth: 1,
                    borderBottomColor: '#E9E9E9',
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                  },
                ]}
                onPress={() => {
                  handleConversationClick(conversation.id),
                    handletab(conversation);
                }}>
                <Text
                  style={[
                    activeBackground === conversation.id
                      ? {color: '#fff'}
                      : {color: '#000'},
                    {
                      fontSize: 12,
                      fontFamily: 'Poppins-Regular',
                      letterSpacing: 1,
                    },
                  ]}>
                  {conversation.subject}
                </Text>
                <Text
                  style={[
                    activeBackground === conversation.id
                      ? {color: '#fff'}
                      : {color: '#FFF'},
                    {
                      fontSize: 12,
                      fontFamily: 'Poppins-Regular',
                      letterSpacing: 1,
                    },
                  ]}>
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
              </TouchableOpacity>
            ))}
          </View>
          {activeMessage && (
            <>
              {conversation === null || Loader === true ? (
                <View style={{justifyContent: 'center', height: '50%'}}>
                  <ActivityIndicator size={'large'} color="#3292E0" />
                </View>
              ) : (
                <>
                  <View style={{marginVertical: 29}}>
                    <Text
                      style={{
                        textAlign: 'center',
                        fontFamily: 'Poppins-SemiBold',
                        fontSize: 16,
                        color: '#000',
                      }}>
                       {t('Information produit')}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: '#fff',
                      marginBottom: windowWidth * 0.13,
                      position: 'relative',
                      height: '100%',
                      flex: 1,
                      paddingTop: 22,
                      borderTopRightRadius: 12,
                      borderTopLeftRadius: 12,
                    }}>
                    <ScrollView
                      style={{
                        height: '100%',
                        position: 'relative',
                        zIndex: -1000,
                        marginBottom: 50,
                      }}
                      showsVerticalScrollIndicator={false}>
                      {conversation.messages.map(message => (
                        <View
                          key={message.id}
                          style={{
                            margin: 10,
                            position: 'relative',
                            zIndex: -10,
                          }}>
                          {message.sender == null ? (
                            <>
                              <Text
                                style={{
                                  fontSize: 12,
                                  textAlign: 'center',
                                  fontFamily: 'Poppins-Medium',
                                  color: '#AAB0B7',
                                }}>
                                {message.createdAt}
                              </Text>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'flex-start',
                                  gap: 7,
                                  paddingHorizontal: 8,
                                }}>
                                <View
                                  style={{
                                    flexDirection: 'column',
                                    marginTop: 10,
                                  }}>
                                  <Image
                                    source={HeaderEarthImage}
                                    style={{
                                      width: windowWidth * 0.085,
                                      height: windowHeight * 0.041,
                                    }}
                                  />
                                  <Text
                                    style={{
                                      color: '#000',
                                      textAlign: 'center',
                                      fontFamily: 'Roboto-Bold',
                                      fontSize: 14,
                                    }}>
                                    GS
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    alignSelf: 'flex-end',
                                    width: windowWidth * 0.8,
                                    marginVertical: 10,
                                    backgroundColor: '#2BA6E9',
                                    paddingLeft: 10,
                                    paddingRight: 2,
                                    paddingVertical: 12,
                                    borderRadius: 12,
                                  }}>
                                  <Text
                                    style={{
                                      color: '#fff',
                                      textAlign: 'left',
                                      fontSize: 16,
                                      fontFamily: 'Poppins-Medium',
                                    }}>
                                    {message.message}
                                  </Text>
                                </View>
                              </View>
                            </>
                          ) : (
                            <>
                              <Text
                                style={{
                                  fontSize: 12,
                                  textAlign: 'center',
                                  fontFamily: 'Poppins-Medium',
                                  color: '#AAB0B7',
                                }}>
                                {message.createdAt}
                              </Text>
                              <View
                                style={{
                                  alignSelf: 'flex-end',
                                  width: windowWidth * 0.9,
                                  paddingRight: 25,
                                  marginVertical: 10,
                                  backgroundColor: '#F7F7F9',
                                  paddingHorizontal: 15,
                                  paddingVertical: 12,
                                  borderRadius: 12,
                                }}>
                                <Text
                                  style={{
                                    color: '#243443',
                                    textAlign: 'left',
                                    fontSize: 16,
                                    fontFamily: 'Poppins-Medium',
                                  }}>
                                  {' '}
                                  De{' '}
                                  {message.sender
                                    ? message.sender.nom +
                                      ' ' +
                                      message.sender.prenom
                                    : 'GS'}
                                </Text>
                                <Text
                                  style={{
                                    color: '#243443',
                                    textAlign: 'left',
                                    fontSize: 16,
                                    fontFamily: 'Poppins-Medium',
                                  }}>
                                  {message.message}
                                </Text>
                              </View>
                            </>
                          )}
                        </View>
                      ))}
                    </ScrollView>
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'flex-start',
                        alignSelf: 'center',
                        backgroundColor: '#fff',
                        marginBottom: windowWidth * 0.05,
                      }}>
                      <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'position' : 'height'}>
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 10,
                              width: windowWidth * 0.95,
                              alignSelf: 'center',
                            }}>
                            <TouchableOpacity
                              style={{
                                width: 60,
                                height: 60,
                                backgroundColor: '#2BA6E9',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 50,
                              }}>
                              <Icon name="plus" size={25} color="#fff" />
                            </TouchableOpacity>
                            <View
                              style={{
                                width: windowWidth * 0.78,
                                flexDirection: 'row',
                                alignItems: 'center',
                                borderWidth: 1,
                                borderRadius: 8,
                                borderColor: '#AAB0B7',
                                paddingHorizontal: 10,
                              }}>
                              <TextInput
                                value={newMessage}
                                onChangeText={setNewMessage}
                                placeholder="Entrez votre message"
                                placeholderTextColor="#999"
                                style={{flex: 1, color: '#000', height: 45}}
                              />
                              <TouchableOpacity onPress={handleSendMessage}>
                                <Icon
                                  name="paper-airplane"
                                  size={25}
                                  color="#999"
                                />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </TouchableWithoutFeedback>
                      </KeyboardAvoidingView>
                    </View>
                  </View>
                </>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ConversationList;
