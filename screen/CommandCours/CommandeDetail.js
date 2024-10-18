import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import axiosInstance from '../../axiosInstance';
import {getPlatformLanguage} from '../../modules/GestionStorage';
import Truck from '../../assets/images/truck.png';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {HeaderActions} from '../../components/HeaderActions';
import moment from 'moment';
import auth from '@react-native-firebase/auth';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const CommandeDetail = ({navigation, route}) => {
  const {commandeId} = route.params;
  const [Commande, setCommande] = useState(null);
  const [Loader, setLoader] = useState(true);
  const [facture, setFacture] = useState([]);
  const [Language, setLanguage] = useState('fr');

  const {t} = useTranslation();

  useEffect(() => {
    fetchCommande();
  }, []);

  const fetchCommande = async () => {
    setLoader(true);

    try {
      console.log('xxx')
      const currentLanguage = await getPlatformLanguage();
      setLanguage(currentLanguage);

      const user = auth().currentUser;
      console.log(commandeId, user.uid,'3');
      const response = await axiosInstance.get(
        '/commandes/' + commandeId + '/' + user.uid,
      );

      let commande = response.data;

      if ('en' == currentLanguage) {
        commande.createdAt = formatDate(commande.createdAt);
        commande.datePriseCharge = formatDate(commande.datePriseCharge);
        commande.dateEnlevement = formatDate(commande.dateEnlevement);
        commande.dateDisponibilitePointRelais = formatDate(
          commande.dateDisponibilitePointRelais,
        );
        commande.dateEnCoursPreparation = formatDate(
          commande.dateEnCoursPreparation,
        );
        commande.dateRetour = formatDate(commande.dateRetour);
        commande.dateAnnulation = formatDate(commande.dateAnnulation);
        commande.datePreparation = formatDate(commande.datePreparation);
        commande.dateLivraison = formatDate(commande.dateLivraison);
        commande.dateExpedition = formatDate(commande.dateExpedition);
        commande.datePaiement = formatDate(commande.datePaiement);
        commande.dateValidation = formatDate(commande.dateValidation);
      }

      setCommande(commande);
    } catch (erreur) {
      console.log('commande error', erreur);
    }

    setLoader(false);
  };

  function formatDate(dateString) {
    if (!dateString) {
      return dateString;
    }

    let arr = dateString.split('/');

    return `${arr[1]}/${arr[0]}/${arr[2]}`;
  }

  const imprimerFacture = async CommandFacture => {
    navigation.navigate('CommandFacture', CommandFacture);
  };

  const CustomStatuBar = ({backgroundColor, barStyle = 'light-content'}) => {
    const inset = useSafeAreaInsets();
    return (
      <View style={{height: inset.top, backgroundColor}}>
        <StatusBar
          animated={true}
          backgroundColor={backgroundColor}
          barStyle={barStyle}
        />
      </View>
    );
  };

  const RenderDateCommandeLivree = () => {
    console.log(JSON.stringify(Commande, null, 2));
    
    let dateStr = Commande.datePriseCharge;
    if ('Ventes Privées' == Commande.service) {
      dateStr = Commande.dateValidation;
    } else if ("Demandes d'achat" == Commande.service) {
      dateStr = Commande.dateValidation;
    }

    let date = null;
    if (dateStr) {
      date = moment(dateStr, 'DD/MM/YYYY');
      if (date.isValid()) {
        let livraisonMax = 0;
        Commande.commandeProducts.forEach(commandeProduct => {
          let product = commandeProduct.product;

          let specificites = product
            ? product.productSpecificites
              ? product.productSpecificites[0]
              : null
            : null;

          if (specificites && specificites.livraison) {
            let delaiMax = specificites.livraison.delaiMax;
            delaiMax = parseInt(delaiMax);
            delaiMax = isNaN(delaiMax) ? 0 : delaiMax;

            if (delaiMax > livraisonMax) {
              livraisonMax = delaiMax;
            }
          }
        });

        date.add(livraisonMax, 'days');

        date = date.format('en' == Language ? 'MM/DD/YYYY' : 'DD/MM/YYYY');
      }
    }

    if (date) {
      return (
        <Text
          style={{
            color: '#C3BCBC',
            fontFamily: 'Poppins-Regular',
            fontSize: 12,
            letterSpacing: 1,
          }}>
          {t("Jusqu'au") + ' ' + date}
        </Text>
      );
    }

    return <></>;
  };

  if (true === Loader || !Commande) {
    return (
      <View style={{justifyContent: 'center', height: '80%'}}>
        <ActivityIndicator size={'large'} color="#3292E0" />
      </View>
    );
  }

  const handleCommandDetail = (commandeId, PayLivraisonId) => {
    navigation.navigate('ColiSuivi', {commandeId, PayLivraisonId});
  };
  return (
    <View style={{flex: 1}}>
      <HeaderActions navigation={() => navigation.goBack()} />

      <ScrollView style={{flex: 1}}>
        <View style={{flex: 1, marginBottom: 50}}>
          <View style={{marginTop: 24, paddingHorizontal: 16}}>
            <Text
              style={{
                fontSize: 14,
                color: '#C3BCBC',
                fontFamily: 'Poppins-Regular',
                letterSpacing: 1,
              }}>
              {t('N° de commande')}
            </Text>
            <View>
              <Text
                style={{
                  color: '#292625',
                  fontSize: 24,
                  letterSpacing: 1,
                  fontFamily: 'Poppins-Medium',
                }}>
                {Commande.uuid ? Commande.uuid : 222222}
              </Text>
            </View>
          </View>

          <View style={{marginTop: 14, paddingHorizontal: 16}}>
            <Text
              style={{
                fontSize: 16,
                color: '#292625',
                fontFamily: 'Poppins-Medium',
                letterSpacing: 1,
              }}>
              {t('History')}
            </Text>
            <View
              style={{backgroundColor: '#fff', padding: 14, borderRadius: 10}}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 20,
                }}>
                <View
                  style={{
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 50,
                      backgroundColor: '#fff',
                      borderWidth: 4,
                      borderColor: '#498BF0',
                    }}></View>
                  <View
                    style={[
                      Commande.datePriseCharge != null ||
                      Commande.dateEnlevement != null ||
                      Commande.dateEnCoursPreparation != null ||
                      Commande.datePreparation != null
                        ? {borderStyle: 'dashed', borderColor: '#498BF0'}
                        : {borderStyle: 'dashed', borderColor: '#EF5448'},
                      {
                        width: 1,
                        height: 70,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: 1,
                      },
                    ]}></View>
                </View>
                {Commande.service == 'Fret par avion' ||
                Commande.service == 'Fret par bateau' ||
                Commande.service == 'Ventes Privées' ? (
                  <>
                    {Commande.datePaiement != null ? (
                      <View>
                        <Text
                          style={{
                            color: '#292625',
                            fontFamily: 'Poppins-Medium',
                            fontSize: 14,
                            letterSpacing: 1,
                          }}>
                          {Commande.statut == 'Payée' ? t('Payée') : t('Payée')}
                        </Text>
                        <Text
                          style={{
                            color: '#C3BCBC',
                            fontFamily: 'Poppins-Regular',
                            fontSize: 12,
                            letterSpacing: 1,
                          }}>
                          {Commande.createdAt}
                        </Text>
                      </View>
                    ) : (
                      <View>
                        <Text
                          style={{
                            color: '#292625',
                            fontFamily: 'Poppins-Medium',
                            fontSize: 14,
                            letterSpacing: 1,
                          }}>
                          {t('A payer')}
                        </Text>
                        <Text
                          style={{
                            color: '#C3BCBC',
                            fontFamily: 'Poppins-Regular',
                            fontSize: 12,
                            letterSpacing: 1,
                          }}>
                          {Commande.datePaiement}
                        </Text>
                      </View>
                    )}
                  </>
                ) : (
                  <></>
                )}

                {Commande.service == "Demandes d'achat" ? (
                  <>
                    {Commande.dateValidation != null ||
                    Commande.datePaiement != null ? (
                      <View>
                        <Text
                          style={{
                            color: '#292625',
                            fontFamily: 'Poppins-Medium',
                            fontSize: 14,
                            letterSpacing: 1,
                          }}>
                          {Commande.dateValidation != null ? (
                            t('A payer')
                          ) : (
                            <></>
                          )}
                          {Commande.datePaiement != null ? t('Payée') : <></>}
                        </Text>
                        <Text
                          style={{
                            color: '#C3BCBC',
                            fontFamily: 'Poppins-Regular',
                            fontSize: 12,
                            letterSpacing: 1,
                          }}>
                          {Commande.datePaiement != null ? (
                            Commande.datePaiement
                          ) : (
                            <></>
                          )}
                          {Commande.dateValidation != null ? (
                            Commande.dateValidation
                          ) : (
                            <></>
                          )}
                        </Text>
                      </View>
                    ) : (
                      <View>
                        <Text
                          style={{
                            color: '#292625',
                            fontFamily: 'Poppins-Medium',
                            fontSize: 14,
                            letterSpacing: 1,
                          }}>
                          {t('Cotation demandée')}
                        </Text>
                        <Text
                          style={{
                            color: '#C3BCBC',
                            fontFamily: 'Poppins-Regular',
                            fontSize: 12,
                            letterSpacing: 1,
                          }}>
                          {Commande.createdAt}
                        </Text>
                      </View>
                    )}
                  </>
                ) : (
                  <></>
                )}
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 20,
                }}>
                {Commande.service == 'Fret par avion' ||
                Commande.service == 'Fret par bateau' ? (
                  <>
                    {Commande.datePriseCharge != null ||
                    Commande.dateEnlevement != null ? (
                      <>
                        <View
                          style={{
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <View
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: 50,
                              backgroundColor: '#fff',
                              borderWidth: 4,
                              borderColor: '#498BF0',
                            }}></View>
                          <View
                            style={[
                              Commande.dateExpedition != null
                                ? {
                                    borderStyle: 'dashed',
                                    borderColor: '#498BF0',
                                  }
                                : {
                                    borderStyle: 'dashed',
                                    borderColor: '#EF5448',
                                  },
                              {
                                width: 1,
                                height: 70,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderWidth: 1,
                              },
                            ]}></View>
                        </View>
                        <View>
                          <Text
                            style={{
                              color: '#292625',
                              fontFamily: 'Poppins-Medium',
                              fontSize: 14,
                              letterSpacing: 1,
                            }}>
                            {t('chez le transporteur')}
                          </Text>
                          <Text
                            style={{
                              color: '#C3BCBC',
                              fontFamily: 'Poppins-Regular',
                              fontSize: 12,
                              letterSpacing: 1,
                            }}>
                            {Commande.datePriseCharge
                              ? Commande.datePriseCharge
                              : ''}
                          </Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <View
                          style={{
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <View
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: 50,
                              backgroundColor: '#fff',
                              borderWidth: 4,
                              borderColor: '#EF5448',
                            }}></View>
                          <View
                            style={{
                              width: 1,
                              height: 70,
                              justifyContent: 'center',
                              alignItems: 'center',
                              borderWidth: 1,
                              borderStyle: 'dashed',
                              borderColor: '#EF5448',
                            }}></View>
                        </View>
                        <View>
                          <Text
                            style={{
                              color: '#292625',
                              fontFamily: 'Poppins-Medium',
                              fontSize: 14,
                              letterSpacing: 1,
                            }}>
                            {t('chez le transporteur')}
                          </Text>
                          <Text
                            style={{
                              color: '#C3BCBC',
                              fontFamily: 'Poppins-Regular',
                              fontSize: 12,
                              letterSpacing: 1,
                            }}>
                            {Commande.datePriseCharge
                              ? Commande.datePriseCharge
                              : ''}
                          </Text>
                        </View>
                      </>
                    )}
                  </>
                ) : (
                  <></>
                )}
                {Commande.service == 'Ventes Privées' ||
                Commande.service == "Demandes d'achat" ? (
                  <>
                    {Commande.dateEnCoursPreparation != null ||
                    Commande.datePreparation != null ? (
                      <>
                        <View
                          style={{
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <View
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: 50,
                              backgroundColor: '#fff',
                              borderWidth: 4,
                              borderColor: '#498BF0',
                            }}></View>
                          <View
                            style={[
                              Commande.dateExpedition != null
                                ? {
                                    borderStyle: 'dashed',
                                    borderColor: '#498BF0',
                                  }
                                : {
                                    borderStyle: 'dashed',
                                    borderColor: '#EF5448',
                                  },
                              {
                                width: 1,
                                height: 70,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderWidth: 1,
                              },
                            ]}></View>
                        </View>
                        <View>
                          <Text
                            style={{
                              color: '#292625',
                              fontFamily: 'Poppins-Medium',
                              fontSize: 14,
                              letterSpacing: 1,
                            }}>
                            {Commande.dateEnCoursPreparation != null ? (
                              t('en cours de préparation')
                            ) : (
                              <></>
                            )}
                            {Commande.datePreparation != null ? (
                              t('datePreparation')
                            ) : (
                              <></>
                            )}
                          </Text>
                          <Text
                            style={{
                              color: '#C3BCBC',
                              fontFamily: 'Poppins-Regular',
                              fontSize: 12,
                              letterSpacing: 1,
                            }}>
                            {Commande.dateEnCoursPreparation != null ? (
                              Commande.dateEnCoursPreparation
                            ) : (
                              <></>
                            )}
                            {Commande.datePreparation != null ? (
                              Commande.datePreparation
                            ) : (
                              <></>
                            )}
                          </Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <View
                          style={{
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <View
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: 50,
                              backgroundColor: '#fff',
                              borderWidth: 4,
                              borderColor: '#EF5448',
                            }}></View>
                          <View
                            style={{
                              width: 1,
                              height: 70,
                              justifyContent: 'center',
                              alignItems: 'center',
                              borderWidth: 1,
                              borderStyle: 'dashed',
                              borderColor: '#EF5448',
                            }}></View>
                        </View>
                        <View>
                          <Text
                            style={{
                              color: '#292625',
                              fontFamily: 'Poppins-Medium',
                              fontSize: 14,
                              letterSpacing: 1,
                            }}>
                            {t('en cours de préparation')}
                          </Text>
                          <Text
                            style={{
                              color: '#C3BCBC',
                              fontFamily: 'Poppins-Regular',
                              fontSize: 12,
                              letterSpacing: 1,
                            }}></Text>
                        </View>
                      </>
                    )}
                  </>
                ) : (
                  <></>
                )}
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 20,
                }}>
                {Commande.service == 'Fret par avion' ||
                Commande.service == 'Fret par bateau' ||
                Commande.service == 'Ventes Privées' ||
                Commande.service == "Demandes d'achat" ? (
                  <>
                    {Commande.dateExpedition != null ? (
                      <>
                        <View
                          style={{
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <View
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: 50,
                              backgroundColor: '#fff',
                              borderWidth: 4,
                              borderColor: '#498BF0',
                            }}></View>
                          <View
                            style={[
                              Commande.dateExpedition != null
                                ? {
                                    borderStyle: 'dashed',
                                    borderColor: '#498BF0',
                                  }
                                : {
                                    borderStyle: 'dashed',
                                    borderColor: '#EF5448',
                                  },
                              {
                                width: 1,
                                height: 70,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderWidth: 1,
                              },
                            ]}></View>
                        </View>
                        <View>
                          <Text
                            style={{
                              color: '#292625',
                              fontFamily: 'Poppins-Medium',
                              fontSize: 14,
                              letterSpacing: 1,
                            }}>
                            {t('Expédiée')}
                          </Text>
                          <Text
                            style={{
                              color: '#C3BCBC',
                              fontFamily: 'Poppins-Regular',
                              fontSize: 12,
                              letterSpacing: 1,
                            }}>
                            {Commande.dateExpedition}
                          </Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <View
                          style={{
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <View
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: 50,
                              backgroundColor: '#fff',
                              borderWidth: 4,
                              borderColor: '#EF5448',
                            }}></View>
                          <View
                            style={{
                              width: 1,
                              height: 70,
                              justifyContent: 'center',
                              alignItems: 'center',
                              borderWidth: 1,
                              borderStyle: 'dashed',
                              borderColor: '#EF5448',
                            }}></View>
                        </View>
                        <View>
                          <Text
                            style={{
                              color: '#292625',
                              fontFamily: 'Poppins-Medium',
                              fontSize: 14,
                              letterSpacing: 1,
                            }}>
                            {t('Expédiée')}
                          </Text>
                          <Text
                            style={{
                              color: '#C3BCBC',
                              fontFamily: 'Poppins-Regular',
                              fontSize: 12,
                              letterSpacing: 1,
                            }}>
                            {Commande.dateExpedition != null
                              ? Commande.dateExpedition
                              : ''}
                          </Text>
                        </View>
                      </>
                    )}
                  </>
                ) : (
                  <></>
                )}
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 20,
                }}>
                {Commande.service == 'Fret par avion' ||
                Commande.service == 'Fret par bateau' ||
                Commande.service == 'Ventes Privées' ||
                Commande.service == "Demandes d'achat" ? (
                  <>
                    {Commande.dateExpedition != null ? (
                      <>
                        <View
                          style={{
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <View
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: 50,
                              backgroundColor: '#fff',
                              borderWidth: 4,
                              borderColor: '#498BF0',
                            }}></View>
                          <View
                            style={[
                              Commande.dateDisponibilitePointRelais != null ||
                              Commande.dateLivraison != null ||
                              Commande.dateRetour != null ||
                              Commande.dateAnnulation != null
                                ? {
                                    borderStyle: 'dashed',
                                    borderColor: '#498BF0',
                                  }
                                : {
                                    borderStyle: 'dashed',
                                    borderColor: '#EF5448',
                                  },
                              {
                                width: 1,
                                height: 70,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderWidth: 1,
                                borderStyle: 'dashed',
                                borderColor: '#498BF0',
                              },
                            ]}></View>
                        </View>
                        <View>
                          <Text
                            style={{
                              color: '#292625',
                              fontFamily: 'Poppins-Medium',
                              fontSize: 14,
                              letterSpacing: 1,
                            }}>
                            {t('En transit')}
                          </Text>
                          <Text
                            style={{
                              color: '#C3BCBC',
                              fontFamily: 'Poppins-Regular',
                              fontSize: 12,
                              letterSpacing: 1,
                            }}>
                            {Commande.dateExpedition}
                          </Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <View
                          style={{
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <View
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: 50,
                              backgroundColor: '#fff',
                              borderWidth: 4,
                              borderColor: '#EF5448',
                            }}></View>
                          <View
                            style={{
                              width: 1,
                              height: 70,
                              justifyContent: 'center',
                              alignItems: 'center',
                              borderWidth: 1,
                              borderStyle: 'dashed',
                              borderColor: '#EF5448',
                            }}></View>
                        </View>
                        <View>
                          <Text
                            style={{
                              color: '#292625',
                              fontFamily: 'Poppins-Medium',
                              fontSize: 14,
                              letterSpacing: 1,
                            }}>
                            {t('En transit')}
                          </Text>
                          <Text
                            style={{
                              color: '#C3BCBC',
                              fontFamily: 'Poppins-Regular',
                              fontSize: 12,
                              letterSpacing: 1,
                            }}>
                            {Commande.dateExpedition != null
                              ? Commande.dateExpedition
                              : ''}
                          </Text>
                        </View>
                      </>
                    )}
                  </>
                ) : (
                  <></>
                )}
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 20,
                }}>
                {Commande.service == 'Fret par avion' ||
                Commande.service == 'Fret par bateau' ||
                Commande.service == 'Ventes Privées' ||
                Commande.service == "Demandes d'achat" ? (
                  <>
                    {Commande.dateDisponibilitePointRelais != null ||
                    Commande.dateLivraison != null ||
                    Commande.dateRetour != null ||
                    Commande.dateAnnulation != null ? (
                      <>
                        <View
                          style={{
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <View
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: 50,
                              backgroundColor: '#fff',
                              borderWidth: 4,
                              borderColor: '#498BF0',
                            }}></View>
                        </View>
                        <View>
                          <Text
                            style={{
                              color: '#292625',
                              fontFamily: 'Poppins-Medium',
                              fontSize: 14,
                              letterSpacing: 1,
                            }}>
                            {Commande.dateDisponibilitePointRelais != null ? (
                              t('Disponible en point relais')
                            ) : (
                              <></>
                            )}
                            {Commande.dateLivraison != null ? (
                              t('Commande livrée')
                            ) : (
                              <></>
                            )}
                            {Commande.dateRetour != null ? (
                              t('Commande retournée')
                            ) : (
                              <></>
                            )}
                            {Commande.dateAnnulation != null ? (
                              t('Commande annulée')
                            ) : (
                              <></>
                            )}
                          </Text>
                          <Text
                            style={{
                              color: '#C3BCBC',
                              fontFamily: 'Poppins-Regular',
                              fontSize: 12,
                              letterSpacing: 1,
                            }}>
                            {Commande.dateDisponibilitePointRelais != null ? (
                              Commande.dateDisponibilitePointRelais
                            ) : (
                              <></>
                            )}

                            {Commande.dateLivraison != null ? (
                              Commande.dateLivraison
                            ) : (
                              <></>
                            )}

                            {Commande.dateRetour != null ? (
                              Commande.dateRetour
                            ) : (
                              <></>
                            )}
                            {Commande.dateAnnulation != null ? (
                              Commande.dateAnnulation
                            ) : (
                              <></>
                            )}
                          </Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <View
                          style={{
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <View
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: 50,
                              backgroundColor: '#fff',
                              borderWidth: 4,
                              borderColor: '#EF5448',
                            }}></View>
                        </View>
                        <View>
                          <Text
                            style={{
                              color: '#292625',
                              fontFamily: 'Poppins-Medium',
                              fontSize: 14,
                              letterSpacing: 1,
                            }}>
                            {t('Commande livrée')}
                          </Text>
                          <RenderDateCommandeLivree />
                        </View>
                      </>
                    )}
                  </>
                ) : (
                  <></>
                )}
              </View>
            </View>
          </View>

          <View style={{marginTop: 24, paddingHorizontal: 16, marginBottom: 20}}>
            <View
              style={{
                backgroundColor: '#fff',
                paddingTop: 24,
                paddingBottom: 13,
                paddingLeft: 13,
                paddingRight: 10,
                borderRadius: 10,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <View
                  style={{
                    width: 46,
                    height: 46,
                    backgroundColor: '#498bf04d',
                    borderRadius: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Image source={Truck} />
                </View>
                <View>
                  <Text
                    style={{
                      color: '#C3BCBC',
                      fontSize: 13,
                      fontFamily: 'Poppins-Regular',
                      letterSpacing: 1,
                    }}>
                    {Commande.uuid.length > 10 ? (
                      <>
                        {t('N° de commande')} {'\n'}
                        {Commande.uuid ? Commande.uuid : ''}
                      </>
                    ) : (
                      <>
                        {t('N° de commande')}{' '}
                        {Commande.uuid ? Commande.uuid : ''}
                      </>
                    )}
                  </Text>
                </View>
                <View>
                  <TouchableOpacity
                    onPress={() =>
                      handleCommandDetail(commandeId, Commande.paysLivraisonId)
                    }
                    style={{marginBottom: 15}}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: '#498BF0',
                        textDecorationLine: 'underline',
                        fontFamily: 'Poppins-Medium',
                        textAlign: 'center',
                        marginBottom: 9,
                      }}>
                      {t('Voir le contenu')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => imprimerFacture(Commande.uuid)}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: '#498BF0',
                        textDecorationLine: 'underline',
                        fontFamily: 'Poppins-Medium',
                        textAlign: 'center',
                      }}>
                      {t('Éditer la facture')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
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
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  orderDetailsContainer: {
    backgroundColor: '#fff',
    width: windowWidth * 0.9,
    height: 'auto',
    alignSelf: 'center',
    elevation: 3,
    borderRadius: 10,
    justifyContent: 'space-around',
    marginTop: windowHeight * 0.03,
  },
  TextContainer: {
    // backgroundColor: 'red',
    height: 'auto',
    //width: windowWidth * 0.45,
    alignItems: 'flex-start',
    //justifyContent: 'space-evenly',
    marginTop: 10,
  },
  NameTxt: {
    // backgroundColor: 'green',
    // width: windowWidth * 0.45,
    fontFamily: 'Roboto-Regular',
    fontSize: 12,
    color: '#000',
    marginTop: 5,
  },
  textPrice: {
    marginLeft: windowWidth * 0.3,
  },
  PriceAndDateText: {
    // backgroundColor: 'gold',
    width: windowWidth * 0.3,
    fontFamily: 'Roboto-Regular',
    fontSize: 10,
    color: '#000',
  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  AllTextContainer: {
    // backgroundColor: 'gold',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 'auto',
  },
  boxContainer: {
    backgroundColor: '#feafc9',
    width: 100,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 7,
  },
  boxText: {
    fontFamily: 'Roboto-Bold',
    fontSize: 13,
    color: '#fff',
  },
  orderAgainContainer: {
    backgroundColor: '#3292E0',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: windowWidth * 0.7,
    height: windowHeight * 0.05,
    borderRadius: 50,
    marginTop: 10,
    marginBottom: 12,
  },
  TExtstyle: {
    fontFamily: 'Roboto-Regular',
    fontSize: 13,
    color: '#fff',
  },
  containerFlatelist: {
    // flex: 1,
    //         justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    width: windowWidth * 1.0,
    height: windowHeight * 1.0,
  },
  titleText: {
    color: '#000',
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
  },
});

export default CommandeDetail;
