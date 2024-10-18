import { View, Text, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native'
import React from 'react'
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import Ionicons from "react-native-vector-icons/Ionicons"
import Octicons from "react-native-vector-icons/Octicons"
import FontAwesome5 from "react-native-vector-icons/FontAwesome5"
import { widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen'
import Button, { ButtonIcon } from './Button'
import styles from '../screen/Shopping/styles'
import PhotoZoomer from './PhotoZoomer'

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const ListCard = ({ Images, Product, productSpecificites, active, Language, setStateValue, showDouaneMessage}) => {
  return (
    <View style={{ backgroundColor: "#fff", margin: 5}}>
      <View style={{flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 12, paddingLeft: 22}}>
        <View>
        <ScrollView
            pagingEnabled
            horizontal
            onScroll={({nativeEvent}) => Change(nativeEvent)}
            showsHorizontalScrollIndicator={false}
            style={styles.imageSwiper}>
            {Images.map((image, index) => (
              
              <PhotoZoomer key={index} image={image} windowWidth={windowWidth} windowHeight={windowHeight} />
             
            ))}
          </ScrollView>
          <View style={styles.dotStyle}>
            {Images.map((i, k) => (
              <Text
                key={k}
                style={
                  k == active ? styles.pagingActiveText : styles.pagingText
                }>
                ⬤
              </Text>
            ))}
          </View>
        </View>
            {/* <View>
              <Image source={{uri: item.productImages[0].url}} style={{height: hp(22), borderRadius: 22, width: wp(29)}}/>
            </View> */}
            <View style={{flexDirection: "column", justifyContent: "flex-start", alignItems: "flex-start"}}>
                <View style={{paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, justifyContent: "center", alignItems: "center", maxWidth: 250}}>
                  <Text style={{fontFamily: "Poppins-Medium", fontSize: 10,textAlign: "center"}}>{'fr' == Language ? Product.name : Product.nameEN}</Text>
                </View>

                <View style={{flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8}}>
                    <Text style={{fontSize: 13, fontFamily: "Poppins-Medium",color: "#000"}}>
                       {productSpecificites ? productSpecificites.prix  : 0}€/{Product.unite ? Product.unite.valeur : ''}
                    </Text>
                    {productSpecificites && productSpecificites.prixAncien ? 
                        <Text style={{fontSize: 13, fontFamily: "Poppins-Medium",color: "#000"}}>
                        {productSpecificites.prixAncien}€/{Product.unite ? Product.unite.valeur : ''}
                      </Text>
                      :
                      <></>
                    }
                </View>
                
                <View style={styles.safeContainerStyle}>
                  <Dropdown
                    style={[styles.dropdown]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    autoScroll
                    iconStyle={styles.iconStyle}
                    containerStyle={styles.containerStyle}
                    data={data}
                    maxHeight={100}
                    labelField="label"
                    valueField="value"
                    placeholder={t('Etat')}
                    searchPlaceholder="Search..."
                    value={StateValue}
                    showsVerticalScrollIndicator={false}
                    onChange={item => {
                      setStateValue(item.value);
                      showDouaneMessage(item.value);
                    }}
                  />
                </View>
                <View style={styles.safeContainerStyle}>
                  <Dropdown
                    style={[styles.dropdown]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    autoScroll
                    iconStyle={styles.iconStyle}
                    containerStyle={styles.containerStyle}
                    data={sweeterArray}
                    maxHeight={100}
                    labelField="label"
                    valueField="value"
                    placeholder={t('Quantity')}
                    searchPlaceholder="Search..."
                    value={QuantitySelected}
                    showsVerticalScrollIndicator={false}
                    onChange={item => {
                      setQuantitySelected(item.value);
                    }}
                  />
                </View>

                <View style={{marginTop: 8, width: "100%"}}>
                <ButtonIcon title="Prendre une photo" Icon={<FontAwesome5 name="file-upload" size={15} color='#4E8FDA'/>}/>
                </View>

                <View style={{marginTop: 8, width: "100%"}}>
                   <Button title="Ajouter au panier"/>
                </View>
            </View>
        </View>
    </View>
  )
}

export default ListCard