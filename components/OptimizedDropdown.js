import React from 'react';
import { FlatList } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

const OptimizedDropdown = (props) => {
  return (
    <Dropdown
      {...props}
      renderItem={(item, selected) => (
        <FlatList
          data={props.data}
          keyExtractor={(item) => item.value.toString()}
          renderItem={({ item }) => (
            <Dropdown.Item
              {...item}
              selected={selected}
            />
          )}
        />
      )}
    />
  );
};

export default OptimizedDropdown;