import React, { useEffect, useState } from 'react';
import { View, Image, StatusBar, Dimensions } from 'react-native';
import HeaderEarthImage from '../assets/images/earth.png';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- petits utilitaires ---
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

const computeLayout = () => {
  const { width, height } = Dimensions.get('window');
  const aspect = height / width; // ~2.16 iPhone récents, ~2.2 Android 20:9, ~1.6-1.7 tablettes

  // Hauteur du header (% de la hauteur écran)
  let headerPct;
  if (height <= 667) headerPct = 13;       // petits écrans (SE/6/7/8)
  else if (height >= 820) headerPct = 9;   // grands écrans (Pro Max / grands Android)
  else headerPct = 11;                     // intermédiaires
  const headerHeight = hp(headerPct);

  // Taille du logo (% de la largeur), ajustée au ratio
  let logoPctBase;
  if (aspect >= 2.15) logoPctBase = 16;    // très “haut” (iPhone Pro Max / 20:9 récents)
  else if (aspect >= 1.9) logoPctBase = 15.5; // téléphones modernes
  else if (aspect >= 1.7) logoPctBase = 14;   // un peu “larges”
  else logoPctBase = 12.5;                    // tablettes / très “larges”

  const logoPct = clamp(logoPctBase, 12, 18);
  const logoSize = wp(logoPct);


  return { headerHeight, logoSize };
};

export const HeaderEarth = () => {
  // --- barre de statut respectant le safe area ---
  const CustomStatusBar = ({ backgroundColor, barStyle = 'light-content' }) => {
    const inset = useSafeAreaInsets();
    return (
      <View style={{ height: inset.top, backgroundColor }}>
        <StatusBar animated barStyle={barStyle} backgroundColor={backgroundColor} />
      </View>
    );
  };

  // layout responsive + écoute des changements de dimensions (rotation, split view, etc.)
  const [layout, setLayout] = useState(computeLayout);
  useEffect(() => {
    const sub = Dimensions.addEventListener('change', () => setLayout(computeLayout()));
    return () => sub?.remove?.() ?? sub?.remove();
  }, []);

  const { headerHeight, logoSize } = layout;

  return (
    <>
      <CustomStatusBar backgroundColor="#2BA6E9" />
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#2BA6E9',
          height: headerHeight,
        }}
      >
        <Image
          source={HeaderEarthImage}
          style={{ width: logoSize, height: logoSize }}
          resizeMode="contain"
        />
      </View>
    </>
  );
};
