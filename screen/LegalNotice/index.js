//import liraries
import React, {useState,useEffect} from 'react';

import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { getPlatformLanguage, saveConditionsMentions } from '../../modules/GestionStorage';
import RenderConditionsMentionsLegale from '../../components/RenderConditionsMentionsLegale';
import axiosInstance from '../../axiosInstance';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
// create a component
const LegalNotice = () => {

  const [ActivityMentionsConditions, setActivityMentionsConditions] = useState(true);
  const [ConditionsMentionsLegales, setConditionsMentionsLegales] = useState({});
  const [language, setLanguage] = useState('');

  useEffect(() => {

    async function fetchValue() {

      // Mentions légales
      setActivityMentionsConditions(true);
      const currentLanguage = await getPlatformLanguage();
      setLanguage(currentLanguage)
      // let mentionsConditions = await getConditionsMentionsLegales();

      // if (!mentionsConditions)
      // {
        axiosInstance.get('/conditions/mentions/legales/')
        .then((response) => {
          if (response.data)
          {
            let obj = {};

            response.data.map((row) => {
              obj[row.code] = row;
            });

            setConditionsMentionsLegales(obj);

            saveConditionsMentions(obj);

            setActivityMentionsConditions(false);
          }
        })
        .catch(function (error) {
          console.log('error', error)
        });
      // }
      // else 
      // {
      //   setConditionsMentionsLegales(mentionsConditions);
      //   setActivityMentionsConditions(false);
      // }
    }

    fetchValue();

  }, []);

  if (true === ActivityMentionsConditions)
  {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={{justifyContent: 'center', height: '80%'}}>
          <ActivityIndicator size="large" color="#3292E0" style={{}} />
        </View>
      </ScrollView>
    );
  }


  return (
    <View style={{ flex: 1 }}>
      <RenderConditionsMentionsLegale pdfUrl={language == 'fr' ? ConditionsMentionsLegales.mentions_legales.fichier : ConditionsMentionsLegales.mentions_legales.fichierEN} />
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
export default LegalNotice;
