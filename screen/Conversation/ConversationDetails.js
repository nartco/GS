import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  Button,
  ScrollView,
} from 'react-native';


import axiosInstance from '../../axiosInstance';
import auth from '@react-native-firebase/auth';

const ConversationDetails = ({navigation, route}) => {
  const {conversationId} = route.params;
  const [conversation, setConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [Loader, setLoader] = useState(true);
  const [ClientEmail, setClientEmail] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoader(true);

    try {
    

      const response = await axiosInstance.get(
        '/conversations/' + conversationId + '/messages',
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
      const user = auth().currentUser;
      const response = await axiosInstance.post(
        '/conversations/' + conversationId + '/messages/reply/' + user.uid  ,
        {message: newMessage},
      );

      setConversation(response.data);

      setNewMessage('');
    } catch (erreur) {
      console.log('creation message  error', erreur);
    }

    setLoader(false);
  };

  if (true === Loader || !conversation) {
    return (
      <View style={{justifyContent: 'center', height: '80%'}}>
        <ActivityIndicator size={'large'} color="#3292E0" />
      </View>
    );
  }

  return (
    <View>
      <Button title="Retour" onPress={() => navigation.goBack()} />

      <ScrollView>
        {conversation.messages.map(message => (
          <View key={message.id} style={{margin: 10}}>
            <Text>{message.createdAt}</Text>
            <Text>
              {' '}
              De{' '}
              {message.sender
                ? message.sender.nom + ' ' + message.sender.prenom
                : 'GS'}
            </Text>
            <Text>{message.message}</Text>
          </View>
        ))}
      </ScrollView>

      <TextInput
        value={newMessage}
        onChangeText={setNewMessage}
        placeholder="Entrez votre message"
      />
      <Button title="Envoyer" onPress={handleSendMessage} />
    </View>
  );
};

export default ConversationDetails;
