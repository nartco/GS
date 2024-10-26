import React, { useState, useEffect, useRef, useCallback } from "react";

import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  ToastAndroid,
} from "react-native";
import Modal from "react-native-modal";
import { useNavigation, useRoute } from "@react-navigation/native";
import commonStyle from "../../helper/commonStyle";
import { useTranslation } from "react-i18next";
import { Dropdown } from "react-native-element-dropdown";
import Toast from "react-native-toast-message";
import _ from "lodash";
const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
import {
  getCommand,
  getPanier,
  getSelectedService,
  removeCommand,
  removePanier,
  savePanier,
  saveSelectedCountryProduct,
  saveSelectedServiceProduct,
} from "../../modules/GestionStorage";
import { HeaderEarth } from "../../components/Header";
import Ionicons from "react-native-vector-icons/Ionicons";
import Octicons from "react-native-vector-icons/Octicons";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import Button from "../../components/Button";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";

/*import Pdf from 'react-native-pdf';*/
import { onAuthStateChanged } from "firebase/auth";
import auth from "@react-native-firebase/auth";
import ServiceHeader from "../../components/ServiceHeader";
import { useBag } from "../../modules/BagContext";
import { afficherMessageProduitServiceDifferent } from "../../modules/RegleGestion";
import Carousel, { Pagination } from "react-native-snap-carousel";
import Pdf from "react-native-pdf";
import { ImageGallery } from "@georstat/react-native-image-gallery";
import Feather from "react-native-vector-icons/Feather";
import { categories } from "../../constant/data";

