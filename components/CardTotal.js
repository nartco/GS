import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import {calculProductPrices} from '../modules/CalculPrix';
import Button from './Button';
import Feather from 'react-native-vector-icons/Feather';

const CardTotal = ({
  t,
  handleChangeRemise,
  setRemiseCode,
  setCouponShow,
  navigateToDepotMethod,
  removeItem,
  data,
  RemiseCode,
  couponShow,
  Service,
  windowWidth,
  wp,
  RemiseValue,
  RemiseProduct,
  Language,
  PaysLivraison,
}) => {
  let prices = calculProductPrices(data, RemiseValue, RemiseProduct);
  // const {t, i18n} = useTranslation();

  let prixAchat = data[0].Price;
  let prixDemand = 0;

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const scrollViewRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        scrollToInput();
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const scrollToInput = () => {
    if (scrollViewRef.current && inputRef.current) {
       inputRef.current.measureLayout(scrollViewRef.current, (x, y) => {
        scrollViewRef.current.scrollTo({y: y, animated: true});
      });
    }
  };

  let validationManuelle = false;
  data.map(item => {
    prixDemand = parseFloat(prixDemand) + parseFloat(item.Price);
    if (item.product && item.product.validationManuelle) {
      validationManuelle = true;
    }
  });

  const [isDisable, setIsDisable] = useState(true);

  if (couponShow === false) {
    prices.remiseTotal = 0;
  }

  if (data.length < 1) {
    setRemiseCode('');
  }

  let subTotal = prices.totalPrix;
  let totalamount = subTotal;
  if (!validationManuelle) {
    subTotal = subTotal - prices.sommeFraisDouane;
    totalamount = prices.sommeFraisDouane + subTotal;
  }

  let total = totalamount - prices.remiseTotal;

  return (

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{flexGrow: 1}}
        keyboardShouldPersistTaps="handled">
        <View
          style={{
            marginTop: 25,
            justifyContent: 'center',
            alignItems: 'center',
            width: windowWidth * 0.9,
            alignSelf: 'center',
          }}>
          {'demandes-d-achat' != Service.code ? (
            <>
              <View style={{width: windowWidth * 0.85, alignSelf: 'center'}}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      color: '#000',
                      fontSize: wp(3.5),
                      fontFamily: 'Poppins-SemiBold',
                      letterSpacing: 0.3,
                    }}>
                    {t('Sous Total')}:
                  </Text>
                  <Text
                    style={{
                      color: '#000',
                      fontSize: wp(3.4),
                      fontFamily: 'Poppins-SemiBold',
                      letterSpacing: 0.3,
                    }}>
                    {('en' == Language ? '€ ' : '') +
                      subTotal.toFixed(2) +
                      ('fr' == Language ? ' €' : '')}
                  </Text>
                </View>
                {Service.code == 'ventes-privees' ? (
                  <></>
                ) : (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: wp(1),
                    }}>
                    <Text
                      style={{
                        color: '#000',
                        fontSize: wp(3.5),
                        fontFamily: 'Poppins-Medium',
                        letterSpacing: 0.3,
                      }}>
                      {t('fais douane')}:
                    </Text>
                    <Text
                      style={{
                        color: '#000',
                        fontSize: wp(3.4),
                        fontFamily: 'Poppins-Regular',
                        letterSpacing: 0.3,
                      }}>
                      {validationManuelle
                        ? t('à définir')
                        : 'ventes-privees' == Service.code
                        ? t('Offert')
                        : ('en' == Language ? '€ ' : '') +
                          prices.sommeFraisDouane.toFixed(2) +
                          ('fr' == Language ? ' €' : '')}
                    </Text>
                  </View>
                )}
                <View
                  style={{
                    flexDirection: 'row',
                    width: windowWidth * 0.88,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: wp(4.5),
                    backgroundColor: '#fff',
                    borderRadius: 15,
                  }}>
                  <TextInput
                    ref={inputRef}
                    placeholder={t('Saisir le code')}
                    placeholderTextColor="#666"
                    value={RemiseCode}
                    onChangeText={text => setRemiseCode(text)}
                    //  on
                    //  onEndEditing={(item) => handleChangeRemise(item.nativeEvent.text)}
                    style={{
                      padding: 0,
                      paddingLeft: 19,
                      color: '#000',
                      height: 45,
                    }}
                  />

                  <TouchableOpacity
                    disabled={couponShow ? isDisable : !isDisable}
                    onPress={() => {
                      handleChangeRemise(RemiseCode);
                      setCouponShow(!couponShow);
                    }}
                    style={[
                      couponShow
                        ? {backgroundColor: '#aaa'}
                        : {backgroundColor: '#4E8FDA'},
                      {
                        paddingVertical: 8,
                        height: 40,
                        paddingHorizontal: 22,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 25,
                      },
                    ]}>
                    <Text
                      style={{
                        fontFamily: 'Poppins-Medium',
                        fontSize: 12,
                        color: '#fff',
                      }}>
                      {t('Appliquer Remise')}
                    </Text>
                  </TouchableOpacity>
                  {/* <Button title={t('Appliquer remise')} navigation={() => {handleChangeRemise(RemiseCode); setCouponShow(!couponShow)}}/> */}
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: wp(4),
                  }}>
                  <Text
                    style={{
                      fontSize: wp(4.1),
                      fontFamily: 'Poppins-Regular',
                      color: '#000',
                      letterSpacing: 0.4,
                    }}>
                    {t('Montant total')} :
                  </Text>
                  <Text
                    style={{
                      fontSize: wp(3.8),
                      fontFamily: 'Poppins-Regular',
                      color: '#000',
                      letterSpacing: 0.3,
                    }}>
                    {('en' == Language ? '€ ' : '') +
                      totalamount.toFixed(2) +
                      ('fr' == Language ? ' €' : '')}
                  </Text>
                </View>
                <View
                  style={!couponShow ? {display: 'none'} : {display: 'flex'}}>
                  {RemiseCode == '' ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        marginTop: 13,
                        backgroundColor: '#fff',
                        borderRadius: 15,
                      }}>
                      <TouchableOpacity
                        onPress={() => removeItem(RemiseCode, data)}>
                        <Feather name="refresh-ccw" color="#E10303" size={15} />
                      </TouchableOpacity>

                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: 'Poppins-Regular',
                          color: '#E10303',
                          letterSpacing: 0.3,
                        }}>
                        coupon introuvable
                      </Text>
                    </View>
                  ) : (
                    <>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          marginTop: 13,
                          backgroundColor: '#fff',
                          borderRadius: 15,
                        }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 13,
                          }}>
                          <Text
                            style={{
                              fontSize: 12,
                              fontFamily: 'Poppins-Regular',
                              color: '#000',
                              letterSpacing: 0.3,
                            }}>
                            {RemiseCode}
                          </Text>

                          <TouchableOpacity
                            onPress={() => removeItem(RemiseCode, data)}>
                            <Feather name="trash-2" color="#E10303" size={15} />
                          </TouchableOpacity>
                        </View>

                        <Text
                          style={{
                            fontSize: 12,
                            fontFamily: 'Poppins-Regular',
                            color: '#01962A',
                            letterSpacing: 0.3,
                          }}>
                          {t('Remise appliquée')}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: 5,
                        }}>
                        <Text
                          style={{
                            fontSize: 12,
                            fontFamily: 'Poppins-Regular',
                            color: '#000',
                            letterSpacing: 0.4,
                          }}>
                          {t('Remise appliquée')}
                        </Text>

                        <Text
                          style={{
                            fontSize: 12,
                            fontFamily: 'Poppins-Regular',
                            color: '#000',
                            letterSpacing: 0.3,
                          }}>
                          -
                          {('en' == Language ? '€ ' : '') +
                            prices.remiseTotal +
                            ('fr' == Language ? ' €' : '')}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
                {Service.code == 'ventes-privees' &&
                !(
                  PaysLivraison &&
                  PaysLivraison.destination &&
                  PaysLivraison.destination.toLowerCase() === 'france'
                ) ? (
                  <>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: wp(1.5),
                      }}>
                      <Text
                        style={{
                          color: '#000',
                          fontSize: wp(3.5),
                          fontFamily: 'Poppins-Regular',
                          letterSpacing: 0.3,
                        }}>
                        {t('fais douane')}:
                      </Text>
                      <Text
                        style={{
                          color: '#000',
                          fontSize: wp(3.1),
                          fontFamily: 'Poppins-Regular',
                          letterSpacing: 0.3,
                        }}>
                        {t('Offert')}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: wp(1.5),
                      }}>
                      <Text
                        style={{
                          color: '#000',
                          fontSize: wp(3.5),
                          fontFamily: 'Poppins-Regular',
                          letterSpacing: 0.3,
                        }}>
                        {t('frais transit')}:
                      </Text>
                      <Text
                        style={{
                          color: '#000',
                          fontSize: wp(3.1),
                          fontFamily: 'Poppins-Regular',
                          letterSpacing: 0.3,
                        }}>
                        {t('Offert')}
                      </Text>
                    </View>
                  </>
                ) : (
                  <></>
                )}
              </View>
            </>
          ) : (
            <></>
          )}

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: wp(4),
              width: windowWidth * 0.85,
              alignSelf: 'center',
            }}>
            <Text
              style={{
                fontSize: wp(4.1),
                fontFamily: 'Poppins-Regular',
                color: '#000',
                letterSpacing: 0.4,
              }}>
              {t('Total')} :
            </Text>
            <Text
              style={{
                fontSize: wp(3.8),
                fontFamily: 'Poppins-Regular',
                color: '#000',
                letterSpacing: 0.3,
              }}>
              {('en' == Language ? '€ ' : '') +
                ('demandes-d-achat' != Service.code
                  ? total.toFixed(2)
                  : prixDemand
                  ? prixDemand.toFixed(2)
                  : '-') +
                ('fr' == Language ? ' €' : '')}
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: wp(5.6),
              marginBottom: windowWidth * 0.15,
            }}>
            <Button
              title={t('Valider')}
              navigation={() => navigateToDepotMethod()}
              width={wp(45)}
            />
          </View>
        </View>
      </ScrollView>

  );
};

export default CardTotal;
