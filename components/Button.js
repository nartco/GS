import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'

const Button = ({ title, navigation, width, bgColor = false }) => {
  return (
    <TouchableOpacity disabled={bgColor} onPress={navigation} style={{ paddingVertical: 8,width: width ,paddingHorizontal: 22,flexDirection: "row", alignItems: "center",justifyContent: "center", backgroundColor: bgColor ? "#999" : "#4E8FDA", borderRadius: 25,}}>
      <Text style={{fontFamily:"Poppins-Medium", fontSize: 12, color:"#fff"}}>{title}</Text>
    </TouchableOpacity>
  )
}
export const ButtonPrix = ({ title, navigation, language }) => {
  return (
    <TouchableOpacity onPress={navigation} style={{ width: 93,height: 42 ,flexDirection: "row", alignItems: "center",justifyContent: "center", backgroundColor: "#2BA6E9", borderRadius: 25}}>
      <Text style={{fontFamily:"Poppins-Medium", fontSize: 17, color:"#fff"}}>{('en' == language ? '€ ' : '') + (title ? title : '-') + ('fr' == language ? ' €' : '')}</Text>
    </TouchableOpacity>
  )
}
export const ButtonIcon = ({ title, navigation, Icon }) => {
  return (
    <TouchableOpacity onPress={navigation} style={{ paddingVertical: 8, paddingHorizontal: 22,flexDirection: "row", alignItems: "center",justifyContent: "center" ,gap: 10, backgroundColor: "transparent",borderWidth: 1,borderColor: "#4E8FDA",color: "#4E8FDA" ,borderRadius: 25, }}>
      <View>{Icon}</View>
      <Text style={{fontFamily:"Poppins-Medium", fontSize: 12, color:"#4E8FDA"}}>{title}</Text>
    </TouchableOpacity>
  )
}

export default Button