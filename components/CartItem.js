import { View, Text, TouchableOpacity, Image } from 'react-native'
import React, {useState} from 'react'
import Feather from "react-native-vector-icons/Feather"
import Octicons from "react-native-vector-icons/Octicons"
import { widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen'
import Button, { ButtonPrix } from './Button'

const CartItem = ({ item, index, language }) => {
    const [quantity, setQuantity] = useState(1)

    const IncrementQunaityt = () => {
        setQuantity(quantity + 1);
    }

    const DesIncrementQunaityt = () => {
        if(quantity !== 1){
            setQuantity(quantity - 1);
        }
    }

  return (
    <View style={{backgroundColor: "#fff", paddingLeft: 28 ,paddingVertical: 12, marginBottom: 16, borderRadius: 18}}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 20}}>
              <View>
                 <Image source={item.image}/>
              </View>
              <View>
                  <View style={{flexDirection: "row",justifyContent: "space-between" ,alignItems: "flex-start", gap: wp(20)}}>
                      <View>
                            <Text style={{ fontSize: 16, fontFamily: "Poppins-Regular", color: "#000"}}>{item.title}</Text>
                            <Text>{item.color} - {item.stokage} GB</Text>
                            <Text>{t('etat')}: {item.etat}</Text>
                      </View>
                      <TouchableOpacity>
                          <Feather name="trash-2" color="#E10303" size={25}/>
                      </TouchableOpacity>
                  </View>

                  <View style={{flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12}}>
                      <ButtonPrix title={item.price} language={language} />

                      <View style={{flexDirection: "row", alignItems: "center", gap: 25, backgroundColor:"#EFEFEF", borderRadius: 18, paddingHorizontal: 19, paddingVertical: 5}}>
                          <TouchableOpacity onPress={DesIncrementQunaityt}>
                             <Feather name="minus" color="#000" size={25}/>
                          </TouchableOpacity>
                          <Text style={{fontFamily: "Poppind-Regular", color: "#343434", fontSize: 20}}>{quantity}</Text>
                          <TouchableOpacity onPress={IncrementQunaityt}>
                             <Feather name="plus" color="#000" size={22}/>
                          </TouchableOpacity>
                      </View>
                  </View>
              </View>
        </View>
    </View>
  )
}

export default CartItem