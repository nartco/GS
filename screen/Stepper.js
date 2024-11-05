import {
  View,
  Text,
  Touchable,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import React, { useState } from "react";
import StepIndicator from "react-native-step-indicator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
const windowWidth = Dimensions.get("window").width;

const customStyles = {
  stepIndicatorSize: 30,
  currentStepIndicatorSize: 30,
  separatorStrokeWidth: 1,
  currentStepStrokeWidth: 4.5,
  stepStrokeCurrentColor: "#2BA6E9",
  stepStrokeWidth: 5,
  stepStrokeFinishedColor: "#2BA6E9",
  stepStrokeUnFinishedColor: "#CBCBCB",
  separatorFinishedColor: "#7eaec4",
  separatorUnFinishedColor: "#dedede",
  stepIndicatorFinishedColor: "#FFF",
  stepIndicatorUnFinishedColor: "#CBCBCB",
  stepIndicatorCurrentColor: "#fff",
  stepIndicatorLabelFontSize: 0,
  currentStepIndicatorLabelFontSize: 0,
  stepIndicatorLabelCurrentColor: "transparent",
  stepIndicatorLabelFinishedColor: "transparent",
  stepIndicatorLabelUnFinishedColor: "transparent",
  labelColor: "#999999",
  labelSize: windowWidth * 0.024,
  currentStepLabelColor: "#000",
  labelFontFamily: "Poppins-Medium",
};

const Stepper = ({ position, Service, excludedSupplierIds, prices }) => {
  const { t, i18n } = useTranslation();

  const labels = [t("Panier"), t("Dépot"), t("Livraison"), t("Confirmation")];

  const labelsWithoutLivraison = [
    t("Panier"),
    t("Livraison"),
    t("Confirmation"),
  ];

  const navigation = useNavigation();
  const [currentPosition, setCurrentPosition] = useState(position);
  const onStepPress = async (position) => {
    setCurrentPosition(position);
    if (Service == "ventes-privees" || Service == "demandes-d-achat") {
      if (position === 0) {
        navigation.navigate("Cart", { screen: "WeightCal" });
      }
      if (position === 1) {
        let cartValidation = await AsyncStorage.getItem("cart_validation");

        if (!cartValidation) {
          return Alert.alert(
            t("Information"),
            t(
              "Vous devez valider le panier afin de pouvoir accéder à cette section"
            ),
            [
              {
                text: "OK",
                style: "cancel",
                onPress: () => {
                  setCurrentPosition(0);
                  return;
                },
              },
            ]
          );
        }

        navigation.navigate("Livraison1");
      }
      if (position === 2) {
        let depotValidation = await AsyncStorage.getItem(
          "cart_depotValidation"
        );

        if (!depotValidation) {
          return Alert.alert(
            t("Information"),
            t(
              "Vous devez completer les informations de dépôt afin de pouvoir accéder à cette section"
            ),
            [
              {
                text: "OK",
                style: "cancel",
                onPress: () => {
                  setCurrentPosition(1);
                  return;
                },
              },
            ]
          );
        }

        navigation.navigate("CheckoutScreen");
      }
    } else {
      if (position === 0) {
        navigation.navigate("Cart", { screen: "WeightCal" });
      }
      if (position === 1) {
        let cartValidation = await AsyncStorage.getItem("cart_validation");

        if (!cartValidation) {
          return Alert.alert(
            t("Information"),
            t(
              "Vous devez valider le panier afin de pouvoir accéder à cette section"
            ),
            [
              {
                text: "OK",
                style: "cancel",
                onPress: () => {
                  setCurrentPosition(0);
                  return;
                },
              },
            ]
          );
        }

        navigation.navigate("DepotScreen1", {
          prices,
          excludedSupplierIds,
        });
      }
      if (position === 2) {
        let depotValidation = await AsyncStorage.getItem(
          "cart_depotValidation"
        );

        if (!depotValidation) {
          return Alert.alert(
            t("Information"),
            t(
              "Vous devez completer les informations de dépôt afin de pouvoir accéder à cette section"
            ),
            [
              {
                text: "OK",
                style: "cancel",
                onPress: () => {
                  setCurrentPosition(1);
                  return;
                },
              },
            ]
          );
        }

        navigation.navigate("Livraison1");
      }
      if (position === 3) {
        let deliveryValidation = await AsyncStorage.getItem(
          "cart_deliveryValidation"
        );

        if (!deliveryValidation) {
          return Alert.alert(
            t("Information"),
            t(
              "Vous devez completer les informations de livraison afin de pouvoir accéder à cette section"
            ),
            [
              {
                text: "OK",
                style: "cancel",
                onPress: () => {
                  setCurrentPosition(2);
                  return;
                },
              },
            ]
          );
        }

        navigation.navigate("CheckoutScreen");
      }
    }
  };
  return (
    <View style={{ marginTop: 10 }}>
      <View style={{ width: windowWidth * 0.77, alignSelf: "center" }}>
        {Service == "ventes-privees" || Service == "demandes-d-achat" ? (
          <StepIndicator
            customStyles={customStyles}
            currentPosition={currentPosition}
            stepCount={3}
            labels={labelsWithoutLivraison}
            onPress={onStepPress}
          />
        ) : (
          <StepIndicator
            customStyles={customStyles}
            currentPosition={currentPosition}
            stepCount={4}
            labels={labels}
            onPress={onStepPress}
          />
        )}
      </View>
    </View>
  );
};

export default Stepper;
