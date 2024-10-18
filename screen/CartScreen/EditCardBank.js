import { View, Text, ScrollView, TextInput, StyleSheet,StatusBar, Dimensions, TouchableOpacity, ToastAndroid, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import PhoneInput from 'react-native-phone-number-input';
import axiosInstance from '../../axiosInstance';
import { getAuthentificationData } from '../../modules/GestionStorage';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
import Toast from 'react-native-toast-message';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import { HeaderActions } from '../../components/HeaderActions';
import { useIsFocused } from '@react-navigation/native';

const EditCardBank = ({ route, navigation}) => {
    const {t, i18n} = useTranslation();

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
    const CardData = route.params;


    const [fullData, setFullData] = useState({});
    const [expMonth, setExpMonth] = useState('');
    const [expyear, setExpYear] = useState('');
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [city, setCity] = useState('')
    const [country, setCountry] = useState('')
    const [line1, setLine1] = useState('')
    const [line2, setLine2] = useState('')
    const [postalCode, setPostalCode] = useState('')
    const [state, setState] = useState('')
    var isFocused = useIsFocused();
    useEffect(() => {
        getData()
    }, [isFocused])
    async function getData() {
        try{
          let getData = [];
          getData = CardData;
          setExpMonth(getData.card.exp_month);
          setExpYear(getData.card.exp_year);
          setName(getData.billing_details.name);
          setPhoneNumber(getData.billing_details.phone);
          setCity(getData.billing_details.address.city);
          setCountry(getData.billing_details.address.country);
          setLine1(getData.billing_details.address.line1);
          setLine2(getData.billing_details.address.line2);
          setPostalCode(getData.billing_details.address.postal_code);
          setState(getData.billing_details.address.state);
        
        }
        catch(error){
            console.log(error);
        }
    }

    async function updateData(cardId) {
      try{
            
        if ( phoneNumber === null)
        {
  
  
          
          if(Platform.OS == 'ios')
          {
            Toast.show({
              type: 'error',
              text1: t('phone'),
              text2: t("Le téléphone est obligatoire"),
            });
          }
          else{
            ToastAndroid.show(t("Le téléphone est obligatoire"), ToastAndroid.SHORT)
          }
          return;
        }
          if (city === null)
          {
    
    
    
            if(Platform.OS == 'ios')
            {
              Toast.show({
                type: 'error',
                text1: t('Ville'),
                text2: t("La ville est obligatoire !"),
              });
            }
            else{
              ToastAndroid.show(t("La ville est obligatoire !"), ToastAndroid.SHORT)
            }
      
            return;
          }
      
          if ( country === null)
          {
    
    
            
            if(Platform.OS == 'ios')
            {
              Toast.show({
                type: 'error',
                text1: t('le Pays'),
                text2: t("Le pays est obligatoire"),
              });
            }
            else{
              ToastAndroid.show(t("Le pays est obligatoire"), ToastAndroid.SHORT)
            }
            return;
          }

    
          if ( line1 === null)
          {
    
  
            
            if(Platform.OS == 'ios')
            {
              Toast.show({
                type: 'error',
                text1: t('Adresse ligne 1'),
                text2: t("Adresse ligne 1 obligatoire"),
              });
            }
            else{
              ToastAndroid.show(t("Adresse ligne 1 obligatoire"), ToastAndroid.SHORT)
            }
            return;
          }
    
          if ( line2 === null)
          {
    
    
            
            if(Platform.OS == 'ios')
            {
              Toast.show({
                type: 'error',
                text1: t('Adresse ligne 2'),
                text2: t("Adresse ligne 2 obligatoire"),
              });
            }
            else{
              ToastAndroid.show(t("Adresse ligne 2 obligatoire"), ToastAndroid.SHORT)
            }
            return;
          }
    
          if ( postalCode === null)
          {
    
   
            
            if(Platform.OS == 'ios')
            {
              Toast.show({
                type: 'error',
                text1: t('Code Postal'),
                text2: t("Le code Postal est obligatoire"),
              });
            }
            else{
              ToastAndroid.show(t("Le code Postal est obligatoire"), ToastAndroid.SHORT)
            }
            return;
          }
    
          if ( state === null)
          {
    
            
            if(Platform.OS == 'ios')
            {
              Toast.show({
                type: 'error',
                text1: t('State'),
                text2: t("La ville est obligatoire"),
              });
            }
            else{
              ToastAndroid.show(t("La ville est obligatoire"), ToastAndroid.SHORT)
            }
            return;
          }
    
          if ( expMonth === null)
          {
  
            
            if(Platform.OS == 'ios')
            {
              Toast.show({
                type: 'error',
                text1: t('ExpMonth'),
                text2: t("Le mois de la date d'expiration est obligatoire"),
              });
            }
            else{
              ToastAndroid.show(t("Le mois de la date d'expiration est obligatoire"), ToastAndroid.SHORT)
            }
            return;
          }
          
          if ( expyear === null)
          {
 
            if(Platform.OS == 'ios')
            {
              Toast.show({
                type: 'error',
                text1: t('Expyear'),
                text2: t("L'année de la date d'expiration est obligatoire"),
              });
            }
            else{
              ToastAndroid.show(t("L'année de la date d'expiration est obligatoire"), ToastAndroid.SHORT)
            }
            return;
          }
    
          if ( name === null)
          {
  
            
            if(Platform.OS == 'ios')
            {
              Toast.show({
                type: 'error',
                text1: t('Name'),
                text2: t("Le nom est obligatoire"),
              });
            }
            else{
              ToastAndroid.show(t("Le nom est obligatoire"), ToastAndroid.SHORT)
            }
            return;
          }

            
        const UserEmail = await getAuthentificationData()
            const response = await axiosInstance.post('/stripe/update/cards/', {
                email: UserEmail,
                cardId: cardId,
                card: {
                    exp_month: expMonth,
                    exp_year: expyear
                },
                billing_details: {
                     address: {
                               city: city,
                               country: country,
                               line1: line1,
                               line2: line2,
                               postal_code: postalCode,
                               state: state
                           },
                    name: name,
                    phone: phoneNumber
                }
              }, {
                headers: {
                  'Content-Type': 'application/json'
                }
              });
              if(Platform.OS == 'ios')
              {
                Toast.show({
                  type: 'success',
                  text1: t("Modifié"),
                  text2: t("la carte est modifiée"),
                });
              }
              else{
                ToastAndroid.show(t("la carte est modifiée"), ToastAndroid.SHORT)
              }
            return response.data
        }
        catch(error){
            if(Platform.OS == 'ios')
            {
              Toast.show({
                type: 'error',
                text1: t("Erreur"),
                text2: t("Erreur lors de la modification de la carte !"),
              });
            }
            else{
              ToastAndroid.show(t("Erreur lors de la modification de la carte !"), ToastAndroid.SHORT)
            }

        }
    }

      return (
    <View style={{flex: 1}}>
        <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
            <View style={{flex: 1, marginBottom: 50,}}>
            <HeaderActions navigation={() => navigation.goBack()} /> 
            <View style={{marginTop: 27}}>
                <Text style={{fontSize: 16, fontFamily:'Poppins-SemiBold', color: '#000', textAlign: "center"}}>{t('Modifier La Cart Bancaire')}</Text>
            </View>
             <View style={styles.inputContainer}>
                      <TextInput
                        placeholder={name ? name : t('Name')}
                        value={name}
                        style={{
                          borderWidth: 1,
                          borderColor: '#AAB0B7',
                          fontFamily: 'Poppins-Regular',
                          fontSize: 14,
                          color: '#000',
                          paddingLeft: 15,
                          borderRadius: 8,
                          backgroundColor: '#fff',
                          height: 45
                        }}
                        placeholderTextColor={name ? "#000" : '#BCB8B1'}
                        keyboardType="ascii-capable"
                        keyboardAppearance={'default'}
                        onChangeText={text => setName(text)}
                      />
                </View>
             <View style={styles.inputContainer}>
                      <PhoneInput
                    defaultCode="FR"
                    layout="first"
                    placeholder={phoneNumber ? phoneNumber.toString() : t('Téléphone')}
                    value={phoneNumber}
                    containerStyle={{
                      borderWidth: 1,
                      borderColor: '#AAB0B7',
                      flexDirection: 'row',
                      borderRadius: 8,
                      alignItems: 'center',
                      color: '#000',
                      backgroundColor: '#fff',
                      height: 50
                    }}
                    textContainerStyle={{
                      backgroundColor: 'transparent',
                      padding: 0,
                      color: '#000',
                      fontFamily: 'Poppins-Regular',
                      fontSize: 14,
                    }}
                    codeTextStyle={{
                      height: Platform.OS =="android" && 20
                    }}
                    countryPickerButtonStyle={styles.countryPickerButtonStyle}
                    textInputProps={{placeholderTextColor: phoneNumber ? "#000" : '#BCB8B1',maxLength: 12}}
                    textInputStyle={
                      {
                      height: 40,
                      paddingLeft: 16,
                      borderColor: '#AAB0B7',
                      color: '#000',
                      borderRadius: 8,
                      backgroundColor: '#fff',
                    }}
                    flagButtonStyle={{
                      backgroundColor: '#fff',
                    }}
                    onChangeFormattedText={text => {
                        setPhoneNumber(text);
                      }}
                      />
             </View>
             <View style={styles.inputContainer}>
                      <TextInput
                        placeholder={city ? city : t('City')}
                        value={city}
                        style={{
                          borderWidth: 1,
                          borderColor: '#AAB0B7',
                          fontFamily: 'Poppins-Regular',
                          fontSize: 14,
                          color: '#000',
                          paddingLeft: 15,
                          borderRadius: 8,
                          backgroundColor: '#fff',
                          height: 45
                        }}
                        placeholderTextColor={city ? "#000" : "#B0B0C3"}
                        keyboardType="ascii-capable"
                        keyboardAppearance={'default'}
                        onChangeText={newtext => setCity(newtext)}
                      />
                </View>
                <View style={styles.inputContainer}>
                      <TextInput
                        placeholder={country ? country : t('country (exp: US)')}
                        value={country}
                        maxLength={2}

                        style={{
                          borderWidth: 1,
                          borderColor: '#AAB0B7',
                          fontFamily: 'Poppins-Regular',
                          fontSize: 14,
                          color: '#000',
                          paddingLeft: 15,
                          borderRadius: 8,
                          backgroundColor: '#fff',
                          height: 45
                        }}
                        placeholderTextColor={country ? "#000" : "#B0B0C3"}
                        keyboardType="ascii-capable"
                        keyboardAppearance={'default'}
                        onChangeText={text => setCountry(text)}
                      />
                </View>
                <View style={[styles.inputContainer, {flexDirection: "row",gap: 10, backgroundColor: "transparent" ,justifyContent: "space-between", alignItems: "center"}]}>
                      <TextInput
                        placeholder={line1 ? line1 : t('line1')}
                        value={line1}
                        style={{
                          borderWidth: 1,
                          borderColor: '#AAB0B7',
                          fontFamily: 'Poppins-Regular',
                          fontSize: 14,
                          color: '#000',
                          paddingLeft: 15,
                          borderRadius: 8,
                          backgroundColor: '#fff',
                          width: windowWidth * 0.38,
                          height: 45
                        }}
                        placeholderTextColor={line1 ? "#000" : "#B0B0C3"}
                        keyboardType="ascii-capable"
                        keyboardAppearance={'default'}
                        onChangeText={text => setLine1(text)}
                      />
                      <TextInput
                        placeholder={line2 ? line2 : t('line2')}
                        value={line2}
                        style={{
                          borderWidth: 1,
                          borderColor: '#AAB0B7',
                          fontFamily: 'Poppins-Regular',
                          fontSize: 14,
                          color: '#000',
                          paddingLeft: 15,
                          borderRadius: 8,
                          backgroundColor: '#fff',
                          width: windowWidth * 0.38,
                          height: 45
                        }}
                        placeholderTextColor={line2 ? "#000" : "#B0B0C3"}
                        keyboardType="ascii-capable"
                        keyboardAppearance={'default'}
                        onChangeText={text => setLine2(text)}
                      />
                </View>
                <View style={styles.inputContainer}>
                      <TextInput
                        placeholder={postalCode ? postalCode.toString() : t('Postal code')}
                        value={postalCode}
                        style={{
                          borderWidth: 1,
                          borderColor: '#AAB0B7',
                          fontFamily: 'Poppins-Regular',
                          fontSize: 14,
                          color: '#000',
                          paddingLeft: 15,
                          borderRadius: 8,
                          backgroundColor: '#fff',
                          height: 45
                        }}
                        placeholderTextColor={postalCode ? "#000" : "#B0B0C3"}
                        keyboardType="ascii-capable"
                        keyboardAppearance={'default'}
                        onChangeText={text => setPostalCode(text)}
                      />
                </View>
                <View style={styles.inputContainer}>
                      <TextInput
                        placeholder={state ? state :t('state')}
                        value={state}
                        style={{
                          borderWidth: 1,
                          borderColor: '#AAB0B7',
                          fontFamily: 'Poppins-Regular',
                          fontSize: 14,
                          color: '#000',
                          paddingLeft: 15,
                          borderRadius: 8,
                          backgroundColor: '#fff',
                          height: 45
                        }}
                        placeholderTextColor={state ? "#000" :"#B0B0C3"}
                        keyboardType="ascii-capable"
                        keyboardAppearance={'default'}
                        onChangeText={text => setState(text)}
                      />
                </View>
                <View style={[styles.inputContainer, {flexDirection: "row",gap: 10,backgroundColor: "transparent" ,justifyContent: "space-between", alignItems: "center"}]}>
                      <TextInput
                        placeholder={expMonth ? expMonth.toString() : t('Exp Month')}
                        value={expMonth}
                        style={{
                          borderWidth: 1,
                          borderColor: '#AAB0B7',
                          fontFamily: 'Poppins-Regular',
                          fontSize: 14,
                          color: '#000',
                          paddingLeft: 15,
                          borderRadius: 8,
                          backgroundColor: '#fff',
                          width: windowWidth * 0.38,
                          height: 45
                        }}
                        placeholderTextColor={expMonth ? "#000" :"#B0B0C3"}
                        keyboardType="ascii-capable"
                        keyboardAppearance={'default'}
                        onChangeText={text => setExpMonth(text)}
                      />
                      <TextInput
                        placeholder={expyear ? expyear.toString() : t('Exp Year')}
                        value={expyear}
                        style={{
                          borderWidth: 1,
                          borderColor: '#AAB0B7',
                          fontFamily: 'Poppins-Regular',
                          fontSize: 14,
                          color: '#000',
                          paddingLeft: 15,
                          borderRadius: 8,
                          backgroundColor: '#fff',
                          width: windowWidth * 0.38,
                          height: 45
                        }}
                        placeholderTextColor={expyear ? "#000" : "#B0B0C3"}
                        keyboardType="ascii-capable"
                        keyboardAppearance={'default'}
                        onChangeText={text => setExpYear(text)}
                      />
                </View>

                
                <View style={{marginTop: 20, flex: 1, justifyContent: "center", alignItems: "center",marginBottom: 50}}>
                    {/* <Button title={t("Ajouter l'adresse")} onPress={AddNewAddress}/> */}
                    <TouchableOpacity style={{ paddingVertical: 8 ,paddingHorizontal: 22, width: windowWidth * 0.38,flexDirection: "row", alignItems: "center",justifyContent: "center", backgroundColor: "#4E8FDA", borderRadius: 25}} onPress={() => updateData(CardData.id)}>
                      <Text style={{fontFamily:"Poppins-Medium", fontSize: 12, color:"#fff", textAlign: "center"}}>{t('Editer Card')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
    inputContainer: {
        width: windowWidth * 0.8,
        backgroundColor: 'rgba(173, 173, 173, 0.2)',
        alignSelf: 'center',
        borderRadius: 6,
        marginTop: '3%',
      },
    countryPickerButtonStyle: {
        width: 70,
      },
})

export default EditCardBank