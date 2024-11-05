import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  ToastAndroid,
  Dimensions,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  getAuthentificationData,
  getPlatformLanguage,
  removeAuthentificationData,
} from "../../modules/GestionStorage";
import { HeaderEarth } from "../../components/Header";
import auth from "@react-native-firebase/auth";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AntDesign from "react-native-vector-icons/AntDesign";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Octicons from "react-native-vector-icons/Octicons";
import Coupon from "../../assets/images/coupon.png";
import Language from "../../assets/images/language.png";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
const windowWidth = Dimensions.get("window").width;

const ProfileScreen = ({ navigation }) => {
  var isFocused = useIsFocused();
  const [LocalStorage, setLocalStorage] = useState(null);
  const [Loader, setLoader] = useState(false);
  const [RemiseLoader, setRemiseLoader] = useState(true);
  const { t } = useTranslation();
  const [language, setLanguage] = useState("fr");
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchValue() {
      try {
        const user = auth().currentUser;
        setUser(user);
        setLoader(true);
        setRemiseLoader(true);

        const currentLanguage = await getPlatformLanguage();

        setLanguage(currentLanguage);

        if (null === user.uid) {
          const auth = await getAuthentificationData();
          setLoader(false);
          setRemiseLoader(false);
          setLocalStorage(auth);
          navigation.navigate("Login");
          return;
        }
      } catch (error) {
        console.log("error", error);

        setLoader(false);
        setRemiseLoader(false);
      }
    }

    fetchValue();
  }, [isFocused]);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (!user) {
        // L'utilisateur n'est pas connecté, rediriger vers l'écran de connexion
        navigation.navigate("Login");
      }
    });

    return () => unsubscribe(); // Nettoyage du listener
  }, [navigation]);

  const logout = async () => {
    try {
      console.log("x");
      await removeAuthentificationData();
      await auth().signOut();
      if (Platform.OS === "ios") {
        Toast.show({
          type: "success",
          text1: t("Profil"),
          text2: t("L'utilisateur a été déconnecté!"),
        });
      } else {
        ToastAndroid.show(
          t("L'utilisateur a été déconnecté!"),
          ToastAndroid.SHORT
        );
      }

      navigation.navigate("Login");
    } catch (error) {
      console.log("Erreur lors de la déconnexion:", error);

      if (Platform.OS === "ios") {
        Toast.show({
          type: "error",
          text1: t("Profil"),
          text2: t("L'utilisateur ne peut pas se déconnecter!"),
        });
      } else {
        ToastAndroid.show(
          t("L'utilisateur ne peut pas se déconnecter!"),
          ToastAndroid.SHORT
        );
      }
    }
  };

  const UserList = [
    {
      id: 1,
      title: t("Commandes"),
      icon: <AntDesign name="inbox" size={24} color="#2BA6E9" />,
      path: "CommandeScreen",
    },
    {
      id: 2,
      title: t("Adresses"),
      icon: (
        <MaterialCommunityIcons
          name="map-marker-outline"
          size={24}
          color="#2BA6E9"
        />
      ),
      path: "AdresseScreen",
    },
    {
      id: 3,
      title: t("profile"),
      icon: <Ionicons name="person-circle-outline" size={24} color="#2BA6E9" />,
      path: "EditProfile",
    },
    {
      id: 4,
      title: t("Remises et Avoirs"),
      icon: <Image source={Coupon} />,
      path: "RemiseAvoir",
    },
    {
      id: 5,
      title: t("cartes bancaires"),
      icon: <Octicons name="credit-card" size={24} color="#2BA6E9" />,
      path: "CartBancair",
    },
    {
      id: 6,
      title: t("langues"),
      icon: <MaterialIcons name="language" size={24} color="#2BA6E9" />,
      path: "LanguageScreen",
    },
    {
      id: 7,
      title: t("envoyer"),
      icon: <Image source={Language} />,
      path: "Message",
      camefrom: "setting",
    },
  ];

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
  return (
    <ScrollView
      style={{
        marginBottom: windowWidth * 0.1,
        paddingBottom: windowWidth * 0.2,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ flex: 1 }}>
        <HeaderEarth />

        <ScrollView
          style={{ marginTop: 32, paddingHorizontal: 12 }}
          showsVerticalScrollIndicator={false}
        >
          {UserList.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() =>
                navigation.navigate(item.path, { fromSetting: item.camefrom })
              }
              style={{
                paddingHorizontal: 14,
                paddingVertical: 18,
                backgroundColor: "#FFFFFF",
                marginBottom: 16,
                borderRadius: 12,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 15 }}
              >
                <View>{item.icon}</View>
                <Text
                  style={{
                    color: "#292625",
                    fontSize: 14,
                    fontFamily: "Poppins-Medium",
                    letterSpacing: 1,
                  }}
                >
                  {item.title}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View
          style={{
            marginTop: 16,
            paddingHorizontal: 16,
            marginBottom: windowWidth * 0.15,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              onPress={logout}
            >
              <AntDesign name="logout" size={20} color="#EB4335" />
              <Text
                style={{
                  color: "#EB4335",
                  fontSize: 14,
                  fontFamily: "Poppins-SemiBold",
                }}
              >
                {t("Disconnect")}
              </Text>
            </TouchableOpacity>
            <View>
              <TouchableOpacity
                onPress={() => navigation.navigate("TermsAndConditionsScreen")}
              >
                <Text
                  style={{
                    color: "#0282C8",
                    fontSize: 14,
                    fontFamily: "Poppins-Medium",
                    letterSpacing: 1,
                    textAlign: "center",
                    textDecorationLine: "underline",
                  }}
                >
                  {t("conditon")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate("LegalNotice")}
              >
                <Text
                  style={{
                    color: "#0282C8",
                    fontSize: 14,
                    fontFamily: "Poppins-Medium",
                    letterSpacing: 1,
                    textAlign: "center",
                    textDecorationLine: "underline",
                  }}
                >
                  {t("mention")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
