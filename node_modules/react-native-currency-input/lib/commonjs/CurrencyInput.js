"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CurrencyInput = void 0;

var React = _interopRequireWildcard(require("react"));

var _reactNative = require("react-native");

var _formatNumber = _interopRequireWildcard(require("./utils/formatNumber"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const CurrencyInput = /*#__PURE__*/React.forwardRef(function (props, ref) {
  const {
    renderTextInput,
    value,
    onChangeText,
    onChangeValue,
    separator,
    delimiter,
    prefix = '',
    suffix = '',
    precision = 2,
    maxValue,
    minValue,
    signPosition = 'afterPrefix',
    showPositiveSign,
    ...rest
  } = props;
  const [startingWithSign, setStartingWithSign] = React.useState();
  const noNegativeValues = typeof minValue === 'number' && minValue >= 0;
  const noPositiveValues = typeof maxValue === 'number' && maxValue <= 0;
  const formattedValue = React.useMemo(() => {
    if (!!value || value === 0 || value === -0) {
      return (0, _formatNumber.default)(value, {
        separator,
        prefix,
        suffix,
        precision,
        delimiter,
        ignoreNegative: noNegativeValues,
        signPosition,
        showPositiveSign
      });
    } else {
      return '';
    }
  }, [value, separator, prefix, suffix, precision, delimiter, noNegativeValues, signPosition, showPositiveSign]);
  React.useEffect(() => {
    onChangeText && onChangeText(formattedValue);
  }, [formattedValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChangeText = React.useCallback(text => {
    let textWithoutPrefix = text;

    if (prefix) {
      textWithoutPrefix = text.replace(prefix, '');

      if (textWithoutPrefix === text) {
        textWithoutPrefix = text.replace(prefix.slice(0, -1), '');
      }
    }

    let textWithoutPrefixAndSufix = textWithoutPrefix;

    if (suffix) {
      const suffixRegex = new RegExp("".concat(suffix, "([^").concat(suffix, "]*)$"));
      textWithoutPrefixAndSufix = textWithoutPrefix.replace(suffixRegex, '');

      if (textWithoutPrefixAndSufix === textWithoutPrefix) {
        textWithoutPrefixAndSufix = textWithoutPrefix.replace(suffix.slice(1), '');
      }
    } // Starting with a minus or plus sign


    if (/^(-|-0)$/.test(text) && !noNegativeValues) {
      setStartingWithSign('-');
      onChangeText && onChangeText((0, _formatNumber.addSignPrefixAndSuffix)(formattedValue, {
        prefix,
        suffix,
        sign: '-',
        signPosition
      }));
      return;
    } else if (/^(\+|\+0)$/.test(text) && !noPositiveValues) {
      setStartingWithSign('+');
      onChangeText && onChangeText((0, _formatNumber.addSignPrefixAndSuffix)(formattedValue, {
        prefix,
        suffix,
        sign: '+',
        signPosition
      }));
    } else {
      setStartingWithSign(undefined);
    }

    const isNegativeValue = textWithoutPrefixAndSufix.includes('-');
    const textNumericValue = textWithoutPrefixAndSufix.replace(/\D+/g, '');
    const numberValue = Number(textNumericValue) * (isNegativeValue ? -1 : 1);
    const zerosOnValue = textNumericValue.replace(/[^0]/g, '').length;
    let newValue;

    if (!textNumericValue || !numberValue && zerosOnValue === precision) {
      // Allow to clean the value instead of beign 0
      newValue = null;
    } else {
      newValue = numberValue / 10 ** precision;
    }

    if (newValue && maxValue && newValue > maxValue) {
      return;
    } else if (newValue && minValue && newValue < minValue) {
      return;
    }

    onChangeValue && onChangeValue(newValue);
  }, [suffix, prefix, noNegativeValues, noPositiveValues, precision, maxValue, minValue, onChangeValue, onChangeText, formattedValue, signPosition]);
  const textInputValue = React.useMemo(() => {
    return startingWithSign ? (0, _formatNumber.addSignPrefixAndSuffix)(formattedValue, {
      prefix,
      suffix,
      sign: startingWithSign,
      signPosition
    }) : formattedValue;
  }, [formattedValue, prefix, signPosition, startingWithSign, suffix]);
  const nextProps = React.useMemo(() => ({
    keyboardType: 'numeric',
    selection: suffix ? {
      start: Math.max(textInputValue.length - suffix.length, 0)
    } : props === null || props === void 0 ? void 0 : props.selection,
    ...rest,
    value: textInputValue,
    onChangeText: handleChangeText,
    ref: ref
  }), [handleChangeText, props === null || props === void 0 ? void 0 : props.selection, ref, rest, suffix, textInputValue]);

  if (renderTextInput) {
    return renderTextInput(nextProps);
  }

  return /*#__PURE__*/React.createElement(_reactNative.TextInput, nextProps);
});
exports.CurrencyInput = CurrencyInput;
//# sourceMappingURL=CurrencyInput.js.map