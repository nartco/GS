import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import Ionicons from "react-native-vector-icons/Ionicons"
import Octicons from "react-native-vector-icons/Octicons"
import FontAwesome5 from "react-native-vector-icons/FontAwesome5"
import { widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen'
import Button, { ButtonIcon } from './Button'

const GridCard = ({ item, index, navigation}) => {
  return (
    <View key={index} style={{ backgroundColor: "#fff", margin: 4.5, borderRadius: 10}}>
        <View style={{flexDirection: "row", alignItems: "center",justifyContent: "space-between" ,gap: 10, paddingTop: 16, paddingLeft: 6, paddingRight: 6}}>
           <View style={{maxWidth: 130}}>
             <Text style={{fontFamily: "Poppins-SemiBold",textAlign: "left" ,fontSize: 10, color: "#000"}}>{item.name}</Text>
           </View>
           <View style={{flexDirection: "column", alignItems: "center", gap: 5}}>
                    <View>
                        <Text style={{fontSize: 9, fontFamily: "Poppins-Medium",color: "#000"}}>
                          {item.productSpecificites[0].prix}€/KG
                        </Text>
                    </View>
                    <View>
                        <Text style={{fontSize: 9, fontFamily: "Poppins-Medium",color: "#000", textDecorationLine: "line-through"}}>
                          {item.productSpecificites[0].prixAncien}€/KG
                        </Text>
                    </View>
            </View>
        </View>
      <View style={{flexDirection: "row", alignItems: "center", gap: 10, paddingBottom: 8, paddingLeft: 6}}>
            <View style={{backgroundColor: "#F5F5F5", height: hp(14), width: wp(20), borderRadius: 20, paddingTop: 10}}>
            <Image source={{uri: item.productImages[0].url}} style={{height: hp(12),objectFit: "cover" ,borderRadius: 22, width: wp(19)}}/>
            </View>
            <View style={{flexDirection: "column", justifyContent: "flex-start", alignItems: "flex-start", paddingRight: 6}}>

                
                <TouchableOpacity style={{ flexDirection: "row",width: wp(24), backgroundColor: "#F5F5F5", borderRadius: 6, paddingHorizontal: 8,paddingVertical: 8 ,alignItems: "center", justifyContent: "space-between", marginTop: 5}}>
                    <Text style={{fontFamily: "Poppins-Regular", color: "#04091E", fontSize: 11}}>
                       Colors
                    </Text>
                    <MaterialIcons name="keyboard-arrow-down" size={20} color='#000'/>
                </TouchableOpacity>
                <TouchableOpacity style={{ flexDirection: "row",width: wp(24), backgroundColor: "#F5F5F5", borderRadius: 6, paddingHorizontal: 8,paddingVertical: 8 ,alignItems: "center", justifyContent: "space-between", marginTop: 5}}>
                    <Text style={{fontFamily: "Poppins-Regular", color: "#04091E", fontSize: 11}}>
                       Stokage
                    </Text>
                    <MaterialIcons name="keyboard-arrow-down" size={20} color='#000'/>
                </TouchableOpacity>

                <TouchableOpacity style={{ flexDirection: "row",width: wp(24), backgroundColor: "#F5F5F5", borderRadius: 6, paddingHorizontal: 8,paddingVertical: 8 ,alignItems: "center", justifyContent: "space-between", marginTop: 5}}>
                    <Text style={{fontFamily: "Poppins-Regular", color: "#04091E", fontSize: 11}}>
                    Quantité
                    </Text>
                    <MaterialIcons name="keyboard-arrow-down" size={20} color='#000'/>
                </TouchableOpacity>
            </View>
        </View>

        <View style={{justifyContent: "center", alignItems: "center", paddingBottom: 16}}>
            <Button title="Ajouter au panier" navigation={navigation}/>
        </View>
    </View>
  )
}

export default GridCard