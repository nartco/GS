import React, { useEffect, useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import Feather from "react-native-vector-icons/Feather";

const RenderList = ({
  RenderAttribute,
  Service,
  func,
  item,
  ButtonPrix,
  saveProductNewQuantity,
  wp,
  windowWidth,
  removeProductFromCart,
  Language,
}) => {
  const [image, setImage] = useState();
  const getAttributeImages = (cartItem) => {
    const { product, attributes } = cartItem;

    // Si le produit n'a pas d'attributs, retourner les images par défaut du produit
    if (!product.attributs || product.attributs.length === 0) {
      return product.productImages.map((img) => ({ url: img.url }));
    }

    let matchingImages = [];

    // Parcourir chaque attribut du produit
    product.attributs.forEach((attr) => {
      const attributId = attr.attribut.id.toString();
      const selectedValue = attributes[attributId];

      if (selectedValue) {
        // Trouver la valeur d'attribut correspondante
        const matchingAttributeValue = attr.attributValues.find(
          (val) =>
            val.valeur === selectedValue || val.valeurEN === selectedValue
        );

        // Si une correspondance est trouvée et qu'elle a des images, les ajouter
        if (matchingAttributeValue && matchingAttributeValue.attributImages) {
          matchingImages = matchingImages.concat(
            matchingAttributeValue.attributImages.map((img) => ({
              url: img.reference,
            }))
          );
        }
      }
    });

    // Si aucune image d'attribut n'est trouvée, utiliser les images par défaut du produit
    if (matchingImages.length === 0) {
      return product.productImages.map((img) => ({ url: img.url }));
    }

    console.log({ matchingImages }, "32332");
    return matchingImages;
  };

  useEffect(() => {
    if ("ventes-privees" == Service.code) {
      const image = getAttributeImages(item);

      setImage(image);
    }
  }, []);

  console.log({ item }, "item");

  return (
    <>
      <View
        style={{
          backgroundColor: "#fff",
          paddingVertical: 12,
          marginBottom: 16,
          borderRadius: 18,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 20,
            width: windowWidth * 0.85,
            alignSelf: "center",
          }}
        >
          {"ventes-privees" == Service.code ? (
            <View>
              {item.ProductImage ? (
                <Image
                  source={{
                    uri: image ? image[0]?.url : item.ProductImage[0].url,
                  }}
                  resizeMode="contain"
                  style={{ width: wp(18), height: wp(28) }}
                />
              ) : (
                <Text></Text>
              )}
            </View>
          ) : (
            <View>
              {item.image !== "" ? (
                <Image
                  source={{ uri: item.image }}
                  resizeMode="contain"
                  style={{ width: wp(18), height: wp(28) }}
                />
              ) : (
                <>
                  <View style={{ width: wp(10), height: wp(28) }}></View>
                </>
              )}
            </View>
          )}
          <View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: wp(10),
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 12,
                    textAlign: "left",
                    maxWidth: 180,
                    fontFamily: "Poppins-Regular",
                    color: "#000",
                  }}
                >
                  {"fr" == Language ? item.product.name : item.product.nameEN}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  removeProductFromCart(item);
                }}
              >
                <Feather name="trash-2" color="#E10303" size={25} />
              </TouchableOpacity>
            </View>
            <View style={{ marginTop: 8 }}>
              <RenderAttribute service={Service} product={item} />
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginTop: 12,
              }}
            >
              <ButtonPrix title={item.Price} language={Language} />
              {"demandes-d-achat" == Service.code ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 25,
                    backgroundColor: "#EFEFEF",
                    borderRadius: 18,
                    width: windowWidth * 0.35,
                    paddingVertical: 5,
                  }}
                >
                  {/* <TouchableOpacity
                              onPress={() => {
                                func(item, 'decrement');
                              }}>
                                <Feather name="minus" color="#000" size={25}/>
                            </TouchableOpacity>
  
                            <View style={{flexDirection: "row", alignItems: "center", gap: 2}}>
                              <Text style={{fontFamily: "Poppind-Regular", color: "#343434", fontSize: 20}}>{ item.quantite }</Text>
                            </View>
                            <TouchableOpacity
                              onPress={() => {
                                func(item, 'increment');
                              }}>
                                <Feather name="plus" color="#000" size={22}/>
                            </TouchableOpacity> */}
                  <TextInput
                    placeholder={
                      item.quantite == ""
                        ? "Enter Quantity"
                        : item.quantite.toString()
                    }
                    placeholderTextColor="#666"
                    value={item.quantite}
                    style={{
                      width: "100%",
                      paddingLeft: 13,
                      paddingVertical: 2,
                      fontSize: 14,
                      color: "#000",
                    }}
                    onChangeText={(text) => saveProductNewQuantity(item, text)}
                  />
                </View>
              ) : (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 25,
                    backgroundColor: "#EFEFEF",
                    borderRadius: 18,
                    width: windowWidth * 0.35,
                    paddingVertical: 5,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      const qte =
                        typeof item.quantite == "object"
                          ? parseInt(item?.quantite?.value)
                          : parseInt(item?.quantite);

                      if (qte > 1) {
                        func(item, "decrement");
                      }
                    }}
                  >
                    <Feather name="minus" color="#000" size={25} />
                  </TouchableOpacity>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Poppind-Regular",
                        color: "#343434",
                        fontSize: 20,
                      }}
                    >
                      {typeof item.quantite == "object"
                        ? item.quantite.value.toString()
                        : item.quantite.toString()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      func(item, "increment");
                    }}
                  >
                    <Feather name="plus" color="#000" size={22} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </>
  );
};

export default RenderList;
