import {StyleSheet, Dimensions} from 'react-native';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    //     justifyContent: 'center',
    backgroundColor: '#fff',
  },
  superContainer: {
    marginTop: windowHeight * 0.1,
    backgroundColor: 'tomato',
    width: windowWidth * 0.85,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upperTextContainer: {
    // backgroundColor: 'tomato',
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
    width: windowWidth * 0.6,
    textAlignVertical: 'center',
    alignSelf: 'center',
  },
  upperText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 18,
    color: '#1C1939',
    textAlign: 'center',
  },
  safeContainerStyle: {
    justifyContent: 'center',
    // backgroundColor: 'tomato',
    width: windowWidth * 0.85,
    // borderRadius:0
    alignSelf: 'center',
    marginTop: windowHeight * 0.02,
  },
  ContainerStyle: {
    backgroundColor: '#E6E6E6',
    borderRadius: 10,
    padding: 5,
    paddingLeft: 30,
    color: '#000',
  },
  textHeading: {
    color: '#000',
  },

  dropdown: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 17,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: "#2BA6E9", 
    elevation: 1,
    width: windowWidth * 0.8,
  },
  placeholderStyle: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    color: '#14213D',
  },
  selectedTextStyle: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    color: '#14213D',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  containerStyle: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 180,
    marginTop: -1.5,
    borderLeftWidth:1,
    borderRightWidth:1,
    borderColor: "#2BA6E9"
  },
  butnText: {
    fontFamily: 'Roboto-Regular',
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  item: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textItem: {
    fontSize: 16,
  },
});

export default styles;
