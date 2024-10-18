import React from 'react';

import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ImageBackground,
} from 'react-native';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

// create a component
const PrivateSalesDetailComponent = props => {
  const Navigation = props.navigation;
  const Service = props.service;
  const PaysLivraison = props.paysLivraison;
  const Language = props.language;
  const Image = 'fr' == Language ? props.data.image : props.data.imageEN;
  const Attributs = props.data.attributs;
  const ServiceSelected = props.selectedService;
  const SelectedCategorieId = props.SelectedCategorieId;



  const handleSelectCategory = category => {
    Navigation.navigate('ProductList', {
      category,
      PaysLivraison,
      Service,
      Language,
      ServiceSelected,
      SelectedCategorieId
    });
  };

  if (!Image) {
    return <></>;
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.bannerContainer}>
        <View>
          <TouchableOpacity onPress={() => handleSelectCategory(props.data)}>
            <ImageBackground
              source={{uri: Image}}
              style={styles.backgroundImageStyle}
            />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

// define your styles
const styles = StyleSheet.create({
  bannerContainer: {
    //     backgroundColor: 'tomato',
    height: 'auto',
    width: windowWidth * 0.95,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    // marginbottom: windowHeight * 0.03,
  },
  safeContainerStyle: {
    justifyContent: 'center',
    // backgroundColor: 'tomato',
    width: windowWidth * 0.4,
    // borderRadius:0
  },
  backgroundImageStyle: {
    height: windowHeight * 0.15,
    width: windowWidth,
    alignSelf: 'center',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    marginBottom: windowWidth * 0.05,
  },
  addButtonContainer: {
    backgroundColor: '#fff',
    width: 40,
    height: 40,
    borderRadius: 200,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 7,
    elevation: 10,
  },
  addButtonText: {
    fontSize: 30,
    color: '#888',
    textAlignVertical: 'center',
    textAlign: 'center',
  },
  DetailsContainer: {
    backgroundColor: '#F4F6F8',
    width: windowWidth * 0.95,
    height: windowHeight * 0.5,
    marginTop: windowHeight * 0.03,
    borderRadius: 28,
    marginBottom: windowHeight * 0.04,
    elevation: 1,
  },
  upperRow: {
    // backgroundColor: 'green',
    flexDirection: 'row',
    height: windowHeight * 0.1,
    width: windowWidth * 0.95,
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: windowHeight * 0.03,
  },
  detailTextContainer: {
    // backgroundColor: 'tomato',
    height: windowHeight * 0.08,
    width: windowWidth * 0.8,
    alignItems: 'flex-start',
    justifyContent: 'space-around',
  },
  detailNameText: {
    color: '#000',
    fontFamily: 'Roboto-Bold',
    fontSize: 14,
    // backgroundColor: 'tomato',
    margin: 2,
    width: windowWidth * 0.6,
  },
  discountPriceText: {
    color: '#000',
    fontFamily: 'Roboto-Bold',
    fontSize: 13,
    // backgroundColor: 'tomato',
    margin: 2,
  },
  priceText: {
    color: '#000',
    fontFamily: 'Roboto-Bold',
    fontSize: 13,
    textDecorationLine: 'line-through',
  },
  counterTExt: {
    fontSize: 30,
    color: '#000',
  },
  counterButton: {
    width: 50,
    height: 50,
    borderRadius: 100,
    backgroundColor: '#DFE8F2',
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonText: {
    color: '#A1B0C1',
    fontSize: 20,
  },
  downRow: {
    // backgroundColor: 'tomato',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: windowWidth * 0.9,
    height: windowHeight * 0.35,
    alignSelf: 'center',
  },
  dropDowncontainer: {
    // backgroundColor: 'gold',
    width: windowWidth * 0.4,
    height: windowHeight * 0.31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageSwiper: {
    // backgroundColor: 'gold',
    width: windowWidth * 0.4,
    height: windowHeight * 0.25,
    borderRadius: 10,
  },
  dotStyle: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    justifyContent: 'space-around',
    // backgroundColor: 'tomato',
    width: windowWidth * 0.1,
  },
  pagingText: {
    color: '#888',
    fontSize: 16,
    opacity: 0.1,
  },
  pagingActiveText: {
    color: '#14213D',
    fontSize: 16,
  },
  dropDownscontainer: {
    // backgroundColor: 'green',
    width: windowWidth * 0.4,
    height: windowHeight * 0.31,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  inputContainer: {
    backgroundColor: '#d5d6d7',
    width: windowWidth * 0.4,
    height: 50,
    borderRadius: 10,
    elevation: 1,
  },
  inputStyle: {
    padding: 10,
    color: '#14213D',
    fontFamily: 'Roboto-Bold',
    marginLeft: 10,
    fontSize: 16,
  },
  buttonContainers: {
    backgroundColor: '#1A6CAF',
    height: windowHeight * 0.04,
    width: windowWidth * 0.4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  buttonCartContainers: {
    backgroundColor: '#3292E0',
    height: windowHeight * 0.04,
    width: windowWidth * 0.4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  buttonText: {
    fontSize: 10,
    color: '#fff',
    fontFamily: 'Roboto-Bold',
  },
  descrContainer: {
    //     backgroundColor: 'tomato',
    width: windowWidth * 0.4,
    textAlign: 'justify',
  },
  descrText: {
    color: '#BCB8B1',
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
  },
  dropdown: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 17,
    backgroundColor: '#d5d6d7',
    elevation: 1,
  },
  placeholderStyle: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#14213D',
  },
  selectedTextStyle: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    color: '#14213D',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  containerStyle: {
    backgroundColor: '#d5d6d7',
    borderRadius: 8,
    maxHeight: 100,
  },
});

//make this component available to the app
export default PrivateSalesDetailComponent;
