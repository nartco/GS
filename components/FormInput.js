import React from 'react';
import {View, TextInput, Text, StyleSheet} from 'react-native';
import {useField} from 'formik';

const FormInput = ({
  name,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  ...props
}) => {
  const [field, meta, helpers] = useField(name);

  return (
    <View style={[styles.container, containerStyle]}>
      {props.label && (
        <Text style={[styles.label, labelStyle]}>{props.label}</Text>
      )}
      <TextInput
        style={[
          styles.input,
          inputStyle,
          meta.touched && meta.error ? styles.errorInput : null,
        ]}
        onChangeText={helpers.setValue}
        onBlur={() => helpers.setTouched(true)}
        value={field.value}
        placeholder={placeholder}
        placeholderTextColor="#BCB8B1"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        {...props}
      />
      {meta.touched && meta.error && (
        <Text style={[styles.errorText, errorStyle]}>{meta.error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    width: '100%',
  },
  label: {
    marginBottom: 5,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#AAB0B7',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#000',
    backgroundColor: '#fff',
  },
  errorInput: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
    fontFamily: 'Poppins-Regular',
  },
});

export default FormInput;
