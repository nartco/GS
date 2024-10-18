import Cat1 from "../assets/images/image_1.png"
import Cat2 from "../assets/images/image_2.png"

import Product1 from "../assets/images/product_1.png"
import ProductGrid1 from "../assets/images/iphone.png"
import HeaderEarthImage from "../assets/images/earth.png"
import Product2 from "../assets/images/product_2.png"
import AntDesign from "react-native-vector-icons/AntDesign"
import Ionicons from "react-native-vector-icons/Ionicons"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import Octicons from "react-native-vector-icons/Octicons"
import Coupon from "../assets/images/coupon.png"
import Language from "../assets/images/language.png"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import Feather from "react-native-vector-icons/Feather"
import { Image } from "react-native"
import CartViolet from "../assets/images/card_violet.png"
import CartGreen from "../assets/images/card_green.png"
import Waveimg from "../assets/images/wave.png"
import Plane from "../assets/images/plane.png"
import Boat from "../assets/images/boat.png"
import Iphone from "../assets/images/iphone.png"
import { useTranslation } from "react-i18next"


export const categories = [
    {
        id: 1,
        title: "Fret par avion",
        desc: "Lorem lorem lorem lorem lorem",
        img: Cat2,
        path:"PaysLivraison"
    },
    {
        id: 2,
        title: "Fret par bateau",
        desc: "Lorem lorem lorem lorem lorem",
        img: Cat1,
        path:"PaysLivraison"
    },
    {
        id: 3,
        title: "Ventes privées",
        desc: "Lorem lorem lorem lorem lorem",
        img: Cat2,
        path:"ShoppingScreen"
    },
    {
        id: 4,
        title: "Demandes d’achat",
        desc: "Lorem lorem lorem lorem lorem",
        img: Cat1,
        path:"ShoppingScreen"
    },
]



export const products = [
    {
        id: 1,
        title: "Vétements, chaussures et accessoires",
        price: 12,
        old_price: 16,
        image: Product1,
        titleColor: "#94217B",
        bgColor: "rgba(148, 33, 122.70, 0.15)"
    },
    {
        id: 2,
        title: "Bijoux",
        price: 12,
        old_price: 16,
        image: Product2,
        titleColor: "#EB971A",
        bgColor: "rgba(235, 151, 26, 0.15)"
    },
    {
        id: 3,
        title: "Bijoux",
        price: 12,
        old_price: 16,
        image: Product2,
        titleColor: "#EB971A",
        bgColor: "rgba(235, 151, 26, 0.15)"
    },
] 

export const productsCard = [
    {
        id: 1,
        title: "Iphone 12 Pro Max",
        price: 450,
        old_price: 450,
        image: ProductGrid1,
        titleColor: "#94217B",
        bgColor: "rgba(148, 33, 122.70, 0.15)"
    },
    {
        id: 2,
        title: "Iphone 12 Pro Max",
        price: 450,
        old_price: 450,
        image: ProductGrid1,
        titleColor: "#EB971A",
        bgColor: "rgba(235, 151, 26, 0.15)"
    },
    {
        id: 3,
        title: "Iphone 12 Pro Max",
        price: 450,
        old_price: 450,
        image: ProductGrid1,
        titleColor: "#EB971A",
        bgColor: "rgba(235, 151, 26, 0.15)"
    },
    {
        id: 4,
        title: "Iphone 12 Pro Max",
        price: 450,
        old_price: 450,
        image: ProductGrid1,
        titleColor: "#EB971A",
        bgColor: "rgba(235, 151, 26, 0.15)"
    },
] 

export const headerHearthNav = [
    {
    id: 1,
    img: HeaderEarthImage,
    title: "GS"
}
]

