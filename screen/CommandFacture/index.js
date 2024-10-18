//import liraries
import React, {useState, useEffect} from 'react';

import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {getPlatformLanguage} from '../../modules/GestionStorage';
import RenderConditionsMentionsLegale from '../../components/RenderConditionsMentionsLegale';
import axiosInstance from '../../axiosInstance';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
// create a component
const CommandFacture = props => {
  const commandNumero = props.route.params;

  const [ActivityMentionsConditions, setActivityMentionsConditions] =
    useState(true);
  const [CommandFacture, setCommandFacture] = useState({});
  console.log('xxxx');
  useEffect(() => {
    async function fetchValue() {
      setActivityMentionsConditions(true);
      try {
        const currentLanguage = await getPlatformLanguage();

        console.log('/facturation/' + commandNumero + '/' + currentLanguage);
        const response = await axiosInstance.get(
          '/facturation/' + commandNumero + '/' + currentLanguage,
        );
        console.log(response.data);
        setCommandFacture(response.data);
        console.log(CommandFacture.filename);
      } catch (error) {
        console.log('Something Wrong', error);
        setActivityMentionsConditions(true);
      }

      setActivityMentionsConditions(false);
    }

    fetchValue();
  }, []);

  if (true === ActivityMentionsConditions) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={{justifyContent: 'center', height: '80%'}}>
          <ActivityIndicator size="large" color="#3292E0" style={{}} />
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={{flex: 1}}>
      <RenderConditionsMentionsLegale pdfUrl={CommandFacture.filename} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  AllTextContainer: {
    // backgroundColor: 'tomato',
    flex: 1,
    padding: 10,
    margin: 10,
    textAlign: 'justify',
    textAlignVertical: 'center',
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    color: '#000',
  },
});
//make this component available to the app
export default CommandFacture;
