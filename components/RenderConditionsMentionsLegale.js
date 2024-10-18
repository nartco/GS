import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity
} from 'react-native';
import Pdf from 'react-native-pdf';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

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

const RenderConditionsMentionsLegale = ({ pdfUrl }) => {

    const navigation = useNavigation();
  return (
    <View style={{ flex: 1 }}>
      <CustomStatusBar backgroundColor="#2BA6E9" />
      <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ color: 'blue', paddingLeft: 10,paddingTop: 15, fontSize: 25 }}>X</Text>
        </TouchableOpacity>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Pdf
          key={'pdfView'}
          trustAllCerts={false}
          source={{ uri: pdfUrl }}
          style={{ flex: 1, width: '100%', height: '100%' }}
          onLoadComplete={() => console.log('PDF chargé')}
          onError={(error) => console.log('Erreur de chargement du PDF', error)}
        />
        <Text>Nothing</Text>
      </View>
    </View>
  );
};

export default RenderConditionsMentionsLegale;
