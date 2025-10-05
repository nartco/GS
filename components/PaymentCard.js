import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Checkbox from 'expo-checkbox';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {
  CardField,
  StripeProvider,
  initStripe,
  useConfirmPayment,
  useStripe
} from '@stripe/stripe-react-native';
import {useTranslation} from 'react-i18next';
import {
  doPaymentWithSavedCard,
  fetchPaymentIntentClientSecret,
  getClientCards,
  retryPaymentWith3DS,
} from '../modules/GestionStripe';
import {
  getCartPrices,
  getCommand,
  getPanier,
  getSelectedCountry,
  getCommandDemandeAchat,
  getSelectedService,
  removePanier,
  getPlatformLanguage,
} from '../modules/GestionStorage';
import {
  buildCommande,
  buildGetCommande,
} from '../modules/GestionFinalisationPanier';
import {getImageType} from '../modules/TraitementImage';
import axiosInstance from '../axiosInstance';
import MasterCard from '../assets/images/masterCard.png';
import CartViolet from '../assets/images/card_violet.png';

import {useBag} from '../modules/BagContext';
import Toast from 'react-native-toast-message';
import {formatEuroPrice} from '../modules/DateFinanceUtils';
import auth from '@react-native-firebase/auth';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const PaymentCard = props => {
  let commandeId = props.commandId;

  const navigation = useNavigation();

  var isFocused = useIsFocused();

  const {confirmPayment} = useConfirmPayment();

  const { handleNextAction } = useStripe();

  const {t} = useTranslation();

  const [name, setName] = useState('');
  const [TotalPrice, setTotalPrice] = useState(0);
  const [Commande, setCommande] = useState({});
  const [CommandeDemandeAchat, setCommandeDemandeAchat] = useState({});

  const [enregistrerCarte, setEnregistrerCarte] = useState(false);
  const [LoadingPayment, setLoadingPayment] = useState(false);
  const [cardDetails, setCardDetails] = useState({});
  const [Cards, setCards] = useState([]);
  const [SelectedCard, setSelectedCard] = useState(null);
  const [SelectedCardCVC, setSelectedCardCVC] = useState('');
  const [isSelected, setIsSelected] = useState(false);
  const {setBagCount, bagCount} = useBag();
  const [paysLivraisonObject, setPaysLivraisonObject] = useState(null);
  const [Service, setService] = useState(null);
  const [Language, setLanguage] = useState('fr');
  const [buttonPressed, setButtonPressed] = useState(false);
  const [user, setUser] = useState(null);
  const [isCardComplete, setIsCardComplete] = useState(false);

  useEffect(() => {
    async function initialize() {
      await initStripe({
        publishableKey:
          'pk_test_51RsVAMR2Kjp3hJBYXfvX7KUXj1j5ZIVLQDW6RVfAf1gZagxOuSdj8PnHeu2XtOgYV12g71tTYgKvNbzGbUEfHdkr00DSNScUd3',
      });
    }
    initialize().catch(console.error);
  }, []);

  useEffect(() => {
    const user = auth().currentUser;
    setUser(user);
    async function fetchValue() {
      try {
        // Language
        const currentLanguage = await getPlatformLanguage();
        setLanguage(currentLanguage);

        // get prices
        const cartPrices = await getCartPrices();

        let paysLivraisonObject = await getSelectedCountry();
        setPaysLivraisonObject(paysLivraisonObject);

        let service = await getSelectedService();

        let price = cartPrices.finalPrice;
        price = price ? parseFloat(price) : 0;
        price = isNaN(price) ? 0 : price;

        setTotalPrice(price);

        // Fetch cards
        try {
          const userCards = await getClientCards(user.uid);

          setCards(userCards?.data);
        } catch (error) {
          console.log('Error:', error);
        }

        // avoir
        let AvoirValue = cartPrices.avoirValue;

        let avoir = AvoirValue ? AvoirValue : 0;

        // Remise total
        let remiseTotal = cartPrices.remiseTotal;
        remiseTotal = remiseTotal ? remiseTotal : 0;

        // Commande
        // let data = await buildCommande();
        let data = [];
        let basket = await getPanier();

        let BasketCommand = await getCommand();

        if (basket.length == 0) {
          data = await buildGetCommande();
        } else {
          data = await buildCommande();
        }
        console.log({data}, 'dataFinal', basket.length);

        data.commande.totalPaye = price;
        data.commande.modePaiement = 'Carte bancaire';
        data.commande.montantPayeParCarte = price;
        data.avoir = avoir;
        if (avoir) {
          data.commande.montantPayeEnAvoir = avoir;
        }

        if (remiseTotal) {
          data.commande.montantPayeEnRemise = remiseTotal;
        }

        setService(service);

        setCommande(data);

        let commandeDemandeAchat = await getCommandDemandeAchat();
        setCommandeDemandeAchat(commandeDemandeAchat);
      } catch (error) {
        console.log('error', error);
      }
    }

    fetchValue();

    return mounted => (mounted = false);
  }, [isFocused]);

  //validatePayment
  const validatePayment = async () => {
    const cartPrices = await getCartPrices();
    let commandeId;

    let avoirVal = cartPrices.avoirValue == null ? 0 : cartPrices.avoirValue;

    Commande.commande.totalPrice = cartPrices.finalPriceWithoutAvoirRemise;

    Commande.commande.totalPaye =
      parseFloat(avoirVal) + parseFloat(cartPrices.finalPrice);

    try {
      if (
        !SelectedCard &&
        (!cardDetails.complete || Object.keys(cardDetails).length === 0)
      ) {
        throw new Error(t('Les détails de la carte ne sont pas complets'));
      }

      // Préparer les données de la commande
      const formData = new FormData();
      Commande.commande.statut = 'Initialiser';
      formData.append('livraison', JSON.stringify(Commande.livraison));
      formData.append('depot', JSON.stringify(Commande.depot));
      formData.append('remise', JSON.stringify(Commande.remise));
      formData.append('avoir', Commande.avoir);
      formData.append('paysLivraison', paysLivraisonObject.id);
      formData.append('service', Service.id);
      formData.append('client', user.uid);
      formData.append('commande', JSON.stringify(Commande.commande));
      formData.append('products', JSON.stringify(Commande.products));
      formData.append('adresseFacturation', Commande.adresseFacturation);
      formData.append('statut', 'Initialiser');
      formData.append(
        'adresseFacturationType',
        Commande.adresseFacturationType,
      );
      formData.append('fraisDouane', Commande.fraisDouane);
      formData.append('facturationNom', Commande.facturationNom);

      let index = 0;
      Commande.productImages.forEach(productImage => {
        let productId = productImage.productId;
        let image = productImage.image;
        if (image) {
          formData.append('image_' + productId + '_' + index, {
            uri: image,
            type: getImageType(image),
            name: 'image_' + productId,
          });

          index++;
        }
      });

      // Créer la commande
      const response = await axiosInstance.post('/commandes/new', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      commandeId = response.data.id; // Assurez-vous que l'API renvoie l'ID de la commande

      // Procéder au paiement
      let paymentError = null;
      let paymentIntentStatus = null;
    

      if (SelectedCard) 
      {
        if (!SelectedCardCVC) {
          throw new Error(t('Le CVC est obligatoire'));
        }

        let paymentIntentResponse = null;

        setLoadingPayment(true);

        try 
        {
          paymentIntentResponse = await doPaymentWithSavedCard(user.uid, SelectedCard.id, TotalPrice);

          let paymentMessage = paymentIntentResponse.message;
          let paymentStatus = paymentIntentResponse.status;

          console.log('paymentIntentResponse', paymentIntentResponse)

          if (paymentStatus === 'requires_action') 
          {
            const res = await retryPaymentWith3DS({
              paymentIntentId: paymentIntentResponse.paymentIntentId,
              clientSecret: paymentIntentResponse.clientSecret,
              handleNextAction, // passé depuis useStripe()
            });

            console.log('res', res)

            if (res.ok) 
            {
              updateCommandeAndShowMessage(commandeId, 'Payée', 'Votre commande a été payée', cartPrices, 'reload');
            } 
            else 
            {
              if (Platform.OS === 'ios') {
                Toast.show({
                  type: 'error',
                  text1: t('Payment'),
                  text2: t(paymentMessage),
                });
              } else {
                ToastAndroid.show(t(paymentMessage), ToastAndroid.SHORT);
              }
              
              throw new Error(t('Erreur lors de la confirmation du paiement'));
            }
          }
          else if (
            paymentStatus == 'requires_payment_method' || 
            paymentStatus == 'canceled' ||
            paymentStatus == 'inconnu'
          )
          {
            if (Platform.OS === 'ios') {
              Toast.show({
                type: 'error',
                text1: t('Payment'),
                text2: t(paymentMessage),
              });
            } else {
              ToastAndroid.show(t(paymentMessage), ToastAndroid.SHORT);
            }
            
            throw new Error(t('Erreur lors de la confirmation du paiement'));
          }
          else 
          {
            updateCommandeAndShowMessage(commandeId, 'Payée', 'Votre commande a été payée', cartPrices, 'reload');
          }
        }
        catch(error)
        {
          console.log('SelectedCard error', error);

          let paymentErrorMessage = 'Erreur lors du paiement !';

          if (Platform.OS === 'ios') {
            Toast.show({
              type: 'error',
              text1: t('Payment'),
              text2: t(paymentErrorMessage),
            });
          } else {
            ToastAndroid.show(t(paymentErrorMessage), ToastAndroid.SHORT);
          }
          throw new Error(t('Erreur lors de la confirmation du paiement'));
        }
      } 
      else 
      {
        if (!cardDetails.complete) {
          throw new Error(t("La carte n'est pas valide !"));
        }
        const billingDetails = {uid: user.uid};
        setLoadingPayment(true);
        const clientSecret = await fetchPaymentIntentClientSecret(
          TotalPrice,
          user.uid,
          name.trim(),
          enregistrerCarte,
          user.phoneNumber,
        );
        console.log(clientSecret, 'clientSecret');

        const {paymentIntent, error} = await confirmPayment(
          clientSecret,
          {
            paymentMethodType: 'Card',
            paymentMethodData: {billingDetails},
          },
          enregistrerCarte ? {setupFutureUsage: 'OffSession'} : undefined,
        );

        console.log({
          'paymentIntent paymentIntent': paymentIntent,
          'error error': error
        })
        

        paymentError = error;
        paymentIntentStatus = paymentIntent;
        setLoadingPayment(false);

        if (paymentError) 
        {
          console.log('paymentError', paymentError);

          let paymentErrorMessage = 'Erreur lors du paiement !';

          if (paymentError.declineCode == 'generic_decline')
          {
            paymentErrorMessage = 'Refus de paiement !';
          }
          else if (paymentError.declineCode == 'insufficient_funds')
          {
            paymentErrorMessage = 'Refus de paiement pour cause de fonds insuffisants !';
          }
          else if (paymentError.declineCode == 'lost_card')
          {
            paymentErrorMessage = 'Refus de paiement pour cause de perte de carte !';
          }
          else if (paymentError.declineCode == 'stolen_card')
          {
            paymentErrorMessage = 'Refus de paiement pour cause de vol de carte !';
          }
          else if (paymentError.declineCode == 'card_velocity_exceeded')
          {
            paymentErrorMessage = 'Refus de paiement pour dépassement de la limite !';
          }

          // Si le paiement échoue, supprimer la commande
          try 
          {
            await axiosInstance.delete(`/commandes/delete/${commandeId}`);
          }
          catch (error)
          {
            console.error('deleteError',error);
          }
          
          if (Platform.OS === 'ios') {
            Toast.show({
              type: 'error',
              text1: t('Payment'),
              text2: t(paymentErrorMessage),
            });
          } else {
            ToastAndroid.show(t(paymentErrorMessage), ToastAndroid.SHORT);
          }
          throw new Error(t('Erreur lors de la confirmation du paiement'));
        }

        // Si le paiement est bien retourné, on vérifie son statut
        if (!paymentIntentStatus) {
          throw new Error(t('Erreur inattendue : aucune réponse de Stripe.'));
        }

        const statusStripe = paymentIntentStatus.status?.toLowerCase();

        setLoadingPayment(true);


        switch (statusStripe) 
        {
          case 'succeeded':
            console.log('Paiement réussi');

            updateCommandeAndShowMessage(commandeId, 'Payée', 'Votre commande a été payée', cartPrices, 'reload');
          break;

          case 'processing':
            updateCommandeAndShowMessage(commandeId, 'en attente de paiement', 'Votre commande est enregistrée. Nous sommes en attente de la confirmation de paiement par votre banque.', cartPrices, 'reload');
            
          break;

          case 'requires_payment_method':
          case 'requires_action':
          case 'canceled':
          default:
            console.log('other', paymentIntent);
            deleteCommandeAndShowErrorMessage(commandeId, 'Erreur lors du paiement !');
        }
      }

    } catch (error) {
      setLoadingPayment(false);
      setButtonPressed(false);
      if (commandeId) {
        try {
          await axiosInstance.delete(`/commandes/delete/${commandeId}`);
        } catch (deleteError) {
          console.error('deleteError',error.response);
          console.error(
            'Erreur lors de la suppression de la commande:',
            deleteError.response,
          );
        }
      }
      if (error.response.status === 400) {
        if (Platform.OS === 'ios') {
          Toast.show({
            type: 'error',
            text1: t('Payment'),
            text2: t('Commande non enregistrée pour problème de stock'),
          });
        } else {
          ToastAndroid.show(
            t('Commande non enregistrée pour problème de stock'),
            ToastAndroid.SHORT,
          );
        }
      } else {
        if (Platform.OS === 'ios') {
          Toast.show({
            type: 'error',
            text1: t('Payment'),
            text2: t('Erreur lors du paiement !'),
          });
        } else {
          ToastAndroid.show(t('Erreur lors du paiement !'), ToastAndroid.SHORT);
        }
      }
    }
  };

  async function deleteCommandeAndShowErrorMessage(commandeId, message) 
  {
    try 
    {
      setLoadingPayment(true);
      await axiosInstance.delete(`/commandes/delete/${commandeId}`);
    }
    catch(error)
    {
      console.error('commande update (requires_payment_method)',error);
    }

    setLoadingPayment(false);
    

    if (Platform.OS === 'ios') {
      Toast.show({
        type: 'error',
        text1: t('Payment'),
        text2: t(message),
      });
    } else {
      ToastAndroid.show(t(message), ToastAndroid.SHORT);
    }

    throw new Error(t('Erreur lors de la confirmation du paiement'));
  }

  async function updateCommandeAndShowMessage(commandeId, statut, message, cartPrices, fromPage) 
  {
    try 
    {
      await axiosInstance.put(`/commandes/update/${commandeId}`, {
        statut: statut,
        paymentMethod: 'Carte bancaire',
        paymentAmount: cartPrices.finalPrice.toString(),
      });

      setBagCount(0);
      removePanier();

      setLoadingPayment(false);

      Alert.alert(t('Succès'), t(message), [
        {
          text: 'OK',
          onPress: () => {
            navigation.replace('CommandeScreen', {pageForm: fromPage});
          },
        },
      ]);
    }
    catch (error)
    {
      console.error('commande update (succeeded)',error);

      setBagCount(0);
      removePanier();

      setLoadingPayment(false);

      if (Platform.OS === 'ios') {
        Toast.show({
          type: 'error',
          text1: t('Payment'),
          text2: t("Erreur lors de l'enregistrement de la commande. Veuillez indiquer le numéro de commande" +  " : "  + commandeId)
        });
      } else {
        ToastAndroid.show(t("Erreur lors de l'enregistrement de la commande. Veuillez indiquer le numéro de commande" + " : " + commandeId), ToastAndroid.SHORT);
      }
    }
  }

  const handleCardChange = details => {
    setCardDetails(details);
    setIsCardComplete(details.complete);
    // console.log('Card Details:', JSON.stringify(details, null, 2));
    // console.log('Is card complete?', details.complete);
  };

  const validatePaymentDemand = async () => {
    let responseError = null;
    let paymentIntendResponse = null;

    try {
      const cartPrices = await getCartPrices();
      
      if (SelectedCard) 
      {
        if (!SelectedCardCVC) {
          if (Platform.OS === 'ios') {
            Toast.show({
              type: 'error',
              text1: t('Payment'),
              text2: t('Le CVC est obligatoire !'),
            });
          } else {
            ToastAndroid.show(
              t('Le CVC est obligatoire !'),
              ToastAndroid.SHORT,
            );
          }
          return;
        }

        // TODO: verifier le CVC

        // Faire le paiement
        setLoadingPayment(true);


        try 
        {
          let paymentIntentResponse = null;
          
          paymentIntentResponse = await doPaymentWithSavedCard(user.uid, SelectedCard.id, TotalPrice);

          console.log('paymentIntentResponse1', paymentIntentResponse)

          let paymentMessage = paymentIntentResponse.message;
          let paymentStatus = paymentIntentResponse.status;

          if (paymentStatus === 'requires_action') 
          {
            const res = await retryPaymentWith3DS({
              paymentIntentId: paymentIntentResponse.paymentIntentId,
              clientSecret: paymentIntentResponse.clientSecret,
              handleNextAction, // passé depuis useStripe()
            });

            console.log('res', res)

            if (res.ok) 
            {
              updateCommandeAndShowMessage(commandeId, 'Payée', 'Votre commande a été payée', cartPrices, 'updated');

              return;
            } 
            else 
            {
              if (Platform.OS === 'ios') {
                Toast.show({
                  type: 'error',
                  text1: t('Payment'),
                  text2: t(paymentMessage),
                });
              } else {
                ToastAndroid.show(t(paymentMessage), ToastAndroid.SHORT);
              }
              
              throw new Error(t('Erreur lors de la confirmation du paiement'));
            }
          }
          else if (
            paymentStatus == 'requires_payment_method' || 
            paymentStatus == 'canceled' ||
            paymentStatus == 'inconnu'
          )
          {
            if (Platform.OS === 'ios') {
              Toast.show({
                type: 'error',
                text1: t('Payment'),
                text2: t(paymentMessage),
              });
            } else {
              ToastAndroid.show(t(paymentMessage), ToastAndroid.SHORT);
            }
            
            throw new Error(t('Erreur lors de la confirmation du paiement'));
          }
          else 
          {
            updateCommandeAndShowMessage(commandeId, 'Payée', 'Votre commande a été payée', cartPrices, 'updated');
          }
        }
        catch(error)
        {
          console.log('SelectedCard error', error);

          let paymentErrorMessage = 'Erreur lors du paiement !';

          if (Platform.OS === 'ios') {
            Toast.show({
              type: 'error',
              text1: t('Payment'),
              text2: t(paymentErrorMessage),
            });
          } else {
            ToastAndroid.show(t(paymentErrorMessage), ToastAndroid.SHORT);
          }
          throw new Error(t('Erreur lors de la confirmation du paiement'));
        }
      } 
      else 
      {
        if (!cardDetails.complete) {
          if (Platform.OS === 'ios') {
            Toast.show({
              type: 'error',
              text1: t('Payment'),
              text2: t("La carte n'est pas valide !"),
            });
          } else {
            ToastAndroid.show(
              t("La carte n'est pas valide !"),
              ToastAndroid.SHORT,
            );
          }

          return;
        }

        

        const billingDetails = {
          uid: user.uid,
        };

        setLoadingPayment(true);

        const nameTrim = name.trim();
        // Fetch the intent client secret from the backend.

        const clientSecret = await fetchPaymentIntentClientSecret(
          TotalPrice,
          user.uid,
          nameTrim,
          enregistrerCarte,
          user.phoneNumber,
        );
        // Confirm the payment with the card details

        

        if (enregistrerCarte) 
        {
          const {paymentIntent, error} = await confirmPayment(
            clientSecret,
            {
              paymentMethodType: 'Card',
              paymentMethodData: {
                billingDetails,
              },
            },
            {
              setupFutureUsage: 'OffSession',
            },
          );

          responseError = error;
          paymentIntendResponse = paymentIntent;
        } 
        else 
        {
          const {paymentIntent, error} = await confirmPayment(clientSecret, {
            paymentMethodType: 'Card',
            paymentMethodData: {
              billingDetails,
            },
          });

          responseError = error;
          paymentIntendResponse = paymentIntent;
        }

        if (responseError) 
        {
          console.log('responseError', responseError);

          let paymentErrorMessage = 'Erreur lors du paiement !';

          if (responseError.declineCode == 'generic_decline')
          {
            paymentErrorMessage = 'Refus de paiement !';
          }
          else if (responseError.declineCode == 'insufficient_funds')
          {
            paymentErrorMessage = 'Refus de paiement pour cause de fonds insuffisants !';
          }
          else if (responseError.declineCode == 'lost_card')
          {
            paymentErrorMessage = 'Refus de paiement pour cause de perte de carte !';
          }
          else if (responseError.declineCode == 'stolen_card')
          {
            paymentErrorMessage = 'Refus de paiement pour cause de vol de carte !';
          }
          else if (responseError.declineCode == 'card_velocity_exceeded')
          {
            paymentErrorMessage = 'Refus de paiement pour dépassement de la limite !';
          }

          if (Platform.OS === 'ios') {
            Toast.show({
              type: 'error',
              text1: t('Payment'),
              text2: t(paymentErrorMessage),
            });
          } else {
            ToastAndroid.show(
              t(paymentErrorMessage),
              ToastAndroid.SHORT,
            );
          }

          throw new Error(t('Erreur lors de la confirmation du paiement'));
        }

        // Si le paiement est bien retourné, on vérifie son statut
        if (!paymentIntendResponse) {
          throw new Error(t('Erreur inattendue : aucune réponse de Stripe.'));
        }

        const statusStripe = paymentIntendResponse.status?.toLowerCase();

        switch (statusStripe) 
        {
          case 'succeeded':
            setLoadingPayment(false);
            setButtonPressed(false);
            updateCommandeAndShowMessage(commandeId, 'Payée', 'Votre commande a été payée', cartPrices,  'updated');
          break;

          case 'processing':
            setButtonPressed(false)
            console.log(responseError);
            console.log('paymentIntendResponse', paymentIntendResponse);
            if (Platform.OS === 'ios') {
              Toast.show({
                type: 'error',
                text1: t('Payment'),
                text2: t('Votre commande est enregistrée. Nous sommes en attente de la confirmation de paiement par votre banque.'),
              });
            } else {
              ToastAndroid.show(
                t('Votre commande est enregistrée. Nous sommes en attente de la confirmation de paiement par votre banque.'),
                ToastAndroid.SHORT,
              );
            }
            setLoadingPayment(false);
          break;

          case 'requires_payment_method':
          case 'requires_action':
          case 'canceled':
          default:
            setButtonPressed(false);
            console.log(responseError);
            console.log('paymentIntendResponse', paymentIntendResponse);
            if (Platform.OS === 'ios') {
              Toast.show({
                type: 'error',
                text1: t('Payment'),
                text2: t('Erreur lors de la confirmation du paiement'),
              });
            } else {
              ToastAndroid.show(
                t('Erreur lors de la confirmation du paiement'),
                ToastAndroid.SHORT,
              );
            }
            setLoadingPayment(false);
        }
      }

    } catch (error) {
      setLoadingPayment(false);
      setButtonPressed(false);
      if (Platform.OS === 'ios') {
        Toast.show({
          type: 'error',
          text1: t('Payment'),
          text2: t('Erreur lors du paiement !'),
        });
      } else {
        ToastAndroid.show(t('Erreur lors du paiement !'), ToastAndroid.SHORT);
      }
    }
  };

  const handleToggle = async () => {
    setButtonPressed(true);
    setLoadingPayment(true);

    if (commandeId) {
      validatePaymentDemand();
    } else {
      validatePayment();
    }
  };

  if (!Cards) {
    return (
      <View style={{justifyContent: 'flex-start', flex: 1}}>
        {!SelectedCard && (
          <>
            <View
              style={[
                styles.PaymentInputsContainer,
                {marginTop: windowWidth * 0.12},
              ]}>
              <View style={{width: '100%'}}>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: 'Poppins-Medium',
                    color: '#000',
                    marginBottom: 5,
                  }}>
                  {t('Nom du titulaire')}
                </Text>

                <TextInput
                  value={name}
                  onChangeText={text => setName(text)}
                  placeholder="Samuel Witwicky"
                  placeholderTextColor="#626262"
                  style={{
                    borderWidth: 1,
                    width: '100%',
                    height: 54,
                    borderColor: '#AAB0B7',
                    paddingLeft: 20,
                    borderRadius: 8,
                    fontFamily: 'Poppins-Regular',
                    fontSize: 14,
                    color: '#000',
                    backgroundColor: '#fff',
                  }}
                />
              </View>

              <Text
                style={{
                  fontSize: 14,
                  fontFamily: 'Poppins-Medium',
                  color: '#000',
                  marginBottom: 5,
                  marginTop: 15,
                }}>
                {t('Numéro carte bancaire')}
              </Text>

              <CardField
                postalCodeEnabled={false}
                placeholder={{
                  number: '4242 4242 4242 4242',
                }}
                cardStyle={{
                  backgroundColor: '#FFFFFF',
                  textColor: '#000000',
                  borderColor: '#AAB0B7',
                  borderWidth: 1,
                  borderRadius: 8,
                }}
                style={{
                  width: '100%',
                  height: 54,
                  marginTop: 0,
                  marginBottom: 20,
                }}
                onCardChange={handleCardChange}
              />
              <View
                style={{
                  flexDirection: 'row-reverse',
                  alignItems: 'center',
                  gap: 5,
                }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: 'Poppins-Regular',
                    color: '#000',
                  }}>
                  {t('Enregistrer les détails de la carte')}
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    setIsSelected(!isSelected),
                      setEnregistrerCarte(!enregistrerCarte);
                  }}>
                  <View
                    style={{
                      width: wp(5.8),
                      height: hp(3),
                      borderColor: '#2BA6E9',
                      borderWidth: 2,
                      borderRadius: 7,
                      padding: 4,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: 'transparent',
                    }}>
                    {isSelected ? (
                      <View
                        style={{
                          backgroundColor: '#2BA6E9',
                          width: 12,
                          height: 12,
                          borderRadius: 3,
                        }}></View>
                    ) : null}
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            <View
              style={{
                marginTop: wp(12),
                width: windowWidth * 0.85,
                alignSelf: 'center',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: 'Poppins-Regular',
                    color: '#000',
                  }}>
                  {t('Montant à payer')}
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: 'Poppins-Bold',
                    color: '#262A2B',
                  }}>
                  {formatEuroPrice(TotalPrice.toFixed(2), Language)}
                </Text>
              </View>
            </View>
          </>
        )}

        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <TouchableOpacity
            style={[
              LoadingPayment
                ? {backgroundColor: '#6666'}
                : {backgroundColor: '#3292E0'},
              {
                marginTop: 10,
                paddingVertical: 12,
                paddingHorizontal: 32,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 25,
              },
            ]}
            onPress={handleToggle} // stripe Payment Button
            disabled={LoadingPayment || buttonPressed}>
            <Text
              style={{
                fontFamily: 'Poppins-Medium',
                fontSize: 12,
                color: '#fff',
              }}>
              {LoadingPayment ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                t('Payer maintenant')
              )}
            </Text>
          </TouchableOpacity>
        </View>

        {/* {LoadingPayment && <ActivityIndicator />} */}
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView>
      <View style={styles.container}>
        {Cards.length > 0 ? <></> : <Text style={{textAlign: 'center'}}></Text>}

        <ScrollView
          horizontal
          style={{paddingLeft: 10}}
          showsHorizontalScrollIndicator={false}>
          {Cards.map((item, index) => (
            <TouchableOpacity
              onPress={() => setSelectedCard(item)}
              style={{position: 'relative', marginRight: 22}}
              key={index}>
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
                    textTransform: 'capitalize',
                  }}>
                  {item.billing_details.name}
                </Text>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 16,
                    fontFamily: 'Poppins-Bold',
                  }}>
                  {formatEuroPrice(TotalPrice.toFixed(2), Language)}
                </Text>
              </View>

              <View style={{position: 'absolute', bottom: 18, left: 30}}>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 14,
                    fontFamily: 'Poppins-Medium',
                  }}>
                  **** **** **** {item.card.last4}
                </Text>
              </View>
              <View style={{position: 'absolute', top: 68, right: 40}}>
                <Image source={MasterCard} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {SelectedCard && (
          <View style={{paddingHorizontal: 25, marginTop: 25}}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: 'Poppins-Medium',
                color: '#000',
                marginBottom: 5,
              }}>
              CSV
            </Text>
            <TextInput
              placeholder={t('Saisir le CVC')}
              keyboardType="numeric"
              placeholderTextColor="#626262"
              style={{
                borderWidth: 1,
                width: '100%',
                borderColor: '#AAB0B7',
                height: windowWidth * 0.12,
                paddingLeft: 20,
                borderRadius: 8,
                fontFamily: 'Poppins-Regular',
                fontSize: 14,
                color: '#000',
                backgroundColor: '#fff',
              }}
              value={SelectedCardCVC}
              onChangeText={text => setSelectedCardCVC(text)}
            />
          </View>
        )}

        {!SelectedCard && (
          <>
            <View style={styles.PaymentInputsContainer}>
              <View style={{width: '100%'}}>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: 'Poppins-Medium',
                    color: '#000',
                    marginBottom: 5,
                  }}>
                  {t('Nom du titulaire')}
                </Text>

                <TextInput
                  value={name}
                  onChangeText={text => setName(text)}
                  placeholder="Samuel Witwicky"
                  placeholderTextColor="#626262"
                  style={{
                    borderWidth: 1,
                    width: '100%',
                    height: 54,
                    borderColor: '#AAB0B7',
                    paddingLeft: 20,
                    borderRadius: 8,
                    fontFamily: 'Poppins-Regular',
                    fontSize: 14,
                    color: '#000',
                    backgroundColor: '#fff',
                  }}
                />
              </View>

              <Text
                style={{
                  fontSize: 14,
                  fontFamily: 'Poppins-Medium',
                  color: '#000',
                  marginBottom: 5,
                  marginTop: 15,
                }}>
                {t('Numéro carte bancaire')}
              </Text>
              <CardField
                postalCodeEnabled={false}
                placeholder={{
                  number: '4242 4242 4242 4242',
                }}
                cardStyle={{
                  backgroundColor: '#FFFFFF',
                  placeholderColor: '#999999',
                  textColor: '#000000',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderColor: '#AAB0B7',
                  borderWidth: 1,
                  borderRadius: 8,
                }}
                style={{
                  width: '100%',
                  height: 54,
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 0,
                  marginBottom: 20,
                }}
                onCardChange={handleCardChange}
              />

              <View
                style={{
                  flexDirection: 'row-reverse',
                  alignItems: 'center',
                  gap: 5,
                }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: 'Poppins-Regular',
                    color: '#000',
                  }}>
                  {t('Enregistrer les détails de la carte')}
                </Text>
                {/* <Checkbox
                        value={enregistrerCarte}
                        onValueChange={value => console.log(value)}
                        style={{borderRadius: 5, padding: 5, borderColor: "#2BA6E9",}}
                      /> */}
                <TouchableOpacity
                  onPress={() => {
                    setIsSelected(!isSelected),
                      setEnregistrerCarte(!enregistrerCarte);
                  }}>
                  <View
                    style={{
                      width: wp(5.8),
                      height: hp(3),
                      borderColor: '#2BA6E9',
                      borderWidth: 2,
                      borderRadius: 7,
                      padding: 4,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: 'transparent',
                    }}>
                    {isSelected ? (
                      <View
                        style={{
                          backgroundColor: '#2BA6E9',
                          width: 12,
                          height: 12,
                          borderRadius: 3,
                        }}></View>
                    ) : null}
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            <View
              style={{
                marginTop: wp(12),
                width: windowWidth * 0.85,
                alignSelf: 'center',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: 'Poppins-Regular',
                    color: '#000',
                  }}>
                  {t('Montant à payer')}
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: 'Poppins-Bold',
                    color: '#262A2B',
                  }}>
                  {formatEuroPrice(TotalPrice.toFixed(2), Language)}
                </Text>
              </View>
            </View>
          </>
        )}

        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <TouchableOpacity
            style={[
              LoadingPayment
                ? {backgroundColor: '#6666'}
                : {backgroundColor: '#3292E0'},
              {
                marginTop: 10,
                paddingVertical: 12,
                paddingHorizontal: 32,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 25,
              },
            ]}
            onPress={handleToggle} // stripe Payment Button
            disabled={LoadingPayment || buttonPressed}>
            <Text
              style={{
                fontFamily: 'Poppins-Medium',
                fontSize: 12,
                color: '#fff',
              }}>
              {LoadingPayment ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                t('Payer maintenant')
              )}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 80,
  },
  PaymentInputsContainer: {
    // backgroundColor: 'tomato',
    height: windowHeight * 0.22,
    width: windowWidth * 0.93,
    alignSelf: 'center',
    marginHorizontal: 'auto',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: windowWidth * 0.2,
    paddingLeft: wp(4),
  },
  inputContainer: {
    // backgroundColor: 'green',
    borderBottomWidth: 1,
    borderBottomColor: '#E4EBF9',
  },
  inputStyle: {
    backgroundColor: '#fff',
    width: windowWidth * 0.6,
    color: '#000',
    fontFamily: 'Roboto-Regular',
  },
  typesCardContainer: {
    // backgroundColor: 'tomato',
    width: 245,
    height: 37,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: windowHeight * 0.05,
  },
  cardTypeImageStyle: {
    width: 245,
    height: 37,
    alignSelf: 'center',
  },
  btnContainer: {
    backgroundColor: '#3292E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: windowHeight * 0.2,
    width: windowWidth * 0.7,
    height: windowHeight * 0.07,
    borderRadius: 40,
  },
  btnText: {
    fontFamily: 'Roboto-Regular',
    color: '#fff',
  },
  headingText: {
    marginTop: 20,
    marginBottom: 20,
    color: '#000',
    fontFamily: 'Roboto-Regular',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  CardMainContainer: {
    flexDirection: 'row',
    width: '81%',
    alignSelf: 'center',
    marginTop: 15,
  },
  checkStyle: {
    position: 'absolute',
    bottom: 12,
    right: 20,
    zIndex: 1000,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5.16,
    elevation: 12,
  },
  CardField: {
    flexDirection: 'row',
    height: 30,
    width: '88%',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 4,
  },
  CardFieldImage: {
    width: '15%',
    height: 25,
    marginLeft: '2%',
  },
  CardFieldText: {
    fontSize: 10,
    color: '#34B3E8',
    marginLeft: '4%',
    marginTop: 7,
  },
  CardCircle: {
    marginLeft: '5%',
    marginTop: 3,
  },
  centeredView: {
    // backgroundColor:'red',
    width: '90%',
    height: '90%',
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  cross: {
    backgroundColor: 'red',
    marginRight: 20,
    marginTop: 10,
    marginLeft: 'auto',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
  image: {
    width: 50,
    height: 50,
  },
});
export default PaymentCard;
