import { View, Text, ScrollView, Image, TextInput,TouchableOpacity, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen'
import France from "../../assets/images/france.png"
import Feather from "react-native-vector-icons/Feather"
import CoteIvoire from "../../assets/images/cote_ivoire.png"
import SmallEarth from "../../assets/images/small_earth.png"
import { cardData, card_category } from '../../constant/data'
import MasterCard from "../../assets/images/masterCard.png"
import Button from '../../components/Button'

const AddCardChekoutScreen = ({ navigation }) => {

    const [isSelected, setIsSelected] = useState(false);
    const [activeCard, setActiveCard] = useState(0)

  return (
    <SafeAreaView style={{flex: 1}}>
        <ScrollView      showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}>
           <View style={{flex: 1}}>
                <View style={{ position: "relative" ,alignItems: "center", backgroundColor: "#2BA6E9", justifyContent: "center", height: hp(12)}}>
                    <Text style={{ fontSize: 14, color: "#fff", fontFamily: "Roboto-Bold"}}>Fret par avoin</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10}}>
                        <View style={{flexDirection: "row", alignItems: "center", gap: 4}}>
                            <Image source={France}/>
                            <Text style={{ fontSize: 14, color: "#fff", fontFamily: "Roboto-Regular"}}>France</Text>
                            <Feather name="arrow-up-right" color="#fff" size={22}/>
                        </View>
                        <View style={{flexDirection: "row", alignItems: "center", gap: 4}}>
                            <Image source={CoteIvoire}/>
                            <Text style={{ fontSize: 14, color: "#fff", fontFamily: "Roboto-Regular"}}>Côte d'ivoire</Text>
                            <Feather name="arrow-down-right" color="#fff" size={22}/>
                        </View>
                    </View>

                    <View style={{ position: "absolute", top: 15, right: 10}}>
                        <Image source={SmallEarth}/>
                        <Text style={{ fontSize: 14, color: "#fff", fontFamily: "Roboto-Bold", textAlign: "center", marginTop: 4}}>GS</Text>
                    </View>
                </View>
            

                <View style={{marginTop: 24, marginBottom: 12}}>
                    <Text
                        style={{
                        fontFamily: 'Poppins-SemiBold',
                        fontSize: 16,
                        color: '#000',
                        textAlign: 'center',
                        }}>
                        Mode de paiment
                    </Text>
                </View>
                
                <ScrollView  horizontal style={{paddingLeft: 10}} showsHorizontalScrollIndicator={false}>
                            {
                                card_category.map((item, index) => (
                                    <View key={index} style={{ marginRight: 15, marginBottom: 25}}>
                                        <TouchableOpacity onPress={() => setActiveCard(index)} style={[activeCard === index ?  styles.backgroundColorActive : styles.backgroundColor, { justifyContent: "center",borderRadius: 20,alignItems: "center" ,paddingHorizontal: 41, paddingVertical: 16, height: 56, borderWidth: 1.2, borderColor: "#2196F3"}]}>
                                            <View style={{display: item.imgDisplay}}>{activeCard === index ? item.imgActive : item.img}</View>
                                            <Text style={[activeCard === index ? styles.textActive : styles.textColor, {display: item.titledisplay, fontFamily: "Poppins-Medium", fontSize: 16}]}>{item.title}</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))
                            }
                </ScrollView>

                <ScrollView horizontal style={{paddingLeft: 10}} showsHorizontalScrollIndicator={false}>
                        {
                            cardData.map((item, index) => (
                            <View style={{position: "relative", marginRight: 22}} key={index}>
                                <Image source={item.image} style={{width: wp(75), height: hp(19), objectFit: 'cover', borderRadius: 25}}/>
                                <View style={{ position: "absolute", top: 38, left: 30}}>
                                    <Text style={{color: "#fff", fontSize: 12, fontFamily: 'Poppins-Medium'}}>{item.name}</Text>
                                    <Text style={{color: "#fff", fontSize: 16, fontFamily: 'Poppins-Bold'}}>{item.price} €</Text>
                                </View>
            
                                <View style={{ position: "absolute", bottom: 18, left: 30}}>
                                    <Text style={{color: "#fff", fontSize: 14, fontFamily: 'Poppins-Medium'}}>{item.card}</Text>
                                </View>
                                <View style={{ position: "absolute", top: 68, right: 40}}>
                                <Image source={MasterCard}/>
                                </View>
                            </View>
                            ))
                        }
                </ScrollView>

                <View style={{paddingHorizontal: 25, marginTop: 41}}>
                    <View style={{}}>
                        <Text style={{ fontSize: 14, fontFamily: "Poppins-Medium", color: "#000", marginBottom: 10}}>{ t('Nom du titulaire') }</Text>
                        <TextInput 
                        placeholder="Samuel Witwicky"
                        placeholderTextColor="#626262"
                        style={{borderWidth: 1, borderColor: "#AAB0B7", paddingLeft: 20 ,borderRadius: 8,fontFamily: "Poppins-Regular", fontSize: 14, color: "#000", backgroundColor: "#fff"}}
                        />
                    </View>
                    <View style={{marginTop: 20}}>
                        <Text style={{ fontSize: 14, fontFamily: "Poppins-Medium", color: "#000", marginBottom: 10}}>Numéro de carte</Text>
                        <TextInput 
                        placeholder="6775 2235 5567 1234"
                        placeholderTextColor="#626262"
                        style={{borderWidth: 1, borderColor: "#AAB0B7", paddingLeft: 20 ,borderRadius: 8,fontFamily: "Poppins-Regular", fontSize: 14, color: "#000", backgroundColor: "#fff"}}
                        />
                    </View>
                    <View style={{marginTop: 20}}>
                        <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10}}>
                            <View>
                                <Text style={{ fontSize: 14, fontFamily: "Poppins-Medium", color: "#000", marginBottom: 10}}>Mois /année</Text>
                                <TextInput 
                                placeholder="Enter here"
                                placeholderTextColor="#626262"
                                style={{borderWidth: 1, borderColor: "#AAB0B7", paddingLeft: 20,width: wp(42), borderRadius: 8,fontFamily: "Poppins-Regular", fontSize: 14, color: "#000", backgroundColor: "#fff"}}
                                />
                            </View>
                            <View>
                                <Text style={{ fontSize: 14, fontFamily: "Poppins-Medium", color: "#000", marginBottom: 10}}>CVV</Text>
                                <TextInput 
                                placeholder="Enter here"
                                placeholderTextColor="#626262"
                                style={{borderWidth: 1, borderColor: "#AAB0B7",width: wp(42) ,paddingLeft: 20 ,borderRadius: 8,fontFamily: "Poppins-Regular", fontSize: 14, color: "#000", backgroundColor: "#fff"}}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={{marginTop: 24}}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10}}>
                            <TouchableOpacity onPress={() => setIsSelected(!isSelected)}>
                                    <View style={{width: 24, height: 24, borderColor: "#2BA6E9", borderWidth: 2, borderRadius: 7, padding: 4,justifyContent: "center",alignItems: "center" , backgroundColor: "transparent"}}>
                                        {isSelected ? <View style={{ backgroundColor: "#2BA6E9", width: 12, height: 12, borderRadius: 3}}></View> : null}
                                    </View>
                            </TouchableOpacity>

                            <Text style={{fontFamily: 'Poppins-Regular', fontSize: 12, color: "#000"}}>Enregistrer les détails de la carte </Text>
                        </View>
                   </View>

                   <View style={{marginTop: 20}}>
                      <View style={{flexDirection: "row",justifyContent: "space-between", alignItems: "center"}}>
                         <Text style={{ fontSize: 12, fontFamily: "Poppins-Regular", color: "#000"}}>Montant à payer</Text>
                         <Text style={{ fontSize: 18, fontFamily: "Poppins-Bold", color: "#262A2B"}}>90,85 €</Text>
                      </View>
                   </View>

                   <View style={{marginTop: 20, flex: 1, justifyContent: "flex-end", alignItems: 'center', paddingBottom: 72}}>
                     <Button title="Payez maintenant" navigation={() => navigation.navigate('VerifyCardChckoutScreen')}/>
                   </View>
                </View>
                
           </View>
        </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    backgroundColorActive: {
        backgroundColor: "#2196F3"
    },
    backgroundColor: {
        backgroundColor: "#fff"
    },
    textActive: {
        color: "#fff"
    },
    textColor: {
       color: "#000"
    },
})

export default AddCardChekoutScreen