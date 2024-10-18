import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    // backgroundColor: 'tomato',
  },
  MainTextContainer: {},
  mainTextStyle: {
    fontFamily: "Roboto-Regular",
    fontSize: 34,
    color: '#fff',
    marginTop: 10,
  },
  bottomTextView: {
    width: windowWidth * 0.5,
    height: windowHeight * 0.05,
    // backgroundColor: 'tomato',
    alignSelf: "center",
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerTextStyle: {
    fontFamily: "Roboto-Regular",
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },

  INContainer: {
    width: windowWidth * 1.0,
    height: windowHeight * 0.9,
    justifyContent: 'center',
    alignItems: 'center',
    // marginTop: windowHeight * 0.2,
    // backgroundColor: '#000',
  },
  imageStyler: {
    // backgroundColor: 'tomato',
    width: 109,
    height: 108,
  },
});

export default styles;
