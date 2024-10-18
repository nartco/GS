import {View, Text} from 'react-native';
import React, {useState} from 'react';
import DropDownPicker from 'react-native-dropdown-picker';

const DropDown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [current, setCurrent] = useState();

  const items = [
    {
      label: 'France',
      value: 'france',
    },
    {
      label: 'France',
      value: 'germany',
    },
    {
      label: 'France',
      value: 'italy',
    },
  ];

  return (
    <View>
      <DropDownPicker
        items={items}
        open={isOpen}
        setOpen={() => setIsOpen(!isOpen)}
        value={current}
        setValue={val => setCurrent(val)}
        dropDownContainerStyle={{
          backgroundColor: '#fff',
          borderColor: '#000',
          fontSize: 54,
        }}
        style={{
          backgroundColor: 'transparent',
          borderColor: '#000',
          fontSize: 54,
        }}
        listItemContainerStyle={{borderBottomColor: '#000'}}
        placeholder="Choisir le mode de pris en charge"
        placeholderStyle={{
          fontFamily: 'Poppins-Regular',
          fontSize: 16,
          color: '#000',
        }}
        textStyle={{fontFamily: 'Poppins-Regular', fontSize: 14, color: '#000'}}
      />
    </View>
  );
};

export default DropDown;
