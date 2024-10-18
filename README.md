# Documentation GodareApp

## Table des matières

1. [Introduction](#1-introduction)
2. [Architecture de l'application](#2-architecture-de-lapplication)
3. [Fonctionnalités principales](#3-fonctionnalités-principales)
4. [Navigation](#4-navigation)
5. [Gestion de l'état](#5-gestion-de-létat)
6. [Authentification](#6-authentification)
7. [Internationalisation](#7-internationalisation)
8. [API et intégrations](#8-api-et-intégrations)
9. [Composants principaux](#9-composants-principaux)
10. [Écrans principaux](#10-écrans-principaux)
11. [Tests](#11-tests)
12. [Déploiement](#12-déploiement)
13. [Problèmes connus et améliorations futures](#13-problèmes-connus-et-améliorations-futures)

## 1. Introduction

GodareApp est une application mobile de commerce électronique développée avec React Native. Elle permet aux utilisateurs de parcourir des produits, gérer un panier, passer des commandes et organiser des livraisons internationales.

## 2. Architecture de l'application

### Structure des dossiers

/
├── assets/
│   └── images/
├── components/
├── constant/
├── helper/
├── hooks/
├── language/
├── modules/
├── navigation/
├── screen/
└── App.js

### Technologies principales

- React Native
- React Navigation
- Firebase (Authentication, Firestore)
- Axios
- i18next
- react-native-stripe-sdk

## 3. Fonctionnalités principales

- Authentification des utilisateurs
- Catalogue de produits avec filtres et tri
- Panier d'achat
- Processus de commande et paiement
- Suivi des commandes
- Gestion des adresses de livraison
- Support multilingue (français et anglais)

## 4. Navigation

La navigation est gérée par React Navigation, combinant Stack Navigator et Tab Navigator.

### Structure de navigation

- BottomTabNavigator
  - HomeStack
  - SearchScreen
  - MessageStack
  - CartStack
  - ProfileStack

Fichier principal : `AppNavigation.js`

## 5. Gestion de l'état

### État local

Utilisation du hook `useState` de React pour la gestion de l'état local des composants.

### État global

- Contexte : `BagContext` pour gérer le nombre d'articles dans le panier
- AsyncStorage : Stockage persistant pour les données utilisateur et les préférences

## 6. Authentification

L'authentification est gérée via Firebase Authentication.

### Méthodes d'authentification

- Email/Mot de passe
- Numéro de téléphone

Fichiers principaux : `LoginScreen.js`, `SignUpScreen.js`

## 7. Internationalisation

L'application supporte le français et l'anglais, utilisant i18next.

Fichier principal : `language/i18n.js`

## 8. API et intégrations

### Endpoints principaux

- `/service` : Services disponibles
- `/pays` : Pays de livraison
- `/categories` : Catégories de produits
- `/products` : Gestion des produits
- `/commandes` : Gestion des commandes

### Intégrations externes

- Stripe pour les paiements

## 9. Composants principaux

- `Button` : Bouton réutilisable
- `ServiceHeader` : En-tête pour les écrans de service
- `CartItem` : Élément de panier
- `Dropdown` : Menu déroulant personnalisé

## 10. Écrans principaux

### HomeScreen

Affiche les services disponibles et permet la navigation vers d'autres sections.

### ShoppingScreen

Liste les produits avec options de filtrage et de tri.

### CartScreen

Affiche les articles du panier et permet de procéder au paiement.

### CheckoutScreen

Gère le processus de paiement et de finalisation de la commande.

### ProfileScreen

Permet à l'utilisateur de gérer son profil et ses préférences.

## 11. Tests

Les tests unitaires sont implémentés avec Jest et React Native Testing Library.

### Exemples de tests

- `CheckoutScreen.test.js`
- `ProductList.test.js`
- `CartScreen.test.js`
- `CalculPrix.test.js`
- `useBag.test.js`

## 12. Déploiement

L'application peut être déployée sur iOS via Xcode et sur Android via Google Play Store.

## 13. Problèmes connus et améliorations futures

- Optimisation de la gestion de l'état global (considérer Redux ou MobX)
- Refactorisation de certains composants longs
- Amélioration de la gestion des erreurs
- Augmentation de la couverture des tests
- Optimisation des performances pour les listes longuesÏ
