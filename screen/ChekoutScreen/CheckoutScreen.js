import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
  Dimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "react-native-vector-icons/Feather";
import Entypo from "react-native-vector-icons/Entypo";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import France from "../../assets/images/france.png";
import CoteIvoire from "../../assets/images/cote_ivoire.png";
import SmallEarth from "../../assets/images/small_earth.png";
import Stepper from "../Stepper";
import { productCart } from "../../constant/data";
import Button, { ButtonPrix } from "../../components/Button";
import { useIsFocused } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import auth from "@react-native-firebase/auth";
import {
  getCommand,
  getDepotValues,
  getLivraisonValues,
  getPanier,
  getPlatformLanguage,
  getRemiseUsed,
  getSelectedCountry,
  getSelectedService,
  getServices,
  removeCommand,
  removePanier,
  saveAdresseIdFacturation,
  saveCartAvoir,
  savePrixFinalPanier,
  saveSelectedCountry,
  saveSelectedService,
  saveLivraisonPrices,
} from "../../modules/GestionStorage";
import axiosInstance from "../../axiosInstance";
import {
  calculFraisLivraison,
  calculFraisLivraisonCommand,
  calculProductPrices,
  calculProductPricesCommand,
} from "../../modules/CalculPrix";
import { Dropdown } from "react-native-element-dropdown";
import Icon from "react-native-vector-icons/Feather";
import { getImageType } from "../../modules/TraitementImage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ServiceHeader from "../../components/ServiceHeader";
import styles from "./styles";
import Checkbox from "expo-checkbox";
import {
  buildCommande,
  buildGetCommande,
} from "../../modules/GestionFinalisationPanier";
import { useBag } from "../../modules/BagContext";
import DropDownPicker from "react-native-dropdown-picker";
import { formatEuroPrice } from "../../modules/DateFinanceUtils";
import BoldTranslatedText from "../../modules/BoldText";
import { formatDateToFrench } from "../../components/formatDateToFrench";

