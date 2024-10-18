import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { HeaderEarth } from '../../components/Header'
import DropDownPicker from 'react-native-dropdown-picker';
import PhoneInput from 'react-native-phone-number-input';
import Button from '../../components/Button';
import { ScrollView } from 'react-native-virtualized-view';

const LoginShoppinScreen = ({ navigation }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [current, setCurrent] = useState();
    const [isSelected, setIsSelected] = useState(false);

    const items = [
      {
        label: 'France',
        value: 'france',
      },
      {
        label: 'France',
        value: 'germany',
      },
      {
        label: 'France',
        value: 'italy',
      },
  
    ];
  return (
    <SafeAreaView style={{ flex: 1}}>
      <ScrollView style={{paddingBottom: 50}} showsVerticalScrollIndicator={false}>
         <View style={{flex: 1}}>
             <HeaderEarth />

             <View style={{ marginTop: 30, marginBottom: 12}}>
                 <Text style={{ fontFamily: "Poppins-SemiBold", fontSize: 16, color: "#000", textAlign: "center"}}>Veuillez créer un compte</Text>
             </View>

             <View style={{paddingHorizontal: 28}}>
                <DropDownPicker
                items={items}
                open={isOpen}
                setOpen={() => setIsOpen(!isOpen)}
                value={current}
                setValue={(val) => setCurrent(val)}
                dropDownContainerStyle={{backgroundColor: '#fff', borderColor: "#AAB0B7", fontSize: 54}}
                style={{ backgroundColor: "#fff", borderColor: "#AAB0B7", fontSize: 54, paddingLeft: 15}}
                listItemContainerStyle={{ borderBottomColor: "#000"}}
                placeholder='Civilité'
                placeholderStyle={{ fontFamily: "Poppins-Regular", fontSize: 14, color: "#AAB0B7"}}
                textStyle={{fontFamily: "Poppins-Regular", fontSize: 14, color: "#000"}}
                />
                <View style={{marginTop: 12}}>
                    <TextInput 
                      placeholder="Prénom*"
                      style={{borderWidth: 1, borderColor: "#AAB0B7", paddingLeft: 15, borderRadius: 8,fontFamily: "Poppins-Regular", fontSize: 14, color: "#AAB0B7", backgroundColor: "#fff"}}
                    />
                </View>
                <View style={{marginTop: 12}}>
                    <TextInput 
                      placeholder="Nom*"
                      style={{borderWidth: 1, borderColor: "#AAB0B7",fontFamily: "Poppins-Regular", fontSize: 14, color: "#AAB0B7", paddingLeft: 15, borderRadius: 8, backgroundColor: "#fff"}}
                    />
                </View>
                <View style={{}}>
                    <PhoneInput 
                      placeholder="(201) 555-0124"
                      placeholderTextColor="#000"
                      defaultCode='FR'
                      containerStyle={{flexDirection: "row", alignItems: "center", gap: 5,color: "#000", backgroundColor: "transparent", width: 370 }}
                      codeTextStyle={{ display: "none"}}
                      textContainerStyle={{backgroundColor: "transparent" , padding: 0, color: "#000",fontFamily: "Poppins-Regular", fontSize: 14 }}
                      textInputStyle={{borderWidth: 1, height: 60,paddingLeft: 16 ,borderColor: "#AAB0B7",color: "#000" ,borderRadius: 8, backgroundColor: "#fff"}}
                      flagButtonStyle={{borderWidth: 1, height: 60 ,borderColor: "#AAB0B7" ,borderRadius: 8, backgroundColor: "#fff"}}
                    />
                </View>
                <View style={{marginTop: 2}}>
                    <TextInput 
                      placeholder="E-mail*"
                      style={{borderWidth: 1, borderColor: "#AAB0B7",fontFamily: "Poppins-Regular", fontSize: 14, color: "#AAB0B7", paddingLeft: 15, borderRadius: 8, backgroundColor: "#fff"}}
                    />
                </View>
                <View style={{marginTop: 12}}>
                    <TextInput 
                      placeholder="Mot de passe*"
                      style={{borderWidth: 1, borderColor: "#AAB0B7",fontFamily: "Poppins-Regular", fontSize: 14, color: "#AAB0B7", paddingLeft: 15, borderRadius: 8, backgroundColor: "#fff"}}
                    />
                </View>
                <View style={{marginTop: 12}}>
                    <TextInput 
                      placeholder="Date de naissance*"
                      style={{borderWidth: 1, borderColor: "#AAB0B7",fontFamily: "Poppins-Regular", fontSize: 14, color: "#AAB0B7", paddingLeft: 15, borderRadius: 8, backgroundColor: "#fff"}}
                    />
                </View>
                <View style={{marginTop: 24}}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 15}}>
                          <TouchableOpacity onPress={() => setIsSelected(!isSelected)}>
                                <View style={{width: 24, height: 24, borderColor: "#2BA6E9", borderWidth: 2, borderRadius: 7, padding: 4,justifyContent: "center",alignItems: "center" , backgroundColor: "transparent"}}>
                                    {isSelected ? <View style={{ backgroundColor: "#2BA6E9", width: 12, height: 12, borderRadius: 3}}></View> : null}
                                </View>
                          </TouchableOpacity>

                          <Text style={{fontFamily: 'Poppins-Regular', fontSize: 12, color: "#000"}}>Enregistrer les détails de la carte </Text>
                    </View>
                </View>

                <View style={{marginTop: 27}}>
                   <View style={{ justifyContent: "flex-end", alignItems: 'center', paddingBottom: 72}}>
                     <Button title="s'inscrire" navigation={() => navigation.navigate('CartScreen')}/>
                   </View>
                </View>
             </View>
         </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default LoginShoppinScreen