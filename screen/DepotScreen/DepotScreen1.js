import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Modal,
  TextInput,
  TouchableOpacity,
  ToastAndroid,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Linking
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Picker } from "@react-native-picker/picker";
import Stepper from "../Stepper";
import {
  getCommand,
  getDepotModeChoice,
  getDepotValues,
  getNewAddedAddress,
  getPanier,
  getPlatformLanguage,
  getSelectedCountry,
  getSelectedService,
  getServices,
  saveCreneaux,
  saveDepotAdresseId,
  saveDepotAdresseValues,
  saveDepotMagasinId,
  saveDepotMagasinValues,
  saveDepotMagasinSchedule,
  saveDepotModeChoice,
  saveDepotValidation,
  saveSelectedCountry,
  saveSelectedService,
  resetDepotMagasinStorage,
  resetAllDepotStorage,
  getPointRelaisChoice,
  saveDepotFraisTransfert
} from "../../modules/GestionStorage";
import axiosInstance from "../../axiosInstance";
import { useTranslation } from "react-i18next";
import { useIsFocused, useRoute, useFocusEffect } from "@react-navigation/native";
import ServiceHeader from "../../components/ServiceHeader";
import PhoneInput from "react-native-international-phone-number";

import { Dropdown } from "react-native-element-dropdown";
import styles from "./styles";
import Toast from "react-native-toast-message";
import auth from "@react-native-firebase/auth";
import { removeCountryCode } from "../../components/removeCountryCode";
import { getCountryCodeFromPhone } from "../../components/getCountryCode";
import PointRelaisModal from "./PointRelaisModal";


