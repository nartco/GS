import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import { card_category } from "../../constant/data";
import PaymentCard from "../../components/PaymentCard";
import WavePaymen from "../../components/WavePaymen";
import { useTranslation } from "react-i18next";
import {
  getAuthentificationData,
  getPlatformLanguage,
  getResumeCommande,
} from "../../modules/GestionStorage";
import { useIsFocused } from "@react-navigation/native";
import ServiceHeader from "../../components/ServiceHeader";
import { getClientCards } from "../../modules/GestionStripe";
import axiosInstance from "../../axiosInstance";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

const ResumeCardScreen = (props) => {
  const { t, i18n } = useTranslation();

  const [activeCard, setActiveCard] = useState(0);
  var isFocused = useIsFocused();
  const [Service, setService] = useState(null);
  const [paysLivraisonObject, setPaysLivraisonObject] = useState(null);
  const [Language, setLanguage] = useState("fr");
  const [Activity, setActivity] = useState(true);
  const [ClientEmail, setClientEmail] = useState([]);
  const [Cards, setCards] = useState([]);
  const [Commande, setCommande] = useState({});

  useEffect(() => {
    async function fetchData() {
      setActivity(true);

      let commande = await getResumeCommande();

      if (!commande) {
        setActivity(false);
        return;
      }

      setCommande(commande);

      // Pays de livraison
      let paysLivraisonObject = null;
      let service = null;
      try {
        const response = await axiosInstance.get(
          "/pays/" + commande.paysLivraisonId
        );

        console.log("response", response);

        paysLivraisonObject = response.data;

        setPaysLivraisonObject(paysLivraisonObject);

        service = response.data?.service;

        setService(service);
      } catch (erreur) {
        console.log("error pays de livraison", erreur);
      }

      // Language
      const currentLanguage = await getPlatformLanguage();
      setLanguage(currentLanguage);

      // email
      const userEmail = await getAuthentificationData();
      setClientEmail(userEmail);

      // card
      const userCards = await getClientCards(userEmail);
      setCards(userCards?.data);

      setActivity(false);
    }

    fetchData();
  }, [isFocused]);

  if (!Service) {
    return (
      <View style={{ justifyContent: "center", height: "80%" }}>
        <ActivityIndicator size="large" color="#3292E0" style={{}} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <View style={{ flex: 1 }}>
        <ServiceHeader
          navigation={props.navigation}
          service={Service}
          paysLivraison={paysLivraisonObject}
          language={Language}
          fromProfil={props.route.params?.redirectGoBack}
        />

        <View style={{ marginTop: 24, marginBottom: 12 }}>
          <Text
            style={{
              fontFamily: "Poppins-SemiBold",
              fontSize: 16,
              color: "#000",
              textAlign: "center",
            }}
          >
            {t("Mode de paiement")}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            gap: 10,
            alignItems: "center",
            width: windowWidth * 0.75,
            alignSelf: "center",
          }}
        >
          {card_category.slice(0, 2).map((item, index) => (
            <View key={index} style={{ marginBottom: 25 }}>
              <TouchableOpacity
                onPress={() => {
                  setActiveCard(index);
                }}
                style={[
                  activeCard === index
                    ? styles.backgroundColorActive
                    : styles.backgroundColor,
                  {
                    justifyContent: "center",
                    borderRadius: 20,
                    alignItems: "center",
                    paddingHorizontal: 50,
                    alignSelf: "center",
                    height: 56,
                    borderWidth: 1.2,
                    borderColor: "#2196F3",
                  },
                ]}
              >
                <View style={{ display: item.imgDisplay }}>
                  {activeCard === index ? item.imgActive : item.img}
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {activeCard == 0 ? <PaymentCard commandId={Commande.id} /> : null}

        {activeCard == 1 ? <WavePaymen commandId={Commande.id} /> : null}

        {activeCard == 2 ? (
          <View style={styles.container}>
            <View style={styles.textHeadingContainer}>
              <Text>Payr au dépot</Text>
            </View>
            <TouchableOpacity
              style={styles.btnContainer}
              onPress={() =>
                props.navigation.navigate(Navigationstrings.WeightCal)
              }
            >
              <Text style={styles.btnText}>{t("Revenir à l’accueil")}</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  backgroundColorActive: {
    backgroundColor: "#2196F3",
  },
  backgroundColor: {
    backgroundColor: "#fff",
  },
  textActive: {
    color: "#fff",
  },
  textColor: {
    color: "#000",
  },
  container: {
    flex: 1,
    //     justifyContent: 'center',
    alignItems: "center",
    backgroundColor: "#fff",
  },
  btnContainer: {
    backgroundColor: "#3292E0",
    alignItems: "center",
    justifyContent: "center",
    marginTop: windowHeight * 0.02,
    width: windowWidth * 0.7,
    height: windowHeight * 0.07,
    borderRadius: 40,
  },
  btnText: {
    color: "#fff",
    fontSize: 14,
  },
  textHeading: {
    fontSize: 18,
    color: "#1C1939",
  },
  textHeadingContainer: {
    marginTop: windowHeight * 0.03,
  },
});

export default ResumeCardScreen;
