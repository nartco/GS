import { View, Text, Image, TouchableOpacity, Dimensions, StatusBar, Platform } from 'react-native'
import React from 'react'
import HeaderEarthImage from "../assets/images/earth.png"
import { widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen'
import AntDesign from "react-native-vector-icons/AntDesign"
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';

export const HeaderActions = ({ navigation }) => {
  const CustomStatuBar = ({
    backgroundColor,
    barStyle = "light-content"
  }) => {
      const inset = useSafeAreaInsets();
      return(
        <View style={{height: inset.top, backgroundColor}}>
          <StatusBar 
            animated={true} 
            backgroundColor={backgroundColor}
            barStyle={barStyle}
          />
        </View>
      )
  }

  let height = 0;
  let heightEarth = 0;
  let WidthEarth = 0;
  if(windowHeight == 667)
  {
    height = hp(13);
    heightEarth = hp(10);
    WidthEarth = hp(10);
  }
  else if(windowHeight >= 772)
  {
    height = hp(9)
    heightEarth = wp(9)
    WidthEarth = wp(9)
  }
  else{
    height = hp(12)
  }

    return (
      <>
      {
        Platform.OS === 'ios'
        ?
        <>
        <CustomStatuBar backgroundColor="#2BA6E9"/> 
      <View style={{ alignItems: "center", backgroundColor: "#2BA6E9", justifyContent: "space-between", flexDirection: "row" ,height: height}}>
        <View>
        <TouchableOpacity
        onPress={navigation}
            style={{marginLeft: 10,  padding: 2.5, borderRadius: 8, backgroundColor: "#fff", maxWidth: windowWidth * 0.1 }}
          >
            <AntDesign 
              name="arrowleft" color="#2BA6E9" size={22}
            />
          </TouchableOpacity>
        </View>
        <View style={{alignItems: "center", justifyContent: "center"}}>
            <Image source={HeaderEarthImage} style={{width: WidthEarth, height: heightEarth, objectFit: "cover"}}/>
            <Text style={{ fontSize:  windowWidth * 0.04, color: "#fff", fontFamily: "Roboto-Bold"}}>GS</Text>
          </View>
          <View style={{width: wp(12)}}>
  
          </View>
      </View>
        </>
        :
        <View style={{ alignItems: "center", backgroundColor: "#2BA6E9", justifyContent: "space-between", flexDirection: "row" ,height: hp(12)}}>
        <View>
        <TouchableOpacity
        onPress={navigation}
            style={{marginLeft: 10,  padding: 2.5, borderRadius: 8, backgroundColor: "#fff", maxWidth: windowWidth * 0.1 }}
          >
            <AntDesign 
              name="arrowleft" color="#2BA6E9" size={22}
            />
          </TouchableOpacity>
        </View>
          <View style={{alignItems: "center", justifyContent: "center"}}>
            <Image source={HeaderEarthImage} style={{width: wp(10), height: wp(10), objectFit: "cover"}}/>
            <Text style={{ fontSize: 18, color: "#fff", fontFamily: "Roboto-Bold"}}>GS</Text>
          </View>
          <View style={{width: wp(12)}}>
  
          </View>
      </View>
      }

      </>
    )
  } 