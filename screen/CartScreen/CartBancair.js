import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ToastAndroid,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import React, {useState, useCallback} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {HeaderEarth} from '../../components/Header';
import CartViolet from '../../assets/images/card_violet.png';
import MasterCard from '../../assets/images/masterCard.png';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import Button from '../../components/Button';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {getAuthentificationData} from '../../modules/GestionStorage';
import {getClientCards, removeCard} from '../../modules/GestionStripe';
import {HeaderActions} from '../../components/HeaderActions';
import Toast from 'react-native-toast-message';
import auth from '@react-native-firebase/auth';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const CartBancair = props => {
  const navigation = useNavigation();
  let returnButt = props.route.params;
  returnButt = returnButt ? returnButt.newCard : false;
  const {t, i18n} = useTranslation();

  const [Cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState();

  const [ClientEmail, setClientEmail] = useState([]);
  let isCard = props.route.params;
  isCard = isCard ? isCard.newCard : false;

  useFocusEffect(
    useCallback(() => {
      const user = auth().currentUser;
      setUser(user);
      if (returnButt) {
        setLoading(true);
        if (user) {
          fetchCards();
        }
      } else {
        if (user) {
          fetchCards();
        }
      }
    }, [user]),
  );
  async function fetchCards() {
    try {
      setLoading(true);

      const userEmail = await getAuthentificationData();

      setClientEmail(userEmail);
      let userCards = await getClientCards(user.uid);

      if (userCards) {
        setCards(userCards.data);
      } else {
        setCards([]);
      }

      if (isCard) {
        setLoading(true);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  }

  function navigateToAddCard() {
    navigation.navigate('AddStripeUserCard');
  }

  function deleteCard(card) {
    return Alert.alert(
      t('Validation'),
      t(
        'La suppression est irreversible. Etes-vous sur de vouloir continuer ?',
      ),
      [
        {
          text: t('Annuler'),
          style: 'cancel',
        },
        {text: t('Oui'), onPress: () => removeStripeCard(card.id)},
      ],
    );
  }

  async function removeStripeCard(cardId) {
    try {
      await removeCard(user.uid, cardId);
      if (Platform.OS == 'ios') {
        Toast.show({
          type: 'success',
          text1: t('Success'),
          text2: t('La carte est supprimée avec succès'),
        });
      } else {
        ToastAndroid.show(
          t('La carte est supprimée avec succès'),
          ToastAndroid.SHORT,
        );
      }
      fetchCards();
    } catch (error) {
      console.log(error, 'error');
      if (Platform.OS == 'ios') {
        Toast.show({
          type: 'error',
          text1: t('Error'),
          text2: t('Erreur lors de la suppression de la carte !'),
        });
      } else {
        ToastAndroid.show(
          t('Erreur lors de la suppression de la carte !'),
          ToastAndroid.SHORT,
        );
      }
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

  function updateCard(card) {
    // show stripe to card input
  }

  if (true === loading) {
    return (
      <View style={{justifyContent: 'center', height: '80%'}}>
        <ActivityIndicator size={'large'} color="#3292E0" />
      </View>
    );
  }

  // if(!Cards){
  //   return(
  //     <View style={{flex: 1}}>
  //       <HeaderEarth />
  //       <View style={{marginTop: 27}}>
  //            <Text style={{fontSize: 16, fontFamily:'Poppins-SemiBold', color: '#000', textAlign: "center"}}>{t('Mes cartes enregistrées')}</Text>
  //        </View>
  //           <View style={{flex: 1 ,justifyContent: "center", alignItems:"center"}}>
  //             <Text>{t("il n'y a pas des cartes enregistrées")}</Text>
  //               <View style={{ marginTop: 22, justifyContent: "center", alignItems: 'center', marginBottom: 30}}>
  //                 <Button title={t("Ajouter une nouvelle carte")} navigation={() => navigation.navigate('AddCardScreen')}/>
  //             </View>
  //           </View>
  //     </View>
  //   )
  // }

  return (
    <View style={{flex: 1}}>
      <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
        <View style={{flex: 1, marginBottom: 50}}>
          <HeaderActions navigation={() => navigation.goBack()} />

          <View style={{marginTop: 27}}>
            <Text
              style={{
                fontSize: 16,
                fontFamily: 'Poppins-SemiBold',
                color: '#000',
                textAlign: 'center',
              }}>
              {t('Mes cartes enregistrées')}
            </Text>
          </View>

          {(!Cards || Cards?.length == 0) && (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: wp(50),
              }}>
              <Text>{t("il n'y a pas des cartes enregistrées")}</Text>
            </View>
          )}

          {Cards?.map((card, index) => (
            <View style={{paddingHorizontal: 55, marginTop: 30}} key={index}>
              <View style={{position: 'relative'}}>
                <Image
                  source={CartViolet}
                  style={{
                    width: wp(75),
                    height: hp(22),
                    objectFit: 'cover',
                    borderRadius: 25,
                  }}
                />
                <View style={{position: 'absolute', top: 38, left: 30}}>
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 12,
                      fontFamily: 'Poppins-Medium',
                    }}>
                    {card.card.brand}
                  </Text>
                </View>
                <View style={{position: 'absolute', top: 15, right: 15}}>
                  <View style={{alignItems: 'center', gap: 15}}>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('EditCardBank', card)}>
                      <MaterialCommunityIcons
                        name="pencil-outline"
                        size={22}
                        color="#fff"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        deleteCard(card);
                      }}>
                      <Feather name="trash-2" size={22} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={{position: 'absolute', bottom: 18, left: 30}}>
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 14,
                      fontFamily: 'Poppins-Medium',
                    }}>
                    **** **** **** {card.card.last4}
                  </Text>
                </View>
                <View style={{position: 'absolute', top: 68, right: 40}}>
                  <Image source={MasterCard} />
                </View>
              </View>
            </View>
          ))}

          <View
            style={{
              marginTop: 22,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 30,
            }}>
            <Button
              title={t('Ajouter une nouvelle carte')}
              navigation={() => navigation.navigate('AddStripeUserCard')}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default CartBancair;
