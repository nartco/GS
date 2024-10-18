//import liraries
import React, {useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from './styles';
import Earth from '../../assets/images/LOGO_GS.png';
import Shape1 from '../../assets/images/shape_1.png';
import Shape2 from '../../assets/images/shape_2.png';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
import {NavigationContainer, useNavigation} from '@react-navigation/native';

// create a component
const Splash = props => {
  // const navigation = useNavigation();
  // useEffect(() => {
  //   setTimeout(() => {
  //     navigation.navigate('BottomTab');
  //   }, 2000);
  // }, []);

  return (
    <View
      style={{
        flex: 1,
        position: 'relative',
        height: '100%',
        backgroundColor: '#2DA0E6',
      }}>
      <StatusBar backgroundColor="#2BA6E9" />
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: -50,
        }}>
        <Image
          source={Earth}
          style={{width: 152, height: 151, marginBottom: 8}}
        />
        <Text
          style={{
            fontSize: windowWidth * 0.08,
            fontFamily: 'Roboto-Medium',
            color: '#fff',
          }}>
          GS
        </Text>
      </View>
      <View style={{position: 'absolute', top: windowWidth * 0.95, left: 0}}>
        <Image source={Shape1} style={{width: 120, height: 180}} />
      </View>
      <View style={{position: 'absolute', top: windowWidth * 0.24, right: 0}}>
        <Image source={Shape2} style={{width: 150, height: 210}} />
      </View>
      <View style={styles.bottomTextView}>
        <TouchableOpacity>
          <Text style={styles.footerTextStyle}>Godare Services</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

//make this component available to the app
export default Splash;
