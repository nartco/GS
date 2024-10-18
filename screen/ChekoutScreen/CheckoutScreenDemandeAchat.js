import { View, Text, Image, TextInput, TouchableOpacity,ScrollView, ActivityIndicator, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import Feather from "react-native-vector-icons/Feather"
import Entypo from "react-native-vector-icons/Entypo"
import { widthPercentageToDP as wp} from 'react-native-responsive-screen'
import Stepper from '../Stepper'
import { ButtonPrix } from '../../components/Button'
import { useIsFocused } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import {  getLivraisonValues, getPlatformLanguage, getRemiseUsed, getSelectedCountry, getCartPrices, getCommandProductsDemandeAchat, getCommandDemandeAchat, getSelectedService, getServices, saveAdresseIdFacturation, saveCartAvoir, savePrixFinalPanier, saveSelectedCountry, saveSelectedService } from '../../modules/GestionStorage'
import axiosInstance from '../../axiosInstance'
import { calculFraisLivraisonCommand, calculProductPricesCommand, calculCommandeDemandeAchatPrices } from '../../modules/CalculPrix'
import { Dropdown } from 'react-native-element-dropdown'
import Icon from 'react-native-vector-icons/Feather';
import ServiceHeader from '../../components/ServiceHeader'
import styles from './styles'
import Checkbox from 'expo-checkbox'
import { buildGetCommande } from '../../modules/GestionFinalisationPanier'
import { useBag } from '../../modules/BagContext'
import DropDownPicker from 'react-native-dropdown-picker'
import auth from '@react-native-firebase/auth';


const CheckoutScreenDemandeAchat = (props) => {
  var isFocused = useIsFocused();
  const { setBagCount, bagCount } = useBag();

  const {t, i18n} = useTranslation();
  const [Loader,setLoader] = useState(false);
  const [Avoirs, setAvoirs] = useState([]);
  const [AvoirValue, setAvoirValue] = useState(0);
  const [RemiseValue, setRemiseValue] = useState(0);
  const [RemiseProduct, setRemiseProduct] = useState(null);
  const [cartProducts, setCartProducts] = useState([]);
  const [isFocusAvoir, setIsFocusAvoir] = useState(false);
  const [AvoirChoice, setAvoirChoice] = useState(false);
  const [Service, setService] = useState(null);
  const [paysLivraisonObject, setPaysLivraisonObject] = useState(null);
  const [cartLivraisonPrice, setCartLivraisonPrice] = useState(0);
  const [sommeFraisDouane, setSommeFraisDouane] = useState(0);
  const [SommeFraisExpedition, setSommeFraisExpedition] = useState(0);
  const [SommeFraisCommission, setSommeFraisCommission] = useState(0);
  const [SommeFraiCommissionPourcentage, setSommeFraiCommissionPourcentage] = useState(0);
  const [LivraisonTotalPrixAvecDouaneRemiseAvoir, setLivraisonTotalPrixAvecDouaneRemiseAvoir] = useState(0);
  const [modeLivraison, setModeLivraison] = useState(null);

  const [CartTotalPriceSansRemiseAvoir, setCartTotalPriceSansRemiseAvoir] = useState(0);
  const [Language, setLanguage] = useState('fr');
  const [LivraisonData, setLivraisonData] = useState({});
  const [DepotData, setDepotData] = useState({});
  const [AdresseFacturationDifferente, setAdresseFacturationDifferente] = useState(false);
  const [Adresses, setAdresses] = useState([]);
  const [AdresseFacturationId, setAdresseFacturationId] = useState('');
  const [NomFacturation, setNomFacturation] = useState('');
  const [TVA, setTVA] = useState(0);
  const [LoadingPayment, setLoadingPayment] = useState(false);
  const [prixTotalLivraison, setPrixTotalLivraison] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isValue, setIsValue] = useState("")
  const [paysCommand, setPayCommand] = useState([])
  const [CommandBasket, setCommandBasket] = useState([])
  const [ServiceCommand, setServiceCommand] = useState([])
  const [CartCommand, setCartCommand] = useState([]);
  const [CommandList, setCommandeList] = useState([]);
  const [PrixAmount, setPrixAmount] = useState(0)
  const [CommandeDemandeAchat, setCommandeDemandeAchat] = useState(null)
  const user = auth().currentUser
  

  useEffect(() => { 

    // Pour eviter un probleme de memoire, il faut ajouter un cleanup
    let mounted = true;
 
    setLoader(true);

    async function fetchValue() {
      try {
        saveCartAvoir(0)

    

              // Language
      const currentLanguage = await getPlatformLanguage();
      setLanguage(currentLanguage);

      
        try 
        {
          const response = await axiosInstance.get('adresses/user/' + user.uid );

          let formatted = response.data.map(ls=>{
            return {id:ls.id, label:(ls.adresse + ' ' + ls.codePostal + ' ' + ls.ville + ' ' + ls.pays), value:ls.id, codePostal: ls.codePostal, ville: ls.ville, nom: ls.nom, telephone: ls.telephone}
          })

          setAdresses(formatted);

          setLoader(false);
        }
        catch (erreur)
        {
          console.log('adresse fetch error', erreur);
        }

        // commande
        let commande = await getCommandDemandeAchat();
        setCommandeDemandeAchat(commande);

        // Prix de livraison
        let livraisonValues = await getLivraisonValues();
        
        setLivraisonData(livraisonValues);

        let livraisonPrice = livraisonValues.prixTotalLivraison;
        setCartLivraisonPrice(livraisonPrice ? livraisonPrice : 0);


        let livraisonMode = livraisonValues.modeLivraison;
        setModeLivraison(livraisonMode);

        let fraisDouane = livraisonValues.sommeFraisDouane;
        setSommeFraisDouane(fraisDouane);

        let fraisExpedition = livraisonValues.fraisExpedition;
        setSommeFraisExpedition(fraisExpedition);

        let fraisCommission = livraisonValues.fraisCommission;
        setSommeFraisCommission(fraisCommission);

        let fraisCommissionPourcentage = livraisonValues.fraisCommissionPourcentage;
        setSommeFraiCommissionPourcentage(fraisCommissionPourcentage);


        let livraisonTotalPrixAvecDouaneRemiseAvoir = livraisonValues.livraisonTotalPrixAvecDouaneRemiseAvoir;
        setLivraisonTotalPrixAvecDouaneRemiseAvoir(livraisonTotalPrixAvecDouaneRemiseAvoir);

        

        let cartPrices = await getCartPrices();

        let sommeTva = parseFloat(cartPrices.tvaTotal);
        sommeTva = isNaN(sommeTva) ? 0 : sommeTva;

        sommeTva = sommeTva.toFixed(2);
        setTVA(sommeTva);

        
        // Pays de livraison
        let paysLivraisonObject = await getSelectedCountry();
        setPaysLivraisonObject(paysLivraisonObject);


         // Get service
        let service = await getSelectedService();

   
        // Get avoir
        axiosInstance.get('/avoirs/active/all/' + user.uid  ).then((response) => {
          if (response.data)
          {
            let data = response.data;

            let somme = 0;
            data.map( function (value) {
              somme = somme + parseFloat(value.montant) - parseFloat(value.montantConsomme ? value.montantConsomme : 0);
            });

            if (somme > 0)
            {
              let formatted = [{
                label: somme.toString(), value: somme
              }];

              setAvoirs(formatted);
            }
          }

          // console.log("Avoir:",Avoirs);
        })
        .catch(function (error) {
          console.log('error', error)
        });


        // Remise
        let remiseUsed = await getRemiseUsed();

        setRemiseValue(remiseUsed.remiseValue);
        setRemiseProduct(remiseUsed.remiseProduct);
        // Recuperer les Product de Comand
  
        let basketCommnd = await getCommandProductsDemandeAchat();
        let Biulding = await buildGetCommande('demandes-d-achat');

        setCommandeList(Biulding);


        // console.log('Pay Livraison :', paysCommand, "Service :", ServiceCommand)
        let Data = [];
        
        if(basketCommnd.length > 0){
          // console.log("Basket of Command :", basketCommnd[0].paysLivraison);
          basketCommnd.forEach((item) => {
            setCartCommand(item.product)
          })

          const response = await axiosInstance.get('/pays/' + basketCommnd[0].paysLivraison )
    
            Data = response.data;
  
          setServiceCommand(Data.service)
          setPayCommand(Data)
          setCommandBasket(basketCommnd)

          await saveSelectedService(ServiceCommand)
          await saveSelectedCountry(paysCommand)
        }
        


        // Panier
        let cartService = Data.service;

        if (cartService.code != service.code)
        {
          let services = await getServices();
  
          var newData = services.filter(ls => {
            if (ls.code == cartService.code) {
              return ls;
            }
          });
  
          service = newData[0];
  
          saveSelectedService(newData[0]);
        } 
          // prendre tjr le pays de livraison du panier
          let cartPaysLivraison = Data;
          if (paysLivraisonObject.id != cartPaysLivraison.id)
          {
            paysLivraisonObject = cartPaysLivraison;
  
            setPaysLivraisonObject(paysLivraisonObject);
  
            await saveSelectedCountry(paysLivraisonObject);
          }


        
        
         let prixLivraison = calculFraisLivraisonCommand(basketCommnd);
        


        setPrixTotalLivraison(prixLivraison);

        setService(service);

      
        setLoader(false)
 
      } catch (error) {
        console.log('error', error)
      }
    }

    fetchValue();

    return (mounted) => mounted = false;

  }, [isFocused]);


  // Paiement
  async function NavigateToPayment(totalPrice, remiseTotal){

    await savePrixFinalPanier(totalPrice, CartTotalPriceSansRemiseAvoir, remiseTotal, TVA);

    let adresseFacturation = AdresseFacturationId;
    let type = 'user_adresse';

    if (!adresseFacturation)
    {
      adresseFacturation = 'relais' == LivraisonData.livraisonMode ? LivraisonData.livraisonRelaisId : LivraisonData.livraisonAdresseId;

      type = 'relais' == LivraisonData.livraisonMode  ? 'livraison' : 'user_adresse';

      setAdresseFacturationId(adresseFacturation);
    }

    await saveAdresseIdFacturation(adresseFacturation, NomFacturation, type);


    props.navigation.navigate("AddCardScreen", {pageFrom: "CheckoutScreenDemandeAchat"});
  };
 
  const NavigateToUserAddress = () => {
  props.navigation.navigate("AddAdresseScreen", {pageFrom: 'summary'});
  }


  // Afficher les attributs
  const RenderAttribute = props => {

    const product = props.product;

    const attributeValues = product.attributes ? Object.values(product.attributes) : [];

      return (
  
        <View>
        <Text style={styles.WeightCalSubText}>
          { attributeValues.join(', ') }
        </Text>
        {
            <>
              <Text style={{marginBottom: 5}}>{t('URL')}: { product.url.length > 30 ? product.url.substring(0, 30 - 3) + '...' : product.url }</Text>
              <Text>{t('Infos complementaires')}: { product.informationsComplementaires }</Text>
            </>

          
        }
        
        </View>
      );
  }

    // Afficher les attributs
    const RenderAttributeCommand = props => {
  
      const product = props.product;
  
      const attributeValues = product.attributs ? Object.values(product.attributs) : [];
        
        console.log(product.attributes);
        return (
          <View>
          <Text style={styles.WeightCalSubText}>
            { attributeValues.join(', ') }
          </Text>
          {
              <>
                <Text style={{marginBottom: 5}}>{t('URL')}: { 
                  product.url == null
                  ?
                  <></>
                  :
                  product.url.length > 30 ? product.url.substring(0, 30 - 3) + '...' : product.url
                  }</Text>
                {/* {
                  product.attributes == null
                  ?
                  <></>
                  :
                  <Text style={{marginBottom: 5}}>{product.attributes.name}: { product.url }</Text>
                } */}
                <Text style={{maxWidth: 250}}>{t('Infos complementaires')}: { product.informationsComplementaires }</Text>
              </>
            
          }
          
          </View>
        );
    }
   
 


  // Afficher les produits
  const RenderItem = ({item}) => {

    let prix = isNaN(parseFloat(item.Price)) ? 0 : parseFloat(item.Price)
    

    return (
        <View style={{backgroundColor: "#fff", paddingLeft: 28 ,paddingVertical: 12, marginBottom: 16, borderRadius: 18}}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 20}}>
            {/* First Row */}
            <View style={{position: "relative"}}>
            <View>
                {
                      
                      <View>
                    {
                          item.image !== '' 
                          ? 
                          (
                          <Image
                            source={{uri: item.image}}
                            resizeMode="contain"
                            style={{width: wp(18), height: wp(28),}}
                          /> ) 
                          : 
                          <>
                            <View style={{width: wp(10), height: wp(28),}}></View>
                          </>
                        }
  
                      </View>
                    }
                  </View>
            </View>
            
            {/* second Row */}
            <View style={styles.secondRow}>
              <View>
                <Text style={{fontSize: 14, fontFamily: "Poppins-Regular", color: "#000", maxWidth: 190}}>
                  {'fr' == Language ? item.product.name : item.product.nameEN}
                </Text>
                 
                <>
                     
                     
                     <View style={{flexDirection: "column", alignItems: "flex-start", gap: 10}}>
                           <RenderAttribute service={Service} product={item} />
                           <ButtonPrix title={prix} language={Language} />
                     </View>
                     
                    
                  </>
               
              </View>
              
            </View>
            
          </View>
        </View>
    );
  };

  // Afficher les produits
  const RenderItemCommand = ({item}) => {

 


    let prix = 0;

    let stock = [];
    stock.push(item.product.stocks)


    prix = item.prixAchat ? parseFloat(item.prixAchat) : 0;
  

    return (
        <View style={{backgroundColor: "#fff", paddingLeft: 28 ,paddingVertical: 12, marginBottom: 16, borderRadius: 18}}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 20}}>
            {/* First Row */}
            <View style={{position: "relative"}}>
                <View>
                <>
              {
                  item.photo != null
                  ?
                  (
                      <Image
                        source={{uri: item.photo}}
                        resizeMode="contain"
                        style={{width: wp(18), height: wp(28),}}
                      /> ) 
                      :
                      <View style={{width: wp(10), height: wp(28),}}></View>
              }
              </>
                  </View>
            </View>
            
            {/* second Row */}
            <View style={styles.secondRow}>
              <View>
                <Text style={{fontSize: 14, fontFamily: "Poppins-Regular", color: "#000", maxWidth: 190}}>
                  {'fr' == Language ? item.product.name : item.product.nameEN}
                </Text>
                 
                 
                   <View style={{flexDirection: "column", alignItems: "flex-start", gap: 10}}>
                   <RenderAttributeCommand service={Service} product={item} />
                   <ButtonPrix title={prix} language={Language}/>
             </View>
                 
               
              </View>
              
            </View>
            
          </View>
        </View>
    );
  };

  

  // Afficher le total
  const RenderTotal = ({data}) => {


    let prices = calculProductPricesCommand(data, RemiseValue, RemiseProduct);

    let valuesDemandeAchat = calculCommandeDemandeAchatPrices(CommandeDemandeAchat);

    let resteApayer = 0;
    let resteAvoir = 0;
    let apreRemise = 0;

   
    prices.sommeFraisDouane = valuesDemandeAchat.fraisDouane;
    prices.totalPrix = valuesDemandeAchat.prix;
    prices.totalPrixAvecDouaneRemiseAvoir = valuesDemandeAchat.prixTotal;
    prices.remiseTotal = valuesDemandeAchat.remise;
    prices.prixQuantite = valuesDemandeAchat.prix;
    prices.fraisExpedition = valuesDemandeAchat.fraisExpedition;
    prices.fraisCommission = valuesDemandeAchat.fraisCommission;
    prices.prixTotalSansRemise = valuesDemandeAchat.prixTotalSansRemise;
    prices.prixTotal = valuesDemandeAchat.prixTotal;
    prices.fraisLivraison = valuesDemandeAchat.fraisLivraison;

    TotalWithLivraison = valuesDemandeAchat.prixTotal;

    setPrixTotalLivraison(valuesDemandeAchat.fraisLivraison);

    remiseTotal = valuesDemandeAchat.remise;

    subTotal = valuesDemandeAchat.prix;


    apreRemise = subTotal - remiseTotal;
    apreRemise = apreRemise.toFixed(2);

    setSommeFraisDouane(prices.sommeFraisDouane)

    
    if (AvoirValue > TotalWithLivraison)
    {
      resteAvoir = AvoirValue - TotalWithLivraison;
      resteAvoir = resteAvoir.toFixed(2);
    }
    else 
    {
      resteApayer = TotalWithLivraison - AvoirValue;
    }

    montantApayer = prices.prixTotal;

    resteApayer = montantApayer;

    if (AvoirValue)
    {
      // saveCartAvoir(AvoirValue);
      resteApayer = (resteApayer - AvoirValue).toFixed(2)
    }

    return (
      
      <View>
        <View style={{marginTop: 13, paddingHorizontal: 12}}>
                    {
                        <View style={{backgroundColor: "#fff", paddingTop: 22, paddingHorizontal: 13, paddingBottom: 30,borderRadius: 8}}>
                        <>
                      <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 15, borderBottomWidth: 1, borderColor: "#E9E9E9"}}>
                          <Text style={{fontFamily: "Poppins-Regular", fontSize: 12, color: "#000", letterSpacing: .8}}>
                          {t('Sous Total')}
                          </Text>
                          <Text style={{fontFamily: "Poppins-Medium", fontSize: 14, color: "#262A2B", letterSpacing: .8}}>
                          { subTotal.toFixed(2) } €
                          </Text>
                       </View>
                        <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 15, paddingTop: 19,borderBottomWidth: 1, borderColor: "#E9E9E9"}}>
                              <Text style={{fontFamily: "Poppins-Regular", fontSize: 12, color: "#ACB2B2", letterSpacing: .8}}>
                              {t('Montant remise')}
                              </Text>
                              <Text style={{fontFamily: "Poppins-Medium", fontSize: 14, color: "#262A2B", letterSpacing: .8}}>
                                { remiseTotal == 0.00 ? '"-"' : "-" + remiseTotal +"€" }
                              </Text>
                        </View>
                        {'domicile' == modeLivraison ?
                            (
                              <View style={styles.secondContainer}>
                                <View style={styles.totalContainer}>
                                  <Text style={styles.totalText}>{t('Prix de livraison')}</Text>
                                  <Text style={styles.totalText}>{cartLivraisonPrice > 0 ? (cartLivraisonPrice + '€') : t('Offert')}</Text>

                                  
                                </View>
                              </View>
                            )
                            :
                            <></>
                          }
                          <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 15, paddingTop: 19,borderBottomWidth: 1, borderColor: "#E9E9E9"}}>
                                <Text style={{fontFamily: "Poppins-Regular", fontSize: 12, color: "#000", letterSpacing: .8}}>
                                {t('Sous-Total aprés remise')}
                                </Text>
                                <Text style={{fontFamily: "Poppins-Medium", fontSize: 14, color: "#262A2B", letterSpacing: .8}}>
                                {apreRemise}€
                                </Text>
                          </View>
                        <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center",paddingTop: 19}}>
                              <Text style={{fontFamily: "Poppins-Regular", fontSize: 12, color: "#ACB2B2", letterSpacing: .8}}>
                              {t('fais douane')}
                              </Text>
                              <Text style={{fontFamily: "Poppins-Medium", fontSize: 14, color: "#262A2B", letterSpacing: .8}}>
                              {prices.sommeFraisDouane }€
                              </Text>
                        </View>
                        <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                              <Text style={{fontFamily: "Poppins-Regular", fontSize: 12, color: "#ACB2B2", letterSpacing: .8}}>
                              {t('Frais livraison')}
                              </Text>
                              <Text style={{fontFamily: "Poppins-Medium", fontSize: 14, color: "#262A2B", letterSpacing: .8}}>
                                {prices.fraisLivraison}€
                              </Text>
                        </View>
                        <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                              <Text style={{fontFamily: "Poppins-Regular", fontSize: 12, color: "#ACB2B2", letterSpacing: .8}}>
                              {t("Frais d'expédition")}
                              </Text>
                              <Text style={{fontFamily: "Poppins-Medium", fontSize: 14, color: "#262A2B", letterSpacing: .8}}>
                                {prices.fraisExpedition}€
                              </Text>
                        </View>
                        <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                              <Text style={{fontFamily: "Poppins-Regular", fontSize: 12, color: "#ACB2B2", letterSpacing: .8}}>
                              {t('Commission')}
                              </Text>
                              <Text style={{fontFamily: "Poppins-Medium", fontSize: 14, color: "#262A2B", letterSpacing: .8}}>
                                {prices.fraisCommission}€
                              </Text>
                        </View>
                        <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 15, paddingTop: 19,borderBottomWidth: 1, borderColor: "#E9E9E9"}}>
                              <Text style={{fontFamily: "Poppins-Regular", fontSize: 12, color: "#000", letterSpacing: .8}}>
                              {t('Montant à payer')}
                              </Text>
                              <Text style={{fontFamily: "Poppins-Medium", fontSize: 14, color: "#262A2B", letterSpacing: .8}}>
                              {montantApayer}€
                              </Text>
                        </View>
                        <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 15, paddingTop: 19,borderBottomWidth: 1, borderColor: "#E9E9E9"}}>
                              <Text style={{fontFamily: "Poppins-Regular", fontSize: 12, color: "#000", letterSpacing: .8}}>
                              {t('Montant avoir')}
                              </Text>
                              <View style={{flexDirection: "row", alignItems: "center", gap: 10}}>
                                <Entypo name="check" color="#01962A" size={15}/>
                                <Feather name="x" color="#E10303" size={15}/>
                              </View>
                        </View>
                        <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center",  paddingTop: 19,}}>
                              <Text style={{fontFamily: "Poppins-SemiBold", fontSize: 12, color: "#000", letterSpacing: .8}}>
                              {t('Reste à payer')}
                              </Text>
                              <Text style={{fontFamily: "Poppins-Medium", fontSize: 14, color: "#262A2B", letterSpacing: .8}}>
                              {resteApayer} €
                              </Text>
                        </View>

                        </>
                      </View>
                   
                      
                    }
              </View>

          {
            Avoirs.length > 0 && (
            

          <View style={[styles.dropContainerStyle,{position: "relative", zIndex: 1000} ]}>
            <DropDownPicker 
              style={[styles.dropdown]}
              containerStyle={styles.containerDepotStyle}
              dropDownContainerStyle={styles.selectedTextStyle}
              
              selectedItemContainerStyle={{backgroundColor: "#d5d6d7",}}
              items={Avoirs}
              placeholder={!isFocusAvoir ? t('Avoirs' ) : '...'}
              onSelectItem={item => {
                setAvoirValue(item.value);
                setAvoirChoice(true);
                setIsFocusAvoir(false)
              }}
              showsVerticalScrollIndicator={false}
              autoScroll
              maxHeight={120}
              open={isOpen}
              setOpen={() => setIsOpen(!isOpen)}
              value={isValue}
              setValue={(val) => setIsValue(val)}
            />
          </View>
            )
          }

          {
            (AvoirChoice ) && (
              <View style={{width: wp(95), alignSelf: 'center',backgroundColor: "#fff", paddingHorizontal: 13,borderRadius: 8, paddingBottom: 18}}>
                  <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center",  paddingTop: 19,}}>
                                  <Text style={{fontFamily: "Poppins-SemiBold", fontSize: 12, color: "#000", letterSpacing: .8}}>
                                  {t('Reste à payer')}
                                  </Text>
                                  <Text style={{fontFamily: "Poppins-Medium", fontSize: 14, color: "#262A2B", letterSpacing: .8}}>
                                  {resteApayer} €
                                  </Text>
                    </View>
              </View>
            )
          }

          
       <View style={{flex: 1, justifyContent: "center", alignItems: "center", marginTop: 30, position: "relative", zIndex: -100, marginBottom: wp(3)}}>
              <TouchableOpacity
                style={[LoadingPayment ? {backgroundColor: "#666"} :  {backgroundColor: "#4E8FDA"} ,{ paddingVertical: 8,paddingHorizontal: 22,flexDirection: "row", alignItems: "center",justifyContent: "center", borderRadius: 25}]}
                activeOpacity={.2}
                onPress={() => {
                  NavigateToPayment(resteApayer, remiseTotal)
                }}
                disabled={LoadingPayment}>
                <Text style={{fontFamily:"Poppins-Medium", fontSize: 12, color:"#fff"}}>
                  {
                  LoadingPayment ? <ActivityIndicator color={"#fff"} size={"small"}/> :  t('Valider la commande')
                  
                  }
                </Text>
              </TouchableOpacity> 
            </View>


        {/* {LoadingPayment && <ActivityIndicator />} */}

        

      </View>
    );
  };

  const RenderTotalCommand = ({data}) => {


    let prices = calculProductPricesCommand(data, RemiseValue, RemiseProduct);

    let valuesDemandeAchat = calculCommandeDemandeAchatPrices(CommandeDemandeAchat);


    let resteApayer = 0;
    let resteAvoir = 0;
    let apreRemise = 0;

   
    prices.sommeFraisDouane = valuesDemandeAchat.fraisDouane;
    prices.totalPrix = valuesDemandeAchat.prix;
    prices.totalPrixAvecDouaneRemiseAvoir = valuesDemandeAchat.prixTotal;
    prices.remiseTotal = valuesDemandeAchat.remise;
    prices.prixQuantite = valuesDemandeAchat.prix;
    prices.fraisExpedition = valuesDemandeAchat.fraisExpedition;
    prices.fraisCommission = valuesDemandeAchat.fraisCommission;
    prices.prixTotalSansRemise = valuesDemandeAchat.prixTotalSansRemise;
    prices.prixTotal = valuesDemandeAchat.prixTotal;
    prices.fraisLivraison = valuesDemandeAchat.fraisLivraison;

    TotalWithLivraison = valuesDemandeAchat.prixTotal;

    setPrixTotalLivraison(valuesDemandeAchat.fraisLivraison);

    remiseTotal = valuesDemandeAchat.remise;

    subTotal = valuesDemandeAchat.prix;


    apreRemise = subTotal - remiseTotal;
    apreRemise = apreRemise.toFixed(2);

    setSommeFraisDouane(prices.sommeFraisDouane)

    
    if (AvoirValue > TotalWithLivraison)
    {
      resteAvoir = AvoirValue - TotalWithLivraison;
      resteAvoir = resteAvoir.toFixed(2);
    }
    else 
    {
      resteApayer = TotalWithLivraison - AvoirValue;
    }

    montantApayer = prices.prixTotal;

    resteApayer = montantApayer;

    if (AvoirValue)
    {
      // saveCartAvoir(AvoirValue);
      resteApayer = (resteApayer - AvoirValue).toFixed(2)
    }


    return (
      
      <View>
        <View style={{marginTop: 13, paddingHorizontal: 12}}>
                    {
                        <>
                        <View style={{backgroundColor: "#fff", paddingTop: 22, paddingHorizontal: 13, paddingBottom: 30,borderRadius: 8}}>
                      <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 15, borderBottomWidth: 1, borderColor: "#E9E9E9"}}>
                          <Text style={{fontFamily: "Poppins-Regular", fontSize: 12, color: "#000", letterSpacing: .8}}>
                          {t('Sous Total')}
                          </Text>
                          <Text style={{fontFamily: "Poppins-Medium", fontSize: 14, color: "#262A2B", letterSpacing: .8}}>
                          { subTotal.toFixed(2) } €
                          </Text>
                       </View>
                        <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 15, paddingTop: 19,borderBottomWidth: 1, borderColor: "#E9E9E9"}}>
                              <Text style={{fontFamily: "Poppins-Regular", fontSize: 12, color: "#ACB2B2", letterSpacing: .8}}>
                              {t('Montant remise')}
                              </Text>
                              <Text style={{fontFamily: "Poppins-Medium", fontSize: 14, color: "#262A2B", letterSpacing: .8}}>
                                { remiseTotal == 0.00 ? '"-"' : "-" + remiseTotal +"€" }
                              </Text>
                        </View>
                        {'domicile' == modeLivraison ?
                            (
                              <View style={styles.secondContainer}>
                                <View style={styles.totalContainer}>
                                  <Text style={styles.totalText}>{t('Prix de livraison')}</Text>
                                  <Text style={styles.totalText}>{cartLivraisonPrice > 0 ? (cartLivraisonPrice + '€') : t('Offert')}</Text>

                                  
                                </View>
                              </View>
                            )
                            :
                            <></>
                          }
                          <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 15, paddingTop: 19,borderBottomWidth: 1, borderColor: "#E9E9E9"}}>
                                <Text style={{fontFamily: "Poppins-Regular", fontSize: 12, color: "#000", letterSpacing: .8}}>
                                {t('Sous-Total aprés remise')}
                                </Text>
                                <Text style={{fontFamily: "Poppins-Medium", fontSize: 14, color: "#262A2B", letterSpacing: .8}}>
                                {apreRemise}€
                                </Text>
                          </View>
                        <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center",paddingTop: 19}}>
                              <Text style={{fontFamily: "Poppins-Regular", fontSize: 12, color: "#ACB2B2", letterSpacing: .8}}>
                              {t('fais douane')}
                              </Text>
                              <Text style={{fontFamily: "Poppins-Medium", fontSize: 14, color: "#262A2B", letterSpacing: .8}}>
                              {prices.sommeFraisDouane }€
                              </Text>
                        </View>
                        <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                              <Text style={{fontFamily: "Poppins-Regular", fontSize: 12, color: "#ACB2B2", letterSpacing: .8}}>
                              {t('Frais livraison')}
                              </Text>
                              <Text style={{fontFamily: "Poppins-Medium", fontSize: 14, color: "#262A2B", letterSpacing: .8}}>
                                {prices.fraisLivraison}€
                              </Text>
                        </View>
                        <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                              <Text style={{fontFamily: "Poppins-Regular", fontSize: 12, color: "#ACB2B2", letterSpacing: .8}}>
                              {t("Frais d'expédition")}
                              </Text>
                              <Text style={{fontFamily: "Poppins-Medium", fontSize: 14, color: "#262A2B", letterSpacing: .8}}>
                                {prices.fraisExpedition}€
                              </Text>
                        </View>

                        <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 15,borderBottomWidth: 1, borderColor: "#E9E9E9"}}>
                              <Text style={{fontFamily: "Poppins-Regular", fontSize: 12, color: "#ACB2B2", letterSpacing: .8}}>
                              {t('Commission')}
                              </Text>
                              <Text style={{fontFamily: "Poppins-Medium", fontSize: 14, color: "#262A2B", letterSpacing: .8}}>
                                {prices.fraisCommission}€
                              </Text>
                        </View>
                    
                        <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 15, paddingTop: 19,borderBottomWidth: 1, borderColor: "#E9E9E9"}}>
                              <Text style={{fontFamily: "Poppins-Regular", fontSize: 12, color: "#000", letterSpacing: .8}}>
                              {t('Montant à payer')}
                              </Text>
                              <Text style={{fontFamily: "Poppins-Medium", fontSize: 14, color: "#262A2B", letterSpacing: .8}}>
                              {montantApayer}€
                              </Text>
                        </View>
                        <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 15, paddingTop: 19,borderBottomWidth: 1, borderColor: "#E9E9E9"}}>
                              <Text style={{fontFamily: "Poppins-Regular", fontSize: 12, color: "#000", letterSpacing: .8}}>
                              {t('Montant avoir')}
                              </Text>
                              <View style={{flexDirection: "row", alignItems: "center", gap: 10}}>
                                <Entypo name="check" color="#01962A" size={15}/>
                                <Feather name="x" color="#E10303" size={15}/>
                              </View>
                        </View>
                        <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center",  paddingTop: 19,}}>
                              <Text style={{fontFamily: "Poppins-SemiBold", fontSize: 12, color: "#000", letterSpacing: .8}}>
                              {t('Reste à payer')}
                              </Text>
                              <Text style={{fontFamily: "Poppins-Medium", fontSize: 14, color: "#262A2B", letterSpacing: .8}}>
                              {resteApayer} €
                              </Text>
                        </View>

                        </View>
                        </>
                     
                    }
              </View>

          {
            Avoirs.length > 0 && (
            

          <View style={[styles.dropContainerStyle,{position: "relative", zIndex: 1000} ]}>
            <DropDownPicker 
              style={[styles.dropdown]}
              containerStyle={styles.containerDepotStyle}
              dropDownContainerStyle={styles.selectedTextStyle}
              
              selectedItemContainerStyle={{backgroundColor: "#d5d6d7",}}
              items={Avoirs}
              placeholder={!isFocusAvoir ? t('Avoirs' ) : '...'}
              onSelectItem={item => {
                setAvoirValue(item.value);
                setAvoirChoice(true);
                setIsFocusAvoir(false)
              }}
              showsVerticalScrollIndicator={false}
              autoScroll
              maxHeight={120}
              open={isOpen}
              setOpen={() => setIsOpen(!isOpen)}
              value={isValue}
              setValue={(val) => setIsValue(val)}
            />
          </View>
            )
          }

          {
            (AvoirChoice ) && (
              <View style={{width: wp(95), alignSelf: 'center',backgroundColor: "#fff", paddingHorizontal: 13,borderRadius: 8, paddingBottom: 18}}>
                  <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center",  paddingTop: 19,}}>
                                  <Text style={{fontFamily: "Poppins-SemiBold", fontSize: 12, color: "#000", letterSpacing: .8}}>
                                  {t('Reste à payer')}
                                  </Text>
                                  <Text style={{fontFamily: "Poppins-Medium", fontSize: 14, color: "#262A2B", letterSpacing: .8}}>
                                  {resteApayer} €
                                  </Text>
                    </View>
              </View>
            )
          }

          
          <View style={{flex: 1, justifyContent: "center", alignItems: "center", marginTop: 30, position: "relative", zIndex: -100, marginBottom: wp(3)}}>
              <TouchableOpacity
                style={[LoadingPayment ? {backgroundColor: "#666"} :  {backgroundColor: "#4E8FDA"} ,{ paddingVertical: 8,paddingHorizontal: 22,flexDirection: "row", alignItems: "center",justifyContent: "center", borderRadius: 25}]}
                activeOpacity={.2}
                onPress={() => {
                  NavigateToPayment(resteApayer, remiseTotal)
                }}
                disabled={LoadingPayment}>
                <Text style={{fontFamily:"Poppins-Medium", fontSize: 12, color:"#fff"}}>
                  {
                  LoadingPayment ? <ActivityIndicator color={"#fff"} size={"small"}/> :  t('Valider la commande')
                    
                  }
                </Text>
              </TouchableOpacity> 
            </View>


        {/* {LoadingPayment && <ActivityIndicator />} */}

        

      </View>
    );
  };

  if (Loader || !Service)
  {
    return (<View style={{justifyContent: 'center', height: '80%'}}><ActivityIndicator size={'large'} color="#3292E0" /></View>);
  }
  return (
    <View style={{ flex: 1,}}>
        <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{paddingBottom: 80 , flex: 1}}>
          <ServiceHeader 
            navigation={props.navigation}
            service={Service}
            paysLivraison={paysLivraisonObject}
            language={Language}
          />

              <View>
              <Stepper position={2} Service={Service.code}/>
                </View>

          <View>
          <View style={{marginTop: 16}}>
            {
              cartProducts.length == 0
              ?
              <FlatList
                  showsVerticalScrollIndicator={false}
                  data={CartCommand}
                  renderItem={({ item }) => <RenderItemCommand item={item} />}
                  keyExtractor={item => item.id}
              />
              :
            <FlatList
                showsVerticalScrollIndicator={false}
                data={cartProducts}
                renderItem={({ item }) => <RenderItem item={item} />}
                keyExtractor={item => item.id}
            />
            }
          </View>

  

                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                  <View style={styles.superCartContainer}>
                    <View style={styles.firstContainerInformation}>
                      
                      <View style={styles.secondRow}>
                        <View>
                          <Text style={styles.WeightCalText}>
                            {t('Information de livraison')}
                          </Text>
                          <Text style={styles.WeightCalSubText}>
                            {t('Mode')} : {LivraisonData.livraisonMode}
                          </Text>

                          <Text style={styles.WeightCalSubText}>
                            {t('Adresse')} : {LivraisonData.livraisonAdresse }
                          </Text>

                          {LivraisonData.livraisonNom && (
                              <Text style={styles.WeightCalSubText}>
                              {t('Nom')} : {LivraisonData.livraisonNom}
                              </Text>
                            )
                          }

                          {LivraisonData.livraisonTelephone && (
                              <Text style={styles.WeightCalSubText}>
                              {t('Téléphone')} : {LivraisonData.livraisonTelephone}
                              </Text>
                            )
                          }
                        
                        </View>
                        
                      </View>
                      
                    </View>
                  </View>
                </View>

                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                  <View style={styles.superCartContainer}>
                    <View style={styles.firstContainerInformation}>
                      
                      <View style={styles.secondRow}>
                        <View>
                          <Text style={styles.WeightCalText}>
                            {t('Information de facturation')}
                          </Text>
                           <View style={{flexDirection: 'row', gap: 10, alignItems: "center"}}>

                              <Checkbox
                                value={AdresseFacturationDifferente}
                                onValueChange={value => setAdresseFacturationDifferente(value)}
                              />
                              <Text>{t('Adresse de facturation differente')}</Text>
                           </View>

                          {AdresseFacturationDifferente && (
                            <>

                              <View style={styles.dropContainerStyle}>
                                <Dropdown
                                  style={{borderColor: "#000", borderWidth: 1, padding: 10, borderRadius: 8}}
                                  autoScroll
                                  iconStyle={styles.iconStyle}
                                  containerStyle={styles.containerrrrStyle}
                                  data={Adresses}
                                  value={AdresseFacturationId}
                                  maxHeight={120}
                                  labelField="label"
                                  valueField="value"
                                  placeholder={t('Choisir une adresse existante')}
                                  placeholderStyle={{color: "#000"}}
                                  showsVerticalScrollIndicator={false}
                                  onChange={item => {
                                    setAdresseFacturationId(item.id);
                                  }}
                                />
                              </View>

                              <TouchableOpacity 
                              onPress={() => {
                                NavigateToUserAddress();
                              }}
                              style={{flexDirection: "row", alignItems: "center", gap: 10,marginTop: 10}}
                              >
                                <Icon name="plus" size={23} color="#000" />
                                <Text >{t('(ou) Ajouter une nouvelle adresse')}</Text>
                              </TouchableOpacity>

                              <TextInput
                                layout="first"
                                placeholder={t('Prénom et Nom')}
                                placeholderTextColor={"#666"}
                                value={NomFacturation}
                                style={{borderWidth: 1, borderRadius: 8, padding: 12, borderColor: "#000", marginTop: 20}}
                                onChangeText={text => {
                                  setNomFacturation(text);
                                }}
                              />
                            </>
                            )
                          }
                          
                        </View>
                        
                      </View>
                      
                    </View>
                  </View>
                </View>


          <View style={{marginTop: 10, paddingHorizontal: 12}}>
              <Text style={{fontSize: 10, color: "#000"}}>*{t('Livraison 72h aprés la prise en charge')}</Text>
            </View>

             
             {
              cartProducts == 0
              ?
              <RenderTotalCommand data={CartCommand} />
               :
              <RenderTotal data={cartProducts} />
             }

            
          </View>
        </View>

      </ScrollView>
    </View>
  )
}

export default CheckoutScreenDemandeAchat