const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const DepotScreen1 = (props) => {

  var isFocused = useIsFocused();

  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [current, setCurrent] = useState();
  const [current2, setCurrent2] = useState();
  const [isFocus, setIsFocus] = useState(false);
  const [isFocus1, setIsFocus1] = useState(false);
  const [Activity, setActivity] = useState(true);
  const [ActivityMagasins, setActivityMagasins] = useState(true);
  const [MagasinsDepot, setMagasinsDepot] = useState([]);
  const [MagasinsDepotRawValues, setMagasinsDepotRawValues] = useState([]);
  const [adresses, setAdresses] = useState([]);
  const [UserDomicileChoix, setUserDomicileChoix] = useState("");
  const [UserMagasinChoix, setUserMagasinChoix] = useState("");
  const [NomContact, setNomContact] = useState("");
  const [TelContact, setTelContact] = useState("");
  const [telCopy, setTelCopy] = useState("");

  const [actionTriggered, setActionTriggered] = useState({}); // to make modal dynamic
  const [modalVisible, setModalVisible] = useState(false);
  const [showMagasin, setShowMagasin] = useState(false);
  const [showAdresseEnlevement, setShowAdresseEnlevement] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectValue, setSelectValue] = useState("");
  const [isDepotChoice, setIsDepotChoice] = useState(false);
  const [depotChoiceMode, setDepotChoiceMode] = useState("");
  const [userAdresseChoice, setUserAdresseChoice] = useState(null);
  const [userMagasinChoice, setUserMagasinChoice] = useState(null);
  const [Service, setService] = useState(null);
  const [paysLivraisonObject, setPaysLivraisonObject] = useState(null);
  const [Creneaux, setCreneaux] = useState([]);
  const [Language, setLanguage] = useState("fr");
  const [getAdrees, setGetAdrees] = useState([]);
  const [CartCommand, setCartCommand] = useState([]);
  const [paysCommand, setPayCommand] = useState([]);
  const [CommandBasket, setCommandBasket] = useState([]);
  const [ServiceCommand, setServiceCommand] = useState([]);
  const [montantMinimum, setmontantMinium] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState();
  const [CommandeHasManualValidation, setCommandeHasManualValidation] =
    useState(false);
  const [count, setCount] = useState(0);
  const [DepotElements, setDepotElements] = useState([]);
  const [FraisTransfert, setFraisTransfert] = useState([]);
  const [FraisTransfertMontant, setFraisTransfertMontant] = useState(0);
  const [PanierData, setPanierData] = useState([]);
  const [ShowFraisTransfert, setShowFraisTransfert] = useState(false);
  const [PointsRelaisPaysExclure, setPointsRelaisPaysExclure] = useState([]);
  let isNewAddressAdded = props.route.params;
  isNewAddressAdded = isNewAddressAdded
    ? isNewAddressAdded.newAddressAdded
    : false;

  const items = [
    { label: t("Dépôt au magasin"), value: "magasin" },
    { label: t("Enlèvement à domicile"), value: "enlevement" },
  ];

  const itemsMagasin = [
    { label: t("Dépôt au magasin"), value: "magasin" },
  ];

  const [pointRelaisModalVisible, setPointRelaisModalVisible] = useState(false);
  const [selectedPointRelais, setSelectedPointRelais] = useState(null);

  const [poidsTotalProduit, setPoidsTotalProduit] = React.useState(0);

  const [Loader, setLoader] = useState(false);

  const [listePaysRelais, setListePaysRelais] = useState([]);

  const route = useRoute();

  const loadFromSession = async () => {
    try {
      const raw = await getPointRelaisChoice();

      setSelectedPointRelais(raw);
      
    } catch {

      if (Platform.OS == "ios") {
        Toast.show({
          type: "error",
          text1: t("Point relais"),
          text2: t("Impossible de récupérer le point relais"),
        });
      } else {
        ToastAndroid.show(t("Impossible de récupérer le point relais"), ToastAndroid.SHORT);
      }
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      (async () => {

        setLoader(true);

        getDepotInformations();

         setLoader(false);
      })();
    }, [])
  );

  async function getDepotInformations()
  {
    setActivityMagasins(true);

    let paysLivraisonObject = await getSelectedCountry();

    let fournisseurs = [];
    let requestBody = {
      montantCommande: route?.params?.prices?.totalPrix,
    };

    if (route?.params?.excludedSupplierIds) {
      requestBody.fournisseurs = route.params.excludedSupplierIds;
    }

    // Get panier
    let basketData = await getPanier();

    let poidsTotal = 0;
    basketData?.forEach((item) => {
      let quantite = parseInt(item.quantite);
      quantite = isNaN(quantite) ? 1 : quantite;

      // si pas de poids moyen mettre une très grande pour exclure les poids relais
      let poidsMoyen = parseFloat(item.poidsMoyen);
      poidsMoyen = isNaN(poidsMoyen) ? 10000 : poidsMoyen;

      poidsTotal = poidsTotal + Math.ceil(quantite * poidsMoyen);
    });

    let doNotFetchPointsRelais = false;
      try {
        const response = await axiosInstance.get(`point_relais_pays_exclure/`);

        if (response.data) {
          setPointsRelaisPaysExclure(response.data);

           response.data?.forEach((item) => {

            if (item.paysLivraison.id == paysLivraisonObject.id) {
              doNotFetchPointsRelais = true;
            }
          });

        }
      } catch (error) {
        console.error("Erreur lors de la récupération des pays à exclure du point relais:", error);
      }

      if (!doNotFetchPointsRelais)
      {
        let fraisTransfertDepot = [];
        try {
          const response = await axiosInstance.get(`frais_transfert/`);

          if (response.data) {
            fraisTransfertDepot = response.data.reduce((frais, f) => {
              const key = f.codePointRelais;
              (frais[key] ||= []).push(f);
              return frais;
            }, {});

            setFraisTransfert(fraisTransfertDepot);
          }
        } catch (error) {
          
          console.error("Erreur lors de la récupération des frais de transfert:", error);
        }
      }

      try {
        const response = await axiosInstance.post(
          `fournisseurs/magasins/${paysLivraisonObject.id}/depot`,
          requestBody
        );

        if (response.data) {
          fournisseurs = response.data;
        }
      } catch (error) {
        if (error?.data?.montantMinimum) {
          setmontantMinium(error.data.montantMinimum);
        }
        console.error("Erreur lors de la récupération des magasins:", error);
      }

      let data = [];
      let rawData = [];
      fournisseurs?.forEach(function (fournisseur) {
        let addFournisseur = false;
        fournisseur.magasins?.forEach(function (magasin) {
          let found = false;

          const checkDepot = (typeArray) => {
            return Array.isArray(typeArray) && typeArray.includes("Dépôt");
          };

          if (Service?.code === "fret-par-bateau") {
            if (checkDepot(magasin.typeFretBateau)) {
              found = true;
            }
          } else if (Service?.code === "fret-par-avion") {
            if (checkDepot(magasin.typeFretAvion)) {
              found = true;
            }
          } else {
            if (checkDepot(magasin.types)) {
              found = true;
            }
          }

          if (
            found &&
            paysLivraisonObject.depart.toLowerCase() ===
              magasin.pays.toLowerCase()
          ) {
            data.push(magasin);
            addFournisseur = true;
          }
        });

        if (addFournisseur) {
          rawData.push(fournisseur);
        }
      });


      let pointsRelais = [];
      let paysPointRelais = {};
      if (!doNotFetchPointsRelais)
      {
        try {
          const response = await axiosInstance.get(`points_relais/${paysLivraisonObject.id}`);

          if (response.data) 
          {
            response.data?.forEach((item) => {
              if (poidsTotal <= item.poidsMaxDepotFretAvion)
              {
                pointsRelais.push(item);
              }

              let paysKey = item.pays;
              let paysValue = item.paysLibelle;

              if (!(paysKey in paysPointRelais))
              {
                paysPointRelais[paysKey] = paysValue;
              }
            });

           

            let countries = [];
            for (const[key, value] of Object.entries(paysPointRelais))
            {
              countries.push({
                label: value,
                value: key
              });
            }

            setListePaysRelais(countries);

            if (pointsRelais.length < 1)
            {
              setFraisTransfertMontant(0);
              setShowFraisTransfert(false);
            }

            console.log("response.data response.data d", response.data)
          }
        } catch (error) {
          
          console.error("Erreur lors de la récupération des points relais:", error);
        }
      }

      let formatted = data.map((ls) => ({
        id: ls.id,
        label: `${ls.pays}, ${ls.codePostal ? ls.codePostal + ", " : ""}${
          ls.ville
        }, ${ls.adresse}`,
        value: ls.id,
        type: 'magasin'
      }));

      let formattedPointRelais = pointsRelais.map((ls) => ({
        id: ls.code,
        label: ls.nom,
        value: ls.code,
        url: ls.url,
        poidsMaxDepot: Service?.code === "fret-par-avion" ? ls.poidsMaxDepotFretAvion : ls.poidsMaxDepotFretBateau,
        type: 'relais'
      }));

      if (formattedPointRelais.length > 0)
      {
        let newArray = [...formatted, ...formattedPointRelais]
        formatted = newArray;

        newArray = [...rawData, ...pointsRelais]
        rawData.push(pointsRelais);
      }


      setMagasinsDepot(formatted);
      setMagasinsDepotRawValues(rawData);


      setActivityMagasins(false);


       // Get user address
      let formattedAdresse = [];
      const user = auth().currentUser;

      axiosInstance
        .get("/adresses/user/depart/" + user.uid + "/" + paysLivraisonObject.id)
        .then((response) => {
          if (response.data) {
            let data = response.data;

            formattedAdresse = data.map((ls) => {
              return {
                id: ls.id,
                label:
                  ls.adresse +
                  " " +
                  ls.codePostal +
                  " " +
                  ls.ville +
                  " " +
                  ls.pays,
                value: ls.id,
                codePostal: ls.codePostal,
                ville: ls.ville,
                nom: ls.nom,
                telephone: ls.telephone,
              };
            });

            setAdresses(formattedAdresse);
          }
        })
        .catch(function (error) {
          console.log("adresse fetch error", error);
        });



      // Added new address or previous address choice
      if (isNewAddressAdded) {
        setmontantMinium(0);
        let adresse = await getNewAddedAddress();

        if (adresse) {
          adresse.label = `${adresse.pays}, ${
            adresse.codePostal ? adresse.codePostal + ", " : ""
          }${adresse.ville}, ${adresse.adresse}`;

          setUserDomicileChoix(adresse);
          setUserAdresseChoice(adresse.id);
          setStorageDepotChoiceAdresse(adresse);
          setNomContact(adresse.nom);
          setTelContact(adresse.telephone);
          setTelCopy(adresse.telephone);
        }
      }

      

      // Previous depot choice
      let choice = await getDepotModeChoice();

      let depotAdresseValues = await getDepotValues();

      if (choice) {
        setDepotChoiceMode(choice);

        if ("magasin" == choice) {
          setShowMagasin(true);
          setShowAdresseEnlevement(false);

          if (depotAdresseValues.depotMagasin) {
            var newData = formatted.filter((ls) => {
              if (ls.id == depotAdresseValues.depotMagasin || ls.code == depotAdresseValues.depotMagasin) {
                return ls;
              }
            });

            let choiceRelais = newData[0];
            if ('relais' == depotAdresseValues.depotTypeRelaisMagasin)
            {
              if (choiceRelais)
              {
                choiceRelais.label = depotAdresseValues.depotMagasinAdresse;
              }

              if (pointsRelais.length > 0)
              {
                setFraisTransfertMontant(depotAdresseValues.depotFraisTransfertMontant);
                setShowFraisTransfert(true);
              }
            }

            setUserMagasinChoix(choiceRelais);
            setUserMagasinChoice(depotAdresseValues.depotMagasin);
          }
        } else {
          setShowAdresseEnlevement(true);
          setShowMagasin(false);

          var newData = formattedAdresse.filter((ls) => {
            if (ls.id == depotAdresseValues.depotAdresseId) {
              return ls;
            }
          });
          if (depotAdresseValues.depotAdresseId) {
            setUserAdresseChoice(depotAdresseValues.depotAdresseId);

            setUserDomicileChoix(newData[0]);
          }

          if (depotAdresseValues.depotNom) {
            setNomContact(depotAdresseValues.depotNom);
          }

          if (depotAdresseValues.depotTelephone) {
            setTelContact(newData[0].telephone);
          }
        }
      }
  }

  

  useEffect(() => {
    loadFromSession();
  }, []);

  const handleOpen = () => setPointRelaisModalVisible(true);

  const handleClose = async (changed) => {
    setPointRelaisModalVisible(false);
    if (changed) await loadFromSession();
  };


  useEffect(() => {
    setCount(0);
    setmontantMinium(0);
    async function fetchData() {
      let validationManuelle = false;

      setActivity(true);
      

      // Get pays de livraison
      let paysLivraisonObject = await getSelectedCountry();

      setPaysLivraisonObject(paysLivraisonObject);

      // Language
      const currentLanguage = await getPlatformLanguage();
      setLanguage(currentLanguage);

      // Get service
      let service = await getSelectedService();

      let BasketCommand = await getCommand();
      let Data = [];
      if (BasketCommand.length > 0) {
        const response = await axiosInstance.get(
          "/pays/" + BasketCommand[0].paysLivraison
        );

        Data = response.data;

        BasketCommand?.forEach((item) => {
          if (item.product && item.product.validationManuelle) {
            validationManuelle = true;
          }
        });
      }

      // Get panier
      let basketData = await getPanier();

      if (basketData.length > 0) {
        basketData?.forEach((item) => {
          if (item.product && item.product.validationManuelle) {
            validationManuelle = true;
          }
        });

        setPanierData(basketData);
      }

      setCommandeHasManualValidation(validationManuelle);

      if (validationManuelle) {
        setStorageDepotChoiceMode("enlevement");
        setDepotChoiceMode("enlevement");
        setIsDepotChoice(false);

        setShowAdresseEnlevement(true);
        setShowMagasin(false);
      }

      if (basketData.length > 0) {
        // Prend tjr le service du panier
        let cartService = basketData[0].service;
        if (cartService != service?.code) {
          let services = await getServices();

          var newData = services.filter((ls) => {
            if (ls?.code == cartService) {
              return ls;
            }
          });

          service = newData[0];

          saveSelectedService(newData[0]);
        }

        // prendre tjr le pays de livraison du panier
        let cartPaysLivraison = basketData[0].paysLivraison;
        if (paysLivraisonObject.id != cartPaysLivraison.id) {
          paysLivraisonObject = cartPaysLivraison;

          setPaysLivraisonObject(paysLivraisonObject);

          await saveSelectedCountry(paysLivraisonObject);
        }
      } else {
        let cartService = Data.service;

        if (cartService?.code != service?.code) {
          let services = await getServices();

          var newData = services.filter((ls) => {
            if (ls?.code == cartService?.code) {
              return ls;
            }
          });

          service = newData[0];

          saveSelectedService(newData[0]);
        }
        // prendre tjr le pays de livraison du panier
        let cartPaysLivraison = Data;
        if (paysLivraisonObject.id != cartPaysLivraison.id) {
          paysLivraisonObject = cartPaysLivraison;

          setPaysLivraisonObject(paysLivraisonObject);

          await saveSelectedCountry(paysLivraisonObject);
        }
      }

      setService(service);

      // Get user email
      axiosInstance
        .post(`creneaux/${paysLivraisonObject.id}`, {
          montantCommande: route?.params?.prices?.totalPrix,
          fournisseurs: route?.params?.excludedSupplierIds,
        })
        .then((response) => {
          if (response.data) {
            setCreneaux(response.data);

            console.log('creneau response.data response.data', response.data)

            if (response.data.length < 1 && !validationManuelle)
            {
              setDepotElements(itemsMagasin);
            }
            else 
            {
              setDepotElements(items);
            }
          }
        })
        .catch(function (error, status) {
          if (error.response.status === 400) {
            setmontantMinium(error?.response?.data?.montantMinimum);

            setDepotElements(items);
            
          }
          else 
          {
            setDepotElements(itemsMagasin);
          }
        });

        if (validationManuelle)
        {
          setmontantMinium(0);
        }

      setActivity(false);
    }

    fetchData();
  }, [isFocused]);

  const handlePhoneChange = (text) => {
    if (count > 0) {
      setTelContact(text);
    }
    setCount(count + 1);
  };

  // Garder le mode de depot
  async function setStorageDepotChoiceMode(itemValue) {
    await saveDepotModeChoice(itemValue);
  }

  // Garder l'adresse
  async function setStorageDepotChoiceAdresse(item) {
    await saveDepotAdresseId(item.id);
  }

  // Sauvegarder les choix
  async function NavigateToDepotMagasin() {
    await resetAllDepotStorage();
    if (UserMagasinChoix === "" || !UserMagasinChoix) {
      if (Platform.OS == "ios") {
        Toast.show({
          type: "error",
          text1: t("Le magasin "),
          text2: t("Le magasin est obligatoire"),
        });
      } else {
        ToastAndroid.show(t("Le magasin est obligatoire"), ToastAndroid.SHORT);
      }
      return;
    }

    let fournisseurId = null;
    MagasinsDepotRawValues?.forEach(function (fournisseur) {
      fournisseur.magasins?.forEach(function (magasin) {
        if (magasin.id == UserMagasinChoix.id) {
          fournisseurId = fournisseur.id;
        }
      });
    });

    if (UserMagasinChoix && 'relais' == UserMagasinChoix.type)
    {
      await saveDepotFraisTransfert(FraisTransfertMontant, 'relais');
    }

    await saveDepotMagasinValues(
      UserMagasinChoix?.label,
      UserMagasinChoix.id,
      fournisseurId
    );
    await saveDepotMagasinSchedule(
      "fr" == Language
        ? actionTriggered.horaireOuverture
        : actionTriggered.horaireOuvertureEN
    );
    await saveDepotValidation();

    props.navigation.navigate("Livraison1", {
      magasinId: UserMagasinChoix?.id,
    });
  }

  // Retrait à domicile
  async function NavigateToRetraitDomicile() {
    await resetDepotMagasinStorage();
    if (NomContact === "") {
      if (Platform.OS == "ios") {
        Toast.show({
          type: "error",
          text1: t("Nom de Contact"),
          text2: t(
            "Le nom de la personne qui récupère la commande est obligatoire"
          ),
        });
      } else {
        ToastAndroid.show(
          t("Le nom de la personne qui récupère la commande est obligatoire"),
          ToastAndroid.SHORT
        );
      }

      return;
    }

    if (TelContact === "") {
      if (Platform.OS == "ios") {
        Toast.show({
          type: "error",
          text1: t("Le téléphone"),
          text2: t(
            "Le téléphone de la personne qui récupère la commande est obligatoire"
          ),
        });
      } else {
        ToastAndroid.show(
          t(
            "Le téléphone de la personne qui récupère la commande est obligatoire"
          ),
          ToastAndroid.SHORT
        );
      }

      return;
    }

    if (UserDomicileChoix === "") {
      if (Platform.OS == "ios") {
        Toast.show({
          type: "error",
          text1: t("L'adresse"),
          text2: t("L'adresse est obligatoire"),
        });
      } else {
        ToastAndroid.show(t("L'adresse est obligatoire"), ToastAndroid.SHORT);
      }

      return;
    }

    let codePostal = UserDomicileChoix ? UserDomicileChoix.codePostal : null;

    let ville = UserDomicileChoix ? UserDomicileChoix.ville : null;
    ville = ville ? ville.toLowerCase() : null;

    if (!CommandeHasManualValidation) {
      let found = false;
  
      Creneaux?.forEach((creneau) => {
        if (creneau?.pays) {
          let creneauVille = creneau?.ville ? creneau?.ville.toLowerCase() : "";

          // Extraire le département du code postal
          let departementCreneau = creneau?.departementCode;

          let departementRecherche = codePostal
            ? codePostal.substring(0, 2)
            : "";
          // Vérification du code postal, de la ville ou du département
          if (
            creneau?.codePostal === codePostal ||
            creneauVille.includes(ville.toLowerCase()) ||
            (departementCreneau == departementRecherche &&
              creneau?.departementCode?.startsWith(departementRecherche))
          ) {
            found = true;
          }
        }
      });

      if (!found) {
        Platform.OS == "ios"
          ? Toast.show({
              type: "error",
              text1: t("créneaux"),
              text2: t("Nous n'avons pas de créneaux disponibles"),
            })
          : ToastAndroid.show(
              t("Nous n'avons pas de créneaux disponibles"),
              ToastAndroid.SHORT
            );

        return;
      }

      await saveCreneaux(Creneaux);
    }

    await saveDepotValidation();

    let concatenedPhone =
      selectedCountry.callingCode + removeCountryCode(TelContact);

    await saveDepotAdresseValues(
      NomContact,
      concatenedPhone,
      UserDomicileChoix?.label,
      UserDomicileChoix?.id,
      codePostal,
      ville
    );

    
    if (!CommandeHasManualValidation) {
      props.navigation.navigate("DepotScreen3", {
        magasinId: UserMagasinChoix?.id,
        prices: route?.params?.prices,
        excludedSupplierIds: route?.params?.excludedSupplierIds,
      });
    } else {
      props.navigation.navigate("Livraison1");
    }
  }

  // Ajouter une nouvelle adresse
  const NavigateToUserAddress = () => {
    props.navigation.navigate("AddAdresseScreen", {
      pageFrom: "depot",
      paysDepartLivraison: paysLivraisonObject.depart,
      paysDepartLivraisonEN: paysLivraisonObject.departEn,
      prices: route?.params?.prices,
    });
  };

  // Si le magasin change
  const OnChangeMagasinValue = (magasinChoice) => {
    let newArr = null;
    let magasinFound = false;

    setSelectedPointRelais(null);
    if ('relais' == magasinChoice.type)
    {
      MagasinsDepotRawValues?.forEach(function (magasins) {
        if (Array.isArray(magasins))
        {
            magasins.forEach(function (magasin) {
              
              if (!magasinFound && magasin.code == magasinChoice.id) {
                newArr = magasin;
                newArr.type = 'relais';
                magasinFound = true;
              }
            });
        }
      });
    }
    else{
      MagasinsDepotRawValues?.forEach(function (fournisseur) {
        fournisseur.magasins?.forEach(function (magasin) {
          if (!magasinFound && magasin.id == magasinChoice.id) {
            newArr = magasin;
            magasinFound = true;
          }
        });
      });
    }

    
    setActionTriggered(newArr);
    setModalVisible(true);
  };

  // Confirmation choix magasin
  async function ConfirmationChoixMagasin(magasin) {

    var newData = MagasinsDepot.filter((ls) => {
      if (ls.id == magasin.id || ls.id == magasin.code) {
        return ls;
      }
    });

    setFraisTransfertMontant(0);
    setShowFraisTransfert(false);
    setSelectedPointRelais(null);

    let choiceRelais = newData[0];

    if (magasin.code)
    {
      if (selectedPointRelais)
      {
        choiceRelais.label = choiceRelais.label + ' - ' + selectedPointRelais.name + ", " + selectedPointRelais.address1 + " " + selectedPointRelais.zipCode + " " + selectedPointRelais.city + " " + ("FR" == selectedPointRelais.countryCode ? "France" : ("BE" == selectedPointRelais.pays ? "Belgique" : "Allemagne"));
      }
      
      const fraisData = FraisTransfert[magasin.code];

      let prix = [];
      PanierData?.forEach((item) => {
        let quantite = parseInt(item.quantite);
        quantite = isNaN(quantite) ? 1 : quantite;

        let poidsMoyen = parseFloat(item.poidsMoyen);

        if (!isNaN(poidsMoyen))
        {
          prix.push(Math.ceil(quantite * poidsMoyen));
        }
      });

      let frais = 0;
      fraisData.forEach((item) => {

          prix.forEach((prixItem) => {

            if (item.quantite == prixItem){
              frais = frais + item.frais;
            }
          });
      });

      setFraisTransfertMontant(frais);
      setShowFraisTransfert(true);
    }
    
    setUserMagasinChoix(choiceRelais);
    setModalVisible(!modalVisible);
    setUserMagasinChoice(magasin.code ? magasin.code : magasin.id);

    await saveDepotMagasinId(magasin.code ? magasin.code : magasin.id);
  }

  

  // Reset du choix
  async function ResetChoixMagasin() {
    setUserMagasinChoice(null);
    setModalVisible(!modalVisible);
  }

  // Setter le numero de telephone
  function setNomNumeroTelephone(adresse) {
    setNomContact(adresse.nom);
    setTelContact(adresse.telephone);
  }

  if (!Service) {
    return (
      <View style={{ justifyContent: "center", height: "80%" }}>
        <ActivityIndicator size="large" color="#3292E0" style={{}} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, position: "relative" }}>
      <ServiceHeader
        navigation={props.navigation}
        service={Service}
        paysLivraison={paysLivraisonObject}
        language={Language}
      />
      <View>
        <Stepper position={1} />
      </View>

      {Activity === true || ActivityMagasins === true || Loader == true ? (
        <View style={{ justifyContent: "center", height: "80%" }}>
          <ActivityIndicator size="large" color="#3292E0" style={{}} />
        </View>
      ) : (
        <KeyboardAwareScrollView
          behavior="padding"
          showsVerticalScrollIndicator={false}
          keyboardVerticalOffset={-70}
          style={{ flex: 1 }}
        >
          <View style={{ flex: 1 }}>
            <View
              style={[
                CommandeHasManualValidation
                  ? { justifyContent: "center", alignItems: "center" }
                  : "",
                { marginTop: 28 },
              ]}
            >
              {CommandeHasManualValidation ? (
                <Text
                  style={{
                    fontFamily: "Poppins-Medium",
                    fontSize: 14,
                    color: "#000",
                  }}
                >
                  {t("Adresse de prise en charge")}
                </Text>
              ) : (
                <View>
                  <Dropdown
                    style={[styles.dropdown]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    autoScroll
                    iconStyle={styles.iconStyle}
                    containerStyle={styles.containerDepotStyle}
                    itemTextStyle={{ color: "#000" }}
                    data={DepotElements}
                    maxHeight={450}
                    labelField="label"
                    valueField="value"
                    placeholder={
                      !isDepotChoice ? t("Mode de prise du colis") : "..."
                    }
                    value={depotChoiceMode}
                    showsVerticalScrollIndicator={false}
                    onFocus={() => setIsDepotChoice(true)}
                    onBlur={() => setIsDepotChoice(false)}
                    onChange={(item) => {
                      if ("magasin" == item.value) {
                        setShowMagasin(true);
                        setShowAdresseEnlevement(false);
                      } else {
                        setShowAdresseEnlevement(true);
                        setShowMagasin(false);
                      }

                      setStorageDepotChoiceMode(item.value);
                      setDepotChoiceMode(item.value);
                      setIsDepotChoice(false);
                    }}
                  />
                </View>
              )}
            </View>

            {showAdresseEnlevement && (
              <>
                <View
                  style={{
                    marginTop: 30,
                    width: windowWidth * 0.9,
                    alignSelf: "center",
                  }}
                >
                  {montantMinimum === 0 && (
                    <View
                      style={{
                        backgroundColor: "#fff",
                        paddingVertical: 22,
                        paddingHorizontal: 14,
                        borderRadius: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Poppins-Medium",
                          fontSize: 14,
                          color: "#000",
                          marginBottom: 10,
                        }}
                      >
                        {CommandeHasManualValidation
                          ? t("Liste des adresses existantes")
                          : t("Adresse d'enlèvement")}
                      </Text>
                      <View>
                        <Dropdown
                          style={[styles.dropdown]}
                          placeholderStyle={[
                            styles.placeholderStyle,
                            { color: "#AFAFAF" },
                          ]}
                          selectedTextStyle={styles.selectedTextStyle}
                          autoScroll
                          iconStyle={styles.iconStyle}
                          containerStyle={styles.containerrrrStyle}
                          data={adresses}
                          value={userAdresseChoice}
                          itemTextStyle={{ color: "#000" }}
                          maxHeight={120}
                          labelField="label"
                          valueField="value"
                          placeholder={
                            !isFocus1
                              ? t("Choisir une adresse existante")
                              : "..."
                          }
                          showsVerticalScrollIndicator={false}
                          onFocus={() => setIsFocus1(true)}
                          onBlur={() => setIsFocus1(false)}
                          onChange={(item) => {
                            setUserDomicileChoix(item);
                            setUserAdresseChoice(item.value);
                            setIsFocus1(false);
                            setStorageDepotChoiceAdresse(item);
                            setNomNumeroTelephone(item);
                          }}
                        />
                      </View>
                      <TouchableOpacity
                        style={styles.ButtonContainer}
                        disabled={montantMinimum > 0}
                        onPress={() => {
                          NavigateToUserAddress();
                        }}
                      >
                        <Text style={styles.ButtonText}>
                          {t("Ajouter une nouvelle adresse")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                {montantMinimum > 0 && (
                  <View
                    style={{
                      alignItems: "center",
                      marginTop: 10,
                      marginHorizontal: 10,
                    }}
                  >
                    <Text
                      style={{
                        padding: 10,
                        fontSize: 15,
                        fontWeight: "bold",
                        color: "red",
                        textAlign: "center",
                      }}
                    >{`${t("errorDomicile1")} ${montantMinimum} euros, ${t(
                      "errorDomicile2"
                    )} `}</Text>
                  </View>
                )}
                {montantMinimum === 0 && (
                  <View style={{ marginTop: 12, paddingHorizontal: 16 }}>
                    <View
                      style={{
                        backgroundColor: "#fff",
                        paddingVertical: 22,
                        paddingHorizontal: 14,
                        borderRadius: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Poppins-Medium",
                          fontSize: 13,
                          color: "#000",
                        }}
                      >
                        {t("Coordonnées de la personne à contacter")}
                      </Text>

                      <View style={styles.inputCountryCustomContainer}>
                        <TextInput
                          layout="first"
                          placeholder={t("Nom de la personne à contacter")}
                          placeholderTextColor="#AFAFAF"
                          style={{
                            color: "#000",
                            fontFamily: "Poppins-Regular",
                            width: "100%",
                            fontSize: windowWidth * 0.031,
                          }}
                          value={NomContact}
                          onChangeText={(text) => {
                            setNomContact(text);
                          }}
                        />
                      </View>

                      <View
                        style={{
                          justifyContent: "center",
                          alignItems: "center",
                          marginTop: 10,
                          marginBottom: 10,
                        }}
                      >
                        <PhoneInput
                          language={i18n.language}
                          containerStyle={styles.countryPickerContainerStyle}
                          textInputStyle={styles.textInput}
                          defaultCountry={
                            getCountryCodeFromPhone(TelContact) || "FR"
                          }
                          selectedCountry={selectedCountry}
                          onChangeSelectedCountry={(country) => {
                            setSelectedCountry(country);
                          }}
                          value={removeCountryCode(TelContact)}
                          onChangePhoneNumber={handlePhoneChange}
                        />
                      </View>
                    </View>
                  </View>
                )}
                {montantMinimum === 0 && showAdresseEnlevement && (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "flex-end",
                      alignItems: "center",
                      marginBottom: windowWidth * 0.2,
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.ButtonStyle,
                        { width: "60%", marginBottom: wp(2), marginTop: 50 },
                      ]}
                      disabled={montantMinimum > 0 || !UserDomicileChoix}
                      onPress={() => {
                        NavigateToRetraitDomicile();
                      }}
                    >
                      <Text style={styles.ButtonStyleText}>
                        {CommandeHasManualValidation
                          ? t("Valider")
                          : t("Valider enlèvement à domicile")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}


            {showMagasin && (
              <>
                <View style={{ marginTop: 32, paddingHorizontal: 16 }}>
                  <View
                    style={{
                      backgroundColor: "#fff",
                      paddingVertical: 22,
                      paddingHorizontal: 14,
                      borderRadius: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Poppins-Medium",
                        fontSize: 14,
                        color: "#000",
                      }}
                    >
                      {t("Liste des magasins de dépot")}
                    </Text>
                    <View style={{ marginTop: 10 }}>
                      <Dropdown
                        style={[styles.dropdown]}
                        placeholderStyle={[
                          styles.placeholderStyle,
                          { color: "#AFAFAF" },
                        ]}
                        selectedTextStyle={styles.selectedTextStyle}
                        autoScroll
                        iconStyle={styles.iconStyle}
                        containerStyle={MagasinsDepot.length > 1 ? styles.containerrrrStyleWidthWider : styles.containerrrrStyleWidthDefaut}
                        itemTextStyle={{ color: "#000" }}
                        data={MagasinsDepot}
                        value={userMagasinChoice}
                        maxHeight={220}
                        labelField="label"
                        valueField="value"
                        placeholder={
                          MagasinsDepot.length > 0
                            ? t("Choisir le magasin de dépôt")
                            : t("Pas de magasins disponibles")
                        }
                        showsVerticalScrollIndicator={false}
                        onFocus={() => setIsFocus(true)}
                        onBlur={() => setIsFocus(false)}
                        onChange={(item) => {
                          setIsFocus(false);
                          OnChangeMagasinValue(item);
                        }}
                      />
                    </View>
                    <View
                      style={{
                        alignItems: "center",
                        marginTop: 10,
                        justifyContent: "center",
                        flex: 1,
                      }}
                    ></View>
                    {/* <View style={{marginTop: 8}}>
                        <Text
                          style={{
                            fontFamily: 'Poppins-Regular',
                            color: '#000',
                            fontSize: 10,
                          }}>
                          *{t('Livraison 72h aprés la prise en charge')}
                        </Text>
                      </View> */}
                  </View>
                </View>

                {ShowFraisTransfert && (
                    <View style={styles.TotalContainer}>
                      <Text style={styles.TotalText}>{t('Frais de transfert')}</Text>
                      <Text style={styles.PriceText}>
                        {
                          FraisTransfertMontant.toFixed(2) + '€'
                        }
                      </Text>
                    </View>
                  )
                }

                

                <View style={{ flex: 1 }}>
                  <TouchableOpacity
                    style={[
                      styles.ButtonStyle,
                      { width: "60%", marginTop: 29 },
                    ]}
                    disabled={
                      montantMinimum > 0 && depotChoiceMode !== "magasin"
                    }
                    onPress={() => {
                      NavigateToDepotMagasin();
                    }}
                  >
                    <Text style={styles.ButtonStyleText}>
                      {t("Valider dépot au magasin")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => {
                setModalVisible(!modalVisible);
              }}
            >
              <View style={styles.centeredView}>
                <View style={styles.modalView}>

                  <Pressable
                    onPress={ResetChoixMagasin}
                    hitSlop={12}
                    style={{
                      position: 'absolute',
                      top: 2,
                      right: 8,
                      zIndex: 10,
                      width: 100,
                      height: 36,
                      alignItems: 'center',
                      justifyContent: 'center',
                      //backgroundColor: 'rgba(0,0,0,0.06)',
                      paddingHorizontal: 10, 
                      paddingVertical: 6, 
                      borderRadius: 8, 
                      backgroundColor: '#eee'
                    }}
                    accessibilityLabel={t("Fermer")}
                  >
                    <Text style={{ fontSize: 15, fontWeight: '700', lineHeight: 22 }}> {t("Fermer")}</Text>
                  </Pressable>


                  <Text style={styles.Heading}>
                    {'relais' == actionTriggered.type ? 'Informations' : t("Horaires d'ouverture")}
                  </Text>
                  {'relais' == actionTriggered.type && !selectedPointRelais ? (
                    <Text style={styles.modalText}>
                      {
                        "fr" == Language ? 
                        "Vous allez être redirigé(e) sur la page pour choisir le point relais le plus proche de chez vous." 
                        : 
                        "You will be redirected to choose your nearest pickup point."
                      }
                    </Text>
                    ) : (
                      <Text style={styles.modalText}>
                        {"fr" == Language
                          ? actionTriggered.horaireOuverture
                          : actionTriggered.horaireOuvertureEN
                        }
                      </Text>
                    )
                  }

                  {selectedPointRelais && (
                      <Text style={styles.modalText}>
                        {
                          selectedPointRelais.name + "\n" +

                          selectedPointRelais.address1 +
                          ", " +
                          (selectedPointRelais.zipCode
                            ? selectedPointRelais.zipCode + " "
                            : "") +
                          selectedPointRelais.city +
                          " " +
                          ("FR" == selectedPointRelais.countryCode ? "France" : ("BE" == selectedPointRelais.countryCode ? "Belgique" : "Allemagne"))
                        }
                      </Text>
                    )

                  }
                  
                  
                  <Text style={styles.modalText}>
                    {'relais' == actionTriggered.type ? '' : (
                      actionTriggered.adresse +
                      ", " +
                      (actionTriggered.codePostal
                        ? actionTriggered.codePostal + " "
                        : "") +
                      actionTriggered.ville +
                      " " +
                      actionTriggered.pays
                      )
                    }
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      gap: 15,
                    }}
                  >
                    

                    {!selectedPointRelais && 'relais' == actionTriggered.type && (
                        <Pressable
                            style={[styles.button, styles.buttonClose]}
                            onPress={handleOpen}
                          >
                            <Text
                              

                              style={{
                                color: "#fff",
                                fontFamily: "Poppins-Medium",
                                fontSize: 12,
                              }}
                            >
                              {t("Voir les points relais")}
                            </Text>
                          </Pressable>
                      )
                    }

                    {selectedPointRelais && 'relais' == actionTriggered.type &&
                      (
                        <Pressable
                          style={[styles.button, styles.buttonClose]}
                          onPress={() => ConfirmationChoixMagasin(actionTriggered)}
                        >
                          <Text
                            style={{
                              color: "#fff",
                              fontFamily: "Poppins-Medium",
                              fontSize: 12,
                            }}
                          >
                            {t("Confirmer la selection du point relais")}
                          </Text>
                        </Pressable>
                      )

                    }

                    {'relais' != actionTriggered.type &&
                      (
                        <Pressable
                          style={[styles.button, styles.buttonClose]}
                          onPress={() => ConfirmationChoixMagasin(actionTriggered)}
                        >
                          <Text
                            style={{
                              color: "#fff",
                              fontFamily: "Poppins-Medium",
                              fontSize: 12,
                            }}
                          >
                            {t("Selectionner le magasin")}
                          </Text>
                        </Pressable>
                      )

                    }

                    
                  </View>
                </View>
                <View
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#000",
                    opacity: 0.5,
                    zIndex: -100,
                  }}
                ></View>
              </View>
            </Modal>
          </View>
        </KeyboardAwareScrollView>
      )}

      <PointRelaisModal
        key={actionTriggered ? actionTriggered.pays : 'FR'} 
        visible={pointRelaisModalVisible}
        onRequestClose={handleClose}
        pointBaseUri="points_relais_gls_liste"
        language={Language}
        pays={actionTriggered ? actionTriggered.pays : 'FR'}
        listePays={listePaysRelais}
      />

    </View>
  );
};

export default DepotScreen1;
