import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  StyleSheet,
  Image,
  ToastAndroid,
  Alert,
  Platform,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { HeaderEarth } from "../../components/Header";
import Textarea from "react-native-textarea";
import Button from "../../components/Button";
import DropDownPicker from "react-native-dropdown-picker";
import { ScrollView } from "react-native-virtualized-view";
import { useTranslation } from "react-i18next";
import axiosInstance from "../../axiosInstance";
import {
  getCommand,
  getPanier,
  removeCommand,
  removePanier,
  saveCommand,
  savePanier,
  getPlatformLanguage,
  saveSelectedCountryProduct,
  saveSelectedServiceProduct,
} from "../../modules/GestionStorage";
import auth from "@react-native-firebase/auth";
import Plane from "../../assets/images/plane.png";
import Boat from "../../assets/images/boat.png";
import VentePrivee from "../../assets/images/cart.png";
import DemandDAchat from "../../assets/images/d'achat.png";
import {
  afficherMessageProduitServiceDifferent,
  afficherMessageProduitServiceDifferentCommand,
} from "../../modules/RegleGestion";
import { useBag } from "../../modules/BagContext";
import Toast from "react-native-toast-message";
import AntDesign from "react-native-vector-icons/AntDesign";
import { HeaderActions } from "../../components/HeaderActions";
import { useFocusEffect } from "@react-navigation/native";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
const CommandScreen = (props) => {
  const { setBagCount, bagCount } = useBag();

  const [CommandesEnCours, setCommandesEnCours] = useState([]);
  const [CommandesPrecedentes, setCommandesPrecedentes] = useState([]);
  const [CommandProducts, setCommandProducts] = useState([]);
  const [CommandData, setCommandData] = useState([]);
  const [PayLivraison, setPaysLivraison] = useState([]);
  const [Loader, setLoader] = useState(true);
  const [PlatformLanguage, setPlatformLanguage] = useState("fr");

  const { t, i18n } = useTranslation();
  let returnButt = props.route.params;
  returnButt = returnButt ? returnButt.pageForm : false;

  async function fetchValue() {
    setLoader(true);

    // Language
    const currentLanguage = await getPlatformLanguage();
    setPlatformLanguage(currentLanguage);

    try {
      const user = auth().currentUser;

      const response = await axiosInstance.get("/commandes/" + user.uid);
      let dataEnCours = [];
      let dataPrecedents = [];
      let commandProduct = [];

      response.data.forEach(function (commande) {
        {
          commande.createdAt = formatDate(commande.createdAt);
        }

        let product = commande.commandeProducts[0]
          ? commande.commandeProducts[0].product
          : null;
        let productSpecificites = product ? product.productSpecificites : null;
        let productService = commande.service;
        if (productSpecificites) {
          pays = productSpecificites[0] ? productSpecificites[0].pays : null;

          if (pays) {
            productService = pays.service.nomEN;
          }
        }

        commande["serviceEN"] = productService;

        if (
          "disponible" == commande.statut.toLowerCase() ||
          "livrée" == commande.statut.toLowerCase() ||
          "annulée" == commande.statut.toLowerCase()
        ) {
          dataPrecedents.push(commande);
          commandProduct.push(commande.commandeProducts);
        } else {
          commandProduct.push(commande.commandeProducts);
          dataEnCours.push(commande);
        }
      });

      setCommandesEnCours(dataEnCours);

      setCommandesPrecedentes(dataPrecedents);

      setCommandProducts(commandProduct);

      setLoader(false);
    } catch (erreur) {
      console.log("commande fetch error", erreur);
    }
  }
  function formatDate(dateString) {
    const lg = t("LG").toUpperCase();
    if (!dateString) {
      return dateString;
    }
    const arr = dateString.split("/");
    // Vérifier si la date est dans un format valide
    if (arr.length !== 3) {
      console.error("Format de date invalide");
      return dateString;
    }
    console.log(arr);

    // Déterminer si le format d'entrée est MM/JJ/AAAA ou JJ/MM/AAAA
    const isMonthFirst = parseInt(arr[0]) <= 12;

    let day, month, year;
    if (isMonthFirst) {
      [month, day, year] = arr;
    } else {
      [day, month, year] = arr;
    }

    console.log(`Jour: ${day}, Mois: ${month}, Année: ${year}`);

    switch (lg) {
      case "FR":
        // Format français : JJ/MM/AAAA
        return `${day}/${month}/${year}`;
      case "EN":
        // Format anglais : MM/DD/YYYY
        return `${month}/${day}/${year}`;
      default:
        console.warn("Langue non reconnue, utilisation du format par défaut");
        return dateString;
    }
  }

  async function fecthPays(item) {
    setLoader(true);
    try {
      const response = await axiosInstance.get("/pays/" + item.paysLivraisonId);

      setPaysLivraison(response.data);
    } catch (error) {
      console.log(error);
    }
    setLoader(false);
  }

  useFocusEffect(
    useCallback(() => {
      if (returnButt === "reload") {
        setLoader(true);
        fetchValue();
      } else {
        fetchValue();
      }
    }, [])
  );

  const handleCartLogin = async (product) => {
    try {
      setBagCount(0);
      await removePanier();

      const paysLivraisonId = product.paysLivraisonId;
      const service = product.service;

      if (service !== "Ventes Privées") {
        // Ajouter directement au panier sans vérification pour les services autres que Ventes Privées
        let responseCart = handleCart(product);
        setBagCount(product.commandeProducts.length);

        if (responseCart) {
          showSuccessMessage();
          props.navigation.navigate("CartBag");
        }
      } else {
        // Logique existante pour Ventes Privées avec vérification de stock
        const stocks = product.commandeProducts.map((item) => ({
          id: item.stockId,
          service: item?.product?.productSpecificites[0]?.pays?.service?.id,
        }));

        const stockResponse = await axiosInstance.post(
          "/stocks/verifications/products",
          {
            paysLivraison: paysLivraisonId,
            stocks: stocks,
          }
        );

        const availableProducts = product.commandeProducts.filter((item) => {
          const stockInfo = stockResponse.data.find(
            (s) => s.id === item.stockId
          );
          return (
            stockInfo &&
            stockInfo.stock > 0 &&
            stockInfo.stock >= parseInt(item.quantite)
          );
        });

        if (availableProducts.length === 0) {
          showErrorMessage();
          return;
        }

        let responseCart = handleCart({
          ...product,
          commandeProducts: availableProducts,
        });
        setBagCount(availableProducts.length);

        if (responseCart) {
          if (product.commandeProducts.length !== availableProducts.length) {
            showSuccessMessageModif();
          } else {
            showSuccessMessage();
          }
          props.navigation.navigate("CartBag");
        }
      }
    } catch (e) {
      console.error("Erreur lors de l'ajout au panier:", e);
      showErrorMessage(t("Erreur lors de l'ajout au panier"));
    }
  };

  // Fonctions auxiliaires pour afficher les messages
  const showSuccessMessage = () => {
    const message = t("Ajouté au panier avec succès");
    if (Platform.OS === "ios") {
      Toast.show({ type: "success", text1: t("Succès"), text2: message });
    } else {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    }
  };

  const showSuccessMessageModif = () => {
    const message = t(
      "certains produits n’ont pas été ajoutés pour problème de stock"
    );
    if (Platform.OS === "ios") {
      Toast.show({ type: "success", text1: t("Succès"), text2: message });
    } else {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    }
  };

  const showErrorMessage = (
    message = t("Rupture de stock : produit(s) non ajouté(s) au panier")
  ) => {
    if (Platform.OS === "ios") {
      Toast.show({ type: "error", text1: t("Erreur"), text2: message });
    } else {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    }
  };

  const addAttributes = (obj) => {
    if (typeof obj !== "object" || obj === null) return obj;

    if (Array.isArray(obj)) {
      return obj.map(addAttributes);
    }

    const newObj = { ...obj };

    for (const [key, value] of Object.entries(obj)) {
      if (key === "attributs") {
        newObj.attributes = { ...value }; // Ajoute 'attributes' avec le même contenu que 'attributs'
      }
      newObj[key] = addAttributes(value);
    }

    return newObj;
  };

  const renameAttributs = (obj) => {
    if (typeof obj !== "object" || obj === null) return obj;

    if (Array.isArray(obj)) {
      return obj.map(renameAttributs);
    }

    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key === "attributs" ? "attributes" : key,
        renameAttributs(value),
      ])
    );
  };

  const handleCart = async (item) => {
    await saveSelectedCountryProduct(item.paysLivraisonId);
    await saveSelectedServiceProduct(item.service);

    let CatProducts = [];
    let match = false;

    // const data = selected[product.id];

    console.log(JSON.stringify(item), "item23332233232");
    const transformedItem = addAttributes(item);

    const obj = {
      ID: (Math.random() + 1).toString(36).substring(7),
      product: transformedItem.commandeProducts,
      paysLivraison: item.paysLivraisonId,
      service: item.service,
      totalPrice: item.totalPrice,
      remise: item.remise,
      fraisDouane: item.fraisDouane,
      tva: item.tva,
      uuid: item.uuid,
      attributes: item?.commandProducts?.attributs,
    };

    CatProducts.push(obj);
    let basketData = await getCommand();
    let success = false;

    if (basketData.length === 0) {
      await saveCommand(CatProducts);
      showSuccessMessage(t("Ajouter au panier avec succès"));
      setBagCount(item.commandeProducts.length);
      success = true;
    } else {
      match = basketData.some((ls) => ls.uuid === obj.uuid);

      if (match) {
        showErrorMessage(t("Cette commande a déjà été ajoutée"));
      } else {
        basketData.push(obj);
        await saveCommand(basketData);
        showSuccessMessage(t("Ajouter au panier avec succès"));
        setBagCount((prev) => prev + item.commandeProducts.length);
        success = true;
      }
    }

    if (success) {
      console.log(JSON.stringify(item), "item23332233232");
      // props.navigation.navigate('CartBag');
    }

    return success;
  };

  const handleCommandeClick = (commandeId) => {
    props.navigation.navigate("DetailCommandeScreen", { commandeId });
  };

  const handleCommandDetail = (commandeId, PayLivraisonId) => {
    props.navigation.navigate("ColiSuivi", { commandeId, PayLivraisonId });
  };

  const Item = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleCommandDetail(item.id, item.paysLivraisonId)}
      style={{
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingTop: 14,
        paddingBottom: 25,
        paddingRight: 8,
        paddingLeft: 14,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={styles.textRow}>
            <Text style={styles.NameTxt}>
              {"Fret par avion" == item.service ? (
                <View
                  style={{
                    padding: 15,
                    backgroundColor: "#FFF3F3",
                    borderRadius: 10,
                  }}
                >
                  <Image source={Plane} />
                </View>
              ) : (
                <></>
              )}
              {"Fret par bateau" == item.service ? (
                <View
                  style={{
                    padding: 15,
                    backgroundColor: "#FFF3F3",
                    borderRadius: 10,
                  }}
                >
                  <Image source={Boat} />
                </View>
              ) : (
                <></>
              )}
              {"Ventes Privées" == item.service ? (
                <View
                  style={{
                    padding: 15,
                    backgroundColor: "#FFF3F3",
                    borderRadius: 10,
                  }}
                >
                  <Image
                    source={VentePrivee}
                    style={{
                      width: windowWidth * 0.08,
                      height: windowWidth * 0.08,
                    }}
                  />
                </View>
              ) : (
                <></>
              )}
              {"Demandes d'achat" == item.service ? (
                <View
                  style={{
                    padding: 15,
                    backgroundColor: "#FFF3F3",
                    borderRadius: 10,
                  }}
                >
                  <Image
                    source={DemandDAchat}
                    style={{
                      width: windowWidth * 0.08,
                      height: windowWidth * 0.08,
                    }}
                  />
                </View>
              ) : (
                <></>
              )}
            </Text>
          </View>

          <View>
            <Text
              style={{
                fontSize: 13,
                color: "#000",
                fontFamily: "Poppins-SemiBold",
                letterSpacing: 1,
              }}
            >
              {item.service
                ? "fr" == PlatformLanguage
                  ? item.service
                  : item.serviceEN
                : t("Fret par avion")}
            </Text>

            <Text
              style={{
                fontSize: 14,
                color: "#292625",
                fontFamily: "Poppins-Medium",
                letterSpacing: 1,
              }}
            >
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
        <View style={{ paddingRight: 22 }}>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Poppins-SemiBold",
              color: "#498BF0",
            }}
          >
            {("en" == PlatformLanguage ? "€ " : "") +
              parseFloat(item.totalPrice).toFixed(2) +
              ("fr" == PlatformLanguage ? " €" : "")}
          </Text>
        </View>
      </View>

      <View style={{ marginTop: 20 }}>
        {item.statut === "A payer" ||
        item.statut === "A payer" ||
        item.statut === "Payée" ||
        item.statut === "payée" ||
        item.statut === "Cotation demandée" ||
        item.statut === "a payer" ? (
          <View style={{ width: windowWidth * 1.5, alignSelf: "center" }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 50,
                  backgroundColor: "#fff",
                  borderWidth: 6,
                  borderColor: "#2BA6E9",
                }}
              ></View>
              <View
                style={{
                  width: 70,
                  height: 2,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#F2F2F2",
                }}
              ></View>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 50,
                  backgroundColor: "#F2F2F2",
                  borderWidth: 4,
                  borderColor: "#F2F2F2",
                }}
              ></View>
              <View
                style={{
                  width: 70,
                  height: 2,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#F2F2F2",
                }}
              ></View>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 50,
                  backgroundColor: "#F2F2F2",
                  borderWidth: 4,
                  borderColor: "#F2F2F2",
                }}
              ></View>
              <View
                style={{
                  width: 70,
                  height: 2,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#F2F2F2",
                }}
              ></View>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 50,
                  backgroundColor: "#F2F2F2",
                  borderWidth: 4,
                  borderColor: "#F2F2F2",
                }}
              ></View>
              <View
                style={{
                  width: 70,
                  height: 2,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#F2F2F2",
                }}
              ></View>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 50,
                  backgroundColor: "#F2F2F2",
                  borderWidth: 4,
                  borderColor: "#F2F2F2",
                }}
              ></View>
            </View>
          </View>
        ) : (
          <></>
        )}
        {item.statut === "chez le transporteur" ||
        item.statut === "en cours de préparation" ||
        item.statut === "commande préparée" ? (
          <View style={{ width: windowWidth * 1.5, alignSelf: "center" }}>
            {/* <StepIndicator
                      customStyles={customStyles}
                      currentPosition={5}
                      stepCount={5}
                  /> */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 50,
                  backgroundColor: "#F2F2F2",
                  borderWidth: 6,
                  borderColor: "#2BA6E9",
                }}
              ></View>
              <View
                style={{
                  width: 70,
                  height: 2,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#2BA6E9",
                }}
              ></View>
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 50,
                  backgroundColor: "#fff",
                  borderWidth: 4,
                  borderColor: "#2BA6E9",
                }}
              ></View>
              <View
                style={{
                  width: 70,
                  height: 2,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#F2F2F2",
                }}
              ></View>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 50,
                  backgroundColor: "#F2F2F2",
                  borderWidth: 4,
                  borderColor: "#F2F2F2",
                }}
              ></View>
              <View
                style={{
                  width: 70,
                  height: 2,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#F2F2F2",
                }}
              ></View>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 50,
                  backgroundColor: "#F2F2F2",
                  borderWidth: 4,
                  borderColor: "#F2F2F2",
                }}
              ></View>
              <View
                style={{
                  width: 70,
                  height: 2,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#F2F2F2",
                }}
              ></View>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 50,
                  backgroundColor: "#F2F2F2",
                  borderWidth: 4,
                  borderColor: "#F2F2F2",
                }}
              ></View>
            </View>
          </View>
        ) : (
          <></>
        )}

        {item.statut === "Expédiée" ? (
          <View style={{ width: windowWidth * 1.5, alignSelf: "center" }}>
            {/* <StepIndicator
                      customStyles={customStyles}
                      currentPosition={5}
                      stepCount={5}
                  /> */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 50,
                  backgroundColor: "#2BA6E9",
                  borderWidth: 6,
                  borderColor: "#2BA6E9",
                }}
              ></View>
              <View
                style={{
                  width: 70,
                  height: 2,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#2BA6E9",
                }}
              ></View>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 50,
                  backgroundColor: "#2BA6E9",
                  borderWidth: 4,
                  borderColor: "#2BA6E9",
                }}
              ></View>
              <View
                style={{
                  width: 70,
                  height: 2,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#2BA6E9",
                }}
              ></View>
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 50,
                  backgroundColor: "#fff",
                  borderWidth: 4,
                  borderColor: "#2BA6E9",
                }}
              ></View>
              <View
                style={{
                  width: 70,
                  height: 2,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#F2F2F2",
                }}
              ></View>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 50,
                  backgroundColor: "#F2F2F2",
                  borderWidth: 4,
                  borderColor: "#F2F2F2",
                }}
              ></View>
              <View
                style={{
                  width: 70,
                  height: 2,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#F2F2F2",
                }}
              ></View>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 50,
                  backgroundColor: "#F2F2F2",
                  borderWidth: 4,
                  borderColor: "#F2F2F2",
                }}
              ></View>
            </View>
          </View>
        ) : (
          <></>
        )}
        {item.statut === "En transit" ? (
          <View style={{ width: windowWidth * 1.5, alignSelf: "center" }}>
            {/* <StepIndicator
                      customStyles={customStyles}
                      currentPosition={5}
                      stepCount={5}
                  /> */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 50,
                  backgroundColor: "#2BA6E9",
                  borderWidth: 6,
                  borderColor: "#2BA6E9",
                }}
              ></View>
              <View
                style={{
                  width: 70,
                  height: 2,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#2BA6E9",
                }}
              ></View>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 50,
                  backgroundColor: "#2BA6E9",
                  borderWidth: 4,
                  borderColor: "#2BA6E9",
                }}
              ></View>
              <View
                style={{
                  width: 70,
                  height: 2,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#2BA6E9",
                }}
              ></View>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 50,
                  backgroundColor: "#2BA6E9",
                  borderWidth: 4,
                  borderColor: "#2BA6E9",
                }}
              ></View>
              <View
                style={{
                  width: 70,
                  height: 2,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#2BA6E9",
                }}
              ></View>
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 50,
                  backgroundColor: "#fff",
                  borderWidth: 4,
                  borderColor: "#2BA6E9",
                }}
              ></View>
              <View
                style={{
                  width: 70,
                  height: 2,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#F2F2F2",
                }}
              ></View>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 50,
                  backgroundColor: "#F2F2F2",
                  borderWidth: 4,
                  borderColor: "#F2F2F2",
                }}
              ></View>
            </View>
          </View>
        ) : (
          <></>
        )}
        {(item.statut === "disponible en point relais" ||
          item.statut === "Commande livrée" ||
          item.statut === "Commande retournée" ||
          item.statut === "Commande annulée") && (
          <View style={{ width: windowWidth * 1.5, alignSelf: "center" }}>
            {/* <StepIndicator
                      customStyles={customStyles}
                      currentPosition={5}
                      stepCount={5}
                  /> */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 50,
                  backgroundColor: "#2BA6E9",
                  borderWidth: 4,
                  borderColor: "#2BA6E9",
                }}
              ></View>
              <View
                style={{
                  width: 70,
                  height: 2,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#2BA6E9",
                }}
              ></View>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 50,
                  backgroundColor: "#2BA6E9",
                  borderWidth: 4,
                  borderColor: "#2BA6E9",
                }}
              ></View>
              <View
                style={{
                  width: 70,
                  height: 2,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#2BA6E9",
                }}
              ></View>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 50,
                  backgroundColor: "#2BA6E9",
                  borderWidth: 4,
                  borderColor: "#2BA6E9",
                }}
              ></View>
              <View
                style={{
                  width: 70,
                  height: 2,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#2BA6E9",
                }}
              ></View>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 50,
                  backgroundColor: "#2BA6E9",
                  borderWidth: 6,
                  borderColor: "#2BA6E9",
                }}
              ></View>
              <View
                style={{
                  width: 70,
                  height: 2,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#2BA6E9",
                }}
              ></View>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 50,
                  backgroundColor: "#2BA6E9",
                  borderWidth: 4,
                  borderColor: "#2BA6E9",
                }}
              ></View>
            </View>
          </View>
        )}
      </View>

      <View style={{ marginTop: 20 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TouchableOpacity>
            {item.datePaiement != null ? (
              <Text
                style={[
                  t(item.statut).length > 15
                    ? { fontSize: 11 }
                    : { fontSize: 12 },
                  { color: "#292625", fontFamily: "Poppins-Medium" },
                ]}
              >
                {t(item.statut).length > 15
                  ? t(item.statut).substring(0, 15 - 3) + "..."
                  : t(item.statut)}
              </Text>
            ) : (
              <Text
                style={[
                  t(item.statut).length > 15
                    ? { fontSize: 11 }
                    : { fontSize: 12 },
                  { color: "#292625", fontFamily: "Poppins-Medium" },
                ]}
              >
                {item.statut.toLowerCase() == "payée" ||
                item.statut.toLowerCase() == "a payer" ? (
                  item.statut.toLowerCase() == "a payer" ? (
                    t("A payer")
                  ) : (
                    t("Payée")
                  )
                ) : (
                  <>
                    {t(item.statut).length > 15
                      ? t(item.statut).substring(0, 18 - 3) + "..."
                      : t(item.statut)}
                  </>
                )}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log("Test")}>
            {/* <Button title={t('commander à nouveau')} navigation={() => handleCartLogin(item)}/> */}
            {/* <TouchableOpacity
              onPress={() => handleCartLogin(item)}
              style={[
                t(item.statut).length > 15
                  ? {paddingVertical: 6, paddingHorizontal: 20}
                  : {paddingVertical: 8, paddingHorizontal: 22},
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#4E8FDA',
                  borderRadius: 25,
                },
              ]}>
              <Text
                style={[
                  t(item.statut).length > 15 ? {fontSize: 10} : {fontSize: 12},
                  {fontFamily: 'Poppins-Medium', color: '#fff'},
                ]}>
                {t('commander à nouveau')}
              </Text>
            </TouchableOpacity> */}
            {item.showPaiementButton &&
              item.statut.toLowerCase() == "a payer" &&
              item.totalPaye < item.totalPrice && (
                <TouchableOpacity
                  onPress={() =>
                    handleCommandDetail(item.id, item.paysLivraisonId)
                  }
                  style={[
                    t(item.statut).length > 15
                      ? { paddingVertical: 6, paddingHorizontal: 20 }
                      : { paddingVertical: 8, paddingHorizontal: 22 },
                    {
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#4E8FDA",
                      borderRadius: 25,
                    },
                  ]}
                >
                  <Text
                    style={[
                      t(item.statut).length > 15
                        ? { fontSize: 10 }
                        : { fontSize: 12 },
                      { fontFamily: "Poppins-Medium", color: "#fff" },
                    ]}
                  >
                    {t("passer au paiement")}
                  </Text>
                </TouchableOpacity>
              )}
          </TouchableOpacity>
          <TouchableOpacity
            key={item.id}
            onPress={() => handleCommandeClick(item.id)}
          >
            <Text
              style={[
                t(item.statut).length > 15
                  ? { fontSize: 14 }
                  : { fontSize: 14 },
                {
                  color: "#292625",
                  fontFamily: "Poppins-Regular",
                  textDecorationLine: "underline",
                },
              ]}
            >
              {t("Suivi colis")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (true === Loader) {
    return (
      <View style={{ justifyContent: "center", flex: 1 }}>
        <ActivityIndicator size={"large"} color="#3292E0" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <HeaderActions
        navigation={() => {
          const { navigation } = props;

          // Récupérer l'état de navigation actuel
          const routes = navigation.getState().routes;

          // Vérifiez si l'écran précédent est ResumeCardScreen et celui avant CommandeScreen
          const previousRoute = routes[routes.length - 1]; // ResumeCardScreen
          const secondPreviousRoute = routes[routes.length - 2]; // CommandeScreen

          if (
            previousRoute.name === "CommandeScreen" &&
            secondPreviousRoute.name === "ResumeCardScreen"
          ) {
            // Si l'écran précédent est ResumeCardScreen et celui d'avant est CommandeScreen, naviguez vers Profile
            navigation.navigate("Profile");
          } else {
            // Sinon, revenez à l'écran précédent
            navigation.goBack();
          }
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ flex: 1, marginBottom: 50 }}>
          <View style={{ marginTop: 24, marginBottom: 15 }}>
            <Text
              style={{
                fontFamily: "Poppins-SemiBold",
                fontSize: 16,
                color: "#000",
                textAlign: "center",
              }}
            >
              {t("Commandes en cours")}
            </Text>
          </View>

          <View style={{ paddingHorizontal: 8 }}>
            <View style={{ flexDirection: "column", gap: 20 }}>
              {CommandesEnCours.length > 0 ? (
                CommandesEnCours.map((item) => (
                  <Item item={item} key={item.id} />
                ))
              ) : (
                <View style={{ paddingVertical: 20 }}>
                  <Text style={{ textAlign: "center", color: "#999" }}>
                    {t("Pas de commandes")}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={{ marginTop: 24 }}>
            <Text
              style={{
                fontFamily: "Poppins-SemiBold",
                fontSize: 16,
                color: "#000",
                textAlign: "center",
              }}
            >
              {t("Commandes précédentes")}
            </Text>
          </View>

          <View style={{ paddingHorizontal: 8 }}>
            <View style={{ flexDirection: "column", gap: 20 }}>
              {CommandesPrecedentes.length > 0 ? (
                CommandesPrecedentes.map((item) => (
                  <Item item={item} key={item.id} />
                ))
              ) : (
                <View style={{ paddingVertical: 20 }}>
                  <Text style={{ textAlign: "center", color: "#999" }}>
                    {t("Pas de commandes")}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //     justifyContent: 'center',
    alignItems: "center",
    backgroundColor: "#fff",
  },
  orderDetailsContainer: {
    backgroundColor: "#fff",
    width: windowWidth * 0.9,
    height: "auto",
    alignSelf: "center",
    elevation: 3,
    borderRadius: 10,
    justifyContent: "space-around",
    marginTop: windowHeight * 0.03,
  },
  TextContainer: {
    // backgroundColor: 'red',
    height: "auto",
    //width: windowWidth * 0.45,
    alignItems: "flex-start",
    //justifyContent: 'space-evenly',
    marginTop: 10,
  },
  NameTxt: {
    // backgroundColor: 'green',
    // width: windowWidth * 0.45,
    fontFamily: "Roboto-Regular",
    fontSize: 12,
    color: "#000",
    marginTop: 5,
  },
  textPrice: {
    marginLeft: windowWidth * 0.3,
  },
  PriceAndDateText: {
    // backgroundColor: 'gold',
    width: windowWidth * 0.3,
    fontFamily: "Roboto-Regular",
    fontSize: 10,
    color: "#000",
  },
  textRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  AllTextContainer: {
    // backgroundColor: 'gold',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    height: "auto",
  },
  boxContainer: {
    backgroundColor: "#feafc9",
    width: 100,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    borderRadius: 7,
  },
  boxText: {
    fontFamily: "Roboto-Bold",
    fontSize: 13,
    color: "#fff",
  },
  orderAgainContainer: {
    backgroundColor: "#3292E0",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    width: windowWidth * 0.7,
    height: windowHeight * 0.05,
    borderRadius: 50,
    marginTop: 10,
    marginBottom: 12,
  },
  TExtstyle: {
    fontFamily: "Roboto-Regular",
    fontSize: 13,
    color: "#fff",
  },
  containerFlatelist: {
    // flex: 1,
    //         justifyContent: 'space-around',
    alignItems: "center",
    backgroundColor: "#fff",
    width: windowWidth * 1.0,
    height: windowHeight * 1.0,
  },
  titleText: {
    color: "#000",
    fontSize: 18,
    fontFamily: "Roboto-Bold",
  },
});

export default CommandScreen;
