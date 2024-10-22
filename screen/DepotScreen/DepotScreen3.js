import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid,
  Platform,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Stepper from '../Stepper';
import moment from 'moment';
import Button from '../../components/Button';
import {ScrollView} from 'react-native-virtualized-view';
import {
  getCreneaux,
  getDepotValues,
  getPlatformLanguage,
  getSelectedCountry,
  getSelectedService,
  saveDepotCreneau,
} from '../../modules/GestionStorage';
import {useIsFocused, useRoute} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import ServiceHeader from '../../components/ServiceHeader';
import {Calendar} from 'react-native-calendars';
import {LocaleConfig} from 'react-native-calendars';
import Toast from 'react-native-toast-message';

const DepotScreen3 = props => {
  const now = moment().valueOf();

  const route = useRoute();
  var isFocused = useIsFocused();
  const {t} = useTranslation();
  const [activeHour, setActiveHour] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [Horaires, setHoraires] = useState([]);
  const [Creneaux, setCreneaux] = useState([]);
  const [Activity, setActivity] = useState(true);
  const [availableDates, setAvailableDates] = useState({});
  const [Service, setService] = useState(null);
  const [paysLivraisonObject, setPaysLivraisonObject] = useState(null);
  const [Language, setLanguage] = useState('fr');
  const [Loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(moment().format('YYYY-MM'));

  LocaleConfig.locales.en = LocaleConfig.locales[''];
  LocaleConfig.locales.fr = {
    monthNames: [
      'Janvier',
      'Février',
      'Mars',
      'Avril',
      'Mai',
      'Juin',
      'Juillet',
      'Août',
      'Septembre',
      'Octobre',
      'Novembre',
      'Décembre',
    ],
    monthNamesShort: [
      'Janv.',
      'Févr.',
      'Mars',
      'Avril',
      'Mai',
      'Juin',
      'Juil.',
      'Août',
      'Sept.',
      'Oct.',
      'Nov.',
      'Déc.',
    ],
    dayNames: [
      'Dimanche',
      'Lundi',
      'Mardi',
      'Mercredi',
      'Jeudi',
      'Vendredi',
      'Samedi',
    ],
    dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
  };

  async function navigateToDelivery() {
    if (selectedDate === '') {
      if (Platform.OS == 'ios') {
        Toast.show({
          type: 'error',
          text1: t('choisir'),
          text2: t('Vous devez choisir un créneau'),
        });
      } else {
        ToastAndroid.show(
          t('Vous devez choisir un créneau'),
          ToastAndroid.SHORT,
        );
      }
      return;
    }

    let obj = Horaires[activeHour] ? Horaires[activeHour] : null;

    if (obj) {
      await saveDepotCreneau(obj);
    }

    console.log(route.params?.magasinId, 'route.params?.magasinId');
    props.navigation.navigate('Livraison1', {
      magasinId: route.params?.magasinId,
      obj: obj,
    });
  }

  useEffect(() => {
    async function getCreneauxValues() {
      try {
        const depotValues = await getDepotValues();
        console.log(depotValues, 'depotValues');
        let codePostal = depotValues.depotCodePostal;
        let ville = depotValues.depotVille;
        let villeLower = ville ? ville.toLowerCase() : null;
        let creneaux = await getCreneaux();
        creneaux = creneaux ? creneaux : [];
        let service = await getSelectedService();
        setService(service);
        // Language
        const currentLanguage = await getPlatformLanguage();
        setLanguage(currentLanguage);
        LocaleConfig.defaultLocale = currentLanguage;
        // Get pays de livraison
        let paysLivraisonObject = await getSelectedCountry();
        setPaysLivraisonObject(paysLivraisonObject);

        let data = [];
        let dataVille = [];
        let creneauxSet = new Set(); // Ensemble pour stocker les créneaux uniques

        creneaux.forEach(creneau => {
          let creneauVille = creneau.ville ? creneau.ville.toLowerCase() : '';
          let departementCreneau = creneau.codePostal
            ? creneau.codePostal.substring(0, 2)
            : '';
          let departementRecherche = codePostal
            ? codePostal.substring(0, 2)
            : '';

          // Créer une clé unique pour le créneau incluant la date et les horaires
          let creneauKey = `${creneau.date}_${creneau.horaireDebut}-${creneau.horaireFin}`;
          if (
            (departementCreneau == departementRecherche &&
              creneau?.codePostal?.startsWith(departementRecherche) &&
              !creneauxSet.has(creneauKey)) ||
            (creneau.departementCode === departementRecherche &&
              !creneauxSet.has(creneauKey))
          ) {
            data.push(creneau);
            creneauxSet.add(creneauKey);
            console.log({creneau});
          }
          if (
            creneauVille.includes(villeLower) &&
            !creneauxSet.has(creneauKey)
          ) {
            dataVille.push(creneau);
            creneauxSet.add(creneauKey);
          }
        });

        if (data.length === 0) {
          data = dataVille;
        }

        let formatted = [];
        let dates = {};
        data.forEach(creneauPlage => {
          let date = moment(creneauPlage.date, 'DD/MM/YYYY').format(
            'YYYY-MM-DD',
          );
          formatted.push({
            id: creneauPlage.idCreneauPlage,
            value: creneauPlage.idCreneauPlage,
            fournisseurId: creneauPlage.idFournisseur,
            place: creneauPlage.quantite,
            codePostal: creneauPlage.codePostal,
            ville: creneauPlage.ville,
            date: date,
            horaireDebut: creneauPlage.horaireDebut,
            horaireFin: creneauPlage.horaireFin,
            label:
              t("Horaire d'ouverture") +
              ' : ' +
              creneauPlage.horaireDebut +
              ' - ' +
              creneauPlage.horaireFin,
          });
          dates[date] = {disabled: false};
        });

        setAvailableDates(dates);
        setCreneaux(formatted);
        setActivity(false);
      } catch (error) {
        console.log(error);
      }
    }

    setActivity(true);
    console.log(selectedDate, availableDates, 'selectedDate, availableDates');
    getCreneauxValues();
  }, [isFocused]);

  async function handleTimeSelect(obj) {
    setModalVisible(false);
  }

  const handleDayPress = date => {
    setSelectedDate(date.dateString);
    let horaires = Creneaux.filter(obj => obj.date === date.dateString);
    setHoraires(horaires);
    setActiveHour(0); // Reset active hour when a new date is selected
  };

  if (Activity === true || !Service) {
    return (
      <View style={{justifyContent: 'center', height: '80%'}}>
        <ActivityIndicator size="large" color="#3292E0" style={{}} />
      </View>
    );
  }

  if (Loading === true || !Horaires) {
    return (
      <View style={{justifyContent: 'center', height: '80%'}}>
        <ActivityIndicator size="large" color="#3292E0" style={{}} />
      </View>
    );
  }

  return (
    <View style={{flex: 1}}>
      <ServiceHeader
        navigation={props.navigation}
        service={Service}
        paysLivraison={paysLivraisonObject}
        language={Language}
      />
      <ScrollView
        style={{paddingBottom: 50}}
        showsVerticalScrollIndicator={false}>
        <View style={{flex: 1}}>
          <View>
            <Stepper position={1} />
          </View>

          <View style={{marginTop: 30}}>
            <View style={{marginBottom: 10, paddingHorizontal: 26}}>
              <Text
                style={{
                  textAlign: 'center',
                  fontFamily: 'Poppins-SemiBold',
                  color: '#000',
                  fontSize: 16,
                }}>
                {t('Créneau d’enlévement')}
              </Text>
            </View>
            <View style={{paddingHorizontal: 26}}>
              <Calendar
                current={currentMonth}
                onMonthChange={month =>
                  setCurrentMonth(month.dateString.substring(0, 7))
                }
                markedDates={{
                  ...availableDates,
                  [selectedDate]: {
                    selected: true,
                    marked: true,
                    selectedColor: '#2196F3',
                  },
                }}
                onDayPress={handleDayPress}
                markingType={'dot'}
                disableAllTouchEventsForDisabledDays={true}
                disabledByDefault={true}
                style={{
                  height: 350,
                  borderWidth: 1,
                  borderRadius: 4,
                  borderColor: '#E5E5E5',
                }}
                theme={{
                  textDisabledColor: '#aaa',
                  textSectionTitleColor: '#000000',
                  todayTextColor: '#aaa',
                  dayTextColor: '#000',
                  selectedColor: '#2196F3',
                  selectedDayTextColor: '#fff',
                  textDayFontSize: 18,
                  textDayFontWeight: '700',
                }}
              />
            </View>
            <View style={{marginTop: 40, marginBottom: 20}}>
              <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                style={{paddingLeft: 26}}>
                <View
                  style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                  {Horaires.map((obj, index) => (
                    <TouchableOpacity
                      style={
                        activeHour === index
                          ? styles.hourActiveContaianer
                          : styles.hourContaianer
                      }
                      onPress={() => {
                        setActiveHour(index);
                        handleTimeSelect(obj);
                      }}
                      key={index}>
                      <Text
                        style={
                          activeHour === index
                            ? styles.hourContaianerText
                            : styles.hourContaianerActiveText
                        }>
                        {obj.horaireDebut + ' - ' + obj.horaireFin}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>

          <View
            style={{
              flex: 1,
              justifyContent: 'flex-end',
              alignItems: 'center',
              paddingBottom: 72,
            }}>
            <Button
              title={t('valider')}
              navigation={() => {
                navigateToDelivery();
              }}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  hourContaianer: {
    backgroundColor: '#fff',
    marginRight: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  hourActiveContaianer: {
    backgroundColor: '#2196F3',
    marginRight: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  hourContaianerText: {
    color: '#fff',
    fontFamily: 'Roboto-Regular',
    fontSize: 13,
  },
  hourContaianerActiveText: {
    color: '#000',
    fontFamily: 'Roboto-Regular',
    fontSize: 13,
  },
});

export default DepotScreen3;
