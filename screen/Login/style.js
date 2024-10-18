//import liraries
import React, {Component} from 'react';
import {View, Text, StyleSheet, Dimensions, Platform} from 'react-native';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    //     backgroundColor: '#fff',
  },
  mainTextStyle: {
    fontFamily: 'Roboto-Bold',
    fontSize: 18,
    color: '#fff',
  },
  INContainer: {
    width: windowWidth * 0.22,
    height: windowHeight * 0.15,
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
    // backgroundColor: '#000',
    alignSelf: 'center',
    marginLeft: 50,
  },
  imageStyler: {
    // backgroundColor: 'tomato',
    width: windowWidth * 0.15,
    height: windowWidth * 0.15,
    objectFit: 'cover',
  },
  profileLogo: {
    width: 20,
    height: 20,
    alignSelf: 'center',
    //     backgroundColor: 'tomato',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchLabel: {
    color: '#fff',
    marginHorizontal: 10,
    fontSize: 16,
  },
  inputContainer: {
    // marginTop: windowHeight * 0.1,
  },

  countryPickerContainerStyle: {
    borderRadius: 230,
    paddingVertical: Platform.OS === 'ios' ? 8 : 3,
  },

  countryPickerButtonStyle: {
    marginTop: Platform.OS === 'ios' ? 0 : 15,
  },
  textInput: {
    textAlignVertical: 'center',
  },
  inputCustom: {
    marginTop: windowHeight * 0.02,
    flexDirection: 'row',
    backgroundColor: '#fff',
    width: windowWidth * 0.8,
    height: windowHeight * 0.06, //probleme de HEIGHT POUR L'INPUT
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  inputNumbCustom: {
    marginTop: windowHeight * 0.02,
    flexDirection: 'row',
    backgroundColor: '#fff',
    width: windowWidth * 0.8,
    height: windowHeight * 0.06,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  inputStyled: {
    flex: 1,
    height: 50,
    color: '#000',
  },
  inputNumbStyled: {
    width: windowWidth * 0.57,
    // backgroundColor: 'green',
    marginLeft: windowWidth * 0.03,
    color: '#000',
    fontFamily: 'Roboto-Regular',
  },
  errorMessageTextStyle: {
    color: 'red',
    textAlign: 'left',
    // backgroundColor: 'gold',
    width: windowWidth * 0.6,
    fontFamily: 'Roboto-Regular',
    alignSelf: 'center',
    fontSize: 12,
  },
  inputStyled: {
    width: windowWidth * 0.55,
    // backgroundColor: 'green',
    marginLeft: windowWidth * 0.03,
    color: '#000',
    fontFamily: 'Roboto-Regular',
  },
  forgotPassContainer: {
    marginTop:
      Platform.OS === 'ios' ? windowHeight * 0.04 : windowHeight * 0.01,
  },
  forgotText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Roboto-Regular',
  },

  Auth1: {
    backgroundColor: '#042C5C',
    borderRadius: 50,
    width: windowWidth * 0.6,
    height: windowHeight * 0.055,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop:
      Platform.OS === 'ios' ? windowHeight * 0.02 : windowHeight * 0.03,
    elevation: 2,
    alignSelf: 'center',
  },
  AuthButtonText: {
    fontSize: 12,
    color: '#fff',
    // backgroundColor: 'tomato',
    width: windowWidth * 0.5,
    textAlign: 'center',
    fontFamily: 'Roboto-Regular',
    alignSelf: 'center',
  },
  mainAuthBContain: {
    marginTop: windowHeight * 0.03,
  },
  authMethodContainer: {
    height: 130,
    // justifyContent: 'space-between',
  },
  phoneAuthContainer: {
    marginTop: 20,
  
    marginHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center'
    // justifyContent: 'space-between',
  },
});

export default styles;