const ProductList = () => {
  const { setBagCount, bagCount } = useBag();

  const navigation = useNavigation();
  const { params } = useRoute();
  const category = params?.category;
  const PaysLivraison = params?.PaysLivraison;
  const Service = params?.Service;
  const ServiceSelected = params?.ServiceSelected;
  const Language = params?.Language;
  const products = category.products || [];
  const width = Dimensions.get("window").width;
  const Images = products.productImages;
  const Attributs = params?.Attributs;
  const SelectedCategorieId = params?.SelectedCategorieId;

  // const scrollX = new Animated.Value(0);

  //   let position = Animated.divide(scrollX, width);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [currentProductIndexGrid, setCurrentProductIndexGrid] = useState(0);
  const [currentProductImages, setCurrentProductImages] = useState([]);
  const [currentProductImagesGrid, setCurrentProductImagesGrid] = useState([]);
  const [selectedProductValues, setSelectedProductValues] = useState({});
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [selectedAttributesOriginal, setSelectedAttributesOriginal] = useState(
    {}
  );
  const [selectedStock, setSelectedStock] = useState([]);
  const [isSuccess, setIsSuccess] = useState(true);
  const [choosQuantity, setChoosQuantity] = useState(null);
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const [activeIndex, setActiveIndex] = useState(
    Array(products.length).fill(0)
  );
  const [activeIndexGrid, setActiveIndexGrid] = useState(
    Array(products.length).fill({ index: 0 })
  );

  const [sortedProducts, setSortedProducts] = useState(products);

  const [minPrices, setMinPrices] = useState({});
  const [minQuantities, setMinQuantities] = useState({});
  const [Quantities, setQuantities] = useState({});
  const [Prices, setPrices] = useState({});

  const [isOpenModal, setIsOpenModal] = useState({});
  const [isOpenModalGrid, setIsOpenModalGrid] = useState({});

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeFilter, setActiveFilter] = useState(0);
  const [currentImages, setCurrentImages] = useState({});
  const [open, setOpen] = useState(false);
  const [open1, setOpen1] = useState(false);
  const [user, setUser] = useState([]);
  const [selected, setSelected] = useState({});
  const colors = ["tomato", "thistle", "skyblue", "teal"];
  const [isOpen, setIsOpen] = useState(false);
  const [priceThing, setPriceThing] = useState({});
  const [Filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState("");

  const [SelectedProductStock, setSelectedProductStock] = useState({});

  const SortData = [
    {
      label: t("Prix"),
      value: "Prix ASC",
      filter: "price",
      sort: "ASC",
    },
    {
      label: t("Prix"),
      value: "Prix DESC",
      filter: "price",
      sort: "DESC",
    },
  ];

  const sortProducts = (filter, sortOrder) => {
    let sorted = [...products];
    if (filter === "price") {
      sorted.sort((a, b) => {
        const priceA = minPrices[a.id] || 0;
        const priceB = minPrices[b.id] || 0;
        return sortOrder === "ASC" ? priceA - priceB : priceB - priceA;
      });
    }
    setSortedProducts(sorted);
  };

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

  const findMatchingCombination = (combinations, attributeString) => {
    // Normaliser la chaîne d'attributs en triant ses éléments
    const normalizedAttributeString = attributeString
      .split(", ")
      .sort()
      .join(", ");

    // Rechercher la combinaison correspondante
    return combinations.find((item) => {
      const normalizedCombination = item.combinaison
        .split(", ")
        .sort()
        .join(", ");
      return normalizedCombination === normalizedAttributeString;
    });
  };
  // const openGallery = () => setIsOpen(true);
  // const closeGallery = () => setIsOpen(false);

  const openGallery = (productIndex) => {
    setCurrentProductIndex(productIndex);
    setIsOpen(true);
  };
  const openGalleryGrid = (productIndex) => {
    setCurrentProductIndexGrid(productIndex);
    const product = products[productIndex];
    const productImages = currentImages[product.id] || product.productImages;
    setCurrentProductImagesGrid(productImages);
    setOpen(true);
  };

  const closeGallery = () => {
    setIsOpen(false);
  };
  const closeGalleryGrid = () => {
    setOpen(false);
  };

  const updateQuantities = useCallback((productId, quantity) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: quantity,
    }));
  }, []);

  const getAttributeImages = (product, selectedAttributes) => {
    let images = [];
    product.attributs.forEach((attr) => {
      const selectedValue = selectedAttributes[attr.attribut.id];
      if (selectedValue) {
        const selectedAttributeValue = attr.attributValues.find(
          (val) =>
            val.valeur === selectedValue || val.valeurEN === selectedValue
        );
        if (selectedAttributeValue && selectedAttributeValue.attributImages) {
          images = images.concat(
            selectedAttributeValue.attributImages.map((img) => ({
              url: img.reference,
            }))
          );
        }
      }
    });
    return images.length > 0 ? images : product.productImages;
  };

  const renderSortItem = (item) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: 20,
      }}
    >
      <Text>{item.label}</Text>
      {item.value == "Prix DESC" && (
        <Feather name="arrow-down-right" color="#000" size={22} />
      )}

      {item.value == "Prix ASC" && (
        <Feather name="arrow-up-right" color="#000" size={22} />
      )}
    </View>
  );

  const slidesRef = useRef(null);

  useEffect(() => {
    const newMinPrices = {};
    const newMinQuantities = {};
    const newPrices = {};
    const newSelectedProductValues = {};
    async function fetchData() {
      try {
        const selectedService = await getSelectedService();
        setSelected(selectedService);
        let BasketCommand = await getCommand();
        let basketData = await getPanier();
      } catch (error) {
        console.log("Error :", error);
      }
    }
    fetchData();
    products.forEach((product) => {
      let minPrice = null;
      let minQuantity = null;

      // Stock
      product.stocks.forEach((stock) => {
        let quantity = parseInt(stock.stock);
        quantity = isNaN(quantity) ? 1 : quantity;

        let currentPrice = parseFloat(stock.prix);
        currentPrice = isNaN(currentPrice) ? 0 : currentPrice;

        if (!minPrice || currentPrice < minPrice) {
          minPrice = currentPrice;
        }

        if (!minQuantity || (quantity != 0 && quantity < minQuantity)) {
          minQuantity = quantity;
        }
      });

      // Stock specifique
      let stockSpecifiques = product.stockSpecifiques
        ? product.stockSpecifiques
        : [];

      stockSpecifiques.forEach((stock) => {
        let quantity = parseInt(stock.stockSpecifique);
        quantity = isNaN(quantity) ? 1 : quantity;

        let currentPrice = parseFloat(stock.prix);
        currentPrice = isNaN(currentPrice) ? 0 : currentPrice;

        if (!minPrice || currentPrice < minPrice) {
          minPrice = currentPrice;
        }

        if (!minQuantity || (quantity != 0 && quantity < minQuantity)) {
          minQuantity = quantity;
        }
      });

      newMinPrices[product.id] = minPrice;
      newMinQuantities[product.id] = minQuantity;
      newPrices[product.id] = null;

      newSelectedProductValues[product.id] = {
        attributes: {},
        quantite: null,
        prix: null,
      };
    });

    setMinPrices(newMinPrices);
    setMinQuantities(newMinQuantities);
    setPrices(newPrices);
    setSelectedProductValues(newSelectedProductValues);
  }, []);

  useEffect(() => {
    const currentUser = auth().currentUser;
    setUser(currentUser);
  }, []);

  // Gestion panier
  const handleCartLogin = async (product) => {
    const data = selectedProductValues[product.id];
    const numberAttributes = product.attributs ? product.attributs.length : 0;
    const keys = Object.keys(data["attributes"]);
    const quantite = selectedProductValues[product.id]["quantite"];

    if (keys.length != numberAttributes) {
      if (Platform.OS === "ios") {
        Toast.show({
          type: "error",
          text1: t("Attribut"),
          text2: t("Vous devez selectionner tous les attributs du produit"),
        });
      } else {
        ToastAndroid.show(
          t("Vous devez selectionner tous les attributs du produit"),
          ToastAndroid.SHORT
        );
      }

      return;
    }

    if (!quantite) {
      if (Platform.OS == "ios") {
        Toast.show({
          type: "error",
          text1: t("Quantité"),
          text2: t("La quantité est obligatoire"),
        });
      } else {
        ToastAndroid.show(t("La quantité est obligatoire"), ToastAndroid.SHORT);
      }

      return;
    }

    try {
      let basketData = await getPanier();

      let BasketCommand = await getCommand();

      console.log(JSON.stringify(BasketCommand), bagCount);
      if (BasketCommand.length > 0) {
        if (bagCount === 0) {
          setBagCount(0);
          await removePanier();
          await removeCommand();
          
        } else {
          return Alert.alert(
            t("Information"),
            t(
              "Votre panier contient des produits d'un autre service (ou pays de départ ou pays de destination). Vous perdrez votre panier si vous continuez. Voulez-vous continuer ?"
            ),
            [
              {
                text: t("Non"),
                style: "cancel",
              },
              {
                text: t("Oui"),
                onPress: () => {
                  console.log({ bagCount }, "bag1");
                  setBagCount(0);
                  handleCartRemove(product);
                  // return;
                },
              },
            ]
          );
        }
      }
      let isProductFromDifferentService =
        await afficherMessageProduitServiceDifferent(
          Service.code,
          PaysLivraison
        );

      if (isProductFromDifferentService) {
        return Alert.alert(
          t("Information"),
          t(
            "Votre panier contient des produits d'un autre service (ou pays de départ ou pays de destination). Vous perdrez votre panier si vous continuez. Voulez-vous continuer ?"
          ),
          [
            {
              text: t("Non"),
              style: "cancel",
            },
            {
              text: t("Oui"),
              onPress: async () => {
                console.log({ bagCount }, "bag2");

                await setBagCount(0);

                handleCartRemove(product);
              },
            },
          ]
        );
      }

      await removeCommand();
      console.log("2328783283203203232");
      let reponse = handleCart(product);
      console.log({ reponse }, "3232323232322332");
      reponse.then((response) => {
        if (isSuccess) {
          // Not Login
          if (user === null) {
            console.log("xxxxxxx");
            navigation.navigate("Login", { fromCart: "cart" });
            return; //should never reach
          }
        }
      });
    } catch (e) {
      console.log("error", e);
    }
  };

  // Ajouter au panier
  const handleCart = async (product) => {
    await saveSelectedCountryProduct(PaysLivraison);
    await saveSelectedServiceProduct(ServiceSelected);
    const data = selectedProductValues[product.id];

    const quantite = selectedProductValues[product.id]["quantite"];

    let CatProducts = [];

    let match = false;

    const attributeValues = createAttributeString(
      data ? data.attributes : null
    );

    const matchingCombination = findMatchingCombination(
      product.stocks,
      attributeValues
    );

    console.log(
      JSON.stringify(product),
      "productproductproductproductproductproduct",
      JSON.stringify(data),
      "matchingCombinationmatchingCombinationmatchingCombination"
    );
    const obj = {
      ID: (Math.random() + 1).toString(36).substring(7),
      product: product,
      ProductId: product.id,
      ProductImage: product.productImages,
      discount: product.discount,
      quantiteMax: Quantities[product.id],
      quantite: quantite,
      service: Service.code,
      paysLivraison: PaysLivraison,
      Price: Prices[product.id],
      attributes: data ? data.attributes : null,
      stockId: SelectedProductStock[product.id] ?? null,
    };
    CatProducts.push(obj);

    let basketData = await getPanier();

    if (basketData.length == 0) {
      await savePanier(CatProducts);

      if (Platform.OS === "ios") {
        Toast.show({
          type: "success",
          text1: t("Succès"),
          text2: t("Ajouter au panier avec succès"),
        });
      } else {
        ToastAndroid.show(
          t("Ajouter au panier avec succès"),
          ToastAndroid.SHORT
        );
      }

      setBagCount(basketData.length == 0 ? 1 : bagCount + 1);

      return true;
    }

    basketData.map((ls) => {
      if (
        ls.product.name === obj.product.name &&
        ls.service === obj.service &&
        ls.stockId === obj.stockId
      ) {
        match = true;
      } else {
      }
    });

    if (match === true) {
      Platform.OS === "ios"
        ? Toast.show({
            type: "error",
            text1: t("Il y a un problème !"),
            text2: t("Ce produit a déjà été ajouté"),
          })
        : ToastAndroid.show(
            t("Ce produit a déjà été ajouté"),
            ToastAndroid.SHORT
          );

      setIsSuccess(false);

      return false;
    }

    basketData.push(obj);

    await savePanier(basketData);

    if (Platform.OS === "ios") {
      Toast.show({
        type: "success",
        text1: t("Succès"),
        text2: t("Ajouter au panier avec succès"),
      });
    } else {
      ToastAndroid.show(t("Ajouter au panier avec succès"), ToastAndroid.SHORT);
    }

    setBagCount(bagCount + 1);

    return true;
  };

  // Vider le panier et ajouter les elements
  const handleCartRemove = async (product) => {
    await removePanier();
    await removeCommand();

    let reponse = handleCart(product);

    reponse.then((response) => {
      if (isSuccess) {
        // Not Login
        if (!user?.uid) {
          navigation.navigate("Login", { fromCart: "cart" });
          return; //should never reach
        }
      }
    });
  };

  // Gestion du scroll
  const Change = (nativeEvent) => {
    if (nativeEvent) {
      const slide = Math.ceil(
        nativeEvent.contentOffset.x / nativeEvent.layoutMeasurement.width
      );
      if (slide !== active) {
        setActive(slide);
      }
    }
  };
  // Ajouter l'attribut
  const handleAttributeChange = (product, attributeId, value, valueFR) => {
    const productId = product.id;

    setSelectedAttributes((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [attributeId]: value,
      },
    }));

    setSelectedAttributesOriginal((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [attributeId]: valueFR,
      },
    }));

    // Réinitialiser la quantité pour ce produit
    updateQuantities(productId, null);

    setPrices((prev) => ({
      ...prev,
      [productId]: null,
    }));

    setSelectedProductValues((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        attributes: {
          ...prev[productId]?.attributes,
          [attributeId]: value,
        },
        quantite: null,
        prix: null,
      },
    }));

    const newSelectedAttributes = {
      ...selectedAttributes[productId],
      [attributeId]: value,
    };

    const matchingStockInfo = findMatchingStock(product, newSelectedAttributes);

    if (matchingStockInfo) {
      const { stock, quantiteMax, prix, idStock } = matchingStockInfo;
      const maxSelectableQuantity = Math.min(stock, quantiteMax);

      updateQuantities(productId, maxSelectableQuantity);
      setPrices((prev) => ({ ...prev, [productId]: prix }));
      setSelectedProductStock((prev) => ({ ...prev, [productId]: idStock }));
    } else {
      // Réinitialiser les valeurs si aucun stock correspondant n'est trouvé
      updateQuantities(productId, null);
      setPrices((prev) => ({ ...prev, [productId]: null }));
      setSelectedProductStock((prev) => ({ ...prev, [productId]: null }));
    }

    // Mise à jour des images
    const newImages = getAttributeImages(product, newSelectedAttributes);
    setCurrentImages((prev) => ({
      ...prev,
      [productId]: newImages,
    }));
    setCurrentProductImages(newImages);
    setCurrentProductImagesGrid(newImages);
  };

  // Verifier le stock
  const findMatchingStock = (product, attributes) => {
    console.log(
      "Product.attributs",
      JSON.stringify(product.attributs),
      "attributes:",
      JSON.stringify(attributes)
    );

    if (Object.keys(attributes).length === product.attributs.length) {
      const selectedCombination = product.attributs
        .map((attr) => {
          const attrId = attr.attribut.id.toString();
          const selectedValue = attributes[attrId];
          // Trouver la valeur correspondante dans les attributValues
          const matchingValue = attr.attributValues.find(
            (v) => v.valeur === selectedValue || v.valeurEN === selectedValue
          );
          return matchingValue ? matchingValue.valeur : null;
        })
        .filter(Boolean) // Enlever les valeurs null
        .join(", ");

      console.log("Selected combination:", selectedCombination);

      let matchingStock = null;

      // Vérifier d'abord dans stockSpecifiques
      if (product.stockSpecifiques && product.stockSpecifiques.length > 0) {
        matchingStock = product.stockSpecifiques.find(
          (stock) => stock.combinaison === selectedCombination
        );
      }

      // Si aucune correspondance n'est trouvée dans stockSpecifiques, vérifier dans stocks
      if (!matchingStock) {
        matchingStock = product.stocks.find(
          (stock) => stock.combinaison === selectedCombination
        );
      }

      if (matchingStock) {
        return {
          stock: parseInt(matchingStock.stock),
          quantiteMax: parseInt(matchingStock.quantiteMax),
          prix: parseFloat(matchingStock.prix),
          idStock: matchingStock.id,
        };
      }
    }

    return null;
  };

  // Sauvegarder la quantité
  const handleQuantiteChange = (product, quantite) => {
    let productId = product.id;

    selectedProductValues[productId]["quantite"] = quantite;

    setSelectedProductValues(selectedProductValues);
  };

  // Afficher la quantité
  const RenderQuantite = ({ product }) => {
    const productId = product.id;
    const quantiteMax = Quantities[productId];
    const attributes = selectedProductValues[productId]?.attributes || {};
    const allAttributesSelected = product.attributs.every(
      (attr) => attributes[attr.attribut.id]
    );

    const isOutOfStock = quantiteMax === 0 || quantiteMax === null;
    const hasSelection = Object.keys(attributes).length > 0;

    if (!hasSelection) {
      return (
        <View style={styles.safeContainerStyle}>
          <Dropdown
            style={styles.dropdown}
            placeholder={t("Quantité")}
            data={[]}
            // disabled={true}
          />
        </View>
      );
    }

    if (allAttributesSelected && isOutOfStock) {
      return (
        <View style={styles.safeContainerStyle}>
          <Dropdown
            style={styles.dropdown}
            placeholder={t("Quantité")}
            data={[]}
            // disabled={true}
          />
          <Text style={[styles.stockMessage, { color: "red" }]}>
            {t("Rupture de stock")}
          </Text>
        </View>
      );
    }

    if (allAttributesSelected && !isOutOfStock) {
      const sweeterArray = Array.from({ length: quantiteMax }, (_, i) => ({
        label: (i + 1).toString(),
        value: (i + 1).toString(),
      }));

      return (
        <View style={styles.safeContainerStyle}>
          <Dropdown
            style={styles.dropdown}
            data={sweeterArray}
            labelField="label"
            valueField="value"
            value={selectedProductValues[productId]?.quantite}
            onChange={(item) => handleQuantiteChange(product, item.value)}
            placeholder={t("Quantité")}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            autoScroll
            iconStyle={styles.iconStyle}
            containerStyle={styles.containerStyle}
            itemTextStyle={{ color: "#000" }}
            searchPlaceholder={t("Search...")}
            showsVerticalScrollIndicator={false}
          />
        </View>
      );
    }

    return (
      <View style={styles.safeContainerStyle}>
        <Dropdown
          style={styles.dropdown}
          placeholder={t("Quantité")}
          data={[]}
          // disabled={true}
        />
      </View>
    );
  };

  // Afficher la quantité Grid
  const RenderQuantiteGrid = (props) => {
    let product = props.product;
    let productId = props.product.id;

    let minQuantite = minQuantities[productId] ?? null;

    let quantite = Quantities[productId];

    let attributeCount = product.attributs.length;

    const emptyQuantities = [];

    if (attributeCount > 0) {
      if (!minQuantite && !quantite) {
        return (
          <View
            style={[styles.safeContainerStyle, { width: windowWidth * 0.25 }]}
            key={"quantite" + productId}
          >
            <Dropdown
              style={[styles.dropdown, { height: 40 }]}
              placeholderStyle={[styles.placeholderStyle, { fontSize: wp(3) }]}
              selectedTextStyle={styles.selectedTextStyle}
              autoScroll
              itemTextStyle={{ fontSize: wp(3.5), color: "#000" }}
              iconStyle={styles.iconStyle}
              containerStyle={styles.containerStyle}
              labelField="label"
              valueField="value"
              placeholder={t("Quantité")}
              showsVerticalScrollIndicator={false}
              data={emptyQuantities}
            />
            <Text style={{ color: "red" }}>{t("Rupture de stock")}</Text>
          </View>
        );
      }
    }

    if (!minQuantite) {
      return (
        <View
          style={[styles.safeContainerStyle, { width: windowWidth * 0.25 }]}
          key={"quantite" + productId}
        >
          <Dropdown
            style={[styles.dropdown, { height: 40 }]}
            placeholderStyle={[styles.placeholderStyle, { fontSize: wp(3) }]}
            selectedTextStyle={styles.selectedTextStyle}
            autoScroll
            itemTextStyle={{ fontSize: wp(3.5), color: "#000" }}
            iconStyle={styles.iconStyle}
            containerStyle={styles.containerStyle}
            labelField="label"
            valueField="value"
            placeholder={t("Quantité")}
            showsVerticalScrollIndicator={false}
            data={emptyQuantities}
          />
          <Text style={{ color: "red" }}>{t("Rupture de stock")}</Text>
        </View>
      );
    }

    let quantiteMax = quantite ? parseInt(quantite) : parseInt(minQuantite);
    let sweeterArray = [];
    for (let i = 1; i < quantiteMax + 1; i++) {
      sweeterArray.push({ label: i.toString(), value: i.toString() });
    }

    const quantiteSelectedValue = selectedProductValues[productId]
      ? selectedProductValues[productId]["quantite"]
      : null;

    return (
      <View
        style={[styles.safeContainerStyle, { width: windowWidth * 0.25 }]}
        key={"quantite" + productId}
      >
        <Dropdown
          style={[styles.dropdown, { height: 40 }]}
          placeholderStyle={[styles.placeholderStyle, { fontSize: wp(3) }]}
          selectedTextStyle={styles.selectedTextStyle}
          autoScroll
          itemTextStyle={{ fontSize: wp(3.5), color: "#000" }}
          iconStyle={styles.iconStyle}
          containerStyle={styles.containerStyle}
          labelField="label"
          valueField="value"
          value={quantiteSelectedValue}
          placeholder={t("Quantité")}
          searchPlaceholder={t("Search...")}
          showsVerticalScrollIndicator={false}
          data={sweeterArray}
          onChange={(item) => {
            handleQuantiteChange(product, item.value);
          }}
        />
      </View>
    );
  };

  // Afficher la description
  const RenderLivraisonAndDescriptionLink = (props) => {
    const product = props.product;

    const specificites = product.productSpecificites[0]; // On retournera tjr une specificité par pays

    const image =
      "fr" == Language ? product.imageDescription : product.imageDescriptionEN;

    if (!image) {
      return (
        <View style={{ flex: 1 }}>
          <Text style={{ paddingRight: 190 }}>
            {specificites.livraison
              ? "fr" == Language
                ? specificites.livraison.delai
                : specificites.livraison.delaiEN
              : ""}
          </Text>
        </View>
      );
    }

    return (
      <>
        <View>
          <Text>
            {specificites.livraison
              ? "fr" == Language
                ? specificites.livraison.delai
                : specificites.livraison.delaiEN
              : ""}
          </Text>
        </View>
        <View>
          <TouchableOpacity
            onPress={() => {
              setSelectedProduct(product);
              setModalVisible(true);
            }}
          >
            <Text style={{ color: "blue", marginTop: 8 }}>
              {t("Voir plus")}
            </Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  // Afficher la description
  const RenderLivraisonAndDescriptionLinkGrid = (props) => {
    const product = props.product;

    const specificites = product.productSpecificites[0]; // On retournera tjr une specificité par pays

    const image =
      "fr" == Language ? product.imageDescription : product.imageDescriptionEN;

    if (!image) {
      return (
        <View>
          <Text
            style={{
              fontSize: wp(2.5),
              width: windowWidth * 0.2,
              alignSelf: "center",
            }}
          >
            {specificites.livraison
              ? "fr" == Language
                ? specificites.livraison.delai
                : specificites.livraison.delaiEN
              : ""}
          </Text>
        </View>
      );
    }

    return (
      <>
        <View style={{ maxWidth: windowWidth * 0.22 }}>
          <Text style={{ fontSize: wp(2.5) }}>
            {specificites.livraison
              ? "fr" == Language
                ? specificites.livraison.delai
                : specificites.livraison.delaiEN
              : ""}
          </Text>
        </View>
        <View>
          <TouchableOpacity
            onPress={() => {
              setSelectedProduct(product);
              setModalVisible(true);
            }}
          >
            <Text style={{ color: "blue", fontSize: wp(3) }}>
              {t("Voir plus")}
            </Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  // Afficher la description du produit
  const RenderProductDescription = (props) => {
    const product = props.product;
    const isPdf =
      "fr" == Language
        ? product.imageDescription.endsWith(".pdf")
        : product.imageDescriptionEN.endsWith(".pdf");
    const source = {
      uri:
        "fr" == Language
          ? product.imageDescription
          : product.imageDescriptionEN,
    };

    if (isPdf) {
      return (
        <Pdf
          key={"pdfView"}
          trustAllCerts={false}
          source={{ uri: source.uri }}
          style={{ flex: 1, width: "100%", height: "100%" }}
          onLoadComplete={() => console.log("PDF chargé")}
          onError={(error) => console.log("Erreur de chargement du PDF", error)}
        />
      );
    }

    return (
      <Image
        key={product.id}
        source={{
          uri:
            "fr" == Language
              ? product.imageDescription
              : product.imageDescriptionEN,
        }}
        style={{
          width: windowWidth * 0.4,
          height: windowHeight * 0.25,
          borderRadius: 10,
        }}
        resizeMode={"contain"}
      />
    );
  };

  const formatPrice = (price) => {
    const priceStr = price.toString();

    const [dollars, cents] = priceStr.split(".");

    const formattedDollars = parseInt(dollars, 10)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    const formattedCents = cents ? `.${cents}` : "";

    const formattedPrice = `${formattedDollars}${formattedCents}`;

    return formattedPrice;
  };

  //Afficher le prix
  const RenderPrices = (props) => {
    const product = props.product;

    const price = Prices[product.id];

    const minPrice = minPrices[product.id];

    if (!price && !minPrice) {
      return <></>;
    }

    if (price) {
      return (
        <Text
          style={{
            fontSize: 13,
            fontFamily: "Poppins-SemiBold",
            color: "#000",
            marginTop: 8,
          }}
        >
          {formatPrice(price) +
            "€" +
            (product.unite ? " / " + product.unite.valeur : "")}
        </Text>
      );
    }

    return (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text
          style={{
            fontSize: 13,
            fontFamily: "Poppins-Medium",
            color: "#000",
            marginTop: 8,
          }}
        >
          {t("A partir de")}
        </Text>
        <Text
          style={{
            fontSize: 13,
            fontFamily: "Poppins-SemiBold",
            color: "#000",
            marginTop: 8,
          }}
        >
          {" " +
            formatPrice(minPrice) +
            "€" +
            (product.unite ? " / " + product.unite.valeur : "")}
        </Text>
      </View>
    );
  };

  // Afficher le prix
  const RenderPricesGrid = (props) => {
    const product = props.product;

    const price = Prices[product.id];

    const minPrice = minPrices[product.id];

    if (!price && !minPrice) {
      return <></>;
    }

    if (price) {
      return (
        <Text
          style={{
            fontSize: 9,
            fontFamily: "Poppins-SemiBold",
            color: "#000",
            marginTop: 8,
          }}
        >
          {formatPrice(price) +
            "€" +
            (product.unite ? " / " + product.unite.valeur : "")}
        </Text>
      );
    }

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          maxWidth: 50,
          paddingRight: 10,
          gap: 5,
        }}
      >
        <Text
          style={{
            fontSize: 8,
            fontFamily: "Poppins-Medium",
            color: "#000",
            marginTop: 8,
          }}
        >
          {t("A partir de")}
        </Text>
        <Text
          style={{
            fontSize: 8,
            fontFamily: "Poppins-SemiBold",
            color: "#000",
            marginTop: 8,
          }}
        >
          {" " +
            formatPrice(minPrice) +
            "€" +
            (product.unite ? " / " + product.unite.valeur : "")}
        </Text>
      </View>
    );
  };

  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [currentImageIndexGrid, setCurrentImageIndexGrid] = useState({});

  const openImageViewGrid = (productIndex, imageIndex) => {
    setIsOpenModalGrid((prev) => ({ ...prev, [productIndex]: true }));
    setCurrentImageIndexGrid((prev) => ({
      ...prev,
      [productIndex]: imageIndex,
    }));
  };

  const renderItem = ({ item, index }, productIndex) => {
    return (
      <TouchableOpacity
        key={index}
        onPress={() => {
          openGallery(productIndex);
        }}
        style={{
          borderRadius: 5,
          padding: 50,
          marginLeft: 25,
          marginRight: 25,
        }}
      >
        <Image
          source={{ uri: item.url }}
          style={{
            height: wp(40),
            borderRadius: 22,
            width: wp(50),
            justifyContent: "center",
            alignSelf: "center",
          }}
          resizeMode={"contain"}
        />
      </TouchableOpacity>
    );
  };
  const renderItemGrid = ({ item, index }, productIndex) => {
    return (
      <TouchableOpacity
        key={index}
        onPress={() => openGalleryGrid(productIndex)}
        style={{
          borderRadius: 5,
          padding: 50,
        }}
      >
        <Image
          source={{ uri: item.url }}
          style={{
            height: wp(30),
            borderRadius: 22,
            width: wp(20),
            justifyContent: "center",
            alignSelf: "center",
          }}
          resizeMode={"contain"}
        />
      </TouchableOpacity>
    );
  };

  if (!selected) {
    <View style={{ flex: 1 }}>
      <HeaderEarth />

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <View style={{ justifyContent: "center" }}>
          <ActivityIndicator size={"large"} color="#3292E0" />
        </View>
      </View>
    </View>;
  }

  const isCarousel = products.map(() => useRef(null));
  const carouselRefs = useRef(Array(products.length).fill(null));
  const carouselRefsGrid = useRef(Array(products.length).fill(null));
  const handleSnapToItem = (productIndex, carouselIndex) => {
    setActiveIndex((prev) => {
      const newIndices = [...prev];
      newIndices[productIndex] = carouselIndex;
      return newIndices;
    });
  };

  const ImageFooter = ({ imageIndex, images, onPressThumbnail }) => (
    <View style={styles.root}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
          justifyContent: "center",
        }}
      >
        {images.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => onPressThumbnail(idx)}
            style={styles.thumbnailWrapper}
          >
            <Image
              key={idx}
              source={{ uri: item.url }}
              style={[
                idx === imageIndex
                  ? { borderColor: "red" }
                  : { borderColor: "transparent" },
                {
                  height: wp(15),
                  borderWidth: 3,
                  borderRadius: 10,
                  width: wp(15),
                },
              ]}
              resizeMode={"cover"}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderHeader = () => {
    return (
      <View
        style={{
          position: "absolute",
          top: windowWidth * 0.15,
          right: windowWidth * 0.09,
        }}
      >
        <TouchableOpacity onPress={closeGallery}>
          <FontAwesome6 name="x" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };
  const renderHeaderGrid = () => {
    return (
      <View
        style={{
          position: "absolute",
          top: windowWidth * 0.15,
          right: windowWidth * 0.09,
        }}
      >
        <TouchableOpacity onPress={closeGalleryGrid}>
          <FontAwesome6 name="x" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <View style={{ flex: 1 }}>
      <ServiceHeader
        navigation={navigation}
        service={Service}
        paysLivraison={PaysLivraison}
        language={Language}
        SelectedCategorieId={SelectedCategorieId}
      />
      <View style={styles.containerMarginBottom}>
        <View style={{ marginTop: 10, paddingHorizontal: 5 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              backgroundColor: "#fff",
              paddingVertical: 15,
              paddingLeft: 15,
              paddingRight: 23,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <Dropdown
                  data={SortData}
                  style={{
                    height: 10,
                    width: windowWidth * 0.2,
                    borderRadius: 8,
                    backgroundColor: "#FFF",
                  }}
                  labelField="label"
                  valueField="value"
                  placeholder={t("Trier")}
                  selectedTextStyle={{
                    fontFamily: "Poppins-Medium",
                    fontSize: wp(3.1),
                    color: "#376AED",
                  }}
                  iconColor="#376AED"
                  value={sortBy}
                  itemTextStyle={{ fontSize: wp(3.35) }}
                  itemContainerStyle={{ height: 50, width: windowWidth * 1 }}
                  placeholderStyle={{
                    fontFamily: "Poppins-Medium",
                    fontSize: wp(3.1),
                    color: "#376AED",
                  }}
                  showsVerticalScrollIndicator={false}
                  containerStyle={{ elevation: 0 }}
                  searchPlaceholder={t("Search")}
                  onChange={(item) => {
                    setFilter(item.filter);
                    setSortBy(item.sort);
                    sortProducts(item.filter, item.sort);
                  }}
                  renderItem={renderSortItem}
                />
              </View>
            </View>

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              {activeFilter === 0 ? (
                <TouchableOpacity onPress={() => setActiveFilter(1)}>
                  <Ionicons
                    name="grid-outline"
                    color="#00000033"
                    size={wp(5.2)}
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => setActiveFilter(0)}>
                  <Ionicons
                    name="grid-outline"
                    color="#376AED"
                    size={wp(5.2)}
                  />
                </TouchableOpacity>
              )}
              {activeFilter === 1 ? (
                <TouchableOpacity onPress={() => setActiveFilter(0)}>
                  <Octicons
                    name="list-unordered"
                    color="#00000033"
                    size={wp(5.2)}
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => setActiveFilter(1)}>
                  <Octicons
                    name="list-unordered"
                    color="#376AED"
                    size={wp(5.2)}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ marginBottom: 150 }}>
            {activeFilter === 0 ? (
              <>
                {sortedProducts.map((product, index) => (
                  <View
                    key={index}
                    style={{ backgroundColor: "#FFF", margin: 5 }}
                  >
                    <View
                      style={{
                        paddingHorizontal: 12,
                        paddingTop: 25,
                        paddingBottom: 12,
                        borderRadius: 12,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Poppins-SemiBold",
                          fontSize: 13.5,
                          textAlign: "left",
                          color: "#60be74",
                        }}
                      >
                        {"fr" == Language ? product.name : product.nameEN}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                        paddingBottom: 12,
                        paddingLeft: 22,
                        marginBottom: 50,
                      }}
                    >
                      <ImageGallery
                        close={closeGallery}
                        images={
                          currentProductImages.length > 0
                            ? currentProductImages
                            : products[currentProductIndex]?.productImages || []
                        }
                        isOpen={isOpen}
                        renderHeaderComponent={renderHeader}
                      />
                      <View>
                        <Carousel
                          ref={(carousel) =>
                            (carouselRefs.current[index] = carousel)
                          }
                          data={
                            currentImages[product.id] || product.productImages
                          }
                          renderItem={(item) => renderItem(item, index)}
                          sliderWidth={windowWidth * 0.4}
                          itemWidth={windowWidth * 0.4}
                          style={styles.imageSwiper}
                          onSnapToItem={(carouselIndex) =>
                            handleSnapToItem(index, carouselIndex)
                          }
                        />
                        <Pagination
                          carouselRef={carouselRefs.current[index]}
                          dotsLength={product.productImages.length}
                          activeDotIndex={activeIndex[index]}
                          containerStyle={{
                            position: "absolute",
                            bottom: 20,
                            width: windowWidth * 0.3,
                            alignSelf: "center",
                          }}
                          dotColor={"rgba(255, 255, 255, 0.92)"}
                          dotStyle={{
                            width: 10,
                            height: 10,
                            borderRadius: 8,
                            backgroundColor: "#000",
                          }}
                          inactiveDotStyle={{
                            width: 8,
                            height: 8,
                            borderRadius: 8,
                            backgroundColor: "#000",
                          }}
                        />
                      </View>
                      <View
                        style={{
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "flex-start",
                        }}
                      >
                        <RenderPrices product={product} />

                        {product.attributs.map((attribute) => {
                          const prevChoice = selectedProductValues[product.id]
                            ? selectedProductValues[product.id]["attributes"]
                            : null;
                          const selectedValue = prevChoice
                            ? prevChoice[attribute.attribut.id]
                            : null;

                          const buildAttributes = attribute.attributValues.map(
                            (obj) => {
                              let valeur =
                                "fr" == Language ? obj.valeur : obj.valeurEN;

                              return {
                                label: valeur,
                                value: valeur,
                                valueFR: obj.valeur,
                              };
                            }
                          );

                          return (
                            <View
                              style={styles.safeContainerStyle}
                              key={attribute.id}
                            >
                              <Dropdown
                                style={styles.dropdown}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                autoScroll
                                iconStyle={styles.iconStyle}
                                itemTextStyle={{ color: "#000" }}
                                containerStyle={styles.containerStyle}
                                labelField="label"
                                valueField="value"
                                value={selectedValue}
                                placeholder={
                                  "fr" == Language
                                    ? attribute.attribut.name
                                    : attribute.attribut.nameEN
                                }
                                searchPlaceholder={t("Search...")}
                                showsVerticalScrollIndicator={false}
                                data={buildAttributes}
                                onChange={(item) => {
                                  handleAttributeChange(
                                    product,
                                    attribute.attribut.id,
                                    item.value,
                                    item.valueFR
                                  );
                                }}
                              />
                            </View>
                          );
                        })}

                        <RenderQuantite product={product} />

                        <View
                          style={{
                            marginTop: 10,
                            width: windowWidth * 0.45,
                            position: "relative",
                            zIndex: -10,
                          }}
                        >
                          <Button
                            title={t("ajouter au panier")}
                            navigation={() => handleCartLogin(product)}
                          />
                        </View>
                        <View style={styles.descrContainer}>
                          <RenderLivraisonAndDescriptionLink
                            product={product}
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </>
            ) : (
              <>
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {sortedProducts.map((product, index) => (
                    <View key={index} style={{ width: "50%", padding: 1 }}>
                      <View
                        style={{
                          backgroundColor: "#FFF",
                          margin: 4.5,
                          borderRadius: 10,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 12,
                            paddingTop: 16,
                            paddingLeft: 6,
                            paddingRight: 6,
                          }}
                        >
                          <View style={{ maxWidth: wp(24.5) }}>
                            <Text
                              style={{
                                fontFamily: "Poppins-SemiBold",
                                textAlign: "left",
                                fontSize: 8.3,
                                color: "#60be74",
                              }}
                            >
                              {"fr" == Language ? product.name : product.nameEN}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 2,
                              maxWidth: wp(15.5),
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 9,
                                fontFamily: "Poppins-SemiBold",
                                color: "#000",
                                marginTop: 8,
                              }}
                            >
                              <RenderPricesGrid product={product} />
                            </Text>
                          </View>
                        </View>

                        <View
                          style={{
                            flexDirection: "row",
                            gap: 5,
                            alignItems: "center",
                            paddingBottom: 8,
                            paddingLeft: 6,
                          }}
                        >
                          <View>
                            <ImageGallery
                              close={closeGalleryGrid}
                              images={
                                currentProductImagesGrid.length > 0
                                  ? currentProductImagesGrid
                                  : products[currentProductIndexGrid]
                                      ?.productImages || []
                              }
                              isOpen={open}
                              renderHeaderComponent={renderHeaderGrid}
                            />
                            <Carousel
                              ref={(carousel) =>
                                (carouselRefs.current[index] = carousel)
                              }
                              data={
                                currentImages[product.id] ||
                                product.productImages
                              }
                              renderItem={(item) => renderItemGrid(item, index)}
                              sliderWidth={windowWidth * 0.2}
                              itemWidth={windowWidth * 0.2}
                              style={styles.imageSwiper}
                              onSnapToItem={(carouselIndex) =>
                                handleSnapToItem(index, carouselIndex)
                              }
                            />
                            <Pagination
                              carouselRef={carouselRefs.current[index]}
                              dotsLength={product.productImages.length}
                              activeDotIndex={activeIndex[index]}
                              containerStyle={{
                                position: "absolute",
                                bottom: 20,
                                width: windowWidth * 0.1,
                                alignSelf: "center",
                              }}
                              dotColor={"rgba(255, 255, 255, 0.92)"}
                              dotStyle={{
                                width: 8,
                                height: 8,
                                borderRadius: 8,
                                backgroundColor: "#000",
                              }}
                              inactiveDotStyle={{
                                width: 8,
                                height: 8,
                                borderRadius: 8,
                                backgroundColor: "#000",
                              }}
                            />
                          </View>
                          <View
                            style={{
                              flexDirection: "column",
                              justifyContent: "center",
                              alignItems: "flex-start",
                              paddingRight: 6,
                            }}
                          >
                            {product.attributs.map((attribute) => {
                              const prevChoice = selectedProductValues[
                                product.id
                              ]
                                ? selectedProductValues[product.id][
                                    "attributes"
                                  ]
                                : null;
                              const selectedValue = prevChoice
                                ? prevChoice[attribute.attribut.id]
                                : null;

                              const buildAttributes =
                                attribute.attributValues.map((obj) => {
                                  let valeur =
                                    "fr" == Language
                                      ? obj.valeur
                                      : obj.valeurEN;

                                  return {
                                    label: valeur,
                                    value: valeur,
                                    valueFR: obj.valeur,
                                  };
                                });

                              return (
                                <View
                                  style={[
                                    styles.safeContainerStyle,
                                    { width: windowWidth * 0.24 },
                                  ]}
                                  key={attribute.id}
                                >
                                  <Dropdown
                                    style={[styles.dropdown, { height: 40 }]}
                                    placeholderStyle={[
                                      styles.placeholderStyle,
                                      { fontSize: wp(3) },
                                    ]}
                                    selectedTextStyle={[
                                      styles.selectedTextStyle,
                                      { fontSize: wp(2.5) },
                                    ]}
                                    autoScroll
                                    iconStyle={styles.iconStyle}
                                    containerStyle={styles.containerStyle}
                                    itemTextStyle={{
                                      fontSize: wp(2.5),
                                      color: "#000",
                                    }}
                                    labelField="label"
                                    valueField="value"
                                    value={selectedValue}
                                    placeholder={
                                      "fr" == Language
                                        ? attribute.attribut.name
                                        : attribute.attribut.nameEN
                                    }
                                    searchPlaceholder={t("Search...")}
                                    showsVerticalScrollIndicator={false}
                                    data={buildAttributes}
                                    onChange={(item) => {
                                      handleAttributeChange(
                                        product,
                                        attribute.attribut.id,
                                        item.value,
                                        item.valueFR
                                      );
                                    }}
                                  />
                                </View>
                              );
                            })}

                            <RenderQuantiteGrid product={product} />

                            <View style={styles.descrContainer}>
                              <RenderLivraisonAndDescriptionLinkGrid
                                product={product}
                              />
                            </View>
                          </View>
                        </View>
                        <View
                          style={{
                            paddingBottom: 10,
                            width: windowWidth * 0.4,
                            alignSelf: "center",
                            position: "relative",
                            zIndex: -10,
                          }}
                        >
                          <Button
                            title={t("ajouter au panier")}
                            navigation={() => handleCartLogin(product)}
                          />
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        </ScrollView>

        {selectedProduct && (
          <Modal visible={modalVisible} animationType="slide">
            <View
              style={{
                backgroundColor: "#FFF",
                width: windowWidth * 1,
                alignSelf: "center",
                flex: 1,
              }}
            >
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text
                  style={{
                    color: "blue",
                    padding: windowWidth * 0.06,
                    fontSize: windowWidth * 0.07,
                  }}
                >
                  X
                </Text>
              </TouchableOpacity>
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <RenderProductDescription product={selectedProduct} />
              </View>
            </View>
          </Modal>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  DetailsContainer: {
    backgroundColor: "#F4F6F8",
    width: windowWidth * 0.95,
    height: windowHeight * 0.6,
    marginTop: windowHeight * 0.03,
    borderRadius: 28,
    elevation: 1,
  },
  descrContainer: {
    flex: 1,
    textAlign: "justify",
    padding: windowWidth * 0.02,
    position: "relative",
    zIndex: -10,
  },
  safeContainerStyle: {
    justifyContent: "center",
    // backgroundColor: 'tomato',
    width: windowWidth * 0.43,
    // borderRadius:0
  },
  subTabbarContainerFilter: {
    height: windowHeight * 0.055,
    width: windowWidth * 0.95,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    alignSelf: "center",
    elevation: 5,
    justifyContent: "center",
  },
  returnButtonContainerFilter: {
    height: windowHeight * 0.055,
    width: windowWidth * 0.95,
    flexDirection: "row",
    alignItems: "flex-start",
    margin: 10,
    alignSelf: "flex-start",
    elevation: 5,
    justifyContent: "flex-start",
  },
  filterTextContainer: {
    flexDirection: "row",
    height: windowHeight * 0.035,
    alignItems: "center",
    justifyContent: "space-around",
    width: windowWidth * 0.15,
    backgroundColor: "#fff",
    elevation: 3,
    borderRadius: 5,
    margin: windowWidth * 0.01,
  },
  filterTextStyle: {
    fontFamily: commonStyle.regular,
    fontSize: 10,
    color: "#000",
    width: windowWidth * 0.2,
    height: windowHeight * 0.035,
    textAlign: "center",
    textAlignVertical: "center",
    fontWeight: "bold",
  },
  containerMarginBottom: {
    marginBottom: windowHeight * 0.1,
  },
  upperRow: {
    // backgroundColor: 'green',
    flexDirection: "row",
    height: windowHeight * 0.1,
    width: windowWidth * 0.95,
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: windowHeight * 0.03,
  },
  detailTextContainer: {
    // backgroundColor: 'tomato',
    height: windowHeight * 0.08,
    width: windowWidth * 0.8,
    alignItems: "flex-start",
    justifyContent: "space-around",
  },
  detailNameText: {
    color: "#000",
    fontFamily: commonStyle.regular,
    fontSize: 14,
    // backgroundColor: 'tomato',
    margin: 2,
    width: windowWidth * 0.6,
  },
  discountPriceText: {
    color: "#000",
    fontFamily: commonStyle.regular,
    fontSize: 13,
    // backgroundColor: 'tomato',
    margin: 2,
  },
  priceText: {
    color: "#000",
    fontFamily: commonStyle.regular,
    fontSize: 13,
    textDecorationLine: "line-through",
  },

  counterTExt: {
    fontSize: 30,
    color: "#000",
  },
  counterButton: {
    width: 50,
    height: 50,
    borderRadius: 100,
    backgroundColor: "#DFE8F2",
    elevation: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  counterButtonText: {
    color: "#A1B0C1",
    fontSize: 20,
  },
  downRow: {
    // backgroundColor: 'tomato',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: windowWidth * 0.9,
    height: windowHeight * 0.35,
    alignSelf: "center",
  },
  dropDowncontainer: {
    // backgroundColor: 'green',
    width: windowWidth * 0.4,
    height: windowHeight * 0.33,
  },
  imageSwiper: {
    width: windowWidth * 0.4,
    height: windowHeight * 0.25,
    borderRadius: 10,
  },
  dotStyle: {
    flexDirection: "row",
    position: "absolute",
    zIndex: 1500,
    bottom: windowHeight * 0.04,
    alignSelf: "center",
    gap: 2,
    // backgroundColor: 'tomato',
    width: windowWidth * 0.1,
    color: "#000",
  },
  dotStyleGrid: {
    flexDirection: "row",
    position: "absolute",
    zIndex: 1500,
    bottom: windowHeight * wp(0.005),
    alignSelf: "center",
    justifyContent: "space-around",
    // backgroundColor: 'tomato',
    width: windowWidth * 0.1,
    color: "#000",
  },
  pagingText: {
    color: "#888",
    fontSize: 16,
    opacity: 0.1,
  },
  pagingActiveText: {
    color: "#14213D",
    fontSize: 16,
  },
  dropDownscontainer: {
    // backgroundColor: 'green',
    width: windowWidth * 0.4,
    height: windowHeight * 0.35,
    alignItems: "center",
    justifyContent: "space-around",
  },
  inputContainer: {
    backgroundColor: "#d5d6d7",
    width: windowWidth * 0.4,
    height: 50,
    borderRadius: 10,
    elevation: 1,
  },
  stockMessage: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  inputStyle: {
    padding: 10,
    color: "#14213D",
    fontFamily: commonStyle.regular,
    marginLeft: 10,
    fontSize: 16,
  },
  buttonContainers: {
    backgroundColor: "#1A6CAF",
    height: windowHeight * 0.04,
    width: windowWidth * 0.45,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
  },
  buttonCartContainers: {
    backgroundColor: "#3292E0",
    height: windowHeight * 0.04,
    width: windowWidth * 0.4,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
  },
  buttonText: {
    fontSize: 10,
    color: "#fff",
    fontFamily: commonStyle.regular,
  },
  dropdown: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#F5F5F5",
    marginBottom: 5,
  },
  placeholderStyle: {
    fontSize: 16,
    fontFamily: commonStyle.regular,
    color: "#14213D",
  },
  modalCloseButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1,
  },
  modalCloseButtonText: {
    color: "#fff",
    fontSize: 18,
  },
  selectedTextStyle: {
    fontSize: 16,
    fontFamily: commonStyle.regular,
    color: "#14213D",
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  containerStyle: {
    backgroundColor: "#F5F5F5",
    marginTop: -1,
    borderRadius: 8,
    maxHeight: 100,
    elevation: 0,
  },
  ModalContainer: {
    width: windowWidth * 1.0,
    height: windowHeight * 0.4,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "space-around",
    bottom: 0,
    position: "absolute",
  },
  cameraGallerybuttons: {
    backgroundColor: "#1A6CAF",
    height: 50,
    width: windowWidth * 0.8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  cancelButton: {
    backgroundColor: "#ff726f",
    height: 50,
    width: windowWidth * 0.8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  uploadContainer: {
    // backgroundColor: 'tomato',
    alignItems: "center",
    justifyContent: "space-around",
    width: windowWidth * 0.8,
    height: 40,
    alignSelf: "center",
  },
  uploadText: {
    fontSize: 18,
    color: "#000",
    textAlign: "center",
    fontFamily: commonStyle.Bold,
  },
  paginationContainer: {
    marginTop: -20,
  },
  uploadSubText: {
    color: "#cccccc",
    textAlign: "center",
    fontFamily: commonStyle.regular,
  },
  buttonsContainer: {
    // backgroundColor: 'tomato',
    width: windowWidth * 0.9,
    height: windowHeight * 0.3,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "space-around",
  },
  bottomTextContainer: {
    // backgroundColor: 'gold',
    width: windowWidth * 0.9,
    height: windowHeight * 0.1,
    alignSelf: "center",
  },
  bottomText: {
    fontFamily: commonStyle.regular,
    color: "#BCB8B1",
    fontSize: 14,
    margin: 10,
  },
  root: {
    height: 64,
    backgroundColor: "#00000077",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 17,
    color: "#FFF",
  },
  commentInput: {
    // backgroundColor: 'tomato',
    alignSelf: "center",
    width: windowWidth * 0.85,
    height: windowHeight * 0.1,
    textAlignVertical: "top",
    color: "#000",
    fontFamily: commonStyle.regular,
  },
});

export default ProductList;