export const UserList = [
    {
        id: 1,
        title: "Commandes",
        icon: <AntDesign name="inbox"  size={24} color="#2BA6E9"/>,
        path: "CommandeScreen"
    },
    {
        id: 2,
        title: "Addresses",
        icon: <MaterialCommunityIcons name="map-marker-outline"  size={24} color="#2BA6E9"/>,
        path: "AdresseScreen"
    },
    {
        id: 3,
        title: "Profil",
        icon: <Ionicons name="person-circle-outline"  size={24} color="#2BA6E9"/>,
        path: "EditProfile"
    },
    {
        id: 4,
        title: "Remise et Avoir",
        icon: <Image source={Coupon} />,
        path: "RemiseAvoir"
    },
    {
        id: 5,
        title: "Cartes bancaires",
        icon: <Octicons name="credit-card"  size={24} color="#2BA6E9"/>,
        path: "CartBancair"
    },
    {
        id: 6,
        title: "Langues",
        icon: <MaterialIcons name="language"  size={24} color="#2BA6E9"/>,
        path: "LanguageScreen"
    },
    {
        id: 7,
        title: "Envoyer un message",
        icon: <Image source={Language} />,
        path: "MessageScreen"
    },
]

export const adress = [
    {
        id: 1,
        title: "Domicile",
        iconPen: <MaterialCommunityIcons name='pencil-outline' size={20} color="#000"/>,
        iconTrash: <Feather name='trash-2' size={20} color="#000"/>,
        iconMap: <Feather name='map-pin' size={20} color="#2BA6E9"/>,
        address: "2715 Ash Dr. San Jose, South Dakota 83475",
        phone: "060224411"
    },
    {
        id: 2,
        title: "Domicile",
        iconPen: <MaterialCommunityIcons name='pencil-outline' size={20} color="#000"/>,
        iconTrash: <Feather name='trash-2' size={20} color="#000"/>,
        iconMap: <Feather name='map-pin' size={20} color="#2BA6E9"/>,
        address: "2715 Ash Dr. San Jose, South Dakota 83475",
        phone: "060224411"
    },
    {
        id: 3,
        title: "Domicile",
        iconPen: <MaterialCommunityIcons name='pencil-outline' size={20} color="#000"/>,
        iconTrash: <Feather name='trash-2' size={20} color="#000"/>,
        iconMap: <Feather name='map-pin' size={20} color="#2BA6E9"/>,
        address: "2715 Ash Dr. San Jose, South Dakota 83475",
        phone: "060224411"
    },
]

export const cardData = [
    {
       id: 1,
       name: "Credit Card",
       price: 90.85,
       card: "**** **** **** 1234",
       image: CartViolet,
    },
    {
       id: 1,
       name: "Credit Card",
       price: 90.85,
       card: "**** **** **** 1234",
       image: CartGreen,
    },
]

export const card_category = [
    {
        id: 1,
        title: "",
        titledisplay: "none",
        img: <Octicons name="credit-card" size={35} color="#000"/>,
        imgActive: <Octicons name="credit-card" size={35} color="#fff"/>,
        paddingHorrizontal: 40
    },
    {
        id: 2,
        title: "",
        titledisplay: "none",
        imgDisplay: "flex",
        img: <Image source={Waveimg}/>,
        imgActive: <Image source={Waveimg}/>,
        paddingHorrizontal: 18

    },
    {
        id: 3,
        title: "Payer au dépot",
        titledisplay: "flex",
        imgDisplay: "none",
        img: <Image source={Waveimg}/>,
        imgActive: <Image source={Waveimg}/>,
        paddingHorrizontal: 22
    },
    {
        id: 3,
        title: "Payer au Livraison",
        titledisplay: "flex",
        imgDisplay: "none",
        img: <Image source={Waveimg}/>,
        imgActive: <Image source={Waveimg}/>,
        paddingHorrizontal: 22
    },
] 



export const productCart = [
    {
        id: 1,
        title: "Iphone 12 Pro Max",
        color: "Noir",
        stokage: 256,
        etat: "Occasion",
        price: "420€",
        image: Iphone
    },
    {
        id: 2,
        title: "Iphone 12 Pro Max",
        color: "Noir",
        stokage: 256,
        etat: "Occasion",
        price: "420€",
        image: Iphone
    },
]