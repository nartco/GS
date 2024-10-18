import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import DropDownPicker from 'react-native-dropdown-picker';
import Feather from 'react-native-vector-icons/Feather';
import {useIsFocused} from '@react-navigation/native';
import axiosInstance from '../../axiosInstance';
import {
  getSelectedService,
  saveSelectedCountry,
  getPlatformLanguage,
} from '../../modules/GestionStorage';
import styles from './styles';
import Flag from 'react-native-flags';
import {useTranslation} from 'react-i18next';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {HeaderActions} from '../../components/HeaderActions';

const PaysLivraison = ({navigation, route}) => {
  var isFocused = useIsFocused();
  const {t} = useTranslation();
  const [paysData, setPaysData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [current, setCurrent] = useState();
  const [isFocus, setIsFocus] = useState(false);
  const [value, setValue] = useState('');
  const [data, setData] = useState([]);
  const [ActivityIndicatorVar, setActivityIndicatorVar] = useState(false);
  const [service, setService] = useState([]);

  useEffect(() => {
    async function getData() {
      setActivityIndicatorVar(true);

      // Recuperer la langue

      // Recuperer le service selectionné
      let service = await getSelectedService();
      setService(service);

      if (!service) {
        navigation.navigate('HomeScreen');
        return;
      }

      try {
        const currentLanguage = await getPlatformLanguage();

        // Récuperer les pays actifs
        const response = await axiosInstance.get(
          '/pays/actif/' + service.id,
        );

        if (response.data) {
          let data = response.data;

          let formatted = [];
          data.forEach(function (item) {
            if (item.libelle) {
              let obj = {
                id: item.id,
                value: item.id,
                drapeauDepart: item.drapeauDepart,
                depart: item.depart,
                departEn: item.departEn,
                drapeauDestination: item.drapeauDestination,
                destinationEn: item.destinationEn,
              };
              obj.label = item.destination;
              obj.depart = item.depart;
              obj.destination = item.destination;
              obj.libelleDepart =
                'fr' == currentLanguage ? item.depart : item.departEn;
              obj.libelleDestination =
                'fr' == currentLanguage ? item.destination : item.destinationEn;

              formatted.push(obj);
            }
          });

          setData(formatted);
        }
      } catch (erreur) {
        console.log('country fetch error', erreur);
      }

      setActivityIndicatorVar(false);
    }

    getData();
  }, [isFocused]);

  async function navigateToReturnByServiceScreen() {
    var choice = data.filter(ls => {
      if (ls.id == value) {
        return ls;
      }
    });

    if (choice.length > 0) {
      await saveSelectedCountry(choice[0]);

      navigation.navigate('ShoppingScreen');
    }
  }

  const CustomStatuBar = ({backgroundColor, barStyle = 'light-content'}) => {
    const inset = useSafeAreaInsets();
    return (
      <View style={{height: inset.top, backgroundColor}}>
        <StatusBar
          animated={true}
          backgroundColor={backgroundColor}
          barStyle={barStyle}
        />
      </View>
    );
  };

  const renderItem = item => {
    if (!item.drapeauDepart && !item.drapeauDestination) {
      return (
        <View style={styles.item}>
          <Text style={styles.textItem}>{item.label}</Text>
        </View>
      );
    }

    if (!item.drapeauDestination) {
      return (
        <View style={styles.item}>
          <Flag size={24} code={item.drapeauDepart} type="flat" />
          <Text style={styles.textItem}>{item.label}</Text>
        </View>
      );
    }

    if (!item.drapeauDepart) {
      return (
        <View style={styles.item}>
          <Text style={styles.textItem}>{item.label}</Text>
          <Flag size={24} code={item.drapeauDestination} type="flat" />
        </View>
      );
    }

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          gap: 40,
        }}
        key={item.id}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
          <View>
            <Flag code={item.drapeauDepart} size={32} />
          </View>
          <Text
            style={{
              fontSize: 14,
              color: '#000',
              fontFamily: 'Roboto-Medium',
            }}>
            {item.depart}
          </Text>
          <Feather name="arrow-up-right" size={22} color="#000" />
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
          <View>
            <Flag code={item.drapeauDestination} size={32} />
          </View>
          <Text
            style={{
              fontSize: 14,
              color: '#000',
              fontFamily: 'Roboto-Medium',
            }}>
            {item.destination}
          </Text>
          <Feather name="arrow-down-right" size={22} color="#000" />
        </View>
      </View>
    );
  };

  if (ActivityIndicatorVar === true) {
    return (
      <View style={{justifyContent: 'center', height: '80%'}}>
        <ActivityIndicator size={'large'} color="#3292E0" />
      </View>
    );
  }

  let size = 32;
  return (
    <View>
      <HeaderActions navigation={() => navigation.goBack()} />

      <View style={{paddingHorizontal: 16, marginTop: 70}}>
        <Text
          style={{
            textAlign: 'center',
            color: '#0D253C',
            fontFamily: 'Roboto-Medium',
            fontSize: 16,
          }}>
          {t('pay livraison')}
        </Text>
      </View>

      <View style={styles.safeContainerStyle}>
        <DropDownPicker
          items={data.map(item => ({
            label: item.depart + ' ' + item.destination,
            value: item.id,
            icon: () => {
              return (
                <>
                  {service.code == 'ventes-privees' ||
                  service.code == 'demandes-d-achat' ? (
                    <View style={{}} key={item.id}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 7,
                        }}>
                        <View>
                          <Flag code={item.drapeauDestination} size={size} />
                        </View>
                        <Text
                          style={{
                            fontSize: wp(3.4),
                            color: '#000',
                            fontFamily: 'Roboto-Medium',
                          }}>
                          {item.libelleDestination}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    ''
                  )}
                  {service.code == 'fret-par-avion' ||
                  service.code == 'fret-par-bateau' ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: wp(4.5),
                      }}
                      key={item.id}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 7,
                        }}>
                        <View>
                          <Flag code={item.drapeauDepart} size={size} />
                        </View>
                        <Text
                          style={{
                            fontSize: wp(3.4),
                            color: '#000',
                            fontFamily: 'Roboto-Medium',
                          }}>
                          {item.libelleDepart}
                        </Text>
                        <Feather name="arrow-up-right" size={20} color="#000" />
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 7,
                        }}>
                        <View>
                          <Flag code={item.drapeauDestination} size={size} />
                        </View>
                        <Text
                          style={{
                            fontSize: wp(3.4),
                            color: '#000',
                            fontFamily: 'Roboto-Medium',
                          }}>
                          {item.libelleDestination}
                        </Text>
                        <Feather
                          name="arrow-down-right"
                          size={20}
                          color="#000"
                        />
                      </View>
                    </View>
                  ) : (
                    ''
                  )}
                </>
              );
            },
          }))}
          labelStyle={{display: 'none'}}
          listItemLabelStyle={{display: 'none'}}
          open={isOpen}
          setOpen={() => setIsOpen(!isOpen)}
          value={value}
          setValue={val => setValue(val)}
          dropDownContainerStyle={{
            backgroundColor: '#fff',
            borderColor: '#2BA6E9',
          }}
          style={{
            backgroundColor: '#fff',
            borderColor: '#2BA6E9',
          }}
          maxHeight={190}
          placeholder={t('pay livraison')}
          placeholderStyle={{
            color: '#86909C',
            fontFamily: 'Roboto-Regular',
            fontSize: 14,
          }}
          textStyle={{fontFamily: 'Roboto-Regular', fontSize: 14}}
          searchable={true}
          autoScroll
          searchContainerStyle={{borderBottomWidth: 0}}
          searchTextInputStyle={{borderColor: '#2BA6E9'}}
          searchPlaceholder={t('Recherche Pays...')}
          onSelectItem={item => {
            setValue(item.value);
          }}
        />
      </View>

      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 30,
          position: 'relative',
          zIndex: -1000,
        }}>
        <TouchableOpacity
          onPress={() => {
            navigateToReturnByServiceScreen();
          }}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 22,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#4E8FDA',
            borderRadius: 25,
          }}>
          <Text
            style={{fontFamily: 'Poppins-Medium', fontSize: 12, color: '#fff'}}>
            {t('valider')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PaysLivraison;
