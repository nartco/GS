import React from 'react';
import {Image, Text, TextInput, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const createAttributeString = attributs => {
  if (!attributs || typeof attributs !== 'object') {
    return '';
  }

  // Obtenir toutes les valeurs de l'objet et les filtrer pour enlever les valeurs vides ou undefined
  const values = Object.values(attributs).filter(
    value => value && value.trim() !== '',
  );

  // Joindre toutes les valeurs avec un espace
  return values.join(', ');
};

const getAttributeImages = commandeProduct => {
  const {product, attributs} = commandeProduct;

  if (!product.attributs || product.attributs.length === 0) {
    return product.productImages ? [{url: product.productImages[0].url}] : [];
  }

  let matchingImages = [];

  Object.entries(attributs).forEach(([attributId, selectedValue]) => {
    const attr = product.attributs.find(
      a => a.attribut.id.toString() === attributId,
    );
    if (attr) {
      const matchingAttributeValue = attr.attributValues.find(
        val => val.valeur === selectedValue || val.valeurEN === selectedValue,
      );
      if (matchingAttributeValue && matchingAttributeValue.attributImages) {
        matchingImages = matchingImages.concat(
          matchingAttributeValue.attributImages.map(img => ({
            url: `https://godaregroup.com/api/fichiers/attribut/description/${img.reference}`,
          })),
        );
      }
    }
  });

  return matchingImages.length > 0
    ? matchingImages
    : product.productImages
    ? [{url: product.productImages[0].url}]
    : [];
};

const RenderCommandList = ({
  CartCommand,
  RenderAttributeCommand,
  ServiceCommand,
  funcQuantity,
  item,
  ButtonPrix,
  saveProductNewQuantityCommand,
  wp,
  windowWidth,
  removeProductFromCart,
  language,
}) => {
  let prix = 0;

  let ItemCommandPrice = createAttributeString(item.attributs);

  let stock = [];
  stock.push(item.product?.stocks);
  console.log(item.product.service, 'i233232322323em');
  if (item.product.service == 'demandes-d-achat') {
    console.log(item.product, 'ite233223232323232333232232323m');

    prix = parseFloat(item.prixAchat);
  } else if (item.product.service == 'ventes-privees') {
    stock.forEach(item => {
      item.map(obj => {
        // Fonction pour normaliser et diviser une chaîne en ensemble de mots
        const normalizeAndSplit = str => {
          return new Set(
            str
              .toLowerCase()
              .replace(/,/g, '')
              .split(' ')
              .filter(word => word.trim() !== ''),
          );
        };

        // Normaliser et diviser obj.combinaison et ItemCommandPrice
        const combinaisonSet = normalizeAndSplit(obj.combinaison);
        const itemCommandPriceSet = normalizeAndSplit(ItemCommandPrice);

        // Vérifier si les ensembles sont égaux
        const setsAreEqual = (a, b) =>
          a.size === b.size && [...a].every(value => b.has(value));

        if (setsAreEqual(combinaisonSet, itemCommandPriceSet)) {
          console.log({obj}, 'obj');
          prix = parseFloat(obj.prix);
        }
      });
    });
  } else {
    console.log(item.product, 'ite233223232323232333232232323m');
    prix = parseFloat(item.product.productSpecificites[0].prix);
  }
  prix = isNaN(prix) ? 0 : prix;

  let quantite = parseInt(item.quantite);
  quantite = isNaN(quantite) ? 0 : quantite;

  let totalPrice = prix * quantite;

  const attributeImages = getAttributeImages(item);

  if (CartCommand.length < 1) {
    setRemiseCode('');
  }
  return (
    <View
      style={{
        backgroundColor: '#fff',
        paddingVertical: 12,
        marginBottom: 16,
        borderRadius: 18,
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 20,
          width: windowWidth * 0.85,
          alignSelf: 'center',
        }}>
        {
          <View>
            {'ventes-privees' == item.product.service ? (
              <>
                {item.product.productImages != null ? (
                  <Image
                    source={{uri: attributeImages[0].url}}
                    resizeMode="contain"
                    style={{width: wp(18), height: wp(28)}}
                  />
                ) : (
                  <>
                    <View style={{width: wp(10), height: wp(28)}}></View>
                  </>
                )}
              </>
            ) : (
              <>
                {item.photo != null ? (
                  <Image
                    source={{uri: item.photo}}
                    resizeMode="contain"
                    style={{width: wp(18), height: wp(28)}}
                  />
                ) : (
                  <View style={{width: wp(10), height: wp(28)}}></View>
                )}
              </>
            )}
          </View>
        }
        <View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: wp(10),
            }}>
            <View>
              <Text
                style={{
                  fontSize: 12,
                  textAlign: 'left',
                  maxWidth: 180,
                  fontFamily: 'Poppins-Regular',
                  color: '#000',
                }}>
                {item.product.name}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                removeProductFromCart(item);
              }}>
              <Feather name="trash-2" color="#E10303" size={25} />
            </TouchableOpacity>
          </View>
          <View style={{marginTop: 8}}>
            <RenderAttributeCommand service={ServiceCommand} product={item} />
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              marginTop: 12,
            }}>
            <ButtonPrix title={prix} language={language} />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 25,
                backgroundColor: '#EFEFEF',
                borderRadius: 18,
                width: windowWidth * 0.35,
                paddingVertical: 5,
              }}>
              {ServiceCommand.code == 'demandes-d-achat' ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 25,
                    backgroundColor: '#EFEFEF',
                    borderRadius: 18,
                    width: windowWidth * 0.35,
                    paddingVertical: 2,
                  }}>
                  <TextInput
                    placeholder={
                      item.quantite == '' ? 'Enter Quantity' : item.quantite
                    }
                    placeholderTextColor={'#666'}
                    value={item.quantite}
                    style={{
                      width: '100%',
                      paddingLeft: 13,
                      paddingVertical: 2,
                      fontSize: 15,
                      color: '#000',
                    }}
                    onChangeText={text =>
                      saveProductNewQuantityCommand(item, text)
                    }
                  />
                </View>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={() => {
                      funcQuantity(item, 'decrement');
                    }}>
                    <Feather name="minus" color="#000" size={25} />
                  </TouchableOpacity>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 2,
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Poppind-Regular',
                        color: '#343434',
                        fontSize: 20,
                      }}>
                      {item.quantite}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      funcQuantity(item, 'increment');
                    }}>
                    <Feather name="plus" color="#000" size={22} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default RenderCommandList;
