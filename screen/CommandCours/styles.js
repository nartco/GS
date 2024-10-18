import {StyleSheet, Dimensions} from 'react-native';
import commonStyle from '../../helper/commonStyle';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //     justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  orderDetailsContainer: {
    backgroundColor: '#fff',
    width: windowWidth * 0.9,
    height: 'auto',
    alignSelf: 'center',
    elevation: 3,
    borderRadius: 10,
    justifyContent: 'space-around',
    marginTop: windowHeight * 0.03,
  },
  TextContainer: {
    // backgroundColor: 'red',
    height: 'auto',
    //width: windowWidth * 0.45,
    alignItems: 'flex-start',
    //justifyContent: 'space-evenly',
    marginTop:10
  },
  NameTxt: {
    // backgroundColor: 'green',
   // width: windowWidth * 0.45,
    fontFamily: commonStyle.regular,
    fontSize: 12,
    color: '#000',
    marginTop:5
  },
  textPrice: {
    marginLeft: windowWidth * 0.3
  },
  PriceAndDateText: {
    // backgroundColor: 'gold',
    width: windowWidth * 0.3,
    fontFamily: commonStyle.regular,
    fontSize: 10,
    color: '#000',
  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  AllTextContainer: {
    // backgroundColor: 'gold',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 'auto',
  },
  boxContainer: {
    backgroundColor: '#feafc9',
    width: 100,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 7,
  },
  boxText: {
    fontFamily: commonStyle.Bold,
    fontSize: 13,
    color: '#fff',
  },
  orderAgainContainer: {
    backgroundColor: '#3292E0',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: windowWidth * 0.7,
    height: windowHeight * 0.05,
    borderRadius: 50,
    marginTop:10,
    marginBottom:12
  },
  TExtstyle: {
    fontFamily: commonStyle.regular,
    fontSize: 13,
    color: '#fff',
  },
  containerFlatelist: {
    // flex: 1,
    //         justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    width: windowWidth * 1.0,
    height: windowHeight * 1.0,
  },
  titleText: {
    color: '#000',
    fontSize: 18,
    fontFamily: commonStyle.Bold,
  },
});

export default styles;
