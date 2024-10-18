import { View, Text } from 'react-native'
import React from 'react'
import { getEnglishDateFormat } from '../modules/DateFinanceUtils'

export const RenderItem = ({ data}) => {
  return (
    <View style={{ flexDirection: "row", gap: 15, alignItems: "center",justifyContent: 'space-between' ,backgroundColor: "#EDEDF3",borderBottomWidth: 1, borderBottomColor: "#E2E2E2" ,paddingVertical: 16, paddingHorizontal: 22}}>
      <Text style={{color: "#000", fontFamily: "Poppins-Regular", fontSize: 13}}>{data.montant}</Text>
      <Text style={{color: "#000", fontFamily: "Poppins-Regular", fontSize: 13}}>{data.montant - data.montantConsomme}</Text>
      <Text style={{color: "#000", fontFamily: "Poppins-Regular", fontSize: 13}}>{ getEnglishDateFormat(data.createdAt) }</Text>
      <Text style={{color: "#000", fontFamily: "Poppins-Regular", fontSize: 13}}>{ getEnglishDateFormat(data.dateExpiration) }</Text>
    </View>
  )
}

export const RenderItemCode = ({ data}) => {
  return (
    <View style={{ flexDirection: "row", gap: 5, alignItems: "center",justifyContent: 'space-between' ,backgroundColor: "#EDEDF3",borderBottomWidth: 1, borderBottomColor: "#E2E2E2" ,paddingVertical: 12, paddingHorizontal: 30}}>
      <Text style={{color: "#000", fontFamily: "Poppins-Regular", fontSize: 12}}>{data.code}</Text>
      <Text style={{color: "#000", fontFamily: "Poppins-Regular", fontSize: 12}}>{data.percentage}</Text>
      <Text style={{color: "#000", fontFamily: "Poppins-Regular", fontSize: 12}}>{data.service}</Text>
      <Text style={{color: "#000", fontFamily: "Poppins-Regular", fontSize: 12}}>{data.pays}</Text>
      <Text style={{color: "#000", fontFamily: "Poppins-Regular", fontSize: 12}}>{data.produit}</Text>
      <Text style={{color: "#000", fontFamily: "Poppins-Regular", fontSize: 12}}>{data.invlide}</Text>
    </View>
  )
}

