import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  ToastAndroid,
  Alert,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import Toast from 'react-native-toast-message';
import {useTranslation} from 'react-i18next';
import {useIsFocused, useNavigation} from '@react-navigation/native';
// import { useConfirmPayment } from '@stripe/stripe-react-native';
import {
  getCartPrices,
  removePanier,
  getCommandDemandeAchat,
  getSelectedService,
  getSelectedCountry,
  getPanier,
} from '../modules/GestionStorage';
import {
  buildCommande,
  buildGetCommande,
} from '../modules/GestionFinalisationPanier';
import {getImageType} from '../modules/TraitementImage';
import axiosInstance from '../axiosInstance';
import auth from '@react-native-firebase/auth';
import { useBag } from '../modules/BagContext';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const WavePaymen = props => {
  const {t} = useTranslation();
  var isFocused = useIsFocused();

  let commandeId = props.commandId;

  // const {confirmPayment} = useConfirmPayment();

  const [name, setName] = useState('');
  const [TotalPrice, setTotalPrice] = useState(0);
  const [Commande, setCommande] = useState({});
  const {setBagCount, bagCount} = useBag();

  const [enregistrerCarte, setEnregistrerCarte] = useState(false);
  const [LoadingPayment, setLoadingPayment] = useState(false);
  const [cardDetails, setCardDetails] = useState({});
  const [SelectedCard, setSelectedCard] = useState(null);
  const [SelectedCardCVC, setSelectedCardCVC] = useState('');
  const [PaymentFailed, setPaymentFailed] = useState(false);
  const [CommandeDemandeAchat, setCommandeDemandeAchat] = useState({});
  const [Service, setService] = useState(null);
  const [user, setUser] = useState(null);
  const [paysLivraisonObject, setPaysLivraisonObject] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    const user = auth().currentUser;
    setUser(user);
    async function fetchValue() {
      try {
        // get prices
        const cartPrices = await getCartPrices();

        let paysLivraisonObject = await getSelectedCountry();

        setPaysLivraisonObject(paysLivraisonObject);

        let price = cartPrices.finalPrice;
        price = price ? parseFloat(price) : 0;
        price = isNaN(price) ? 0 : price;

        setTotalPrice(price);

        // email

        // avoir
        let AvoirValue = cartPrices.avoirValue;

        let avoir = AvoirValue ? AvoirValue : 0;

        // Remise total
        let remiseTotal = cartPrices.remiseTotal;
        remiseTotal = remiseTotal ? remiseTotal : 0;

        let data = [];
        let basket = await getPanier();

        if (basket.length == 0) {
          data = await buildGetCommande();
        } else {
          data = await buildCommande();
        }

        data.commande.totalPaye = price;
        data.commande.modePaiement = 'Carte bancaire';
        data.commande.montantPayeParMobile = price;
        data.avoir = avoir;
        if (avoir) {
          data.commande.montantPayeEnAvoir = avoir;
        }

        if (remiseTotal) {
          data.commande.montantPayeEnRemise = remiseTotal;
        }

        setService(service);

        setCommande(data);

        let service = await getSelectedService();
        setService(service);

        let commandeDemandeAchat = await getCommandDemandeAchat();
        setCommandeDemandeAchat(commandeDemandeAchat);
      } catch (error) {
        console.log('error', error);
      }
    }

    fetchValue();

    return mounted => (mounted = false);
  }, [isFocused]);

  const checkWavePaymentStatus = sessionID => {
    return new Promise((resolve, reject) => {
      const timeout = 1 * 60 * 1000; // 1 minute en millisecondes
      const interval = 10000; // 10 secondes en millisecondes
      const startTime = new Date().getTime();

      const intervalId = setInterval(() => {
        // Appel API pour vérifier le statut du paiement avec axios
        axiosInstance
          .get(`/wave/events/sessions/${sessionID}`)
          .then(response => {
            const data = response.data;
            if (data.payment_status === 'succeeded') {
              resolve(true); // Retourner true si le paiement est validé
            }
          })
          .catch(error => {
            console.error('Erreur lors de la vérification du paiement:', error);
            reject(false); // Rejeter avec false en cas d'erreur
          });

        // Vérifier si le délai d'attente a expiré
        const currentTime = new Date().getTime();

        if (currentTime - startTime >= timeout) {
          clearInterval(intervalId);
          console.log('La vérification du paiement a expiré.');

          reject(false); // Retourner false si le paiement a expiré (timeout)
        }
      }, interval);
    });
  };

  const validatePaymentDemand = async () => {
    let responseError = null;

    console.log('xxx');
    try {
      setLoadingPayment(true);

      // Création de la session de paiement Wave
      const waveResponse = await createPaymentSession();
      if (waveResponse.error || !waveResponse.wave_launch_url) {
        throw new Error(t('Impossible de créer la session de paiement Wave'));
      }

      // Ouverture du lien de paiement Wave
      await Linking.openURL(waveResponse.wave_launch_url);

      // Vérification du statut du paiement
      const paymentConfirmed = await checkWavePaymentStatus(waveResponse.id);

      if (!paymentConfirmed) {
        throw new Error(t('Le paiement a échoué ou a expiré'));
      }

      setLoadingPayment(false);

      // Mise à jour du statut de la commande
      const cartPrices = await getCartPrices();
      const response = await axiosInstance.put(
        `/commandes/update/${commandeId}`,
        {
          statut: 'Payée',
          paymentMethod: 'Wave',
          paymentAmount: cartPrices.finalPrice.toString(),
        },
      );

      setBagCount(0);
      removePanier();

      Alert.alert(t('Succès'), t('Votre commande a été payée'), [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('CommandeScreen', {pageForm: 'updated'});
          },
        },
      ]);
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
      setLoadingPayment(false);

      let errorMessage = t('Erreur lors du paiement !');
      if (error.message) {
        errorMessage = error.message;
      }

      if (Platform.OS === 'ios') {
        Toast.show({
          type: 'error',
          text1: t('Payment'),
          text2: errorMessage,
        });
      } else {
        ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
      }
    }
  };

  //validatePayment
  const validatePayment = async () => {
    let commandeId;
    const cartPrices = await getCartPrices();

    let avoirVal = cartPrices.avoirValue == null ? 0 : cartPrices.avoirValue;

    Commande.commande.totalPrice = cartPrices.finalPriceWithoutAvoirRemise;

    Commande.commande.totalPaye =
      parseFloat(avoirVal) + parseFloat(cartPrices.finalPrice);

    try {
      // Créer la commande d'abord
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
      formData.append(
        'adresseFacturationType',
        Commande.adresseFacturationType,
      );
      formData.append('fraisDouane', Commande.fraisDouane);
      formData.append('facturationNom', Commande.facturationNom);

      console.log(formData, 'formData');

      Commande.productImages.forEach(productImage => {
        let productId = productImage.productId;
        let image = productImage.image;
        if (image) {
          formData.append('image_' + productId, {
            uri: image,
            type: getImageType(image),
            name: 'image_' + productId,
          });
        }
      });

      try {
        const response = await axiosInstance.post('/commandes/new', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log({response}, 'response');
        commandeId = response.data.id; // Assurez-vous que l'API renvoie l'ID de la commande
      } catch (error) {
        console.log(
          'Erreur lors de la création de la commande:',
          error.response,
        );
        Alert.alert(
          t('Erreur'),
          t('Erreur lors de la création de la commande'),
        );
        return;
      }

      // Procéder au paiement seulement si la commande a été créée avec succès
      let waveResponse = await openPaymentLink(); // Ouvre le lien de paiement dans le navigateur

      /**
       * Verifier le status du paiement
       * sur wave le token dure 30 min
       */
      try {
        const result = await checkWavePaymentStatus(waveResponse.id);

        if (!result) {
          Alert.alert(t('Erreur'), t('Le paiement a échoué'));

          // Si le paiement échoue, supprimer la commande
          try {
            await axiosInstance.delete(`/commandes/delete/${commandeId}`);
          } catch (error) {
            console.log('delete error', error);
          }

          return;
        }
      } catch (error) {
        console.log('Erreur lors de la vérification du paiement:', error);
        Alert.alert(t('Erreur'), t('Le paiement a échoué'));

        // Si le paiement échoue, supprimer la commande
        try {
          await axiosInstance.delete(`/commandes/delete/${commandeId}`);
        } catch (error) {
          console.log('delete error', error);
        }

        return;
      }

      // Si le paiement réussit, mettre à jour le statut de la commande
      try {
        await axiosInstance.put(`/commandes/update/${commandeId}`, {
          statut: 'Payée',
          paymentMethod: 'Wave',
          paymentAmount: cartPrices.finalPrice.toString(),
        });

        setBagCount(0);
        removePanier();

        Alert.alert(t('Succès'), t('Votre commande a été payée'), [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('CommandeScreen', {pageForm: 'updated'});
            },
          },
        ]);
      } catch (error) {
        console.log('Erreur lors de la mise à jour de la commande:', error);
        Alert.alert(
          t('Erreur'),
          t('Erreur lors de la sauvegarde de la commande !'),
        );
      }
    } catch (error) {
      console.log('Erreur globale:', error);
      if (commandeId) {
        try {
          await axiosInstance.delete(`/commandes/delete/${commandeId}`);
        } catch (deleteError) {
          console.log(
            'Erreur lors de la suppression de la commande:',
            deleteError,
          );
        }
      }
      Alert.alert(
        t('Erreur'),
        t('Une erreur est survenue lors du processus de paiement'),
      );
    }
  };

  async function createPaymentSession() {
    try {
      const priceString = TotalPrice.toString();
      const response = await axiosInstance.post(
        '/wave/create/payment_sessions',
        {
          amount: priceString,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      // Check if response.data exists before trying to access it
      if (response.data) {
        return response.data;
      } else {
        console.log('Unexpected response structure:', response);
        setPaymentFailed(true);
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.log(
        'Error in createPaymentSession:',
        error,
        error.response,
        JSON.stringify({amount: TotalPrice}),
      );
      setPaymentFailed(true);
      // Instead of re-throwing, return null or a specific error object
      return {error: true, message: error.message};
    }
  }

  async function openPaymentLink() {
    try {
      setLoadingPayment(true);
      console.log('Starting payment process');
      const result = await createPaymentSession();
      if (result.error || !result.wave_launch_url) {
        setLoadingPayment(false);
        setPaymentFailed(true);
        Alert.alert(
          t('Erreur'),
          t('Impossible de créer la session de paiement'),
        );
        return;
      }
      console.log('Payment session created:', result);
      await Linking.openURL(result.wave_launch_url);

      console.log('Waiting for payment confirmation');
      const timeoutInMilliseconds = Date.parse(result.when_expires);
      await waitForPaymentConfirmationWithTimeout(
        result.id,
        timeoutInMilliseconds,
      );
      console.log('Payment process completed');
      setLoadingPayment(false);

      return result;
    } catch (error) {
      console.log('Error in openPaymentLink:', error);
      setPaymentFailed(true);
      setLoadingPayment(false);
      Alert.alert(
        t('Erreur'),
        t('Une erreur est survenue lors du processus de paiement'),
      );
    }
  }

  // Fonction pour vérifier périodiquement l'état de la transaction avec une limite de temps
  async function waitForPaymentConfirmationWithTimeout(
    paymentSessionId,
    timeoutInMilliseconds,
  ) {
    try {
      const pollingInterval = 5000; // Intervalle de vérification en millisecondes (20 secondes ici)
      const startTime = Date.now();

      setLoadingPayment(true);

      while (true) {
        const currentTime = Date.now();
        if (currentTime - startTime > timeoutInMilliseconds) {
          setLoadingPayment(false);
          setPaymentFailed(true);

          break;
        }

        if (!paymentSessionId) {
          await new Promise(resolve => setTimeout(resolve, pollingInterval));
        }
        const response = await axiosInstance.get(
          `/wave/events/${paymentSessionId}`,
        );

        if (response.status === 200) {
          const data = await response.json();

          const statutPaiement = data.paymentStatus; // Exemple : 'confirmed' ou 'failed'

          if (statutPaiement === 'succeeded') {
            setPaymentFailed(false);

            break;
          } else {
            // Attendez l'intervalle de temps spécifié avant la prochaine vérification.
            await new Promise(resolve => setTimeout(resolve, pollingInterval));
          }
        } else {
          // Gérez l'erreur, par exemple, en affichant un message d'erreur à l'utilisateur.
          setPaymentFailed(true);
          break;
        }
      }

      setLoadingPayment(false);
    } catch (error) {
      setLoadingPayment(false);
      setPaymentFailed(true);
    }
  }

  const handleToggle = async () => {
    setLoadingPayment(true);
    if (commandeId) {
      validatePaymentDemand();
    } else {
      validatePayment();
    }
  };

  return (
    <View style={{flex: 1}}>
      <Text
        style={{
          fontFamily: 'Poppins-Medium',
          fontSize: 18,
          color: '#000',
          textAlign: 'center',
        }}>
        {t('Montant à payer')}: € {TotalPrice}
      </Text>

      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <TouchableOpacity
          style={{
            marginTop: 10,
            backgroundColor: '#3292E0',
            paddingVertical: 12,
            paddingHorizontal: 32,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#4E8FDA',
            borderRadius: 25,
          }}
          onPress={handleToggle} // stripe Payment Button
          disabled={LoadingPayment}>
          <Text
            style={{fontFamily: 'Poppins-Medium', fontSize: 12, color: '#fff'}}>
            {t('Valider le paiement')} (Wave)
          </Text>
        </TouchableOpacity>
      </View>

      {LoadingPayment && <ActivityIndicator />}
    </View>
  );
};

export default WavePaymen;
