//import liraries
import React, { useEffect, useRef, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Alert,
  Image,
  ToastAndroid,
  Platform,
} from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";

import { Dropdown } from "react-native-element-dropdown";
import Modal from "react-native-modal";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { afficherMessageProduitServiceDifferent } from "../../modules/RegleGestion";
import {
  removePanier,
  savePanier,
  getPanier,
  getParametrages,
  removeCommand,
  getCommand,
  saveSelectedCountryProduct,
  saveSelectedServiceProduct,
} from "../../modules/GestionStorage";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Button from "../../components/Button";
import DropDownPicker from "react-native-dropdown-picker";
import { onAuthStateChanged } from "firebase/auth";
import auth from "@react-native-firebase/auth";
import Feather from "react-native-vector-icons/Feather";
import { useBag } from "../../modules/BagContext";
import CurrencyInput from "react-native-currency-input";
const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
import Carousel, { Pagination } from "react-native-snap-carousel";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";

import { ImageGallery } from "@georstat/react-native-image-gallery";
// create a component
const ByPlaneDetailsComponentGrid = (props) => {
  const { setBagCount, bagCount } = useBag();

  // Donnée statique
  const navigation = props.navigation;
  const Service = props.service;
  const PaysLivraison = props.paysLivraison;
  const Language = props.language;
  const ServiceSelected = props.selectedService;
  const Product = props.data;
  const Images = Product.productImages;
  const [user, setUser] = useState([]);
  const [ispenModal, setOpenModal] = useState(false);

  const productSpecificites = Product.productSpecificites
    ? Product.productSpecificites[0]
    : null;

  const douane = productSpecificites ? productSpecificites.douane : null;

  const quantiteMax = productSpecificites
    ? productSpecificites.quantiteMax
    : 400;

  const [isOpen, setIsOpen] = useState(false);

  const openGallery = () => setIsOpen(true);
  const closeGallery = () => setIsOpen(false);

  // Pour la gestion de la langue
  const { t } = useTranslation();

  const data = [
    { label: t("Neuf"), value: "New" },
    { label: t("Usagé"), value: "Used" },
  ];

  useEffect(() => {
    const currentUser = auth().currentUser;
    setUser(currentUser);
  }, []);

  // Donnée dynamique
  const [StateValue, setStateValue] = useState(null);
  const [QuantitySelected, setQuantitySelected] = useState(null);
  const [productValue, setProductValue] = useState(null);
  const [userImage, setUserImage] = useState("");
  const [active, setActive] = useState(0);
  const [isModalVisible, setModalVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeIndexModal, setActiveIndexModal] = useState(0);
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [modalVisiblePhoto, setModalVisiblePhoto] = useState(false);
  const isCarousel = useRef(0);
  const isCarouselModal = useRef(0);
  const [isOpenModal, setIsOpenModal] = useState({});
  const IOSPLAt = Platform.OS;

  // Gestion du scroll
  const Change = (nativeEvent) => {
    const slide = Math.ceil(
      nativeEvent.contentOffset.x / nativeEvent.layoutMeasurement.width
    );
    if (slide !== active) {
      setActive(slide);
    }
  };

  // Build quantity label

  const arrayOFF = Array.from(Array(quantiteMax).keys());

  const sweeterArray = arrayOFF.map((arrayOFF) => {
    let label = arrayOFF + 1;

    if (Product.unite && Product.unite.valeur.toLowerCase() != "unité") {
      if (label > 1) {
        label = label.toString() + " " + Product.unite.valeur + "(s)";
      } else {
        label = label.toString() + " " + Product.unite.valeur;
      }
    }

    return { label: label.toString(), value: arrayOFF + 1 };
  });

  // Modal
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  // Camera
  const selectImageFromGallery = () => {
    let options = {
      storageOptions: {
        path: "image",
      },
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel == true) {
        setUserImage("");
      } else {
        setUserImage(response.assets[0].uri);
        if (IOSPLAt == "ios") {
          Toast.show({
            type: "success",
            text1: t("Image"),
            text2: t("Image ajoutée"),
          });
        } else {
          ToastAndroid.show(t("Image ajoutée"), ToastAndroid.SHORT);
        }
        setModalVisible(!isModalVisible);
      }
    });
  };

  const openCameraForPicture = () => {
    let options = {
      width: 300,
      height: 400,
      storageOptions: {
        path: "image",
      },
    };
    launchCamera(options, (response) => {
      if (response.didCancel == true) {
        setUserImage("");
      } else {
        setUserImage(response.assets[0].uri);
        if (IOSPLAt == "ios") {
          Toast.show({
            type: "success",
            text1: t("Image"),
            text2: t("Image ajoutée"),
          });
        } else {
          ToastAndroid.show(t("Image ajoutée"), ToastAndroid.SHORT);
        }
        setModalVisible(!isModalVisible);
      }
    });
  };

  openModal = () => {
    setModalVisiblePhoto(true);
  };

  closeModal = () => {
    setModalVisiblePhoto(false);
  };

  // Afficher un message des frais de douane à prevoir
  const showDouaneMessage = async (item) => {
    if (!douane) {
      return false;
    }

    let parametrages = await getParametrages();

    if ("New" == item) {
      if (!parametrages.messageFraisDouane) {
        return console.log("Nothing");
      }

      if (douane.forfait > 0 || douane.coefficient > 0) {
        if (IOSPLAt == "ios") {
          return Toast.show({
            type: "info",
            text1: t("Information"),
            text2: parametrages.messageFraisDouane,
          });
        } else {
          return ToastAndroid.show(
            parametrages.messageFraisDouane,
            ToastAndroid.SHORT
          );
        }
      }
    }

    if ("Used" == item) {
      if (!parametrages.messageFraisUsageDouane) {
        return console.log("Nothing Used");
      }

      if (
        douane.forfaitProduitOccasion > 0 ||
        douane.coefficientProduitOccasion > 0
      ) {
        if (IOSPLAt == "ios") {
          return Toast.show({
            type: "info",
            text1: t("Information"),
            text2: parametrages.messageFraisUsageDouane,
          });
        } else {
          return ToastAndroid.show(
            parametrages.messageFraisUsageDouane,
            ToastAndroid.SHORT
          );
        }
      }
    }

    return false;
  };

  const handleAmountChange = (text) => {
    // Remove non-numeric characters from the input
    const numericValue = text.replace(/[^0-9]/g, "");

    // Add "$" symbol to the formatted value
    const formattedAmount = formatCurrency(numericValue);

    // Update the state
    setProductValue(formattedAmount);
  };

  const formatCurrency = (value) => {
    // Remove leading zeros and trailing dots
    let formattedValue = value.replace(/^0+/, "").replace(/\.+$/, "");

    // Split the value into integer and decimal parts
    const [integerPart, decimalPart] = formattedValue.split(".");

    // Limit decimal places to 2
    const limitedDecimalPart = decimalPart ? `.${decimalPart.slice(0, 2)}` : "";

    // Add commas to the integer part for better readability
    const numberWithCommas = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Combine the formatted parts
    formattedValue = numberWithCommas + limitedDecimalPart;

    // Add "$" symbol
    return formattedValue ? `${formattedValue}€` : "";
  };

  // Vider le panier
  const handleCartRemove = async () => {
    await removePanier();
    await removeCommand();
    handleCart();
  };
  // Ajouter les produits au panier
  const handleCartLogin = async () => {
    if (!QuantitySelected) {
      if (IOSPLAt == "ios") {
        Toast.show({
          type: "error",
          text1: t("Quantity"),
          text2: t("La quantité est obligatoire !"),
        });
      } else {
        ToastAndroid.show(
          t("La quantité est obligatoire !"),
          ToastAndroid.SHORT
        );
      }

      return;
    }

    if (!StateValue) {
      if (IOSPLAt == "ios") {
        Toast.show({
          type: "error",
          text1: t("Etat"),
          text2: t("L'état du produit est obligatoire !"),
        });
      } else {
        ToastAndroid.show(
          t("L'état du produit est obligatoire !"),
          ToastAndroid.SHORT
        );
      }
      return;
    }

    if (douane) {
      let coefficientDouane =
        "New" == StateValue
          ? douane.coefficient
          : douane.coefficientProduitOccasion;

      if (coefficientDouane && !productValue) {
        if (IOSPLAt == "ios") {
          Toast.show({
            type: "error",
            text1: t("Valeur"),
            text2: t("La valeur est obligatoire !"),
          });
        } else {
          ToastAndroid.show(
            t("La valeur est obligatoire !"),
            ToastAndroid.SHORT
          );
        }

        return;
      }
    }

    try {
      let BasketCommand = await getCommand();

      let isProductFromDifferentService =
        await afficherMessageProduitServiceDifferent(Service, PaysLivraison);

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
                  setBagCount(0);
                  handleCartRemove();
                  return;
                },
              },
            ]
          );
        }
      }
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
              onPress: () => {
                setBagCount(0);

                handleCartRemove();
                return;
              },
            },
          ]
        );
      }

      await removeCommand();
      // Sauvegarder dans le panier
      handleCart();
    } catch (e) {
      console.log("add cart error", e);
    }
  };

  // Ajout au panier
  const handleCart = async () => {
    await saveSelectedCountryProduct(PaysLivraison);
    await saveSelectedServiceProduct(ServiceSelected);

    let CatProducts = [];

    let match = false;

    const obj = {
      ID: (Math.random() + 1).toString(36).substring(7),
      product: Product,
      ProductId: Product.id,
      ProductImage: Product.productImages,
      discount: Product.discount,
      stateValue: StateValue,
      quantiteMax: quantiteMax,
      quantite: QuantitySelected,
      productValue: productValue,
      service: Service,
      image: userImage,
      paysLivraison: PaysLivraison,
      Price: productSpecificites ? productSpecificites.prix : null,
    };

    CatProducts.push(obj);

    let basketData = await getPanier();

    let success = false;

    if (basketData.length == 0) {
      await savePanier(CatProducts);
      if (IOSPLAt == "ios") {
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
      setBagCount((prev) => prev + 1);
      success = true;
    } else {
      basketData.map((ls) => {
        if (
          ls.product.name === obj.product.name &&
          ls.product.productCategories[0].name ===
            obj.product.productCategories[0].name &&
          ls.stateValue === obj.stateValue
        ) {
          match = true;
        }
      });

      if (match === true) {
        if (IOSPLAt == "ios") {
          Toast.show({
            type: "error",
            text1: t("Info"),
            text2: t("Ce produit a déjà été ajouté"),
          });
        } else {
          ToastAndroid.show(
            t("Ce produit a déjà été ajouté"),
            ToastAndroid.SHORT
          );
        }
      } else {
        basketData.push(obj);

        await savePanier(basketData);

        if (IOSPLAt == "ios") {
          Toast.show({
            type: "success",
            text1: t("Succés"),
            text2: t("Ajouter au panier avec succès"),
          });
        } else {
          ToastAndroid.show(
            t("Ajouter au panier avec succès"),
            ToastAndroid.SHORT
          );
        }
        setBagCount((prev) => prev + 1);
        success = true;
      }
    }

    if (success) {
      // Not Login
      if (user === null) {
        navigation.navigate("Login", { fromCart: "cart" });
        return; //should never reach
      }
    }
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

  const [currentImageIndex, setCurrentImageIndex] = useState({});

  const openImageView = (productIndex, imageIndex) => {
    setIsOpenModal((prev) => ({ ...prev, [productIndex]: true }));
    setCurrentImageIndex((prev) => ({ ...prev, [productIndex]: imageIndex }));
  };

  const renderItem = ({ item, index }, productIndex) => {
    return (
      <TouchableOpacity
        style={{
          borderRadius: 5,
          paddingHorizontal: 50,
          paddingVertical: 30,
        }}
        onPress={openGallery}
      >
        <Image
          source={{ uri: item.url }}
          style={{
            height: wp(21),
            borderRadius: 22,
            width: wp(19),
            justifyContent: "center",
            alignSelf: "center",
          }}
          resizeMode={"contain"}
        />
      </TouchableOpacity>
    );
  };

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

  return (
    <>
      <View
        style={{
          backgroundColor: "#fff",
          margin: 4.5,
          borderRadius: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            height: windowHeight * 0.075,
            justifyContent: "space-between",
            gap: 10,
            paddingTop: 16,
            paddingLeft: 6,
            paddingRight: 6,
          }}
        >
          <View style={{ maxWidth: wp(25.5) }}>
            <Text
              style={{
                fontFamily: "Poppins-SemiBold",
                textAlign: "left",
                fontSize: 9.1,
                color: "#60be74",
              }}
            >
              {"fr" == Language ? Product.name : Product.nameEN}
            </Text>
          </View>
          <View
            style={{ flexDirection: "column", alignItems: "center", gap: 2 }}
          >
            <View>
              <Text
                style={{
                  fontSize: 9,
                  fontFamily: "Poppins-Bold",
                  color: "#000",
                }}
              >
                {productSpecificites
                  ? formatPrice(productSpecificites.prix)
                  : 0}
                €/{Product.unite ? Product.unite.valeur : ""}
              </Text>
            </View>
            <View>
              {productSpecificites && productSpecificites.prixAncien ? (
                <Text
                  style={{
                    fontSize: 9,
                    fontFamily: "Poppins-Bold",
                    color: "#000",
                    textDecorationLine: "line-through",
                  }}
                >
                  {productSpecificites.prixAncien}€/
                  {Product.unite ? Product.unite.valeur : ""}
                </Text>
              ) : (
                <></>
              )}
            </View>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingBottom: 8,
            paddingLeft: 6,
          }}
        >
          {/* <View style={{backgroundColor: "#F5F5F5", height: hp(14), width: wp(20), borderRadius: 20, paddingTop: 10}}>
              <Image source={{uri: item.productImages[0].url}} style={{height: hp(12),objectFit: "cover" ,borderRadius: 22, width: wp(19)}}/>
              </View> */}
          <View>
            <Carousel
              layout={"default"}
              ref={isCarousel}
              style={styles.imageSwiper}
              data={Images}
              sliderWidth={windowWidth * 0.2}
              itemWidth={windowWidth * 0.2}
              renderItem={(item) => renderItem(item, Product.id)}
              onSnapToItem={(index) => setActiveIndex(index)}
            />
            <Pagination
              dotsLength={Images.length}
              activeDotIndex={activeIndex}
              containerStyle={{
                position: "absolute",
                bottom: 0,
                width: windowWidth * 0.3,
                alignSelf: "center",
              }}
              dotColor={"rgba(255, 255, 255, 0.92)"}
              // inactiveDotColor={'rgba(255, 255, 255, 1)'}
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
              carouselRef={isCarousel}
            />
            <ImageGallery
              close={closeGallery}
              images={Images}
              isOpen={isOpen}
              resizeMode="contain"
              renderHeaderComponent={renderHeader}
            />
          </View>
          <View
            style={{
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              paddingRight: 6,
            }}
          >
            <View style={styles.safeContainerStyle}>
              <DropDownPicker
                items={data}
                open={open2}
                setOpen={() => setOpen2(!open2)}
                value={StateValue}
                setValue={(val) => setStateValue(val)}
                placeholder={t("etat")}
                placeholderStyle={{ fontSize: wp(3), fontWeight: "500" }}
                maxHeight={100}
                autoScroll
                style={{
                  backgroundColor: "#F5F5F5",
                  borderColor: "transparent",
                  padding: 0,
                  position: "relative",
                  zIndex: 1000,
                }}
                dropDownContainerStyle={{
                  backgroundColor: "#F5F5F5",
                  borderColor: "transparent",
                  fontSize: 54,
                }}
                onSelectItem={(item) => {
                  showDouaneMessage(item.value);
                  setStateValue(item.value);
                }}
              />
            </View>

            <View style={styles.safeContainerStyle}>
              <Dropdown
                data={sweeterArray}
                value={QuantitySelected}
                placeholder={t("Quantité")}
                placeholderStyle={[
                  styles.placeholderStyle,
                  { fontSize: wp(3) },
                ]}
                selectedTextStyle={[
                  styles.selectedTextStyle,
                  { fontSize: wp(3) },
                ]}
                onChange={(text) => setQuantitySelected(text)}
                autoScroll
                containerStyle={[styles.containerStyle]}
                itemTextStyle={{ fontSize: wp(3.5), color: "#000" }}
                labelField="label"
                valueField="value"
                maxHeight={120}
                style={styles.dropdown}
                dropDownContainerStyle={{
                  backgroundColor: "#F5F5F5",
                  borderColor: "transparent",
                  fontSize: 54,
                }}
              />
            </View>
            <View
              style={[
                styles.inputContainer,
                { position: "relative", zIndex: -10, flexDirection: "row" },
              ]}
            >
              {/* <TextInput
                      placeholder={t('valeur')}
                      keyboardType="numeric"
                      placeholderTextColor={'#14213D'}
                      style={styles.inputStyle}
                      value={productValue}
                      onChangeText={handleAmountChange}

                        /> */}
              <CurrencyInput
                value={productValue}
                placeholder={t("valeur")}
                placeholderTextColor={"#000"}
                suffix={"€"}
                delimiter={Language == "fr" ? " " : ","}
                precision={2}
                separator={Language == "fr" ? "," : "."}
                // separator={"."}
                style={{ color: "#000", paddingLeft: 15 }}
              />
              <TextInput
                value={productValue}
                maxLength={6}
                onChangeText={setProductValue}
                keyboardType="numbers-and-punctuation"
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  height: "100%",
                  color: "transparent",
                  backgroundColor: "transparent",
                  paddingHorizontal: 15,
                }}
              />
            </View>
          </View>
        </View>

        <View
          style={{
            marginTop: 8,
            width: "100%",
            position: "relative",
            zIndex: -10,
            marginBottom: 4,
            paddingHorizontal: 8,
          }}
        >
          <TouchableOpacity
            style={{
              paddingVertical: 8,
              paddingHorizontal: 22,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              backgroundColor: "transparent",
              borderWidth: 1,
              borderColor: "#4E8FDA",
              color: "#4E8FDA",
              borderRadius: 25,
            }}
            onPress={toggleModal}
          >
            <View>
              <FontAwesome5 name="camera" size={15} color="#4E8FDA" />
            </View>
            <Text
              style={{
                fontFamily: "Poppins-Medium",
                fontSize: wp(2.8),
                color: "#4E8FDA",
              }}
            >
              {t("prendre photo")}
            </Text>
            {
              <View>
                <Modal
                  isVisible={isModalVisible}
                  backdropOpacity={0.4}
                  animationIn={"fadeInUp"}
                  animationInTiming={600}
                  animationOut={"fadeOutDown"}
                  animationOutTiming={600}
                  useNativeDriver={true}
                >
                  <View style={styles.ModalContainer}>
                    <View style={styles.uploadContainer}>
                      <Text style={styles.uploadText}>
                        {t("Télécharger une photo")}
                      </Text>
                      <Text style={styles.uploadSubText}>
                        {t("Choisissez une image")}
                      </Text>
                    </View>
                    <View style={styles.buttonsContainer}>
                      <TouchableOpacity
                        style={{
                          paddingVertical: 8,
                          width: "100%",
                          paddingHorizontal: 22,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 10,
                          backgroundColor: "transparent",
                          borderWidth: 1,
                          borderColor: "#4E8FDA",
                          color: "#4E8FDA",
                          borderRadius: 25,
                        }}
                        onPress={() => {
                          selectImageFromGallery();
                        }}
                      >
                        <FontAwesome5 name="image" size={20} color="#4E8FDA" />
                        <Text
                          style={{
                            fontFamily: "Poppins-Medium",
                            fontSize: 12,
                            color: "#4E8FDA",
                          }}
                        >
                          {t("Choisir une image dans la galerie")}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          paddingVertical: 8,
                          width: "100%",
                          paddingHorizontal: 22,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 10,
                          backgroundColor: "transparent",
                          borderWidth: 1,
                          borderColor: "#4E8FDA",
                          color: "#4E8FDA",
                          borderRadius: 25,
                        }}
                        onPress={() => {
                          openCameraForPicture();
                        }}
                      >
                        <FontAwesome5 name="camera" size={20} color="#4E8FDA" />
                        <Text
                          style={{
                            fontFamily: "Poppins-Medium",
                            fontSize: 12,
                            color: "#4E8FDA",
                          }}
                        >
                          {t("Ouvrir la caméra")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={toggleModal}
                    >
                      <Feather name="x" color={"#000"} size={20} />
                    </TouchableOpacity>
                  </View>
                </Modal>
              </View>
            }
          </TouchableOpacity>
        </View>
        <View
          style={{
            marginTop: 8,
            width: "100%",
            position: "relative",
            zIndex: -10,
            paddingHorizontal: 8,
            paddingBottom: 10,
          }}
        >
          <Button
            title={t("ajouter au panier")}
            navigation={() => handleCartLogin()}
          />
        </View>
      </View>
    </>
  );
};

