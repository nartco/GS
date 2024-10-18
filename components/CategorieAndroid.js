import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native'
import React from 'react'
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const CategorieAndroid = ({Categories, Language, SelectedCategorieId, setSelectedCategorieId}) => {
  return (
    <>
    {
      Categories.length > 0 ? (
                    <View style={styles.subTabbarContainer}>
                      <ScrollView
                        scrollEnabled
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.subTabbarScrollContainer}> 
        
                        {Categories.map( (row) => (
                          <TouchableOpacity
                              key={row.id}
                              style={[
                                styles.imageTextContainer
                              ]}
                              activeOpacity={0.5}
                              onPress={() => {
                                setSelectedCategorieId(row.id);
                              }}>
                              <View>
                                <Image
                                  style={styles.iconStyler}
                                  source={{uri: row.image}}
                                  resizeMode="center"
                                />
                              </View>
                              <Text style={[styles.subtabarTextStyle, SelectedCategorieId == row.id ? {color: "#376AED"} : {color: "#000"}]}>
                                {'fr' == Language ? row.name : row.nameEn}
                              </Text>
                        </TouchableOpacity>
                        ))}
        
                      </ScrollView>
                    </View>
        ) : (<></>)
      }
    </>
  )
}

const styles = StyleSheet.create({
    subTabbarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        borderRadius: 5,
        marginTop: windowWidth * 0.01,
        alignSelf: 'center',
        // padding: 10,
        // marginBottom: 10,
      },
    subTabbarScrollContainer: {
    alignSelf: 'center',
    // backgroundColor: 'tomato',
    width: 'auto',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginLeft: 20,
    paddingRight: 20
    },
    iconStyler: {
        width: 20,
        height: 20,
        alignSelf: 'center',
        // backgroundColor: 'green',
      },
    imageTextContainer: {
        flexDirection: 'row',
        height: windowHeight * 0.065,
        alignItems: 'center',
        gap: 2,
        width: windowWidth * 0.25,    
        // margin: 5,
      },
    selectCountryTextStyle: {
        fontFamily: 'Roboto-Regular',
        fontSize: 12,
        color: '#fff',
        paddingLeft: windowWidth * 0.1,
        paddingTop: windowHeight * 0.01,
      },
      subtabarTextStyle: {
        fontFamily: 'Roboto-Regular',
        fontSize: windowWidth * 0.02,
        color: '#000',
        // backgroundColor: 'gold',
        width: windowWidth * 0.16,
        height: windowHeight * 0.045,
        textAlign: 'center',
        textAlignVertical: 'center',
      },
})
export default CategorieAndroid