const CheckoutScreen = (props) => {
  var isFocused = useIsFocused();
  const { setBagCount, bagCount } = useBag();

  const { t, i18n } = useTranslation();
  const [Loader, setLoader] = useState(false);
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
  const [modeLivraison, setModeLivraison] = useState(null);

  const [CartTotalPriceSansRemiseAvoir, setCartTotalPriceSansRemiseAvoir] =
    useState(0);
  const [Language, setLanguage] = useState("fr");
  const [LivraisonData, setLivraisonData] = useState({});
  const [DepotData, setDepotData] = useState({});
  const [AdresseFacturationDifferente, setAdresseFacturationDifferente] =
    useState(false);
  const [Adresses, setAdresses] = useState([]);
  const [AdresseFacturationId, setAdresseFacturationId] = useState("");
  const [NomFacturation, setNomFacturation] = useState("");
  const [TVA, setTVA] = useState(0);
  const [LoadingPayment, setLoadingPayment] = useState(false);
  const [prixTotalLivraison, setPrixTotalLivraison] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isValue, setIsValue] = useState("");
  const [paysCommand, setPayCommand] = useState([]);
  const [CommandBasket, setCommandBasket] = useState([]);
  const [ServiceCommand, setServiceCommand] = useState([]);
  const [CartCommand, setCartCommand] = useState([]);
  const [CommandList, setCommandeList] = useState([]);
  const [PrixAmount, setPrixAmount] = useState(0);
  const [livraisonDelaiMin, setLivraisonDelaiMin] = useState(null);
  const [livraisonDelaiMax, setLivraisonDelaiMax] = useState(null);
  const [CommandeHasManualValidation, setCommandeHasManualValidation] =
    useState(false);
  const [user, setUser] = useState(null);

  const windowWidth = Dimensions.get("window").width;

  useEffect(() => {
    const user = auth().currentUser;
    setUser(user);
    // Pour eviter un probleme de memoire, il faut ajouter un cleanup
    let mounted = true;

    setLoader(true);

    async function fetchValue() {
      try {
        let validationManuelle = false;

        saveCartAvoir(0);

        // Email

        // Language
        const currentLanguage = await getPlatformLanguage();
        setLanguage(currentLanguage);

        try {
          const response = await axiosInstance.get("adresses/user/" + user.uid);

          let formatted = response.data.map((ls) => {
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

          setAdresses(formatted);

          setLoader(false);
        } catch (erreur) {
          console.log("adresse fetch error", erreur);
        }

        // Depot
        let depotValues = await getDepotValues();
        setDepotData(depotValues);

        // Prix de livraison
        let livraisonValues = await getLivraisonValues();

        setLivraisonData(livraisonValues);

        let livraisonPrice = livraisonValues.prixTotalLivraison;
        setCartLivraisonPrice(livraisonPrice ? livraisonPrice : 0);

        let livraisonMode = livraisonValues.modeLivraison;
        setModeLivraison(livraisonMode);

        let fraisDouane = livraisonValues.sommeFraisDouane;
        setSommeFraisDouane(fraisDouane);

        // Pays de livraison
        let paysLivraisonObject = await getSelectedCountry();
        setPaysLivraisonObject(paysLivraisonObject);

        // Get service
        let service = await getSelectedService();

        // Get avoir
        axiosInstance
          .get("/avoirs/active/all/" + user.uid)
          .then((response) => {
            if (response.data) {
              let data = response.data;

              let somme = 0;
              data.map(function (value) {
                somme =
                  somme +
                  parseFloat(value.montant) -
                  parseFloat(value.montantConsomme ? value.montantConsomme : 0);
              });

              if (somme > 0) {
                let formatted = [
                  {
                    label: somme.toString(),
                    value: somme,
                  },
                ];

                setAvoirs(formatted);
              }
            }

          })
          .catch(function (error) {
            console.log("error avoir", error);
          });

        // Remise
        let remiseUsed = await getRemiseUsed();

        setRemiseValue(remiseUsed.remiseValue);
        setRemiseProduct(remiseUsed.remiseProduct);
        // Recuperer les Product de Comand

        let basketCommnd = await getCommand();
        let Biulding = await buildGetCommande();

        setCommandeList(Biulding);

        let Data = [];

        if (basketCommnd.length > 0) {
          let livraisonMin = null;
          let livraisonMax = null;
          basketCommnd.forEach((item) => {
            setCartCommand(item.product);

            let product = item.product;
            let specificites = product
              ? product.productSpecificites
                ? product.productSpecificites[0]
                : null
              : null;

            if (specificites && specificites.livraison) {
              let delaiMin = specificites.livraison.delaiMin;
              let delaiMax = specificites.livraison.delaiMax;

              if (!livraisonMin || delaiMin < livraisonMin) {
                livraisonMin = delaiMin;
              }

              if (!livraisonMax || delaiMax > livraisonMax) {
                livraisonMax = delaiMax;
              }
            }

            if (item.product && item.product.validationManuelle) {
              validationManuelle = true;
            }
          });

          setLivraisonDelaiMin(livraisonMin);
          setLivraisonDelaiMax(livraisonMax);

          const response = await axiosInstance.get(
            "/pays/" + basketCommnd[0].paysLivraison
          );

          Data = response.data;

          setServiceCommand(Data.service);
          setPayCommand(Data);
          setCommandBasket(basketCommnd);

          await saveSelectedService(ServiceCommand);
          await saveSelectedCountry(paysCommand);
        }

        // Panier
        let basketData = await getPanier();

        if (basketData.length > 0) {
          basketData.forEach((item) => {
            if (item.product && item.product.validationManuelle) {
              validationManuelle = true;
            }
          });
        }

        setCommandeHasManualValidation(validationManuelle);

        if (basketData.length > 0) {
          let livraisonMin = null;
          let livraisonMax = null;
          basketData.forEach((commande) => {
            let product = commande.product;
            let specificites = product ? product.productSpecificites[0] : null;

            if (specificites && specificites.livraison) {
              let delaiMin = specificites.livraison.delaiMin;
              let delaiMax = specificites.livraison.delaiMax;

              if (!livraisonMin || delaiMin > livraisonMin) {
                livraisonMin = delaiMin;
              }

              if (!livraisonMax || delaiMax > livraisonMax) {
                livraisonMax = delaiMax;
              }
            }
          });

          setLivraisonDelaiMin(livraisonMin);
          setLivraisonDelaiMax(livraisonMax);

          setCartProducts(basketData);

          // Prend tjr le service du panier
          let cartService = basketData[0].service;

          if (cartService != service.code) {
            let services = await AsyncStorage.getItem("services");
            services = JSON.parse(services);

            var newData = services.filter((ls) => {
              if (ls.code == cartService) {
                return ls;
              }
            });

            service = newData[0];

            await saveSelectedService(service);
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

          if (cartService.code != service.code) {
            let services = await getServices();

            var newData = services.filter((ls) => {
              if (ls.code == cartService.code) {
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

        let prixLivraison = 0;
        /*if (basketData.length == 0) {
          prixLivraison = calculFraisLivraisonCommand(basketCommnd);
        } else {
          prixLivraison = calculFraisLivraison(basketData);
        }
        */

        setPrixTotalLivraison(livraisonValues.supplement);

        setService(service);

        // Calcul TVA
        let sommeTva = 0;
        basketData.forEach(function (item) {
          let tva = item.product.productSpecificites[0]
            ? item.product.productSpecificites[0].tva
            : 0;
          tva = parseFloat(tva);
          tva = isNaN(tva) ? 0 : tva;

          let prix = parseFloat(item.Price);
          prix = isNaN(prix) ? 0 : prix;

          let quantite = parseInt(item.quantite);
          quantite = isNaN(quantite) ? 1 : quantite;

          // Prix quantite
          let prixQuantite = prix * quantite;

          sommeTva = sommeTva + (prixQuantite * tva) / 100;
        });

        sommeTva = sommeTva.toFixed(2);
        setTVA(sommeTva);

        setLoader(false);
      } catch (error) {
        console.log("error", error);
      }
    }

    fetchValue();

    return (mounted) => (mounted = false);
  }, [isFocused]);

  // Paiement
  async function NavigateToPayment(totalPrice, remiseTotal) {
    await savePrixFinalPanier(
      totalPrice,
      CartTotalPriceSansRemiseAvoir,
      remiseTotal,
      TVA
    );

    let adresseFacturation = AdresseFacturationId;
    let type = "user_adresse";

    if (!adresseFacturation) {
      adresseFacturation =
        "relais" == LivraisonData.livraisonMode
          ? LivraisonData.livraisonRelaisId
          : LivraisonData.livraisonAdresseId;

      type =
        "relais" == LivraisonData.livraisonMode ? "livraison" : "user_adresse";

      setAdresseFacturationId(adresseFacturation);
    }

    await saveAdresseIdFacturation(adresseFacturation, NomFacturation, type);

    if ("demandes-d-achat" == Service.code) {
      let statut = "Cotation demandée";

      return Alert.alert(
        t("Validation"),
        t(
          "Votre commande va être transmise pour cotation. Validez-vous la commande ?"
        ),
        [
          {
            text: t("Annuler"),
            style: "cancel",
          },
          {
            text: t("OK"),
            onPress: () => validateCommande(statut, remiseTotal),
          },
        ]
      );
    } else if (CommandeHasManualValidation) {
      let statut = "Cotation commande manuelle";

      return Alert.alert(
        t("Validation"),
        t("Nous allons vous contacter pour finaliser votre commande.") +
          " " +
          t("Cliquez sur OK pour valider"),
        [
          {
            text: t("Annuler"),
            style: "cancel",
          },
          {
            text: t("OK"),
            onPress: () => validateCommande(statut, remiseTotal),
          },
        ]
      );
    }

    if (totalPrice == 0) {
      let statut = "Payée";

      validateCommande(statut, remiseTotal);

      return;
    }

    saveLivraisonPrices(prixTotalLivraison, "", sommeFraisDouane);
    props.navigation.navigate("AddCardScreen");
  }

  const NavigateToUserAddress = () => {
    props.navigation.navigate("AddAdresseScreen", {
      pageFrom: "summary",
    });
  };

  // Valider la commande
  async function validateCommande(statut, remiseTotal) {
    setLoadingPayment(true);

    let avoir = 0;

    if (AvoirValue) {
      let remain = CartTotalPriceSansRemiseAvoir - AvoirValue;

      if (remain < 0) {
        avoir = CartTotalPriceSansRemiseAvoir;
      } else {
        avoir = AvoirValue;
      }
    }

    let data = [];

    let basket = await getPanier();
    let BasketCommand = await getCommand();

    if (basket.length == 0) {
      data = await buildGetCommande();
    } else {
      data = await buildCommande();
    }

    let DataProduct = [];
    BasketCommand.forEach((item) => {
      DataProduct.push(item.product[0].product);
    });
    let prices = calculProductPricesCommand(
      CartCommand,
      RemiseValue,
      RemiseProduct
    );

    let priceDemande = 0;
    let priceDeomandCammand = 0;

    cartProducts.map((item) => {
      priceDemande = parseFloat(priceDemande) + parseFloat(item.Price);
    });

    CartCommand.map((item) => {
      priceDeomandCammand =
        parseFloat(priceDeomandCammand) + parseFloat(item.prixAchat);
    });
    data.commande.statut = statut;

    data.commande.totalPaye = 0;
    if (Service.code == "demandes-d-achat") {
      if (basket.length == 0) {
        data.commande.totalPrice = priceDeomandCammand;
      } else {
        data.commande.totalPrice = priceDemande;
      }
    } else {
      data.commande.totalPrice = prices.totalPrix;
    }

    if ("Payée" == statut) {
      data.commande.modePaiement = "Avoir";
      data.commande.totalPaye = avoir;
      data.montantPayeEnAvoir = avoir;

      if (remiseTotal) {
        data.montantPayeEnRemise = remiseTotal;
      }
    }

    data.commande.totalPrice = PrixAmount;

    const formData = new FormData();

    formData.append("livraison", JSON.stringify(data.livraison));
    formData.append("depot", JSON.stringify(data.depot));
    formData.append("remise", JSON.stringify(data.remise));
    formData.append("avoir", avoir);
    formData.append("paysLivraison", paysLivraisonObject.id);
    formData.append("service", Service.id);
    formData.append("client", user.uid);
    formData.append("commande", JSON.stringify(data.commande));
    formData.append("products", JSON.stringify(data.products));
    formData.append("adresseFacturation", data.adresseFacturation);
    formData.append("adresseFacturationType", data.adresseFacturationType);
    formData.append("facturationNom", NomFacturation);

    let index = 0;
    data.productImages.forEach((productImage) => {
      let productId = productImage.productId;
      let image = productImage.image;

      if (image) {
        formData.append("image_" + productId + "_" + index, {
          uri: image,
          type: getImageType(image),
          name: "image_" + productId,
        });

        index++;
      }
    });

    try {
      const response = await axiosInstance.post("/commandes/new", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      removePanier();
      removeCommand();
      setBagCount(0);
      return Alert.alert(t("Succès"), t("Votre commande a été validée"), [
        {
          text: "OK",
          onPress: () => {
            props.navigation.navigate("CommandeScreen", { pageForm: "reload" });
          },
        },
      ]);
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log("Error response", error.response.data);
        console.log("Error response", error.response.status);
        console.log("Error response", error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log("request", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error", error.message);
      }
      console.log(error.config);
    }

    setLoadingPayment(false);
  }

  // Afficher les attributs
  const RenderAttribute = (props) => {
    const service = props.service;

    const product = props.product;

    if (
      "ventes-privees" == service.code ||
      "demandes-d-achat" == service.code
    ) {
      const attributeValues = product.attributes
        ? Object.values(product.attributes)
        : [];

      return (
        <View>
          <Text style={styles.WeightCalSubText}>
            {attributeValues.join(", ")}
          </Text>
          {"demandes-d-achat" == service.code ? (
            <>
              <Text style={{ marginBottom: 5 }}>
                {product.url.length > 30
                  ? product.url.substring(0, 30 - 3) + "..."
                  : product.url}
              </Text>
              <Text>
                {t("Infos complementaires")}:{" "}
                {product.informationsComplementaires}
              </Text>
            </>
          ) : (
            <></>
          )}
        </View>
      );
    }

    return (
      <Text style={styles.WeightCalSubText}>
        {t("Etat")} : {"Used" == product.stateValue ? t("Occasion") : t("Neuf")}{" "}
        {product.productValue
          ? " - " + t("Valeur") + " : " + product.productValue
          : ""}
      </Text>
    );
  };

  // Afficher les attributs
  const RenderAttributeCommand = (props) => {
    const service = props.service;

    const product = props.product;
    if (
      "ventes-privees" == service.code ||
      "demandes-d-achat" == service.code
    ) {
      const attributeValues = product.attributs
        ? Object.values(product.attributs)
        : [];

      return (
        <View>
          <Text style={styles.WeightCalSubText}>
            {attributeValues.join(", ")}
          </Text>
          {"demandes-d-achat" == service.code ? (
            <>
              <Text style={{ marginBottom: 5 }}>
                {product.url == null ? (
                  <></>
                ) : product.url.length > 30 ? (
                  product.url.substring(0, 30 - 3) + "..."
                ) : (
                  product.url
                )}
              </Text>

              <Text style={{ maxWidth: 250 }}>
                {t("Infos complementaires")}:{" "}
                {product.informationsComplementaires}
              </Text>
            </>
          ) : (
            <></>
          )}
        </View>
      );
    }

    return (
      <>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <Text style={styles.WeightCalSubText}>
            Etat : {"Used" == product.etat ? t("Used") : t("Neuf")}
          </Text>
          <Text style={[styles.WeightCalSubText]}>
            {product.valeur
              ? t("Valeur") +
                " : " +
                formatEuroPrice(product.valeur + ".00", Language)
              : ""}
          </Text>
        </View>
      </>
    );
  };

  // Afficher les produits

  const getAttributeImages = (item, Service) => {
    let { product, attributes, attributs } = item;
    if (!attributes) attributes = attributs;

    // Si le service n'est pas ventes-privees ou si le produit n'a pas d'attributs, retourner les images par défaut du produit
    if (
      Service.code !== "ventes-privees" ||
      !product.attributs ||
      product.attributs.length === 0
    ) {
      return item.ProductImage ? [{ url: item.ProductImage[0].url }] : [];
    }

    let matchingImages = [];

    // Parcourir chaque attribut du produit
    product.attributs.forEach((attr) => {
      const attributId = attr.attribut.id.toString();
      const selectedValue = attributes[attributId];
      if (selectedValue) {
        // Trouver la valeur d'attribut correspondante
        const matchingAttributeValue = attr.attributValues.find(
          (val) =>
            val.valeur === selectedValue || val.valeurEN === selectedValue
        );
        // Si une correspondance est trouvée et qu'elle a des images, les ajouter
        if (matchingAttributeValue && matchingAttributeValue.attributImages) {
          matchingImages = matchingImages.concat(
            matchingAttributeValue.attributImages.map((img) => ({
              url: img?.reference.includes("http")
                ? img.reference
                : `https://recette.godaregroup.com/api/fichiers/attribut/description/${img.reference}`,
            }))
          );
        }
      }
    });

    // Si aucune image d'attribut n'est trouvée, utiliser les images par défaut du produit
    if (matchingImages.length === 0 && item.ProductImage) {
      return [{ url: item.ProductImage[0].url }];
    }

    return matchingImages;
  };
  const RenderItem = ({ item }) => {
    let prix = 0;

    {
      Service.code == "demandes-d-achat"
        ? (prix = isNaN(parseFloat(item.Price)) ? 0 : parseFloat(item.Price))
        : (prix = isNaN(parseFloat(item.Price)) ? 0 : parseFloat(item.Price));
    }

    const attributeImages = getAttributeImages(item, Service);
    let quantite = isNaN(parseInt(item.quantite)) ? 0 : parseInt(item.quantite);

    let totalPrice =
      Service.code == "demandes-d-achat" ? prix : prix * quantite;

    return (
      <View
        style={{
          backgroundColor: "#fff",
          paddingLeft: 28,
          paddingVertical: 12,
          marginBottom: 16,
          borderRadius: 18,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
          {/* First Row */}
          <View style={{ position: "relative" }}>
            <View>
              {"ventes-privees" == Service.code ? (
                <View>
                  {item.ProductImage ? (
                    <Image
                      source={{ uri: attributeImages[0].url }}
                      resizeMode="contain"
                      style={{ width: wp(18), height: wp(28) }}
                    />
                  ) : (
                    <Text></Text>
                  )}
                </View>
              ) : (
                <View>
                  {item.image !== "" ? (
                    <Image
                      source={{ uri: item.image }}
                      resizeMode="contain"
                      style={{ width: wp(18), height: wp(28) }}
                    />
                  ) : (
                    <>
                      <View style={{ width: wp(10), height: wp(28) }}></View>
                    </>
                  )}
                </View>
              )}
            </View>
          </View>

          {/* second Row */}
          <View style={styles.secondRow}>
            <View>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Poppins-Regular",
                  color: "#000",
                  maxWidth: 190,
                }}
              >
                {"fr" == Language ? item.product.name : item.product.nameEN}
              </Text>

              {Service.code == "fret-par-avion" ||
              Service.code == "fret-par-bateau" ? (
                <View
                  style={{
                    width: "100%",
                    paddingHorizontal: 10,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                    }}
                  >
                    {/* Premier groupe : RenderAttribute */}
                    <View style={{ flex: 1, minWidth: windowWidth * 0.4 }}>
                      <RenderAttribute service={Service} product={item} />
                    </View>

                    {/* Deuxième groupe : Prix et Quantité */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      {/* Prix */}
                      <ButtonPrix
                        title={totalPrice}
                        language={Language}
                        style={{ flexShrink: 1 }}
                      />

                      {/* Quantité */}
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 25,
                          backgroundColor: "#EFEFEF",
                          borderRadius: 18,
                          minWidth: windowWidth * 0.15,
                          maxWidth: windowWidth * 0.2,
                          paddingVertical: 5,
                          paddingHorizontal: 10,
                        }}
                      >
                        <Text numberOfLines={1} ellipsizeMode="tail">
                          {quantite}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ) : (
                <>
                  {Service.code == "demandes-d-achat" ? (
                    <View
                      style={{
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: 10,
                      }}
                    >
                      <RenderAttribute service={Service} product={item} />
                      <View style={{ flexDirection: "row", gap: 10 }}>
                        <ButtonPrix title={prix} language={Language} />
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 25,
                            backgroundColor: "#EFEFEF",
                            borderRadius: 18,
                            minWidth: windowWidth * 0.15,
                            paddingVertical: 5,
                          }}
                        >
                          <Text>{quantite}</Text>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <View
                      style={{
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: 10,
                      }}
                    >
                      <RenderAttribute service={Service} product={item} />
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 10,
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <ButtonPrix title={totalPrice} language={Language} />
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 25,
                            backgroundColor: "#EFEFEF",
                            borderRadius: 18,
                            minWidth: windowWidth * 0.15,
                            paddingVertical: 5,
                          }}
                        >
                          <Text>{quantite}</Text>
                        </View>
                      </View>
                    </View>
                  )}
                </>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Afficher les produits

  const createAttributeString = (attributs) => {
    if (!attributs || typeof attributs !== "object") {
      return "";
    }

    // Obtenir toutes les valeurs de l'objet et les filtrer pour enlever les valeurs vides ou undefined
    const values = Object.values(attributs).filter(
      (value) => value && value.trim() !== ""
    );

    // Joindre toutes les valeurs avec un espace
    return values.join(", ");
  };

  const RenderItemCommand = ({ item }) => {
    // let prix = 0;

    // {
    //   Service.code == "demandes-d-achat"
    //   ?
    //   prix = isNaN(parseFloat(item.prixAchat)) ? 0 : parseFloat(item.prixAchat)
    //   :
    //   prix = isNaN(parseFloat(item.product.productSpecificites[0].prix)) ? 0 : parseFloat(item.product.productSpecificites[0].prix);
    // }

    let prix = 0;

    let ItemCommandPrice = createAttributeString(item.attributs);
    let stock = [];
    stock.push(item.product.stocks);

    const attributeImages = getAttributeImages(item, Service);

    if (Service.code == "demandes-d-achat") {
      prix = parseFloat(item.prixAchat);
    } else if (Service.code == "ventes-privees") {
      stock.forEach((item) => {
        item.map((obj) => {
          // Fonction pour normaliser et diviser une chaîne en ensemble de mots
          const normalizeAndSplit = (str) => {
            return new Set(
              str
                .toLowerCase()
                .replace(/,/g, "")
                .split(" ")
                .filter((word) => word.trim() !== "")
            );
          };

          // Normaliser et diviser obj.combinaison et ItemCommandPrice
          const combinaisonSet = normalizeAndSplit(obj.combinaison);
          const itemCommandPriceSet = normalizeAndSplit(ItemCommandPrice);

          // Vérifier si les ensembles sont égaux
          const setsAreEqual = (a, b) =>
            a.size === b.size && [...a].every((value) => b.has(value));

          if (setsAreEqual(combinaisonSet, itemCommandPriceSet)) {
            prix = parseFloat(obj.prix);
          }
        });
      });
    } else {
      prix = parseFloat(item.product.productSpecificites[0].prix);
    }
    // let quantite = isNaN(parseInt(item.quantite)) ? 0 : parseInt(item.quantite)

    // let totalPrice = prix * quantite;

    return (
      <View
        style={{
          backgroundColor: "#fff",
          paddingLeft: 28,
          paddingVertical: 12,
          marginBottom: 16,
          borderRadius: 18,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
          {/* First Row */}
          <View style={{ position: "relative" }}>
            <View>
              {"ventes-privees" == item.product.service ? (
                <>
                  {item.product.productImages != null ? (
                    <Image
                      source={{ uri: attributeImages[0]?.url }}
                      resizeMode="contain"
                      style={{ width: wp(18), height: wp(28) }}
                    />
                  ) : (
                    <>
                      <View style={{ width: wp(10), height: wp(28) }}></View>
                    </>
                  )}
                </>
              ) : (
                <>
                  {item.photo != null ? (
                    <Image
                      source={{ uri: item.photo }}
                      resizeMode="contain"
                      style={{ width: wp(18), height: wp(28) }}
                    />
                  ) : (
                    <View style={{ width: wp(10), height: wp(28) }}></View>
                  )}
                </>
              )}
            </View>
          </View>

          {/* second Row */}
          <View style={styles.secondRow}>
            <View>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Poppins-Regular",
                  color: "#000",
                  maxWidth: 190,
                }}
              >
                {"fr" == Language ? item.product.name : item.product.nameEN}
              </Text>

              {Service.code == "fret-par-avion" ||
              Service.code == "fret-par-bateau" ? (
                <View
                  style={{
                    flexDirection: "column",
                    gap: 10,
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                  }}
                >
                  <RenderAttributeCommand service={Service} product={item} />
                  <ButtonPrix title={prix} language={Language} />
                </View>
              ) : (
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 10,
                  }}
                >
                  <RenderAttributeCommand service={Service} product={item} />
                  <ButtonPrix title={prix} language={Language} />
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const items = [
    {
      label: "test",
      value: "test",
    },
  ];

  // Afficher le total
  const RenderTotal = ({ data }) => {
    let prices = calculProductPrices(data, RemiseValue, RemiseProduct);

    let remiseTotal = prices.remiseTotal;
 

    let totalPrixAvecDouaneRemiseAvoir = prices.totalPrixAvecDouaneRemiseAvoir;

    let TotalWithLivraison =
      totalPrixAvecDouaneRemiseAvoir +
      (CommandeHasManualValidation ? 0 : cartLivraisonPrice);
    TotalWithLivraison = isNaN(parseFloat(TotalWithLivraison))
      ? 0
      : parseFloat(TotalWithLivraison);

    setSommeFraisDouane(prices.sommeFraisDouane);
    let resteApayer = 0;
    let resteAvoir = 0;
    let apreRemise = 0;
    let calcuteRemise = 0;
    if (AvoirValue > TotalWithLivraison) {
      resteAvoir = AvoirValue - TotalWithLivraison;
      resteAvoir = resteAvoir.toFixed(2);
    } else {
      resteApayer = TotalWithLivraison - AvoirValue;
    }

    let subTotal = prices.totalPrix - prices.sommeFraisDouane;
    let priceWithTva = parseFloat(TVA);
    priceWithTva = isNaN(priceWithTva) ? 0 : priceWithTva;

    TotalWithLivraison = TotalWithLivraison + priceWithTva;

    TotalWithLivraison = TotalWithLivraison.toFixed(2);
    calcuteRemise = (TotalWithLivraison * remiseTotal) / 100;
    apreRemise = subTotal - remiseTotal;
    apreRemise = apreRemise.toFixed(2);
    // setCartTotalPriceSansRemiseAvoir(prices.totalPrix.toFixed(2));

    let montantApayer =
      parseFloat(apreRemise) + prixTotalLivraison + sommeFraisDouane;
    montantApayer = isNaN(parseFloat(montantApayer))
      ? 0
      : parseFloat(montantApayer);
    montantApayer = montantApayer.toFixed(2);
    setPrixAmount(montantApayer);

    resteApayer = parseFloat(montantApayer).toFixed(2);
    setCartTotalPriceSansRemiseAvoir(montantApayer);
    if (AvoirValue) {
      saveCartAvoir(AvoirValue);
      resteApayer = resteApayer - AvoirValue;
      if (resteApayer < 0) {
        resteApayer = parseFloat(0).toFixed(2);
      } else {
        resteApayer = resteApayer.toFixed(2);
      }
    }

    if (isNaN(prixTotalLivraison) || CommandeHasManualValidation) {
      setPrixTotalLivraison(0);
    }

    return (
      <View>
        <View style={{ marginTop: 13, paddingHorizontal: 12 }}>
          <View
            style={{
              backgroundColor: "#fff",
              paddingTop: 22,
              paddingHorizontal: 13,
              paddingBottom: 30,
              borderRadius: 8,
            }}
          >
            <>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: 15,
                  borderBottomWidth: 1,
                  borderColor: "#E9E9E9",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Poppins-Regular",
                    fontSize: 12,
                    color: "#000",
                    letterSpacing: 0.8,
                  }}
                >
                  {t("Sous Total")}
                </Text>
                <Text
                  style={{
                    fontFamily: "Poppins-Medium",
                    fontSize: 14,
                    color: "#262A2B",
                    letterSpacing: 0.8,
                  }}
                >
                  {formatEuroPrice(subTotal.toFixed(2), Language)}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: 15,
                  paddingTop: 19,
                  borderBottomWidth: 1,
                  borderColor: "#E9E9E9",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Poppins-Regular",
                    fontSize: 12,
                    color: "#ACB2B2",
                    letterSpacing: 0.8,
                  }}
                >
                  {t("Montant remise")}
                </Text>
                <Text
                  style={{
                    fontFamily: "Poppins-Medium",
                    fontSize: 14,
                    color: "#262A2B",
                    letterSpacing: 0.8,
                  }}
                >
                  {formatEuroPrice(
                    remiseTotal == 0.0 ? '"-"' : "-" + remiseTotal,
                    Language
                  )}
                </Text>
              </View>
              {"domicile" == modeLivraison ? (
                <View style={styles.secondContainer}>
                  <View style={styles.totalContainer}>
                    <Text style={styles.totalText}>
                      {t("Prix de livraison")}
                    </Text>
                    <Text style={styles.totalText}>
                      {cartLivraisonPrice > 0
                        ? formatEuroPrice(cartLivraisonPrice, Language)
                        : t("Offert")}
                    </Text>
                  </View>
                </View>
              ) : (
                <></>
              )}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: 15,
                  paddingTop: 19,
                  borderBottomWidth: 1,
                  borderColor: "#E9E9E9",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Poppins-Regular",
                    fontSize: 12,
                    color: "#000",
                    letterSpacing: 0.8,
                  }}
                >
                  {t("Sous-Total aprés remise")}
                </Text>
                <Text
                  style={{
                    fontFamily: "Poppins-Medium",
                    fontSize: 14,
                    color: "#262A2B",
                    letterSpacing: 0.8,
                  }}
                >
                  {formatEuroPrice(apreRemise, Language)}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 19,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Poppins-Regular",
                    fontSize: 12,
                    color: "#ACB2B2",
                    letterSpacing: 0.8,
                  }}
                >
                  {t("fais douane")}
                </Text>
                <Text
                  style={{
                    fontFamily: "Poppins-Medium",
                    fontSize: 14,
                    color: "#262A2B",
                    letterSpacing: 0.8,
                  }}
                >
                  {CommandeHasManualValidation
                    ? t("à définir")
                    : formatEuroPrice(
                        sommeFraisDouane == null
                          ? 0
                          : sommeFraisDouane.toFixed(2),
                        Language
                      )}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: 15,
                  borderBottomWidth: 1,
                  borderColor: "#E9E9E9",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Poppins-Regular",
                    fontSize: 12,
                    color: "#ACB2B2",
                    letterSpacing: 0.8,
                  }}
                >
                  {t("Frais livraison")}
                </Text>
                <Text
                  style={{
                    fontFamily: "Poppins-Medium",
                    fontSize: 14,
                    color: "#262A2B",
                    letterSpacing: 0.8,
                  }}
                >
                  {CommandeHasManualValidation
                    ? t("à définir")
                    : formatEuroPrice(
                        prixTotalLivraison == null
                          ? 0
                          : prixTotalLivraison.toFixed(2),
                        Language
                      )}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: 15,
                  paddingTop: 19,
                  borderBottomWidth: 1,
                  borderColor: "#E9E9E9",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Poppins-Regular",
                    fontSize: 12,
                    color: "#000",
                    letterSpacing: 0.8,
                  }}
                >
                  {t("Montant à payer")}
                </Text>
                <Text
                  style={{
                    fontFamily: "Poppins-Medium",
                    fontSize: 14,
                    color: "#262A2B",
                    letterSpacing: 0.8,
                  }}
                >
                  {formatEuroPrice(montantApayer, Language)}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: 15,
                  paddingTop: 19,
                  borderBottomWidth: 1,
                  borderColor: "#E9E9E9",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Poppins-Regular",
                    fontSize: 12,
                    color: "#000",
                    letterSpacing: 0.8,
                  }}
                >
                  {t("Montant avoir")}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Entypo name="check" color="#01962A" size={15} />
                  <Feather name="x" color="#E10303" size={15} />
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 19,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Poppins-SemiBold",
                    fontSize: 12,
                    color: "#000",
                    letterSpacing: 0.8,
                  }}
                >
                  {t("Reste à payer")}
                </Text>
                <Text
                  style={{
                    fontFamily: "Poppins-Medium",
                    fontSize: 14,
                    color: "#262A2B",
                    letterSpacing: 0.8,
                  }}
                >
                  {formatEuroPrice(resteApayer, Language)}
                </Text>
              </View>
            </>
          </View>
        </View>

        {"demandes-d-achat" != Service.code && Avoirs.length > 0 && (
          <View
            style={[
              styles.dropContainerStyle,
              { position: "relative", zIndex: 1000 },
            ]}
          >
            <DropDownPicker
              style={[styles.dropdown]}
              containerStyle={styles.containerDepotStyle}
              dropDownContainerStyle={styles.selectedTextStyle}
              selectedItemContainerStyle={{ backgroundColor: "#d5d6d7" }}
              items={Avoirs}
              placeholder={!isFocusAvoir ? t("Avoirs") : "..."}
              onSelectItem={(item) => {
                setAvoirValue(item.value);
                setAvoirChoice(true);
                setIsFocusAvoir(false);
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
        )}

        {"demandes-d-achat" != Service.code && AvoirChoice && (
          <View
            style={{
              width: wp(95),
              alignSelf: "center",
              backgroundColor: "#fff",
              paddingHorizontal: 13,
              borderRadius: 8,
              paddingBottom: 18,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: 19,
              }}
            >
              <Text
                style={{
                  fontFamily: "Poppins-SemiBold",
                  fontSize: 12,
                  color: "#000",
                  letterSpacing: 0.8,
                }}
              >
                {t("Reste à payer")}
              </Text>
              <Text
                style={{
                  fontFamily: "Poppins-Medium",
                  fontSize: 14,
                  color: "#262A2B",
                  letterSpacing: 0.8,
                }}
              >
                {formatEuroPrice(resteApayer, Language)}
              </Text>
            </View>
          </View>
        )}

        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 30,
            position: "relative",
            zIndex: -100,
            marginBottom: wp(3),
          }}
        >
          <TouchableOpacity
            style={[
              LoadingPayment
                ? { backgroundColor: "#666" }
                : { backgroundColor: "#4E8FDA" },
              {
                paddingVertical: 8,
                paddingHorizontal: 22,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 25,
              },
            ]}
            activeOpacity={0.2}
            onPress={() => {
              NavigateToPayment(resteApayer, remiseTotal);
              // validateCommande("payeé", remiseTotal)
            }}
            disabled={LoadingPayment}
          >
            <Text
              style={{
                fontFamily: "Poppins-Medium",
                fontSize: 12,
                color: "#fff",
              }}
            >
              {"demandes-d-achat" == Service.code ? (
                LoadingPayment ? (
                  <ActivityIndicator color={"#fff"} size={"small"} />
                ) : (
                  t("Transmettre pour cotation")
                )
              ) : CommandeHasManualValidation ? (
                t("Transmettre pour cotation")
              ) : (
                t("Valider la commande")
              )}
            </Text>
          </TouchableOpacity>
        </View>

        {/* {LoadingPayment && <ActivityIndicator />} */}
      </View>
    );
  };

  const RenderTotalCommand = ({ data }) => {
    let prices = calculProductPricesCommand(data, RemiseValue, RemiseProduct);

    let remiseTotal = prices.remiseTotal;


    let totalPrixAvecDouaneRemiseAvoir = prices.totalPrixAvecDouaneRemiseAvoir;

    let TotalWithLivraison =
      totalPrixAvecDouaneRemiseAvoir + cartLivraisonPrice;
    TotalWithLivraison = isNaN(parseFloat(TotalWithLivraison))
      ? 0
      : parseFloat(TotalWithLivraison);

    setSommeFraisDouane(prices.sommeFraisDouane);
    let resteApayer = 0;
    let resteAvoir = 0;
    let apreRemise = 0;
    let calcuteRemise = 0;
    if (AvoirValue > TotalWithLivraison) {
      resteAvoir = AvoirValue - TotalWithLivraison;
      resteAvoir = resteAvoir.toFixed(2);
    } else {
      resteApayer = TotalWithLivraison - AvoirValue;
    }

    let subTotal = prices.totalPrix - prices.sommeFraisDouane;
    let priceWithTva = parseFloat(TVA);
    priceWithTva = isNaN(priceWithTva) ? 0 : priceWithTva;

    TotalWithLivraison = TotalWithLivraison + priceWithTva;

    TotalWithLivraison = TotalWithLivraison.toFixed(2);
    calcuteRemise = (TotalWithLivraison * remiseTotal) / 100;
    apreRemise = subTotal - calcuteRemise;
    apreRemise = apreRemise.toFixed(2);
    // setCartTotalPriceSansRemiseAvoir(prices.totalPrix.toFixed(2));

    let montantApayer =
      parseFloat(apreRemise) + prixTotalLivraison + sommeFraisDouane;
    montantApayer = isNaN(parseFloat(montantApayer))
      ? 0
      : parseFloat(montantApayer);
    montantApayer = montantApayer.toFixed(2);
    setPrixAmount(montantApayer);
    resteApayer = parseFloat(montantApayer).toFixed(2);
    setCartTotalPriceSansRemiseAvoir(montantApayer);

    if (AvoirValue) {
      saveCartAvoir(AvoirValue);
      resteApayer = resteApayer - AvoirValue;
      if (resteApayer < 0) {
        resteApayer = parseFloat(0).toFixed(2);
      } else {
        resteApayer = resteApayer.toFixed(2);
      }
    }

    if (isNaN(prixTotalLivraison)) {
      setPrixTotalLivraison(0);
    }
    return (
      <View>
        <View style={{ marginTop: 13, paddingHorizontal: 12 }}>
          {"demandes-d-achat" != Service.code ? (
            <>
              <View
                style={{
                  backgroundColor: "#fff",
                  paddingTop: 22,
                  paddingHorizontal: 13,
                  paddingBottom: 30,
                  borderRadius: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: 15,
                    borderBottomWidth: 1,
                    borderColor: "#E9E9E9",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Poppins-Regular",
                      fontSize: 12,
                      color: "#000",
                      letterSpacing: 0.8,
                    }}
                  >
                    {t("Sous Total")}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Poppins-Medium",
                      fontSize: 14,
                      color: "#262A2B",
                      letterSpacing: 0.8,
                    }}
                  >
                    {formatEuroPrice(subTotal.toFixed(2), Language)}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: 15,
                    paddingTop: 19,
                    borderBottomWidth: 1,
                    borderColor: "#E9E9E9",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Poppins-Regular",
                      fontSize: 12,
                      color: "#ACB2B2",
                      letterSpacing: 0.8,
                    }}
                  >
                    {t("Montant remise")}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Poppins-Medium",
                      fontSize: 14,
                      color: "#262A2B",
                      letterSpacing: 0.8,
                    }}
                  >
                    {remiseTotal == 0.0 ? '"-"' : "-" + remiseTotal + "%"}
                  </Text>
                </View>
                {"domicile" == modeLivraison ? (
                  <View style={styles.secondContainer}>
                    <View style={styles.totalContainer}>
                      <Text style={styles.totalText}>
                        {t("Prix de livraison")}
                      </Text>
                      <Text style={styles.totalText}>
                        {cartLivraisonPrice > 0
                          ? formatEuroPrice(cartLivraisonPrice, Language)
                          : t("Offert")}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <></>
                )}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: 15,
                    paddingTop: 19,
                    borderBottomWidth: 1,
                    borderColor: "#E9E9E9",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Poppins-Regular",
                      fontSize: 12,
                      color: "#000",
                      letterSpacing: 0.8,
                    }}
                  >
                    {t("Sous-Total aprés remise")}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Poppins-Medium",
                      fontSize: 14,
                      color: "#262A2B",
                      letterSpacing: 0.8,
                    }}
                  >
                    {formatEuroPrice(apreRemise, Language)}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: 19,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Poppins-Regular",
                      fontSize: 12,
                      color: "#ACB2B2",
                      letterSpacing: 0.8,
                    }}
                  >
                    {t("fais douane")}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Poppins-Medium",
                      fontSize: 14,
                      color: "#262A2B",
                      letterSpacing: 0.8,
                    }}
                  >
                    {formatEuroPrice(
                      sommeFraisDouane == null
                        ? 0
                        : sommeFraisDouane.toFixed(2),
                      Language
                    )}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: 15,
                    borderBottomWidth: 1,
                    borderColor: "#E9E9E9",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Poppins-Regular",
                      fontSize: 12,
                      color: "#ACB2B2",
                      letterSpacing: 0.8,
                    }}
                  >
                    {t("Frais livraison")}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Poppins-Medium",
                      fontSize: 14,
                      color: "#262A2B",
                      letterSpacing: 0.8,
                    }}
                  >
                    {formatEuroPrice(prixTotalLivraison, Language)}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: 15,
                    paddingTop: 19,
                    borderBottomWidth: 1,
                    borderColor: "#E9E9E9",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Poppins-Regular",
                      fontSize: 12,
                      color: "#000",
                      letterSpacing: 0.8,
                    }}
                  >
                    {t("Montant à payer")}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Poppins-Medium",
                      fontSize: 14,
                      color: "#262A2B",
                      letterSpacing: 0.8,
                    }}
                  >
                    {formatEuroPrice(montantApayer, Language)}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: 15,
                    paddingTop: 19,
                    borderBottomWidth: 1,
                    borderColor: "#E9E9E9",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Poppins-Regular",
                      fontSize: 12,
                      color: "#000",
                      letterSpacing: 0.8,
                    }}
                  >
                    {t("Montant avoir")}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Entypo name="check" color="#01962A" size={15} />
                    <Feather name="x" color="#E10303" size={15} />
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: 19,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Poppins-SemiBold",
                      fontSize: 12,
                      color: "#000",
                      letterSpacing: 0.8,
                    }}
                  >
                    {t("Reste à payer")}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Poppins-Medium",
                      fontSize: 14,
                      color: "#262A2B",
                      letterSpacing: 0.8,
                    }}
                  >
                    {formatEuroPrice(resteApayer, Language)}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <></>
          )}
        </View>

        {"demandes-d-achat" != Service.code && Avoirs.length > 0 && (
          <View
            style={[
              styles.dropContainerStyle,
              { position: "relative", zIndex: 1000 },
            ]}
          >
            <DropDownPicker
              style={[styles.dropdown]}
              containerStyle={styles.containerDepotStyle}
              dropDownContainerStyle={styles.selectedTextStyle}
              selectedItemContainerStyle={{ backgroundColor: "#d5d6d7" }}
              items={Avoirs}
              placeholder={!isFocusAvoir ? t("Avoirs") : "..."}
              onSelectItem={(item) => {
                setAvoirValue(item.value);
                setAvoirChoice(true);
                setIsFocusAvoir(false);
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
        )}

        {"demandes-d-achat" != Service.code && AvoirChoice && (
          <View
            style={{
              width: wp(95),
              alignSelf: "center",
              backgroundColor: "#fff",
              paddingHorizontal: 13,
              borderRadius: 8,
              paddingBottom: 18,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: 19,
              }}
            >
              <Text
                style={{
                  fontFamily: "Poppins-SemiBold",
                  fontSize: 12,
                  color: "#000",
                  letterSpacing: 0.8,
                }}
              >
                {t("Reste à payer")}
              </Text>
              <Text
                style={{
                  fontFamily: "Poppins-Medium",
                  fontSize: 14,
                  color: "#262A2B",
                  letterSpacing: 0.8,
                }}
              >
                {formatEuroPrice(resteApayer, Language)}
              </Text>
            </View>
          </View>
        )}

        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 30,
            position: "relative",
            zIndex: -100,
            marginBottom: wp(3),
          }}
        >
          <TouchableOpacity
            style={[
              LoadingPayment
                ? { backgroundColor: "#666" }
                : { backgroundColor: "#4E8FDA" },
              {
                paddingVertical: 8,
                paddingHorizontal: 22,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 25,
              },
            ]}
            activeOpacity={0.2}
            onPress={() => {
              NavigateToPayment(resteApayer, remiseTotal);
              // validateCommande("payeé", remiseTotal)
            }}
            disabled={LoadingPayment}
          >
            <Text
              style={{
                fontFamily: "Poppins-Medium",
                fontSize: 12,
                color: "#fff",
              }}
            >
              {"demandes-d-achat" == Service.code ? (
                LoadingPayment ? (
                  <ActivityIndicator color={"#fff"} size={"small"} />
                ) : (
                  t("Transmettre pour cotation")
                )
              ) : (
                t("Valider la commande")
              )}
            </Text>
          </TouchableOpacity>
        </View>

        {/* {LoadingPayment && <ActivityIndicator />} */}
      </View>
    );
  };

  if (Loader || !Service) {
    return (
      <View style={{ justifyContent: "center", height: "80%" }}>
        <ActivityIndicator size={"large"} color="#3292E0" />
      </View>
    );
  }
  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ paddingBottom: 80, flex: 1 }}>
          <ServiceHeader
            navigation={props.navigation}
            service={Service}
            paysLivraison={paysLivraisonObject}
            language={Language}
          />

          <View>
            {Service.code == "fret-par-avion" ||
            Service.code == "fret-par-bateau" ? (
              <Stepper position={3} Service={Service.code} />
            ) : (
              <Stepper position={2} Service={Service.code} />
            )}
          </View>

          <View>
            <View style={{ marginTop: 16 }}>
              {cartProducts.length == 0 ? (
                <FlatList
                  showsVerticalScrollIndicator={false}
                  data={CartCommand}
                  renderItem={({ item }) => <RenderItemCommand item={item} />}
                  keyExtractor={(item) => item.id}
                />
              ) : (
                <FlatList
                  showsVerticalScrollIndicator={false}
                  data={cartProducts}
                  renderItem={({ item }) => <RenderItem item={item} />}
                  keyExtractor={(item) => item.id}
                />
              )}
            </View>

            {"fret-par-avion" == Service.code ||
            "fret-par-bateau" == Service.code ? (
              <>
                <View
                  style={{ justifyContent: "center", alignItems: "center" }}
                >
                  <View style={styles.superCartContainer}>
                    <View style={styles.firstContainerInformation}>
                      <View style={styles.secondRow}>
                        <View>
                          <Text style={styles.WeightCalText}>
                            {CommandeHasManualValidation
                              ? t("Information de prise en charge")
                              : t("Information de dépôt")}
                          </Text>
                          <BoldTranslatedText
                            textKey="Mode"
                            normalText={t(
                              DepotData.depotMode == "magasin"
                                ? " Depot magasin"
                                : ` ${DepotData.depotMode}`
                            )}
                            style={styles.WeightCalSubText}
                          />

                          {DepotData.depotDepartement && (
                            <BoldTranslatedText
                              textKey="Département"
                              normalText={DepotData.depotDepartement}
                              style={styles.WeightCalSubText}
                            />
                          )}
                          {DepotData.depotMagasinSchedule &&
                            DepotData.depotMode !== "domicile" && (
                              <>
                                <BoldTranslatedText
                                  textKey="Horaires d'ouverture"
                                  normalText=" :"
                                  style={styles.WeightCalSubText}
                                />
                                <Text style={styles.WeightCalSubText}>
                                  {DepotData.depotMagasinSchedule}
                                </Text>
                              </>
                            )}
                          {DepotData.depotVille && (
                            <Text style={styles.WeightCalSubText}>
                              {t("Ville")} : {DepotData.depotVille}
                            </Text>
                          )}
                          {DepotData.depotMagasinAdresse ? (
                            <BoldTranslatedText
                              textKey="Adresse: "
                              normalText={DepotData.depotMagasinAdresse}
                              style={styles.WeightCalSubText}
                            />
                          ) : (
                            <BoldTranslatedText
                              textKey="Adresse: "
                              normalText={DepotData.depotEnlevementAdresse}
                              style={styles.WeightCalSubText}
                            />
                          )}

                          {DepotData.depotNom && (
                            <Text style={styles.WeightCalSubText}>
                              {t("Nom")} : {DepotData.depotNom}
                            </Text>
                          )}

                          {DepotData.depotTelephone && (
                            <Text style={styles.WeightCalSubText}>
                              {t("Téléphone")} : {DepotData.depotTelephone}
                            </Text>
                          )}

                          {DepotData.depotCreneau && (
                            <>
                              <Text style={styles.WeightCalSubText}>
                                {t("Créneau Date")} :{" "}
                                {formatDateToFrench(
                                  DepotData.depotCreneau.date
                                )}
                              </Text>
                              <Text style={styles.WeightCalSubText}>
                                {t("Créneau heure")} :{" "}
                                {DepotData.depotCreneau.horaireDebut +
                                  " - " +
                                  DepotData.depotCreneau.horaireFin}
                              </Text>
                            </>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </>
            ) : (
              <></>
            )}

            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <View style={styles.superCartContainer}>
                <View style={styles.firstContainerInformation}>
                  <View style={styles.secondRow}>
                    <View>
                      <BoldTranslatedText
                        textKey="Information de livraison"
                        style={styles.WeightCalText}
                      />
                      <BoldTranslatedText
                        textKey="Mode"
                        normalText={` : ${t(LivraisonData.livraisonMode)}`}
                        style={styles.WeightCalSubText}
                      />
                      <BoldTranslatedText
                        textKey="Adresse"
                        normalText={` : ${LivraisonData.livraisonAdresse}`}
                        style={styles.WeightCalSubText}
                      />
                      {LivraisonData.livraisonMagasinSchedule &&
                        LivraisonData.livraisonMode !== "domicile" && (
                          <>
                            <BoldTranslatedText
                              textKey="Horaires d'ouverture"
                              normalText=" :"
                              style={styles.WeightCalSubText}
                            />
                            <Text style={styles.WeightCalSubText}>
                              {LivraisonData.livraisonMagasinSchedule}
                            </Text>
                          </>
                        )}
                      {LivraisonData.livraisonNom && (
                        <BoldTranslatedText
                          textKey="Nom"
                          normalText={` : ${LivraisonData.livraisonNom}`}
                          style={styles.WeightCalSubText}
                        />
                      )}
                      {LivraisonData.livraisonTelephone && (
                        <BoldTranslatedText
                          textKey="Téléphone"
                          normalText={` : ${LivraisonData.livraisonTelephone}`}
                          style={styles.WeightCalSubText}
                        />
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <View style={styles.superCartContainer}>
                <View style={styles.firstContainerInformation}>
                  <View style={styles.secondRow}>
                    <View>
                      <Text style={styles.WeightCalText}>
                        {t("Information de facturation")}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 10,
                          alignItems: "center",
                        }}
                      >
                        <Checkbox
                          value={AdresseFacturationDifferente}
                          onValueChange={(value) =>
                            setAdresseFacturationDifferente(value)
                          }
                        />
                        <Text>{t("Adresse de facturation differente")}</Text>
                      </View>

                      {AdresseFacturationDifferente && (
                        <>
                          <View style={styles.dropContainerStyle}>
                            <Dropdown
                              style={{
                                borderColor: "#000",
                                borderWidth: 1,
                                padding: 10,
                                borderRadius: 8,
                              }}
                              autoScroll
                              iconStyle={styles.iconStyle}
                              containerStyle={styles.containerrrrStyle}
                              data={Adresses}
                              value={AdresseFacturationId}
                              maxHeight={120}
                              labelField="label"
                              valueField="value"
                              placeholder={t("Choisir une adresse existante")}
                              placeholderStyle={{ color: "#000" }}
                              showsVerticalScrollIndicator={false}
                              onChange={(item) => {
                                setAdresseFacturationId(item.id);
                              }}
                            />
                          </View>

                          <TouchableOpacity
                            onPress={() => {
                              NavigateToUserAddress();
                            }}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 10,
                              marginTop: 10,
                            }}
                          >
                            <Icon name="plus" size={23} color="#000" />
                            <Text>
                              {"(" +
                                t("ou") +
                                ") " +
                                t("Ajouter une nouvelle adresse")}
                            </Text>
                          </TouchableOpacity>

                          <TextInput
                            layout="first"
                            placeholder={t("Prénom et Nom")}
                            placeholderTextColor={"#666"}
                            value={NomFacturation}
                            style={{
                              borderWidth: 1,
                              borderRadius: 8,
                              padding: 12,
                              borderColor: "#000",
                              marginTop: 20,
                            }}
                            onChangeText={(text) => {
                              setNomFacturation(text);
                            }}
                          />
                        </>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <View style={{ marginTop: 10, paddingHorizontal: 12 }}>
              {"demandes-d-achat" == Service.code ? (
                <Text style={{ fontSize: 10, color: "#000" }}>
                  {!CommandeHasManualValidation &&
                    livraisonDelaiMin &&
                    livraisonDelaiMax &&
                    t("Livraison entre") +
                      " " +
                      livraisonDelaiMin +
                      " " +
                      t("et") +
                      " " +
                      livraisonDelaiMax +
                      " " +
                      t("jour(s)")}
                </Text>
              ) : (
                <Text style={{ fontSize: 10, color: "#000" }}>
                  {CommandeHasManualValidation && ""}
                  {!CommandeHasManualValidation &&
                    (livraisonDelaiMin || livraisonDelaiMax) &&
                    "*"}
                  {!CommandeHasManualValidation &&
                    livraisonDelaiMin &&
                    livraisonDelaiMax &&
                    t("Livraison entre") +
                      " " +
                      livraisonDelaiMin +
                      " " +
                      t("et") +
                      " " +
                      livraisonDelaiMax +
                      " " +
                      t("jour(s)")}
                </Text>
              )}
            </View>

            {cartProducts == 0 ? (
              <RenderTotalCommand data={CartCommand} />
            ) : (
              <RenderTotal data={cartProducts} />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default CheckoutScreen;