// define your styles
const styles = StyleSheet.create({
  DetailsContainer: {
    backgroundColor: "#F4F6F8",
    width: windowWidth * 0.95,
    height: windowHeight * 0.5,
    marginTop: windowHeight * 0.03,
    borderRadius: 28,
    elevation: 1,
  },
  safeContainerStyle: {
    justifyContent: "center",
    // backgroundColor: 'tomato',
    width: windowWidth * 0.25,
    // borderRadius:0
    marginTop: 5,
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
    flexDirection: "row",
    // backgroundColor: 'tomato',
    height: windowHeight * 0.08,
    width: windowWidth * 0.8,
    alignItems: "flex-start",
    justifyContent: "space-around",
  },
  detailNameText: {
    color: "#000",
    fontFamily: "Roboto-Regular",
    fontSize: 14,
    // backgroundColor: 'tomato',
    margin: 2,
    marginLeft: "10%",
    width: windowWidth * 0.6,
  },
  discountPriceText: {
    color: "#000",
    fontFamily: "Roboto-Regular",
    fontSize: 13,
    // backgroundColor: 'tomato',
    margin: 2,
  },
  priceText: {
    color: "#000",
    fontFamily: "Roboto-Regular",
    fontSize: 13,
    textDecorationLine: "line-through",
    // backgroundColor: 'tomato',
    margin: 2,
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
    // backgroundColor: 'tomato',
    width: windowWidth * 0.4,
    height: windowHeight * 0.3,
  },
  imageSwiper: {
    // backgroundColor: 'gold',
    width: windowWidth * 0.2,
    height: windowHeight * 0.2,
    borderRadius: 10,
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
  imageSwipergGrid: {
    // backgroundColor: 'gold',
    width: windowWidth * 0.12,
    height: windowHeight * 0.15,
    borderRadius: 10,
  },
  dotStyle: {
    flexDirection: "row",
    position: "absolute",
    zIndex: 1500,
    bottom: windowHeight * wp(0.02),
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
    height: windowHeight * 0.33,
    alignItems: "center",
    justifyContent: "space-around",
  },
  inputContainer: {
    backgroundColor: "#F5F5F5",
    width: windowWidth * 0.25,
    height: 40,
    borderRadius: 10,
    marginTop: 8,
  },
  inputStyle: {
    padding: 10,
    color: "#000",
    fontFamily: "Roboto-Regular",
    marginLeft: 10,
    fontSize: wp(2.9),
  },
  buttonContainers: {
    backgroundColor: "#3292E0",
    height: windowHeight * 0.04,
    width: windowWidth * 0.45,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
  },
  buttonUploadContainers: {
    backgroundColor: "#1A6CAF",
    height: windowHeight * 0.04,
    width: windowWidth * 0.45,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
    // marginTop:10
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
    fontSize: 11,
    color: "#fff",
    fontFamily: "Roboto-Regular",
    // backgroundColor: 'tomato',
    width: windowWidth * 0.4,
    textAlign: "center",
  },
  dropdown: {
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#F5F5F5",
    marginBottom: 5,
  },
  placeholderStyle: {
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    color: "#14213D",
  },
  selectedTextStyle: {
    fontSize: 14,
    fontFamily: "Roboto-Regular",
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
    height: windowHeight * 0.3,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignSelf: "center",
    alignItems: "center",
    paddingTop: 20,
    // justifyContent: 'space-around',
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
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    position: "absolute",
    top: 10,
    right: 10,
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
    fontSize: 14,
    color: "#000",
    textAlign: "center",
    fontFamily: "Poppins-Bold",
  },
  uploadSubText: {
    color: "#cccccc",
    textAlign: "center",
    fontFamily: "Roboto-Regular",
  },
  buttonsContainer: {
    // backgroundColor: 'tomato',
    width: windowWidth * 0.7,
    alignItems: "center",
    gap: 12,
    justifyContent: "center",
    marginTop: 50,
  },
  bottomTextContainer: {
    // backgroundColor: 'gold',
    width: windowWidth * 0.9,
    height: windowHeight * 0.1,
    alignSelf: "center",
  },
  bottomText: {
    fontFamily: "Roboto-Regular",
    color: "#BCB8B1",
    fontSize: 14,
    margin: 10,
  },
  commentInput: {
    // backgroundColor: 'tomato',
    alignSelf: "center",
    width: windowWidth * 0.85,
    height: windowHeight * 0.1,
    textAlignVertical: "top",
    color: "#000",
    fontFamily: "Roboto-Regular",
  },
});

//make this component available to the app
export default ByPlaneDetailsComponentGrid;
