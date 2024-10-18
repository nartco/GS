import { View, Text, ActivityIndicator,TouchableOpacity, StatusBar } from 'react-native'
import React, { useEffect, useState } from 'react'
import axiosInstance from '../../axiosInstance';
import { getConditionsMentionsLegales, getPlatformLanguage, saveConditionsMentions } from '../../modules/GestionStorage';
import Pdf from "react-native-pdf";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const TermsConditions = (props) => {
  let fromSign  = props.route.params;
  fromSign = fromSign ? fromSign.fromSign : false;
  const [ActivityMentionsConditions, setActivityMentionsConditions] = useState(true);
  const [ConditionsMentionsLegales, setConditionsMentionsLegales] = useState({});
  const [language, setLanguage] = useState('');
  const navigation = useNavigation();

  useEffect(() => {

    async function fetchValue() {

      // Mentions légales
      setActivityMentionsConditions(true);
      const currentLanguage = await getPlatformLanguage();
      setLanguage(currentLanguage)
      let mentionsConditions = await getConditionsMentionsLegales();

      console.log('mentionsConditions', mentionsConditions)
        // Check if mentionsConditions exist and if it contains the desired code
    if (mentionsConditions && mentionsConditions.hasOwnProperty("conditions_legales")) {
      // Accessing the conditions_legales object from mentionsConditions
      let conditionsLegalesData = mentionsConditions["conditions_legales"];

      // You can then push this data wherever you need it
      // For example, if you want to push it into an array, you can do something like this
      let conditionsLegalesArray = [];
      conditionsLegalesArray.push(conditionsLegalesData);

      conditionsLegalesArray.forEach(item => {
         console.log("THe item of condition -> ", item);
         setConditionsMentionsLegales(item);
      });
      // Set the state with the data
    }
        setActivityMentionsConditions(false);
      if (!mentionsConditions)
      {
        axiosInstance.get('/conditions/mentions/legales/')
        .then((response) => {
          console.log("The Response Data => ", response.data);
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
          console.log('error', error);
          setActivityMentionsConditions(false);
        });
      }
      // else 
      // {
      //   setConditionsMentionsLegales(mentionsConditions);
      //   setActivityMentionsConditions(false);
      // }
    }

    fetchValue();

  }, []);

  console.log("The Mentions Condition => ", ConditionsMentionsLegales.fichier);

  
  if (true === ActivityMentionsConditions)
  {
    return (
      // <ScrollView style={{flex: 1}}>
        <View style={{justifyContent: 'center', height: '80%', flex: 1}}>
          <ActivityIndicator size="large" color="#3292E0" style={{}} />
        </View>
      // </ScrollView>
    );
  }

  const CustomStatusBar = ({
    backgroundColor,
    barStyle = 'light-content',
  }) => {
    const inset = useSafeAreaInsets();
    return (
      <View style={{ height: inset.top, backgroundColor }}>
        <StatusBar
          animated={true}
          backgroundColor={backgroundColor}
          barStyle={barStyle}
        />
      </View>
    );
  };

  const handlegoBack = () => {
    if(fromSign == "signup"){
      navigation.navigate('Signup')
    }
    else{
      navigation.goBack()
    }
  }
  return (
    <View style={{ flex: 1 }}>
       <CustomStatusBar backgroundColor="#2BA6E9" />
       <TouchableOpacity onPress={handlegoBack}>
            <Text style={{ color: 'blue', paddingLeft: 10,paddingTop: 15, fontSize: 25 }}>X</Text>
        </TouchableOpacity>
      <Pdf
        key={'pdfView'}
        trustAllCerts={false}
        source={{uri: language == "fr" ? ConditionsMentionsLegales.fichier : ConditionsMentionsLegales.fichierEN}}
        style={{ flex: 1, width: '100%', height: '100%' }}
        onLoadComplete={() => console.log('PDF chargé')}
        onError={(error) => console.log('Erreur de chargement du PDF', error)}
        />
    </View>
  )
}

export default TermsConditions