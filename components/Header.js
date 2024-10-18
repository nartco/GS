import { View, Text, Image, StatusBar, Dimensions, Platform } from 'react-native'
import React from 'react'
import HeaderEarthImage from "../assets/images/earth.png"
import { widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen'
import France from "../assets/images/france.png"
import Feather from "react-native-vector-icons/Feather"
import CoteIvoire from "../assets/images/cote_ivoire.png"
import SmallEarth from "../assets/images/small_earth.png"
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
export const HeaderEarth = () => {
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

  const iosPlat = Platform.OS

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
      iosPlat == 'ios'
      ?
      <>
      <CustomStatuBar backgroundColor="#2BA6E9"/> 
      <View style={{ alignItems: "center", backgroundColor: "#2BA6E9", justifyContent: "center", height: height}}>
          <Image source={HeaderEarthImage} style={{width: WidthEarth, height: heightEarth, objectFit: "cover"}}/>
          <Text style={{ fontSize: windowWidth * 0.04, color: "#fff", fontFamily: "Roboto-Bold"}}>GS</Text>
      </View>
      </>
      :
      <View style={{ alignItems: "center", backgroundColor: "#2BA6E9", justifyContent: "center" ,height: hp(12)}}>
          <Image source={HeaderEarthImage} style={{width: wp(10), height: wp(10), objectFit: "cover"}}/>
          <Text style={{ fontSize: 18, color: "#fff", fontFamily: "Roboto-Bold"}}>GS</Text>
    </View>
    }
    </>
  )
}

