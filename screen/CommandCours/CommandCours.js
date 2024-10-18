import {View, Text, ScrollView, Image, ActivityIndicator} from 'react-native';
import React, {useEffect, useState} from 'react';
import Button from '../../components/Button';
import {HeaderEarth} from '../../components/Header';

import {useTranslation} from 'react-i18next';
import styles from './styles';
import axiosInstance from '../../axiosInstance';
import auth from '@react-native-firebase/auth';

const CommandCours = ({navigation, route}) => {
  const {commandeId} = route.params;
  const [Commande, setCommande] = useState(null);
  const [Loader, setLoader] = useState(true);

  const {t} = useTranslation();
  useEffect(() => {
    fetchCommande();
  }, []);

  const fetchCommande = async () => {
    setLoader(true);

    try {
      const user = auth().currentUser;
      const response = await axiosInstance.get(
        '/commandes/' + commandeId + '/' + user.uid  ,
      );

      setCommande(response.data);

      console.log('commande', response.data);
    } catch (erreur) {
      console.log('commande error', erreur);
    }

    setLoader(false);
  };

  console.log(Commande);

  const imprimerFacture = () => {
    // call backoffice to generate pdf et show it
  };

  if (true === Loader || !Commande) {
    return (
      <View style={{justifyContent: 'center', height: '80%'}}>
        <ActivityIndicator size={'large'} color="#3292E0" />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <HeaderEarth />
      <ScrollView>
        <View>
          <Text style={styles.NameTxt}>
            {t('Service')} :{' '}
            {Commande.service ? Commande.service : 'Fret par avion'}
          </Text>

          <Text style={styles.textPrice}>
            {t('Prix total')} : €{Commande.totalPrice}
          </Text>

          <Text style={styles.textPrice}>
            {t('Numéro de la commande')} :{' '}
            {Commande.uuid ? Commande.uuid : 222222}
          </Text>

          <Text style={styles.NameTxt}>
            {t('Date de la commande')} : {Commande.createdAt}
          </Text>

          <Text style={styles.NameTxt}>
            {t('Statut')} : {Commande.statut}
          </Text>

          <Text style={styles.NameTxt}>
            {t('Mode paiement')} : {Commande.modePaiement}
          </Text>

          {Commande?.avoir && Commande?.avoir > 0 && (
            <Text style={styles.NameTxt}>
              {t('Avoir')} : {Commande?.avoir}
            </Text>
          )}

          {Commande.remise && Commande.remise > 0 && (
            <Text style={styles.NameTxt}>
              {t('Remise')} : {Commande.remise}
            </Text>
          )}

          <View>
            <Text style={styles.titleText}>{t('Produit(s)')}</Text>
          </View>

          <View>
            {Commande.commandeProducts.map(commandeProduct => (
              <View style={{marginBottom: 20}}>
                <Text style={styles.NameTxt}>
                  {t('Nom')} : {commandeProduct.product.name} - {t('Quantité')}{' '}
                  : {commandeProduct.quantite}
                </Text>

                {Object.values(commandeProduct.attributs).length > 0 && (
                  <Text style={styles.NameTxt}>
                    {t('Attributs')} :{' '}
                    {Object.values(commandeProduct.attributs).join(', ')}
                  </Text>
                )}

                {commandeProduct.prixAchat && (
                  <Text style={styles.NameTxt}>
                    {t("Prix d'achat")} : {commandeProduct.prixAchat}
                  </Text>
                )}

                {commandeProduct.url && (
                  <Text style={styles.NameTxt}>
                    {t('URL')} : {commandeProduct.url}
                  </Text>
                )}

                {commandeProduct.informationComplementaire && (
                  <Text style={styles.NameTxt}>
                    {t('Information(s) complémentaire(s)')} :{' '}
                    {commandeProduct.informationComplementaire}
                  </Text>
                )}

                {commandeProduct.photo && (
                  <Image
                    source={{uri: commandeProduct.photo}}
                    resizeMode="contain"
                    style={{width: 70, height: 50}}
                  />
                )}
              </View>
            ))}
          </View>

          {(Commande.service == 'Fret par avion' ||
            Commande.service == 'Fret par bateau') &&
          Commande.depot ? (
            <>
              <View>
                <Text style={styles.titleText}>
                  {'enlevement' == Commande.depot.mode
                    ? t('Enlèvement à domicile')
                    : t('Dépôt au magasin')}
                </Text>
              </View>

              <View>
                {Commande.depot.nom && (
                  <Text style={styles.NameTxt}>{Commande.depot.nom}</Text>
                )}

                <Text style={styles.NameTxt}>
                  {t('Adresse')} : {Commande.depot.adresse}
                </Text>

                {Commande.depot.telephone && (
                  <Text style={styles.NameTxt}>{Commande.depot.telephone}</Text>
                )}

                {Commande.depot.creneauEnlevementPlage && (
                  <Text style={styles.NameTxt}>
                    {t("Date d'enlèvement")} :{' '}
                    {Commande.depot.creneauEnlevementPlage.date +
                      t(' entre ') +
                      Commande.depot.creneauEnlevementPlage.horaireDebut +
                      t(' et ') +
                      Commande.depot.creneauEnlevementPlage.horaireFin}
                  </Text>
                )}
              </View>
            </>
          ) : (
            <></>
          )}

          <View>
            <Text style={styles.titleText}>
              {'relais' == Commande.livraison.mode
                ? t('Retrait en point relais')
                : t('Livraison à domicile')}
            </Text>
          </View>

          <View>
            <Text style={styles.NameTxt}>{Commande.livraison.nom}</Text>

            <Text style={styles.NameTxt}>{Commande.livraison.adresse}</Text>

            <Text style={styles.NameTxt}>{Commande.livraison.telephone}</Text>
          </View>

          <View>
            <Button
              title="Imprimer la facture"
              onPress={() => imprimerFacture()}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default CommandCours;
