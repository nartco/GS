//import liraries
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
  Platform,
} from "react-native";
import CountryFlag from "./CountryFlag";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import France from "../assets/images/france.png";
import Feather from "react-native-vector-icons/Feather";
import CoteIvoire from "../assets/images/cote_ivoire.png";
import SmallEarth from "../assets/images/earth.png";
import Flag from "react-native-flags";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import AntDesign from "react-native-vector-icons/AntDesign";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

// create a component
const ServiceHeader = (props) => {
  const Navigation = props.navigation;
  const Service = props.service;
  const PaysLivraison = props.paysLivraison;
  const Language = props.language;
  const SelectedCategorieId = props?.SelectedCategorieId;
  const fromProfil = props?.fromProfil;

  const CustomStatuBar = ({ backgroundColor, barStyle = "light-content" }) => {
    const inset = useSafeAreaInsets();
    return (
      <View style={{ height: inset.top, backgroundColor }}>
        <StatusBar
          animated={true}
          backgroundColor={backgroundColor}
          barStyle={barStyle}
        />
      </View>
    );
  };

  let height = 0;
  if (windowHeight == 667) {
    height = hp(13);
  } else if (windowHeight >= 772) {
    height = hp(10);
  } else {
    height = hp(12);
  }

  return (
    <>
      {Platform.OS == "ios" ? (
        <>
          <CustomStatuBar backgroundColor="#2BA6E9" />
          <View
            style={{
              position: "relative",
              alignItems: "center",
              backgroundColor: "#2BA6E9",
              justifyContent: "center",
              height: height,
            }}
          >
            <Text
              style={{ fontSize: 14, color: "#fff", fontFamily: "Roboto-Bold" }}
            >
              {Service ? ("fr" == Language ? Service.nom : Service.nomEN) : ""}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginTop: 10,
              }}
            >
              {Service?.code == "ventes-privees" ||
              Service?.code == "demandes-d-achat" ? (
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Flag
                      size={24}
                      code={PaysLivraison?.drapeauDestination}
                      type="flat"
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#fff",
                        fontFamily: "Roboto-Regular",
                      }}
                    >
                      {"fr" == Language
                        ? PaysLivraison?.destination
                        : PaysLivraison?.destinationEn
                        ? PaysLivraison?.destinationEn
                        : PaysLivraison?.destination}
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Flag
                      size={24}
                      code={
                        PaysLivraison?.drapeauDepart
                          ? PaysLivraison?.drapeauDepart
                          : "FR"
                      }
                      type="flat"
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#fff",
                        fontFamily: "Roboto-Regular",
                      }}
                    >
                      {PaysLivraison?.libelleDepart}
                    </Text>
                    <Feather name="arrow-up-right" color="#fff" size={22} />
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Flag
                      size={24}
                      code={PaysLivraison?.drapeauDestination}
                      type="flat"
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#fff",
                        fontFamily: "Roboto-Regular",
                      }}
                    >
                      {"fr" == Language
                        ? PaysLivraison?.destination
                        : PaysLivraison?.destinationEn
                        ? PaysLivraison?.destinationEn
                        : PaysLivraison?.destination}
                    </Text>
                    <Feather name="arrow-down-right" color="#fff" size={22} />
                  </View>
                </>
              )}
            </View>
            {Service && (
              <View
                style={{
                  position: "absolute",
                  top: windowWidth * 0.03,
                  left: 10,
                }}
              >
                <TouchableOpacity
                  onPress={() =>
                    Service?.code == "ventes-privees"
                      ? Navigation.navigate("ShoppingScreen", {
                          SelectedCategorieId,
                        })
                      : Navigation.goBack()
                  }
                  style={{
                    marginLeft: 10,
                    marginTop: 10,
                    padding: 2.5,
                    borderRadius: 8,
                    backgroundColor: "#fff",
                    maxWidth: windowWidth * 0.1,
                  }}
                >
                  <AntDesign name="arrowleft" color="#2BA6E9" size={22} />
                </TouchableOpacity>
              </View>
            )}

            <View
              style={{
                position: "absolute",
                top: windowWidth * 0.04,
                right: 10,
              }}
            >
              <Image
                source={SmallEarth}
                style={{ width: wp(7), height: wp(7) }}
              />
              <Text
                style={{
                  fontSize: 14,
                  color: "#fff",
                  fontFamily: "Roboto-Bold",
                  textAlign: "center",
                  marginTop: 4,
                }}
              >
                GS
              </Text>
            </View>
          </View>
        </>
      ) : (
        <View
          style={{
            position: "relative",
            alignItems: "center",
            backgroundColor: "#2BA6E9",
            justifyContent: "center",
            height: hp(12),
          }}
        >
          <Text
            style={{ fontSize: 14, color: "#fff", fontFamily: "Roboto-Bold" }}
          >
            {Service ? ("fr" == Language ? Service.nom : Service.nomEN) : ""}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginTop: 10,
            }}
          >
            {Service ? (
              Service.code == "ventes-privees" ||
              Service.code == "demandes-d-achat" ? (
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Flag
                      size={24}
                      code={PaysLivraison?.drapeauDestination}
                      type="flat"
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#fff",
                        fontFamily: "Roboto-Regular",
                      }}
                    >
                      {"fr" == Language
                        ? PaysLivraison?.destination
                        : PaysLivraison?.destinationEn
                        ? PaysLivraison?.destinationEn
                        : PaysLivraison?.destination}
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Flag
                      size={24}
                      code={PaysLivraison?.drapeauDepart}
                      type="flat"
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#fff",
                        fontFamily: "Roboto-Regular",
                      }}
                    >
                      {"fr" == Language
                        ? PaysLivraison?.depart
                        : PaysLivraison?.departEn
                        ? PaysLivraison?.departEn
                        : PaysLivraison?.depart}
                    </Text>
                    <Feather name="arrow-up-right" color="#fff" size={22} />
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Flag
                      size={24}
                      code={PaysLivraison?.drapeauDestination}
                      type="flat"
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#fff",
                        fontFamily: "Roboto-Regular",
                      }}
                    >
                      {"fr" == Language
                        ? PaysLivraison?.destination
                        : PaysLivraison?.destinationEn
                        ? PaysLivraison?.destinationEn
                        : PaysLivraison?.destination}
                    </Text>
                    <Feather name="arrow-down-right" color="#fff" size={22} />
                  </View>
                </>
              )
            ) : (
              <></>
            )}
          </View>

          <View style={{ position: "absolute", top: 20, left: 10 }}>
            <TouchableOpacity
              onPress={() =>
                fromProfil
                  ? Navigation.navigate("CommandeScreen")
                  : Navigation.goBack()
              }
              style={{
                marginLeft: 10,
                marginTop: 10,
                padding: 2.5,
                borderRadius: 8,
                backgroundColor: "#fff",
                maxWidth: windowWidth * 0.1,
              }}
            >
              <AntDesign name="arrowleft" color="#2BA6E9" size={22} />
            </TouchableOpacity>
          </View>
          <View style={{ position: "absolute", top: 15, right: 10 }}>
            <Image
              source={SmallEarth}
              style={{ width: wp(7), height: wp(7) }}
            />
            <Text
              style={{
                fontSize: 14,
                color: "#fff",
                fontFamily: "Roboto-Bold",
                textAlign: "center",
                marginTop: 4,
              }}
            >
              GS
            </Text>
          </View>
        </View>
      )}
    </>
  );
};

// define your styles
const styles = StyleSheet.create({
  tabsContainer: {
    width: windowWidth * 1.0,
    height: windowHeight * 0.05,
    flexDirection: "column",
    position: "absolute",
    top: windowHeight * 0.1,
  },
  tabarTextStyle: {
    fontFamily: "Roboto-Regular",
    fontSize: 12,
    color: "#fff",
    marginLeft: windowWidth * 0.1,
    paddingTop: windowHeight * 0.01,
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
  },
});

//make this component available to the app
export default ServiceHeader;
