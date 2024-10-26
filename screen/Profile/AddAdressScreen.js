import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  ToastAndroid,
  Platform,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  LayoutAnimation,
  UIManager,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useTranslation } from "react-i18next";
import auth from "@react-native-firebase/auth";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PhoneInput from "react-native-international-phone-number";
import axiosInstance from "../../axiosInstance";
import { HeaderActions } from "../../components/HeaderActions";
import { Dropdown } from "react-native-element-dropdown";
import { getAllCountries, Flag } from "react-native-country-picker-modal";
import { getPlatformLanguage } from "../../modules/GestionStorage";
import {
  getCitiesByPostalCode,
  searchCitiesByPartialName,
  searchCitiesByPostalCode,
  searchSpecificCity,
} from "../../components/SearchCityPostalCode";
import { validatePhoneNumber } from "../../components/ValidatePhoneNumber";
import { getCountryCodeFromPhone } from "../../components/getCountryCode";
import { debounce } from "lodash";
import { removeCountryCode } from "../../components/removeCountryCode";
import { searchCountry } from "../../components/searchCountry";
import * as Sentry from "@sentry/react-native";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const AddAdressScreen = (props) => {
  const { t, i18n } = useTranslation();

  const pageFrom = props.route.params.pageFrom;
  const paysDepartLivraison = props.route.params.paysDepartLivraison;
  const paysDepartLivraisonEN = props.route.params.paysDepartLivraisonEN;
  const prices = props.route?.params.prices;

  const [Adresse, setAdresse] = useState("");
  const [Pays, setPays] = useState(paysDepartLivraison);
  const [Ville, setVille] = useState("");
  const [CodePostal, setCodePostal] = useState("");
  const [AdresseLibelle, setAdresseLibelle] = useState("");
  const [AdresseNom, setAdresseNom] = useState("");
  const [AdresseTelephone, setAdresseTelephone] = useState("");
  const [AdressePays, setAdressePays] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [postalCodes, setPostalCodes] = useState([]);
  const [countryCode, setCountryCode] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("");
  const [language, setLanguage] = useState("fr");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState();
  const [error, setError] = useState(null);
  const [noVille, setNoVille] = useState(false);
  const [noCodePostal, setNoCodePostal] = useState(false);

  const libelleItems = [
    { label: t("Domicile"), value: t("Domicile") },
    { label: t("Bureau"), value: t("Bureau") },
    { label: t("Autre"), value: t("Autre") },
  ];

  const customLayoutAnimation = {
    duration: 300,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
    },
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [currentUser, currentLanguage, fetchedCountries] =
          await Promise.all([
            auth().currentUser,
            getPlatformLanguage(),
            getAllCountries(null, language === "fr" ? "fra" : "eng"),
          ]);

        setUser(currentUser);
        setLanguage(currentLanguage);
        setCountries(fetchedCountries);

        let paysToSelect =
          currentLanguage === "fr"
            ? paysDepartLivraison
            : paysDepartLivraisonEN;

        // let cca2 = fetchedCountries.find(
        //   country =>
        //     country?.name?.toLowerCase() === paysToSelect?.toLowerCase(),
        // )?.cca2;

        let cca2 = searchCountry(fetchedCountries, paysToSelect);

        console.log({ cca2 }, { paysToSelect }, "couneeetryCode");
        if (cca2) {
          setCountryCode(cca2.cca2);
          setPhoneCountryCode(cca2.cca2);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setError(t("Une erreur est survenue lors du chargement des données."));
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const debouncedCitySearch = useCallback(
    debounce(async (text) => {
      if (text.length < 2) return;

      try {
        const results = await searchCitiesByPartialName(text, countryCode);
        const formattedResults = results
          .filter((item) => item.name !== "Côte d'Ivoire")
          .map((item) => ({
            name: item.name,
            subName: item.subName,
            id: `${item.lat},${item.lon}`,
          }));
        if (formattedResults.length === 0) {
          const results = await searchCitiesByPartialName("", countryCode);
          if (results.length === 0) {
            setNoVille(() => true);
            formattedResults.push({ name: text, subName: text, id: text });
          }
        }
        LayoutAnimation.configureNext(customLayoutAnimation);
        setCities(formattedResults);
      } catch (error) {
        console.error("Erreur lors de la recherche de la ville:", error);
      } finally {
        setIsSearchingCity(false);
      }
    }, 300),
    [countryCode, handleCityChange]
  );

  const debouncedPostalCodeSearch = useCallback(
    debounce(async (text) => {
      if (text && text.length > 1) {
        try {
          let data = await searchCitiesByPostalCode(countryCode, text);
          console.log({ data }, "data");
          const formattedData = data.map((item) => ({
            ...item,
            libelleName: item.postalCode,
            name: item.placeName,
            concatenedName: item.postalCode + " " + item.placeName,
          }));

          if (formattedData.length === 0) {
            const results = await searchCitiesByPartialName("", countryCode);
            if (results.length === 0) {
              setNoCodePostal(true);
              formattedData.push({ libelleName: text, name: text });
            }
          }
          setPostalCodes(formattedData);
        } catch (error) {
          console.error("Erreur lors de la recherche du code postal:", error);
        }
      }
    }, 300),
    [countryCode]
  );

  const handleCityChange = useCallback((item) => {
    LayoutAnimation.configureNext(customLayoutAnimation);
    setVille(item.subName);
  }, []);

  const handlePostalCodeChange = useCallback((item) => {
    console.log({ item });
    LayoutAnimation.configureNext(customLayoutAnimation);
    setCodePostal(item.postalCode);
    setCities([item]);
    setVille(item.placeName);
  }, []);

  const AddNewAddress = async () => {
    try {
      const phoneValidation = validatePhoneNumber(AdresseTelephone);

      if (
        AdresseTelephone &&
        AdresseTelephone.length > 4 &&
        !phoneValidation.isValid
      ) {
        throw new Error(t("Veuillez saisir un téléphone valide"));
      }

      if (!Adresse || !Ville) {
        throw new Error(t("La ville et l'adresse sont obligatoires !"));
      }

      if (countryCode === "FR" && (!CodePostal || CodePostal.length < 5)) {
        throw new Error(t("Le code Postal est obligatoire"));
      }

      if (
        (["carnetAdresse", "summary"].includes(pageFrom) && !AdressePays) ||
        (!["carnetAdresse", "summary"].includes(pageFrom) && !Pays)
      ) {
        throw new Error(t("Le pays est obligatoire"));
      }

      let concatenedPhone =
        selectedCountry?.callingCode + removeCountryCode(AdresseTelephone);
      console.log({ countryCode });
      const countryCode2 = searchCountry(countries, paysDepartLivraison);
      console.log({ countryCode2 }, { countryCode }, "ici");
      const response = await axiosInstance.post("/adresses/new", {
        libelle: AdresseLibelle,
        nom: AdresseNom,
        telephone: concatenedPhone,
        pays: ["carnetAdresse", "summary"].includes(pageFrom)
          ? AdressePays === `Côte d'Ivoire`
            ? "Côte d'Ivoire"
            : AdressePays
          : Pays,
        ville: Ville,
        codePostal: CodePostal,
        adresse: Adresse,
        client: user?.uid,
        countryCode: countryCode ? countryCode : countryCode2?.cca2,
      });

      if (Platform.OS === "ios") {
        Toast.show({
          type: "success",
          text1: t("Succès"),
          text2: t("Adresse ajoutée"),
        });
      } else {
        ToastAndroid.show(t("Adresse ajoutée"), ToastAndroid.SHORT);
      }

      await setStorageAndBackToPreviousPage(response?.data);
    } catch (error) {
      Sentry.captureException(error);
      Sentry.setContext("addressData", {
        Adresse,
        Ville,
        CodePostal,
        AdresseLibelle,
        AdresseNom,
        AdresseTelephone,
        AdressePays,
      });

      console.error("Erreur lors de l'enregistrement", error.response?.data);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        t("Une erreur est survenue");
      if (Platform.OS === "ios") {
        Toast.show({
          type: "error",
          text1: t("Erreur"),
          text2: errorMessage,
        });
      } else {
        ToastAndroid.show(errorMessage, ToastAndroid.LONG);
      }
    }
  };

  const setStorageAndBackToPreviousPage = async (adresse) => {
    try {
      await AsyncStorage.setItem("newAddedAdresse", JSON.stringify(adresse));

      if (pageFrom === "depot") {
        props.navigation.navigate("DepotScreen1", {
          newAddressAdded: true,
          prices: prices,
        });
      } else if (pageFrom === "carnetAdresse") {
        props.navigation.navigate("AdresseScreen", { pageForm: "updated" });
      } else if (pageFrom === "summary") {
        props.navigation.goBack();
      } else {
        props.navigation.navigate("Livraison1", { newAddressAdded: true });
      }
    } catch (error) {
      console.error("Error saving address to storage:", error);
      // Handle the error appropriately
    }
  };

  const returnPage = () => {
    if (pageFrom === "depot") {
      props.navigation.navigate("DepotScreen1", {
        newAddressAdded: false,
        prices: prices,
      });
    } else if (pageFrom === "carnetAdresse") {
      props.navigation.navigate("AdresseScreen");
    } else if (pageFrom === "summary") {
      props.navigation.goBack();
    } else {
      props.navigation.navigate("Livraison1", { newAddressAdded: false });
    }
  };

  const renderCountryItem = (item) => (
    <View style={styles.countryItem}>
      <Flag countryCode={item.cca2} style={styles.flag} />
      <Text style={styles.countryName}>{item.name}</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#3292E0" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "position" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? -300 : 0} // Ajustez cette valeur selon votre header
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <HeaderActions navigation={returnPage} />

        <View style={{ flex: 1, marginBottom: 150 }}>
          <View style={{ marginTop: 30, marginBottom: 12 }}>
            <Text style={styles.titleText}>
              {t("Veuillez créer un address")}
            </Text>
          </View>
          {["carnetAdresse", "summary"].includes(pageFrom) ? (
            <View style={styles.inputContainer}>
              <Dropdown
                style={[styles.dropdown]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                autoScroll
                iconStyle={styles.iconStyle}
                containerStyle={styles.containerDepotStyle}
                itemTextStyle={{ color: "#000" }}
                data={countries}
                maxHeight={450}
                labelField="name"
                valueField="name"
                placeholder={t("Pays")}
                value={AdressePays}
                showsVerticalScrollIndicator={false}
                onFocus={() => setIsOpen(true)}
                onBlur={() => setIsOpen(false)}
                onChange={(item) => {
                  setNoCodePostal(false);
                  setNoVille(false);
                  console.log({ item });
                  setPays(item.cca2);
                  setAdressePays(item.name);
                  setCountryCode(item.cca2);
                  setPhoneCountryCode(item.cca2);
                }}
                renderItem={renderCountryItem}
                search
                searchPlaceholder={t("Chercher un pays")}
              />
            </View>
          ) : (
            <View style={styles.inputPaysContainer}>
              <Text>{paysDepartLivraison}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Dropdown
              style={[styles.dropdown]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              autoScroll
              iconStyle={styles.iconStyle}
              containerStyle={styles.containerDepotStyle}
              itemTextStyle={{ color: "#000" }}
              data={libelleItems}
              maxHeight={450}
              labelField="label"
              valueField="value"
              placeholder={t("Libellé adresse")}
              value={AdresseLibelle}
              showsVerticalScrollIndicator={false}
              onFocus={() => setIsOpen(true)}
              onBlur={() => setIsOpen(false)}
              onChange={(item) => {
                setAdresseLibelle(item.value);
              }}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder={t("Prénom Nom adresse")}
              value={AdresseNom}
              style={styles.textInput}
              placeholderTextColor="#B0B0C3"
              keyboardType="ascii-capable"
              keyboardAppearance={"default"}
              onChangeText={(newText) => setAdresseNom(newText)}
            />
          </View>

          <View style={styles.inputContainer}>
            <PhoneInput
              language={i18n.language}
              containerStyle={styles.countryPickerContainerStyle}
              textInputStyle={styles.textInput}
              defaultCountry={getCountryCodeFromPhone(AdresseTelephone) ?? "FR"}
              selectedCountry={selectedCountry}
              onChangeSelectedCountry={(country) => {
                setSelectedCountry(country);
              }}
              value={AdresseTelephone}
              onChangePhoneNumber={(text) => {
                setAdresseTelephone(text);
              }}
            />
          </View>

          <View style={styles.inputContainer}>
            {countryCode === "FR" ? (
              <Dropdown
                style={[styles.dropdown]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                autoScroll
                iconStyle={styles.iconStyle}
                containerStyle={styles.containerDepotStyle}
                itemTextStyle={{ color: "#000" }}
                data={postalCodes}
                maxHeight={450}
                labelField={isOpen ? "concatenedName" : "libelleName"}
                valueField="postalCode"
                placeholder={`${t("Code postal")} ${
                  Pays === "FR" || paysDepartLivraison === "France" ? "*" : ""
                }`}
                renderRightIcon={() => <View style={{ width: 10 }} />}
                value={CodePostal}
                showsVerticalScrollIndicator={false}
                onFocus={() => setIsOpen(true)}
                onBlur={() => setIsOpen(false)}
                onChange={handlePostalCodeChange}
                search
                searchPlaceholder={t("Chercher un code postal")}
                onChangeText={debouncedPostalCodeSearch}
              />
            ) : (
              <TextInput
                placeholder={t("Code postal")}
                value={CodePostal}
                style={styles.textInput}
                placeholderTextColor="#B0B0C3"
                keyboardType="ascii-capable"
                keyboardAppearance={"default"}
                onChangeText={(newText) => setCodePostal(newText)}
              />
            )}
          </View>

          <View style={styles.inputContainer}>
            <Dropdown
              style={[styles.dropdown]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              autoScroll
              iconStyle={styles.iconStyle}
              containerStyle={styles.containerDepotStyle}
              itemTextStyle={{ color: "#000" }}
              data={cities ?? []}
              maxHeight={450}
              labelField="name"
              valueField="name"
              placeholder={"Commune " + "(" + t("Ville") + ")" + "*"}
              value={Ville}
              showsVerticalScrollIndicator={false}
              onFocus={() => setIsOpen(true)}
              onBlur={() => {
                setIsOpen(false);
                setIsSearchingCity(false);
              }}
              onChange={handleCityChange}
              search
              searchPlaceholder={t("Chercher une ville")}
              onChangeText={(Ville) => {
                if (!noVille) setIsSearchingCity(true);
                debouncedCitySearch(Ville);
              }}
              renderLeftIcon={() =>
                isSearchingCity ? (
                  <ActivityIndicator size="small" color="#0000ff" />
                ) : null
              }
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder={t("Adresse") + "*"}
              value={Adresse}
              style={styles.textInput}
              placeholderTextColor="#B0B0C3"
              keyboardType="ascii-capable"
              keyboardAppearance={"default"}
              onChangeText={(newText) => setAdresse(newText)}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.addButton} onPress={AddNewAddress}>
              <Text style={styles.addButtonText}>{t("Ajouter Address")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  titleText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#000",
    textAlign: "center",
  },
  inputContainer: {
    width: windowWidth * 0.8,
    backgroundColor: "rgba(173, 173, 173, 0.2)",
    alignSelf: "center",
    borderRadius: 6,
    marginTop: "3%",
  },
  inputPaysContainer: {
    width: windowWidth * 0.8,
    alignSelf: "center",
    borderRadius: 6,
    marginTop: "3%",
  },
  dropdown: {
    borderRadius: 7,
    paddingHorizontal: 17,
    width: windowWidth * 0.8,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#AAB0B7",
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#000",
    paddingLeft: 15,
    borderRadius: 8,
    backgroundColor: "#fff",
    height: 45,
  },
  containerDepotStyle: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderColor: "transparent",
  },
  placeholderStyle: {
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    color: "#B0B0C3",
  },
  selectedTextStyle: {
    fontSize: 16,
    fontFamily: "Roboto-Regular",
    color: "#14213D",
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#AAB0B7",
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#000",
    paddingLeft: 15,
    borderRadius: 8,
    backgroundColor: "#fff",
    height: 45,
  },
  countryPickerContainerStyle: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 3,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  flag: {
    marginRight: 10,
    fontSize: 18,
  },
  countryName: {
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 50,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 50,
  },
  addButton: {
    paddingVertical: 8,
    paddingHorizontal: 22,
    width: windowWidth * 0.45,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4E8FDA",
    borderRadius: 25,
  },
  addButtonText: {
    fontFamily: "Poppins-Medium",
    textAlign: "center",
    fontSize: 12,
    color: "#fff",
  },
});

export default Sentry.withProfiler(AddAdressScreen);
