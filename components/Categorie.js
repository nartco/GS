import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {
  getPlatformLanguage,
  getSelectedCountry,
  getSelectedService,
} from '../modules/GestionStorage';
import axiosInstance from '../axiosInstance';

const Categorie = ({
  Categories,
  styles,
  Language,
  SelectedCategorieId,
  setSelectedCategorieId,
}) => {
  return (
    <>
      {Categories.length > 0 ? (
        <View style={styles.subTabbarContainer}>
          <ScrollView
            scrollEnabled
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subTabbarScrollContainer}>
            {Categories.map(row => (
              <TouchableOpacity
                key={row.id}
                style={[
                  styles.imageTextContainer,
                  (row.name || row.nameEn).length >= 26
                    ? styles.widthBig
                    : styles.widthShort,
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
                <Text
                  style={[
                    styles.subtabarTextStyle,
                    SelectedCategorieId == row.id
                      ? {color: '#376AED'}
                      : {color: '#000'},
                    (row.name || row.nameEn).length >= 15
                      ? styles.marginTopShort
                      : styles.marginTopBig,
                    (row.name || row.nameEn).length >= 26
                      ? styles.widthTextBig
                      : styles.widthTextShort,
                  ]}>
                  {'fr' == Language ? row.name : row.nameEn}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : (
        <></>
      )}
    </>
  );
};

export default Categorie;
