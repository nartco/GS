//import liraries
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions
} from 'react-native';

import Flag from 'react-native-flags';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

// create a component
const CountryFlag = props => {

  const DrapeauDepart = props.drapeauDepart;
  const DrapeauDestination = props.drapeauDestination;
  const Label = props.label;

  if (!DrapeauDepart && !DrapeauDepart)
    {
      return (
        <View style={styles.item}>
          <Text style={styles.textItemNoFlag}>{Label}</Text>
        </View>
      );
    }

    if (!DrapeauDestination)
    {
      return (
        <View style={styles.item}>
          <Flag size={24} code={DrapeauDepart} type='flat' />
          <Text style={styles.textItem}>{Label}</Text>
        </View>
      );
    }

    if (!DrapeauDepart)
    {
      return (
        <View style={styles.item}>
          <Text style={styles.textItem}>{Label}</Text>
          <Flag size={24} code={DrapeauDestination} type='flat' />
        </View>
      );
    }

    return (
      <View style={styles.item}>
        <Flag size={32} code={DrapeauDepart} type='flat' />
        <Text style={styles.textItem}>{Label}</Text>
        <Flag size={32} code={DrapeauDestination} type='flat' />
      </View>
    );
};

// define your styles
const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: windowWidth * 0.1,
  },
  textItem: {
    fontFamily: 'Roboto-Regular',
    fontSize: 13,
    color: '#fff',
    paddingLeft: windowWidth * 0.02,
    paddingRight: windowWidth * 0.02,
  },
  textItemNoFlag: {
    fontFamily: 'Roboto-Regular',
    fontSize: 13,
    color: '#fff',
    paddingLeft: windowWidth * 0.02,
    paddingRight: windowWidth * 0.02,
    paddingTop: windowHeight * 0.01
  },
});


export default CountryFlag;