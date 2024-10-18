import React from 'react';
import {Text} from 'react-native';
import {useTranslation} from 'react-i18next';

const BoldTranslatedText = ({textKey, normalText, style}) => {
  const {t} = useTranslation();
  return (
    <Text style={style}>
      <Text>{t(textKey)}</Text>
      {normalText && <Text style={style}>{normalText}</Text>}
    </Text>
  );
};

export default BoldTranslatedText;
